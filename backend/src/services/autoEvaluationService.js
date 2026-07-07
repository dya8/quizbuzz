const logger = require('../utils/logger');

/**
 * Auto Evaluation Service
 * Evaluates student answers against correct answers
 *
 * MCQ + True/False: exact string match (case-insensitive)
 * Short Answer: marked as "manual review" — isCorrect = null
 *   (short answer auto-scoring is intentionally excluded;
 *    it requires teacher review or NLP — not in scope for this module)
 */

/**
 * Evaluate a set of student answers against question bank entries
 *
 * @param {Array} answers       - [{ questionId, selectedAnswer }]
 * @param {Array} questions     - QuestionBank docs for all questionIds in the quiz
 * @param {number} passingScore - Quiz passing threshold (percentage)
 *
 * @returns {{
 *   score: number,
 *   totalQuestions: number,
 *   totalEvaluated: number,
 *   percentage: number,
 *   passed: boolean,
 *   evaluationDetails: Array
 * }}
 */
const evaluateSubmission = (answers, questions, passingScore = 50) => {
  const questionMap = new Map(
    questions.map((q) => [q._id.toString(), q])
  );

  let correctCount = 0;
  let evaluatedCount = 0; // only MCQ + T/F count toward auto score
  const evaluationDetails = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId.toString());

    if (!question) {
      logger.warn(`Evaluation: question ${answer.questionId} not found in quiz questions`);
      continue;
    }

    const detail = {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer || '',
      correctAnswer: question.correctAnswer,
      questionType: question.type,
      isCorrect: null, // null = not auto-evaluated
    };

    if (question.type === 'mcq' || question.type === 'true_false') {
      evaluatedCount++;
      const isCorrect =
        answer.selectedAnswer &&
        answer.selectedAnswer.trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase();

      detail.isCorrect = isCorrect;
      if (isCorrect) correctCount++;
    }
    // short_answer: isCorrect stays null — teacher reviews manually

    evaluationDetails.push(detail);
  }

  // Score is based only on auto-evaluable questions
  const totalForScoring = evaluatedCount;
  const percentage =
    totalForScoring > 0
      ? parseFloat(((correctCount / totalForScoring) * 100).toFixed(2))
      : 0;

  const passed = percentage >= passingScore;

  logger.info(
    `Evaluation complete: ${correctCount}/${totalForScoring} correct | ${percentage}% | ${passed ? 'PASSED' : 'FAILED'}`
  );

  return {
    score: correctCount,
    totalQuestions: answers.length,
    totalEvaluated: evaluatedCount,
    percentage,
    passed,
    evaluationDetails,
  };
};

module.exports = { evaluateSubmission };