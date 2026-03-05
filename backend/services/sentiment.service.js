// ============================================
// sentiment.service.js — Sentiment Analysis
// ENABLE_COMPREHEND=false → local 'sentiment' npm package
// ENABLE_COMPREHEND=true  → Amazon Comprehend
// ============================================

const SentimentAnalyzer = require('sentiment');
const localAnalyzer = new SentimentAnalyzer();

// ─── Flag check ────────────────────────────────────────────────────────────────
const isComprehend = () => process.env.ENABLE_COMPREHEND === 'true';

// ─── Lazy AWS imports ──────────────────────────────────────────────────────────
let _comprehendClient = null;
const getComprehendClient = () => {
    if (!_comprehendClient) {
        const { ComprehendClient } = require('@aws-sdk/client-comprehend');
        const { awsConfig } = require('../config/aws.config');
        _comprehendClient = new ComprehendClient(awsConfig);
    }
    return _comprehendClient;
};

// ─── Mock response for when Comprehend is disabled ────────────────────────────
const MOCK_COMPREHEND_RESPONSE = {
    sentiment: 'NEGATIVE',
    score: { Negative: 0.89, Positive: 0.02, Neutral: 0.07, Mixed: 0.02 },
    priority: 'HIGH',
    keyPhrases: ['water supply', 'not working', '3 days']
};

// ─── Priority calculator ───────────────────────────────────────────────────────
const calcPriority = (negativeScore) => {
    if (negativeScore > 0.8) return 'CRITICAL';
    if (negativeScore > 0.6) return 'HIGH';
    if (negativeScore > 0.4) return 'MEDIUM';
    return 'LOW';
};

// ─── Map Comprehend label to app label ────────────────────────────────────────
const mapLabel = (comprehendLabel) => {
    const map = {
        'POSITIVE': 'Positive',
        'NEGATIVE': 'Negative',
        'NEUTRAL': 'Neutral',
        'MIXED': 'Neutral'
    };
    return map[comprehendLabel] || 'Neutral';
};

// =============================================================================
// COMPREHEND IMPLEMENTATION
// =============================================================================

const analyzeWithComprehend = async (text) => {
    const {
        DetectSentimentCommand,
        DetectKeyPhrasesCommand
    } = require('@aws-sdk/client-comprehend');

    const client = getComprehendClient();

    // Enforce Comprehend's 5000 char limit
    const truncatedText = text.slice(0, 4900);

    // Run sentiment + key phrases in parallel for speed
    const [sentimentResult, keyPhrasesResult] = await Promise.all([
        client.send(new DetectSentimentCommand({
            Text: truncatedText,
            LanguageCode: 'en'
        })),
        client.send(new DetectKeyPhrasesCommand({
            Text: truncatedText,
            LanguageCode: 'en'
        }))
    ]);

    const scores = sentimentResult.SentimentScore;
    const negativeScore = scores.Negative || 0;
    const priority = calcPriority(negativeScore);

    const keyPhrases = (keyPhrasesResult.KeyPhrases || [])
        .sort((a, b) => b.Score - a.Score)
        .slice(0, 8)
        .map(kp => kp.Text.toLowerCase());

    return {
        // Comprehend raw fields
        sentiment: sentimentResult.Sentiment,
        score: {
            Positive: parseFloat((scores.Positive || 0).toFixed(4)),
            Negative: parseFloat((scores.Negative || 0).toFixed(4)),
            Neutral: parseFloat((scores.Neutral || 0).toFixed(4)),
            Mixed: parseFloat((scores.Mixed || 0).toFixed(4))
        },
        priority,
        keyPhrases,

        // App-compatible fields (used by existing routes)
        label: mapLabel(sentimentResult.Sentiment),
        sentimentScore: parseFloat((negativeScore < 0.5
            ? 0.5 + (scores.Positive || 0) * 0.5
            : 1 - negativeScore
        ).toFixed(3)),
        keywords: keyPhrases
    };
};

// =============================================================================
// LOCAL IMPLEMENTATION (unchanged logic from original)
// =============================================================================

const analyzeLocal = (text) => {
    if (!text || typeof text !== 'string') {
        return {
            label: 'Neutral', score: { Positive: 0.07, Negative: 0.07, Neutral: 0.84, Mixed: 0.02 },
            sentiment: 'NEUTRAL', priority: 'LOW', sentimentScore: 0.5, keywords: [], keyPhrases: []
        };
    }

    const result = localAnalyzer.analyze(text);

    // Normalize comparative score (-5 to +5) to 0-1 range
    const normalized = Math.max(0, Math.min(1, (result.comparative + 5) / 10));

    let label;
    if (result.comparative >= 1.5) label = 'Positive';
    else if (result.comparative >= 0.3) label = 'Positive';
    else if (result.comparative > -0.3) label = 'Neutral';
    else if (result.comparative > -1.5) label = 'Negative';
    else label = 'Highly Negative';

    const simplifiedLabel =
        label === 'Highly Negative' ? 'Highly Negative' :
            label === 'Negative' ? 'Negative' :
                label === 'Neutral' ? 'Neutral' : 'Positive';

    const priority =
        result.comparative < -1.5 ? 'CRITICAL' :
            result.comparative < -0.5 ? 'HIGH' :
                result.comparative < 0.3 ? 'MEDIUM' : 'LOW';

    // Also surface readable priority for UI (Title case)
    const priorityDisplay =
        priority === 'CRITICAL' ? 'Critical' :
            priority === 'HIGH' ? 'High' :
                priority === 'MEDIUM' ? 'Medium' : 'Low';

    return {
        label: simplifiedLabel,
        sentiment: simplifiedLabel.toUpperCase().replace(' ', '_'),
        score: {
            Positive: parseFloat(Math.max(0, result.comparative / 5).toFixed(3)),
            Negative: parseFloat(Math.max(0, -result.comparative / 5).toFixed(3)),
            Neutral: parseFloat(normalized.toFixed(3)),
            Mixed: 0.02
        },
        sentimentScore: parseFloat(normalized.toFixed(3)),
        comparative: parseFloat(result.comparative.toFixed(3)),
        priority: priorityDisplay,   // Title case for UI
        priorityRaw: priority,       // CAPS for internal use
        positive: result.positive,
        negative: result.negative,
        keywords: [...result.positive, ...result.negative].slice(0, 5),
        keyPhrases: [...result.positive, ...result.negative].slice(0, 5)
    };
};

// =============================================================================
// PUBLIC INTERFACE
// =============================================================================

/**
 * analyze(text) — Main entry point. Sync when Comprehend off, async when on.
 * Called by grievance routes as: analyzeSentiment(description)
 * Supports both sync usage (local) and async (Comprehend).
 */
const analyze = (text) => {
    if (!isComprehend()) {
        return analyzeLocal(text);
    }
    // Returns a Promise when Comprehend is enabled
    return analyzeWithComprehend(text);
};

/**
 * analyzeSentiment — Alias for backward compatibility with grievance route usage.
 * Always returns a Promise (resolves immediately in local mode).
 */
const analyzeSentiment = async (text) => {
    if (!isComprehend()) {
        return analyzeLocal(text);
    }
    return analyzeWithComprehend(text);
};

module.exports = { analyze, analyzeSentiment, isComprehend, MOCK_COMPREHEND_RESPONSE };
