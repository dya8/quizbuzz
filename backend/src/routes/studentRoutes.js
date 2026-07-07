const express = require("express");
const router = express.Router();

const { protect, isStudent } = require("../middleware/authMiddleware");

const {
  getDashboard,
  getAvailableQuizzes,
  startQuiz,
  submitQuiz,
  getResult,
} = require("../controllers/studentController");

router.use(protect, isStudent);

router.get("/dashboard", getDashboard);

router.get("/quizzes", getAvailableQuizzes);

router.get("/quiz/:id/start", startQuiz);

router.post("/quiz/:id/submit", submitQuiz);

router.get("/results/:id", getResult);

module.exports = router;