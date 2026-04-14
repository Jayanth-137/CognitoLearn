const Roadmap = require('../models/Roadmap');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Activity = require('../models/Activity');
const axios = require('axios');
const { randomUUID } = require('crypto');
const config = require('../config');

// Convert a Mongoose subdocument (or plain object) to a plain JS object
const toPlain = (doc) =>
  typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };

const ensureQuestionIds = (questions = []) =>
  questions.map((question) => {
    const plain = toPlain(question);
    return { ...plain, id: plain.id || randomUUID() };
  });

const sanitizeQuizQuestions = (questions = []) =>
  ensureQuestionIds(questions).map(({ correctAnswer, ...question }) => question);

const backfillQuizQuestionIds = async (quiz) => {
  if (!quiz || !Array.isArray(quiz.questions)) return quiz;
  const hasMissingId = quiz.questions.some((question) => !question.id);
  if (!hasMissingId) return quiz;

  quiz.questions = ensureQuestionIds(quiz.questions);
  await quiz.save();
  return quiz;
};

// Fisher-Yates shuffle and sample `count` questions from the pool
const sampleQuestions = (questions, count) => {
  const pool = questions.map(toPlain);
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
};

// Transform AI service response to match our Roadmap model schema
const transformAIResponse = (aiRoadmap, prompt, proficiency = 'intermediate') => {
  // The AI service returns: { "beginner/intermediate/advanced": [ { title, description }, ... ] }
  // We need to convert this to our topics/subtopics format
  const chapters = aiRoadmap[proficiency] || aiRoadmap.intermediate || aiRoadmap.beginner || aiRoadmap.advanced || [];
  
  // If the response is already an array at the top level
  const chaptersArray = Array.isArray(chapters) ? chapters : 
                        (Array.isArray(aiRoadmap) ? aiRoadmap : []);
  
  const topics = chaptersArray.map((chapter, index) => {
    // Handle subtopics - can be array of strings (from Gemini) or objects
    let subtopics;
    if (Array.isArray(chapter.subtopics) && chapter.subtopics.length > 0) {
      subtopics = chapter.subtopics.map((sub, subIndex) => ({
        id: `sub-${Date.now()}-${index * 10 + subIndex + 1}`,
        title: typeof sub === 'string' ? sub : sub.title || `Subtopic ${subIndex + 1}`,
        completed: false
      }));
    } else {
      // Fallback subtopics
      subtopics = [
        { id: `sub-${Date.now()}-${index * 3 + 1}`, title: `Introduction to ${chapter.title || 'Topic'}`, completed: false },
        { id: `sub-${Date.now()}-${index * 3 + 2}`, title: `Core Concepts`, completed: false },
        { id: `sub-${Date.now()}-${index * 3 + 3}`, title: `Practice & Review`, completed: false }
      ];
    }

    return {
      id: `topic-${Date.now()}-${index + 1}`,
      title: chapter.title || `Chapter ${index + 1}`,
      description: chapter.description || '',
      status: index === 0 ? 'in-progress' : 'locked',
      type: 'milestone',
      quizRecommended: chapter.quiz_recommended !== undefined ? chapter.quiz_recommended : true,
      subtopics
    };
  });

  // Fallback if no topics were generated
  if (topics.length === 0) {
    topics.push({
      id: `topic-${Date.now()}-1`,
      title: 'Getting Started',
      description: `Introduction to ${prompt}`,
      status: 'in-progress',
      type: 'milestone',
      subtopics: [
        { id: `sub-${Date.now()}-1`, title: 'Introduction & Setup', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Core Concepts', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Basic Practice', completed: false }
      ]
    });
  }

  const difficultyMap = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  
  // Use title and description from AI response if available
  const roadmapTitle = aiRoadmap.title || `Learning Path: ${prompt.slice(0, 50)}`;
  const roadmapDescription = aiRoadmap.description || `A personalized learning roadmap for: ${prompt}`;
  
  return {
    title: roadmapTitle,
    description: roadmapDescription,
    difficulty: difficultyMap[proficiency] || 'Intermediate',
    topics
  };
};

