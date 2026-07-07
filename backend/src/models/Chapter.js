const mongoose = require('mongoose');

/**
 * Chapter Schema
 * Represents a PDF chapter uploaded by a teacher
 * Stores file path, extracted text, and processing status
 */
const chapterSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },

    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
      default: '',
    },

    pdfPath: {
      type: String,
      required: [true, 'PDF path is required'],
    },

    originalFileName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number, // bytes
      default: 0,
    },

    extractedText: {
      type: String,
      default: '',
    },

    pageCount: {
      type: Number,
      default: 0,
    },

    // RAG pipeline tracking
    processingStatus: {
      type: String,
      enum: ['pending', 'extracting', 'chunking', 'embedding', 'ready', 'failed'],
      default: 'pending',
    },

    processingError: {
      type: String,
      default: null,
    },

    // Marks whether embeddings have been stored in vector DB
    embeddingsStored: {
      type: Boolean,
      default: false,
    },

    totalChunks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
chapterSchema.index({ teacherId: 1 });
chapterSchema.index({ teacherId: 1, title: 1 });
chapterSchema.index({ processingStatus: 1 });

// ─── Virtual: is ready for question generation ────────────────────────────────
chapterSchema.virtual('isReady').get(function () {
  return this.processingStatus === 'ready' && this.embeddingsStored;
});

const Chapter = mongoose.model('Chapter', chapterSchema);
module.exports = Chapter;