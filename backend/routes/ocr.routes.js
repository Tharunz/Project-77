// ============================================
// ocr.routes.js — OCR Document Text Extraction
// POST /api/ocr/extract
// ============================================

const express = require('express');
const router = express.Router();
const path = require('path');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../services/storage.service');
const { extractText } = require('../services/ocr.service');

// ─── POST /api/ocr/extract ────────────────────────────────────────────────────
router.post('/extract', protect, upload.single('document'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false, data: null,
                message: 'Please upload a document file (JPEG, PNG, or PDF).',
                timestamp: new Date().toISOString()
            });
        }

        const filePath = path.resolve(req.file.path || '');
        const result = await extractText(req.file.buffer || filePath);

        return res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename || req.file.originalname,
                originalName: req.file.originalname,
                text: result.text,
                confidence: result.confidence,
                formFields: result.formFields,
                ...result
            },
            message: 'Text extracted successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/ocr/scan — Alias for /extract (used by GhostAudits OCR button) ─
router.post('/scan', protect, upload.single('document'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false, data: null,
                message: 'No file uploaded. Please attach a document image or PDF.',
                timestamp: new Date().toISOString()
            });
        }

        const filePath = req.file.path ? path.resolve(req.file.path) : null;
        const result = await extractText(req.file.buffer || filePath);

        return res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename || req.file.originalname,
                originalName: req.file.originalname,
                text: result.text || result.extractedText || '(No readable text found)',
                confidence: result.confidence || null,
                formFields: result.formFields || {},
                poweredBy: process.env.ENABLE_TEXTRACT === 'true' ? 'Amazon Textract' : 'Local OCR'
            },
            message: 'Document scanned successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