exports.generateRoadmap = async (req, res) => {
  try {
    const { prompt, level = 'Intermediate' } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Normalize level to lowercase for internal use
    const proficiency = level.toLowerCase();

    let roadmapData;
    
    try {
      // Call the AI service
      console.log(`Calling AI service at ${config.aiServiceUrl}/generate-roadmap`);
      const aiResponse = await axios.post(`${config.aiServiceUrl}/generate-roadmap`, {
        prompt: prompt,
        level: level
      }, { timeout: 60000 }); // 1 minutes timeout for AI generation
      
      if (aiResponse.data.success && aiResponse.data.roadmap) {
        console.log('AI service response received');
        roadmapData = transformAIResponse(aiResponse.data.roadmap, prompt, proficiency);
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (aiError) {
      // Return error instead of fallback
      console.error('AI service error:', aiError.message);
      return res.status(500).json({ error: 'Failed to create roadmap. Please try again.' });
    }

    const roadmap = await Roadmap.create({ userId: req.user.userId, prompt, ...roadmapData });

    res.status(201).json({ success: true, roadmap });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: 'Failed to create roadmap. Please try again.' });
  }
};

exports.getUserRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: 'Failed to get roadmaps' });
  }
};

exports.getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
};

exports.updateRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    if (req.body.topics) {
      roadmap.topics = req.body.topics;
      
      // Update topic statuses based on completion
      roadmap.topics.forEach((topic, index) => {
        const allCompleted = topic.subtopics.every(st => st.completed);
        const someCompleted = topic.subtopics.some(st => st.completed);
        
        const isPreviousTopicFullyComplete = (prevTopic) => {
          const subtopicsComplete = prevTopic.subtopics.every(st => st.completed);
          const quizRequired = prevTopic.quizRecommended !== false;
          const quizComplete = prevTopic.quizPassed === true;
          return subtopicsComplete && (!quizRequired || quizComplete);
        };
        
        const allPreviousFullyComplete = index === 0 || 
          roadmap.topics.slice(0, index).every(t => isPreviousTopicFullyComplete(t));
        
        if (allCompleted && (topic.quizRecommended === false || topic.quizPassed)) {
          topic.status = 'completed';
        } else if (allCompleted) {
          topic.status = 'in-progress';
        } else if (allPreviousFullyComplete && (someCompleted || index === 0)) {
          topic.status = 'in-progress';
        } else if (allPreviousFullyComplete && !someCompleted && index > 0) {
          const prevTopic = roadmap.topics[index - 1];
          if (isPreviousTopicFullyComplete(prevTopic)) {
            topic.status = 'in-progress';
          } else {
            topic.status = 'locked';
          }
        } else {
          topic.status = 'locked';
        }
      });
      
      // Ensure first topic is never locked
      if (roadmap.topics.length > 0 && roadmap.topics[0].status === 'locked') {
        roadmap.topics[0].status = 'in-progress';
      }
    }

    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Update roadmap error:', error);
    res.status(500).json({ error: 'Failed to update roadmap' });
  }
};

exports.deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    // Cascade-delete related quizzes and quiz attempts
    const quizzes = await Quiz.find({ roadmapId: req.params.id, userId: req.user.userId });
    const quizIds = quizzes.map(q => q._id);

    let deletedAttempts = 0;
    let deletedQuizzes = 0;

    if (quizIds.length > 0) {
      const attemptResult = await QuizAttempt.deleteMany({ quizId: { $in: quizIds } });
      deletedAttempts = attemptResult.deletedCount || 0;

      const quizResult = await Quiz.deleteMany({ _id: { $in: quizIds } });
      deletedQuizzes = quizResult.deletedCount || 0;
    }

    console.log(`Deleted roadmap ${req.params.id}: ${deletedQuizzes} quizzes, ${deletedAttempts} attempts`);
    res.json({ success: true, message: 'Roadmap deleted successfully', deletedQuizzes, deletedAttempts });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
};

