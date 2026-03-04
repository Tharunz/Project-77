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

// Static phrase map for common government service phrases across all 10 supported languages
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
        'Your grievance has been filed successfully': 'உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
        'Grievance filed': 'புகார் பதிவு செய்யப்பட்டது',
        'Under Review': 'மதிப்பாய்வில்',
        'Resolved': 'தீர்க்கப்பட்டது',
        'Pending': 'நிலுவையில்',
        'In Progress': 'நடவடிக்கையில்',
        'Government Scheme': 'அரசு திட்டம்',
        'Submit': 'சமர்ப்பி',
        'Track Grievance': 'புகாரை கண்காணி',
        'File a Grievance': 'புகார் பதிவு செய்',
        'Status': 'நிலை',
        'Tracking ID': 'கண்காணிப்பு ID',
        'Critical': 'அவசரமானது',
        'Escalated': 'மேல்முறையீடு',
        'Closed': 'மூடப்பட்டது',
        'Welcome': 'வரவேற்கிறோம்',
        'Citizen': 'குடிமகன்',
        'Department': 'துறை'
    },
    te: {
        'Your grievance has been filed successfully': 'మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది',
        'Grievance filed': 'ఫిర్యాదు నమోదు చేయబడింది',
        'Under Review': 'పరిశీలనలో ఉంది',
        'Resolved': 'పరిష్కరించబడింది',
        'Pending': 'పెండింగ్‌లో ఉంది',
        'In Progress': 'పురోగతిలో ఉంది',
        'Government Scheme': 'ప్రభుత్వ పథకం',
        'Submit': 'సమర్పించు',
        'Track Grievance': 'ఫిర్యాదు ట్రాక్ చేయి',
        'File a Grievance': 'ఫిర్యాదు నమోదు చేయి',
        'Status': 'స్థితి',
        'Tracking ID': 'ట్రాకింగ్ ID',
        'Critical': 'విమర్శనాత్మకం',
        'Escalated': 'తీవ్రతరం చేయబడింది',
        'Closed': 'మూసివేయబడింది',
        'Welcome': 'స్వాగతం',
        'Citizen': 'పౌరుడు',
        'Department': 'విభాగం'
    },
    bn: {
        'Your grievance has been filed successfully': 'আপনার অভিযোগ সফলভাবে দাখিল করা হয়েছে',
        'Grievance filed': 'অভিযোগ দাখিল করা হয়েছে',
        'Under Review': 'পর্যালোচনাধীন',
        'Resolved': 'সমাধান করা হয়েছে',
        'Pending': 'মুলতবি',
        'In Progress': 'চলমান',
        'Government Scheme': 'সরকারি প্রকল্প',
        'Submit': 'জমা দিন',
        'Track Grievance': 'অভিযোগ ট্র্যাক করুন',
        'File a Grievance': 'অভিযোগ দাখিল করুন',
        'Status': 'অবস্থা',
        'Tracking ID': 'ট্র্যাকিং ID',
        'Critical': 'জরুরি',
        'Escalated': 'উচ্চতর পর্যায়ে পাঠানো হয়েছে',
        'Closed': 'বন্ধ',
        'Welcome': 'স্বাগতম',
        'Citizen': 'নাগরিক',
        'Department': 'বিভাগ'
    },
    mr: {
        'Your grievance has been filed successfully': 'तुमची तक्रार यशस्वीरित्या नोंदवली गेली आहे',
        'Grievance filed': 'तक्रार नोंदवली गेली',
        'Under Review': 'आढाव्याधीन',
        'Resolved': 'निराकरण केले',
        'Pending': 'प्रलंबित',
        'In Progress': 'प्रगतीपथावर',
        'Government Scheme': 'सरकारी योजना',
        'Submit': 'सादर करा',
        'Track Grievance': 'तक्रार ट्रॅक करा',
        'File a Grievance': 'तक्रार नोंदवा',
        'Status': 'स्थिती',
        'Tracking ID': 'ट्रॅकिंग ID',
        'Critical': 'गंभीर',
        'Escalated': 'उच्च स्तरावर पाठवले',
        'Closed': 'बंद',
        'Welcome': 'स्वागत आहे',
        'Citizen': 'नागरिक',
        'Department': 'विभाग'
    },
    gu: {
        'Your grievance has been filed successfully': 'તમારી ફરિયાદ સફળતાપૂર્વક નોંધવામાં આવી છે',
        'Grievance filed': 'ફરિયાદ નોંધવામાં આવી',
        'Under Review': 'સમીક્ષા હેઠળ',
        'Resolved': 'ઉકેલ્યું',
        'Pending': 'બાકી',
        'In Progress': 'પ્રગતિમાં',
        'Government Scheme': 'સરકારી યોજના',
        'Submit': 'સબમિટ કરો',
        'Track Grievance': 'ફરિયાદ ટ્રૅક કરો',
        'File a Grievance': 'ફરિયાદ નોંધાવો',
        'Status': 'સ્થિતિ',
        'Tracking ID': 'ટ્રૅકિંગ ID',
        'Critical': 'ગંભીર',
        'Escalated': 'ઉચ્ચ સ્તરે મોકલ્યું',
        'Closed': 'બંધ',
        'Welcome': 'સ્વાગત',
        'Citizen': 'નાગરિક',
        'Department': 'વિભાગ'
    },
    kn: {
        'Your grievance has been filed successfully': 'ನಿಮ್ಮ ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ',
        'Grievance filed': 'ದೂರು ದಾಖಲಾಗಿದೆ',
        'Under Review': 'ಪರಿಶೀಲನೆಯಲ್ಲಿ',
        'Resolved': 'ಪರಿಹರಿಸಲಾಗಿದೆ',
        'Pending': 'ಬಾಕಿ',
        'In Progress': 'ಪ್ರಗತಿಯಲ್ಲಿ',
        'Government Scheme': 'ಸರ್ಕಾರಿ ಯೋಜನೆ',
        'Submit': 'ಸಲ್ಲಿಸಿ',
        'Track Grievance': 'ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
        'File a Grievance': 'ದೂರು ದಾಖಲಿಸಿ',
        'Status': 'ಸ್ಥಿತಿ',
        'Tracking ID': 'ಟ್ರ್ಯಾಕಿಂಗ್ ID',
        'Critical': 'ಗಂಭೀರ',
        'Escalated': 'ಮೇಲ್ಮಟ್ಟಕ್ಕೆ ಕಳುಹಿಸಲಾಗಿದೆ',
        'Closed': 'ಮುಚ್ಚಲಾಗಿದೆ',
        'Welcome': 'ಸ್ವಾಗತ',
        'Citizen': 'ನಾಗರಿಕ',
        'Department': 'ಇಲಾಖೆ'
    },
    ml: {
        'Your grievance has been filed successfully': 'നിങ്ങളുടെ പരാതി വിജയകരമായി ഫയൽ ചെയ്തു',
        'Grievance filed': 'പരാതി ഫയൽ ചെയ്തു',
        'Under Review': 'അവലോകനത്തിൽ',
        'Resolved': 'പരിഹരിച്ചു',
        'Pending': 'തീർപ്പാക്കാത്തത്',
        'In Progress': 'പ്രക്രിയയിൽ',
        'Government Scheme': 'സർക്കാർ പദ്ധതി',
        'Submit': 'സമർപ്പിക്കുക',
        'Track Grievance': 'പരാതി ട്രാക്ക് ചെയ്യുക',
        'File a Grievance': 'പരാതി ഫയൽ ചെയ്യുക',
        'Status': 'നില',
        'Tracking ID': 'ട്രാക്കിംഗ് ID',
        'Critical': 'ഗുരുതരം',
        'Escalated': 'ഉയർന്ന തലത്തിലേക്ക് അയച്ചു',
        'Closed': 'അടച്ചു',
        'Welcome': 'സ്വാഗതം',
        'Citizen': 'പൗരൻ',
        'Department': 'വകുപ്പ്'
    },
    pa: {
        'Your grievance has been filed successfully': 'ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕੀਤੀ ਗਈ ਹੈ',
        'Grievance filed': 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕੀਤੀ ਗਈ',
        'Under Review': 'ਸਮੀਖਿਆ ਅਧੀਨ',
        'Resolved': 'ਹੱਲ ਕੀਤਾ ਗਿਆ',
        'Pending': 'ਲੰਬਿਤ',
        'In Progress': 'ਪ੍ਰਗਤੀ ਵਿੱਚ',
        'Government Scheme': 'ਸਰਕਾਰੀ ਯੋਜਨਾ',
        'Submit': 'ਜਮ੍ਹਾਂ ਕਰੋ',
        'Track Grievance': 'ਸ਼ਿਕਾਇਤ ਟਰੈਕ ਕਰੋ',
        'File a Grievance': 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ',
        'Status': 'ਸਥਿਤੀ',
        'Tracking ID': 'ਟਰੈਕਿੰਗ ID',
        'Critical': 'ਗੰਭੀਰ',
        'Escalated': 'ਉੱਚ ਪੱਧਰ ਤੇ ਭੇਜਿਆ',
        'Closed': 'ਬੰਦ',
        'Welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ',
        'Citizen': 'ਨਾਗਰਿਕ',
        'Department': 'ਵਿਭਾਗ'
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
