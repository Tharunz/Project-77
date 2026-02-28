// ============================================
// schemes.routes.js — Government Schemes Endpoints
// GET  /api/schemes
// GET  /api/schemes/recommend
// GET  /api/schemes/eligibility-check
// GET  /api/schemes/time-machine
// POST /api/schemes/benefit-gap
// GET  /api/schemes/:id
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const db = require('../db/database');

// ─── GET /api/schemes ─────────────────────────────────────────────────────────
router.get('/', (req, res, next) => {
    try {
        const { category, state, search, page = 1, limit = 20 } = req.query;
        const db_instance = db.getDb();

        let schemes = db_instance.get('schemes').filter({ isActive: true }).value();

        if (category) schemes = schemes.filter(s => s.category === category);
        if (state && state !== 'All India') {
            schemes = schemes.filter(s => s.state === 'All India' || s.state === state);
        }
        if (search) {
            const q = search.toLowerCase();
            schemes = schemes.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
        }

        const total = schemes.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const data = schemes.slice(start, start + parseInt(limit));

        // Get unique categories for filter options
        const allSchemes = db_instance.get('schemes').value();
        const categories = [...new Set(allSchemes.map(s => s.category))].sort();

        return res.status(200).json({
            success: true,
            data,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
                categories
            },
            message: `Found ${total} scheme(s).`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/schemes/recommend ───────────────────────────────────────────────
// Must be BEFORE /:id to avoid route conflict
router.get('/recommend', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();

        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                message: 'User profile not found.',
                timestamp: new Date().toISOString()
            });
        }

        const { age, income, state, gender } = user;
        const schemes = db_instance.get('schemes').filter({ isActive: true }).value();

        const matched = schemes.filter(s => {
            const eli = s.eligibility;
            if (!eli) return true;

            // Age check
            if (age && eli.minAge !== undefined && age < eli.minAge) return false;
            if (age && eli.maxAge !== undefined && eli.maxAge < 99 && age > eli.maxAge) return false;

            // Income check (0 means no limit)
            if (income && eli.maxIncome && eli.maxIncome > 0 && income > eli.maxIncome) return false;

            // Gender check
            if (gender && eli.gender && eli.gender !== 'all' && eli.gender !== gender) return false;

            // State check
            if (state && s.state !== 'All India' && s.state !== state) return false;

            return true;
        });

        // Add match score
        const scored = matched.map(s => ({
            ...s,
            matchScore: calculateMatchScore(s, user)
        })).sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({
            success: true,
            data: scored,
            message: `Found ${scored.length} scheme(s) matching your profile.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/schemes/eligibility-check ──────────────────────────────────────
router.get('/eligibility-check', (req, res, next) => {
    try {
        const { age, income, state, gender, category } = req.query;
        const db_instance = db.getDb();

        let schemes = db_instance.get('schemes').filter({ isActive: true }).value();
        if (category) schemes = schemes.filter(s => s.category === category);

        const eligible = schemes.filter(s => {
            const eli = s.eligibility;
            if (!eli) return true;
            if (age && eli.minAge && parseInt(age) < eli.minAge) return false;
            if (age && eli.maxAge && eli.maxAge < 99 && parseInt(age) > eli.maxAge) return false;
            if (income && eli.maxIncome && eli.maxIncome > 0 && parseInt(income) > eli.maxIncome) return false;
            if (gender && eli.gender && eli.gender !== 'all' && eli.gender !== gender) return false;
            if (state && s.state !== 'All India' && s.state !== state) return false;
            return true;
        });

        return res.status(200).json({
            success: true,
            data: eligible,
            message: `${eligible.length} scheme(s) you are eligible for.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/schemes/time-machine ───────────────────────────────────────────
router.get('/time-machine', (req, res, next) => {
    try {
        const { year } = req.query;
        const db_instance = db.getDb();
        const schemes = db_instance.get('schemes').value();

        // Filter by year (if provided, show schemes from that era)
        // Historical timeline mapping for Indian govt schemes
        const historicalData = {
            2019: ['SCH-001', 'SCH-006', 'SCH-007', 'SCH-008', 'SCH-010'],
            2020: ['SCH-001', 'SCH-002', 'SCH-003', 'SCH-004', 'SCH-005', 'SCH-006', 'SCH-020'],
            2021: ['SCH-001', 'SCH-002', 'SCH-003', 'SCH-004', 'SCH-005', 'SCH-009', 'SCH-010', 'SCH-012'],
            2022: ['SCH-001', 'SCH-002', 'SCH-003', 'SCH-004', 'SCH-005', 'SCH-009', 'SCH-010', 'SCH-011', 'SCH-012', 'SCH-015', 'SCH-016'],
            2026: schemes.map(s => s.id) // all current year
        };

        const targetYear = parseInt(year) || 2026;
        const closestYear = Object.keys(historicalData).reduce((prev, curr) => {
            return Math.abs(curr - targetYear) < Math.abs(prev - targetYear) ? curr : prev;
        });

        const schemeIds = historicalData[closestYear];
        const filtered = schemes.filter(s => schemeIds.includes(s.id));

        return res.status(200).json({
            success: true,
            data: {
                year: targetYear,
                historicalYear: parseInt(closestYear),
                schemes: filtered,
                total: filtered.length
            },
            message: `Showing ${filtered.length} schemes available circa ${targetYear}.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/schemes/benefit-gap ───────────────────────────────────────────
router.post('/benefit-gap', protect, (req, res, next) => {
    try {
        const { claimedSchemeIds = [] } = req.body;
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();

        const allSchemes = db_instance.get('schemes').filter({ isActive: true }).value();

        // Find eligible but unclaimed schemes
        const eligible = allSchemes.filter(s => {
            const eli = s.eligibility;
            if (!eli) return true;
            if (user?.age && eli.minAge && user.age < eli.minAge) return false;
            if (user?.age && eli.maxAge && eli.maxAge < 99 && user.age > eli.maxAge) return false;
            if (user?.income && eli.maxIncome && eli.maxIncome > 0 && user.income > eli.maxIncome) return false;
            if (user?.gender && eli.gender && eli.gender !== 'all' && eli.gender !== user.gender) return false;
            if (user?.state && s.state !== 'All India' && s.state !== user.state) return false;
            return true;
        });

        const gaps = eligible.filter(s => !claimedSchemeIds.includes(s.id));
        const claimedSchemes = allSchemes.filter(s => claimedSchemeIds.includes(s.id));

        return res.status(200).json({
            success: true,
            data: {
                eligibleCount: eligible.length,
                claimedCount: claimedSchemes.length,
                gapCount: gaps.length,
                claimedSchemes,
                missedBenefits: gaps,
                gapPercentage: eligible.length > 0 ? parseFloat(((gaps.length / eligible.length) * 100).toFixed(1)) : 0
            },
            message: `You are missing out on ${gaps.length} eligible scheme(s).`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/schemes/:id ─────────────────────────────────────────────────────
router.get('/:id', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const scheme = db_instance.get('schemes').find({ id: req.params.id.toUpperCase() }).value();

        if (!scheme) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Scheme not found.',
                timestamp: new Date().toISOString()
            });
        }

        return res.status(200).json({
            success: true,
            data: scheme,
            message: 'Scheme details fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// Utility: Calculate a match score (0-100) for a scheme based on user profile
function calculateMatchScore(scheme, user) {
    let score = 60; // base score
    const eli = scheme.eligibility;
    if (!eli) return score;

    if (user.age && eli.minAge && eli.maxAge) {
        const midAge = (eli.minAge + eli.maxAge) / 2;
        score += Math.max(0, 20 - Math.abs(user.age - midAge));
    }

    if (user.income && eli.maxIncome && eli.maxIncome > 0) {
        const usage = user.income / eli.maxIncome;
        if (usage < 0.5) score += 20;
        else if (usage < 0.8) score += 10;
    }

    if (user.state && scheme.state === user.state) score += 10;
    if (scheme.state === 'All India') score += 5;

    return Math.min(100, Math.round(score));
}

module.exports = router;
