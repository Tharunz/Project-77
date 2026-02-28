// ============================================
// translate.service.js — Text Translation
// → AWS swap: Replace with Amazon Translate SDK
// ============================================

// Simple i18n-style translation for common government phrases
// In local mode, we pass text through with a language tag prefix for demo purposes.
// The real language support lives in the frontend (i18n JSON files).

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
    'pa': 'ਪੰਜਾਬੀ (Punjabi)'
};

// Static phrase map for common government service phrases
const PHRASE_MAP = {
    hi: {
        'Your grievance has been filed successfully': 'आपकी शिकायत सफलतापूर्वक दर्ज की गई है',
        'Grievance filed': 'शिकायत दर्ज की गई',
        'Under Review': 'समीक्षाधीन',
        'Resolved': 'हल किया गया',
        'Pending': 'लंबित',
        'Government Scheme': 'सरकारी योजना'
    },
    ta: {
        'Your grievance has been filed successfully': 'உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
        'Grievance filed': 'புகார் பதிவு செய்யப்பட்டது',
        'Under Review': 'மதிப்பாய்வில்',
        'Resolved': 'தீர்க்கப்பட்டது',
        'Pending': 'நிலுவையில்',
        'Government Scheme': 'அரசு திட்டம்'
    }
};

/**
 * Translate text to target language.
 * Local: returns static translation or text with language prefix for demo.
 * → AWS Translate: translateClient.send(new TranslateTextCommand({ Text, SourceLanguageCode: 'auto', TargetLanguageCode }))
 *
 * @param {string} text
 * @param {string} targetLang - ISO 639-1 language code (en, hi, ta, etc.)
 * @returns {Promise<{ translatedText: string, sourceLang: string, targetLang: string }>}
 */
const translate = async (text, targetLang = 'en') => {
    if (!text) return { translatedText: '', sourceLang: 'en', targetLang };

    // If target is English or unsupported, return as-is
    if (targetLang === 'en' || !SUPPORTED_LANGUAGES[targetLang]) {
        return { translatedText: text, sourceLang: 'en', targetLang };
    }

    // Check static phrase map first
    const langMap = PHRASE_MAP[targetLang];
    if (langMap && langMap[text]) {
        return {
            translatedText: langMap[text],
            sourceLang: 'en',
            targetLang
        };
    }

    // For demo: prefix text with language name tag
    // → AWS Translate will handle this properly after March 7
    const langName = SUPPORTED_LANGUAGES[targetLang] || targetLang;
    return {
        translatedText: `[${langName}] ${text}`,
        sourceLang: 'en',
        targetLang
    };
};

const getSupportedLanguages = () => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({ code, name }));
};

module.exports = { translate, getSupportedLanguages, SUPPORTED_LANGUAGES };
