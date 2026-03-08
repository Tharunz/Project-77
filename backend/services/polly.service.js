// ============================================
// polly.service.js — Text-to-Speech
// ENABLE_POLLY=false → returns null (frontend handles gracefully)
// ENABLE_POLLY=true  → Amazon Polly
// ============================================

const isPolly = () => process.env.ENABLE_POLLY === 'true';

// ─── Lazy Polly client ─────────────────────────────────────────────────────────
let _pollyClient = null;
const getPollyClient = () => {
    if (!_pollyClient) {
        const { PollyClient } = require('@aws-sdk/client-polly');
        const { awsConfig } = require('../config/aws.config');
        _pollyClient = new PollyClient(awsConfig);
    }
    return _pollyClient;
};

// ─── Voice mapping for Indian languages ───────────────────────────────────────
// Only voices available in Polly for Indian languages (standard engine only)
const VOICES = {
    hi: { id: 'Aditi', engine: 'standard', languageCode: 'hi-IN' },
    en: { id: 'Raveena', engine: 'standard', languageCode: 'en-IN' },
    // Fallback for unsupported languages → use English
    ta: { id: 'Raveena', engine: 'standard', languageCode: 'en-IN' },
    te: { id: 'Raveena', engine: 'standard', languageCode: 'en-IN' },
    bn: { id: 'Aditi', engine: 'standard', languageCode: 'hi-IN' },
    mr: { id: 'Aditi', engine: 'standard', languageCode: 'hi-IN' },
    gu: { id: 'Aditi', engine: 'standard', languageCode: 'hi-IN' },
    kn: { id: 'Raveena', engine: 'standard', languageCode: 'en-IN' },
    ml: { id: 'Raveena', engine: 'standard', languageCode: 'en-IN' },
    pa: { id: 'Aditi', engine: 'standard', languageCode: 'hi-IN' }
};

const DEFAULT_VOICE = { id: 'Raveena', engine: 'standard', languageCode: 'en-IN' };

// =============================================================================
// POLLY IMPLEMENTATION
// =============================================================================

/**
 * textToSpeech(text, languageCode) — Convert text to MP3 audio buffer
 * @param {string} text — Text to synthesize
 * @param {string} languageCode — Language code (hi, en, ta, etc.)
 * @returns {Buffer} — Raw MP3 audio buffer
 */
const textToSpeech = async (text, languageCode = 'en') => {
    if (!isPolly()) return null;

    const { SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
    const client = getPollyClient();

    const voice = VOICES[languageCode] || DEFAULT_VOICE;

    // Polly has a 3000 char limit per synthesis request
    const truncatedText = text.slice(0, 2900);

    const response = await client.send(new SynthesizeSpeechCommand({
        Text: truncatedText,
        OutputFormat: 'mp3',
        VoiceId: voice.id,
        Engine: voice.engine,
        LanguageCode: voice.languageCode
    }));

    // response.AudioStream is a readable stream — collect to buffer
    const chunks = [];
    for await (const chunk of response.AudioStream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

module.exports = { textToSpeech, isPolly, VOICES };
