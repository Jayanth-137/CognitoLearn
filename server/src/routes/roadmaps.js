const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

router.post('/generate', roadmapController.generateRoadmap);
router.get('/', roadmapController.getUserRoadmaps);
router.get('/:id', roadmapController.getRoadmapById);
router.put('/:id', roadmapController.updateRoadmap);
router.delete('/:id', roadmapController.deleteRoadmap);

// BKT Adaptive Quiz Routes (Dynamic Sequential Serving)
router.get('/:roadmapId/topics/:topicId/quiz/status', roadmapController.getQuizStatus);
router.post('/:roadmapId/topics/:topicId/quiz/start', roadmapController.startQuizSession);
router.post('/:roadmapId/topics/:topicId/quiz/answer', roadmapController.answerQuestion);

module.exports = router;
