const mongoose = require('mongoose');

/**
 * Submission Schema
 * Records a student's quiz attempt with answers and computed score
 * One submission per student per quiz (enforced at controller level)
 */
const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
    },

    // Array of { questionId, selectedAnswer }
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QuestionBank',
          required: true,
        },
        selectedAnswer: {
          type: String,
          default: '', // empty string = skipped
        },
      },
    ],

    // Auto-evaluation results
    score: {
      type: Number, // raw correct count
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number, // 0-100
      default: 0,
    },

    passed: {
      type: Boolean,
      default: false,
    },

    // Per-question evaluation detail
    evaluationDetails: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QuestionBank',
        },
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        questionType: String,
      },
    ],

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // Time taken in seconds (optional, for analytics)
    timeTaken: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
submissionSchema.index({ quizId: 1 });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true }); // one attempt per student per quiz
submissionSchema.index({ quizId: 1, score: -1 }); // for leaderboard/analytics

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;