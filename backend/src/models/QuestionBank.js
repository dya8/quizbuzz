const mongoose = require('mongoose');

/**
 * QuestionBank Schema
 * Stores AI-generated questions awaiting teacher review
 * No question reaches a quiz without teacher approval
 */
const questionBankSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },

    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },

    type: {
      type: String,
      enum: {
        values: ['mcq', 'true_false', 'short_answer'],
        message: 'Type must be mcq, true_false, or short_answer',
      },
      required: [true, 'Question type is required'],
    },

    // For MCQ: ['Option A', 'Option B', 'Option C', 'Option D']
    // For True/False: ['True', 'False']
    // For Short Answer: [] (empty)
    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
    },

    explanation: {
      type: String,
      trim: true,
      default: '',
    },

    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium, or hard',
      },
      required: [true, 'Difficulty is required'],
    },

    // Teacher review status
    approved: {
      type: Boolean,
      default: null, // null = pending, true = approved, false = rejected
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      default: '',
    },

    generatedBy: {
      type: String,
      enum: ['ai', 'teacher'],
      default: 'ai',
    },

    // Track which generation batch this came from
    generationBatchId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
questionBankSchema.index({ chapterId: 1 });
questionBankSchema.index({ teacherId: 1 });
questionBankSchema.index({ chapterId: 1, approved: 1 });
questionBankSchema.index({ chapterId: 1, difficulty: 1 });
questionBankSchema.index({ generationBatchId: 1 });

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
module.exports = QuestionBank;