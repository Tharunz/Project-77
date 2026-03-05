// ============================================
// heatmap.routes.js — India Distress Heatmap API
// GET /api/heatmap                  — all state distress data (public)
// GET /api/heatmap/state/:stateName — single state detail
// GET /api/heatmap/summary          — top 5 distress states + national index
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Helper: compute distress data per state from actual grievances
const computeHeatmapData = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const stateMap = {};

    grievances.forEach(g => {
        if (!stateMap[g.state]) {
            stateMap[g.state] = {
                state: g.state,
                totalGrievances: 0,
                pending: 0,
                resolved: 0,
                critical: 0,
                inProgress: 0,
                categories: {},
                sentimentScores: [],
                lastUpdated: null
            };
        }

        const s = stateMap[g.state];
        s.totalGrievances++;

        const status = g.status?.toLowerCase();
        if (status === 'pending') s.pending++;
        else if (status === 'resolved' || status === 'closed') s.resolved++;
        else if (status === 'escalated') s.critical++;
        else if (status === 'in progress') s.inProgress++;

        s.categories[g.category] = (s.categories[g.category] || 0) + 1;
        s.sentimentScores.push(g.sentimentScore != null ? g.sentimentScore : 0.5);

        const grDate = new Date(g.createdAt);
        if (!s.lastUpdated || grDate > new Date(s.lastUpdated)) {
            s.lastUpdated = g.createdAt;
        }
    });

    return Object.values(stateMap).map(s => {
        const avgSentiment = s.sentimentScores.reduce((a, b) => a + b, 0) / s.sentimentScores.length;
        const resolutionRate = s.totalGrievances > 0
            ? parseFloat(((s.resolved / s.totalGrievances) * 100).toFixed(1))
            : 0;

        // Distress index: heavier weight on unresolved + critical + low sentiment
        const unresolved = s.totalGrievances - s.resolved;
        const distressRaw = (unresolved * 0.6) + (s.critical * 1.5) + ((1 - avgSentiment) * 10);
        const distressIndex = Math.min(100, parseFloat(distressRaw.toFixed(1)));

        const distressLevel =
            distressIndex >= 70 ? 'Critical' :
                distressIndex >= 45 ? 'High' :
                    distressIndex >= 20 ? 'Medium' : 'Low';

        // Top category by count
        const topCategory = Object.entries(s.categories)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';

        return {
            state: s.state,
            totalGrievances: s.totalGrievances,
            pending: s.pending,
            resolved: s.resolved,
            critical: s.critical,
            inProgress: s.inProgress,
            resolutionRate,
            avgSentimentScore: parseFloat(avgSentiment.toFixed(3)),
            distressIndex,
            distressLevel,
            topCategory,
            categoryBreakdown: s.categories,
            lastUpdated: s.lastUpdated
        };
    }).sort((a, b) => b.distressIndex - a.distressIndex);
};

// ─── GET /api/heatmap (public — no auth required) ─────────────────────────────
router.get('/', (req, res, next) => {
    try {
        const heatmapData = computeHeatmapData();

        return res.status(200).json({
            success: true,
            data: heatmapData,
            meta: {
                total: heatmapData.length,
                statesCovered: heatmapData.length,
                generatedAt: new Date().toISOString()
            },
            message: `India distress heatmap — ${heatmapData.length} state(s) computed.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/heatmap/summary (public) ────────────────────────────────────────
// Returns national index + top 5 most distressed states
router.get('/summary', (req, res, next) => {
    try {
        const heatmapData = computeHeatmapData();

        const totalGrievances = heatmapData.reduce((a, s) => a + s.totalGrievances, 0);
        const totalResolved = heatmapData.reduce((a, s) => a + s.resolved, 0);
        const totalCritical = heatmapData.reduce((a, s) => a + s.critical, 0);
        const nationalResolutionRate = totalGrievances > 0
            ? parseFloat(((totalResolved / totalGrievances) * 100).toFixed(1)) : 0;
        const nationalDistressIndex = heatmapData.length > 0
            ? parseFloat((heatmapData.reduce((a, s) => a + s.distressIndex, 0) / heatmapData.length).toFixed(1))
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                nationalIndex: {
                    totalGrievances,
                    totalResolved,
                    totalCritical,
                    nationalResolutionRate,
                    nationalDistressIndex,
                    distressLevel: nationalDistressIndex >= 70 ? 'Critical' : nationalDistressIndex >= 45 ? 'High' : nationalDistressIndex >= 20 ? 'Medium' : 'Low'
                },
                top5MostDistressed: heatmapData.slice(0, 5),
                top5BestPerforming: [...heatmapData].sort((a, b) => b.resolutionRate - a.resolutionRate).slice(0, 5)
            },
            message: 'National distress summary computed.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/heatmap/state/:stateName (public) ───────────────────────────────
// Returns full detail for a single state
router.get('/state/:stateName', (req, res, next) => {
    try {
        const stateName = decodeURIComponent(req.params.stateName);
        const heatmapData = computeHeatmapData();
        const stateData = heatmapData.find(
            s => s.state.toLowerCase() === stateName.toLowerCase()
        );

        if (!stateData) {
            return res.status(404).json({
                success: false, data: null,
                message: `No data found for state: ${stateName}`,
                timestamp: new Date().toISOString()
            });
        }

        // Also fetch recent grievances for this state
        const db_instance = db.getDb();
        const recentGrievances = db_instance.get('grievances')
            .filter(g => g.state.toLowerCase() === stateName.toLowerCase())
            .value()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(g => ({
                id: g.id,
                title: g.title,
                category: g.category,
                status: g.status,
                priority: g.priority,
                createdAt: g.createdAt
            }));

        return res.status(200).json({
            success: true,
            data: {
                ...stateData,
                recentGrievances
            },
            message: `Distress detail for ${stateName} fetched.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
