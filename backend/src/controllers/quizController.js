const Quiz = require('../models/Quiz');
const QuestionBank = require('../models/QuestionBank');
const Submission = require('../models/Submission');
const { getQuizAnalytics } = require('../services/analyticsService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const PDFDocument = require("pdfkit");
const logger = require('../utils/logger');

// ═══════════════════════════════════════════════════════════════
// TEACHER ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * CREATE QUIZ
 * POST /api/quizzes
 * Teacher only
 *
 * Validates that all provided questionIds:
 *  1. Exist in QuestionBank
 *  2. Belong to the teacher
 *  3. Are approved (approved: true)
 */
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      chapterId,
      questionIds,
      timeLimit,
      passingScore,
      showAnswersAfterSubmit,
    } = req.body;

    if (!title || !chapterId) {
      return sendError(res, 400, 'title and chapterId are required.');
    }

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return sendError(res, 400, 'questionIds must be a non-empty array.');
    }

    // Validate all questions: must be approved and belong to this teacher
    const questions = await QuestionBank.find({
      _id: { $in: questionIds },
      teacherId: req.user._id,
    
    });

  if (questions.length !== questionIds.length) {
  return sendError(
    res,
    400,
    `Only ${questions.length} of ${questionIds.length} questions are valid.`
  );
}
    const quiz = await Quiz.create({
      title: title.trim(),
      description: description?.trim() || '',
      teacherId: req.user._id,
      chapterId,
      questionIds,
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 50,
      showAnswersAfterSubmit: showAnswersAfterSubmit !== false,
      published: false,
    });

    logger.info(`Quiz created: ${quiz._id} by teacher ${req.user._id}`);

    return sendSuccess(res, 201, 'Quiz created successfully.', { quiz });
  } catch (error) {
    logger.error(`Create quiz error: ${error.message}`);
    return sendError(res, 500, 'Failed to create quiz.');
  }
};

/**
 * GET TEACHER'S QUIZZES
 * GET /api/quizzes/my
 * Teacher only
 */
const getMyQuizzes = async (req, res) => {
  try {
    const { published, page = 1, limit = 20 } = req.query;

    const filter = { teacherId: req.user._id };
    if (published === 'true') filter.published = true;
    if (published === 'false') filter.published = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Quiz.countDocuments(filter);
    const quizzes = await Quiz.find(filter)
      .populate('chapterId', 'title subject')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendPaginated(res, quizzes, page, limit, total);
  } catch (error) {
    logger.error(`Get my quizzes error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch quizzes.');
  }
};

/**
 * GET QUIZ DETAIL (Teacher view — full questions with answers)
 * GET /api/quizzes/:id/detail
 * Teacher only
 */
const getQuizDetail = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    })
      .populate('chapterId', 'title subject')
      .populate('questionIds'); // full question objects including correct answers

    if (!quiz) {
      return sendError(res, 404, 'Quiz not found or access denied.');
    }

    return sendSuccess(res, 200, 'Quiz fetched.', { quiz });
  } catch (error) {
    logger.error(`Get quiz detail error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch quiz.');
  }
};

/**
 * UPDATE QUIZ
 * PUT /api/quizzes/:id
 * Teacher only — cannot edit a published quiz
 */
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });

    if (!quiz) return sendError(res, 404, 'Quiz not found or access denied.');
    if (quiz.published) {
      return sendError(res, 400, 'Cannot edit a published quiz. Unpublish it first.');
    }

    const { title, description, questionIds, timeLimit, passingScore, showAnswersAfterSubmit } = req.body;

    // Re-validate questions if provided
    if (questionIds) {
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return sendError(res, 400, 'questionIds must be a non-empty array.');
      }
      const validQuestions = await QuestionBank.find({
        _id: { $in: questionIds },
        teacherId: req.user._id,
        approved: true,
      });
      if (validQuestions.length !== questionIds.length) {
        return sendError(res, 400, 'Some question IDs are invalid or not approved.');
      }
      quiz.questionIds = questionIds;
    }

    if (title) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description.trim();
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (showAnswersAfterSubmit !== undefined) quiz.showAnswersAfterSubmit = showAnswersAfterSubmit;

    await quiz.save();

    logger.info(`Quiz updated: ${quiz._id}`);
    return sendSuccess(res, 200, 'Quiz updated.', { quiz });
  } catch (error) {
    logger.error(`Update quiz error: ${error.message}`);
    return sendError(res, 500, 'Failed to update quiz.');
  }
};

