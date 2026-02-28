// ============================================
// preseva.routes.js — Predictive Grievance Prevention
// GET  /api/preseva/predictions
// GET  /api/preseva/alerts
// GET  /api/preseva/threat-corridors
// POST /api/preseva/report
// ============================================

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { getPredictions, getAlerts, getThreatCorridors, fileReport } = require('../services/preseva.service');
const db = require('../db/database');

// ─── GET /api/preseva/predictions (admin) ─────────────────────────────────────
router.get('/predictions', protect, adminOnly, (req, res, next) => {
    try {
        const predictions = getPredictions();
        return res.status(200).json({
            success: true,
            data: predictions,
            message: `${predictions.length} predictive pattern(s) detected.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/preseva/alerts ──────────────────────────────────────────────────
router.get('/alerts', protect, (req, res, next) => {
    try {
        const alerts = getAlerts();
        return res.status(200).json({
            success: true,
            data: alerts,
            message: `${alerts.length} active PreSeva alert(s).`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/preseva/threat-corridors ───────────────────────────────────────
router.get('/threat-corridors', protect, adminOnly, (req, res, next) => {
    try {
        const corridors = getThreatCorridors();
        return res.status(200).json({
            success: true,
            data: corridors,
            message: `${corridors.length} threat corridor(s) identified.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/preseva/report ─────────────────────────────────────────────────
router.post('/report', protect, (req, res, next) => {
    try {
        const { state, district, category, description } = req.body;

        if (!state || !category || !description) {
            return res.status(400).json({
                success: false, data: null,
                message: 'State, category, and description are required.',
                timestamp: new Date().toISOString()
            });
        }

        const alert = fileReport({ state, district, category, description }, req.user.id);

        return res.status(201).json({
            success: true,
            data: alert,
            message: 'PreSeva report filed. Our system will monitor this corridor.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── PATCH /api/preseva/alerts/:id/mark-prevented (admin) ────────────────────
router.patch('/alerts/:id/mark-prevented', protect, adminOnly, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const alert = db_instance.get('preSevaAlerts').find({ id: req.params.id }).value();

        if (!alert) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Alert not found.',
                timestamp: new Date().toISOString()
            });
        }

        db_instance.get('preSevaAlerts').find({ id: req.params.id })
            .assign({ status: 'prevented', resolvedAt: new Date().toISOString() })
            .write();

        return res.status(200).json({
            success: true,
            data: db_instance.get('preSevaAlerts').find({ id: req.params.id }).value(),
            message: 'Alert marked as prevented.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
