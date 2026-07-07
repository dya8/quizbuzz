const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

/**
 * Gemini Service
 * Wraps Gemini 2.5 Flash API for question generation
 * Handles JSON extraction, retries, and error normalization
 */

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Send a prompt to Gemini 2.5 Flash and return parsed JSON questions
 * @param {string} prompt - Full prompt from promptBuilderService
 * @param {number} expectedCount - Expected number of questions
 * @returns {Array} parsed question objects
 */
const generateQuestionsWithGemini = async (prompt, expectedCount) => {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,        // Balanced creativity vs consistency
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });

  let lastError = null;

  // Retry up to 3 times on parse failure
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      logger.info(`Gemini request attempt ${attempt}/3 (expecting ${expectedCount} questions)`);

   const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ],
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.1,
  },
});
      const rawText = result.response.text();

      logger.info(`Gemini raw response length: ${rawText.length} chars`);

      // Extract and parse JSON from response
      const questions = extractJSONFromResponse(rawText);

      if (!Array.isArray(questions)) {
        throw new Error('Gemini response is not a JSON array');
      }

      if (questions.length === 0) {
        throw new Error('Gemini returned empty questions array');
      }

      // Validate each question has required fields
      const validated = questions
        .filter(validateQuestion)
        .map(normalizeQuestion);

      logger.info(`Gemini returned ${questions.length} questions, ${validated.length} passed validation`);

      if (validated.length === 0) {
        throw new Error('No questions passed validation after parsing');
      }

      return validated;

    } catch (error) {

      lastError = error;
      logger.warn(`Gemini attempt ${attempt} failed: ${error.message}`);

      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500 * attempt)); // backoff
      }
    }
  }

  throw new Error(`Gemini generation failed after 3 attempts: ${lastError?.message}`);
};

// ─── JSON Extraction ──────────────────────────────────────────────────────────

/**
 * Extract JSON array from Gemini's text response
 * Handles cases where model wraps JSON in markdown code blocks
 */
const extractJSONFromResponse = (text) => {
  // Remove markdown code fences if present
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Find the first '[' and last ']' to isolate the array
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end === -1) {
    throw new Error('No JSON array found in Gemini response');
  }

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try to fix common issues: trailing commas, single quotes
    const fixed = jsonStr
      .replace(/,\s*([}\]])/g, '$1')   // remove trailing commas
      .replace(/'/g, '"');             // replace single quotes
    return JSON.parse(fixed);
  }
};

// ─── Validation ───────────────────────────────────────────────────────────────

const validateQuestion = (q) => {
  if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) return false;
  if (!q.correctAnswer || typeof q.correctAnswer !== 'string') return false;
  if (!q.type || !['mcq', 'true_false', 'short_answer'].includes(q.type)) return false;
  if (!q.difficulty || !['easy', 'medium', 'hard'].includes(q.difficulty)) return false;
  if (q.type === 'mcq' && (!Array.isArray(q.options) || q.options.length < 2)) return false;
  return true;
};

const normalizeQuestion = (q) => ({
  question: q.question.trim(),
  type: q.type,
  options: Array.isArray(q.options) ? q.options.map((o) => o.trim()) : [],
  correctAnswer: q.correctAnswer.trim(),
  explanation: (q.explanation || '').trim(),
  difficulty: q.difficulty,
});

module.exports = { generateQuestionsWithGemini };