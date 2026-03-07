// ============================================================
// scripts/resetDemoPasswords.js
// Updates db/local.json with correct bcrypt hashes for
// the demo user accounts (reverting to original credentials).
// Run: node scripts/resetDemoPasswords.js
// ============================================================

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    const adminHash = await bcrypt.hash('Admin@12345', 10);
    const rameshHash = await bcrypt.hash('Ramesh@12345', 10);

    // Find db/local.json — check both paths
    let dbPath = path.join(__dirname, '../db/local.json');
    if (!fs.existsSync(dbPath)) {
        dbPath = path.join(__dirname, '../db/db.json');
    }
    if (!fs.existsSync(dbPath)) {
        // Create it
        fs.mkdirSync(path.join(__dirname, '../db'), { recursive: true });
        fs.writeFileSync(dbPath, JSON.stringify({ users: [], grievances: [], schemes: [], officers: [] }, null, 2));
    }

    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!db.users) db.users = [];

    // Remove stale demo users
    db.users = db.users.filter(u =>
        u.email !== 'admin@gov.in' &&
        u.email !== 'ramesh@gmail.com' &&
        u.email !== 'ramesh@citizen.in'
    );

    // Add admin
    db.users.push({
        id: 'USR-ADMIN-001',
        name: 'Rajesh Kumar',
        email: 'admin@gov.in',
        password: adminHash,
        role: 'admin',
        state: 'Delhi',
        district: 'New Delhi',
        department: 'Ministry of Civil Services',
        janShaktiScore: 95,
        isVerified: true,
        createdAt: new Date().toISOString()
    });

    // Add Ramesh
    db.users.push({
        id: 'USR-CIT-001',
        name: 'Ramesh Kumar',
        email: 'ramesh@gmail.com',
        password: rameshHash,
        role: 'citizen',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        age: 42,
        income: 180000,
        janShaktiScore: 62,
        phone: '+919876543210',
        isVerified: true,
        createdAt: new Date().toISOString()
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('✅ Users added to:', dbPath);
    console.log('✅ admin@gov.in → Admin@12345');
    console.log('✅ ramesh@gmail.com → Ramesh@12345');

    // Also seed to DynamoDB
    if (process.env.ENABLE_DYNAMO === 'true') {
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

        const client = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-west-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                sessionToken: process.env.AWS_SESSION_TOKEN
            }
        });
        const docClient = DynamoDBDocumentClient.from(client);

        const targetUsers = db.users.filter(u =>
            u.email === 'admin@gov.in' ||
            u.email === 'ramesh@gmail.com'
        );

        for (const user of targetUsers) {
            try {
                await docClient.send(new PutCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE || 'ncie-users',
                    Item: user
                }));
                console.log('✅ DynamoDB:', user.email);
            } catch (e) {
                console.log('⚠️ DynamoDB skip:', user.email, e.message);
            }
        }
    }
};

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
