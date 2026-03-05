// ============================================
// events.service.js — Civic Event Bus (EventBridge)
// ENABLE_EVENTBRIDGE=false → console.log locally
// ENABLE_EVENTBRIDGE=true  → AWS EventBridge PutEvents
// ============================================

const isEventBridge = () => process.env.ENABLE_EVENTBRIDGE === 'true';

// ─── Lazy EventBridge client ───────────────────────────────────────────────────
let _ebClient = null;
const getEBClient = () => {
    if (!_ebClient) {
        const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
        const { awsConfig } = require('../config/aws.config');
        _ebClient = new EventBridgeClient(awsConfig);
    }
    return _ebClient;
};

// =============================================================================
// PUBLIC INTERFACE
// =============================================================================

/**
 * publishEvent(eventType, data)
 * Publishes a civic event to EventBridge or logs locally.
 *
 * @param {string} eventType — e.g. "GrievanceFiled", "FundsReleased"
 * @param {object} data — event payload
 */
const publishEvent = async (eventType, data) => {
    const enrichedData = {
        ...data,
        timestamp: new Date().toISOString(),
        platform: 'NCIE'
    };

    if (!isEventBridge()) {
        console.log(`[NCIE EVENT] ${eventType}`, JSON.stringify(enrichedData));
        return { success: true, mock: true, eventType };
    }

    const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
    const client = getEBClient();

    const response = await client.send(new PutEventsCommand({
        Entries: [
            {
                Source: 'ncie.platform',
                DetailType: eventType,
                Detail: JSON.stringify(enrichedData),
                EventBusName: process.env.EVENTBRIDGE_BUS_NAME || 'ncie-civic-events'
            }
        ]
    }));

    const entry = response.Entries?.[0];
    if (entry?.ErrorCode) {
        console.error(`[EventBridge] Failed to publish ${eventType}:`, entry.ErrorMessage);
        return { success: false, error: entry.ErrorMessage };
    }

    return {
        success: true,
        eventId: entry?.EventId,
        eventType
    };
};

// ─── Named event helpers (convenience wrappers) ────────────────────────────────

const publishGrievanceFiled = (data) =>
    publishEvent('GrievanceFiled', data);

const publishPreSevaAlert = (data) =>
    publishEvent('PreSevaAlert', data);

const publishSLABreach = (data) =>
    publishEvent('SLABreach', data);

const publishFundsReleased = (data) =>
    publishEvent('FundsReleased', data);

const publishGhostAudit = (data) =>
    publishEvent('GhostAuditTriggered', data);

module.exports = {
    publishEvent,
    publishGrievanceFiled,
    publishPreSevaAlert,
    publishSLABreach,
    publishFundsReleased,
    publishGhostAudit,
    isEventBridge
};
