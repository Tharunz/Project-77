import React, { useState, useRef } from 'react';
import { MdEdit, MdSend, MdMic, MdAttachFile, MdCheckCircle, MdCopyAll, MdClose } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES, GRIEVANCE_CATEGORIES } from '../../mock/mockData';

const API_BASE = '/api';
const getToken = () => localStorage.getItem('token');

export default function GrievanceFiling() {
    const { user } = useAuth();
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

    if (submitted) return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center', gap: 20
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(0,200,150,0.15)', border: '2px solid var(--teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', color: 'var(--teal)'
            }}><MdCheckCircle /></div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--teal)' }}>Grievance Submitted! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 460, lineHeight: 1.6 }}>
                Your grievance has been successfully registered. You will receive updates as it progresses.
            </p>
            <div style={{
                background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.25)',
                borderRadius: 'var(--radius)', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 6
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Your Tracking ID</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: 'var(--teal)' }}>{submitted.id}</span>
                    <button onClick={() => navigator.clipboard?.writeText(submitted.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <MdCopyAll />
                    </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Save this ID to track your grievance</p>
            </div>
            <button className="btn-primary" onClick={() => setSubmitted(null)} style={{ marginTop: 8 }}>
                File Another Grievance
            </button>
        </div>
    );

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720, margin: '0 auto' }}>
            <div>
                <h1 className="section-title"><MdEdit className="icon" /> File a Grievance</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    Describe your issue clearly. AI will analyze and prioritize your grievance.
                </p>
            </div>

            {/* AI Info Banner */}
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#A78BFA' }}>
                🤖 AI will auto-detect sentiment, assign priority, and route to the correct department.
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
            </form>
        </div>
    );
}