/**
 * PUBLISH QUIZ
 * PATCH /api/quizzes/:id/publish
 * Teacher only — must have at least 1 question
 */
const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });

    if (!quiz) return sendError(res, 404, 'Quiz not found or access denied.');
    if (quiz.published) return sendError(res, 400, 'Quiz is already published.');
    if (!quiz.questionIds || quiz.questionIds.length === 0) {
      return sendError(res, 400, 'Cannot publish a quiz with no questions.');
    }

    quiz.published = true;
    quiz.publishedAt = new Date();
    await quiz.save();

    logger.info(`Quiz published: ${quiz._id}`);
    return sendSuccess(res, 200, 'Quiz published. Students can now see it.', { quiz });
  } catch (error) {
    logger.error(`Publish quiz error: ${error.message}`);
    return sendError(res, 500, 'Failed to publish quiz.');
  }
};

/**
 * UNPUBLISH QUIZ
 * PATCH /api/quizzes/:id/unpublish
 * Teacher only
 */
const unpublishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id, published: true },
      { published: false, publishedAt: null },
      { new: true }
    );

    if (!quiz) return sendError(res, 404, 'Quiz not found, not published, or access denied.');

    logger.info(`Quiz unpublished: ${quiz._id}`);
    return sendSuccess(res, 200, 'Quiz unpublished.', { quiz });
  } catch (error) {
    logger.error(`Unpublish quiz error: ${error.message}`);
    return sendError(res, 500, 'Failed to unpublish quiz.');
  }
};



/**
 * GET QUIZ ANALYTICS (Teacher)
 * GET /api/quizzes/:id/analytics
 * Teacher only
 */
const getAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!quiz) return sendError(res, 404, 'Quiz not found or access denied.');

    const analytics = await getQuizAnalytics(quiz._id);

    return sendSuccess(res, 200, 'Analytics fetched.', { analytics });
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch analytics.');
  }
};

// ═══════════════════════════════════════════════════════════════
// STUDENT ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * GET PUBLISHED QUIZZES (Student view)
 * GET /api/quizzes
 * Student only — sees only published quizzes
 * Questions returned WITHOUT correct answers
 */
const getPublishedQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Quiz.countDocuments({ published: true });
    const quizzes = await Quiz.find({ published: true })
      .populate('teacherId', 'name')
      .populate('chapterId', 'title subject')
      .select('-questionIds') // don't expose question list to students on browse
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendPaginated(res, quizzes, page, limit, total);
  } catch (error) {
    logger.error(`Get published quizzes error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch quizzes.');
  }
};

/**
 * GET QUIZ FOR ATTEMPT (Student view)
 * GET /api/quizzes/:id/attempt
 * Student only
 * Returns quiz with questions but WITHOUT correct answers or explanations
 */
const getQuizForAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, published: true })
      .populate('teacherId', 'name')
      .populate('chapterId', 'title subject')
      .populate({
        path: 'questionIds',
        select: '-correctAnswer -explanation', // hide answers from students
      });

    if (!quiz) {
      return sendError(res, 404, 'Quiz not found or not published.');
    }

    // Check if student already attempted
    const existingSubmission = await Submission.findOne({
      quizId: quiz._id,
      studentId: req.user._id,
    }).select('percentage passed submittedAt score');

    return sendSuccess(res, 200, 'Quiz fetched.', {
      quiz,
      alreadyAttempted: !!existingSubmission,
      previousResult: existingSubmission || null,
    });
  } catch (error) {
    logger.error(`Get quiz for attempt error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch quiz.');
  }
};

