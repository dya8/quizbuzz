const { pipeline } = require('@xenova/transformers');
const logger = require('../utils/logger');

let extractor = null;

/**
 * Load embedding model once
 */
const getExtractor = async () => {
  if (!extractor) {
    logger.info('Loading MiniLM embedding model...');
    
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    logger.info('MiniLM model loaded successfully');
  }

  return extractor;
};

/**
 * Generate embedding for a single text
 */
const generateEmbedding = async (text) => {
  try {
    const model = await getExtractor();

    const output = await model(text, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data);
  } catch (error) {
    logger.error(`Embedding generation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Generate embeddings for chunks
 */
const generateEmbeddingsForChunks = async (chunks) => {
  const results = [];

  logger.info(
    `Generating embeddings for ${chunks.length} chunks`
  );

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text);

    results.push({
      chunkIndex: chunk.index,
      text: chunk.text,
      embedding,
      metadata: chunk.metadata || {},
    });
  }

  logger.info(
    `Generated ${results.length} embeddings successfully`
  );

  return results;
};

/**
 * Query embedding
 */
const generateQueryEmbedding = async (query) => {
  return await generateEmbedding(query);
};

module.exports = {
  generateEmbedding,
  generateEmbeddingsForChunks,
  generateQueryEmbedding,
};