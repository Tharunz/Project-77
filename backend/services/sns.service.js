const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

let snsClient = null;
try {
    snsClient = new SNSClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
} catch (error) {
    console.error('[SNS] Failed to initialize client:', error.message);
}

/**
 * Publishes an alert to an SNS Topic
 * @param {string} topicArn
 * @param {string} message
 * @param {string} subject
 */
const publishAlert = async (topicArn, message, subject = 'NCIE Alert') => {
    if (!snsClient || !topicArn) {
        console.warn(`[SNS] Skipped publish to ${topicArn || 'unknown'} (Missing config or TopicArn)`);
        return { success: false, reason: 'missing config' };
    }

    try {
        const command = new PublishCommand({
            TopicArn: topicArn,
            Message: message,
            Subject: subject,
        });

        const response = await snsClient.send(command);
        console.log(`[SNS] Published: ${subject} ✅ MessageId: ${response.MessageId}`);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error(`[SNS] Publish failed for ${subject}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    publishAlert
};
