const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

router.post('/generate', roadmapController.generateRoadmap);
router.get('/', roadmapController.getUserRoadmaps);
router.get('/:id', roadmapController.getRoadmapById);
router.put('/:id', roadmapController.updateRoadmap);
router.delete('/:id', roadmapController.deleteRoadmap);
router.post('/:roadmapId/topics/:topicId/quiz-passed', roadmapController.markQuizPassed);
router.get('/:roadmapId/topics/:topicId/quiz', roadmapController.getOrGenerateTopicQuiz);

module.exports = router;