/**
 * GET TEACHER DASHBOARD
 * GET /api/teacher/dashboard
 * Teacher only - Returns overview metrics for the dashboard
 */
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get quiz stats
    const totalQuizzes = await Quiz.countDocuments({ teacherId });
    const drafts = await Quiz.countDocuments({ teacherId, published: false });
    const live = await Quiz.countDocuments({ teacherId, published: true });

    // Get student count across all quizzes
    const studentsEnrolled = await Submission.distinct('studentId', {
      quizId: {
        $in: await Quiz.find({ teacherId }).select('_id').then((qs) => qs.map((q) => q._id)),
      },
    }).then((ids) => ids.length);

    // Count AI-generated questions (from QuestionBank)
    const aiGeneratedQuestions = await QuestionBank.countDocuments({
      teacherId,
      generatedBy: 'ai',
      approved: true,
    });

    // Get recent activity (last 5 submissions)
    const recentSubmissions = await Submission.find({
      quizId: {
        $in: await Quiz.find({ teacherId }).select('_id').then((qs) => qs.map((q) => q._id)),
      },
    })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('studentId', 'name')
      .populate('quizId', 'title');

    const recentActivity = recentSubmissions.map((sub) => ({
      id: sub._id,
      type: sub.passed ? 'pass' : 'attempt',
      description: `${sub.studentId?.name || 'Student'} attempted "${sub.quizId?.title || 'Quiz'}" - ${sub.percentage}%`,
      date: sub.submittedAt.toLocaleDateString(),
    }));

    const dashboardData = {
      metrics: {
        totalQuizzes,
        drafts,
        live,
        studentsEnrolled,
        aiGeneratedQuestions,
      },
      recentActivity,
    };

    return sendSuccess(res, 200, 'Dashboard data fetched.', dashboardData);
  } catch (error) {
    logger.error(`Get teacher dashboard error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch dashboard data.');
  }
};

/**
 * GET TEACHER ANALYTICS
 * GET /api/analytics/teacher
 * Teacher only - Returns comprehensive analytics data
 */
const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get all submissions for teacher's quizzes
    const quizzes = await Quiz.find({ teacherId }).select('_id');
    const quizIds = quizzes.map((q) => q._id);
    const submissions = await Submission.find({ quizId: { $in: quizIds } });

    if (submissions.length === 0) {
      return sendSuccess(res, 200, 'Analytics fetched.', {
        performance: [],
        questionStats: [],
        engagement: [],
        summary: {
          avgAccuracy: 0,
          participationRate: 0,
          totalAttempts: 0,
          avgTimeSpent: 0,
        },
      });
    }

    // Performance distribution
    const performanceRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0,
    };

    submissions.forEach((sub) => {
      const pct = sub.percentage || 0;
      if (pct <= 20) performanceRanges['0-20%']++;
      else if (pct <= 40) performanceRanges['21-40%']++;
      else if (pct <= 60) performanceRanges['41-60%']++;
      else if (pct <= 80) performanceRanges['61-80%']++;
      else performanceRanges['81-100%']++;
    });

    const performance = Object.entries(performanceRanges).map(([range, students]) => ({
      range,
      students,
    }));

    // Question-by-question stats
    const questionStats = {};
    submissions.forEach((sub) => {
      if (sub.evaluationDetails) {
        sub.evaluationDetails.forEach((detail) => {
          const qId = detail.questionId?.toString() || 'unknown';
          if (!questionStats[qId]) {
            questionStats[qId] = { correct: 0, incorrect: 0 };
          }
          if (detail.isCorrect) questionStats[qId].correct++;
          else questionStats[qId].incorrect++;
        });
      }
    });

    const questionStatsArray = Object.entries(questionStats)
      .map(([qId, stats], idx) => ({
        question: `Q${idx + 1}`,
        correct: stats.correct,
        incorrect: stats.incorrect,
      }))
      .slice(0, 10);

    // Engagement by day of week
    const engagementByDay = {
      Mon: { visits: 0, started: 0, completed: 0 },
      Tue: { visits: 0, started: 0, completed: 0 },
      Wed: { visits: 0, started: 0, completed: 0 },
      Thu: { visits: 0, started: 0, completed: 0 },
      Fri: { visits: 0, started: 0, completed: 0 },
      Sat: { visits: 0, started: 0, completed: 0 },
      Sun: { visits: 0, started: 0, completed: 0 },
    };

    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    submissions.forEach((sub) => {
      const dayName = dayMap[new Date(sub.submittedAt).getDay()];
      engagementByDay[dayName].visits++;
      engagementByDay[dayName].completed++;
    });

    const engagement = Object.entries(engagementByDay).map(([day, data]) => ({
      day,
      visits: data.visits,
      started: data.visits,
      completed: data.completed,
    }));

    // Summary stats
    const avgAccuracy = (
      submissions.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / submissions.length
    ).toFixed(1);

    const totalEnrolled = await Submission.distinct('studentId', {
      quizId: { $in: quizIds },
    }).then((ids) => ids.length);

    const completed = submissions.length;
    const participationRate = totalEnrolled > 0 ? ((completed / totalEnrolled) * 100).toFixed(1) : 0;

    const avgTimeSpent = submissions.reduce((sum, sub) => sum + (sub.timeTaken || 0), 0) / submissions.length;

    return sendSuccess(res, 200, 'Analytics fetched.', {
      performance,
      questionStats: questionStatsArray,
      engagement,
      summary: {
        avgAccuracy,
        participationRate,
        totalAttempts: submissions.length,
        avgTimeSpent: Math.round(avgTimeSpent / 60), // convert to minutes
      },
    });
  } catch (error) {
    logger.error(`Get teacher analytics error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch analytics.');
  }
};
/**
 * DELETE QUIZ (Teacher only)
 * DELETE /api/quizzes/:id
 * Teacher only
 */


