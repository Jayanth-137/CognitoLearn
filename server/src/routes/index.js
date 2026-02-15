const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const quizRoutes = require('./quizzes');
const roadmapRoutes = require('./roadmaps');
const analyticsRoutes = require('./analytics');

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/users', auth, userRoutes);
router.use('/quizzes', auth, quizRoutes);
router.use('/roadmaps', auth, roadmapRoutes);
router.use('/analytics', auth, analyticsRoutes);

module.exports = router;
