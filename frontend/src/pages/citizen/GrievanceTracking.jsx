import React, { useState } from 'react';
import { MdTrackChanges, MdSearch, MdCheckCircle, MdHourglassEmpty, MdArrowForward, MdStar, MdStarBorder, MdCloudUpload, MdVerifiedUser, MdClose, MdContentCopy, MdVolumeUp } from 'react-icons/md';
import { apiTrackGrievance, apiVerifyResolution, apiGetEscrowProjects, apiVerifyEscrow, apiGetMyGrievances, apiFetch } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

function EscrowVerificationPanel({ grievanceId, onSuccess, showToast }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (rating === 0) return showToast('error', 'Please provide a rating.');
        setLoading(true);
        try {
            // Find the escrow project linked to this grievance
            const escrowRes = await apiGetEscrowProjects();
            const projects = escrowRes.data || [];
            const linked = projects.find(p => p.grievanceId === grievanceId);
            if (linked) {
                await apiVerifyEscrow(linked.id, rating, photo);
            }
        } catch (err) {
            console.error('Escrow verification error:', err);
        } finally {
            setLoading(false);
            onSuccess(photo);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(URL.createObjectURL(file));
        }
    };

    return (
        <div style={{
            marginTop: 24, padding: 24, background: 'rgba(0, 200, 150, 0.03)',
            border: '1px solid rgba(0, 200, 150, 0.2)', borderRadius: 16,
            position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--teal)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12, background: 'rgba(0, 200, 150, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)'
                }}>
                    <MdVerifiedUser style={{ fontSize: '1.4rem' }} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-white)', marginBottom: 4 }}>Action Required: Confirm Resolution</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        The department has marked this grievance as resolved. Please verify the work to release the funds from Escrow.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Photo Upload */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>1. Upload Proof of Resolution (Optional)</label>
                    <label
                        style={{
                            height: 120, border: '1px dashed var(--border)', borderRadius: 12,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', background: photo ? 'rgba(0, 200, 150, 0.05)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.2s', borderStyle: photo ? 'solid' : 'dashed',
                            borderColor: photo ? 'var(--teal)' : 'var(--border)'
                        }}
                    >
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                        {photo ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <img src={photo} alt="Preview" style={{ width: 60, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                <div style={{ color: 'var(--teal)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    <MdCheckCircle /> Photo Uploaded
                                </div>
                            </div>
                        ) : (
                            <>
                                <MdCloudUpload style={{ fontSize: '1.8rem', color: 'var(--text-muted)', marginBottom: 8 }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to capture/upload photo proof</span>
                            </>
                        )}
                    </label>
                </div>

                {/* 2. Rating */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>2. Rate the Quality of Work</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.1s' }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {star <= (hover || rating) ? (
                                    <MdStar style={{ color: '#FFD700', fontSize: '2.2rem', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))' }} />
                                ) : (
                                    <MdStarBorder style={{ color: 'var(--text-muted)', fontSize: '2.2rem' }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="btn-teal"
                    onClick={handleVerify}
                    disabled={loading || rating === 0}
                    style={{ width: '100%', padding: '14px', fontWeight: 700, fontSize: '0.95rem', borderRadius: 12 }}
                >
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <div className="spinner-small" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                            Releasing Funds...
                        </div>
                    ) : (
                        'Confirm & Release Escrow Funds'
                    )}
                </button>
            </div>
        </div>
    );
}

function StatusTimeline({ timeline }) {
    if (!timeline || !Array.isArray(timeline)) return <p style={{ color: 'var(--text-muted)' }}>No timeline data available.</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 20 }}>
            {timeline.map((event, i) => {
                if (!event) return null;
                return (
                    <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < timeline.length - 1 ? 24 : 0, position: 'relative' }}>
                        {/* Line */}
                        {i < timeline.length - 1 && (
                            <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'var(--border)' }} />
                        )}
                        {/* Dot */}
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                            background: i === timeline.length - 1 ? 'rgba(255,107,44,0.2)' : 'rgba(0,200,150,0.15)',
                            border: `2px solid ${i === timeline.length - 1 ? 'var(--saffron)' : 'var(--teal)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                            color: i === timeline.length - 1 ? 'var(--saffron)' : 'var(--teal)'
                        }}>
                            {i === timeline.length - 1 ? <MdHourglassEmpty /> : <MdCheckCircle />}
                        </div>
                        <div style={{ paddingTop: 4 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: i === timeline.length - 1 ? 'var(--saffron)' : 'var(--text-white)', marginBottom: 4 }}>
                                {event.status || 'Status Update'}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{event.note || ''}</p>
                            {event.image && (
                                <img src={event.image} alt="Proof" style={{ marginTop: 8, borderRadius: 6, width: 100, height: 70, objectFit: 'cover', border: '1px solid var(--border)' }} />
                            )}
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{event.date || ''}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function GrievanceTracking() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [trackingId, setTrackingId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [myGrievances, setMyGrievances] = useState([]);
    const [loadingMine, setLoadingMine] = useState(false);
    const [showMine, setShowMine] = useState(false);
    const [notification, setNotification] = useState(null);
    const [copied, setCopied] = useState(false);
    const [voiceLoading, setVoiceLoading] = useState(false);

    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleVoiceRead = async (grievance) => {
        setVoiceLoading(true);
        try {
            const text = `Grievance ID ${grievance.id}. Title: ${grievance.title}. Status: ${grievance.status}. Filed in ${grievance.state} under ${grievance.category}. ${grievance.description ? grievance.description.slice(0, 200) : ''}`;
            const res = await apiFetch('/polly/speak', {
                method: 'POST',
                body: JSON.stringify({ text, languageCode: 'en-IN', voiceId: 'Aditi' })
            });
            if (res.success && res.data?.audioUrl) {
                const audio = new Audio(res.data.audioUrl);
                audio.play();
            } else if (res.success && res.data?.audioBase64) {
                const audio = new Audio(`data:audio/mpeg;base64,${res.data.audioBase64}`);
                audio.play();
            } else {
                // Fallback: browser TTS
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-IN';
                window.speechSynthesis.speak(utterance);
            }
        } catch (err) {
            // Fallback: browser TTS
            const text = `Grievance ${result?.id || ''}. Status: ${result?.status || 'Unknown'}.`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            window.speechSynthesis.speak(utterance);
        } finally {
            setVoiceLoading(false);
        }
    };

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!trackingId || !trackingId.trim()) return;
        setLoading(true); setError(''); setResult(null);
        const res = await apiTrackGrievance(trackingId.trim());
        setLoading(false);
        if (res.success) setResult(res.data);
        else setError(res.error);
    };

    const handleSelectGrievance = (id) => {
        setTrackingId(id);
        setResult(null);
        setError('');

        // Use a timeout to ensure state updates before tracking
        // Or better yet, call tracking directly with the ID
        setLoading(true);
        apiTrackGrievance(id).then(res => {
            setLoading(false);
            if (res.success) setResult(res.data);
            else setError(res.error);
        });
    };

    const loadMine = async () => {
        if (showMine) { setShowMine(false); return; }
        setLoadingMine(true);
        const res = await apiGetMyGrievances(user?.id);
        setMyGrievances(res.data);
        setLoadingMine(false);
        setShowMine(true);
    };

    const statusColor = {
        Pending: '#F59E0B',
        Resolved: '#00C896',
        Critical: '#EF4444',
        'In Progress': '#3B82F6',
        Escalated: '#8B5CF6',
        'Resolved (Pending Verification)': '#FF6B2C'
    };

    const handleVerifyResolution = async (grievanceData, uploadedPhoto) => {
        const currentGrievance = grievanceData || result;
        if (!currentGrievance) return;

        setLoading(true);
        // Call the verification API
        const note = uploadedPhoto ? 'Citizen verified resolution and uploaded photo proof.' : 'Citizen confirmed resolution via portal.';
        const res = await apiVerifyResolution(currentGrievance.id, 'verify', note);
        setLoading(false);
        if (res.success) {
            setResult({
                ...currentGrievance,
                status: 'Resolved',
                timeline: [
                    ...(currentGrievance.timeline || []),
                    {
                        status: 'Verified',
                        date: new Date().toISOString().split('T')[0],
                        note: note,
                        image: uploadedPhoto // Use the photo passed from the child
                    }
                ]
            });
            showToast('success', 'Resolution verified successfully! Funds have been released from Escrow.');
        } else {
            showToast('error', 'Verification failed: ' + res.error);
        }
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700, margin: '0 auto' }}>
            <div>
                <h1 className="section-title"><MdTrackChanges className="icon" /> Track Grievance</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    Enter your tracking ID to see real-time status updates
                </p>
            </div>

            {/* Search Box */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                <form onSubmit={handleTrack} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                        <input className="form-input" placeholder="Enter Tracking ID (e.g., GRV-2600089)"
                            value={trackingId} onChange={e => setTrackingId(e.target.value)}
                            style={{ paddingLeft: 42, width: '100%', padding: '12px 14px 12px 42px' }} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 24px', fontWeight: 700 }}>
                        {loading ? '...' : <><MdSearch /> Track</>}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: 'var(--red)' }}>
                        {error}
                    </div>
                )}

            </div>

            {/* Tracked Result */}
            {result && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, animation: 'fadeInUp 0.4s ease' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            {/* Issue 6: Styled grievance ID with copy button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--saffron)', background: 'rgba(255,107,44,0.1)', border: '1px solid rgba(255,107,44,0.25)', borderRadius: 6, padding: '3px 10px', letterSpacing: '0.05em', fontWeight: 700 }}>{result.id}</span>
                                <button title="Copy ID" onClick={() => handleCopyId(result.id)} style={{ background: copied ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(0,200,150,0.3)' : 'var(--border)'}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: copied ? '#00C896' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', transition: 'all 0.2s' }}>
                                    <MdContentCopy style={{ fontSize: '0.9rem' }} />{copied ? 'Copied!' : 'Copy'}
                                </button>
                                {/* Issue 7: Polly TTS voice button */}
                                <button title="Listen (Polly TTS)" onClick={() => handleVoiceRead(result)} disabled={voiceLoading} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 6, padding: '3px 8px', cursor: voiceLoading ? 'not-allowed' : 'pointer', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', transition: 'all 0.2s' }}>
                                    <MdVolumeUp style={{ fontSize: '0.95rem' }} />{voiceLoading ? 'Reading...' : 'Listen'}
                                </button>
                            </div>
                            <h2 style={{ fontSize: '1.1rem', marginTop: 4, wordBreak: 'break-word' }}>{result.title}</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                {result.citizenName} · {result.state} · {result.category}
                            </p>
                        </div>
                        <div style={{
                            padding: '8px 16px', borderRadius: 100, fontWeight: 700, fontSize: '0.85rem',
                            background: `${statusColor[result.status] || '#F59E0B'}15`,
                            color: statusColor[result.status] || '#F59E0B',
                            border: `1px solid ${statusColor[result.status] || '#F59E0B'}35`,
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}>
                            {result.status === 'Resolved (Pending Verification)' ? 'Awaiting User' : result.status}
                        </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {result.description}
                    </p>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className={`badge badge-${(result.priority || 'Medium').toLowerCase()}`}>{result.priority || 'Medium'} Priority</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Filed: {result.createdAt || 'N/A'}</span>
                        {result.assignedTo && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assigned to: {result.assignedTo}</span>}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 0 }}>Timeline</h4>
                        <StatusTimeline timeline={result.timeline} />
                    </div>

                    {/* Escrow Verification Section */}
                    {result.status === 'Resolved (Pending Verification)' && (
                        <EscrowVerificationPanel
                            grievanceId={result.id}
                            onSuccess={(uploadedPhoto) => handleVerifyResolution(result, uploadedPhoto)}
                            showToast={showToast}
                        />
                    )}

                    {/* Issue 6: Attached Documents */}
                    {result.documents && result.documents.length > 0 && (
                        <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>📎 Attached Documents</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {result.documents.map((doc, i) => {
                                    const url = doc.url || doc;
                                    const name = doc.originalName || doc.filename || `Document ${i + 1}`;
                                    const isImage = doc.mimetype ? doc.mimetype.startsWith('image/') : /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                                    const isAudio = doc.mimetype ? doc.mimetype.startsWith('audio/') : /\.(webm|ogg|mp3|wav|m4a)$/i.test(name);
                                    return (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140, maxWidth: 200 }}>
                                            {isImage ? (
                                                <a href={url} target="_blank" rel="noreferrer">
                                                    <img src={url} alt={name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                                                </a>
                                            ) : isAudio ? (
                                                <audio controls src={url} style={{ width: '100%' }} />
                                            ) : (
                                                <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 60, background: 'rgba(59,130,246,0.07)', borderRadius: 4, fontSize: '0.8rem', color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }}>
                                                    📄 View Document
                                                </a>
                                            )}
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* My Grievances */}
            <div>
                <button onClick={loadMine} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    {showMine ? 'Hide My Grievances' : '📋 View My Grievances'}
                </button>
                {loadingMine && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12 }}>Loading...</p>}
                {showMine && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                        {myGrievances.map(g => (
                            <div key={g.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                                onClick={() => handleSelectGrievance(g.id)}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.title}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{g.id}</p>
                                </div>
                                <span style={{ fontSize: '0.78rem', color: statusColor[g.status] || '#F59E0B', fontWeight: 700 }}>
                                    {g.status === 'Resolved (Pending Verification)' ? 'Awaiting User' : g.status}
                                </span>
                                <MdArrowForward style={{ color: 'var(--text-muted)', fontSize: '1rem' }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', bottom: 30, left: 0, right: 0,
                    zIndex: 2000, display: 'flex', justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        minWidth: 320, maxWidth: '90%',
                        animation: 'fadeInUp 0.3s ease',
                        pointerEvents: 'auto'
                    }}>
                        <div style={{
                            background: 'rgba(10, 22, 40, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${notification.type === 'success' ? 'var(--teal)' : 'var(--red)'}`,
                            borderRadius: 16, padding: '16px 20px',
                            display: 'flex', alignItems: 'center', gap: 14,
                            boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${notification.type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(239,68,68,0.1)'}`
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: notification.type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(239,68,68,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: notification.type === 'success' ? 'var(--teal)' : 'var(--red)',
                                fontSize: '1.2rem'
                            }}>
                                {notification.type === 'success' ? <MdCheckCircle /> : <MdClose />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-white)' }}>
                                    {notification.type === 'success' ? 'Success' : 'Attention Required'}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{notification.message}</p>
                            </div>
                            <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
                                <MdClose />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
