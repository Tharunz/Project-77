import React, { useState, useRef, useEffect } from 'react';
import { MdEdit, MdSend, MdMic, MdAttachFile, MdCheckCircle, MdCopyAll, MdClose, MdStop, MdPlayArrow, MdRefresh } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { INDIAN_STATES, GRIEVANCE_CATEGORIES } from '../../mock/mockData';

const API_BASE = '/api';
const getToken = () => localStorage.getItem('token');

function AudioWaveform({ active, bars = 20 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 48 }}>
            {Array.from({ length: bars }).map((_, i) => (
                <div key={i} style={{
                    width: 4, borderRadius: 4,
                    background: active ? 'linear-gradient(180deg,#EF4444,#FF6B2C)' : 'rgba(255,255,255,0.15)',
                    height: active ? undefined : '30%',
                    minHeight: 4,
                    animation: active ? `wave ${0.8 + (i % 5) * 0.12}s ease-in-out ${(i * 0.05) % 0.4}s infinite alternate` : 'none',
                }} />
            ))}
            <style>{`@keyframes wave { from { height: 15% } to { height: 90% } }`}</style>
        </div>
    );
}

export default function GrievanceFiling() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [inputMode, setInputMode] = useState('text'); // 'text' | 'audio'
    const [form, setForm] = useState({
        citizenName: user?.name || '',
        state: user?.state || '',
        category: '',
        title: '',
        description: '',
        priority: 'Medium',
    });
    const [submitted, setSubmitted] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [recordingVoice, setRecordingVoice] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    // Audio recording state
    const [audioRecording, setAudioRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioTime, setAudioTime] = useState(0);
    const [audioLang, setAudioLang] = useState('हिन्दी');
    const mediaRecRef = useRef(null);
    const audioTimerRef = useRef(null);
    const MAX_AUDIO_SEC = 60;

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start();
            mediaRecRef.current = recorder;
            setAudioRecording(true);
            setAudioTime(0);
            audioTimerRef.current = setInterval(() => {
                setAudioTime(t => {
                    if (t >= MAX_AUDIO_SEC - 1) { stopAudioRecording(); return t; }
                    return t + 1;
                });
            }, 1000);
        } catch { alert('Microphone access denied.'); }
    };

    const stopAudioRecording = () => {
        mediaRecRef.current?.stop();
        setAudioRecording(false);
        clearInterval(audioTimerRef.current);
    };

    const resetAudio = () => {
        setAudioBlob(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioTime(0);
    };

    const handleAudioSubmit = async () => {
        if (!audioBlob || !form.title || !form.state || !form.category) {
            setErrors({ title: !form.title ? 'Title required' : undefined, state: !form.state ? 'State required' : undefined, category: !form.category ? 'Category required' : undefined });
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title || 'Audio Grievance');
            formData.append('description', `[Audio grievance recorded in ${audioLang}] Duration: ${audioTime}s`);
            formData.append('category', form.category);
            formData.append('state', form.state);
            formData.append('priority', form.priority);
            formData.append('documents', audioBlob, 'grievance-audio.webm');
            const token = getToken();
            const response = await fetch(`${API_BASE}/grievance/file`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            });
            const res = await response.json();
            if (res.success) setSubmitted(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => () => { clearInterval(audioTimerRef.current); if (audioUrl) URL.revokeObjectURL(audioUrl); }, []);

    const validate = () => {
        const e = {};
        if (!form.citizenName) e.citizenName = 'Name is required';
        if (!form.state) e.state = 'State is required';
        if (!form.category) e.category = 'Category is required';
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.description.trim() || form.description.length < 30) e.description = 'Please describe your grievance (min 30 characters)';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('state', form.state);
            formData.append('priority', form.priority);
            if (user?.district) formData.append('district', user.district);
            attachedFiles.forEach(file => formData.append('documents', file));

            const token = getToken();
            const response = await fetch(`${API_BASE}/grievance/file`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            });
            const res = await response.json();
            if (res.success) setSubmitted(res.data);
        } catch (err) {
            console.error('Grievance submit error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        if (recordingVoice) {
            recognitionRef.current?.stop();
            setRecordingVoice(false);
            return;
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setRecordingVoice(true);
        recognition.onend = () => setRecordingVoice(false);
        recognition.onerror = () => setRecordingVoice(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript.trim()) {
                setForm(f => ({ ...f, description: f.description + (f.description ? ' ' : '') + transcript }));
                setCharCount(prev => prev + transcript.length + 1);
            }
        };
        recognition.start();
    };

    const handleDescChange = (e) => {
        setForm(f => ({ ...f, description: e.target.value }));
        setCharCount(e.target.value.length);
    };

    const submittedAudioUrl = submitted?.documents?.[0]?.url || null;
    const isAudioGrievance = submitted?.description?.startsWith('[Audio grievance');

    if (submitted) return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center', gap: 20, maxWidth: 520, margin: '0 auto'
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(0,200,150,0.15)', border: '2px solid var(--teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', color: 'var(--teal)'
            }}><MdCheckCircle /></div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--teal)' }}>{t('grievanceSubmitted')} 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 460, lineHeight: 1.6 }}>
                Your grievance has been successfully registered. You will receive updates as it progresses.
            </p>
            {/* Audio playback for audio grievances */}
            {isAudioGrievance && submittedAudioUrl && (
                <div style={{ width: '100%', background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 10, padding: '14px 18px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 700, marginBottom: 8 }}>🎤 Your Submitted Audio — play it back anytime</p>
                    <audio controls src={submittedAudioUrl} style={{ width: '100%' }} />
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{submitted.description}</p>
                </div>
            )}
            <div style={{
                background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.25)',
                borderRadius: 'var(--radius)', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 6, width: '100%'
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t('trackingId')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: 'var(--teal)' }}>{submitted.id}</span>
                    <button onClick={() => navigator.clipboard?.writeText(submitted.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <MdCopyAll />
                    </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Save this ID to track your grievance</p>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button className="btn-secondary" onClick={() => window.location.href = '/citizen/track'}>{t('trackStatus')}</button>
                <button className="btn-primary" onClick={() => setSubmitted(null)}>{t('fileAnother')}</button>
            </div>
        </div>
    );

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720, margin: '0 auto' }}>
            <div>
                <h1 className="section-title"><MdEdit className="icon" /> {t('fileGrievanceTitle')}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>Describe your issue clearly. AI will analyze and prioritize your grievance.</p>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
                {[{ key: 'text', icon: '✍️', label: 'Text Grievance' }, { key: 'audio', icon: '🎤', label: t('audioGrievance') + ' (Any Language)' }].map(tab => (
                    <button key={tab.key} type="button" onClick={() => setInputMode(tab.key)} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: inputMode === tab.key ? 'rgba(255,107,44,0.15)' : 'transparent', color: inputMode === tab.key ? 'var(--saffron)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Audio Mode UI */}
            {inputMode === 'audio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', fontSize: '0.85rem', color: '#FCA5A5' }}>
                        🎤 <strong>For citizens who prefer to speak</strong> — record your grievance in any Indian language. Our AI will process and translate it.
                    </div>

                    {/* Common fields */}
                    <div className="responsive-grid-2" style={{ gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">State *</label>
                            <select className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}><option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}</select>
                            {errors.state && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.state}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}><option value="">Select Category</option>{GRIEVANCE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                            {errors.category && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.category}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Brief Title *</label>
                        <input className="form-input" placeholder="e.g. Road damaged near my house" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        {errors.title && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Recording Language</label>
                        <select className="form-input" value={audioLang} onChange={e => setAudioLang(e.target.value)}>
                            {['हिन्दी','English','தமிழ்','తెలుగు','বাংলা','मराठी','ಕನ್ನಡ','മലയാളം','ગુજરાતી','ਪੰਜਾਬੀ'].map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* Recorder */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <AudioWaveform active={audioRecording} />
                        <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', color: audioRecording ? '#EF4444' : 'var(--text-muted)', fontWeight: 700 }}>
                            {audioRecording && <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#EF4444', marginRight: 8, animation: 'blink 1s ease-in-out infinite' }} />}
                            {String(Math.floor(audioTime / 60)).padStart(2,'0')}:{String(audioTime % 60).padStart(2,'0')} / {String(MAX_AUDIO_SEC / 60).padStart(2,'0')}:00
                        </div>
                        {!audioBlob ? (
                            <button type="button" onClick={audioRecording ? stopAudioRecording : startAudioRecording} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 50, border: 'none', background: audioRecording ? '#EF4444' : 'linear-gradient(135deg,#FF6B2C,#EF4444)', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: audioRecording ? '0 0 24px rgba(239,68,68,0.5)' : 'none' }}>
                                {audioRecording ? <><MdStop /> {t('stopRecording')}</> : <><MdMic /> {t('startRecording')}</>}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                                <div style={{ background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                                    <MdPlayArrow style={{ color: 'var(--teal)', fontSize: '1.4rem', flexShrink: 0 }} />
                                    <audio src={audioUrl} controls style={{ flex: 1, height: 32, filter: 'invert(1) hue-rotate(100deg) brightness(0.8)' }} />
                                    <span style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 700, whiteSpace: 'nowrap' }}>{audioTime}s</span>
                                </div>
                                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                                    <button type="button" onClick={resetAudio} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><MdRefresh /> {t('reRecord')}</button>
                                    <button type="button" onClick={handleAudioSubmit} disabled={loading} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--saffron),#EF4444)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                                        {loading ? t('loading') : <><MdSend /> {t('submitAudio')}</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Info Banner — text mode only */}
            {inputMode === 'text' && <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#A78BFA' }}>
                🤖 AI will auto-detect sentiment, assign priority, and route to the correct department.
            </div>}

            {inputMode === 'text' && <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Row 1 */}
                <div className="responsive-grid-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" value={form.citizenName} onChange={e => setForm(f => ({ ...f, citizenName: e.target.value }))} placeholder="Your name" />
                        {errors.citizenName && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.citizenName}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">State *</label>
                        <select className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        {errors.state && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.state}</span>}
                    </div>
                </div>

                {/* Row 2 */}
                <div className="responsive-grid-2" style={{ gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                            <option value="">Select Category</option>
                            {GRIEVANCE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        {errors.category && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.category}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                            <option>Low</option><option>Medium</option><option>High</option>
                        </select>
                    </div>
                </div>

                {/* Title */}
                <div className="form-group">
                    <label className="form-label">Grievance Title *</label>
                    <input className="form-input" placeholder="Brief title (e.g., Road damaged for 3 months)" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    {errors.title && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.title}</span>}
                </div>

                {/* Description */}
                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Description *</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.78rem', color: charCount >= 30 ? 'var(--teal)' : 'var(--text-muted)' }}>{charCount} chars</span>
                            <button type="button" onClick={toggleVoice} title="Voice Input" style={{
                                background: recordingVoice ? 'rgba(239,68,68,0.15)' : 'rgba(255, 255, 255, 0.10)',
                                border: `1px solid ${recordingVoice ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                                color: recordingVoice ? 'var(--red)' : 'var(--text-muted)',
                                borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem',
                                display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter'
                            }}>
                                <MdMic /> {recordingVoice ? 'Recording... Click to stop' : 'Voice Input'}
                            </button>
                        </div>
                    </div>
                    <textarea className="form-input" rows={6} placeholder="Please describe your grievance in detail. Include location, duration, and impact. You can write in any Indian language..."
                        value={form.description} onChange={handleDescChange} style={{ resize: 'vertical' }} />
                    {errors.description && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{errors.description}</span>}
                </div>

                {/* Upload */}
                <div>
                    <div
                        style={{
                            border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px',
                            textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,44,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.png,.jpg,.jpeg"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const newFiles = Array.from(e.target.files);
                                setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 5));
                            }}
                        />
                        <MdAttachFile style={{ fontSize: '1.8rem', color: attachedFiles.length ? 'var(--teal)' : 'var(--text-muted)', marginBottom: 8 }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {attachedFiles.length > 0 ? `${attachedFiles.length} file(s) selected — click to add more` : 'Click to Attach Documents or Photos (optional)'}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            PDF, JPG, PNG — up to 10MB each · Max 5 files
                        </p>
                    </div>
                    {attachedFiles.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                            {attachedFiles.map((file, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem',
                                    background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)',
                                    borderRadius: 6, padding: '4px 10px', color: 'var(--teal)'
                                }}>
                                    <MdAttachFile style={{ fontSize: '0.9rem' }} />
                                    <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                    <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))} style={{
                                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '1rem'
                                    }}><MdClose /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem', fontWeight: 700 }}>
                    {loading ? 'Submitting...' : <><MdSend /> Submit Grievance</>}
                </button>
            </form>}
        </div>
    );
}
