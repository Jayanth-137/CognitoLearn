const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/', quizController.getAllQuizzes);
router.get('/attempts', quizController.getUserAttempts);
router.get('/attempts/:id', quizController.getAttemptById);
router.get('/:id', quizController.getQuizById);
router.post('/:id/attempt', quizController.submitAttempt);
router.post('/', quizController.createQuiz);
router.post('/generate', quizController.generateQuiz);

module.exports = router;
