// Verify DynamoDB seeding
require('dotenv').config();
const db = require('./services/db.service');

const TABLES = {
    'ncie-users': process.env.DYNAMO_USERS_TABLE,
    'ncie-schemes': process.env.DYNAMO_SCHEMES_TABLE,
    'ncie-grievances': process.env.DYNAMO_GRIEVANCES_TABLE,
    'ncie-officers': process.env.DYNAMO_OFFICERS_TABLE,
    'ncie-preseva-alerts': process.env.DYNAMO_ALERTS_TABLE,
    'ncie-notifications': process.env.DYNAMO_NOTIFICATIONS_TABLE,
    'ncie-community': process.env.DYNAMO_COMMUNITY_TABLE
};

async function verify() {
    console.log('\n🔍 Verifying DynamoDB tables...\n');
    let allGood = true;
    for (const [name, table] of Object.entries(TABLES)) {
        try {
            const items = await db.scan(table);
            const status = items.length > 0 ? '✅' : '⚠️ ';
            console.log(`  ${status} ${name}: ${items.length} items`);
            if (items.length === 0) allGood = false;
        } catch (err) {
            console.log(`  ❌ ${name}: ERROR - ${err.message}`);
            allGood = false;
        }
    }
    console.log('');
    if (allGood) {
        console.log('🎉 All tables seeded successfully!');
    } else {
        console.log('⚠️  Some tables appear empty.');
    }
}

verify();