// ─── BKT ADAPTIVE QUIZ ENDPOINTS ───────────────────────────────────

const KnowledgeState = require('../models/KnowledgeState');
const QuizSession = require('../models/QuizSession');
const bkt = require('../utils/bktEngine');

// Helper: recalculate topic statuses after quiz/mastery changes
const recalcTopicStatuses = (roadmap) => {
  roadmap.topics.forEach((t, index) => {
    const allCompleted = t.subtopics.every(st => st.completed);

    const isPreviousTopicFullyComplete = (prevTopic) => {
      const subtopicsComplete = prevTopic.subtopics.every(st => st.completed);
      const quizRequired = prevTopic.quizRecommended !== false;
      const quizComplete = prevTopic.quizPassed === true;
      return subtopicsComplete && (!quizRequired || quizComplete);
    };

    const allPreviousFullyComplete = index === 0 ||
      roadmap.topics.slice(0, index).every(prev => isPreviousTopicFullyComplete(prev));

    if (allCompleted && (t.quizRecommended === false || t.quizPassed)) {
      t.status = 'completed';
    } else if (allCompleted) {
      t.status = 'in-progress';
    } else if (allPreviousFullyComplete) {
      t.status = 'in-progress';
    } else {
      t.status = 'locked';
    }
  });

  // Ensure first topic is never locked
  if (roadmap.topics.length > 0 && roadmap.topics[0].status === 'locked') {
    roadmap.topics[0].status = 'in-progress';
  }
};

// Helper: get or generate quiz for a topic (internal, not an endpoint)
const getOrCreateQuiz = async (userId, roadmapId, topicId, topicTitle) => {
  let quiz = await Quiz.findOne({ userId, roadmapId, topicId });

  if (quiz) {
    await backfillQuizQuestionIds(quiz);
    return quiz;
  }

  // Generate new quiz via AI service (with retry)
  console.log(`Generating new quiz for topic: ${topicTitle}`);

  let aiResponse;
  const attemptGenerate = () => axios.post(`${config.aiServiceUrl}/generate-quiz`, {
    topic: topicTitle,
    difficulty: 'medium',
    numQuestions: 15
  }, { timeout: 60000 }); // 60s — Gemini needs time for 15 questions

  try {
    aiResponse = await attemptGenerate();
  } catch (firstErr) {
    console.warn(`First quiz generation attempt failed (${firstErr.message}), retrying...`);
    try {
      aiResponse = await attemptGenerate();
    } catch (secondErr) {
      throw new Error(`Quiz generation failed after 2 attempts: ${secondErr.message}`);
    }
  }

  if (!aiResponse.data.success || !aiResponse.data.quiz) {
    throw new Error('Invalid AI response for quiz generation');
  }

  const quizData = aiResponse.data.quiz;
  const normalizedQuestions = ensureQuestionIds(quizData.questions || []);

  try {
    quiz = await Quiz.create({
      userId,
      roadmapId,
      topicId,
      title: quizData.title || `${topicTitle} Quiz`,
      topic: topicTitle,
      description: quizData.description || `Test your knowledge of ${topicTitle}`,
      difficulty: quizData.difficulty || 'medium',
      passingScore: quizData.passingScore || 70,
      questionsPerAttempt: normalizedQuestions.length,
      questions: normalizedQuestions
    });
  } catch (createErr) {
    // E11000: two concurrent requests both passed the findOne check simultaneously
    // (common in React StrictMode dev / double fetch). Fetch the winner's document.
    if (createErr.code === 11000) {
      console.warn(`Concurrent quiz creation detected for topic "${topicTitle}", fetching existing quiz.`);
      quiz = await Quiz.findOne({ userId, roadmapId, topicId });
      if (!quiz) throw createErr; // Truly unexpected — rethrow
      await backfillQuizQuestionIds(quiz);
    } else {
      throw createErr;
    }
  }

  return quiz;
};

