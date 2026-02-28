// ============================================
// admin.routes.js — Admin Dashboard Endpoints
// All routes require protect + adminOnly
// ============================================

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
    getDashboardStats, getHeatmapData, getMonthlyTrend,
    getCategoryBreakdown, getSentimentTrend, getStateAnalytics, getSLAData
} = require('../services/analytics.service');
const db = require('../db/database');

// Apply auth to all admin routes
router.use(protect, adminOnly);

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', (req, res, next) => {
    try {
        const stats = getDashboardStats();
        const heatmap = getHeatmapData().slice(0, 5); // top 5 states
        const trend = getMonthlyTrend().slice(-6); // last 6 months
        const categories = getCategoryBreakdown().slice(0, 8);

        // Recent activity feed
        const db_instance = db.getDb();
        const recentGrievances = db_instance.get('grievances').value()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(g => ({
                id: g.id,
                title: g.title,
                citizenName: g.citizenName,
                status: g.status,
                priority: g.priority,
                sentiment: g.sentiment,
                state: g.state,
                createdAt: g.createdAt
            }));

        return res.status(200).json({
            success: true,
            data: { stats, heatmapTop5: heatmap, monthlyTrend: trend, categoryBreakdown: categories, recentActivity: recentGrievances },
            message: 'Admin dashboard data fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
router.get('/analytics', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                monthlyTrend: getMonthlyTrend(),
                categoryBreakdown: getCategoryBreakdown(),
                sentimentTrend: getSentimentTrend(),
                stateAnalytics: getStateAnalytics()
            },
            message: 'Analytics data fetched successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/heatmap ───────────────────────────────────────────────────
router.get('/heatmap', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getHeatmapData(),
            message: 'Heatmap data fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/officers ──────────────────────────────────────────────────
router.get('/officers', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const officers = db_instance.get('users').filter({ role: 'officer' }).value()
            .map(o => {
                const { password: _, ...rest } = o;
                return rest;
            });

        return res.status(200).json({
            success: true,
            data: officers,
            message: `${officers.length} officer(s) fetched.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── PATCH /api/admin/officers/:id ───────────────────────────────────────────
router.patch('/officers/:id', (req, res, next) => {
    try {
        const { department, state, isBreachingSLA, slaCompliance } = req.body;
        const db_instance = db.getDb();

        const officer = db_instance.get('users').find({ id: req.params.id, role: 'officer' }).value();
        if (!officer) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Officer not found.',
                timestamp: new Date().toISOString()
            });
        }

        const updates = {
            ...(department && { department }),
            ...(state && { state }),
            ...(isBreachingSLA !== undefined && { isBreachingSLA }),
            ...(slaCompliance !== undefined && { slaCompliance }),
            updatedAt: new Date().toISOString()
        };

        db_instance.get('users').find({ id: req.params.id }).assign(updates).write();
        const updated = db_instance.get('users').find({ id: req.params.id }).value();
        const { password: _, ...rest } = updated;

        return res.status(200).json({
            success: true,
            data: rest,
            message: 'Officer updated successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/grievances ────────────────────────────────────────────────
router.get('/grievances', (req, res, next) => {
    try {
        const { status, priority, category, state, page = 1, limit = 20 } = req.query;
        const db_instance = db.getDb();
        let grievances = db_instance.get('grievances').value();

        if (status) grievances = grievances.filter(g => g.status === status);
        if (priority) grievances = grievances.filter(g => g.priority === priority);
        if (category) grievances = grievances.filter(g => g.category === category);
        if (state) grievances = grievances.filter(g => g.state === state);

        grievances.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const total = grievances.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const data = grievances.slice(start, start + parseInt(limit));

        return res.status(200).json({
            success: true,
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
            message: `${total} grievance(s) found.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/sla-tracker ──────────────────────────────────────────────
router.get('/sla-tracker', (req, res, next) => {
    try {
        const officers = getSLAData();
        const breaching = officers.filter(o => o.isBreachingSLA);
        const compliant = officers.filter(o => !o.isBreachingSLA);

        return res.status(200).json({
            success: true,
            data: {
                officers: officers.map(o => {
                    const { password: _, ...rest } = o;
                    return rest;
                }),
                summary: {
                    total: officers.length,
                    breaching: breaching.length,
                    compliant: compliant.length,
                    avgCompliance: parseFloat((officers.reduce((s, o) => s + (o.slaCompliance || 90), 0) / officers.length).toFixed(1))
                }
            },
            message: 'SLA tracker data fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/fraud-alerts ─────────────────────────────────────────────
router.get('/fraud-alerts', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const fraudulent = db_instance.get('grievances')
            .filter(g => g.fraudScore > 0.5 || g.isDuplicate)
            .value()
            .map(g => ({
                ...g,
                flagReason: g.isDuplicate ? 'Duplicate submission detected' : 'High fraud probability score',
                similarGrievanceCount: g.isDuplicate ? 2 : 1
            }));

        return res.status(200).json({
            success: true,
            data: fraudulent,
            message: `${fraudulent.length} suspicious grievance(s) flagged.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
