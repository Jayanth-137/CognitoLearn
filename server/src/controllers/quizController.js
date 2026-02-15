const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const axios = require('axios');
const config = require('../config');

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('-questions.correctAnswer');
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({ ...q, correctAnswer: undefined }));

    res.json({ success: true, quiz: quizData });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { answers = [], timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const questionById = new Map(quiz.questions.map((question, index) => [question.id, { question, index }]));
    const seen = new Set();
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      let questionIndex = index;
      let question = quiz.questions[index];

      if (typeof answer.questionId === 'string' && answer.questionId.length > 0 && questionById.has(answer.questionId)) {
        if (seen.has(answer.questionId)) return null;
        seen.add(answer.questionId);
        const entry = questionById.get(answer.questionId);
        questionIndex = entry.index;
        question = entry.question;
      }

      const selectedAnswer = Number(answer.selectedAnswer);
      const isCorrect = Boolean(question) && selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      return { questionIndex, questionId: answer.questionId, selectedAnswer, isCorrect };
    }).filter(Boolean);

    // Score against served questions, not the full pool
    const totalQuestions = processedAnswers.length || quiz.questionsPerAttempt || quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      userId: req.user.userId,
      quizId: req.params.id,
      answers: processedAnswers,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      timeTaken
    });

    res.json({ success: true, attempt: { id: attempt._id, score, totalQuestions, correctAnswers, passed, passingScore: quiz.passingScore } });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
};

exports.getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.userId })
      .populate('quizId', 'title topic difficulty')
      .sort({ completedAt: -1 });
    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to get attempts' });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ _id: req.params.id, userId: req.user.userId }).populate('quizId');
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    
    // Filter quiz questions to only those the user was served in this attempt
    if (attempt.quizId && attempt.answers && attempt.answers.length > 0) {
      const answeredQuestionIds = new Set(
        attempt.answers.map(a => a.questionId).filter(Boolean)
      );
      
      if (answeredQuestionIds.size > 0) {
        const attemptObj = attempt.toObject();
        attemptObj.quizId.questions = attemptObj.quizId.questions.filter(
          q => answeredQuestionIds.has(q.id)
        );
        return res.json({ success: true, attempt: attemptObj });
      }
    }
    
    res.json({ success: true, attempt });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ error: 'Failed to get attempt' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

// Generate quiz dynamically using AI
exports.generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = 'medium' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    console.log(`Generating quiz for topic: ${topic}`);
    
    const aiResponse = await axios.post(`${config.aiServiceUrl}/generate-quiz`, {
      topic,
      difficulty
    }, { timeout: 30000 });
    
    if (aiResponse.data.success && aiResponse.data.quiz) {
      const quizData = aiResponse.data.quiz;
      
      // Add passingScore if not present
      if (!quizData.passingScore) {
        quizData.passingScore = 70;
      }
      
      res.json({ success: true, quiz: quizData });
    } else {
      throw new Error('Invalid AI response');
    }
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
};