// GET /roadmaps/:roadmapId/topics/:topicId/quiz/status
exports.getQuizStatus = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.params;
    const userId = req.user.userId;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    const topic = roadmap.topics.find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    // Check if quiz exists
    const quiz = await Quiz.findOne({ userId, roadmapId, topicId });

    // Get knowledge state
    const ks = await KnowledgeState.findOne({ userId, roadmapId, topicId });

    // Check for active session
    const activeSession = await QuizSession.findOne({
      userId, roadmapId, topicId, status: 'active'
    });

    // Get latest completed attempt
    const latestAttempt = quiz
      ? await QuizAttempt.findOne({ userId, quizId: quiz._id }).sort({ completedAt: -1 })
      : null;

    res.json({
      success: true,
      hasQuiz: !!quiz,
      mastery: {
        level: ks ? Math.round(ks.pL * 100) : 0,
        mastered: ks?.mastered ?? false,
        totalOpportunities: ks?.totalOpportunities ?? 0
      },
      activeSession: activeSession ? {
        _id: activeSession._id,
        questionsAnswered: activeSession.answers.length,
        currentMastery: activeSession.answers.length > 0
          ? Math.round(activeSession.answers[activeSession.answers.length - 1].pL_after * 100)
          : Math.round((ks?.pL ?? bkt.getDefaultParams().pL0) * 100)
      } : null,
      quizPassed: topic.quizPassed,
      latestAttempt: latestAttempt ? {
        _id: latestAttempt._id,
        score: latestAttempt.score,
        passed: latestAttempt.passed,
        correctAnswers: latestAttempt.correctAnswers,
        totalQuestions: latestAttempt.totalQuestions,
        completedAt: latestAttempt.completedAt
      } : null
    });
  } catch (error) {
    console.error('Get quiz status error:', error);
    res.status(500).json({ error: 'Failed to get quiz status' });
  }
};

