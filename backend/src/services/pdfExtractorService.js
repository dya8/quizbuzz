const pdfParse = require('pdf-parse');
const fs = require('fs');
const logger = require('../utils/logger');
const runOCR = require("../utils/ocr");

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

    let extractedText = data.text || "";

    logger.info(
      `PDF extracted using pdf-parse. Characters: ${extractedText.length}`
    );

    // If pdf-parse found almost no text,
    // assume it's a scanned PDF.
    if (extractedText.trim().length < 300) {
      logger.info("Scanned PDF detected. Running OCR...");

      extractedText = await runOCR(filePath);

      logger.info(
        `OCR Extraction Complete. Characters: ${extractedText.length}`
      );
    }

    return {
      text: extractedText,
      pageCount: data.numpages,
      info: data.info || {},
    };
  } catch (error) {
  console.log("========== OCR ERROR ==========");
  console.log(error);
  console.log(error.stack);
  console.log("===============================");

  logger.error(error);

  throw error;
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