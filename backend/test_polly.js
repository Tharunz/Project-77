// Test Amazon Polly
require('dotenv').config();

const { textToSpeech, isPolly } = require('./services/polly.service');

async function test() {
    console.log('ENABLE_POLLY:', process.env.ENABLE_POLLY);
    console.log('Polly mode:', isPolly());

    if (!isPolly()) {
        console.log('❌ Polly is disabled');
        return;
    }

    try {
        console.log('\n🎙️ Testing English text (Raveena)');
        const enBuffer = await textToSpeech('Your grievance has been successfully resolved.', 'en');
        if (enBuffer && enBuffer.length > 0) {
            console.log('✅ English Audio generated: ' + enBuffer.length + ' bytes');
        } else {
            console.log('❌ English Audio failed');
        }

        console.log('\n🎙️ Testing Hindi text (Aditi)');
        const hiBuffer = await textToSpeech('आपकी शिकायत का सफलतापूर्वक समाधान कर दिया गया है।', 'hi');
        if (hiBuffer && hiBuffer.length > 0) {
            console.log('✅ Hindi Audio generated: ' + hiBuffer.length + ' bytes');
        } else {
            console.log('❌ Hindi Audio failed');
        }

        if (enBuffer && hiBuffer) {
            console.log('\n🎉 Polly ✅ working');
        }
    } catch (err) {
        console.error('\n❌ Polly error:', err.name, '-', err.message);
    }
}

test();
