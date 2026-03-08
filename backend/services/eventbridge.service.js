/**
 * EventBridge Service
 * Publishes events to NCIE civic events bus for real-time event-driven architecture
 */

const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

/**
 * Gets a fresh EventBridge client with current credentials
 */
const getEventBridgeClient = () => {
    return new EventBridgeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
};

/**
 * Publishes an event to the EventBridge bus
 * @param {string} source - Event source (e.g., 'ncie.grievance')
 * @param {string} detailType - Event type (e.g., 'Grievance Filed')
 * @param {Object} detail - Event payload data
 * @returns {Object} Success status and event ID
 */
const publishEvent = async (source, detailType, detail) => {
    // Validate credentials before creating client
    if (!process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_SESSION_TOKEN) {
        console.log('[EventBridge] Credentials not available, skipping publish');
        return { success: false, reason: 'no credentials' };
    }

    try {
        const client = getEventBridgeClient(); // Fresh client each time
        const result = await client.send(new PutEventsCommand({
            Entries: [{
                EventBusName: process.env.EVENTBRIDGE_BUS_NAME || 'ncie-civic-events',
                Source: source,
                DetailType: detailType,
                Detail: JSON.stringify(detail),
                Time: new Date()
            }]
        }));
        
        if (result.FailedEntryCount > 0) {
            console.log(`[EventBridge] Failed to publish: ${detailType}`);
            return { success: false, failedCount: result.FailedEntryCount };
        }
        
        const eventId = result.Entries[0].EventId;
        console.log(`[EventBridge] Published: ${detailType} ✅ EventId: ${eventId}`);
        return { success: true, eventId };
    } catch(err) {
        console.log(`[EventBridge] Error publishing ${detailType}: ${err.message}`);
        return { success: false, error: err.message };
    }
};

module.exports = { publishEvent };
