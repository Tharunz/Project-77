// ============================================
// chatbot.service.js — Rule-Based Chatbot or Amazon Lex
// ENABLE_LEX=false → local rule-based chatbot
// ENABLE_LEX=true  → Amazon Lex V2
// ============================================

const isLex = () => process.env.ENABLE_LEX === 'true';

// ─── Lazy Lex client ───────────────────────────────────────────────────────────
let _lexClient = null;
const getLexClient = () => {
    if (!_lexClient) {
        const { LexRuntimeV2Client } = require('@aws-sdk/client-lex-runtime-v2');
        const { awsConfig } = require('../config/aws.config');
        _lexClient = new LexRuntimeV2Client(awsConfig);
    }
    return _lexClient;
};

// =============================================================================
// LOCAL IMPLEMENTATION (Rule-Based from original)
// =============================================================================

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
    RESOLUTION_TIME: {
        keywords: ['how long', 'resolution', 'days', 'wait', 'duration', 'take time', 'how many days', 'time take', 'when will', 'deadline'],
        response: (lang) => RESPONSES[lang]?.resolution_time || RESPONSES['en'].resolution_time
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
        greeting: "🙏 Namaste! I'm Seva, your AI assistant for Project NCIE. I can help you:\n• Track your grievance\n• Find government schemes\n• File a new complaint\n• Get document help\n\nWhat would you like to do today?",
        grievance_status: "📋 To track your grievance, go to **Grievance Tracking** in the menu and enter your Tracking ID (e.g., GRV-001). You'll see real-time status updates and the assigned officer's details.",
        scheme_info: "🏛️ We have 20+ government schemes listed! Go to **Scheme Discovery** to find schemes you're eligible for based on your age, income, and state. Popular ones include PM Kisan, Ayushman Bharat, and PM Awas Yojana.",
        file_grievance: "📝 To file a grievance:\n1. Click **File a Grievance** from your dashboard\n2. Fill in the title, description, and category\n3. Upload supporting documents (optional)\n4. Submit to get a Tracking ID instantly",
        document_help: "📎 Accepted document formats: JPEG, PNG, PDF (max 10MB each). For grievances, upload relevant photos, Aadhar card, or supporting certificates. OCR will extract text automatically.",
        contact: "📞 Government Helpline: **1800-111-555** (Toll Free)\n📧 Email: grievance@project77.gov.in\n🕐 Working hours: Mon–Sat, 9am–6pm IST",
        resolution_time: "⏱️ Resolution timelines depend on the category:\n• **General issues**: 7–15 business days\n• **Critical/Escalated**: 48–72 hours\n• **Water/Power/Health**: 3–5 days (priority)\n• **Infrastructure**: 15–30 days\n\nYou can track progress live in **Track Grievance**. Overdue cases are auto-escalated.",
        thanks: "🙏 You're welcome! Is there anything else I can help you with? Your feedback matters to us.",
        fallback: "I'm not sure I understood that. Could you try rephrasing? I can help with:\n• Checking grievance status\n• Finding government schemes\n• Filing complaints\n• Document uploads\n\nOr type **help** to see all options."
    }
    // other languages omitted for brevity when falling back to Lex
};

const chatSessions = new Map(); // In-memory sessions

/**
 * getResponseLocal(message, lang, userId)
 */
const getResponseLocal = async (message, lang = 'en', userId = 'anonymous') => {
    const lower = message.toLowerCase();

    // Detect intent by keyword matching
    let matchedIntent = null;
    let intentNameDetected = 'FallbackIntent';

    for (const [intentName, intent] of Object.entries(INTENTS)) {
        if (intent.keywords.some(kw => lower.includes(kw))) {
            matchedIntent = intent;
            intentNameDetected = intentName;
            break;
        }
    }

    const responseText = matchedIntent
        ? matchedIntent.response(lang)
        : (RESPONSES[lang]?.fallback || RESPONSES['en'].fallback);

    // Prepare standardized return object mimicking Lex for frontend compatibility
    return {
        message: responseText,
        intent: intentNameDetected,
        sessionId: userId,
        sessionState: { intent: { name: intentNameDetected, state: 'ReadyForFulfillment' } }
    };
};


// =============================================================================
// LEX IMPLEMENTATION
// =============================================================================

const getResponseLex = async (message, userId = 'anonymous') => {
    const { RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');
    const client = getLexClient();

    const botId = process.env.LEX_BOT_ID;
    const botAliasId = process.env.LEX_BOT_ALIAS_ID;
    const localeId = process.env.LEX_LOCALE_ID || 'en_US';

    if (!botId || !botAliasId) {
        throw new Error('Lex Bot ID and Alias ID are missing in .env config.');
    }

    const response = await client.send(new RecognizeTextCommand({
        botId,
        botAliasId,
        localeId,
        sessionId: userId,  // Keep context based on user id
        text: message
    }));

    const responseMessages = response.messages || [];
    const intentName = response.sessionState?.intent?.name || 'FallbackIntent';
    const combinedMessage = responseMessages.map(m => m.content).join('\n')
        || "I couldn't generate a response.";

    return {
        message: combinedMessage,
        intent: intentName,
        sessionId: userId,
        sessionState: response.sessionState
    };
};


// =============================================================================
// PUBLIC INTERFACE
// =============================================================================

/**
 * processMessage(message, sessionId, userId)
 */
const processMessage = async (message, sessionId, userId) => {
    // Both now return standardize format
    const response = isLex()
        ? await getResponseLex(message, userId || sessionId || 'anonymous')
        : await getResponseLocal(message, 'en', userId || sessionId || 'anonymous');

    // Store in session history
    const historyId = userId || sessionId || 'anonymous';
    if (!chatSessions.has(historyId)) chatSessions.set(historyId, []);

    const history = chatSessions.get(historyId);
    history.push({
        id: Date.now(),
        userMessage: message,
        botResponse: response.message,
        timestamp: new Date().toISOString()
    });

    // Keep only last 50 messages per session
    if (history.length > 50) history.shift();

    return response;
};

/**
 * getResponse(message, lang, userId) — Legacy entry point, used by chatbot.routes.js
 */
const getResponse = async (message, lang = 'en', userId = 'anonymous') => {
    const res = await processMessage(message, userId, userId);
    return {
        response: res.message,
        intent: res.intent,
        sessionId: res.sessionId,
        sessionState: res.sessionState,
        timestamp: new Date().toISOString()
    };
};

const getHistory = (userId) => chatSessions.get(userId) || [];
const clearHistory = (userId) => {
    chatSessions.delete(userId);
    return true;
};

module.exports = { processMessage, getResponse, getHistory, clearHistory, isLex };
