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

// Core UI string translations — full i18n ready for AWS Translate swap
const TRANSLATIONS = {
    en: {
        // Nav
        dashboard: 'My Dashboard', schemes: 'Explore Schemes', fileGrievance: 'File Grievance',
        trackGrievance: 'Track Grievance', roadmap: 'Benefit Roadmap', assistant: 'AI Assistant',
        community: 'Community', news: 'Seva News', profile: 'My Profile', logout: 'Logout',
        // Common actions
        welcome: 'Welcome', submit: 'Submit', cancel: 'Cancel', save: 'Save', loading: 'Loading…',
        search: 'Search', filter: 'Filter', close: 'Close', back: 'Back', next: 'Next', done: 'Done',
        // Status
        grievances: 'Grievances', resolved: 'Resolved', pending: 'Pending', inProgress: 'In Progress',
        critical: 'Critical', totalFiled: 'Total Filed', matchedSchemes: 'Matched Schemes',
        // Dashboard
        namaste: 'Namaste', quickActions: 'Quick Actions', recentGrievances: 'Recent Grievances',
        benefitGap: 'Benefit Gap Analysis', resolveGaps: 'Resolve Benefit Gaps',
        aiAssistant: 'AI Assistant', ciScore: 'CI Score', areaDistress: 'Local Service Distress Index',
        // Grievance
        fileGrievanceTitle: 'File a Grievance', grievanceTitle: 'Grievance Title', description: 'Description',
        category: 'Category', state: 'State', priority: 'Priority', attachDocs: 'Attach Documents',
        voiceInput: 'Voice Input', submitGrievance: 'Submit Grievance', audioGrievance: 'Audio Grievance',
        startRecording: 'Start Recording', stopRecording: 'Stop Recording', reRecord: 'Re-record',
        submitAudio: 'Submit Audio Grievance', trackingId: 'Your Tracking ID',
        grievanceSubmitted: 'Grievance Submitted!', trackStatus: 'Track Status', fileAnother: 'File Another',
        // Tracking
        trackGrievanceTitle: 'Track Grievance', enterTrackingId: 'Enter Tracking ID',
        grievanceStatus: 'Grievance Status', lastUpdated: 'Last Updated',
        // Schemes
        schemeDiscovery: 'Scheme Discovery', applyNow: 'Apply Now', applied: 'Applied',
        bookmark: 'Bookmark', share: 'Share', eligibilityCheck: 'Eligibility Check',
        aiMatchOn: 'AI Match ON', aiMatchOff: 'AI Match OFF', myApplications: 'My Applications',
        trackApplication: 'Track Application', benefitRoadmap: 'Benefit Roadmap',
        // Profile
        editProfile: 'Edit Profile', fullName: 'Full Name', email: 'Email', age: 'Age',
        income: 'Annual Income', changePassword: 'Change Password', bookmarkedSchemes: 'Bookmarked Schemes',
        noBookmarks: 'No bookmarked schemes yet.', browseSchemes: 'Browse Schemes',
        downloadData: 'Download My Data', deleteAccount: 'Delete Account',
        // Community
        communityForum: 'Community Forum', petition: 'Petition', support: 'Support', createPost: 'Create Post',
        // News
        sevaNews: 'Seva News', latestUpdates: 'Latest Updates', readMore: 'Read More',
    },
    hi: {
        dashboard: 'मेरा डैशबोर्ड', schemes: 'योजनाएं देखें', fileGrievance: 'शिकायत दर्ज करें',
        trackGrievance: 'शिकायत ट्रैक करें', roadmap: 'लाभ रोडमैप', assistant: 'AI सहायक',
        community: 'समुदाय', news: 'सेवा समाचार', profile: 'मेरी प्रोफाइल', logout: 'लॉगआउट',
        welcome: 'स्वागत है', submit: 'जमा करें', cancel: 'रद्द', save: 'सहेजें', loading: 'लोड हो रहा है…',
        search: 'खोजें', filter: 'फ़िल्टर', close: 'बंद करें', back: 'वापस', next: 'अगला', done: 'हो गया',
        grievances: 'शिकायतें', resolved: 'हल', pending: 'लंबित', inProgress: 'प्रगति में',
        critical: 'गंभीर', totalFiled: 'कुल दर्ज', matchedSchemes: 'मेल खाती योजनाएं',
        namaste: 'नमस्ते', quickActions: 'त्वरित क्रियाएं', recentGrievances: 'हाल की शिकायतें',
        benefitGap: 'लाभ अंतराल विश्लेषण', resolveGaps: 'लाभ अंतराल हल करें',
        aiAssistant: 'AI सहायक', ciScore: 'CI स्कोर', areaDistress: 'स्थानीय सेवा संकट सूचकांक',
        fileGrievanceTitle: 'शिकायत दर्ज करें', grievanceTitle: 'शिकायत शीर्षक', description: 'विवरण',
        category: 'श्रेणी', state: 'राज्य', priority: 'प्राथमिकता', attachDocs: 'दस्तावेज़ संलग्न करें',
        voiceInput: 'वॉइस इनपुट', submitGrievance: 'शिकायत जमा करें', audioGrievance: 'ऑडियो शिकायत',
        startRecording: 'रिकॉर्डिंग शुरू करें', stopRecording: 'रिकॉर्डिंग बंद करें', reRecord: 'फिर से रिकॉर्ड करें',
        submitAudio: 'ऑडियो शिकायत जमा करें', trackingId: 'आपकी ट्रैकिंग ID',
        grievanceSubmitted: 'शिकायत जमा हुई!', trackStatus: 'स्थिति ट्रैक करें', fileAnother: 'और दर्ज करें',
        trackGrievanceTitle: 'शिकायत ट्रैक करें', enterTrackingId: 'ट्रैकिंग ID दर्ज करें',
        grievanceStatus: 'शिकायत स्थिति', lastUpdated: 'अंतिम अपडेट',
        schemeDiscovery: 'योजना खोज', applyNow: 'अभी आवेदन करें', applied: 'आवेदन किया',
        bookmark: 'बुकमार्क', share: 'साझा करें', eligibilityCheck: 'पात्रता जांच',
        aiMatchOn: 'AI मिलान चालू', aiMatchOff: 'AI मिलान बंद', myApplications: 'मेरे आवेदन',
        trackApplication: 'आवेदन ट्रैक करें', benefitRoadmap: 'लाभ रोडमैप',
        editProfile: 'प्रोफ़ाइल संपादित करें', fullName: 'पूरा नाम', email: 'ईमेल', age: 'आयु',
        income: 'वार्षिक आय', changePassword: 'पासवर्ड बदलें', bookmarkedSchemes: 'बुकमार्क योजनाएं',
        noBookmarks: 'अभी कोई बुकमार्क नहीं।', browseSchemes: 'योजनाएं देखें',
        downloadData: 'मेरा डेटा डाउनलोड करें', deleteAccount: 'खाता हटाएं',
        communityForum: 'सामुदायिक मंच', petition: 'याचिका', support: 'समर्थन', createPost: 'पोस्ट बनाएं',
        sevaNews: 'सेवा समाचार', latestUpdates: 'ताज़ा अपडेट', readMore: 'और पढ़ें',
    },
    ta: {
        dashboard: 'என் டாஷ்போர்டு', schemes: 'திட்டங்கள்', fileGrievance: 'புகார் தாக்கல்',
        trackGrievance: 'புகார் கண்காணிப்பு', roadmap: 'நலன் வரைப்படம்', assistant: 'AI உதவியாளர்',
        community: 'சமூகம்', news: 'சேவை செய்தி', profile: 'என் சுயவிவரம்', logout: 'வெளியேறு',
        welcome: 'வரவேற்கிறோம்', submit: 'சமர்பிக்கவும்', cancel: 'ரத்து', save: 'சேமி', loading: 'ஏற்றுகிறது…',
        search: 'தேடு', filter: 'வடிகட்டு', close: 'மூடு', back: 'திரும்பு', next: 'அடுத்து', done: 'முடிந்தது',
        grievances: 'புகார்கள்', resolved: 'தீர்க்கப்பட்டது', pending: 'நிலுவை', inProgress: 'நடைபெறுகிறது',
        critical: 'அவசரம்', totalFiled: 'மொத்தம் தாக்கல்', matchedSchemes: 'பொருந்தும் திட்டங்கள்',
        namaste: 'வணக்கம்', quickActions: 'விரைவு செயல்கள்', recentGrievances: 'சமீபத்திய புகார்கள்',
        benefitGap: 'நன்மை இடைவெளி பகுப்பாய்வு', resolveGaps: 'இடைவெளிகளை தீர்க்க',
        aiAssistant: 'AI உதவியாளர்', ciScore: 'CI மதிப்பெண்', areaDistress: 'உள்ளூர் சேவை நெருக்கடி குறியீடு',
        fileGrievanceTitle: 'புகார் தாக்கல் செய்யுங்கள்', grievanceTitle: 'புகார் தலைப்பு', description: 'விளக்கம்',
        category: 'வகை', state: 'மாநிலம்', priority: 'முன்னுரிமை', attachDocs: 'ஆவணங்கள் இணைக்க',
        voiceInput: 'குரல் உள்ளீடு', submitGrievance: 'புகார் சமர்பிக்க', audioGrievance: 'ஆடியோ புகார்',
        startRecording: 'பதிவு தொடங்கு', stopRecording: 'பதிவு நிறுத்து', reRecord: 'மீண்டும் பதிவு',
        submitAudio: 'ஆடியோ புகார் சமர்பிக்க', trackingId: 'உங்கள் கண்காணிப்பு ID',
        grievanceSubmitted: 'புகார் சமர்பிக்கப்பட்டது!', trackStatus: 'நிலையை கண்காணி', fileAnother: 'மேலும் தாக்கல் செய்',
        trackGrievanceTitle: 'புகார் கண்காணிப்பு', enterTrackingId: 'கண்காணிப்பு ID உள்ளிடவும்',
        grievanceStatus: 'புகார் நிலை', lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
        schemeDiscovery: 'திட்ட கண்டுபிடிப்பு', applyNow: 'இப்போது விண்ணப்பிக்கவும்', applied: 'விண்ணப்பிக்கப்பட்டது',
        bookmark: 'புக்மார்க்', share: 'பகிர்', eligibilityCheck: 'தகுதி சரிபார்ப்பு',
        aiMatchOn: 'AI பொருத்தம் இயக்கு', aiMatchOff: 'AI பொருத்தம் நிறுத்து', myApplications: 'என் விண்ணப்பங்கள்',
        trackApplication: 'விண்ணப்பம் கண்காணி', benefitRoadmap: 'நலன் வரைப்படம்',
        editProfile: 'சுயவிவரம் திருத்து', fullName: 'முழு பெயர்', email: 'மின்னஞ்சல்', age: 'வயது',
        income: 'வருடாந்திர வருமானம்', changePassword: 'கடவுச்சொல் மாற்று', bookmarkedSchemes: 'புக்மார்க் திட்டங்கள்',
        noBookmarks: 'புக்மார்க் திட்டங்கள் இல்லை.', browseSchemes: 'திட்டங்கள் பார்க்க',
        downloadData: 'என் தரவை பதிவிறக்கு', deleteAccount: 'கணக்கை நீக்கு',
        communityForum: 'சமூக மன்றம்', petition: 'மனு', support: 'ஆதரவு', createPost: 'இடுகை உருவாக்கு',
        sevaNews: 'சேவை செய்தி', latestUpdates: 'சமீபத்திய புதுப்பிப்புகள்', readMore: 'மேலும் படிக்க',
    },
    te: {
        dashboard: 'నా డాష్‌బోర్డ్', schemes: 'పథకాలు', fileGrievance: 'ఫిర్యాదు దాఖలు',
        trackGrievance: 'ఫిర్యాదు ట్రాక్', roadmap: 'లబ్ధి రోడ్‌మ్యాప్', assistant: 'AI సహాయకుడు',
        community: 'సమాజం', news: 'సేవా వార్తలు', profile: 'నా ప్రొఫైల్', logout: 'నిష్క్రమించు',
        welcome: 'స్వాగతం', submit: 'సమర్పించు', cancel: 'రద్దు', save: 'సేవ్', loading: 'లోడ్ అవుతోంది…',
        search: 'వెతకండి', filter: 'వడపోత', close: 'మూసివేయి', back: 'వెనకకు', next: 'తదుపరి', done: 'పూర్తయింది',
        grievances: 'ఫిర్యాదులు', resolved: 'పరిష్కరించబడింది', pending: 'పెండింగ్', inProgress: 'పురోగతిలో',
        critical: 'క్లిష్టమైన', totalFiled: 'మొత్తం దాఖలైనవి', matchedSchemes: 'అనుకూలమైన పథకాలు',
        namaste: 'నమస్కారం', quickActions: 'శీఘ్ర చర్యలు', recentGrievances: 'ఇటీవలి ఫిర్యాదులు',
        benefitGap: 'లబ్ధి అంతరం విశ్లేషణ', resolveGaps: 'అంతరాలను పరిష్కరించు',
        aiAssistant: 'AI సహాయకుడు', ciScore: 'CI స్కోర్', areaDistress: 'స్థానిక సేవా క్షోభ సూచిక',
        fileGrievanceTitle: 'ఫిర్యాదు దాఖలు చేయండి', grievanceTitle: 'ఫిర్యాదు శీర్షిక', description: 'వివరణ',
        category: 'వర్గం', state: 'రాష్ట్రం', priority: 'ప్రాధాన్యత', attachDocs: 'పత్రాలు జోడించు',
        voiceInput: 'వాయిస్ ఇన్‌పుట్', submitGrievance: 'ఫిర్యాదు సమర్పించు', audioGrievance: 'ఆడియో ఫిర్యాదు',
        startRecording: 'రికార్డింగ్ ప్రారంభించు', stopRecording: 'రికార్డింగ్ ఆపు', reRecord: 'మళ్లీ రికార్డ్ చేయి',
        submitAudio: 'ఆడియో ఫిర్యాదు సమర్పించు', trackingId: 'మీ ట్రాకింగ్ ID',
        grievanceSubmitted: 'ఫిర్యాదు సమర్పించబడింది!', trackStatus: 'స్థితిని ట్రాక్ చేయి', fileAnother: 'మరొకటి దాఖలు చేయి',
        trackGrievanceTitle: 'ఫిర్యాదు ట్రాక్ చేయండి', enterTrackingId: 'ట్రాకింగ్ ID నమోదు చేయండి',
        grievanceStatus: 'ఫిర్యాదు స్థితి', lastUpdated: 'చివరిసారి నవీకరించబడింది',
        schemeDiscovery: 'పథక అన్వేషణ', applyNow: 'ఇప్పుడు దరఖాస్తు చేయండి', applied: 'దరఖాస్తు చేసారు',
        bookmark: 'బుక్‌మార్క్', share: 'షేర్', eligibilityCheck: 'అర్హత తనిఖీ',
        aiMatchOn: 'AI సరిపోలిక ఆన్', aiMatchOff: 'AI సరిపోలిక ఆఫ్', myApplications: 'నా దరఖాస్తులు',
        trackApplication: 'దరఖాస్తు ట్రాక్ చేయి', benefitRoadmap: 'లబ్ధి రోడ్‌మ్యాప్',
        editProfile: 'ప్రొఫైల్ సవరించు', fullName: 'పూర్తి పేరు', email: 'ఈమెయిల్', age: 'వయసు',
        income: 'వార్షిక ఆదాయం', changePassword: 'పాస్‌వర్డ్ మార్చు', bookmarkedSchemes: 'బుక్‌మార్క్ పథకాలు',
        noBookmarks: 'ఇంకా బుక్‌మార్క్ పథకాలు లేవు.', browseSchemes: 'పథకాలు చూడండి',
        downloadData: 'నా డేటా డౌన్‌లోడ్ చేయి', deleteAccount: 'ఖాతా తొలగించు',
        communityForum: 'సామాజిక వేదిక', petition: 'పిటిషన్', support: 'మద్దతు', createPost: 'పోస్ట్ చేయి',
        sevaNews: 'సేవా వార్తలు', latestUpdates: 'తాజా నవీకరణలు', readMore: 'మరింత చదవండి',
    },
    bn: {
        dashboard: 'আমার ড্যাশবোর্ড', schemes: 'প্রকল্প দেখুন', fileGrievance: 'অভিযোগ দাখিল',
        trackGrievance: 'অভিযোগ ট্র্যাক', roadmap: 'সুবিধা রোডম্যাপ', assistant: 'AI সহকারী',
        community: 'সম্প্রদায়', news: 'সেবা সংবাদ', profile: 'আমার প্রোফাইল', logout: 'লগআউট',
        welcome: 'স্বাগতম', submit: 'জমা দিন', cancel: 'বাতিল', save: 'সংরক্ষণ', loading: 'লোড হচ্ছে…',
        search: 'খুঁজুন', filter: 'ফিল্টার', close: 'বন্ধ করুন', back: 'পিছনে', next: 'পরবর্তী', done: 'সম্পন্ন',
        grievances: 'অভিযোগ', resolved: 'সমাধান', pending: 'মুলতুবি', inProgress: 'চলমান',
        critical: 'জরুরি', totalFiled: 'মোট দাখিল', matchedSchemes: 'মিলে যাওয়া প্রকল্প',
        namaste: 'নমস্কার', quickActions: 'দ্রুত কার্যক্রম', recentGrievances: 'সাম্প্রতিক অভিযোগ',
        benefitGap: 'সুবিধার ফাঁক বিশ্লেষণ', resolveGaps: 'ফাঁক সমাধান করুন',
        aiAssistant: 'AI সহকারী', ciScore: 'CI স্কোর', areaDistress: 'স্থানীয় সেবা সংকট সূচক',
        fileGrievanceTitle: 'অভিযোগ দাখিল করুন', grievanceTitle: 'অভিযোগের শিরোনাম', description: 'বিবরণ',
        category: 'বিভাগ', state: 'রাজ্য', priority: 'অগ্রাধিকার', attachDocs: 'নথি সংযুক্ত করুন',
        voiceInput: 'ভয়েস ইনপুট', submitGrievance: 'অভিযোগ জমা দিন', audioGrievance: 'অডিও অভিযোগ',
        startRecording: 'রেকর্ডিং শুরু করুন', stopRecording: 'রেকর্ডিং বন্ধ করুন', reRecord: 'পুনরায় রেকর্ড করুন',
        submitAudio: 'অডিও অভিযোগ জমা দিন', trackingId: 'আপনার ট্র্যাকিং ID',
        grievanceSubmitted: 'অভিযোগ দাখিল হয়েছে!', trackStatus: 'অবস্থা ট্র্যাক করুন', fileAnother: 'আরেকটি দাখিল করুন',
        trackGrievanceTitle: 'অভিযোগ ট্র্যাক করুন', enterTrackingId: 'ট্র্যাকিং ID লিখুন',
        grievanceStatus: 'অভিযোগের অবস্থা', lastUpdated: 'সর্বশেষ আপডেট',
        schemeDiscovery: 'প্রকল্প আবিষ্কার', applyNow: 'এখনই আবেদন করুন', applied: 'আবেদন করা হয়েছে',
        bookmark: 'বুকমার্ক', share: 'শেয়ার', eligibilityCheck: 'যোগ্যতা যাচাই',
        aiMatchOn: 'AI মিলান চালু', aiMatchOff: 'AI মিলান বন্ধ', myApplications: 'আমার আবেদন',
        trackApplication: 'আবেদন ট্র্যাক করুন', benefitRoadmap: 'সুবিধা রোডম্যাপ',
        editProfile: 'প্রোফাইল সম্পাদনা', fullName: 'পূর্ণ নাম', email: 'ইমেইল', age: 'বয়স',
        income: 'বার্ষিক আয়', changePassword: 'পাসওয়ার্ড পরিবর্তন', bookmarkedSchemes: 'বুকমার্ক প্রকল্প',
        noBookmarks: 'এখনো কোনো বুকমার্ক নেই।', browseSchemes: 'প্রকল্প দেখুন',
        downloadData: 'আমার ডেটা ডাউনলোড', deleteAccount: 'অ্যাকাউন্ট মুছুন',
        communityForum: 'সামাজিক ফোরাম', petition: 'আবেদনপত্র', support: 'সমর্থন', createPost: 'পোস্ট তৈরি করুন',
        sevaNews: 'সেবা সংবাদ', latestUpdates: 'সর্বশেষ আপডেট', readMore: 'আরও পড়ুন',
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
