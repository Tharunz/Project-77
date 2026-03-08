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
    // Try AWS Comprehend first
    if (process.env.ENABLE_COMPREHEND === 'true') {
        try {
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

            console.log('[Comprehend] AWS sentiment:', sentimentResult.Sentiment);
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
                keywords: keyPhrases,
                source: 'AWS Comprehend'
            };
        } catch (err) {
            if (err.name === 'AccessDeniedException') {
                console.log('[Comprehend] Blocked in Learner Labs, using local NLP');
            } else {
                console.log('[Comprehend] Error:', err.message, '— using local NLP');
            }
            // Fall through to local analysis
        }
    }

    // LOCAL SENTIMENT ANALYSIS (always works, no AWS needed)
    return analyzeLocally(text);
};

// =============================================================================
// LOCAL IMPLEMENTATION (unchanged logic from original)
// =============================================================================

const analyzeLocal = (text) => {
    if (!text || typeof text !== 'string') {
        return {
            label: 'Neutral', score: { Positive: 0.07, Negative: 0.07, Neutral: 0.84, Mixed: 0.02 },
            sentiment: 'NEUTRAL', priority: 'LOW', sentimentScore: 0.5, keywords: [], keyPhrases: [],
            source: 'Local NLP Engine'
        };
    }

    const lower = text.toLowerCase();
    
    // Critical keywords for immediate escalation
    const criticalKeywords = [
        'death','died','dying','dead','killed','murder',
        'rape','assault','attack','emergency','urgent',
        'child','children','baby','infant','starvation',
        'no water','no food','no medicine','hospital',
        'accident','collapse','flood','fire','disaster',
        'suicide','self harm','life threatening','critical'
    ];
    
    const negativeKeywords = [
        'problem','issue','complaint','broken','failed',
        'not working','no supply','stopped','blocked',
        'corrupt','bribe','harassment','delay','pending',
        'denied','rejected','unfair','illegal','fraud',
        'damage','loss','suffering','hardship','neglect',
        'pothole','leakage','shortage','outage','closed',
        'dirty','unclean','contaminated','polluted','unsafe'
    ];
    
    const positiveKeywords = [
        'resolved','fixed','working','good','thank',
        'appreciate','satisfied','completed','done','better',
        'excellent','outstanding','improved','proper'
    ];

    const hasCritical = criticalKeywords.some(k => lower.includes(k));
    const negCount = negativeKeywords.filter(k => lower.includes(k)).length;
    const posCount = positiveKeywords.filter(k => lower.includes(k)).length;
    
    let sentiment, sentimentScore, priority;
    
    if (hasCritical) {
        sentiment = 'NEGATIVE';
        sentimentScore = 0.05;
        priority = 'CRITICAL';
    } else if (negCount >= 3) {
        sentiment = 'NEGATIVE';
        sentimentScore = 0.15;
        priority = 'HIGH';
    } else if (negCount >= 1) {
        sentiment = 'NEGATIVE';
        sentimentScore = 0.30;
        priority = 'MEDIUM';
    } else if (posCount > negCount) {
        sentiment = 'POSITIVE';
        sentimentScore = 0.80;
        priority = 'LOW';
    } else {
        sentiment = 'NEUTRAL';
        sentimentScore = 0.50;
        priority = 'LOW';
    }
    
    // Extract key phrases locally (simple noun extraction)
    const words = text.split(' ')
        .filter(w => w.length > 4)
        .slice(0, 5);
    
    console.log(`[Comprehend] Local NLP: ${sentiment} (${sentimentScore}) priority:${priority}`);
    
    return {
        sentiment,
        sentimentScore,
        priority,
        keyPhrases: words,
        keywords: words,
        label: sentiment.charAt(0) + sentiment.slice(1).toLowerCase(),
        score: {
            Positive: sentiment === 'POSITIVE' ? sentimentScore : 0.1,
            Negative: sentiment === 'NEGATIVE' ? sentimentScore : 0.1,
            Neutral: sentiment === 'NEUTRAL' ? sentimentScore : 0.8,
            Mixed: 0.02
        },
        source: 'Local NLP Engine'
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
