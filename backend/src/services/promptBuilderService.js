/**
 * Prompt Builder Service
 * Constructs structured prompts for Gemini 2.5 Flash
 * based on context chunks, question type, difficulty, and count
 *
 * Output format is strict JSON to enable reliable parsing
 */

/**
 * Build the full prompt for AI question generation
 * @param {string} context - Combined text from retrieved RAG chunks
 * @param {object} params
 * @param {string} params.type - 'mcq' | 'true_false' | 'short_answer'
 * @param {string} params.difficulty - 'easy' | 'medium' | 'hard'
 * @param {number} params.count - number of questions to generate
 * @param {string} params.chapterTitle - for context
 * @returns {string} prompt string
 */
const buildQuestionPrompt = ({ context, type, difficulty, count, chapterTitle }) => {
  const typeInstructions = getTypeInstructions(type);
  const difficultyGuidance = getDifficultyGuidance(difficulty);
  const outputFormat = getOutputFormat(type, difficulty);

  return `You are an expert educational assessment designer creating quiz questions for a chapter titled: "${chapterTitle}".

REFERENCE MATERIAL:
${context}

---

TASK:
Generate exactly ${count} ${difficulty.toUpperCase()} difficulty ${getTypeName(type)} question(s) based ONLY on the reference material above.

DIFFICULTY GUIDANCE:
${difficultyGuidance}

QUESTION TYPE INSTRUCTIONS:
${typeInstructions}

EXPLANATION RULES (strictly enforced):
- Every explanation MUST be fully self-contained. A student must be able to understand it without reading anything else.
- Write explanations as standalone factual statements. Example: "Photosynthesis converts sunlight into glucose using chlorophyll in plant cells."
- NEVER reference the source material in any way. The following phrases are strictly FORBIDDEN in explanations:
    ✗ "according to the context"
    ✗ "as stated in the passage"
    ✗ "the text mentions"
    ✗ "based on the provided material"
    ✗ "in the excerpt"
    ✗ "context [N]" or "[Context 1]" or any numbered context reference
    ✗ "the chapter states"
    ✗ "as mentioned above"
    ✗ "per the document"
    ✗ any phrase that implies the student has access to a source document
- Explanations must state the fact directly, explain why the answer is correct, and optionally clarify why other options are wrong.

STRICT OUTPUT RULES:
1. Respond ONLY with a valid JSON array. No preamble, no explanation text, no markdown fences.
2. Generate exactly ${count} question(s).
3. Base questions ONLY on the reference material — do not use outside knowledge.
4. Every question must have a clear, unambiguous correct answer derivable from the material.
5. The "difficulty" field in each object must exactly match: "${difficulty}".

OUTPUT FORMAT (return exactly this structure):
${outputFormat}`;
};

// ─── Type-specific instructions ───────────────────────────────────────────────

const getTypeInstructions = (type) => {
  switch (type) {
    case 'mcq':
      return `- Create exactly 4 answer options
- Only ONE option must be clearly correct
- The 3 incorrect options must be plausible but definitively wrong
- Options should be similar in length and grammatical style
- Avoid "All of the above", "None of the above", or "Both A and B"
- The correctAnswer field must be the exact string of the correct option`;

    case 'true_false':
      return `- Write a clear, specific declarative statement (not a question)
- The statement must be definitively TRUE or FALSE — no partial truths
- Avoid absolute words like "always" or "never" unless the material explicitly supports them
- The correctAnswer field must be exactly "True" or "False"
- options field must be exactly: ["True", "False"]`;

    case 'short_answer':
      return `- Ask a focused question with a concise factual answer (1–2 sentences max)
- The answer must be a specific fact, definition, name, or process — not an opinion
- Avoid questions that could have multiple valid answers
- The correctAnswer field should be a complete sentence, not a single word
- options field must be an empty array: []`;

    default:
      return '';
  }
};

const getDifficultyGuidance = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return `- Test direct recall of facts, definitions, and key terms
- The answer should be findable in a single sentence from the material
- Use clear, everyday language with no technical jargon in the question itself
- Incorrect MCQ options should be clearly distinguishable to someone who read the material`;

    case 'medium':
      return `- Test understanding and application of concepts, not just recall
- Require the student to connect or compare 2–3 ideas from the material
- The question should require comprehension, not just memorization
- Incorrect MCQ options should require genuine understanding to eliminate`;

    case 'hard':
      return `- Test analysis, inference, and synthesis across multiple concepts
- The student must reason from the material, not just locate a sentence
- Questions may involve cause-effect, comparison, or implication
- All MCQ options should seem plausible to someone who only skimmed the material
- Distractors must require careful reading and understanding to eliminate`;

    default:
      return '';
  }
};

const getTypeName = (type) => {
  const names = {
    mcq: 'Multiple Choice (MCQ)',
    true_false: 'True/False',
    short_answer: 'Short Answer',
  };
  return names[type] || type;
};

// ─── Output format templates ──────────────────────────────────────────────────

const getOutputFormat = (type, difficulty) => {
  switch (type) {
    case 'mcq':
      return `[
  {
    "question": "What is the primary function of mitochondria in a cell?",
    "type": "mcq",
    "options": [
      "To produce energy in the form of ATP",
      "To store genetic information",
      "To synthesize proteins",
      "To regulate water balance"
    ],
    "correctAnswer": "To produce energy in the form of ATP",
    "explanation": "Mitochondria are the powerhouses of the cell. They generate ATP (adenosine triphosphate) through cellular respiration, which provides the energy needed for all cellular functions. The nucleus stores genetic information, ribosomes synthesize proteins, and vacuoles help regulate water balance.",
    "difficulty": "${difficulty}"
  }
]`;

    case 'true_false':
      return `[
  {
    "question": "The mitochondria is responsible for producing ATP through cellular respiration.",
    "type": "true_false",
    "options": ["True", "False"],
    "correctAnswer": "True",
    "explanation": "This statement is true. Mitochondria carry out cellular respiration, a process that converts glucose and oxygen into ATP — the primary energy currency of the cell. This is why mitochondria are often called the powerhouse of the cell.",
    "difficulty": "${difficulty}"
  }
]`;

    case 'short_answer':
      return `[
  {
    "question": "What molecule do mitochondria produce that serves as the primary energy source for cells?",
    "type": "short_answer",
    "options": [],
    "correctAnswer": "Mitochondria produce ATP (adenosine triphosphate), which serves as the primary energy currency that powers cellular functions throughout the body.",
    "explanation": "ATP stands for adenosine triphosphate. It is produced during cellular respiration in the mitochondria and is used by virtually every process in the cell that requires energy, from muscle contraction to protein synthesis.",
    "difficulty": "${difficulty}"
  }
]`;

    default:
      return '[]';
  }
};

module.exports = { buildQuestionPrompt };