const express = require('express');
const router = express.Router();

const {
  generate,
  getQuestions,
  getQuestionById,
  approveQuestion,
  rejectQuestion,
  editQuestion,
  deleteQuestion,
  bulkApprove,
  getStats,
} = require('../controllers/questionController');

const { protect, isTeacher } = require('../middleware/authMiddleware');

/**
 * ─── QUESTION ROUTES ─────────────────────────────────────────────────────────
 *
 * Base: /api/questions
 * All routes: Teacher only
 */
router.use(protect, isTeacher);

// Generation
router.post('/generate', generate);

// Stats (must be before /:id to avoid route conflict)
router.get('/stats', getStats);

// Bulk actions
router.patch('/bulk-approve', bulkApprove);

// CRUD
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.put('/:id', editQuestion);
router.delete('/:id', deleteQuestion);

// Review actions
router.patch('/:id/approve', approveQuestion);
router.patch('/:id/reject', rejectQuestion);

module.exports = router;