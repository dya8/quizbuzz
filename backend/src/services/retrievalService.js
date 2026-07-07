const { generateQueryEmbedding } = require('./embeddingService');
const vectorStoreService = require('./vectorStoreService');
const logger = require('../utils/logger');

/**
 * Retrieval Service
 * Converts a query string into an embedding and retrieves
 * the most semantically similar chunks from the vector store
 */

/**
 * Retrieve top-K relevant chunks for a given query
 * @param {string} chapterId
 * @param {string} query - Natural language query / topic
 * @param {number} topK - Number of chunks to retrieve (default 5)
 * @returns {Array<{ text: string, score: number, metadata: object }>}
 */
const retrieveRelevantChunks = async (chapterId, query, topK = 5) => {
  try {
    if (!vectorStoreService.hasIndex(chapterId)) {
      throw new Error(`No vector index found for chapter ${chapterId}. Run RAG pipeline first.`);
    }

    logger.info(`Retrieving chunks for chapter ${chapterId} | query: "${query.slice(0, 60)}..."`);

    // Convert query to embedding
    const queryEmbedding = await generateQueryEmbedding(query);

    // Retrieve similar chunks from vector store
    const chunks = await vectorStoreService.retrieveSimilarChunks(
      chapterId,
      queryEmbedding,
      topK
    );

    logger.info(`Retrieved ${chunks.length} relevant chunks (top score: ${chunks[0]?.score?.toFixed(4)})`);

    return chunks.map((c) => ({
      text: c.text,
      score: c.score,
      chunkIndex: c.chunkIndex,
      metadata: c.metadata,
    }));
  } catch (error) {
    logger.error(`Retrieval failed: ${error.message}`);
    throw new Error(`Context retrieval failed: ${error.message}`);
  }
};

/**
 * Build a combined context string from retrieved chunks
 * @param {Array<{ text: string }>} chunks
 * @returns {string}
 */
const buildContextFromChunks = (chunks) => {
  return chunks
    .map((chunk, i) => `[Context ${i + 1}]\n${chunk.text}`)
    .join('\n\n---\n\n');
};

module.exports = { retrieveRelevantChunks, buildContextFromChunks };