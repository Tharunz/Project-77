// ============================================
// chatbot.service.js — Rule-Based Chatbot
// → AWS swap: Replace with Amazon Lex SDK
// ============================================

const INTENTS = {
    GRIEVANCE_STATUS: {
        keywords: ['status', 'track', 'grievance', 'complaint', 'filed', 'update', 'progress', 'where'],
        response: (lang) => RESPONSES[lang]?.grievance_status || RESPONSES['en'].grievance_status
    },
    SCHEME_INFO: {
        keywords: ['scheme', 'yojana', 'benefit', 'eligible', 'pm kisan', 'ayushman', 'awas', 'mudra'],
        response: (lang) => RESPONSES[lang]?.scheme_info || RESPONSES['en'].scheme_info
    },
    FILE_GRIEVANCE: {
        keywords: ['file', 'register', 'submit', 'new complaint', 'new grievance', 'report issue', 'problem'],
        response: (lang) => RESPONSES[lang]?.file_grievance || RESPONSES['en'].file_grievance
    },
    DOCUMENT_HELP: {
        keywords: ['document', 'upload', 'aadhar', 'photo', 'proof', 'certificate', 'attach'],
        response: (lang) => RESPONSES[lang]?.document_help || RESPONSES['en'].document_help
    },
    GREETING: {
        keywords: ['hello', 'hi', 'namaste', 'namaskar', 'good morning', 'hey', 'help', 'vanakam'],
        response: (lang) => RESPONSES[lang]?.greeting || RESPONSES['en'].greeting
    },
    CONTACT: {
        keywords: ['contact', 'phone', 'helpline', 'call', 'officer', 'number', 'toll free'],
        response: (lang) => RESPONSES[lang]?.contact || RESPONSES['en'].contact
    },
    THANKS: {
        keywords: ['thanks', 'thank you', 'dhanyawad', 'shukriya', 'nandri'],
        response: (lang) => RESPONSES[lang]?.thanks || RESPONSES['en'].thanks
    }
};

const RESPONSES = {
    en: {
        greeting: "🙏 Namaste! I'm Seva, your AI assistant for Project-77. I can help you:\n• Track your grievance\n• Find government schemes\n• File a new complaint\n• Get document help\n\nWhat would you like to do today?",
        grievance_status: "📋 To track your grievance, go to **Grievance Tracking** in the menu and enter your Tracking ID (e.g., GRV-001). You'll see real-time status updates and the assigned officer's details.",
        scheme_info: "🏛️ We have 20+ government schemes listed! Go to **Scheme Discovery** to find schemes you're eligible for based on your age, income, and state. Popular ones include PM Kisan, Ayushman Bharat, and PM Awas Yojana.",
        file_grievance: "📝 To file a grievance:\n1. Click **File a Grievance** from your dashboard\n2. Fill in the title, description, and category\n3. Upload supporting documents (optional)\n4. Submit to get a Tracking ID instantly",
        document_help: "📎 Accepted document formats: JPEG, PNG, PDF (max 10MB each). For grievances, upload relevant photos, Aadhar card, or supporting certificates. OCR will extract text automatically.",
        contact: "📞 Government Helpline: **1800-111-555** (Toll Free)\n📧 Email: grievance@project77.gov.in\n🕐 Working hours: Mon–Sat, 9am–6pm IST",
        thanks: "🙏 You're welcome! Is there anything else I can help you with? Your feedback matters to us.",
        fallback: "I'm not sure I understood that. Could you try rephrasing? I can help with:\n• Checking grievance status\n• Finding government schemes\n• Filing complaints\n• Document uploads\n\nOr type **help** to see all options."
    },
    hi: {
        greeting: "🙏 नमस्ते! मैं सेवा हूँ, Project-77 का AI सहायक। मैं आपकी सहायता कर सकता हूँ:\n• शिकायत की स्थिति जानें\n• सरकारी योजनाएं खोजें\n• नई शिकायत दर्ज करें\n\nआज मैं आपकी क्या मदद कर सकता हूँ?",
        grievance_status: "📋 अपनी शिकायत ट्रैक करने के लिए, मेनू में **शिकायत ट्रैकिंग** पर जाएं और अपना ट्रैकिंग ID (जैसे GRV-001) दर्ज करें।",
        fallback: "मुझे समझ नहीं आया। कृपया दोबारा प्रयास करें। मैं शिकायत स्थिति, सरकारी योजनाओं और शिकायत दर्ज करने में मदद कर सकता हूँ।"
    },
    ta: {
        greeting: "🙏 வணக்கம்! நான் சேவா, Project-77 AI உதவியாளர். நான் உங்களுக்கு:\n• புகாரின் நிலையை அறியலாம்\n• அரசு திட்டங்களை கண்டறியலாம்\n• புதிய புகார் பதிவு செய்யலாம்\n\nதொடரலாம்!",
        fallback: "புரியவில்லை. மீண்டும் முயற்சிக்கவும். புகார் நிலை, அரசு திட்டங்கள் மற்றும் புகார் பதிவு குறித்து உதவ தயாராக உள்ளேன்."
    }
};

const chatSessions = new Map(); // In-memory sessions (→ DynamoDB on AWS swap)

/**
 * Get a chatbot response for a user message.
 * → AWS Lex: lexRuntime.recognizeText({ botId, botAliasId, sessionId, text })
 */
const getResponse = (message, lang = 'en', userId = 'anonymous') => {
    const lower = message.toLowerCase();

    // Detect intent by keyword matching
    let matchedIntent = null;
    for (const [intentName, intent] of Object.entries(INTENTS)) {
        if (intent.keywords.some(kw => lower.includes(kw))) {
            matchedIntent = intent;
            break;
        }
    }

    const response = matchedIntent
        ? matchedIntent.response(lang)
        : (RESPONSES[lang]?.fallback || RESPONSES['en'].fallback);

    // Store in session history
    if (!chatSessions.has(userId)) {
        chatSessions.set(userId, []);
    }

    const history = chatSessions.get(userId);
    const entry = {
        id: Date.now(),
        userMessage: message,
        botResponse: response,
        lang,
        timestamp: new Date().toISOString()
    };
    history.push(entry);

    // Keep only last 50 messages per session
    if (history.length > 50) history.shift();

    return { response, sessionId: userId, timestamp: entry.timestamp };
};

/**
 * Get chat history for a user.
 */
const getHistory = (userId) => {
    return chatSessions.get(userId) || [];
};

/**
 * Clear chat history for a user.
 */
const clearHistory = (userId) => {
    chatSessions.delete(userId);
    return true;
};

module.exports = { getResponse, getHistory, clearHistory };
