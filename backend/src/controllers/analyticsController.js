const Submission = require("../models/Submission");
const Quiz = require("../models/Quiz");
const QuestionBank = require("../models/QuestionBank");

const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user.id;

    const submission = await Submission.findOne({ studentId })
      .sort({ createdAt: -1 });

    if (!submission) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const quiz = await Quiz.findById(submission.quizId);

    const questions = await QuestionBank.find({
      _id: {
        $in: submission.evaluationDetails.map(
          q => q.questionId
        )
      }
    });

    const review = submission.evaluationDetails.map(detail => {

      const question = questions.find(
        q => q._id.toString() === detail.questionId.toString()
      );

      return {
        question: question?.question || "",
        selectedAnswer: detail.selectedAnswer,
        correctAnswer: detail.correctAnswer,
        isCorrect: detail.isCorrect
      };

    });

    res.json({
      success: true,
      data: {
        quizTitle: quiz.title,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        percentage: submission.percentage,
        passed: submission.passed,
        submittedAt: submission.createdAt,
        review
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

module.exports = {
  getStudentAnalytics
};