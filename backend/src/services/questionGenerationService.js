const { v4: uuidv4 } = require('uuid');
const { retrieveRelevantChunks, buildContextFromChunks } = require('./retrievalService');
const { buildQuestionPrompt } = require('./promptBuilderService');
const { generateQuestionsWithGemini } = require('./geminiService');
const QuestionBank = require('../models/QuestionBank');
const Chapter = require('../models/Chapter');
const logger = require('../utils/logger');

/**
 * AI Question Generation Service
 * Full flow: retrieve context → build prompt → call Gemini → save to QuestionBank
 */

const VALID_TYPES = ['mcq', 'true_false', 'short_answer'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const MAX_QUESTIONS_PER_REQUEST = 20;

/**
 * Generate questions for a chapter
 * @param {object} params
 * @param {string} params.chapterId
 * @param {string} params.teacherId
 * @param {string} params.type - 'mcq' | 'true_false' | 'short_answer'
 * @param {string} params.difficulty - 'easy' | 'medium' | 'hard'
 * @param {number} params.count - number of questions to generate
 * @returns {{ batchId: string, questions: Array, count: number }}
 */
const generateQuestions = async ({ chapterId, teacherId, type, difficulty, count }) => {
  // ── Input validation ──────────────────────────────────────────────────────
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    throw new Error(`Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }
  if (!count || count < 1 || count > MAX_QUESTIONS_PER_REQUEST) {
    throw new Error(`Count must be between 1 and ${MAX_QUESTIONS_PER_REQUEST}`);
  }

  // ── Verify chapter exists, belongs to teacher, and is ready ──────────────
  const chapter = await Chapter.findOne({ _id: chapterId, teacherId });
  if (!chapter) {
    throw new Error('Chapter not found or access denied.');
  }
  if (chapter.processingStatus !== 'ready') {
    throw new Error(
      `Chapter is not ready for question generation. Current status: ${chapter.processingStatus}`
    );
  }

  logger.info(`Generating ${count} ${difficulty} ${type} questions for chapter: ${chapterId}`);

  // ── Step 1: Retrieve relevant context chunks ──────────────────────────────
  const query = `${difficulty} ${type} questions about ${chapter.title} ${chapter.subject}`;
  const chunks = await retrieveRelevantChunks(chapterId.toString(), query, 6);

  if (!chunks || chunks.length === 0) {
    throw new Error('No context chunks found. Ensure the RAG pipeline has completed.');
  }

  const context = buildContextFromChunks(chunks);

  // ── Step 2: Build prompt ──────────────────────────────────────────────────
  const prompt = buildQuestionPrompt({
    context,
    type,
    difficulty,
    count,
    chapterTitle: chapter.title,
  });

  // ── Step 3: Call Gemini ───────────────────────────────────────────────────
  const generatedQuestions = await generateQuestionsWithGemini(prompt, count);

  // ── Step 4: Save to QuestionBank ──────────────────────────────────────────
  const batchId = uuidv4();

  const questionsToSave = generatedQuestions.map((q) => ({
    chapterId,
    teacherId,
    question: q.question,
    type: q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    approved: null, // pending review
    generatedBy: 'ai',
    generationBatchId: batchId,
  }));

  const savedQuestions = await QuestionBank.insertMany(questionsToSave);

  logger.info(`Saved ${savedQuestions.length} questions to QuestionBank (batch: ${batchId})`);

  return {
    batchId,
    count: savedQuestions.length,
    questions: savedQuestions,
  };
};

module.exports = { generateQuestions };