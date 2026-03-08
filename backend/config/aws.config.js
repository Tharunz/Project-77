// ============================================
// aws.config.js — Single Source of Truth for AWS Clients
// All service files import from here.
// Never create separate clients in service files.
// ============================================

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');

const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN  // Required for Learner Labs temporary credentials
    }
};

const dynamoClient = DynamoDBDocumentClient.from(
    new DynamoDBClient(awsConfig),
    {
        // Marshall options: convert JS types to DynamoDB types
        marshallOptions: {
            convertEmptyValues: true,
            removeUndefinedValues: true,
            convertClassInstanceToMap: true
        },
        unmarshallOptions: {
            wrapNumbers: false
        }
    }
);

const s3Client = new S3Client(awsConfig);

const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

module.exports = { dynamoClient, s3Client, cognitoClient, awsConfig };
