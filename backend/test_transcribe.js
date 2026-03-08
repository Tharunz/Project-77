// Test Amazon Transcribe using Polly
require('dotenv').config();
const { transcribeAudio, isTranscribe } = require('./services/transcribe.service');
const { textToSpeech } = require('./services/polly.service');

async function test() {
    console.log('ENABLE_TRANSCRIBE:', process.env.ENABLE_TRANSCRIBE);
    console.log('ENABLE_POLLY:', process.env.ENABLE_POLLY);

    try {
        console.log('\n🎙️ Generating a sample MP3 using Polly...');
        // Mock a quick speech
        const audioBuffer = await textToSpeech('Hello, I would like to report that the water supply is broken.', 'en');

        console.log('✅ Audio generated (' + audioBuffer.length + ' bytes)');
        console.log('\n🔍 Starting Transcribe job (polling up to 60s)...');

        // Use 'en-IN' for transcript English
        const result = await transcribeAudio(audioBuffer, 'en-IN');

        console.log('\n📄 Transcription Result:');
        console.log('---------------------');
        console.log(result.transcript || '(empty)');
        console.log('---------------------');
        console.log('Language:', result.language);
        console.log('Confidence:', result.confidence);

        if (result.transcript && result.transcript.length > 0 && result.transcript.toLowerCase().includes('water')) {
            console.log('\n🎉 Transcribe ✅ working');
        } else {
            console.log('\n⚠️ Check output. No valid transcript found.');
        }

    } catch (err) {
        console.error('\n❌ Transcribe error:', err.name, '-', err.message);
    }
}

test();
