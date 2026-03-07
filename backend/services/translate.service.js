// ============================================
// translate.service.js — Text Translation
// ENABLE_TRANSLATE=false → static phrase map + passthrough
// ENABLE_TRANSLATE=true  → Amazon Translate
// ============================================

// ─── Flag check ────────────────────────────────────────────────────────────────
const isTranslate = () => process.env.ENABLE_TRANSLATE === 'true';

// ─── Lazy AWS imports ──────────────────────────────────────────────────────────
let _translateClient = null;
const getTranslateClient = () => {
    if (!_translateClient) {
        const { TranslateClient } = require('@aws-sdk/client-translate');
        const { awsConfig } = require('../config/aws.config');
        _translateClient = new TranslateClient(awsConfig);
    }
    return _translateClient;
};

// ─── Supported language codes ─────────────────────────────────────────────────
const LANGUAGES = {
    hindi: 'hi',
    tamil: 'ta',
    telugu: 'te',
    bengali: 'bn',
    marathi: 'mr',
    gujarati: 'gu',
    kannada: 'kn',
    malayalam: 'ml',
    punjabi: 'pa',
    odia: 'or',
    english: 'en'
};

const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'हिन्दी (Hindi)',
    'ta': 'தமிழ் (Tamil)',
    'te': 'తెలుగు (Telugu)',
    'bn': 'বাংলা (Bengali)',
    'mr': 'मराठी (Marathi)',
    'gu': 'ગુજરાતી (Gujarati)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)',
    'or': 'ଓଡ଼ିଆ (Odia)'
};

// ─── Static phrase map for when Translate is disabled ─────────────────────────
const PHRASE_MAP = {
    hi: {
        'Your grievance has been filed successfully': 'आपकी शिकायत सफलतापूर्वक दर्ज की गई है',
        'Grievance filed': 'शिकायत दर्ज की गई',
        'Under Review': 'समीक्षाधीन',
        'Resolved': 'हल किया गया',
        'Pending': 'लंबित',
        'In Progress': 'प्रगति में',
        'Government Scheme': 'सरकारी योजना',
        'Submit': 'जमा करें',
        'Track Grievance': 'शिकायत ट्रैक करें',
        'File a Grievance': 'शिकायत दर्ज करें',
        'Status': 'स्थिति',
        'Tracking ID': 'ट्रैकिंग आईडी',
        'Critical': 'गंभीर',
        'Escalated': 'आगे भेजा गया',
        'Closed': 'बंद',
        'Welcome': 'स्वागत है',
        'Citizen': 'नागरिक',
        'Department': 'विभाग'
    },
    ta: {
        'Resolved': 'தீர்க்கப்பட்டது',
        'Pending': 'நிலுவையில்',
        'In Progress': 'நடவடிக்கையில்',
        'Government Scheme': 'அரசு திட்டம்',
        'Status': 'நிலை',
        'Critical': 'அவசரமானது',
        'Escalated': 'மேல்முறையீடு',
        'Closed': 'மூடப்பட்டது',
        'Welcome': 'வரவேற்கிறோம்'
    }
    // (other languages remain, removed for brevity — AWS Translate handles them)
};

// =============================================================================
// AWS TRANSLATE IMPLEMENTATION
// =============================================================================

/**
 * translateText(text, targetLang) — Translate using Amazon Translate
 * Uses SourceLanguageCode: "auto" for automatic detection.
 */
const translateTextAWS = async (text, targetLang) => {
    const { TranslateTextCommand } = require('@aws-sdk/client-translate');
    const client = getTranslateClient();

    // Resolve language name to code (e.g. "hindi" → "hi")
    const targetCode = LANGUAGES[targetLang?.toLowerCase()] || targetLang || 'en';

    if (targetCode === 'en') {
        return { translatedText: text, detectedLang: 'en', targetLang: 'en' };
    }

    try {
        const response = await client.send(new TranslateTextCommand({
            Text: text,
            SourceLanguageCode: 'auto',
            TargetLanguageCode: targetCode
        }));

        return {
            translatedText: response.TranslatedText,
            detectedLang: response.AppliedTerminologies?.[0] || 'en',
            sourceLang: response.SourceLanguageCode,
            targetLang: targetCode
        };
    } catch (err) {
        if (err.name === 'AccessDeniedException' || err.name === 'UnrecognizedClientException' || err.name === 'InvalidClientTokenId') {
            console.log('[Translate] AWS blocked in Learner Labs — returning original text');
            return { translatedText: text, detectedLang: 'en', targetLang: targetCode };
        }
        throw err;
    }
};

/**
 * translateGrievance(grievanceId, targetLang) — Fetch from DynamoDB + translate title + description
 */
const translateGrievance = async (grievanceId, targetLang) => {
    const db = require('./db.service');
    const grievance = await db.get(
        process.env.DYNAMO_GRIEVANCES_TABLE || 'ncie-grievances',
        { grievanceId }
    );

    if (!grievance) throw new Error('Grievance not found: ' + grievanceId);

    const [translatedTitle, translatedDesc] = await Promise.all([
        translateTextAWS(grievance.title, targetLang),
        translateTextAWS(grievance.description, targetLang)
    ]);

    return {
        grievanceId,
        originalTitle: grievance.title,
        originalDescription: grievance.description,
        translatedTitle: translatedTitle.translatedText,
        translatedDescription: translatedDesc.translatedText,
        targetLang,
        // Original grievance data (do NOT overwrite)
        ...grievance
    };
};

// =============================================================================
// LOCAL FALLBACK IMPLEMENTATION
// =============================================================================

const translateLocal = async (text, targetLang) => {
    if (!text) return { translatedText: '', detectedLang: 'en', targetLang };

    const targetCode = LANGUAGES[targetLang?.toLowerCase()] || targetLang || 'en';

    if (targetCode === 'en' || !SUPPORTED_LANGUAGES[targetCode]) {
        return { translatedText: text, detectedLang: 'en', targetLang: targetCode };
    }

    // Check static phrase map first
    const langMap = PHRASE_MAP[targetCode];
    if (langMap && langMap[text]) {
        return { translatedText: langMap[text], detectedLang: 'en', sourceLang: 'en', targetLang: targetCode };
    }

    // Passthrough with language tag for demo
    const langName = SUPPORTED_LANGUAGES[targetCode] || targetCode;
    return {
        translatedText: `[${langName}] ${text}`,
        detectedLang: 'en',
        targetLang: targetCode
    };
};

// =============================================================================
// PUBLIC INTERFACE
// =============================================================================

/**
 * translateText(text, targetLang) — Main translate function. Always returns a Promise.
 */
const translateText = async (text, targetLang) => {
    if (isTranslate()) return translateTextAWS(text, targetLang);
    return translateLocal(text, targetLang);
};

/**
 * translate — Alias used by existing translate.routes.js
 */
const translate = translateText;

/**
 * getSupportedLanguages() — List of supported language codes and names
 */
const getSupportedLanguages = () =>
    Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({ code, name }));

module.exports = {
    translate,
    translateText,
    translateGrievance,
    getSupportedLanguages,
    SUPPORTED_LANGUAGES,
    LANGUAGES,
    isTranslate
};