// POST /roadmaps/:roadmapId/topics/:topicId/quiz/start
exports.startQuizSession = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.params;
    const userId = req.user.userId;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    const topic = roadmap.topics.find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    // Check for existing active session — resume it
    const existingSession = await QuizSession.findOne({
      userId, roadmapId, topicId, status: 'active'
    });

    if (existingSession) {
      const quiz = await Quiz.findById(existingSession.quizId);
      if (quiz) {
        await backfillQuizQuestionIds(quiz);

        // Find the next question to serve
        const nextQuestionId = existingSession.questionQueue[existingSession.currentIndex];
        const nextQuestion = quiz.questions.find(q => (q.id || q._id?.toString()) === nextQuestionId);

        if (nextQuestion) {
          const ks = await KnowledgeState.findOne({ userId, roadmapId, topicId });
          const currentPL = existingSession.answers.length > 0
            ? existingSession.answers[existingSession.answers.length - 1].pL_after
            : (ks?.pL ?? bkt.getDefaultParams().pL0);

          return res.json({
            success: true,
            resumed: true,
            session: {
              _id: existingSession._id,
              totalQuestionsInPool: existingSession.questionQueue.length,
              questionNumber: existingSession.currentIndex + 1,
              questionsAnswered: existingSession.answers.length,
              currentMastery: Math.round(currentPL * 100),
              masteryThreshold: 90
            },
            question: {
              id: nextQuestion.id || nextQuestion._id?.toString(),
              question: nextQuestion.question,
              options: nextQuestion.options,
              questionNumber: existingSession.currentIndex + 1
            }
          });
        }
      }
      // If session is broken, abandon it and create new
      existingSession.status = 'abandoned';
      existingSession.completedAt = new Date();
      await existingSession.save();
    }

    // Get or generate quiz
    const quiz = await getOrCreateQuiz(userId, roadmapId, topicId, topic.title);

    // Load or create knowledge state
    let ks = await KnowledgeState.findOne({ userId, roadmapId, topicId });
    if (!ks) {
      const defaults = bkt.getDefaultParams();
      ks = new KnowledgeState({
        userId, roadmapId, topicId,
        pL: defaults.pL0,
        params: { pL0: defaults.pL0, pT: defaults.pT, pG: defaults.pG, pS: defaults.pS },
        history: []
      });
      await ks.save();
    }

    // If already mastered, inform the client
    if (ks.mastered) {
      return res.json({
        success: true,
        alreadyMastered: true,
        mastery: {
          level: Math.round(ks.pL * 100),
          mastered: true,
          totalOpportunities: ks.totalOpportunities
        }
      });
    }

    // Shuffle question pool to create queue
    const allQuestions = ensureQuestionIds(quiz.questions);
    const shuffled = sampleQuestions(allQuestions, allQuestions.length);
    const questionQueue = shuffled.map(q => q.id);

    // Create new session
    const session = await QuizSession.create({
      userId,
      roadmapId,
      topicId,
      quizId: quiz._id,
      questionQueue,
      currentIndex: 0,
      answers: [],
      pL_start: ks.pL,
      startedAt: new Date()
    });

    // Return first question (sanitized — no correctAnswer)
    const firstQuestion = shuffled[0];
    res.json({
      success: true,
      resumed: false,
      session: {
        _id: session._id,
        totalQuestionsInPool: questionQueue.length,
        questionNumber: 1,
        questionsAnswered: 0,
        currentMastery: Math.round(ks.pL * 100),
        masteryThreshold: 90
      },
      question: {
        id: firstQuestion.id,
        question: firstQuestion.question,
        options: firstQuestion.options,
        questionNumber: 1
      }
    });
  } catch (error) {
    console.error('Start quiz session error:', error);
    res.status(500).json({ error: 'Failed to start quiz session', details: error.message });
  }
};

