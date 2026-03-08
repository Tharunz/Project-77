// ============================================
// streams.service.js — DynamoDB Streams Simulation
// ENABLE_DYNAMO_STREAMS=false → manually call publishEvent after writes
// ENABLE_DYNAMO_STREAMS=true  → EventBridge Pipe handles automatically
// ============================================

const { publishEvent } = require('./events.service');

const isStreams = () => process.env.ENABLE_DYNAMO_STREAMS === 'true';

/**
 * handleStreamEvent(operation, tableName, newItem)
 *
 * When streams are disabled, this is called manually after every DynamoDB
 * write in db.service.js to simulate what the EventBridge Pipe would do.
 *
 * When streams are enabled, the Pipe does this automatically —
 * this function just logs that the pipe is active.
 */
const handleStreamEvent = async (operation, tableName, newItem) => {
    if (isStreams()) {
        console.log(`[STREAMS] Pipe active — DynamoDB → EventBridge automatic (table: ${tableName})`);
        return;
    }

    if (operation !== 'INSERT') return;

    try {
        const grievancesTable = process.env.DYNAMO_GRIEVANCES_TABLE || 'ncie-grievances';
        const alertsTable = process.env.DYNAMO_ALERTS_TABLE || 'ncie-preseva-alerts';

        if (tableName === grievancesTable) {
            await publishEvent('GrievanceFiled', {
                grievanceId: newItem.grievanceId || newItem.id,
                citizenId: newItem.userId || newItem.citizenId,
                state: newItem.state,
                category: newItem.category,
                sentiment: newItem.sentiment,
                priority: newItem.priority,
                source: 'DynamoStream-Simulation'
            });
        } else if (tableName === alertsTable) {
            await publishEvent('PreSevaAlert', {
                alertId: newItem.alertId || newItem.id,
                state: newItem.state,
                category: newItem.category,
                probability: newItem.probability,
                riskLevel: newItem.riskLevel || newItem.probabilityLabel,
                source: 'DynamoStream-Simulation'
            });
        }
    } catch (err) {
        // Non-fatal — never block the main write operation
        console.error('[STREAMS] Event publish error:', err.message);
    }
};

module.exports = { handleStreamEvent, isStreams };
