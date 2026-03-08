// Test Amazon Comprehend — sentiment + key phrases
require('dotenv').config();

const { analyzeSentiment, isComprehend } = require('./services/sentiment.service');

async function test() {
    console.log('ENABLE_COMPREHEND:', process.env.ENABLE_COMPREHEND);
    console.log('Comprehend mode:', isComprehend());

    const testText = "Water supply has been broken for 3 days. My family has no water. This is urgent and unacceptable.";
    console.log('\nTest text:', `"${testText}"`);

    try {
        const result = await analyzeSentiment(testText);

        console.log('\n✅ Comprehend Result:');
        console.log('  Sentiment:', result.sentiment);
        console.log('  Label:', result.label);
        console.log('  Priority:', result.priority);
        console.log('  Scores:', JSON.stringify(result.score, null, 2));
        console.log('  Key Phrases:', result.keyPhrases);

        const valid =
            (result.sentiment === 'NEGATIVE' || result.label?.toLowerCase().includes('negative')) &&
            result.keyPhrases?.length > 0;

        if (valid) {
            console.log('\n🎉 Comprehend ✅ working');
            console.log('   → Sentiment: NEGATIVE ✓');
            console.log('   → Priority:', result.priority, '✓');
            console.log('   → KeyPhrases:', result.keyPhrases.length, 'phrases ✓');
        } else {
            console.log('\n⚠️  Unexpected result — review output above');
        }
    } catch (err) {
        console.error('\n❌ Comprehend error:', err.name, '-', err.message);
        if (err.name === 'AccessDeniedException') console.log('   Check IAM permissions for comprehend:DetectSentiment');
    }
}

test();
