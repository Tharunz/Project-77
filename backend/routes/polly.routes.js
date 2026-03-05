// ============================================
// polly.routes.js — Text-to-Speech API
// POST /api/polly/speak
// GET  /api/polly/voices
// ============================================

const express = require('express');
const router = express.Router();
const { textToSpeech, isPolly, VOICES } = require('../services/polly.service');

// ─── POST /api/polly/speak ────────────────────────────────────────────────────
router.post('/speak', async (req, res, next) => {
    try {
        const { text, language = 'en' } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Text is required.',
                timestamp: new Date().toISOString()
            });
        }

        if (!isPolly()) {
            return res.status(503).json({
                success: false,
                data: null,
                message: 'Polly text-to-speech is currently disabled. Set ENABLE_POLLY=true.',
                timestamp: new Date().toISOString()
            });
        }

        const audioBuffer = await textToSpeech(text, language);

        // Return raw MP3 stream
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'no-cache'
        });
        res.send(audioBuffer);

    } catch (err) {
        next(err);
    }
});

// ─── GET /api/polly/voices ────────────────────────────────────────────────────
router.get('/voices', (req, res) => {
    res.json({
        success: true,
        data: VOICES,
        message: 'Available Polly voices for Indian languages.',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
