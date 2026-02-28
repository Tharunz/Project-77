// ============================================
// sentiment.service.js — Sentiment Analysis
// → AWS swap: Replace with Amazon Comprehend SDK
// ============================================

const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

/**
 * Analyze the sentiment of a text string.
 * Returns a normalized label + score.
 * → AWS Comprehend: comprehend.detectSentiment({ Text, LanguageCode: 'en' })
 *
 * @param {string} text - The text to analyze
 * @returns {{ label: string, score: number, comparative: number, keywords: string[] }}
 */
const analyze = (text) => {
    if (!text || typeof text !== 'string') {
        return { label: 'neutral', score: 0, comparative: 0, keywords: [] };
    }

    const result = sentimentAnalyzer.analyze(text);

    // Normalize comparative score (-5 to +5) to 0-1 range
    const normalized = Math.max(0, Math.min(1, (result.comparative + 5) / 10));

    let label;
    if (result.comparative >= 1.5) label = 'positive';
    else if (result.comparative >= 0.3) label = 'slightly_positive';
    else if (result.comparative > -0.3) label = 'neutral';
    else if (result.comparative > -1.5) label = 'negative';
    else label = 'highly_negative';

    // Map to simpler labels for the frontend
    const simplifiedLabel =
        label === 'positive' || label === 'slightly_positive' ? 'Positive' :
            label === 'neutral' ? 'Neutral' :
                label === 'negative' ? 'Negative' : 'Highly Negative';

    // Determine priority based on sentiment
    const priority =
        result.comparative < -1.5 ? 'Critical' :
            result.comparative < -0.5 ? 'High' :
                result.comparative < 0.3 ? 'Medium' : 'Low';

    return {
        label: simplifiedLabel,
        score: parseFloat(normalized.toFixed(3)),
        comparative: parseFloat(result.comparative.toFixed(3)),
        priority,
        positive: result.positive,
        negative: result.negative,
        keywords: [...result.positive, ...result.negative].slice(0, 5)
    };
};

module.exports = { analyze };