// POST /roadmaps/:roadmapId/topics/:topicId/quiz/answer
exports.answerQuestion = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.params;
    const { sessionId, questionId, selectedAnswer } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !questionId || selectedAnswer === undefined) {
      return res.status(400).json({ error: 'sessionId, questionId, and selectedAnswer are required' });
    }

    // Load session
    const session = await QuizSession.findOne({ _id: sessionId, userId, status: 'active' });
    if (!session) return res.status(404).json({ error: 'Active quiz session not found' });

    // Validate the question matches the expected next question
    const expectedQuestionId = session.questionQueue[session.currentIndex];
    if (questionId !== expectedQuestionId) {
      return res.status(400).json({ error: 'Question ID does not match expected question' });
    }

    // Load quiz and find the question
    const quiz = await Quiz.findById(session.quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    await backfillQuizQuestionIds(quiz);

    const question = quiz.questions.find(q => (q.id || q._id?.toString()) === questionId);
    if (!question) return res.status(404).json({ error: 'Question not found in quiz pool' });

    // Grade the answer
    const selected = Number(selectedAnswer);
    const isCorrect = Number.isInteger(selected) &&
      selected >= 0 &&
      selected < question.options.length &&
      selected === question.correctAnswer;

    // Update KnowledgeState with BKT
    let ks = await KnowledgeState.findOne({ userId, roadmapId, topicId });
    if (!ks) {
      const defaults = bkt.getDefaultParams();
      ks = new KnowledgeState({
        userId, roadmapId, topicId,
        pL: defaults.pL0,
        params: { pL0: defaults.pL0, pT: defaults.pT, pG: defaults.pG, pS: defaults.pS },
        history: []
      });
    }

    // BKT single-step update
    const newPL = bkt.updateMastery(ks.pL, isCorrect, ks.params);

    // Append to knowledge state history
    ks.history.push({
      correct: isCorrect,
      questionId,
      sessionId: session._id,
      timestamp: new Date()
    });
    ks.pL = newPL;
    ks.totalOpportunities = ks.history.length;
    ks.correctCount = ks.history.filter(h => h.correct).length;
    ks.mastered = bkt.isMastered(newPL, ks.params.masteryThreshold || bkt.DEFAULTS.masteryThreshold);
    await ks.save();

    // Record answer in session
    session.answers.push({
      questionId,
      selectedAnswer: selected,
      isCorrect,
      pL_after: newPL,
      answeredAt: new Date()
    });

    const questionsAnswered = session.answers.length;
    const questionsRemaining = session.questionQueue.length - session.currentIndex - 1;
    const mastered = bkt.shouldStopQuiz(newPL, questionsAnswered, {
      masteryThreshold: bkt.DEFAULTS.masteryThreshold,
      minQuestions: bkt.DEFAULTS.minQuestions
    });

    // Build feedback response
    const feedback = {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || null
    };

    const masteryInfo = {
      level: Math.round(newPL * 100),
      mastered,
      questionsAnswered,
      questionsRemaining: mastered ? 0 : questionsRemaining
    };

    // Check if quiz should end
    const quizComplete = mastered || questionsRemaining <= 0;

    if (quizComplete) {
      // ─── COMPLETE THE SESSION ───
      const correctAnswers = session.answers.filter(a => a.isCorrect).length;
      const totalQuestions = session.answers.length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      session.status = mastered ? 'completed_mastered' : 'completed_not_mastered';
      session.pL_final = newPL;
      session.mastered = mastered;
      session.totalQuestions = totalQuestions;
      session.correctAnswers = correctAnswers;
      session.score = score;
      session.completedAt = new Date();
      session.currentIndex = session.currentIndex + 1;
      await session.save();

      // Update roadmap topic
      const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
      if (roadmap) {
        const topic = roadmap.topics.find(t => t.id === topicId);
        if (topic) {
          topic.quizPassed = mastered;
          topic.masteryLevel = newPL;
          recalcTopicStatuses(roadmap);
          await roadmap.save();
        }
      }

      // Create QuizAttempt record (for history/review compatibility)
      const attempt = await QuizAttempt.create({
        userId,
        quizId: quiz._id,
        answers: session.answers.map(a => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect
        })),
        score,
        totalQuestions,
        correctAnswers,
        passed: mastered
      });

      // Log activity for streak tracking
      try {
        await Activity.create({
          userId,
          type: 'quiz_completed',
          metadata: { quizId: quiz._id, score, passed: mastered, roadmapId, topicId }
        });
      } catch (err) {
        console.error('Failed to log activity for quiz completion:', err);
      }

      return res.json({
        success: true,
        feedback,
        mastery: masteryInfo,
        nextQuestion: null,
        quizComplete: true,
        result: {
          sessionId: session._id,
          attemptId: attempt._id,
          mastered,
          score,
          correctAnswers,
          totalQuestions,
          masteryLevel: Math.round(newPL * 100)
        },
        roadmap: roadmap || null
      });
    }

    // ─── SERVE NEXT QUESTION ───
    session.currentIndex = session.currentIndex + 1;
    await session.save();

    const nextQuestionId = session.questionQueue[session.currentIndex];
    const nextQuestionData = quiz.questions.find(q => (q.id || q._id?.toString()) === nextQuestionId);

    const nextQuestion = nextQuestionData ? {
      id: nextQuestionData.id || nextQuestionData._id?.toString(),
      question: nextQuestionData.question,
      options: nextQuestionData.options,
      questionNumber: session.currentIndex + 1
    } : null;

    res.json({
      success: true,
      feedback,
      mastery: masteryInfo,
      nextQuestion,
      quizComplete: false
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Failed to process answer', details: error.message });
  }
};
