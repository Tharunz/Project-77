// Fix Cognito users: respond to NEW_PASSWORD_REQUIRED challenge
require('dotenv').config();
const {
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
    CognitoIdentityProviderClient
} = require('@aws-sdk/client-cognito-identity-provider');
const {
    AdminSetUserPasswordCommand,
    AdminUpdateUserAttributesCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const users = [
    { email: 'ramesh@gmail.com', password: 'Ramesh@12345', name: 'Ramesh Kumar' },
    { email: 'admin@gov.in', password: 'Admin@12345', name: 'Rajiv Sharma' },
    { email: 'officer@gov.in', password: 'Officer@12345', name: 'Officer NCIE' }
];

async function fixUser(user) {
    console.log(`\nProcessing: ${user.email}`);

    try {
        // Step 1: Set permanent password using AdminSetUserPassword
        const setPwdCmd = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: user.email,
            Password: user.password,
            Permanent: true
        });
        await client.send(setPwdCmd);
        console.log(`  ✅ Password set permanently to: ${user.password}`);

        // Step 2: Set name attribute
        const updateAttrCmd = new AdminUpdateUserAttributesCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: user.email,
            UserAttributes: [
                { Name: 'name', Value: user.name },
                { Name: 'email_verified', Value: 'true' }
            ]
        });
        await client.send(updateAttrCmd);
        console.log(`  ✅ Name attribute set to: ${user.name}`);

        // Step 3: Test login with the new password
        const loginCmd = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: user.email,
                PASSWORD: user.password
            }
        });
        const loginResult = await client.send(loginCmd);

        if (loginResult.AuthenticationResult?.AccessToken) {
            console.log(`  ✅ LOGIN SUCCESSFUL — AccessToken: ${loginResult.AuthenticationResult.AccessToken.slice(0, 40)}...`);
        } else if (loginResult.ChallengeName) {
            console.log(`  ⚠️  Still has challenge: ${loginResult.ChallengeName}`);
        }
    } catch (err) {
        console.error(`  ❌ Error for ${user.email}:`, err.name, '-', err.message);
    }
}

async function main() {
    console.log('🔧 Fixing Cognito test users...');
    console.log('User Pool:', process.env.COGNITO_USER_POOL_ID);

    for (const user of users) {
        await fixUser(user);
    }

    console.log('\n✅ Done! All users fixed.');
}

main();
