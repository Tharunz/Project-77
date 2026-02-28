// ============================================
// ocr.service.js — Optical Character Recognition
// → AWS swap: Replace with Amazon Textract SDK
// ============================================

const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Extract text from an image or document file using Tesseract.js.
 * → AWS Textract: textract.detectDocumentText({ Document: { Bytes: buffer } })
 *
 * @param {string} filePath - Absolute or relative path to the image file
 * @returns {Promise<{ text: string, confidence: number, words: Array }>}
 */
const extractText = async (filePath) => {
    try {
        const { data } = await Tesseract.recognize(filePath, 'eng+hin', {
            logger: () => { } // suppress progress logs
        });

        return {
            text: data.text.trim(),
            confidence: parseFloat((data.confidence).toFixed(2)),
            words: (data.words || []).map(w => ({
                text: w.text,
                confidence: parseFloat(w.confidence.toFixed(2))
            })).slice(0, 100) // limit output size
        };
    } catch (err) {
        throw new Error('OCR extraction failed: ' + err.message);
    }
};

module.exports = { extractText };
