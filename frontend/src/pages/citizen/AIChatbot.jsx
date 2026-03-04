import React, { useState, useRef, useEffect } from 'react';
import { MdChat, MdSend, MdMic, MdTranslate, MdStop, MdRefresh } from 'react-icons/md';
import { apiGetChatbotResponse } from '../../services/api.service';

const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' }, { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' }, { code: 'mr', label: 'मराठी' },
    { code: 'kn', label: 'ಕನ್ನಡ' }, { code: 'ml', label: 'മലയാളം' },
    { code: 'gu', label: 'ગુજરાતી' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const QUICK_QUESTIONS = [
    'How do I file a grievance?',
    'What schemes am I eligible for?',
    'How long does resolution take?',
    'Can I file grievance in Hindi?',
    'Track my grievance status',
    'What documents do I need?',
];

const AI_RESPONSES = {
    default: [
        'I understand your concern. Our AI system is analyzing the best response for you. Your grievance about government services is important to us.',
        'This is a common concern. The government scheme for this has been updated in 2026. Let me provide the details relevant to your state.',
        'Based on your profile, I recommend checking PM Kisan Samman Nidhi and Ayushman Bharat for benefits you qualify for.',
        'You can file a grievance directly from the "File Grievance" section. Our AI will auto-prioritize it based on urgency and sentiment analysis.',
        'For tracking your grievance, go to "Track Grievance" and enter your tracking ID. You\'ll see a real-time status timeline.',
        'Resolution typically takes 7-21 business days depending on the category. Critical issues are fast-tracked within 72 hours.',
        'Yes, you can file grievances and use the chatbot in Hindi, Tamil, Telugu, Bengali, and 18 other Indian languages.',
    ],
    grievance: 'To file a grievance: 1) Go to "File Grievance" 2) Select your category 3) Describe the issue 4) Submit. You will receive a unique tracking ID.',
    schemes: 'Based on your profile, you may be eligible for: PM Kisan, Ayushman Bharat (health coverage ₹5 lakh), and MGNREGS (100 days guaranteed work). Go to "Explore Schemes" with AI Match ON to see all options.',
    track: 'To track your grievance, go to "Track Grievance" and enter your tracking ID (e.g., GRV-2600089). You\'ll see the full status timeline.',
};

function TypingDot() {
    return (
        <div style={{ display: 'flex', gap: 4, padding: '12px 16px', alignItems: 'center' }}>
            {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--saffron)',
                    animation: `pulse 1s ease ${d}s infinite`
                }} />
            ))}
        </div>
    );
}

export default function AIChatbot() {
    const [messages, setMessages] = useState([
        {
            id: 1, role: 'assistant',
            text: '🙏 Namaste! I\'m JanSeva AI — your personal government services assistant. I can help you:\n• File and track grievances\n• Find schemes you\'re eligible for\n• Answer questions about government services\n• Help in 22+ Indian languages\n\nHow can I serve you today?',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [language, setLanguage] = useState('en');
    const [recording, setRecording] = useState(false);
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const getAIResponse = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('griev') || lower.includes('complain') || lower.includes('file')) return AI_RESPONSES.grievance;
        if (lower.includes('scheme') || lower.includes('eligib') || lower.includes('benefit')) return AI_RESPONSES.schemes;
        if (lower.includes('track') || lower.includes('status') || lower.includes('where')) return AI_RESPONSES.track;
        return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)];
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        const userMsg = {
            id: Date.now(), role: 'user', text,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(m => [...m, userMsg]);
        setInput('');
        setTyping(true);

        try {
            // Call real backend chatbot API
            const res = await apiGetChatbotResponse(text, language);
            const resp = (res.success && res.data?.response) ? res.data.response : getAIResponse(text);
            setMessages(m => [...m, {
                id: Date.now() + 1, role: 'assistant', text: resp,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch {
            // Fallback to local responses if server is unavailable
            const resp = getAIResponse(text);
            setMessages(m => [...m, {
                id: Date.now() + 1, role: 'assistant', text: resp,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setTyping(false);
        }
    };

    const handleVoice = () => {
        if (recording) {
            setRecording(false);
            sendMessage('मेरे गाँव में पानी की समस्या है। नल नहीं आता पिछले दो हफ्ते से।');
        } else {
            setRecording(true);
        }
    };

    const clearChat = () => {
        setMessages([{
            id: 1, role: 'assistant',
            text: '🙏 Chat cleared. How can I help you?',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: 720, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 className="section-title"><MdChat className="icon" /> JanSeva AI Assistant</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Ask anything about schemes, grievances, or government services
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <MdTranslate style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--teal)', fontSize: '1rem' }} />
                        <select className="form-input" value={language} onChange={e => setLanguage(e.target.value)}
                            style={{ paddingLeft: 28, fontSize: '0.8rem', padding: '7px 12px 7px 28px' }}>
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                    </div>
                    <button className="btn-secondary" onClick={clearChat} style={{ fontSize: '0.78rem' }}>
                        <MdRefresh /> Clear
                    </button>
                </div>
            </div>

            {/* Chat message area */}
            <div style={{
                flex: 1, overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16
            }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeInUp 0.3s ease' }}>
                        {/* Avatar */}
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: msg.role === 'assistant' ? 'linear-gradient(135deg, var(--saffron), var(--gold))' : 'linear-gradient(135deg, var(--teal), #138808)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', color: 'white', fontWeight: 700
                        }}>
                            {msg.role === 'assistant' ? '🤖' : '👤'}
                        </div>
                        <div style={{ maxWidth: '75%' }}>
                            <div style={{
                                background: msg.role === 'user' ? 'rgba(0,200,150,0.12)' : 'rgba(255, 255, 255, 0.10)',
                                border: `1px solid ${msg.role === 'user' ? 'rgba(0,200,150,0.25)' : 'var(--border)'}`,
                                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                padding: '12px 16px',
                            }}>
                                <p style={{ fontSize: '0.87rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '4px 4px 0', display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</span>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--saffron), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.10)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '4px 8px' }}>
                            <TypingDot />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
                {QUICK_QUESTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                        background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: 100,
                        fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.2s', fontFamily: 'Inter'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,44,0.4)'; e.currentTarget.style.color = 'var(--saffron)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >{q}</button>
                ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleVoice} style={{
                    background: recording ? 'rgba(239,68,68,0.15)' : 'rgba(255, 255, 255, 0.10)',
                    border: `1px solid ${recording ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                    color: recording ? 'var(--red)' : 'var(--text-muted)',
                    width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer',
                    animation: recording ? 'pulse-glow 1s infinite' : 'none', transition: 'all 0.2s'
                }}>
                    {recording ? <MdStop /> : <MdMic />}
                </button>
                <input
                    className="form-input"
                    style={{ flex: 1, padding: '12px 16px' }}
                    placeholder="Ask anything in any language..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                />
                <button onClick={() => sendMessage(input)} className="btn-primary" disabled={!input.trim()} style={{ padding: '10px 20px' }}>
                    <MdSend />
                </button>
            </div>
        </div>
    );
}
