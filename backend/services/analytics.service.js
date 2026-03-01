// ============================================
// analytics.service.js — Dashboard & Reports Analytics
// → AWS swap: Replace with Amazon QuickSight API
// ============================================

const db = require('../db/database');

/**
 * Get admin dashboard KPI summary.
 * → AWS QuickSight: getSessionEmbedUrl or describe-dashboard
 */
const getDashboardStats = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();
    const users = db_instance.get('users').filter({ role: 'citizen' }).value();
    const schemes = db_instance.get('schemes').filter({ isActive: true }).value();

    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'Resolved').length;
    const pending = grievances.filter(g => g.status === 'Pending').length;
    const inProgress = grievances.filter(g => g.status === 'In Progress').length;
    const critical = grievances.filter(g => g.priority === 'Critical').length;

    const resolutionRate = total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 0;

    // Avg resolution days (mock calc from timestamps)
    const resolvedGrievances = grievances.filter(g => g.status === 'Resolved' && g.resolvedAt);
    const avgResolutionDays = resolvedGrievances.length > 0
        ? parseFloat((resolvedGrievances.reduce((sum, g) => {
            const days = (new Date(g.resolvedAt) - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0) / resolvedGrievances.length).toFixed(1))
        : 4.2;

    return {
        totalGrievances: total,
        resolvedGrievances: resolved,
        pendingGrievances: pending,
        inProgressGrievances: inProgress,
        criticalGrievances: critical,
        resolutionRate,
        avgResolutionDays,
        totalCitizens: users.length,
        activeSchemes: schemes.length,
        slaBreachRate: 12.3 // computed from officer data in real impl
    };
};

/**
 * Get grievance count grouped by state (for heatmap).
 */
const getHeatmapData = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const stateMap = {};
    grievances.forEach(g => {
        if (!stateMap[g.state]) {
            stateMap[g.state] = { state: g.state, count: 0, resolved: 0, pending: 0, critical: 0 };
        }
        stateMap[g.state].count++;
        if (g.status === 'Resolved') stateMap[g.state].resolved++;
        if (g.status === 'Pending') stateMap[g.state].pending++;
        if (g.priority === 'Critical') stateMap[g.state].critical++;
    });

    return Object.values(stateMap).sort((a, b) => b.count - a.count);
};

/**
 * Get monthly grievance trend for the last 12 months.
 */
const getMonthlyTrend = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const monthMap = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
        monthMap[key] = { month: label, filed: 0, resolved: 0 };
    }

    grievances.forEach(g => {
        const date = new Date(g.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap[key]) {
            monthMap[key].filed++;
            if (g.status === 'Resolved') monthMap[key].resolved++;
        }
    });

    return Object.values(monthMap);
};

/**
 * Get grievances grouped by category.
 */
const getCategoryBreakdown = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const catMap = {};
    grievances.forEach(g => {
        catMap[g.category] = (catMap[g.category] || 0) + 1;
    });

    return Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
};

/**
 * Get sentiment trend for the last 30 days.
 */
const getSentimentTrend = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const dayMap = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        dayMap[key] = { day: label, positive: 0, neutral: 0, negative: 0 };
    }

    grievances.forEach(g => {
        const key = new Date(g.createdAt).toISOString().slice(0, 10);
        if (dayMap[key]) {
            const label = g.sentiment || 'Neutral';
            if (label === 'Positive') dayMap[key].positive++;
            else if (label === 'Negative' || label === 'Highly Negative') dayMap[key].negative++;
            else dayMap[key].neutral++;
        }
    });

    return Object.values(dayMap);
};

/**
 * Get state-level analytics for admin reporting.
 */
const getStateAnalytics = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const stateMap = {};
    grievances.forEach(g => {
        if (!stateMap[g.state]) {
            stateMap[g.state] = {
                state: g.state, total: 0, resolved: 0,
                pending: 0, critical: 0, sentimentSum: 0
            };
        }
        const s = stateMap[g.state];
        s.total++;
        if (g.status === 'Resolved') s.resolved++;
        if (g.status === 'Pending') s.pending++;
        if (g.priority === 'Critical') s.critical++;
        s.sentimentSum += g.sentimentScore || 0.5;
    });

    return Object.values(stateMap).map(s => ({
        state: s.state,
        total: s.total,
        resolved: s.resolved,
        pending: s.pending,
        critical: s.critical,
        resolutionRate: s.total > 0 ? parseFloat(((s.resolved / s.total) * 100).toFixed(1)) : 0,
        avgSentiment: s.total > 0 ? parseFloat((s.sentimentSum / s.total).toFixed(3)) : 0.5
    })).sort((a, b) => b.total - a.total);
};

/**
 * Get officer SLA performance data.
 * → AWS QuickSight / Comprehend: pull from CloudWatch metrics per officer
 */
const getSLAData = () => {
    const db_instance = db.getDb();
    // Officers are stored in the `users` collection with role: 'officer'
    const officers = db_instance.get('users').filter({ role: 'officer' }).value();
    return officers;
};

module.exports = {
    getDashboardStats,
    getHeatmapData,
    getMonthlyTrend,
    getCategoryBreakdown,
    getSentimentTrend,
    getStateAnalytics,
    getSLAData
};
