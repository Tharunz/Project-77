// Quick DynamoDB connection test
require('dotenv').config();

const db = require('./services/db.service');

async function test() {
    console.log('ENABLE_DYNAMO:', process.env.ENABLE_DYNAMO);
    console.log('Is DynamoDB mode:', db.isDynamo());

    if (!db.isDynamo()) {
        console.log('❌ DynamoDB not enabled. Check .env');
        return;
    }

    try {
        // Scan ncie-schemes table
        const schemes = await db.scan(process.env.DYNAMO_SCHEMES_TABLE || 'ncie-schemes');
        console.log(`\n✅ DynamoDB connected!`);
        console.log(`📊 Schemes table: ${schemes.length} items found`);

        if (schemes.length > 0) {
            console.log('Sample item:', JSON.stringify(schemes[0], null, 2).slice(0, 300));
        } else {
            console.log('ℹ️  Table is empty — needs seeding (Task 5)');
        }
    } catch (err) {
        console.error('❌ DynamoDB error:', err.message);
        if (err.name === 'ResourceNotFoundException') {
            console.log('   Table does not exist. Check table name and region.');
        } else if (err.name === 'UnrecognizedClientException') {
            console.log('   Invalid AWS credentials. Check .env file.');
        } else if (err.name === 'AccessDeniedException') {
            console.log('   Insufficient IAM permissions.');
        }
    }
}

test();
