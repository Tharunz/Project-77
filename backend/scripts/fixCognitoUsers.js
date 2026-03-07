// ============================================================
// scripts/fixCognitoUsers.js
// Force-sets permanent passwords for demo users in Cognito.
// Removes FORCE_CHANGE_PASSWORD status.
// Run: node scripts/fixCognitoUsers.js
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
    CognitoIdentityProviderClient,
    AdminSetUserPasswordCommand,
    AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN  // Required for Learner Labs
    }
});

const POOL_ID = process.env.COGNITO_USER_POOL_ID;

const users = [
    { email: 'admin@gov.in', password: 'Admin@12345', name: 'Rajesh Kumar' },
    { email: 'ramesh@gmail.com', password: 'Ramesh@12345', name: 'Ramesh Kumar' },
    { email: 'officer@gov.in', password: 'Officer@12345', name: 'Officer NCIE' }
];

const getStatus = async (email) => {
    try {
        const r = await client.send(new AdminGetUserCommand({ UserPoolId: POOL_ID, Username: email }));
        return r.UserStatus;
    } catch (e) {
        return e.name === 'UserNotFoundException' ? 'NOT_FOUND' : 'ERROR';
    }
};

const fixUser = async (email, password) => {
    const statusBefore = await getStatus(email);
    if (statusBefore === 'NOT_FOUND') {
        console.log(`  ⚠️  ${email} — not found in Cognito (skipping)`);
        return;
    }
    try {
        await client.send(new AdminSetUserPasswordCommand({
            UserPoolId: POOL_ID,
            Username: email,
            Password: password,
            Permanent: true   // ← removes FORCE_CHANGE_PASSWORD status
        }));
        const statusAfter = await getStatus(email);
        console.log(`  ✅ ${email} → ${statusBefore} → ${statusAfter}`);
    } catch (e) {
        console.error(`  ❌ ${email} failed: ${e.message}`);
    }
};

const run = async () => {
    console.log('\n🔑 Cognito Password Fix\n');
    console.log(`Pool: ${POOL_ID}\nRegion: ${process.env.AWS_REGION}\n`);
    for (const u of users) {
        await fixUser(u.email, u.password);
    }
    console.log('\nDone! Demo users are now CONFIRMED.\n');
    console.log('Admin:   admin@gov.in   / Admin@12345');
    console.log('Citizen: ramesh@gmail.com / Ramesh@12345\n');
};

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
