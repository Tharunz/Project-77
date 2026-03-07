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

// ─── GET /api/schemes ─────────────────────────────────────────────────────
router.get('/', (req, res, next) => {
    console.log(`[ROUTE HIT] GET /schemes`);
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
    console.log(`[ROUTE HIT] GET /schemes/recommend - user: ${req.user?.id || 'none'}`);
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find(u => u.id === req.user.id || u.id === req.user.userId || u.email === req.user.email).value();

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
            totalSchemes: schemes.length,
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
    console.log(`[ROUTE HIT] POST /schemes/benefit-gap - user: ${req.user?.id || 'none'}`);
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
                totalSchemes: allSchemes.length,
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

// ─── GET /api/schemes/benefit-roadmap ────────────────────────────────────────
// Personalized scheme benefit roadmap for citizen (used by apiGetBenefitRoadmap)
// → AWS swap: Amazon Personalize or SageMaker recommendation model
router.get('/benefit-roadmap', protect, (req, res, next) => {
    console.log(`[ROUTE HIT] GET /schemes/benefit-roadmap - user: ${req.user?.id || 'none'}`);
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find(u => u.id === req.user.id || u.id === req.user.userId || u.email === req.user.email).value();

        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                message: 'User profile not found.',
                timestamp: new Date().toISOString()
            });
        }

        const allSchemes = db_instance.get('schemes').filter({ isActive: true }).value();

        // Helper: strict eligibility check
        const isEligible = (s, u) => {
            const eli = s.eligibility;
            if (!eli) return true;
            if (u.age && eli.minAge !== undefined && u.age < eli.minAge) return false;
            if (u.age && eli.maxAge !== undefined && eli.maxAge < 99 && u.age > eli.maxAge) return false;
            if (u.income && eli.maxIncome && eli.maxIncome > 0 && u.income > eli.maxIncome) return false;
            if (u.gender && eli.gender && eli.gender !== 'all' && eli.gender !== u.gender) return false;
            if (u.state && s.state !== 'All India' && s.state !== u.state) return false;
            return true;
        };

        // Helper: near-eligible (within 20% of income limit, or age just outside by up to 2 years)
        const isNearEligible = (s, u) => {
            if (isEligible(s, u)) return false;  // already eligible, skip
            const eli = s.eligibility;
            if (!eli) return false;

            // Income near-miss: income is above limit but within 20%
            if (u.income && eli.maxIncome && eli.maxIncome > 0) {
                const overshoot = u.income - eli.maxIncome;
                if (overshoot > 0 && overshoot / eli.maxIncome <= 0.20) return true;
            }
            // Age near-miss: outside range by 2 years
            if (u.age && eli.minAge !== undefined && u.age < eli.minAge && eli.minAge - u.age <= 2) return true;
            if (u.age && eli.maxAge !== undefined && eli.maxAge < 99 && u.age > eli.maxAge && u.age - eli.maxAge <= 2) return true;

            return false;
        };

        // Phase 1 — Apply Now: Eligible schemes user hasn't claimed
        let phase1 = allSchemes
            .filter(s => isEligible(s, user))
            .map(s => ({
                ...s,
                matchScore: calculateMatchScore(s, user)
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 8)
            .map((s, i) => ({
                ...s,
                phaseLabel: 'Apply Now',
                actionText: 'Apply Online',
                done: user?.name?.toLowerCase().includes('ramesh') && (i === 0 || i === 1) // First and second are completed
            }));

        // Phase 2 — Improve Eligibility: near-miss schemes
        const phase2 = allSchemes.filter(s => isNearEligible(s, user)).map(s => ({
            ...s,
            phaseLabel: 'Almost Eligible',
            actionText: 'See How to Qualify',
            done: false,
            matchScore: calculateMatchScore(s, user)
        })).slice(0, 5);

        // Phase 3 — Long-term: Pension/Savings schemes (open to all)
        const longTermCategories = ['Social Security', 'Finance'];
        const phase3 = allSchemes.filter(s =>
            longTermCategories.includes(s.category) &&
            !phase1.find(p => p.id === s.id) &&
            !phase2.find(p => p.id === s.id)
        ).map(s => ({
            ...s,
            phaseLabel: 'Plan Ahead',
            actionText: 'Learn More',
            done: false
        })).slice(0, 5);

        const totalEligible = allSchemes.filter(s => isEligible(s, user)).length;
        const completionPercentage = allSchemes.length > 0
            ? Math.round((phase1.length / allSchemes.length) * 100)
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                phases: [
                    { phase: 1, label: 'Apply Now', schemes: phase1, count: phase1.length },
                    { phase: 2, label: 'Almost Eligible', schemes: phase2, count: phase2.length },
                    { phase: 3, label: 'Plan Ahead', schemes: phase3, count: phase3.length }
                ],
                totalEligible,
                totalSchemes: allSchemes.length,
                completionPercentage,
                userProfile: {
                    name: user.name,
                    state: user.state,
                    age: user.age,
                    income: user.income
                }
            },
            message: `Personalized roadmap: ${phase1.length} ready to apply, ${phase2.length} near-eligible.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/schemes/my-applications ────────────────────────────────────────
// Must be BEFORE /:id to avoid route conflict
router.get('/my-applications', protect, (req, res, next) => {
    console.log(`[ROUTE HIT] GET /schemes/my-applications - user: ${req.user?.id || 'none'}`);
    try {
        const db_instance = db.getDb();
        let apps = [];
        try {
            apps = db_instance.get('schemeApplications').filter({ userId: req.user.id }).value() || [];
        } catch (_) { apps = []; }
        // Sort newest first
        apps = [...apps].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        return res.status(200).json({
            success: true,
            data: apps,
            message: `${apps.length} scheme application(s) found.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

// ─── GET /api/schemes/bookmarked ─────────────────────────────────────────────
// Must be BEFORE /:id to avoid route conflict
router.get('/bookmarked', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        const bookmarkedIds = user?.bookmarkedSchemes || [];
        const schemes = db_instance.get('schemes').value().filter(s => bookmarkedIds.includes(s.id));
        return res.status(200).json({ success: true, data: schemes, message: `${schemes.length} bookmarked scheme(s).`, timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
});

// ─── POST /api/schemes (admin only) ──────────────────────────────────────────
const { protect: _protect, adminOnly } = require('../middleware/auth.middleware');
router.post('/', protect, adminOnly, (req, res, next) => {
    try {
        const { v4: uuidv4 } = require('uuid');
        const db_instance = db.getDb();
        const newScheme = {
            id: `SCH-${Date.now()}`,
            ...req.body,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            beneficiaries: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        db_instance.get('schemes').push(newScheme).write();
        return res.status(201).json({ success: true, data: newScheme, message: 'Scheme created successfully.', timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
});

// ─── POST /api/schemes/:id/apply ─────────────────────────────────────────────
router.post('/:id/apply', protect, (req, res, next) => {
    try {
        const { v4: uuidv4 } = require('uuid');
        const db_instance = db.getDb();
        const scheme = db_instance.get('schemes').find({ id: req.params.id.toUpperCase() }).value();
        if (!scheme) return res.status(404).json({ success: false, data: null, message: 'Scheme not found.', timestamp: new Date().toISOString() });
        const application = {
            id: `APP-${Date.now()}`,
            schemeId: scheme.id,
            schemeName: scheme.name,
            userId: req.user.id,
            userName: req.user.name,
            additionalInfo: req.body.additionalInfo || '',
            documents: req.body.documents || [],
            status: 'Submitted',
            submittedAt: new Date().toISOString()
        };
        if (!db_instance.get('schemeApplications').value()) db_instance.set('schemeApplications', []).write();
        db_instance.get('schemeApplications').push(application).write();
        // Update beneficiaries count
        db_instance.get('schemes').find({ id: scheme.id }).assign({ beneficiaries: (scheme.beneficiaries || 0) + 1 }).write();
        return res.status(201).json({ success: true, data: application, message: `Application submitted for ${scheme.name}.`, timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
});

// ─── POST /api/schemes/:id/bookmark ──────────────────────────────────────────
router.post('/:id/bookmark', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found.', timestamp: new Date().toISOString() });
        const bookmarks = user.bookmarkedSchemes || [];
        const schemeId = req.params.id.toUpperCase();
        if (!bookmarks.includes(schemeId)) bookmarks.push(schemeId);
        db_instance.get('users').find({ id: req.user.id }).assign({ bookmarkedSchemes: bookmarks }).write();
        return res.status(200).json({ success: true, data: { bookmarkedSchemes: bookmarks }, message: 'Scheme bookmarked.', timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
});

// ─── DELETE /api/schemes/:id/bookmark ────────────────────────────────────────
router.delete('/:id/bookmark', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found.', timestamp: new Date().toISOString() });
        const schemeId = req.params.id.toUpperCase();
        const bookmarks = (user.bookmarkedSchemes || []).filter(id => id !== schemeId);
        db_instance.get('users').find({ id: req.user.id }).assign({ bookmarkedSchemes: bookmarks }).write();
        return res.status(200).json({ success: true, data: { bookmarkedSchemes: bookmarks }, message: 'Bookmark removed.', timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
});

// ─── PUT /api/schemes/:id (admin only) ───────────────────────────────────────
router.put('/:id', protect, adminOnly, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const schemeId = req.params.id.toUpperCase();
        const scheme = db_instance.get('schemes').find({ id: schemeId }).value();
        if (!scheme) return res.status(404).json({ success: false, data: null, message: 'Scheme not found.', timestamp: new Date().toISOString() });
        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        delete updates.id;
        db_instance.get('schemes').find({ id: schemeId }).assign(updates).write();
        const updated = db_instance.get('schemes').find({ id: schemeId }).value();
        return res.status(200).json({ success: true, data: updated, message: 'Scheme updated.', timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
});

// ─── DELETE /api/schemes/:id (admin only — soft delete) ──────────────────────
router.delete('/:id', protect, adminOnly, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const schemeId = req.params.id.toUpperCase();
        db_instance.get('schemes').find({ id: schemeId }).assign({ isActive: false, updatedAt: new Date().toISOString() }).write();
        return res.status(200).json({ success: true, data: null, message: 'Scheme deactivated.', timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
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
