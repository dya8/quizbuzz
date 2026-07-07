const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const QuestionBank = require('../models/QuestionBank');
const { evaluateSubmission } = require('../services/autoEvaluationService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ═══════════════════════════════════════════════════════════════
// STUDENT ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * SUBMIT QUIZ ANSWERS
 * POST /api/submissions
 * Student only
 *
 * Flow:
 *  1. Validate quiz exists and is published
 *  2. Prevent duplicate submissions
 *  3. Validate submitted question IDs match the quiz
 *  4. Run auto-evaluation
 *  5. Save submission with score
 *  6. Return result
 */
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return sendError(res, 400, 'quizId and answers array are required.');
    }

    // ── 1. Fetch published quiz ───────────────────────────────────────────────
    const quiz = await Quiz.findOne({ _id: quizId, published: true });
    if (!quiz) {
      return sendError(res, 404, 'Quiz not found or not published.');
    }

    // ── 2. Prevent duplicate submission ──────────────────────────────────────
    const existing = await Submission.findOne({
      quizId,
      studentId: req.user._id,
    });
    if (existing) {
      return sendError(res, 409, 'You have already submitted this quiz. Check your results.');
    }

    // ── 3. Validate submitted question IDs belong to this quiz ────────────────
    const quizQuestionIds = quiz.questionIds.map((id) => id.toString());
    const submittedQuestionIds = answers.map((a) => a.questionId?.toString());

    const invalidIds = submittedQuestionIds.filter((id) => !quizQuestionIds.includes(id));
    if (invalidIds.length > 0) {
      return sendError(res, 400, `Invalid question IDs submitted: ${invalidIds.join(', ')}`);
    }

    // ── 4. Fetch full question objects for evaluation ─────────────────────────
    const questions = await QuestionBank.find({
      _id: { $in: quizQuestionIds },
    });

    // ── 5. Auto-evaluate ──────────────────────────────────────────────────────
    const evaluation = evaluateSubmission(answers, questions, quiz.passingScore);

    // ── 6. Save submission ────────────────────────────────────────────────────
    const submission = await Submission.create({
      studentId: req.user._id,
      quizId,
      answers,
      score: evaluation.score,
      totalQuestions: evaluation.totalQuestions,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      evaluationDetails: evaluation.evaluationDetails,
      timeTaken: timeTaken || null,
      submittedAt: new Date(),
    });

    logger.info(
      `Submission saved: student ${req.user._id} | quiz ${quizId} | ${evaluation.percentage}% | ${evaluation.passed ? 'PASSED' : 'FAILED'}`
    );

    // ── 7. Build response ─────────────────────────────────────────────────────
    const responseData = {
      submission: {
        id: submission._id,
        score: evaluation.score,
        totalQuestions: evaluation.totalQuestions,
        percentage: evaluation.percentage,
        passed: evaluation.passed,
        submittedAt: submission.submittedAt,
      },
    };

    // Optionally include correct answers if quiz allows it
    if (quiz.showAnswersAfterSubmit) {
      responseData.evaluationDetails = evaluation.evaluationDetails;
    }

    return sendSuccess(res, 201, 'Quiz submitted successfully.', responseData);
  } catch (error) {
    // Handle duplicate key (race condition double submit)
    if (error.code === 11000) {
      return sendError(res, 409, 'You have already submitted this quiz.');
    }
    logger.error(`Submit quiz error: ${error.message}`);
    return sendError(res, 500, 'Submission failed. Please try again.');
  }
};

/**
 * GET MY RESULT FOR A QUIZ
 * GET /api/submissions/result/:quizId
 * Student only
 */
const getMyResult = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      quizId: req.params.quizId,
      studentId: req.user._id,
    }).populate('quizId', 'title passingScore showAnswersAfterSubmit');

    if (!submission) {
      return sendError(res, 404, 'No submission found for this quiz.');
    }

    const result = {
      quizTitle: submission.quizId?.title,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      percentage: submission.percentage,
      passed: submission.passed,
      submittedAt: submission.submittedAt,
      timeTaken: submission.timeTaken,
    };

    // Only include answer breakdown if quiz allows it
    if (submission.quizId?.showAnswersAfterSubmit) {
      result.evaluationDetails = submission.evaluationDetails;
    }

    return sendSuccess(res, 200, 'Result fetched.', { result });
  } catch (error) {
    logger.error(`Get result error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch result.');
  }
};

/**
 * GET ALL MY SUBMISSIONS (Student's quiz history)
 * GET /api/submissions/my
 * Student only
 */
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('quizId', 'title chapterId publishedAt')
      .select('quizId score percentage passed submittedAt totalQuestions')
      .sort({ submittedAt: -1 });

    return sendSuccess(res, 200, 'Submissions fetched.', {
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    logger.error(`Get my submissions error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch submissions.');
  }
};

// ═══════════════════════════════════════════════════════════════
// TEACHER ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * GET ALL SUBMISSIONS FOR A QUIZ (Teacher view)
 * GET /api/submissions/quiz/:quizId
 * Teacher only
 */
const getSubmissionsForQuiz = async (req, res) => {
  try {
    // Verify teacher owns the quiz
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      teacherId: req.user._id,
    });
    if (!quiz) {
      return sendError(res, 404, 'Quiz not found or access denied.');
    }

    const submissions = await Submission.find({ quizId: req.params.quizId })
      .populate('studentId', 'name email')
      .select('studentId score percentage passed submittedAt totalQuestions timeTaken')
      .sort({ percentage: -1 }); // highest score first

    return sendSuccess(res, 200, 'Submissions fetched.', {
      count: submissions.length,
      quizTitle: quiz.title,
      submissions,
    });
  } catch (error) {
    logger.error(`Get quiz submissions error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch submissions.');
  }
};

/**
 * GET SINGLE SUBMISSION DETAIL (Teacher view)
 * GET /api/submissions/:id
 * Teacher only — full evaluation breakdown
 */
const getSubmissionDetail = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('quizId', 'title teacherId');

    if (!submission) {
      return sendError(res, 404, 'Submission not found.');
    }

    // Only the quiz's teacher can view full submission details
    if (submission.quizId?.teacherId?.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied.');
    }

    return sendSuccess(res, 200, 'Submission detail fetched.', { submission });
  } catch (error) {
    logger.error(`Get submission detail error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch submission.');
  }
};

module.exports = {
  submitQuiz,
  getMyResult,
  getMySubmissions,
  getSubmissionsForQuiz,
  getSubmissionDetail,
};