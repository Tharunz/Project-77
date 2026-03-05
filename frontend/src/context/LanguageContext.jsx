import React, { createContext, useContext, useState, useCallback } from 'react';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

// Core UI string translations (key UI labels only — full i18n ready for AWS Translate swap)
const TRANSLATIONS = {
    en: {
        dashboard: 'My Dashboard', schemes: 'Explore Schemes', fileGrievance: 'File Grievance',
        trackGrievance: 'Track Grievance', roadmap: 'Benefit Roadmap', assistant: 'AI Assistant',
        community: 'Community', news: 'Seva News', profile: 'My Profile', logout: 'Logout',
        welcome: 'Welcome', grievances: 'Grievances', resolved: 'Resolved', pending: 'Pending',
        submit: 'Submit', cancel: 'Cancel', save: 'Save', loading: 'Loading…',
    },
    hi: {
        dashboard: 'मेरा डैशबोर्ड', schemes: 'योजनाएं देखें', fileGrievance: 'शिकायत दर्ज करें',
        trackGrievance: 'शिकायत ट्रैक करें', roadmap: 'लाभ रोडमैप', assistant: 'AI सहायक',
        community: 'समुदाय', news: 'सेवा समाचार', profile: 'मेरी प्रोफाइल', logout: 'लॉगआउट',
        welcome: 'स्वागत है', grievances: 'शिकायतें', resolved: 'हल', pending: 'लंबित',
        submit: 'जमा करें', cancel: 'रद्द', save: 'सहेजें', loading: 'लोड हो रहा है…',
    },
    ta: {
        dashboard: 'என் டாஷ்போர்டு', schemes: 'திட்டங்கள்', fileGrievance: 'புகார் தாக்கல்',
        trackGrievance: 'புகார் கண்காணிப்பு', roadmap: 'நலன் வரைப்படம்', assistant: 'AI உதவியாளர்',
        community: 'சமூகம்', news: 'சேவை செய்தி', profile: 'என் சுயவிவரம்', logout: 'வெளியேறு',
        welcome: 'வரவேற்கிறோம்', grievances: 'புகார்கள்', resolved: 'தீர்க்கப்பட்டது', pending: 'நிலுவை',
        submit: 'சமர்பிக்கவும்', cancel: 'ரத்து', save: 'சேமி', loading: 'ஏற்றுகிறது…',
    },
    te: {
        dashboard: 'నా డాష్‌బోర్డ్', schemes: 'పథకాలు', fileGrievance: 'ఫిర్యాదు దాఖలు',
        trackGrievance: 'ఫిర్యాదు ట్రాక్', roadmap: 'లబ్ధి రోడ్‌మ్యాప్', assistant: 'AI సహాయకుడు',
        community: 'సమాజం', news: 'సేవా వార్తలు', profile: 'నా ప్రొఫైల్', logout: 'నిష్క్రమించు',
        welcome: 'స్వాగతం', grievances: 'ఫిర్యాదులు', resolved: 'పరిష్కరించబడింది', pending: 'పెండింగ్',
        submit: 'సమర్పించు', cancel: 'రద్దు', save: 'సేవ్', loading: 'లోడ్ అవుతోంది…',
    },
    bn: {
        dashboard: 'আমার ড্যাশবোর্ড', schemes: 'প্রকল্প দেখুন', fileGrievance: 'অভিযোগ দাখিল',
        trackGrievance: 'অভিযোগ ট্র্যাক', roadmap: 'সুবিধা রোডম্যাপ', assistant: 'AI সহকারী',
        community: 'সম্প্রদায়', news: 'সেবা সংবাদ', profile: 'আমার প্রোফাইল', logout: 'লগআউট',
        welcome: 'স্বাগতম', grievances: 'অভিযোগ', resolved: 'সমাধান', pending: 'মুলতুবি',
        submit: 'জমা দিন', cancel: 'বাতিল', save: 'সংরক্ষণ', loading: 'লোড হচ্ছে…',
    },
};

// Fallback to English for unsupported languages
const getTranslations = (code) => TRANSLATIONS[code] || TRANSLATIONS.en;

const LanguageContext = createContext({
    lang: 'en', setLang: () => {}, t: k => k, languages: LANGUAGES,
});

export function LanguageProvider({ children }) {
    const stored = localStorage.getItem('ncie_lang') || 'en';
    const [lang, setLangState] = useState(stored);

    const setLang = useCallback((code) => {
        localStorage.setItem('ncie_lang', code);
        setLangState(code);
    }, []);

    const translations = getTranslations(lang);
    const t = useCallback((key) => translations[key] || key, [translations]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

// Standalone Language Switcher pill — used in both layouts
export function LanguagePill({ style = {} }) {
    const { lang, setLang, languages } = useLanguage();
    const [open, setOpen] = useState(false);
    const current = languages.find(l => l.code === lang) || languages[0];

    return (
        <div style={{ position: 'relative', ...style }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 20, padding: '5px 12px', cursor: 'pointer', color: 'white',
                    fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Inter', transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
                title="Change Language"
            >
                🌐 {current.label}
            </button>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: 'absolute', top: '110%', right: 0, zIndex: 999,
                        background: '#0D1B2E', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12, overflow: 'hidden', minWidth: 160,
                        boxShadow: '0 16px 40px rgba(0,0,0,0.6)', animation: 'fadeInUp 0.15s ease'
                    }}>
                        {languages.map(l => (
                            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    width: '100%', padding: '9px 16px', border: 'none',
                                    background: l.code === lang ? 'rgba(255,107,44,0.12)' : 'transparent',
                                    color: l.code === lang ? 'var(--saffron, #FF6B2C)' : 'rgba(255,255,255,0.8)',
                                    cursor: 'pointer', fontSize: '0.83rem', fontWeight: l.code === lang ? 700 : 400,
                                    fontFamily: 'Inter', textAlign: 'left', transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {l.flag} {l.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export { LANGUAGES };
