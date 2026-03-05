// ============================================
// escrow.routes.js — NyayKosh Escrow Verification
// POST /api/escrow/verify-completion
// ============================================

const express = require('express');
const router = express.Router();
const { verifyWorkPhoto, isRekognition } = require('../services/verification.service');
const { upload } = require('../services/storage.service');
const db = require('../db/database');

// ─── POST /api/escrow/verify-completion ───────────────────────────────────────
router.post('/verify-completion', upload.single('photo'), async (req, res, next) => {
    try {
        const { grievanceId, workType } = req.body;

        if (!grievanceId || !workType) {
            return res.status(400).json({
                success: false, data: null, message: 'grievanceId and workType are required.'
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false, data: null, message: 'photo file is required.'
            });
        }

        const db_instance = db.getDb();
        const grievance = db_instance.get('grievances').find({ id: grievanceId }).value();

        if (!grievance) {
            return res.status(404).json({
                success: false, data: null, message: 'Grievance not found.'
            });
        }

        const imageBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);

        // Run Rekognition Verification
        const verificationResult = await verifyWorkPhoto(imageBuffer, workType);

        if (verificationResult.verified) {
            // Trigger fund release flow logic here
            greivance = db_instance.get('grievances')
                .find({ id: grievanceId })
                .assign({
                    status: 'Resolved',
                    resolvedAt: new Date().toISOString(),
                    escrowStatus: 'Released',
                    verificationData: verificationResult
                })
                .write();
        }

        res.json({
            success: true,
            data: verificationResult,
            message: verificationResult.verified
                ? 'Work verified successfully. Funds released.'
                : 'Verification failed. Photo does not match work type.',
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
