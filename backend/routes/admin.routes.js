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
        const stats = getDashboardStats();
        const heatmap = getHeatmapData();
        const grievances = db.getDb().get('grievances').value()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20);

        // Map service stats to frontend expected format
        const kpis = {
            totalGrievances: stats.totalGrievances || 0,
            resolved: stats.resolvedGrievances || 0,
            pending: stats.pendingGrievances || 0,
            critical: stats.criticalGrievances || 0,
            inProgress: stats.inProgressGrievances || 0,
            avgResponseTime: stats.avgResolutionDays || 4.2,
            resolutionRate: stats.resolutionRate || 0,
            schemesAvailable: stats.activeSchemes || 12,
            statesCovered: 28,
            languagesSupported: 22,
            trend: {
                total: "+12%",
                resolved: "+8%",
                pending: "-5%",
                critical: "+2%",
                inProgress: "+15%"
            }
        };

        const activityFeed = grievances.map(g => ({
            id: g.id,
            type: g.status === 'Resolved' ? 'resolved' : g.priority === 'Critical' ? 'critical' : 'new',
            message: `${g.status} grievance in ${g.state} — ${g.title}`,
            time: g.createdAt,
            state: g.state.substring(0, 2).toUpperCase()
        }));

        const topStates = heatmap.slice(0, 5).map(s => ({
            state: s.state,
            count: s.count,
            pct: Math.round((s.count / (stats.totalGrievances || 1)) * 100)
        }));

        return res.status(200).json({
            success: true,
            data: {
                kpis,
                monthlyTrend: getMonthlyTrend().slice(-7),
                categoryBreakdown: getCategoryBreakdown().slice(0, 8),
                sentimentTrend: getSentimentTrend(),
                stateAnalytics: getStateAnalytics(),
                activityFeed,
                topStates
            },
            message: 'Complete analytics data fetched for dashboard.',
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

// ─── GET /api/admin/officers/wall ───────────────────────────────────────────────
// Feature #34 — Officer Accountability Wall API
router.get('/officers/wall', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const officers = db_instance.get('users').filter({ role: 'officer' }).value() || [];

        const scored = officers.map(o => {
            const { password: _, ...rest } = o;
            const slaPoint = (o.slaCompliance || 0) * 0.40;
            const satisfyPoint = ((o.satisfactionScore || 0) / 5) * 100 * 0.30;
            const casePoint = Math.min((o.casesHandled || 0) / 300, 1) * 100 * 0.20;
            const speedPoint = Math.max(0, (14 - (o.avgResolutionDays || 14)) / 14) * 100 * 0.10;
            const compositeScore = Math.round(slaPoint + satisfyPoint + casePoint + speedPoint);
            return { ...rest, compositeScore, breaches: o.breaches || 0 };
        }).sort((a, b) => b.compositeScore - a.compositeScore);

        // Top 3 performers (Hall of Fame)
        const hallOfFame = scored.slice(0, 3);

        // Bottom performers with high breaches / low SLA (Wall of Accountability)
        const accountabilityWatchlist = scored
            .filter(o => o.isBreachingSLA || o.slaCompliance < 70 || o.breaches > 3)
            .sort((a, b) => b.breaches - a.breaches || a.slaCompliance - b.slaCompliance);

        return res.status(200).json({
            success: true,
            data: {
                hallOfFame,
                accountabilityWatchlist,
                metrics: {
                    totalOfficers: scored.length,
                    watchlisted: accountabilityWatchlist.length,
                    topPerformers: hallOfFame.length
                }
            },
            message: "Officer accountability wall data fetched.",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/admin/officers/leaderboard ────────────────────────────────────
// Feature #17 — Officer Leaderboard API
// Must be BEFORE /officers and /officers/:id to avoid route conflict
router.get('/officers/leaderboard', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const officers = db_instance.get('users').filter({ role: 'officer' }).value();

        // Composite score (0–100) per officer
        // 40% SLA compliance + 30% satisfaction + 20% volume + 10% speed bonus
        const scored = officers.map(o => {
            const { password: _, ...rest } = o;
            const slaPoint = (o.slaCompliance || 0) * 0.40;
            const satisfyPoint = ((o.satisfactionScore || 0) / 5) * 100 * 0.30;
            const casePoint = Math.min((o.casesHandled || 0) / 300, 1) * 100 * 0.20;
            const speedPoint = Math.max(0, (14 - (o.avgResolutionDays || 14)) / 14) * 100 * 0.10;
            const compositeScore = Math.round(slaPoint + satisfyPoint + casePoint + speedPoint);

            let badge = 'Standard';
            if (compositeScore >= 85) badge = 'Gold';
            else if (compositeScore >= 70) badge = 'Silver';
            else if (compositeScore >= 55) badge = 'Bronze';
            else if (o.isBreachingSLA) badge = 'Warning';

            return { ...rest, compositeScore, badge, breaches: o.breaches || 0, rank: 0 };
        }).sort((a, b) => b.compositeScore - a.compositeScore)
            .map((o, i) => ({ ...o, rank: i + 1 }));

        const topPerformer = scored[0] || null;
        const needsAttention = scored.filter(o => o.isBreachingSLA || o.badge === 'Warning');

        return res.status(200).json({
            success: true,
            data: {
                leaderboard: scored,
                topPerformer,
                needsAttention,
                summary: {
                    total: scored.length,
                    gold: scored.filter(o => o.badge === 'Gold').length,
                    silver: scored.filter(o => o.badge === 'Silver').length,
                    bronze: scored.filter(o => o.badge === 'Bronze').length,
                    warning: scored.filter(o => o.badge === 'Warning').length,
                    avgCompositeScore: parseFloat(
                        (scored.reduce((s, o) => s + o.compositeScore, 0) / (scored.length || 1)).toFixed(1)
                    )
                }
            },
            message: `Officer leaderboard — ${scored.length} officers ranked.`,
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

// ─── GET /api/admin/activity-feed ─────────────────────────────────────────────
router.get('/activity-feed', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const recentGrievances = db_instance.get('grievances').value()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20)
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
            data: recentGrievances,
            message: 'Activity feed fetched.',
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

// ─── PATCH /api/admin/fraud-alerts/:id/review ────────────────────────────────
router.patch('/fraud-alerts/:id/review', (req, res, next) => {
    try {
        const { action } = req.body; // 'confirm' | 'dismiss'
        if (!['confirm', 'dismiss'].includes(action)) {
            return res.status(400).json({
                success: false, data: null,
                message: "action must be 'confirm' or 'dismiss'.",
                timestamp: new Date().toISOString()
            });
        }

        const db_instance = db.getDb();
        const grievance = db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).value();

        if (!grievance) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Grievance not found.',
                timestamp: new Date().toISOString()
            });
        }

        const updates = action === 'confirm'
            ? { status: 'Closed', adminNote: 'Closed — confirmed as fraudulent/duplicate by admin.', fraudReviewed: true, fraudAction: 'confirmed' }
            : { isDuplicate: false, fraudScore: 0.0, fraudReviewed: true, fraudAction: 'dismissed', adminNote: 'Fraud flag dismissed by admin — legitimate grievance.' };

        db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).assign({
            ...updates, updatedAt: new Date().toISOString()
        }).write();

        return res.status(200).json({
            success: true,
            data: db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).value(),
            message: `Fraud alert ${action === 'confirm' ? 'confirmed - grievance closed' : 'dismissed - grievance reinstated'}.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
