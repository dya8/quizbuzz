const Quiz = require('../models/Quiz');
const QuestionBank = require("../models/QuestionBank");
const Submission = require("../models/Submission");
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const submissions = await Submission.find({ studentId });
    const takenCount = submissions.length;

    const avgAccuracy =
      takenCount === 0
        ? 0
        : Math.round(
            submissions.reduce(
              (sum, s) => sum + s.percentage,
              0
            ) / takenCount
          );

    const totalXp = submissions.reduce(
      (sum, s) => sum + s.score * 10,
      0
    );

    const level = Math.floor(totalXp / 100) + 1;

    const quizzesAvailable = await Quiz.find({ published: true })
      .select("title timeLimit questionIds");

    res.json({
      success: true,
      data: {
        metrics: {
          streak: takenCount,
          level,
          totalXp,
          takenCount,
          avgAccuracy,
        },
        aiInsights: {
          strongTopics: [],
          weakTopics: [],
          recommendation:
            "Keep attempting quizzes to improve your score.",
        },
        quizzesAvailable,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAvailableQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ published: true });
    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("questionIds");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: quiz.questionIds,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
   const quizId = req.params.id;
    const { answers, timeTaken } = req.body;

    const studentId = req.user.id;

    // Find quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Fetch all questions
    const questions = await QuestionBank.find({
      _id: { $in: quiz.questionIds },
    });

    let score = 0;

    const evaluationDetails = [];

    for (const question of questions) {
      const studentAnswer = answers.find(
        (a) => a.questionId.toString() === question._id.toString()
      );

      const selectedAnswer = studentAnswer
        ? studentAnswer.selectedAnswer
        : "";

      const isCorrect = selectedAnswer === question.correctAnswer;

      if (isCorrect) score++;

      evaluationDetails.push({
        questionId: question._id,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        questionType: question.type,
      });
    }

    const totalQuestions = questions.length;

    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round((score / totalQuestions) * 100);

    const passed = percentage >= quiz.passingScore;
    
    const submission = await Submission.create({
      studentId,
      quizId,
      answers,
      score,
      totalQuestions,
      percentage,
      passed,
      evaluationDetails,
      timeTaken,
    });

    res.json({
      success: true,
      data: submission,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResult = async (req, res) => {
  res.json({
    success: true,
    message: "Result endpoint",
  });
};

module.exports = {
  getDashboard,
  getAvailableQuizzes,
  startQuiz,
  submitQuiz,
  getResult,
};