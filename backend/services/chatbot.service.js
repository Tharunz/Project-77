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
    },
    hi: {
        greeting: "🙏 नमस्ते! मैं सेवा हूँ, Project NCIE का AI सहायक। मैं आपकी सहायता कर सकता हूँ:\n• शिकायत की स्थिति जानें\n• सरकारी योजनाएं खोजें\n• नई शिकायत दर्ज करें\n• दस्तावेज़ अपलोड में मदद\n\nआज मैं आपकी क्या मदद कर सकता हूँ?",
        grievance_status: "📋 अपनी शिकायत ट्रैक करने के लिए, मेनू में **शिकायत ट्रैकिंग** पर जाएं और अपना ट्रैकिंग ID (जैसे GRV-001) दर्ज करें।",
        scheme_info: "🏛️ 20+ सरकारी योजनाएं उपलब्ध हैं! हमारे पास 20+ सरकारी योजनाएं हैं! आपकी आयु, आय और राज्य के अनुसार पात्र योजनाएं **योजना खोज** में देखें।",
        file_grievance: "📝 शिकायत दर्ज करने के लिए:\n1. डैशबोर्ड से **शिकायत दर्ज करें** पर क्लिक करें\n2. शीर्षक, विवरण और श्रेणी भरें\n3. दस्तावेज़ अपलोड करें (वैकल्पिक)\n4. सबमिट करके ट्रैकिंग ID प्राप्त करें",
        document_help: "📎 स्वीकार्य प्रारूप: JPEG, PNG, PDF (अधिकतम 10MB)। शिकायत के लिए प्रासंगिक फोटो, आधार कार्ड या समर्थन प्रमाण पत्र अपलोड करें।",
        contact: "📞 सरकारी हेल्पलाइन: **1800-111-555** (टोल फ्री)\n📧 ईमेल: grievance@project77.gov.in\n🕐 कार्य समय: सोम–शनि, 9am–6pm IST",
        resolution_time: "⏱️ समाधान की समय-सीमा:\n• **सामान्य शिकायतें**: 7–15 कार्य दिवस\n• **गंभीर/एस्केलेटेड**: 48–72 घंटे\n• **पानी/बिजली/स्वास्थ्य**: 3–5 दिन (प्राथमिकता)\n• **बुनियादी ढांचा**: 15–30 दिन\n\n**शिकायत ट्रैकिंग** में लाइव स्थिति देखें।",
        thanks: "🙏 आपका स्वागत है! क्या मैं आपकी और कुछ सहायता कर सकता हूँ?",
        fallback: "मुझे समझ नहीं आया। कृपया दोबारा प्रयास करें। मैं शिकायत स्थिति, सरकारी योजनाओं और शिकायत दर्ज करने में मदद कर सकता हूँ।"
    },
    ta: {
        greeting: "🙏 வணக்கம்! நான் சேவா, Project NCIE AI உதவியாளர். நான் உங்களுக்கு:\n• புகாரின் நிலையை அறியலாம்\n• அரசு திட்டங்களை கண்டறியலாம்\n• புதிய புகார் பதிவு செய்யலாம்\n• ஆவண பதிவேற்றத்தில் உதவலாம்\n\nதொடரலாம்!",
        grievance_status: "📋 உங்கள் புகாரை கண்காணிக்க, மெனுவில் **புகார் கண்காணிப்பு** என்பதற்கு சென்று உங்கள் கண்காணிப்பு ID (எ.கா. GRV-001) உள்ளிடவும்.",
        scheme_info: "🏛️ 20+ அரசு திட்டங்கள் உள்ளன! உங்கள் வயது, வருமானம் மற்றும் மாநிலத்தின் அடிப்படையில் தகுதியான திட்டங்களை **திட்டங்கள் தேடல்** பகுதியில் காணலாம்.",
        file_grievance: "📝 புகார் பதிவு செய்ய:\n1. டாஷ்போர்டில் **புகார் பதிவு** என்பதை கிளிக் செய்யவும்\n2. தலைப்பு, விவரம் மற்றும் வகை பூர்த்தி செய்யவும்\n3. ஆவணங்களை பதிவேற்றவும் (விருப்பம்)\n4. சமர்ப்பித்து கண்காணிப்பு ID பெறவும்",
        document_help: "📎 ஏற்றுக்கொள்ளப்படும் வடிவங்கள்: JPEG, PNG, PDF (அதிகபட்சம் 10MB).",
        contact: "📞 அரசு உதவி எண்: **1800-111-555** (கட்டணமில்லா)\n📧 மின்னஞ்சல்: grievance@project77.gov.in",
        resolution_time: "⏱️ தீர்வு அளிக்கும் கால அளவு:\n• **பொது புகார்கள்**: 7–15 வேலை நாட்கள்\n• **அவசர/முக்கியமான புகார்கள்**: 48–72 மணி நேரம்\n• **தண்ணீர்/மின்சாரம்/சுகாதாரம்**: 3–5 நாட்கள் (முன்னுரிமை)\n• **உள்கட்டமைப்பு**: 15–30 நாட்கள்\n\n**புகார் கண்காணிப்பு** பகுதியில் நேரடி நிலையை பார்க்கலாம்.",
        thanks: "🙏 நன்றி! வேறு எதாவது உதவி தேவையா?",
        fallback: "புரியவில்லை. மீண்டும் முயற்சிக்கவும். புகார் நிலை, அரசு திட்டங்கள் மற்றும் புகார் பதிவு குறித்து உதவ தயாராக உள்ளேன்."
    },
    te: {
        greeting: "🙏 నమస్కారం! నేను సేవా, Project NCIE AI సహాయకుడిని. నేను మీకు సహాయం చేయగలను:\n• మీ ఫిర్యాదు స్థితి తెలుసుకోవడం\n• ప్రభుత్వ పథకాలు కనుగొనడం\n• కొత్త ఫిర్యాదు నమోదు చేయడం\n\nఈరోజు నేను మీకు ఏమి సహాయం చేయాలి?",
        grievance_status: "📋 మీ ఫిర్యాదును ట్రాక్ చేయడానికి, మెనూలో **ఫిర్యాదు ట్రాకింగ్** కు వెళ్ళి మీ ట్రాకింగ్ ID (ఉదా. GRV-001) నమోదు చేయండి.",
        scheme_info: "🏛️ 20+ ప్రభుత్వ పథకాలు అందుబాటులో ఉన్నాయి! మీ వయసు, ఆదాయం మరియు రాష్ట్రం ఆధారంగా అర్హత పొందిన పథకాలను **పథకాల అన్వేషణ** లో చూడండి.",
        file_grievance: "📝 ఫిర్యాదు నమోదు చేయడానికి:\n1. డ్యాశ్‌బోర్డ్ నుండి **ఫిర్యాదు నమోదు** క్లిక్ చేయండి\n2. శీర్షిక, వివరణ మరియు వర్గం పూరించండి\n3. పత్రాలు అప్‌లోడ్ చేయండి (ఐచ్ఛికం)\n4. సమర్పించి ట్రాకింగ్ ID పొందండి",
        document_help: "📎 అనుమతించిన ఫార్మాట్లు: JPEG, PNG, PDF (గరిష్టంగా 10MB).",
        contact: "📞 ప్రభుత్వ హెల్ప్‌లైన్: **1800-111-555** (టోల్ ఫ్రీ)\n📧 ఇమెయిల్: grievance@project77.gov.in",
        resolution_time: "⏱️ తీర్వు అందించే సమయం:\n• **సాధారణ ఫిర్యాదులు**: 7–15 పని రోజులు\n• **క్లిష్టమైన/పెంచిన ఫిర్యాదులు**: 48–72 గంటలు\n• **నీరు/విద్యుత్/ఆరోగ్యం**: 3–5 రోజులు (ప్రాధాన్యత)\n• **మౌలిక సదుపాయాలు**: 15–30 రోజులు\n\n**ఫిర్యాదు ట్రాకింగ్** విభాగంలో నేరటి స్థితిని చూడండి.",
        thanks: "🙏 ధన్యవాదాలు! మీకు మరింత సహాయం అవసరమా?",
        fallback: "అర్థం కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి. ఫిర్యాదు స్థితి, ప్రభుత్వ పథకాలు మరియు ఫిర్యాదు నమోదు గురించి సహాయం చేయగలను."
    },
    bn: {
        greeting: "🙏 নমস্কার! আমি সেবা, Project NCIE AI সহায়ক। আমি আপনাকে সাহায্য করতে পারি:\n• আপনার অভিযোগের অবস্থা জানতে\n• সরকারি প্রকল্প খুঁজে পেতে\n• নতুন অভিযোগ দাখিল করতে\n\nআজ আমি আপনাকে কী সাহায্য করতে পারি?",
        grievance_status: "📋 আপনার অভিযোগ ট্র্যাক করতে, মেনুতে **অভিযোগ ট্র্যাকিং** এ যান এবং আপনার ট্র্যাকিং ID (যেমন GRV-001) লিখুন।",
        scheme_info: "🏛️ ২০টিরও বেশি সরকারি প্রকল্প রয়েছে! আপনার বয়স, আয় এবং রাজ্য অনুযায়ী যোগ্য প্রকল্পগুলি **প্রকল্প আবিষ্কার** বিভাগে দেখুন।",
        file_grievance: "📝 অভিযোগ দাখিল করতে:\n1. ড্যাশবোর্ড থেকে **অভিযোগ দাখিল** ক্লিক করুন\n2. শিরোনাম, বিবরণ এবং শ্রেণী ভরুন\n3. দস্তাবেজ আপলোড করুন (ঐচ্ছিক)\n4. জমা দিন এবং ট্র্যাকিং ID পান",
        document_help: "📎 গ্রহণযোগ্য ফরম্যাট: JPEG, PNG, PDF (সর্বোচ্চ 10MB)।",
        contact: "📞 সরকারি হেল্পলাইন: **1800-111-555** (টোল ফ্রি)\n📧 ইমেইল: grievance@project77.gov.in",
        resolution_time: "⏱️ সমাধানের সমযঃ\n• **সাধারণ অভিযোগ**: 7–15 কাজের দিন\n• **গুরুতর/উন্নীত**: 48–72 ঘন্টা\n• **পানি/বিদ্যুৎ/স্বাস্থ্য**: 3–5 দিন (অগ্রাধিকার)\n• **অবকাঠামো**: 15–30 দিন\n\n**অভিযোগ ট্র্যাকিং** বিভাগে লাইভ অবস্থা দেখুন।",
        thanks: "🙏 ধন্যবাদ! আর কোনো সাহায্য দরকার আছে?",
        fallback: "বুঝতে পারিনি। দয়া করে আবার চেষ্টা করুন। অভিযোগের স্থিতি, সরকারি প্রকল্প এবং অভিযোগ দাখিলে সাহায্য করতে পারব।"
    },
    mr: {
        greeting: "🙏 नमस्कार! मी सेवा आहे, Project NCIE चा AI सहाय्यक. मी तुम्हाला मदत करू शकतो:\n• तक्रारीची स्थिती जाणून घेणे\n• सरकारी योजना शोधणे\n• नवीन तक्रार नोंदवणे\n\nआज मी तुम्हाला कसे मदत करू शकतो?",
        grievance_status: "📋 तुमची तक्रार ट्रॅक करण्यासाठी, मेनूमध्ये **तक्रार ट्रॅकिंग** वर जा आणि तुमचा ट्रॅकिंग ID (उदा. GRV-001) प्रविष्ट करा.",
        scheme_info: "🏛️ 20+ सरकारी योजना उपलब्ध आहेत! तुमचे वय, उत्पन्न आणि राज्यानुसार पात्र योजना **योजना शोध** विभागात पाहा.",
        file_grievance: "📝 तक्रार नोंदवण्यासाठी:\n1. डॅशबोर्डवरून **तक्रार नोंदवा** वर क्लिक करा\n2. शीर्षक, वर्णन आणि श्रेणी भरा\n3. कागदपत्रे अपलोड करा (पर्यायी)\n4. सबमिट करा आणि ट्रॅकिंग ID मिळवा",
        document_help: "📎 स्वीकार्य प्रारूप: JPEG, PNG, PDF (कमाल 10MB).",
        contact: "📞 शासकीय हेल्पलाइन: **1800-111-555** (टोल फ्री)\n📧 ईमेल: grievance@project77.gov.in",
        thanks: "🙏 आपले स्वागत आहे! आणखी काही मदत हवी आहे का?",
        fallback: "समजले नाही. कृपया पुन्हा प्रयत्न करा. तक्रार स्थिती, सरकारी योजना आणि तक्रार नोंदणीत मदत करू शकतो."
    },
    gu: {
        greeting: "🙏 નમસ્તે! હું સેવા છું, Project NCIE AI સહાયક. હું તમને મદદ કરી શકું:\n• ફરિયાદની સ્થિતિ જાણવી\n• સરકારી યોજનાઓ શોધવી\n• નવી ફરિયાદ નોંધાવવી\n\nઆજે હું તમને કેવી મદદ કરી શકું?",
        grievance_status: "📋 તમારી ફરિયાદ ટ્રૅક કરવા, મેનૂમાં **ફરિયાદ ટ્રૅકિંગ** પર જાઓ અને ટ્રૅકિંગ ID (જેમ કે GRV-001) દાખલ કરો.",
        scheme_info: "🏛️ 20+ સરકારી યોજનાઓ ઉપલબ્ધ છે! તમારી ઉંમર, આવક અને રાજ્ય અનુસાર પાત્ર યોજનાઓ **યોજના શોધ** માં જુઓ.",
        file_grievance: "📝 ફરિયાદ નોંધાવવા:\n1. ડૅશબોર્ડ પરથી **ફરિયાદ નોંધાવો** ક્લિક કરો\n2. શીર્ષક, વિગત અને કૅટેગરી ભરો\n3. દસ્તાવેજ અપલોડ કરો (ઐચ્છિક)\n4. સબમિટ કરો અને ટ્રૅકિંગ ID મેળવો",
        document_help: "📎 સ્વીકૃત ફૉર્મૅટ: JPEG, PNG, PDF (મહત્તમ 10MB).",
        contact: "📞 સરકારી હેલ્પલાઇન: **1800-111-555** (ટૉલ ફ્રી)\n📧 ઇ-મેઇલ: grievance@project77.gov.in",
        thanks: "🙏 ધન્યવાદ! બીજી કોઈ સહાય જોઈએ છે?",
        fallback: "સમજ ન પડ્યું. કૃપા કરી ફરી પ્રયાસ કરો. ફરિયાદ સ્થિતિ, સરકારી યોજનાઓ અને ફરિયાદ નોંધણીમાં મદદ કરી શકું."
    },
    kn: {
        greeting: "🙏 ನಮಸ್ಕಾರ! ನಾನು ಸೇವಾ, Project NCIE AI ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ದೂರಿನ ಸ್ಥಿತಿ ತಿಳಿಯಲು\n• ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು\n• ಹೊಸ ದೂರು ದಾಖಲಿಸಲು\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
        grievance_status: "📋 ನಿಮ್ಮ ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ಮೆನ್ಯೂನಲ್ಲಿ **ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್** ಗೆ ಹೋಗಿ ಮತ್ತು ನಿಮ್ಮ ಟ್ರ್ಯಾಕಿಂಗ್ ID (ಉದಾ. GRV-001) ನಮೂದಿಸಿ.",
        scheme_info: "🏛️ 20+ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿವೆ! ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ರಾಜ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು **ಯೋಜನೆ ಶೋಧ** ನಲ್ಲಿ ನೋಡಿ.",
        file_grievance: "📝 ದೂರು ದಾಖಲಿಸಲು:\n1. ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ **ದೂರು ದಾಖಲಿಸಿ** ಕ್ಲಿಕ್ ಮಾಡಿ\n2. ಶೀರ್ಷಿಕೆ, ವಿವರ ಮತ್ತು ವರ್ಗ ತುಂಬಿ\n3. ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಐಚ್ಛಿಕ)\n4. ಸಲ್ಲಿಸಿ ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್ ID ಪಡೆಯಿರಿ",
        document_help: "📎 ಸ್ವೀಕಾರಾರ್ಹ ಸ್ವರೂಪಗಳು: JPEG, PNG, PDF (ಗರಿಷ್ಠ 10MB).",
        contact: "📞 ಸರ್ಕಾರಿ ಸಹಾಯವಾಣಿ: **1800-111-555** (ಟೋಲ್ ಫ್ರೀ)\n📧 ಇಮೇಲ್: grievance@project77.gov.in",
        thanks: "🙏 ಧನ್ಯವಾದಗಳು! ಇನ್ನೂ ಏನಾದರೂ ಸಹಾಯ ಬೇಕೇ?",
        fallback: "ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ. ದೂರಿನ ಸ್ಥಿತಿ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ದೂರು ದಾಖಲಾತಿಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
    },
    ml: {
        greeting: "🙏 നമസ്കാരം! ഞാൻ സേവ, Project NCIE AI അസിസ്റ്റന്റ്. ഞാൻ നിങ്ങളെ സഹായിക്കാം:\n• പരാതിയുടെ നില അറിയാൻ\n• സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ\n• പുതിയ പരാതി ഫയൽ ചെയ്യാൻ\n\nഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
        grievance_status: "📋 നിങ്ങളുടെ പരാതി ട്രാക്ക് ചെയ്യാൻ, മെനുവിലെ **പരാതി ട്രാക്കിംഗ്** ൽ ട്രാക്കിംഗ് ID (ഉദാ. GRV-001) നൽകുക.",
        scheme_info: "🏛️ 20+ സർക്കാർ പദ്ധതികൾ ലഭ്യമാണ്! പ്രായം, വരുമാനം, സംസ്ഥാനം അനുസരിച്ച് **പദ്ധതി കണ്ടെത്തൽ** ൽ അർഹമായ പദ്ധതികൾ കാണുക.",
        file_grievance: "📝 പരാതി ഫയൽ ചെയ്യാൻ:\n1. ഡാഷ്ബോർഡിൽ **പരാതി ഫയൽ** ക്ലിക്ക് ചെയ്യുക\n2. തലക്കെട്ട്, വിവരണം, വിഭാഗം നൽകുക\n3. രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക (ഐഛികം)\n4. സമർപ്പിച്ച് ട്രാക്കിംഗ് ID നേടുക",
        document_help: "📎 സ്വീകാര്യ ഫോർമാറ്റുകൾ: JPEG, PNG, PDF (പരമാവധി 10MB).",
        contact: "📞 സർക്കാർ ഹെൽപ്‌ലൈൻ: **1800-111-555** (ടോൾ ഫ്രീ)\n📧 ഇ-മെയിൽ: grievance@project77.gov.in",
        thanks: "🙏 നന്ദി! മറ്റെന്തെങ്കിലും സഹായം വേണോ?",
        fallback: "മനസ്സിലായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക. പരാതി നില, സർക്കാർ പദ്ധതികൾ, പരാതി ഫയലിംഗ് എന്നിവ സഹായിക്കാം."
    },
    pa: {
        greeting: "🙏 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸੇਵਾ ਹਾਂ, Project NCIE AI ਸਹਾਇਕ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n• ਸ਼ਿਕਾਇਤ ਦੀ ਸਥਿਤੀ ਜਾਣੋ\n• ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਲੱਭੋ\n• ਨਵੀਂ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ\n\nਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰਾਂ?",
        grievance_status: "📋 ਆਪਣੀ ਸ਼ਿਕਾਇਤ ਟਰੈਕ ਕਰਨ ਲਈ, ਮੀਨੂ ਵਿੱਚ **ਸ਼ਿਕਾਇਤ ਟਰੈਕਿੰਗ** 'ਤੇ ਜਾਓ ਅਤੇ ਆਪਣਾ ਟਰੈਕਿੰਗ ID (ਜਿਵੇਂ GRV-001) ਦਰਜ ਕਰੋ।",
        scheme_info: "🏛️ 20+ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਉਪਲਬਧ ਹਨ! ਆਪਣੀ ਉਮਰ, ਆਮਦਨ ਅਤੇ ਸੂਬੇ ਅਨੁਸਾਰ ਯੋਗ ਯੋਜਨਾਵਾਂ **ਯੋਜਨਾ ਖੋਜ** ਵਿੱਚ ਦੇਖੋ।",
        file_grievance: "📝 ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਲਈ:\n1. ਡੈਸ਼ਬੋਰਡ ਤੋਂ **ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ** ਕਲਿੱਕ ਕਰੋ\n2. ਸਿਰਲੇਖ, ਵਿੱਚ ਵੇਰਵਾ ਅਤੇ ਸ਼੍ਰੇਣੀ ਭਰੋ\n3. ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ (ਵਿਕਲਪਿਕ)\n4. ਜਮ੍ਹਾਂ ਕਰੋ ਅਤੇ ਟਰੈਕਿੰਗ ID ਲਓ",
        document_help: "📎 ਮਨਜ਼ੂਰ ਫਾਰਮੈਟ: JPEG, PNG, PDF (ਵੱਧ ਤੋਂ ਵੱਧ 10MB).",
        contact: "📞 ਸਰਕਾਰੀ ਹੈਲਪਲਾਈਨ: **1800-111-555** (ਟੋਲ ਫ੍ਰੀ)\n📧 ਈਮੇਲ: grievance@project77.gov.in",
        thanks: "🙏 ਤੁਹਾਡਾ ਧੰਨਵਾਦ! ਹੋਰ ਕੋਈ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
        fallback: "ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ। ਸ਼ਿਕਾਇਤ ਸਥਿਤੀ, ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਅਤੇ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।"
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
