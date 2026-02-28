// ============================================
// chatbot.routes.js — AI Chatbot Endpoints
// POST   /api/chatbot/message
// GET    /api/chatbot/history/:userId
// DELETE /api/chatbot/history/:userId
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getResponse, getHistory, clearHistory } = require('../services/chatbot.service');

// ─── POST /api/chatbot/message ────────────────────────────────────────────────
router.post('/message', protect, (req, res, next) => {
    try {
        const { message, lang = 'en' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false, data: null,
                message: 'Message is required.',
                timestamp: new Date().toISOString()
            });
        }

        const result = getResponse(message.trim(), lang, req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                response: result.response,
                sessionId: result.sessionId,
                lang,
                userMessage: message.trim()
            },
            message: 'Chatbot response generated.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/chatbot/history/:userId ─────────────────────────────────────────
router.get('/history/:userId', protect, (req, res, next) => {
    try {
        // Users can only see their own history; admins can see anyone's
        if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({
                success: false, data: null,
                message: 'Access denied.',
                timestamp: new Date().toISOString()
            });
        }

        const history = getHistory(req.params.userId);

        return res.status(200).json({
            success: true,
            data: history,
            message: `${history.length} message(s) in chat history.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── DELETE /api/chatbot/history/:userId ──────────────────────────────────────
router.delete('/history/:userId', protect, (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({
                success: false, data: null,
                message: 'Access denied.',
                timestamp: new Date().toISOString()
            });
        }

        clearHistory(req.params.userId);

        return res.status(200).json({
            success: true,
            data: null,
            message: 'Chat history cleared.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
