const express = require('express');
const router = express.Router();

const {
  createQuiz,
  getMyQuizzes,
  getQuizDetail,
  updateQuiz,
  publishQuiz,
  unpublishQuiz,
  deleteQuiz,
  getAnalytics,
  getPublishedQuizzes,
  getQuizForAttempt,
  downloadQuizPDF,
 
} = require('../controllers/quizController');

const { protect, isTeacher, isStudent } = require('../middleware/authMiddleware');

/**
 * ─── QUIZ ROUTES ─────────────────────────────────────────────────────────────
 * Base: /api/quizzes
 */

// ── Student routes ────────────────────────────────────────────────────────────
// Browse published quizzes
router.get('/', protect, isStudent, getPublishedQuizzes);

// Get quiz to attempt (no correct answers exposed)
router.get('/:id/attempt', protect, isStudent, getQuizForAttempt);

// ── Teacher routes ────────────────────────────────────────────────────────────
router.post('/', protect, isTeacher, createQuiz);
router.get('/my', protect, isTeacher, getMyQuizzes);
router.get('/:id/detail', protect, isTeacher, getQuizDetail);
router.put('/:id', protect, isTeacher, updateQuiz);
router.patch('/:id/publish', protect, isTeacher, publishQuiz);
router.patch('/:id/unpublish', protect, isTeacher, unpublishQuiz);
router.delete('/:id', protect, isTeacher, deleteQuiz);
router.get('/:id/analytics', protect, isTeacher, getAnalytics);
router.get("/:id/pdf", protect, isTeacher, downloadQuizPDF);

module.exports = router;