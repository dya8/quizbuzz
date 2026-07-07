const path = require('path');
const fs = require('fs');
const Chapter = require('../models/Chapter');
const { runRAGPipeline } = require('../services/ragPipelineService');
const vectorStoreService = require('../services/vectorStoreService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * ─── UPLOAD CHAPTER PDF ──────────────────────────────────────────────────────
 * POST /api/chapters/upload
 * Teacher only
 *
 * 1. Saves chapter record to MongoDB
 * 2. Triggers RAG pipeline asynchronously (non-blocking)
 */
const uploadChapter = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No PDF file uploaded.');
    }

    const { title, subject } = req.body;
    if (!title) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return sendError(res, 400, 'Chapter title is required.');
    }

    const chapter = await Chapter.create({
      teacherId: req.user._id,
      title: title.trim(),
      subject: subject?.trim() || '',
      pdfPath: req.file.path,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      processingStatus: 'pending',
    });

    logger.info(`Chapter created: ${chapter._id} by teacher ${req.user._id}`);

    // Trigger RAG pipeline asynchronously — don't await (non-blocking)
    runRAGPipeline(chapter._id, req.file.path).catch((err) => {
      logger.error(`Background RAG pipeline error for ${chapter._id}: ${err.message}`);
    });

    return sendSuccess(res, 201, 'Chapter uploaded. Text extraction started in background.', {
      chapter: {
        id: chapter._id,
        title: chapter.title,
        subject: chapter.subject,
        originalFileName: chapter.originalFileName,
        fileSize: chapter.fileSize,
        processingStatus: chapter.processingStatus,
      },
    });
  } catch (error) {
    logger.error(`Upload chapter error: ${error.message}`);
    // Clean up file if DB save fails
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return sendError(res, 500, 'Failed to upload chapter.');
  }
};

/**
 * ─── GET ALL CHAPTERS (Teacher's own) ────────────────────────────────────────
 * GET /api/chapters
 * Teacher only
 */
const getMyChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ teacherId: req.user._id })
      .select('-extractedText') // Exclude large text field from list
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Chapters fetched.', {
      count: chapters.length,
      chapters,
    });
  } catch (error) {
    logger.error(`Get chapters error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch chapters.');
  }
};

/**
 * ─── GET SINGLE CHAPTER ──────────────────────────────────────────────────────
 * GET /api/chapters/:id
 * Teacher only (must own the chapter)
 */
const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!chapter) {
      return sendError(res, 404, 'Chapter not found or access denied.');
    }

    return sendSuccess(res, 200, 'Chapter fetched.', { chapter });
  } catch (error) {
    logger.error(`Get chapter error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch chapter.');
  }
};

/**
 * ─── GET PROCESSING STATUS ───────────────────────────────────────────────────
 * GET /api/chapters/:id/status
 * Teacher only — poll this to check RAG pipeline progress
 */
const getChapterStatus = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    }).select('title processingStatus processingError embeddingsStored totalChunks pageCount');

    if (!chapter) {
      return sendError(res, 404, 'Chapter not found or access denied.');
    }

    return sendSuccess(res, 200, 'Status fetched.', {
      id: chapter._id,
      title: chapter.title,
      processingStatus: chapter.processingStatus,
      processingError: chapter.processingError,
      embeddingsStored: chapter.embeddingsStored,
      totalChunks: chapter.totalChunks,
      pageCount: chapter.pageCount,
      isReady: chapter.processingStatus === 'ready',
    });
  } catch (error) {
    logger.error(`Get status error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch status.');
  }
};

/**
 * ─── UPDATE CHAPTER METADATA ─────────────────────────────────────────────────
 * PUT /api/chapters/:id
 * Teacher only
 */
const updateChapter = async (req, res) => {
  try {
    const { title, subject } = req.body;

    const chapter = await Chapter.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      { title: title?.trim(), subject: subject?.trim() },
      { new: true, runValidators: true }
    ).select('-extractedText');

    if (!chapter) {
      return sendError(res, 404, 'Chapter not found or access denied.');
    }

    return sendSuccess(res, 200, 'Chapter updated.', { chapter });
  } catch (error) {
    logger.error(`Update chapter error: ${error.message}`);
    return sendError(res, 500, 'Failed to update chapter.');
  }
};

/**
 * ─── DELETE CHAPTER ───────────────────────────────────────────────────────────
 * DELETE /api/chapters/:id
 * Teacher only
 */
const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!chapter) {
      return sendError(res, 404, 'Chapter not found or access denied.');
    }

    // Delete PDF file from disk
    if (chapter.pdfPath && fs.existsSync(chapter.pdfPath)) {
      fs.unlinkSync(chapter.pdfPath);
    }

    // Delete vector embeddings
    await vectorStoreService.deleteEmbeddings(chapter._id.toString());

    // Delete chapter document
    await Chapter.findByIdAndDelete(chapter._id);

    logger.info(`Chapter deleted: ${chapter._id}`);
    return sendSuccess(res, 200, 'Chapter deleted successfully.');
  } catch (error) {
    logger.error(`Delete chapter error: ${error.message}`);
    return sendError(res, 500, 'Failed to delete chapter.');
  }
};

/**
 * ─── RETRY RAG PIPELINE ──────────────────────────────────────────────────────
 * POST /api/chapters/:id/retry
 * Teacher only — retry failed pipeline
 */
const retryRAGPipeline = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!chapter) {
      return sendError(res, 404, 'Chapter not found or access denied.');
    }

    if (chapter.processingStatus === 'ready') {
      return sendError(res, 400, 'Chapter is already processed successfully.');
    }

    if (!['failed', 'pending'].includes(chapter.processingStatus)) {
      return sendError(res, 400, `Cannot retry while status is: ${chapter.processingStatus}`);
    }

    // Reset status and retry
    await Chapter.findByIdAndUpdate(chapter._id, {
      processingStatus: 'pending',
      processingError: null,
      embeddingsStored: false,
    });

    runRAGPipeline(chapter._id, chapter.pdfPath).catch((err) => {
      logger.error(`Retry RAG pipeline error for ${chapter._id}: ${err.message}`);
    });

    return sendSuccess(res, 200, 'RAG pipeline retry started.');
  } catch (error) {
    logger.error(`Retry pipeline error: ${error.message}`);
    return sendError(res, 500, 'Failed to retry pipeline.');
  }
};

module.exports = {
  uploadChapter,
  getMyChapters,
  getChapterById,
  getChapterStatus,
  updateChapter,
  deleteChapter,
  retryRAGPipeline,
};