const logger = require('../utils/logger');

/**
 * Text Chunking Service
 * Splits cleaned extracted text into overlapping chunks for embedding
 *
 * Strategy: Sentence-aware sliding window
 * - Chunk size: ~500 tokens (~2000 characters)
 * - Overlap: ~50 tokens (~200 characters) to preserve context across chunks
 */

const CHUNK_SIZE = 2000;       // characters per chunk
const CHUNK_OVERLAP = 200;     // overlap between chunks
const MIN_CHUNK_LENGTH = 100;  // discard chunks shorter than this

/**
 * Split text into overlapping chunks
 * @param {string} text - Cleaned extracted text
 * @param {object} options - Override default chunk settings
 * @returns {Array<{ index: number, text: string, charStart: number, charEnd: number }>}
 */
const chunkText = (text, options = {}) => {
  const chunkSize = options.chunkSize || CHUNK_SIZE;
  const overlap = options.overlap || CHUNK_OVERLAP;

  if (!text || text.trim().length === 0) {
    logger.warn('chunkText received empty text');
    return [];
  }

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const previousStart = start;
    let end = start + chunkSize;

    // Try to end at a sentence boundary ('. ', '? ', '! ', '\n\n')
    if (end < text.length) {
      const sentenceEnd = findSentenceBoundary(text, end);
      if (sentenceEnd !== -1) {
        end = sentenceEnd;
      }
    } else {
      end = text.length;
    }

    const chunkText = text.slice(start, end).trim();

    if (chunkText.length >= MIN_CHUNK_LENGTH) {
      chunks.push({
        index,
        text: chunkText,
        charStart: start,
        charEnd: end,
      });
      index++;
    }

    // Move start forward, minus overlap for context continuity
    start = end - overlap;
    // Prevent infinite loop: if start hasn't moved forward, stop
    if (start <= 0 || start >= text.length || start <= previousStart) break;
  }

  logger.info(`Text chunked into ${chunks.length} chunks from ${text.length} characters`);
  return chunks;
};

/**
 * Find the nearest sentence boundary before a position
 * @param {string} text
 * @param {number} position
 * @returns {number} adjusted end position or -1
 */
const findSentenceBoundary = (text, position) => {
  // Look back up to 200 chars for a sentence ending
  const lookbackWindow = text.slice(Math.max(0, position - 200), position);
  const sentenceEnders = ['. ', '.\n', '? ', '?\n', '! ', '!\n', '\n\n'];

  let bestIndex = -1;
  for (const ender of sentenceEnders) {
    const idx = lookbackWindow.lastIndexOf(ender);
    if (idx !== -1 && idx > bestIndex) {
      bestIndex = idx + ender.length;
    }
  }

  if (bestIndex !== -1) {
    return Math.max(0, position - 200) + bestIndex;
  }

  return -1;
};

/**
 * Add chapter metadata to each chunk for retrieval context
 * @param {Array} chunks
 * @param {object} metadata - { chapterId, chapterTitle, subject }
 * @returns {Array}
 */
const addMetadataToChunks = (chunks, metadata) => {
  return chunks.map((chunk) => ({
    ...chunk,
    metadata: {
      chapterId: metadata.chapterId,
      chapterTitle: metadata.chapterTitle,
      subject: metadata.subject || '',
    },
  }));
};

module.exports = { chunkText, addMetadataToChunks };