// Test Amazon Lex V2 Integration
require('dotenv').config();
const { processMessage, isLex } = require('./services/chatbot.service');

async function test() {
    console.log('ENABLE_LEX:', process.env.ENABLE_LEX);
    console.log('Lex mode:', isLex());

    if (!isLex()) {
        console.log('❌ Lex is disabled');
        return;
    }

    try {
        const userId = 'test-user-123';

        console.log('\n💬 Sending Message 1: "I want to file a complaint"');
        const res1 = await processMessage('I want to file a complaint', userId, userId);
        console.log('🤖 Lex Response:', res1.message);
        console.log('🎯 Detected Intent:', res1.intent);

        if (res1.intent === 'FileGrievanceIntent') {
            console.log('   ✅ Intent correctly identified');
        } else {
            console.log('   ❌ Intent mismatch (Expected: FileGrievanceIntent)');
        }

        console.log('\n💬 Sending Message 2: "What schemes am I eligible for"');
        const res2 = await processMessage('What schemes am I eligible for', userId, userId);
        console.log('🤖 Lex Response:', res2.message);
        console.log('🎯 Detected Intent:', res2.intent);

        if (res2.intent === 'FindSchemesIntent') {
            console.log('   ✅ Intent correctly identified');
        } else {
            console.log('   ❌ Intent mismatch (Expected: FindSchemesIntent)');
        }

        if (res1.intent === 'FileGrievanceIntent' && res2.intent === 'FindSchemesIntent') {
            console.log('\n🎉 Lex ✅ working');
        } else {
            console.log('\n⚠️ Lex is connected but intents were misidentified. Check your Lex Console configuration.');
        }

    } catch (err) {
        console.error('\n❌ Lex error:', err.name, '-', err.message);
    }
}

test();
