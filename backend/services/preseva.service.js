// ============================================
// preseva.service.js — Predictive Grievance Prevention
// → AWS swap: Replace with Amazon SageMaker endpoint calls
// ============================================

const db = require('../db/database');

const THREAT_CATEGORIES = ['Water Supply', 'Infrastructure', 'Healthcare', 'Education', 'Agriculture'];
const HIGH_RISK_STATES = ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Maharashtra', 'West Bengal'];

/**
 * Get PreSeva predictions based on grievance pattern analysis.
 * → AWS SageMaker: sagemakerRuntime.invokeEndpoint({ EndpointName, Body: JSON.stringify(features) })
 */
const getPredictions = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    // Analyze patterns: count by state + category in last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentGrievances = grievances.filter(g =>
        new Date(g.createdAt) >= thirtyDaysAgo
    );

    // Group by state + category
    const patternMap = {};
    recentGrievances.forEach(g => {
        const key = `${g.state}|${g.category}`;
        patternMap[key] = (patternMap[key] || 0) + 1;
    });

    // Generate predictions for high-frequency patterns
    const predictions = Object.entries(patternMap)
        .filter(([, count]) => count >= 3)
        .map(([key, count]) => {
            const [state, category] = key.split('|');
            const probability = Math.min(0.95, 0.40 + (count * 0.08));
            return {
                id: `PRED-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                state,
                category,
                grievanceCount: count,
                probability: parseFloat(probability.toFixed(2)),
                probabilityLabel: probability > 0.75 ? 'High Risk' : probability > 0.55 ? 'Medium Risk' : 'Low Risk',
                predictedTimeframe: '7-14 days',
                recommendedAction: `Proactive review of ${category} infrastructure in ${state}`,
                trend: count > 5 ? 'Increasing' : 'Stable'
            };
        })
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 10);

    return predictions;
};

/**
 * Get all active PreSeva alerts from DB.
 */
const getAlerts = () => {
    const db_instance = db.getDb();
    return db_instance.get('preSevaAlerts')
        .filter({ prevented: false })
        .value();
};

/**
 * Get threat corridors — geographic areas with related grievance clusters.
 */
const getThreatCorridors = () => {
    const db_instance = db.getDb();
    const grievances = db_instance.get('grievances').value();

    const stateMap = {};
    grievances.forEach(g => {
        if (!stateMap[g.state]) {
            stateMap[g.state] = { state: g.state, count: 0, categories: {}, sentiments: [] };
        }
        stateMap[g.state].count++;
        stateMap[g.state].categories[g.category] = (stateMap[g.state].categories[g.category] || 0) + 1;
        stateMap[g.state].sentiments.push(g.sentimentScore || 0.5);
    });

    return Object.values(stateMap).map(s => {
        const avgSentiment = s.sentiments.reduce((a, b) => a + b, 0) / s.sentiments.length;
        const topCategory = Object.entries(s.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
        return {
            state: s.state,
            grievanceCount: s.count,
            avgSentimentScore: parseFloat(avgSentiment.toFixed(3)),
            topCategory,
            riskScore: parseFloat((s.count / 50 * (1 - avgSentiment)).toFixed(3)),
            threatLevel: s.count > 10 ? 'High' : s.count > 5 ? 'Medium' : 'Low'
        };
    }).sort((a, b) => b.riskScore - a.riskScore).slice(0, 15);
};

/**
 * File a PreSeva report (citizen reporting a potential issue before it becomes a grievance).
 */
const fileReport = (reportData, userId) => {
    const db_instance = db.getDb();
    const { v4: uuidv4 } = require('uuid');

    const alert = {
        id: `PRESEVA-${uuidv4().slice(0, 8).toUpperCase()}`,
        type: 'citizen_report',
        reportedBy: userId,
        state: reportData.state,
        district: reportData.district,
        category: reportData.category,
        description: reportData.description,
        probability: 0.60, // default for citizen reports
        status: 'active',
        departmentAlerted: false,
        createdAt: new Date().toISOString()
    };

    db_instance.get('preSevaAlerts').push(alert).write();
    return alert;
};

module.exports = { getPredictions, getAlerts, getThreatCorridors, fileReport };
