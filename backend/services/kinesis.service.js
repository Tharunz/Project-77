const { KinesisClient, PutRecordCommand, DescribeStreamCommand } = require('@aws-sdk/client-kinesis');
const EventEmitter = require('events');

const kinesisEvents = new EventEmitter();

/**
 * Gets a fresh Kinesis client with current credentials
 */
const getKinesisClient = () => {
    return new KinesisClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
};

const STREAM_NAME = process.env.KINESIS_STREAM_NAME || 'ncie-live-stream';

/**
 * Publishes an event to Kinesis Data Stream
 * @param {string} eventType 
 * @param {Object} payload 
 */
const publishToStream = async (eventType, payload) => {
    // Validate credentials before creating client
    if (!process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_SESSION_TOKEN) {
        console.log('[Kinesis] Credentials not available, skipping publish');
        return { success: false, reason: 'no credentials' };
    }

    if (!STREAM_NAME) {
        console.warn('[Kinesis] Skipped publish (Missing Stream Name)');
        return { success: false, reason: 'missing stream name' };
    }

    try {
        const client = getKinesisClient(); // Fresh client each time
        const record = {
            eventType,
            data: payload,
            timestamp: new Date().toISOString()
        };

        const command = new PutRecordCommand({
            StreamName: STREAM_NAME,
            Data: Buffer.from(JSON.stringify(record)),
            PartitionKey: eventType
        });

        const response = await client.send(command);
        console.log(`[Kinesis] Published ${eventType} ✅ Sequence: ${response.SequenceNumber}`);

        // Emit locally for SSE bridge
        kinesisEvents.emit('event', record);

        return { success: true, sequenceNumber: response.SequenceNumber };
    } catch (error) {
        console.log(`[Kinesis] Publish failed for ${eventType}:`, error.message);
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

    if (!STREAM_NAME) {
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
        const client = getKinesisClient(); // Fresh client each time
        const command = new DescribeStreamCommand({ StreamName: STREAM_NAME });
        const response = await client.send(command);
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
