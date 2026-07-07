const mongoose = require('mongoose');

/**
 * Quiz Schema
 * Teacher selects approved questions and assembles them into a quiz
 * A quiz must be explicitly published before students can see it
 */
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
    },

    // Only approved questions from QuestionBank can be added
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionBank',
      },
    ],

    published: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    // Quiz settings
    timeLimit: {
      type: Number, // minutes, 0 = no limit
      default: 0,
      min: 0,
      max: 300,
    },

    passingScore: {
      type: Number, // percentage 0-100
      default: 50,
      min: 0,
      max: 100,
    },

    // Allow students to see correct answers after submission
    showAnswersAfterSubmit: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
quizSchema.index({ teacherId: 1 });
quizSchema.index({ published: 1 });
quizSchema.index({ teacherId: 1, published: 1 });
quizSchema.index({ chapterId: 1 });

// ─── Virtual: total question count ───────────────────────────────────────────
quizSchema.virtual('totalQuestions').get(function () {
  return this.questionIds ? this.questionIds.length : 0;
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;