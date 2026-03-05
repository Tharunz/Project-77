// ============================================
// realtime.service.js — AppSync Realtime Notifications
// ENABLE_APPSYNC=false → no-op, frontend uses polling
// ENABLE_APPSYNC=true  → AWS AppSync GraphQL mutations via fetch
// ============================================

const isAppSync = () => process.env.ENABLE_APPSYNC === 'true';

const APPSYNC_URL = () => process.env.APPSYNC_API_URL;
const APPSYNC_KEY = () => process.env.APPSYNC_API_KEY;

// ─── Generic AppSync mutation sender ──────────────────────────────────────────
const sendMutation = async (query) => {
    const response = await fetch(APPSYNC_URL(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': APPSYNC_KEY()
        },
        body: JSON.stringify({ query })
    });
    const json = await response.json();
    if (json.errors) {
        console.error('[AppSync] Mutation error:', JSON.stringify(json.errors));
        return { success: false, errors: json.errors };
    }
    return { success: true, data: json.data };
};

// =============================================================================
// PUBLIC FUNCTIONS
// =============================================================================

/**
 * notifyNewGrievance(grievance) — Push new grievance to admin dashboard in real-time.
 */
const notifyNewGrievance = async (grievance) => {
    if (!isAppSync()) return;

    try {
        const g = grievance;
        const query = `mutation {
            createGrievance(
                grievanceId: "${g.id || g.grievanceId}"
                title: "${(g.title || '').replace(/"/g, '\\"')}"
                status: "${g.status || 'Pending'}"
                sentiment: "${g.sentiment || 'NEUTRAL'}"
                priority: "${g.priority || 'MEDIUM'}"
                state: "${g.state || 'Unknown'}"
                category: "${g.category || 'General'}"
                citizenId: "${g.userId || g.citizenId || ''}"
                createdAt: "${g.createdAt || new Date().toISOString()}"
            ) {
                grievanceId status priority sentiment
            }
        }`;
        const result = await sendMutation(query);
        if (result.success) {
            console.log('[AppSync] New grievance pushed to admin dashboard:', g.id || g.grievanceId);
        }
    } catch (err) {
        console.error('[AppSync] notifyNewGrievance error:', err.message);
    }
};

/**
 * notifyNewAlert(alert) — Push new PreSeva alert to admin dashboard in real-time.
 */
const notifyNewAlert = async (alert) => {
    if (!isAppSync()) return;

    try {
        const a = alert;
        const query = `mutation {
            createPreSevaAlert(
                alertId: "${a.alertId || a.id}"
                state: "${a.state || 'Unknown'}"
                probability: ${parseFloat(a.probability || 0).toFixed(4)}
                category: "${a.category || 'General'}"
                riskLevel: "${a.riskLevel || a.probabilityLabel || 'MEDIUM'}"
                createdAt: "${a.createdAt || a.predictedAt || new Date().toISOString()}"
            ) {
                alertId state riskLevel
            }
        }`;
        const result = await sendMutation(query);
        if (result.success) {
            console.log('[AppSync] New PreSeva alert pushed to admin dashboard:', a.alertId || a.id);
        }
    } catch (err) {
        console.error('[AppSync] notifyNewAlert error:', err.message);
    }
};

module.exports = { notifyNewGrievance, notifyNewAlert, isAppSync };
