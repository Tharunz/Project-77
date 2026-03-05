// Debug Cognito - full response inspection
require('dotenv').config();
const { InitiateAuthCommand, CognitoIdentityProviderClient, RespondToAuthChallengeCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function test() {
    try {
        const cmd = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: 'ramesh@gmail.com',
                PASSWORD: 'Ramesh@12345'
            }
        });
        const result = await client.send(cmd);
        console.log('Full result:', JSON.stringify(result, null, 2));

        // If there's a challenge, handle it
        if (result.ChallengeName) {
            console.log('\n⚠️  Challenge required:', result.ChallengeName);
            console.log('Session:', result.Session?.slice(0, 30) + '...');
        }
    } catch (err) {
        console.error('Error:', err.name, '-', err.message);
        console.log('Full error:', err);
    }
}

test();
