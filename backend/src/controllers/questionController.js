const QuestionBank = require('../models/QuestionBank');
const Chapter = require('../models/Chapter');
const { generateQuestions } = require('../services/questionGenerationService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * ─── GENERATE QUESTIONS ───────────────────────────────────────────────────────
 * POST /api/questions/generate
 * Teacher only
 *
 * Body: { chapterId, type, difficulty, count }
 */
const generate = async (req, res) => {
  try {
    const {
      chapterId,
      type,
      difficulty,
      count
    } = req.body;

    if (!chapterId || !type || !difficulty || !count) {
      return sendError(
        res,
        400,
        'chapterId, type, difficulty, and count are all required.'
      );
    }

    const result = await generateQuestions({
      chapterId,
      teacherId: req.user._id,
      type,
      difficulty,
      count: parseInt(count),
    });

    return sendSuccess(
      res,
      201,
      `${result.count} questions generated successfully.`,
      {
        batchId: result.batchId,
        count: result.count,
        questions: result.questions,
      }
    );

  } catch (error) {
    logger.error(`Generate questions error: ${error.message}`);
    return sendError(
      res,
      500,
      error.message || 'Question generation failed.'
    );
  }
};

/**
 * ─── GET ALL QUESTIONS FOR A CHAPTER ─────────────────────────────────────────
 * GET /api/questions?chapterId=xxx&approved=null&type=mcq&difficulty=easy&page=1&limit=20
 * Teacher only
 */
const getQuestions = async (req, res) => {
  try {
    const {
      chapterId,
      generationBatchId,
      approved,
      type,
      difficulty,
      page = 1,
      limit = 20,
    } = req.query;

    // FETCH QUESTIONS BY BATCH ID
    if (generationBatchId) {
      const questions = await QuestionBank.find({
        generationBatchId,
        teacherId: req.user._id,
      }).sort({ createdAt: -1 });

      return sendSuccess(res, 200, 'Questions fetched.', {
        questions,
      });
    }

    if (!chapterId) {
      return sendError(
        res,
        400,
        'chapterId query param is required.'
      );
    }

    const chapter = await Chapter.findOne({
      _id: chapterId,
      teacherId: req.user._id,
    });

    if (!chapter) {
      return sendError(
        res,
        404,
        'Chapter not found or access denied.'
      );
    }

    const filter = {
      chapterId,
      teacherId: req.user._id,
    };

    if (approved === 'true') filter.approved = true;
    else if (approved === 'false') filter.approved = false;
    else if (approved === 'null' || approved === 'pending')
      filter.approved = null;

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const skip =
      (parseInt(page) - 1) * parseInt(limit);

    const total =
      await QuestionBank.countDocuments(filter);

    const questions = await QuestionBank.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendPaginated(
      res,
      questions,
      page,
      limit,
      total
    );

  } catch (error) {
    logger.error(`Get questions error: ${error.message}`);
    return sendError(
      res,
      500,
      'Failed to fetch questions.'
    );
  }
};

/**
 * ─── GET SINGLE QUESTION ──────────────────────────────────────────────────────
 * GET /api/questions/:id
 * Teacher only
 */
const getQuestionById = async (req, res) => {
  try {
    const question = await QuestionBank.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!question) {
      return sendError(res, 404, 'Question not found or access denied.');
    }

    return sendSuccess(res, 200, 'Question fetched.', { question });
  } catch (error) {
    logger.error(`Get question error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch question.');
  }
};

/**
 * ─── APPROVE QUESTION ─────────────────────────────────────────────────────────
 * PATCH /api/questions/:id/approve
 * Teacher only
 */
const approveQuestion = async (req, res) => {
  try {
    const question = await QuestionBank.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      {
        approved: true,
        reviewedAt: new Date(),
        reviewNote: req.body.reviewNote || '',
      },
      { new: true }
    );

    if (!question) {
      return sendError(res, 404, 'Question not found or access denied.');
    }

    logger.info(`Question approved: ${question._id} by teacher ${req.user._id}`);
    return sendSuccess(res, 200, 'Question approved.', { question });
  } catch (error) {
    logger.error(`Approve question error: ${error.message}`);
    return sendError(res, 500, 'Failed to approve question.');
  }
};

/**
 * ─── REJECT QUESTION ──────────────────────────────────────────────────────────
 * PATCH /api/questions/:id/reject
 * Teacher only
 */
const rejectQuestion = async (req, res) => {
  try {
    const question = await QuestionBank.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      {
        approved: false,
        reviewedAt: new Date(),
        reviewNote: req.body.reviewNote || '',
      },
      { new: true }
    );

    if (!question) {
      return sendError(res, 404, 'Question not found or access denied.');
    }

    logger.info(`Question rejected: ${question._id}`);
    return sendSuccess(res, 200, 'Question rejected.', { question });
  } catch (error) {
    logger.error(`Reject question error: ${error.message}`);
    return sendError(res, 500, 'Failed to reject question.');
  }
};

/**
 * ─── EDIT QUESTION ────────────────────────────────────────────────────────────
 * PUT /api/questions/:id
 * Teacher only — edit question, options, correct answer, explanation
 */
const editQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, difficulty, type } = req.body;

    const allowedUpdates = {};
    if (question) allowedUpdates.question = question.trim();
    if (options) allowedUpdates.options = options;
    if (correctAnswer) allowedUpdates.correctAnswer = correctAnswer.trim();
    if (explanation !== undefined) allowedUpdates.explanation = explanation.trim();
    if (difficulty) allowedUpdates.difficulty = difficulty;
    if (type) allowedUpdates.type = type;

    // Reset approval status when teacher edits (re-review required)
    allowedUpdates.approved = null;
    allowedUpdates.reviewedAt = null;

    const updated = await QuestionBank.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return sendError(res, 404, 'Question not found or access denied.');
    }

    logger.info(`Question edited: ${updated._id}`);
    return sendSuccess(res, 200, 'Question updated. Please re-approve.', { question: updated });
  } catch (error) {
    logger.error(`Edit question error: ${error.message}`);
    return sendError(res, 500, 'Failed to update question.');
  }
};

/**
 * ─── DELETE QUESTION ──────────────────────────────────────────────────────────
 * DELETE /api/questions/:id
 * Teacher only
 */
const deleteQuestion = async (req, res) => {
  try {
    const question = await QuestionBank.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!question) {
      return sendError(res, 404, 'Question not found or access denied.');
    }

    logger.info(`Question deleted: ${req.params.id}`);
    return sendSuccess(res, 200, 'Question deleted.');
  } catch (error) {
    logger.error(`Delete question error: ${error.message}`);
    return sendError(res, 500, 'Failed to delete question.');
  }
};

/**
 * ─── BULK APPROVE ─────────────────────────────────────────────────────────────
 * PATCH /api/questions/bulk-approve
 * Teacher only — approve multiple questions at once
 * Body: { questionIds: ['id1', 'id2', ...] }
 */
const bulkApprove = async (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return sendError(res, 400, 'questionIds must be a non-empty array.');
    }

    const result = await QuestionBank.updateMany(
      { _id: { $in: questionIds }, teacherId: req.user._id },
      { approved: true, reviewedAt: new Date() }
    );

    return sendSuccess(res, 200, `${result.modifiedCount} questions approved.`, {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Bulk approve error: ${error.message}`);
    return sendError(res, 500, 'Bulk approval failed.');
  }
};

