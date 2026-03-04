// ============================================
// citizen.routes.js — Citizen Specific Endpoints (Group 4)
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const db = require('../db/database');

router.use(protect); // All citizen routes require login

// ─── 31. CI Score (Civic Intelligence Score) calculation ──────────────────────
router.get('/score', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const userId = req.user.id;

        // Base score
        let score = 50;

        // Add points for grievances
        const grievances = db_instance.get('grievances').filter({ userId }).value() || [];
        const resolvedGrievances = grievances.filter(g => g.status === 'Resolved');
        score += grievances.length * 10;
        score += resolvedGrievances.length * 5; // bonus for resolved

        // Mock points for community/petitions if they exist in DB
        const petitions = db_instance.get('petitions')?.value() || [];
        const signed = petitions.filter(p => p.signatures && p.signatures.includes(userId));
        score += signed.length * 5;

        // Scheme matches add engagement points
        const user = db_instance.get('users').find({ id: userId }).value();
        const schemesMatched = (user?.bookmarkedSchemes || []).length;
        score += schemesMatched * 3;

        // Define level
        let level = 'Beginner';
        if (score >= 200) level = 'CI Champion';
        else if (score >= 100) level = 'Active Citizen';
        else if (score >= 70) level = 'Aware Citizen';

        return res.status(200).json({
            success: true,
            data: {
                ciScore: score,
                janShaktiScore: score, // backward compat
                level,
                breakdown: {
                    base: 50,
                    grievances: grievances.length * 10,
                    resolved: resolvedGrievances.length * 5,
                    communityParticipation: signed.length * 5,
                    schemesEngaged: schemesMatched * 3
                }
            },
            message: "CI Score (Civic Intelligence Score) calculated successfully.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── 32. Seva Mirror citizen footprint API ────────────────────────────────────
router.get('/footprint', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const userId = req.user.id;

        const user = db_instance.get('users').find({ id: userId }).value();
        const grievances = db_instance.get('grievances').filter({ userId }).value() || [];

        let footprint = [];

        if (user) {
            footprint.push({
                id: 'evt_acc_create',
                type: 'account_created',
                title: 'Joined Project NCIE',
                description: `Registered as a citizen from ${user.state || 'India'}`,
                date: user.createdAt || "2026-01-01T10:00:00Z"
            });
        }

        grievances.forEach(g => {
            footprint.push({
                id: `evt_grv_${g.id}`,
                type: 'grievance_filed',
                title: `Filed Grievance: ${g.title}`,
                description: `Category: ${g.category}, Status: ${g.status}`,
                date: g.createdAt
            });
            if (g.status === 'Resolved' && g.updatedAt) {
                footprint.push({
                    id: `evt_grv_res_${g.id}`,
                    type: 'grievance_resolved',
                    title: `Grievance Resolved: ${g.title}`,
                    description: 'Your issue was successfully addressed by government officials',
                    date: g.updatedAt
                });
            }
        });

        // Sort by date descending
        footprint.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            success: true,
            data: {
                totalInteractions: footprint.length,
                timeline: footprint
            },
            message: "Citizen footprint (Seva Mirror) generated.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── 33. Predict My Future AI planning API ────────────────────────────────────
router.get('/predict-future', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const userId = req.user.id;
        const user = db_instance.get('users').find({ id: userId }).value();

        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "User not found",
                timestamp: new Date().toISOString()
            });
        }

        const age = user.age || 30;

        let predictions = [];

        if (age < 25) {
            predictions = [
                { timeframe: "1 Year", prediction: "Likely to apply for Higher Education Scholarships.", confidence: "88%", category: "Education" },
                { timeframe: "3 Years", prediction: "May need Skill Development Grants for employment.", confidence: "75%", category: "Employment" },
                { timeframe: "5 Years", prediction: "Potential candidate for First-Time Homebuyer subsidies.", confidence: "60%", category: "Housing" }
            ];
        } else if (age < 50) {
            predictions = [
                { timeframe: "1 Year", prediction: "Likely to seek MSME Business Expansion Schemes.", confidence: "82%", category: "Business" },
                { timeframe: "3 Years", prediction: "May benefit from Family Healthcare Upgrades.", confidence: "79%", category: "Healthcare" },
                { timeframe: "10 Years", prediction: "Will reach eligibility for Senior Pension planning.", confidence: "95%", category: "Pension" }
            ];
        } else {
            predictions = [
                { timeframe: "1 Year", prediction: "Eligible for Senior Citizen Healthcare subsidies soon.", confidence: "92%", category: "Healthcare" },
                { timeframe: "3 Years", prediction: "Likely to require Pension Disbursement schemes.", confidence: "89%", category: "Pension" }
            ];
        }

        const aiSummary = `Based on your profile (Age: ${age}, State: ${user.state || 'N/A'}), the AI system forecasts key life events where government schemes can support you proactively.`;

        return res.status(200).json({
            success: true,
            data: {
                summary: aiSummary,
                forecasts: predictions
            },
            message: "Future blueprint generated by Predict My Future AI.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── Feature 19: Seva News API ────────────────────────────────────────────────
router.get('/news', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const news = db_instance.get('sevaNews').value() || [];

        return res.status(200).json({
            success: true,
            data: news,
            message: "Seva News fetched successfully.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── Feature 27 & 20: Digital Budget Escrow APIs ──────────────────────────────
router.get('/escrow', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const escrowProjects = db_instance.get('escrowProjects').value() || [];

        return res.status(200).json({
            success: true,
            data: escrowProjects,
            message: "Escrow projects fetched successfully.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

router.post('/escrow/:id/verify', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const projectId = req.params.id;
        const { rating, photo } = req.body;

        const project = db_instance.get('escrowProjects').find({ id: projectId }).value();

        if (!project) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Escrow project not found.",
                timestamp: new Date().toISOString()
            });
        }

        db_instance.get('escrowProjects').find({ id: projectId }).assign({
            status: 'Disbursed (Verified by Citizens)',
            citizenVerified: true,
            rating: rating || 5,
            verificationPhoto: photo || project.verificationPhoto,
            disbursedAmount: project.lockedAmount,
            lockedAmount: 0
        }).write();

        return res.status(200).json({
            success: true,
            data: db_instance.get('escrowProjects').find({ id: projectId }).value(),
            message: "Escrow project verified successfully.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
