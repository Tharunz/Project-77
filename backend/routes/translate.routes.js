// ============================================
// translate.routes.js — Multilingual Translation API
// POST /api/translate           — translate text
// GET  /api/translate/languages — supported languages
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { translate, getSupportedLanguages } = require('../services/translate.service');

// ─── GET /api/translate/languages (public) ────────────────────────────────────
// Returns list of 10 supported Indian languages — no auth needed
router.get('/languages', (req, res, next) => {
    try {
        const languages = getSupportedLanguages();
        return res.status(200).json({
            success: true,
            data: languages,
            message: `${languages.length} Indian languages supported.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/translate ──────────────────────────────────────────────────────
// Translates text to target Indian language
// Body: { text: string, targetLang: string }
router.post('/', protect, async (req, res, next) => {
    try {
        const { text, targetLang } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false, data: null,
                message: 'text is required.',
                timestamp: new Date().toISOString()
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false, data: null,
                message: 'targetLang is required (e.g., hi, ta, te, bn, mr, gu, kn, ml, pa).',
                timestamp: new Date().toISOString()
            });
        }

        const result = await translate(text.trim(), targetLang.toLowerCase());

        return res.status(200).json({
            success: true,
            data: {
                originalText: text.trim(),
                translatedText: result.translatedText,
                sourceLang: result.sourceLang,
                targetLang: result.targetLang
            },
            message: 'Text translated successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/translate/batch ────────────────────────────────────────────────
// Translates multiple texts in one request
// Body: { texts: string[], targetLang: string }
router.post('/batch', protect, async (req, res, next) => {
    try {
        const { texts, targetLang } = req.body;

        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                success: false, data: null,
                message: 'texts must be a non-empty array.',
                timestamp: new Date().toISOString()
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false, data: null,
                message: 'targetLang is required.',
                timestamp: new Date().toISOString()
            });
        }

        if (texts.length > 20) {
            return res.status(400).json({
                success: false, data: null,
                message: 'Maximum 20 texts per batch request.',
                timestamp: new Date().toISOString()
            });
        }

        const results = await Promise.all(
            texts.map(async (text) => {
                const result = await translate(text, targetLang.toLowerCase());
                return {
                    originalText: text,
                    translatedText: result.translatedText,
                    targetLang: result.targetLang
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: results,
            message: `${results.length} text(s) translated successfully.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
