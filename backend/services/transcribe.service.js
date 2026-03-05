// ============================================
// transcribe.service.js — Audio-to-Text Transcription
// ENABLE_TRANSCRIBE=false → returns mock transcription
// ENABLE_TRANSCRIBE=true  → Amazon Transcribe
// ============================================

const isTranscribe = () => process.env.ENABLE_TRANSCRIBE === 'true';

// ─── Lazy Transcribe client ────────────────────────────────────────────────────
let _transcribeClient = null;
const getTranscribeClient = () => {
    if (!_transcribeClient) {
        const { TranscribeClient } = require('@aws-sdk/client-transcribe');
        const { awsConfig } = require('../config/aws.config');
        _transcribeClient = new TranscribeClient(awsConfig);
    }
    return _transcribeClient;
};

// ─── Mock response ─────────────────────────────────────────────────────────────
const MOCK_RESPONSE = {
    transcript: "Water supply is not working in my area for three days",
    language: "en-IN",
    confidence: 0.95
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const SUPPORTED_LANGUAGES = ['hi-IN', 'ta-IN', 'te-IN', 'en-IN'];
const DEFAULT_LANG = 'hi-IN';

// =============================================================================
// TRANSCRIBE IMPLEMENTATION
// =============================================================================

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const transcribeAudio = async (audioBuffer, language = 'hi-IN') => {
    if (!isTranscribe()) return MOCK_RESPONSE;

    const { StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
    const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
    const { s3Client } = require('../config/aws.config');
    const client = getTranscribeClient();

    const bucketName = process.env.S3_BUCKET_NAME || 'ncie-documents-tharun';
    const jobName = `ncie-${Date.now()}`;
    const audioKey = `transcripts/${jobName}.mp3`;

    // 1. Upload audio to S3 first
    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: audioKey,
        Body: audioBuffer,
        ContentType: 'audio/mpeg'
    }));

    // 2. Start Transcription Job
    const langCode = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANG;

    await client.send(new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: langCode,
        MediaFormat: 'mp3',
        Media: {
            MediaFileUri: `s3://${bucketName}/${audioKey}`
        },
        OutputBucketName: bucketName,
        OutputKey: `transcripts/${jobName}.json`  // keep it organized
    }));

    // 3. Poll every 3 seconds for completion (max 60 seconds)
    let isCompleted = false;
    let attempts = 0;
    while (!isCompleted && attempts < 20) {
        attempts++;
        await delay(3000);
        const { TranscriptionJob } = await client.send(new GetTranscriptionJobCommand({
            TranscriptionJobName: jobName
        }));

        if (TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
            isCompleted = true;
        } else if (TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
            throw new Error('Transcription job failed: ' + TranscriptionJob.FailureReason);
        }
    }

    if (!isCompleted) {
        throw new Error('Transcription job timed out after 60 seconds.');
    }

    // 4. Fetch and return transcript text from S3
    const getObjRes = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: `transcripts/${jobName}.json`
    }));

    // Parse the stream (helper)
    const streamToString = (stream) =>
        new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });

    const jsonString = await streamToString(getObjRes.Body);
    const transcriptData = JSON.parse(jsonString);

    const transcriptText = transcriptData.results.transcripts[0]?.transcript || '';

    // Average confidence of items
    const items = transcriptData.results.items || [];
    const validItems = items.filter(i => i.alternatives && i.alternatives[0].confidence);
    const totalConfidence = validItems.reduce((acc, curr) => acc + parseFloat(curr.alternatives[0].confidence), 0);
    const confidence = validItems.length > 0 ? (totalConfidence / validItems.length) : 0;

    return {
        transcript: transcriptText.trim(),
        language: langCode,
        confidence: parseFloat(confidence.toFixed(2))
    };
};

module.exports = { transcribeAudio, isTranscribe, SUPPORTED_LANGUAGES };
