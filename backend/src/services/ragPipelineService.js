const { extractTextFromPDF, cleanExtractedText } = require('./pdfExtractorService');
const { chunkText, addMetadataToChunks } = require('./textChunkService');
const { generateEmbeddingsForChunks } = require('./embeddingService');
const vectorStoreService = require('./vectorStoreService');
const Chapter = require('../models/Chapter');
const logger = require('../utils/logger');

const runRAGPipeline = async (chapterId, pdfPath) => {
  logger.info(`RAG pipeline started for chapter: ${chapterId}`);

  try {
    // Stage 1 - Extract
    await Chapter.findByIdAndUpdate(chapterId, {
      processingStatus: 'extracting',
      processingError: null,
    });

    const { text: rawText, pageCount } = await extractTextFromPDF(pdfPath);

    logger.info(`Raw text length: ${rawText?.length || 0}`);

    const cleanedText = cleanExtractedText(rawText);

    logger.info(`Cleaned text length: ${cleanedText?.length || 0}`);

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error(
        'Extracted text is too short or empty. PDF may be scanned/image-based.'
      );
    }

    await Chapter.findByIdAndUpdate(chapterId, {
      extractedText: cleanedText,
      pageCount,
      processingStatus: 'chunking',
    });

    logger.info('Stage 1 (extraction) complete. Starting chunking...');

    // ── Stage 2: Chunk Text ──────────────────────────────────────────────────
    logger.info('========== STAGE 2: CHUNKING START ==========');

    const chapter = await Chapter.findById(chapterId).select('title subject');

    if (!chapter) {
      throw new Error('Chapter not found during chunking stage');
    }

    logger.info(`Chapter loaded: "${chapter.title}"`);
    logger.info(`Processing ${cleanedText.length} characters of text`);

    const rawChunks = chunkText(cleanedText);
    logger.info(`chunkText() returned ${rawChunks.length} chunks`);

    if (rawChunks.length === 0) {
      throw new Error(
        `No chunks generated from ${cleanedText.length} characters. Text may be too short or lack sentence boundaries.`
      );
    }

    const chunks = addMetadataToChunks(rawChunks, {
      chapterId,
      chapterTitle: chapter.title,
      subject: chapter.subject || '',
    });

    logger.info(`Metadata added. Ready to generate ${chunks.length} embeddings`);

    // Update status before embedding generation
    await Chapter.findByIdAndUpdate(chapterId, {
      processingStatus: 'embedding',
      totalChunks: chunks.length,
    });

    logger.info('========== STAGE 2: CHUNKING COMPLETE ==========');

    // ── Stage 3: Generate Embeddings ─────────────────────────────────────────
    logger.info('========== STAGE 3: EMBEDDING START ==========');

    let embeddedChunks;
    try {
      embeddedChunks = await generateEmbeddingsForChunks(chunks);
    } catch (embeddingError) {
      logger.error(`Embedding generation failed: ${embeddingError.message}`);
      throw new Error(`Embedding generation failed: ${embeddingError.message}`);
    }

    if (!embeddedChunks || embeddedChunks.length === 0) {
      throw new Error(
        `Embedding generation returned no results. Generated ${embeddedChunks?.length || 0} embeddings.`
      );
    }

    logger.info(`Generated embeddings for ${embeddedChunks.length} chunks`);
    logger.info('========== STAGE 3: EMBEDDING COMPLETE ==========');

    // ── Stage 4: Store Embeddings ────────────────────────────────────────────
    logger.info('========== STAGE 4: VECTOR STORAGE START ==========');

    try {
      await vectorStoreService.storeEmbeddings(
        chapterId.toString(),
        embeddedChunks
      );
    } catch (storageError) {
      logger.error(`Vector storage failed: ${storageError.message}`);
      throw new Error(`Failed to store embeddings: ${storageError.message}`);
    }

    logger.info(`Stored ${embeddedChunks.length} embeddings in vector database`);

    // Mark as ready
    await Chapter.findByIdAndUpdate(chapterId, {
      processingStatus: 'ready',
      embeddingsStored: true,
    });

    logger.info('========== STAGE 4: VECTOR STORAGE COMPLETE ==========');
    logger.info(`✓ RAG PIPELINE COMPLETE for chapter: ${chapterId}`);
  } catch (error) {
    logger.error(`✗ RAG PIPELINE FAILED for chapter ${chapterId}`);
    logger.error(`Error: ${error.message}`);
    logger.error(error.stack);

    try {
      await Chapter.findByIdAndUpdate(chapterId, {
        processingStatus: 'failed',
        processingError: error.message,
      });
    } catch (updateError) {
      logger.error(
        `Failed to update chapter status to 'failed': ${updateError.message}`
      );
    }
  }
};

module.exports = { runRAGPipeline };