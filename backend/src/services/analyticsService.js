const Submission = require('../models/Submission');
const logger = require('../utils/logger');

/**
 * Analytics Service
 * Computes aggregate statistics for a quiz based on all submissions
 *
 * Generates:
 * - Average score / percentage
 * - Highest score
 * - Lowest score
 * - Pass percentage
 * - Total attempts
 * - Score distribution (buckets)
 * - Per-question accuracy
 */

/**
 * Get full analytics for a quiz
 * @param {string} quizId
 * @returns {object} analytics object
 */
const getQuizAnalytics = async (quizId) => {
  try {
    const submissions = await Submission.find({ quizId }).lean();

    if (submissions.length === 0) {
      return buildEmptyAnalytics(quizId);
    }

    const percentages = submissions.map((s) => s.percentage);
    const scores = submissions.map((s) => s.score);
    const passedCount = submissions.filter((s) => s.passed).length;

    // Score distribution buckets: 0-20, 21-40, 41-60, 61-80, 81-100
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    for (const pct of percentages) {
      if (pct <= 20) distribution['0-20']++;
      else if (pct <= 40) distribution['21-40']++;
      else if (pct <= 60) distribution['41-60']++;
      else if (pct <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    }

    // Per-question accuracy
    const questionStats = {};
    for (const submission of submissions) {
      for (const detail of submission.evaluationDetails) {
        const qId = detail.questionId.toString();
        if (!questionStats[qId]) {
          questionStats[qId] = { correct: 0, total: 0, questionType: detail.questionType };
        }
        if (detail.isCorrect !== null) {
          questionStats[qId].total++;
          if (detail.isCorrect) questionStats[qId].correct++;
        }
      }
    }

    const questionAccuracy = Object.entries(questionStats).map(([id, stat]) => ({
      questionId: id,
      questionType: stat.questionType,
      accuracy: stat.total > 0
        ? parseFloat(((stat.correct / stat.total) * 100).toFixed(2))
        : null,
      correct: stat.correct,
      total: stat.total,
    }));

    return {
      quizId,
      totalAttempts: submissions.length,
      averageScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      averagePercentage: parseFloat((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2)),
      highestScore: Math.max(...percentages),
      lowestScore: Math.min(...percentages),
      passCount: passedCount,
      failCount: submissions.length - passedCount,
      passPercentage: parseFloat(((passedCount / submissions.length) * 100).toFixed(2)),
      scoreDistribution: distribution,
      questionAccuracy,
    };
  } catch (error) {
    logger.error(`Analytics error for quiz ${quizId}: ${error.message}`);
    throw error;
  }
};

const buildEmptyAnalytics = (quizId) => ({
  quizId,
  totalAttempts: 0,
  averageScore: 0,
  averagePercentage: 0,
  highestScore: 0,
  lowestScore: 0,
  passCount: 0,
  failCount: 0,
  passPercentage: 0,
  scoreDistribution: { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 },
  questionAccuracy: [],
});

module.exports = { getQuizAnalytics };