const pdfParse = require('pdf-parse');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * PDF Extractor Service
 * Extracts raw text from uploaded PDF files using pdf-parse
 */

/**
 * Extract text and metadata from a PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {{ text: string, pageCount: number, info: object }}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found at path: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    logger.info(`PDF extracted: ${filePath} | Pages: ${data.numpages} | Chars: ${data.text.length}`);

    return {
      text: data.text,
      pageCount: data.numpages,
      info: data.info || {},
    };
  } catch (error) {
    logger.error(`PDF extraction failed for ${filePath}: ${error.message}`);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
};

/**
 * Clean extracted raw text
 * - Remove excessive whitespace
 * - Normalize newlines
 * - Remove non-printable characters
 * @param {string} rawText
 * @returns {string} cleanedText
 */
const cleanExtractedText = (rawText) => {
  if (!rawText) return '';

  return rawText
    .replace(/\r\n/g, '\n')              // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/[^\S\n]+/g, ' ')           // Collapse whitespace (preserve newlines)
    .replace(/\n{3,}/g, '\n\n')          // Max 2 consecutive newlines
    .replace(/[^\x20-\x7E\n]/g, ' ')     // Remove non-printable ASCII chars
    .trim();
};

module.exports = { extractTextFromPDF, cleanExtractedText };