/**
 * ─── GET QUESTION BANK STATS ─────────────────────────────────────────────────
 * GET /api/questions/stats?chapterId=xxx
 * Teacher only
 */
const getStats = async (req, res) => {
  try {
    const { chapterId } = req.query;
    if (!chapterId) return sendError(res, 400, 'chapterId is required.');

    const chapter = await Chapter.findOne({ _id: chapterId, teacherId: req.user._id });
    if (!chapter) return sendError(res, 404, 'Chapter not found or access denied.');

    const stats = await QuestionBank.aggregate([
      { $match: { chapterId: chapter._id, teacherId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$approved', true] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$approved', false] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$approved', null] }, 1, 0] } },
          mcq: { $sum: { $cond: [{ $eq: ['$type', 'mcq'] }, 1, 0] } },
          true_false: { $sum: { $cond: [{ $eq: ['$type', 'true_false'] }, 1, 0] } },
          short_answer: { $sum: { $cond: [{ $eq: ['$type', 'short_answer'] }, 1, 0] } },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } },
        },
      },
    ]);

    return sendSuccess(res, 200, 'Stats fetched.', {
      stats: stats[0] || {
        total: 0, approved: 0, rejected: 0, pending: 0,
        mcq: 0, true_false: 0, short_answer: 0,
        easy: 0, medium: 0, hard: 0,
      },
    });
  } catch (error) {
    logger.error(`Get stats error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch stats.');
  }
};

module.exports = {
  generate,
  getQuestions,
  getQuestionById,
  approveQuestion,
  rejectQuestion,
  editQuestion,
  deleteQuestion,
  bulkApprove,
  getStats,
};