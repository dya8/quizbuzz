const express = require('express');
const router = express.Router();

const { protect, isTeacher } = require('../middleware/authMiddleware');
const { getTeacherDashboard, getTeacherAnalytics } = require('../controllers/quizController');

/**
 * ─── TEACHER ROUTES ──────────────────────────────────────────────────────────
 * Base: /api/teacher
 */

// Teacher Dashboard
router.get('/dashboard', protect, isTeacher, getTeacherDashboard);

// Teacher Analytics
router.get('/analytics', protect, isTeacher, getTeacherAnalytics);

module.exports = router;
