const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

/**
 * Gets a fresh SNS client with current credentials
 */
const getSnsClient = () => {
    return new SNSClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
};

/**
 * Publishes an alert to an SNS Topic
 * @param {string} topicArn
 * @param {string} message
 * @param {string} subject
 */
const publishAlert = async (topicArn, message, subject = 'NCIE Alert') => {
    // Validate credentials before creating client
    if (!process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_SESSION_TOKEN) {
        console.log('[SNS] Credentials not available, skipping publish');
        return { success: false, reason: 'no credentials' };
    }

    if (!topicArn) {
        console.warn(`[SNS] Skipped publish to ${topicArn || 'unknown'} (Missing TopicArn)`);
        return { success: false, reason: 'missing topic arn' };
    }

    try {
        const client = getSnsClient(); // Fresh client each time
        const command = new PublishCommand({
            TopicArn: topicArn,
            Message: message,
            Subject: subject,
        });

        const response = await client.send(command);
        console.log(`[SNS] Published: ${subject} ✅ MessageId: ${response.MessageId}`);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.log(`[SNS] Publish failed for ${subject}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    publishAlert
};
