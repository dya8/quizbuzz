const express = require('express');
const router = express.Router();

const {
  uploadChapter,
  getMyChapters,
  getChapterById,
  getChapterStatus,
  updateChapter,
  deleteChapter,
  retryRAGPipeline,
} = require('../controllers/chapterController');

const { protect, isTeacher } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

/**
 * ─── CHAPTER ROUTES ──────────────────────────────────────────────────────────
 *
 * Base: /api/chapters
 * All routes: Teacher only (protect + isTeacher)
 */

// Apply auth to all routes in this router
router.use(protect, isTeacher);

router.post('/upload', upload.single('pdf'), uploadChapter);
router.get('/', getMyChapters);
router.get('/:id', getChapterById);
router.get('/:id/status', getChapterStatus);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);
router.post('/:id/retry', retryRAGPipeline);

module.exports = router;