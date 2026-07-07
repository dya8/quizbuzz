const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Vector Store Service
 * Abstraction layer supporting FAISS (current) and Pinecone (future migration)
 *
 * FAISS stores are saved per-chapter as JSON index files in:
 *   faiss_index/<chapterId>/index.json
 *
 * Each entry: { chunkIndex, text, embedding: number[], metadata }
 *
 * Migration to Pinecone: swap the provider in getVectorStore()
 */

const FAISS_DIR = path.join(process.cwd(), 'faiss_index');

// ─── Ensure FAISS directory exists ────────────────────────────────────────────
if (!fs.existsSync(FAISS_DIR)) {
  fs.mkdirSync(FAISS_DIR, { recursive: true });
}

// ─── FAISS Provider (file-based JSON store) ───────────────────────────────────
const faissProvider = {
  /**
   * Store embeddings for a chapter
   */
  storeEmbeddings: async (chapterId, embeddedChunks) => {
    try {
      if (!embeddedChunks || embeddedChunks.length === 0) {
        throw new Error('No embeddings provided to store');
      }

      const chapterDir = path.join(FAISS_DIR, chapterId.toString());
      if (!fs.existsSync(chapterDir)) {
        fs.mkdirSync(chapterDir, { recursive: true });
      }

      const indexPath = path.join(chapterDir, 'index.json');
      const indexData = {
        chapterId,
        totalChunks: embeddedChunks.length,
        dimension: embeddedChunks[0]?.embedding?.length || 768,
        createdAt: new Date().toISOString(),
        chunks: embeddedChunks,
      };

      // Validate structure before writing
      if (embeddedChunks[0]?.embedding?.length === 0) {
        throw new Error('Embeddings have no dimensions (empty vectors)');
      }

      fs.writeFileSync(indexPath, JSON.stringify(indexData));
      logger.info(`FAISS index saved: ${indexPath} (${embeddedChunks.length} vectors, ${indexData.dimension} dimensions)`);
      return true;
    } catch (error) {
      logger.error(`FAISS store error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Retrieve top-K similar chunks using cosine similarity
   */
  retrieveSimilarChunks: async (chapterId, queryEmbedding, topK = 5) => {
    const indexPath = path.join(FAISS_DIR, chapterId.toString(), 'index.json');

    if (!fs.existsSync(indexPath)) {
      logger.warn(`No FAISS index found for chapter: ${chapterId}`);
      return [];
    }

    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const chunks = indexData.chunks;

    // Compute cosine similarity for each chunk
    const scored = chunks.map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score descending and return top K
    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, topK);

    logger.info(`Retrieved ${topChunks.length} chunks for chapter ${chapterId}`);
    return topChunks;
  },

  /**
   * Delete embeddings index for a chapter
   */
  deleteEmbeddings: async (chapterId) => {
    const chapterDir = path.join(FAISS_DIR, chapterId.toString());
    if (fs.existsSync(chapterDir)) {
      fs.rmSync(chapterDir, { recursive: true, force: true });
      logger.info(`FAISS index deleted for chapter: ${chapterId}`);
    }
    return true;
  },

  /**
   * Check if index exists for chapter
   */
  hasIndex: (chapterId) => {
    const indexPath = path.join(FAISS_DIR, chapterId.toString(), 'index.json');
    return fs.existsSync(indexPath);
  },
};

// ─── Pinecone Provider (stub — for future migration) ──────────────────────────
const pineconeProvider = {
  storeEmbeddings: async (chapterId, embeddedChunks) => {
    // TODO: Implement Pinecone upsert
    // const { Pinecone } = require('@pinecone-database/pinecone');
    // const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    // const index = pc.index(process.env.PINECONE_INDEX_NAME);
    // const vectors = embeddedChunks.map(c => ({
    //   id: `${chapterId}_${c.chunkIndex}`,
    //   values: c.embedding,
    //   metadata: { chapterId, text: c.text, ...c.metadata }
    // }));
    // await index.upsert(vectors);
    throw new Error('Pinecone provider not yet configured. Use FAISS.');
  },

  retrieveSimilarChunks: async (chapterId, queryEmbedding, topK = 5) => {
    // TODO: Implement Pinecone query with metadata filter
    throw new Error('Pinecone provider not yet configured. Use FAISS.');
  },

  deleteEmbeddings: async (chapterId) => {
    // TODO: Pinecone delete by namespace/filter
    throw new Error('Pinecone provider not yet configured. Use FAISS.');
  },
};

// ─── Active Provider Selection ────────────────────────────────────────────────
const getProvider = () => {
  const provider = process.env.VECTOR_DB_PROVIDER || 'faiss';
  if (provider === 'pinecone') return pineconeProvider;
  return faissProvider;
};

// ─── Cosine Similarity ────────────────────────────────────────────────────────
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

// ─── Public API ───────────────────────────────────────────────────────────────
module.exports = {
  storeEmbeddings: (chapterId, embeddedChunks) =>
    getProvider().storeEmbeddings(chapterId, embeddedChunks),

  retrieveSimilarChunks: (chapterId, queryEmbedding, topK) =>
    getProvider().retrieveSimilarChunks(chapterId, queryEmbedding, topK),

  deleteEmbeddings: (chapterId) =>
    getProvider().deleteEmbeddings(chapterId),

  hasIndex: (chapterId) => faissProvider.hasIndex(chapterId),
};