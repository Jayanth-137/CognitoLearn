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

// Mark quiz as passed for a specific topic
exports.markQuizPassed = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.params;
    const { answers = [] } = req.body;
    
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    
    const topic = roadmap.topics.find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    
    // Find the quiz for this topic
    const quiz = await Quiz.findOne({ 
      userId: req.user.userId, 
      roadmapId, 
      topicId 
    });
    
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    await backfillQuizQuestionIds(quiz);

    const normalizedQuestions = ensureQuestionIds(quiz.questions);
    const questionById = new Map(normalizedQuestions.map((question, index) => [question.id, { question, index }]));
    const seenQuestionIds = new Set();

    const processedAnswers = answers
      .filter((answer) => typeof answer.questionId === 'string' && answer.questionId.length > 0)
      .map((answer) => {
      const questionEntry = questionById.get(answer.questionId);
      const selectedAnswer = Number(answer.selectedAnswer);
      if (!questionEntry || seenQuestionIds.has(answer.questionId)) {
        return null;
      }
      seenQuestionIds.add(answer.questionId);
      const { question, index } = questionEntry;
      const isCorrect = Number.isInteger(selectedAnswer) &&
        selectedAnswer >= 0 &&
        selectedAnswer < question.options.length &&
        selectedAnswer === question.correctAnswer;
      return {
        questionIndex: index,
        questionId: answer.questionId,
        selectedAnswer,
        isCorrect
      };
    })
      .filter(Boolean);

    const correctAnswers = processedAnswers.filter((answer) => answer.isCorrect).length;
    // Score against the number of questions the user was served (not the full pool)
    const totalQuestions = processedAnswers.length || quiz.questionsPerAttempt;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;
    
    // Create quiz attempt record
    const attempt = await QuizAttempt.create({
      userId: req.user.userId,
      quizId: quiz._id,
      answers: processedAnswers,
      score,
      totalQuestions,
      correctAnswers,
      passed
    });
    
    // Update topic's quizPassed status
    topic.quizPassed = passed;
    
    // Recalculate topic statuses after quiz completion
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
    
    await roadmap.save();

    // Log activity for streak
    try {
      await Activity.create({
        userId: req.user.userId,
        type: 'quiz_completed',
        metadata: { 
          quizId: quiz._id, 
          score, 
          passed,
          roadmapId,
          topicId
        }
      });
    } catch (err) {
      console.error('Failed to log activity for quiz completion:', err);
      // Don't fail the request if logging fails
    }
    res.json({ 
      success: true, 
      roadmap, 
      attemptId: attempt._id,
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        passed: attempt.passed,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        answers: attempt.answers
      },
      message: passed ? 'Quiz passed! Next topic unlocked.' : 'Quiz not passed.' 
    });
  } catch (error) {
    console.error('Mark quiz passed error:', error);
    res.status(500).json({ error: 'Failed to update quiz status' });
  }
};

// Get or generate quiz for a specific topic
exports.getOrGenerateTopicQuiz = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.params;
    const userId = req.user.userId;
    
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    
    const topic = roadmap.topics.find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    
    // Check if quiz already exists for this user/roadmap/topic
    let quiz = await Quiz.findOne({ userId, roadmapId, topicId });
    
    if (quiz) {
      await backfillQuizQuestionIds(quiz);

      // Get the latest attempt for this quiz
      const latestAttempt = await QuizAttempt.findOne({ 
        userId, 
        quizId: quiz._id 
      }).sort({ completedAt: -1 });
      
      // Count failed attempts — add 1 extra question per failure (capped at pool size)
      const failedAttempts = await QuizAttempt.countDocuments({
        userId,
        quizId: quiz._id,
        passed: false
      });

      // Sample a random subset from the question pool for this attempt
      const baseCount = quiz.questionsPerAttempt || quiz.questions.length;
      const questionsPerAttempt = Math.min(baseCount + failedAttempts, quiz.questions.length);
      const sampledQuestions = sampleQuestions(quiz.questions, questionsPerAttempt);
      
      return res.json({ 
        success: true, 
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          topic: quiz.topic,
          description: quiz.description,
          difficulty: quiz.difficulty,
          passingScore: quiz.passingScore,
          questionsPerAttempt,
          questions: sanitizeQuizQuestions(sampledQuestions)
        },
      quizPassed: topic.quizPassed,
      latestAttempt: latestAttempt ? {
        _id: latestAttempt._id,
        score: latestAttempt.score,
          passed: latestAttempt.passed,
          correctAnswers: latestAttempt.correctAnswers,
          totalQuestions: latestAttempt.totalQuestions,
          answers: latestAttempt.answers,
          completedAt: latestAttempt.completedAt
        } : null,
        isExisting: true
      });
    }
    
    // Generate new quiz using AI service
    console.log(`Generating new quiz for topic: ${topic.title}`);
    
    const aiResponse = await axios.post(`${config.aiServiceUrl}/generate-quiz`, {
      topic: topic.title,
      difficulty: 'medium'
    }, { timeout: 30000 });
    
    if (aiResponse.data.success && aiResponse.data.quiz) {
      const quizData = aiResponse.data.quiz;
      
      // Create quiz document with the full question pool
      const normalizedQuestions = ensureQuestionIds(quizData.questions || []);
      const questionsPerAttempt = Math.max(3, Math.min(10, quizData.questionsPerAttempt || 5));

      quiz = await Quiz.create({
        userId,
        roadmapId,
        topicId,
        title: quizData.title || `${topic.title} Quiz`,
        topic: topic.title,
        description: quizData.description || `Test your knowledge of ${topic.title}`,
        difficulty: quizData.difficulty || 'medium',
        passingScore: quizData.passingScore || 70,
        questionsPerAttempt,
        questions: normalizedQuestions
      });
      
      // Sample a subset for the first attempt
      const sampledQuestions = sampleQuestions(quiz.questions, questionsPerAttempt);
      
      res.json({ 
        success: true, 
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          topic: quiz.topic,
          description: quiz.description,
          difficulty: quiz.difficulty,
          passingScore: quiz.passingScore,
          questionsPerAttempt,
          questions: sanitizeQuizQuestions(sampledQuestions)
        },
        quizPassed: topic.quizPassed,
        latestAttempt: null,
        isExisting: false
      });
    } else {
      throw new Error('Invalid AI response');
    }
  } catch (error) {
    console.error('Get/Generate topic quiz error:', error);
    res.status(500).json({ 
      error: 'Failed to get or generate quiz',
      details: error.message 
    });
  }
};