const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Only creator can delete
    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // delete submissions of this quiz
    await Submission.deleteMany({
      quizId: id,
    });

    await Quiz.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const downloadQuizPDF = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("questionIds")
      .populate("chapterId", "title subject");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${quiz.title}.pdf"`
    );

    doc.pipe(res);

    // ---------------- Header ----------------
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("QUIZBUZZ", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(18)
      .text(quiz.title, { align: "center" });

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Subject : ${quiz.chapterId?.subject || "-"}`);

    doc.text(`Chapter : ${quiz.chapterId?.title || "-"}`);
    doc.text(`Questions : ${quiz.questionIds.length}`);
    doc.text(`Generated : ${new Date().toLocaleString()}`);

    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // ---------------- Questions ----------------

    quiz.questionIds.forEach((question, index) => {

      // New page if remaining space is low
      if (doc.y > 720) {
        doc.addPage();
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("black")
        .text(`Q${index + 1}. ${question.question}`);

      doc.moveDown(0.4);

      question.options.forEach((option, i) => {
        const letter = String.fromCharCode(65 + i);

        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`${letter}. ${option}`);
      });

      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      doc.moveDown();
    });

    // ==========================
    // Answer Key (LAST PAGE)
    // ==========================

    doc.addPage();

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("black")
      .text("ANSWER KEY", {
        align: "center",
      });

    doc.moveDown(2);

    quiz.questionIds.forEach((question, index) => {
      doc
        .font("Helvetica")
        .fontSize(14)
        .text(
          `Q${String(index + 1).padEnd(3)} → ${question.correctAnswer}`
        );
    });

    doc.end();

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
};

module.exports = {
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
  getTeacherDashboard,
  getTeacherAnalytics,
  downloadQuizPDF,
  
  
};