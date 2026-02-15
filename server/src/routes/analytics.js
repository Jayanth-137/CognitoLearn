const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', analyticsController.getDashboard);
router.get('/progress', analyticsController.getProgress);
router.post('/activity', analyticsController.logActivity);
router.get('/streaks', analyticsController.getStreaks);

module.exports = router;
