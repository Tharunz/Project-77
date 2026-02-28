// ============================================
// analytics.routes.js — Analytics Endpoints
// (These are also mirrored under /admin/analytics)
// GET /api/analytics/dashboard
// GET /api/analytics/monthly-trend
// GET /api/analytics/category-breakdown
// GET /api/analytics/sentiment-trend
// GET /api/analytics/state-analytics
// ============================================

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
    getDashboardStats, getMonthlyTrend, getCategoryBreakdown,
    getSentimentTrend, getStateAnalytics, getHeatmapData
} = require('../services/analytics.service');

router.use(protect, adminOnly);

router.get('/dashboard', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getDashboardStats(),
            message: 'Dashboard stats fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

router.get('/monthly-trend', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getMonthlyTrend(),
            message: 'Monthly trend data fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

router.get('/category-breakdown', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getCategoryBreakdown(),
            message: 'Category breakdown fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

router.get('/sentiment-trend', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getSentimentTrend(),
            message: 'Sentiment trend fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

router.get('/state-analytics', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getStateAnalytics(),
            message: 'State analytics fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

router.get('/heatmap', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: getHeatmapData(),
            message: 'Heatmap data fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) { next(err); }
});

module.exports = router;
