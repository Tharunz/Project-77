const { SQSClient, SendMessageCommand, GetQueueAttributesCommand } = require('@aws-sdk/client-sqs');

let sqsClient = null;
try {
    sqsClient = new SQSClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
} catch (error) {
    console.error('[SQS] Failed to initialize client:', error.message);
}

/**
 * Enqueues a grievance object to SQS
 * @param {Object} grievance
 */
const enqueueGrievance = async (grievance) => {
    if (!sqsClient || !process.env.SQS_QUEUE_URL) {
        console.warn('[SQS] Skipped enqueueing (Missing config or Queue URL)');
        return { success: false, reason: 'missing config' };
    }

    // Use regular SQS parameters, remove unsupported FIFO params if it's not a FIFO queue.
    // Assuming Standard queue based on implementation details:
    try {
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify(grievance)
        });

        const response = await sqsClient.send(command);
        console.log(`[SQS] Enqueued grievance ${grievance.id} ✅ MessageId: ${response.MessageId}`);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error(`[SQS] Enqueue failed for grievance ${grievance?.id}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Fetches approximate number of messages from SQS
 */
const getQueueStats = async () => {
    // Check if AWS credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('[SQS] No AWS credentials, returning mock data');
        return {
            success: true,
            visible: 12,
            hidden: 3,
            mock: true
        };
    }

    if (!sqsClient || !process.env.SQS_QUEUE_URL) {
        console.log('[SQS] Missing SQS config, returning mock data');
        return {
            success: true,
            visible: 8,
            hidden: 2,
            mock: true
        };
    }

    try {
        const command = new GetQueueAttributesCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
        });

        const response = await sqsClient.send(command);
        return {
            success: true,
            visible: parseInt(response.Attributes?.ApproximateNumberOfMessages || '0', 10),
            hidden: parseInt(response.Attributes?.ApproximateNumberOfMessagesNotVisible || '0', 10)
        };
    } catch (error) {
        console.log('[SQS] AWS error, returning mock data:', error.message);
        return {
            success: true,
            visible: 5,
            hidden: 1,
            mock: true,
            error: error.message
        };
    }
};

module.exports = {
    enqueueGrievance,
    getQueueStats
};
