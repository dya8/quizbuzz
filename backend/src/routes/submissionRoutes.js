const express = require('express');
const router = express.Router();

const {
  submitQuiz,
  getMyResult,
  getMySubmissions,
  getSubmissionsForQuiz,
  getSubmissionDetail,
} = require('../controllers/submissionController');

const { protect, isTeacher, isStudent } = require('../middleware/authMiddleware');

/**
 * ─── SUBMISSION ROUTES ───────────────────────────────────────────────────────
 * Base: /api/submissions
 */

// ── Student routes ────────────────────────────────────────────────────────────
router.post('/', protect, isStudent, submitQuiz);
router.get('/my', protect, isStudent, getMySubmissions);
router.get('/result/:quizId', protect, isStudent, getMyResult);

// ── Teacher routes ────────────────────────────────────────────────────────────
router.get('/quiz/:quizId', protect, isTeacher, getSubmissionsForQuiz);
router.get('/:id', protect, isTeacher, getSubmissionDetail);

module.exports = router;