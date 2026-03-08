// ============================================
// verification.service.js — Rekognition Image Verification
// ENABLE_REKOGNITION=false → returns mock verification
// ENABLE_REKOGNITION=true  → Amazon Rekognition DetectLabels
// ============================================

const isRekognition = () => process.env.ENABLE_REKOGNITION === 'true';

// ─── Lazy Rekognition client ───────────────────────────────────────────────────
let _rekognitionClient = null;
const getRekognitionClient = () => {
    if (!_rekognitionClient) {
        const { RekognitionClient } = require('@aws-sdk/client-rekognition');
        const { awsConfig } = require('../config/aws.config');
        _rekognitionClient = new RekognitionClient(awsConfig);
    }
    return _rekognitionClient;
};

// ─── Work type validation rules ───────────────────────────────────────────────
const WORK_RULES = {
    'road-repair': ['road', 'construction', 'asphalt', 'vehicle'],
    'water-supply': ['pipe', 'water', 'tap', 'plumbing', 'tube', 'liquid', 'spout'],
    'school-repair': ['building', 'construction', 'classroom', 'school', 'desk', 'education'],
    'sanitation': ['toilet', 'drainage', 'waste', 'cleaning', 'garbage', 'trash', 'sewage'],
    'electricity': ['wire', 'electric', 'pole', 'cable', 'transformer', 'light', 'lamp']
};

// ─── Mock response ─────────────────────────────────────────────────────────────
const MOCK_RESPONSE = {
    verified: true,
    confidence: 94.5,
    detectedLabels: ["Road", "Construction", "Asphalt", "Workers"],
    verificationScore: 85
};

// =============================================================================
// REKOGNITION IMPLEMENTATION
// =============================================================================

/**
 * verifyWorkPhoto(imageBuffer, workType) — Verify if photo matches requested work type
 * @param {Buffer} imageBuffer - the photo data
 * @param {string} workType - the category of work (e.g., 'road-repair')
 */
const verifyWorkPhoto = async (imageBuffer, workType) => {
    if (!isRekognition()) return MOCK_RESPONSE;

    const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
    const client = getRekognitionClient();

    const expectedLabels = WORK_RULES[workType] || [];
    if (expectedLabels.length === 0) {
        return {
            verified: false,
            confidence: 0,
            detectedLabels: [],
            verificationScore: 0,
            error: `Unknown work verification type: ${workType}`
        };
    }

    try {
        const response = await client.send(new DetectLabelsCommand({
            Image: { Bytes: imageBuffer },
            MaxLabels: 30,
            MinConfidence: 65
        }));

        const labels = (response.Labels || []).map(l => l.Name.toLowerCase());
        const rawLabels = (response.Labels || []).map(l => l.Name);

        // Check if any expected label is in the detected labels
        let matchCount = 0;
        let totalConfidence = 0;

        expectedLabels.forEach(expected => {
            const matchIndex = labels.findIndex(l => l.includes(expected));
            if (matchIndex >= 0) {
                matchCount++;
                totalConfidence += response.Labels[matchIndex].Confidence;
            }
        });

        const verified = matchCount > 0;
        const verificationScore = expectedLabels.length > 0
            ? Math.round((matchCount / Math.min(expectedLabels.length, 3)) * 100)
            : 0;

        const avgConfidence = matchCount > 0 ? (totalConfidence / matchCount) : 0;

        return {
            verified: verified,
            confidence: parseFloat(avgConfidence.toFixed(2)) || parseFloat((response.Labels[0]?.Confidence || 0).toFixed(2)),
            detectedLabels: rawLabels,
            verificationScore: Math.min(100, verificationScore)
        };
    } catch (err) {
        throw new Error('Rekognition verification failed: ' + err.message);
    }
};

module.exports = { verifyWorkPhoto, isRekognition, WORK_RULES };
