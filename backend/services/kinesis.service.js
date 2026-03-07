const { KinesisClient, PutRecordCommand, DescribeStreamCommand } = require('@aws-sdk/client-kinesis');
const EventEmitter = require('events');

const kinesisEvents = new EventEmitter();

let kinesisClient = null;
try {
    kinesisClient = new KinesisClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKey_id: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
} catch (error) {
    console.error('[Kinesis] Failed to initialize client:', error.message);
}

const STREAM_NAME = process.env.KINESIS_STREAM_NAME || 'ncie-live-stream';

/**
 * Publishes an event to Kinesis Data Stream
 * @param {string} eventType 
 * @param {Object} payload 
 */
const publishToStream = async (eventType, payload) => {
    if (!kinesisClient || !STREAM_NAME) {
        console.warn(`[Kinesis] Skipped publish (Missing config or Stream Name)`);
        return { success: false, reason: 'missing config' };
    }

    try {
        const record = {
            eventType,
            payload,
            timestamp: new Date().toISOString()
        };

        const command = new PutRecordCommand({
            StreamName: STREAM_NAME,
            Data: Buffer.from(JSON.stringify(record)),
            PartitionKey: payload.grievanceId || payload.userId || 'ncie-global'
        });

        const response = await kinesisClient.send(command);
        console.log(`[Kinesis] Published ${eventType} ✅ Sequence: ${response.SequenceNumber}`);

        // Emit locally for SSE bridge
        kinesisEvents.emit('event', record);

        return { success: true, sequenceNumber: response.SequenceNumber };
    } catch (error) {
        console.error(`[Kinesis] Publish failed for ${eventType}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Checks stream status for the dashboard
 */
const getStreamStatus = async () => {
    // Check if AWS credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('[Kinesis] No AWS credentials, returning mock data');
        return {
            success: true,
            streamName: STREAM_NAME || 'ncie-live-stream',
            status: 'ACTIVE',
            shards: 3,
            arn: `arn:aws:kinesis:us-east-1:123456789012:stream/${STREAM_NAME || 'ncie-live-stream'}`,
            mock: true
        };
    }

    if (!kinesisClient || !STREAM_NAME) {
        console.log('[Kinesis] Missing Kinesis config, returning mock data');
        return {
            success: true,
            streamName: 'ncie-live-stream',
            status: 'ACTIVE',
            shards: 2,
            arn: 'arn:aws:kinesis:us-east-1:123456789012:stream/ncie-live-stream',
            mock: true
        };
    }

    try {
        const command = new DescribeStreamCommand({ StreamName: STREAM_NAME });
        const response = await kinesisClient.send(command);
        return {
            success: true,
            streamName: STREAM_NAME,
            status: response.StreamDescription.StreamStatus,
            shards: response.StreamDescription.Shards.length,
            arn: response.StreamDescription.StreamARN
        };
    } catch (error) {
        console.log('[Kinesis] AWS error, returning mock data:', error.message);
        return {
            success: true,
            streamName: STREAM_NAME || 'ncie-live-stream',
            status: 'ACTIVE',
            shards: 1,
            arn: `arn:aws:kinesis:us-east-1:123456789012:stream/${STREAM_NAME || 'ncie-live-stream'}`,
            mock: true,
            error: error.message
        };
    }
};

module.exports = {
    publishToStream,
    getStreamStatus,
    kinesisEvents
};
