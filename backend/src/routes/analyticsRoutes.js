const express = require("express");
const router = express.Router();

const { protect, isStudent } = require("../middleware/authMiddleware");

const {
  getStudentAnalytics,
} = require("../controllers/analyticsController");

router.get(
  "/student",
  protect,
  isStudent,
  getStudentAnalytics
);

module.exports = router;