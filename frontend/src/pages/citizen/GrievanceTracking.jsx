import React, { useState } from 'react';
import { MdTrackChanges, MdSearch, MdCheckCircle, MdHourglassEmpty, MdEdit, MdArrowForward, MdPhotoCamera, MdStar, MdStarBorder, MdCloudUpload, MdVerifiedUser } from 'react-icons/md';
import { apiTrackGrievance } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import { apiGetMyGrievances } from '../../services/api.service';

function EscrowVerificationPanel({ grievanceId, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (rating === 0) return alert('Please provide a rating.');
        setLoading(true);
        // Simulate API call
        await new Promise(res => setTimeout(res, 1500));
        setLoading(false);
        onSuccess();
    };

    return (
        <div style={{
            marginTop: 24, padding: 20, background: 'rgba(0, 200, 150, 0.05)',
            border: '2px dashed rgba(0, 200, 150, 0.3)', borderRadius: 12,
            animation: 'pulseBorder 2s infinite'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <MdVerifiedUser style={{ color: 'var(--teal)', fontSize: '1.4rem' }} />
                <h3 style={{ fontSize: '1rem', color: 'var(--text-white)' }}>Action Required: Confirm Resolution</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                The government has locked <strong>₹12,50,000</strong> in Escrow for this project.
                Contractor <strong>NH Infra Ltd</strong> claims work is done.
                Please verify below to release the funds.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 1. Photo Upload */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>1. Upload Proof of Resolution (Photo)</label>
                    <div
                        onClick={() => setPhoto('mock-photo-url')}
                        style={{
                            height: 100, border: '1px dashed var(--border)', borderRadius: 8,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', background: photo ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                    >
                        {photo ? (
                            <div style={{ color: 'var(--teal)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MdCheckCircle /> Photo Uploaded Successfully
                            </div>
                        ) : (
                            <>
                                <MdCloudUpload style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to capture/upload photo</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Rating */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>2. Rate the Quality of Work</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                {star <= (hover || rating) ? (
                                    <MdStar style={{ color: '#FFD700', fontSize: '1.8rem' }} />
                                ) : (
                                    <MdStarBorder style={{ color: 'var(--text-muted)', fontSize: '1.8rem' }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleVerify}
                    disabled={loading || rating === 0}
                    style={{ background: 'var(--teal)', width: '100%', padding: '12px', fontWeight: 700 }}
                >
                    {loading ? 'Processing Escrow Release...' : 'Confirm & Release Funds'}
                </button>
            </div>
        </div>
    );
}

function StatusTimeline({ timeline }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 20 }}>
            {timeline.map((event, i) => (
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
                            {event.status}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{event.note}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{event.date}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function GrievanceTracking() {
    const { user } = useAuth();
    const [trackingId, setTrackingId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [myGrievances, setMyGrievances] = useState([]);
    const [loadingMine, setLoadingMine] = useState(false);
    const [showMine, setShowMine] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingId.trim()) return;
        setLoading(true); setError(''); setResult(null);
        const res = await apiTrackGrievance(trackingId.trim());
        setLoading(false);
        if (res.success) setResult(res.data);
        else setError(res.error);
    };

    const loadMine = async () => {
        if (showMine) { setShowMine(false); return; }
        setLoadingMine(true);
        const res = await apiGetMyGrievances(user?.id);
        setMyGrievances(res.data);
        setLoadingMine(false);
        setShowMine(true);
    };

    const statusColor = { Pending: '#F59E0B', Resolved: '#00C896', Critical: '#EF4444', 'In Progress': '#3B82F6', Escalated: '#8B5CF6' };

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

                <p style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    💡 Try: <span style={{ fontFamily: 'monospace', color: 'var(--saffron)', cursor: 'pointer' }}
                        onClick={() => setTrackingId('GRV-2601001')}>GRV-2601001</span>
                </p>
            </div>

            {/* Tracked Result */}
            {result && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, animation: 'fadeInUp 0.4s ease' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--saffron)' }}>{result.id}</span>
                            <h2 style={{ fontSize: '1.1rem', marginTop: 4 }}>{result.title}</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                {result.citizenName} · {result.state} · {result.category}
                            </p>
                        </div>
                        <div style={{
                            padding: '8px 16px', borderRadius: 100, fontWeight: 700, fontSize: '0.85rem',
                            background: `${statusColor[result.status] || '#F59E0B'}15`,
                            color: statusColor[result.status] || '#F59E0B',
                            border: `1px solid ${statusColor[result.status] || '#F59E0B'}35`
                        }}>
                            {result.status}
                        </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                        {result.description}
                    </p>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className={`badge badge-${result.priority.toLowerCase()}`}>{result.priority} Priority</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Filed: {result.createdAt}</span>
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
                            onSuccess={() => {
                                setResult({ ...result, status: 'Resolved', timeline: [...result.timeline, { status: 'Funds Disbursed', date: new Date().toISOString().split('T')[0], note: 'Citizen verified resolution. Contractor funds released.' }] });
                            }}
                        />
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
                                onClick={() => { setTrackingId(g.id); setResult(null); setError(''); }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.title}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{g.id}</p>
                                </div>
                                <span style={{ fontSize: '0.78rem', color: statusColor[g.status], fontWeight: 700 }}>{g.status}</span>
                                <MdArrowForward style={{ color: 'var(--text-muted)', fontSize: '1rem' }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
