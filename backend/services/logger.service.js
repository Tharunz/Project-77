// ============================================
// logger.service.js — Application Event Logger
// ENABLE_CLOUDWATCH=false → console.log only
// ENABLE_CLOUDWATCH=true  → AWS CloudWatch Logs PutLogEvents
// ============================================

const isCloudWatch = () => process.env.ENABLE_CLOUDWATCH === 'true';

const LOG_GROUP = () => process.env.CLOUDWATCH_LOG_GROUP || '/ncie/application';
const todayStream = () => new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

// ─── In-memory sequence token (required by CloudWatch) ───────────────────────
let _sequenceToken = null;

// ─── Lazy CloudWatch client ───────────────────────────────────────────────────
let _cwClient = null;
const getCWClient = () => {
    if (!_cwClient) {
        const { CloudWatchLogsClient } = require('@aws-sdk/client-cloudwatch-logs');
        const { awsConfig } = require('../config/aws.config');
        _cwClient = new CloudWatchLogsClient(awsConfig);
    }
    return _cwClient;
};

// ─── Ensure log stream exists for today ──────────────────────────────────────
const ensureLogStream = async () => {
    const {
        DescribeLogStreamsCommand,
        CreateLogStreamCommand
    } = require('@aws-sdk/client-cloudwatch-logs');
    const client = getCWClient();
    const streamName = todayStream();

    try {
        const existing = await client.send(new DescribeLogStreamsCommand({
            logGroupName: LOG_GROUP(),
            logStreamNamePrefix: streamName
        }));

        const stream = (existing.logStreams || []).find(s => s.logStreamName === streamName);
        if (stream) {
            _sequenceToken = stream.uploadSequenceToken || null;
            return;
        }
    } catch (_) { /* stream not found — create below */ }

    // Create stream
    await client.send(new CreateLogStreamCommand({
        logGroupName: LOG_GROUP(),
        logStreamName: streamName
    }));
    _sequenceToken = null;
};

// =============================================================================
// PUBLIC INTERFACE
// =============================================================================

/**
 * logEvent(eventType, data)
 * Logs an event to CloudWatch (when enabled) or console.
 *
 * @param {string} eventType — e.g. "GrievanceFiled", "FundsReleased"
 * @param {object} data — event payload
 */
const logEvent = async (eventType, data) => {
    const logEntry = {
        event: eventType,
        data: data,
        service: 'NCIE',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    };

    if (!isCloudWatch()) {
        console.log(`[NCIE][${logEntry.timestamp}][${eventType}]`, JSON.stringify(data));
        return;
    }

    try {
        const { PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');
        const client = getCWClient();

        await ensureLogStream();

        const params = {
            logGroupName: LOG_GROUP(),
            logStreamName: todayStream(),
            logEvents: [{
                timestamp: Date.now(),
                message: JSON.stringify(logEntry)
            }]
        };
        if (_sequenceToken) params.sequenceToken = _sequenceToken;

        const response = await client.send(new PutLogEventsCommand(params));
        _sequenceToken = response.nextSequenceToken;

    } catch (err) {
        // Fall back to console — CloudWatch errors must not crash the app
        console.error(`[CW LOG FAILED][${eventType}]`, err.message);
        console.log(`[NCIE][${logEntry.timestamp}][${eventType}]`, JSON.stringify(data));
    }
};

// ─── Named event helpers ───────────────────────────────────────────────────────
const logGrievanceFiled = (data) => logEvent('GrievanceFiled', data);
const logSentimentAnalyzed = (data) => logEvent('SentimentAnalyzed', data);
const logEscrowStarted = (data) => logEvent('EscrowStarted', data);
const logFundsReleased = (data) => logEvent('FundsReleased', data);
const logPreSevaAlert = (data) => logEvent('PreSevaAlert', data);
const logUserLogin = (data) => logEvent('UserLogin', data);
const logSLABreach = (data) => logEvent('SLABreach', data);

module.exports = {
    logEvent,
    logGrievanceFiled,
    logSentimentAnalyzed,
    logEscrowStarted,
    logFundsReleased,
    logPreSevaAlert,
    logUserLogin,
    logSLABreach,
    isCloudWatch
};
