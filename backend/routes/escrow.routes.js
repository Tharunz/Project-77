// ============================================
// escrow.routes.js — NyayKosh Escrow API
// POST /api/escrow/verify-completion (Rekognition photo check)
// POST /api/escrow/start             (Start SF workflow)
// POST /api/escrow/officer-complete  (Officer marks done)
// POST /api/escrow/citizen-verify    (Citizen confirms work)
// GET  /api/escrow/status/:executionArn
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { verifyWorkPhoto } = require('../services/verification.service');
const {
    startEscrowWorkflow,
    getWorkflowStatus,
    officerMarkComplete,
    citizenVerifyComplete
} = require('../services/escrow.service');
const { upload } = require('../services/storage.service');
const db = require('../db/database');

const ts = () => new Date().toISOString();

// ─── POST /api/escrow/start ───────────────────────────────────────────────────
router.post('/start', protect, async (req, res, next) => {
    try {
        const { grievanceId, officerId } = req.body;
        if (!grievanceId || !officerId) {
            return res.status(400).json({ success: false, data: null, message: 'grievanceId and officerId are required.', timestamp: ts() });
        }
        const result = await startEscrowWorkflow(grievanceId, officerId);
        res.status(201).json({ success: true, data: result, message: 'Escrow workflow started.', timestamp: ts() });
    } catch (err) { next(err); }
});

// ─── POST /api/escrow/officer-complete ────────────────────────────────────────
router.post('/officer-complete', protect, async (req, res, next) => {
    try {
        const { grievanceId, executionArn } = req.body;
        if (!grievanceId) {
            return res.status(400).json({ success: false, data: null, message: 'grievanceId required.', timestamp: ts() });
        }
        const result = await officerMarkComplete(grievanceId, executionArn);
        res.json({ success: true, data: result, message: 'Officer marked work as complete. Awaiting citizen verification.', timestamp: ts() });
    } catch (err) { next(err); }
});

// ─── POST /api/escrow/citizen-verify ─────────────────────────────────────────
router.post('/citizen-verify', protect, async (req, res, next) => {
    try {
        const { grievanceId, executionArn, verified } = req.body;
        if (!grievanceId || verified === undefined) {
            return res.status(400).json({ success: false, data: null, message: 'grievanceId and verified (boolean) required.', timestamp: ts() });
        }
        const result = await citizenVerifyComplete(grievanceId, executionArn, Boolean(verified));
        res.json({
            success: true,
            data: result,
            message: verified ? 'Work verified. Funds released.' : 'Work disputed. Escalated to senior officer.',
            timestamp: ts()
        });
    } catch (err) { next(err); }
});

// ─── GET /api/escrow/status/:executionArn ─────────────────────────────────────
router.get('/status/:executionArn', protect, async (req, res, next) => {
    try {
        const executionArn = decodeURIComponent(req.params.executionArn);
        const result = await getWorkflowStatus(executionArn);
        res.json({ success: true, data: result, message: 'Workflow status retrieved.', timestamp: ts() });
    } catch (err) { next(err); }
});

// ─── POST /api/escrow/verify-completion (Rekognition photo check) ─────────────
router.post('/verify-completion', upload.single('photo'), async (req, res, next) => {
    try {
        const { grievanceId, workType } = req.body;
        if (!grievanceId || !workType) {
            return res.status(400).json({ success: false, data: null, message: 'grievanceId and workType required.', timestamp: ts() });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, data: null, message: 'photo file required.', timestamp: ts() });
        }

        const db_instance = db.getDb();
        const grievance = db_instance.get('grievances').find({ id: grievanceId }).value();
        if (!grievance) {
            return res.status(404).json({ success: false, data: null, message: 'Grievance not found.', timestamp: ts() });
        }

        const imageBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);
        const verificationResult = await verifyWorkPhoto(imageBuffer, workType);

        if (verificationResult.verified) {
            db_instance.get('grievances').find({ id: grievanceId }).assign({
                status: 'Resolved',
                resolvedAt: ts(),
                escrowStatus: 'Released',
                verificationData: verificationResult
            }).write();
        }

        res.json({
            success: true,
            data: verificationResult,
            message: verificationResult.verified ? 'Work verified. Funds released.' : 'Verification failed.',
            timestamp: ts()
        });
    } catch (err) { next(err); }
});

module.exports = router;
