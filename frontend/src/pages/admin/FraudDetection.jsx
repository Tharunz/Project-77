import React, { useState, useEffect } from 'react';
import { MdSecurity, MdCheck, MdClose, MdWarning, MdFlag, MdInfo } from 'react-icons/md';
import { apiGetFraudDuplicates, apiReviewFraud } from '../../services/api.service';

export default function FraudDetection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        apiGetFraudDuplicates().then(res => {
            setItems(res.data);
            setLoading(false);
        });
    }, []);

    const handleAction = async (id, action) => {
        await apiReviewFraud(id, action);
        setItems(is => is.map(i => i.id === id ? { ...i, status: action === 'confirm' ? 'Confirmed' : action === 'dismiss' ? 'Dismissed' : 'Under Investigation' } : i));
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'Pending Review': return <span className="badge badge-pending">⏳ Pending Review</span>;
            case 'Under Investigation': return <span className="badge badge-inprogress">🔍 Investigating</span>;
            case 'Confirmed Duplicate': return <span className="badge badge-critical">✅ Confirmed Duplicate</span>;
            case 'Confirmed': return <span className="badge badge-critical">🚨 Confirmed Fraud</span>;
            case 'Dismissed': return <span className="badge badge-resolved">✔ Dismissed</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = items.filter(i => i.status === 'Pending Review').length;
    const fraudCount = items.filter(i => i.type === 'fraud').length;
    const duplicateCount = items.filter(i => i.type === 'duplicate').length;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdSecurity className="icon" /> Fraud & Duplicate Detection</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        AI-powered anomaly detection across all grievance filings
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {[
                    { label: 'Pending Review', value: pendingCount, color: '#F59E0B', icon: '⏳' },
                    { label: 'Potential Fraud', value: fraudCount, color: '#EF4444', icon: '🚨' },
                    { label: 'Duplicates Detected', value: duplicateCount, color: '#3B82F6', icon: '🔁' },
                    { label: 'Total Flagged', value: items.length, color: '#8B5CF6', icon: '🤖' },
                ].map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color }}>
                        <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: stat.color, marginTop: 6 }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* AI Explanation */}
            <div style={{
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 'var(--radius)', padding: '14px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 12
            }}>
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                    <h4 style={{ fontSize: '0.88rem', color: '#A78BFA', marginBottom: 4 }}>AI Detection Methodology</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Our AI analyzes text similarity (cosine similarity &gt;85%), phone/Aadhaar fingerprinting, geographic clustering, and temporal patterns to detect duplicate filings and potential fraud. Each flagged case includes an AI-generated reason for transparency.
                    </p>
                </div>
            </div>

            {/* Cases List */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>Analyzing patterns...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {items.map((item, i) => (
                        <div key={item.id} style={{
                            background: item.type === 'fraud' ? 'rgba(239,68,68,0.04)' : 'rgba(59,130,246,0.04)',
                            border: `1px solid ${item.type === 'fraud' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
                            borderRadius: 'var(--radius)', overflow: 'hidden',
                            animation: `fadeInUp 0.3s ease ${i * 0.08}s both`
                        }}>
                            {/* Card Header */}
                            <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
                                onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                    background: item.type === 'fraud' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', color: item.type === 'fraud' ? '#EF4444' : '#3B82F6'
                                }}>
                                    {item.type === 'fraud' ? <MdWarning /> : <MdInfo />}
                                </div>

                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{item.id}</span>
                                        <span className={`badge ${item.type === 'fraud' ? 'badge-critical' : 'badge-inprogress'}`}>
                                            {item.type === 'fraud' ? '🚨 Potential Fraud' : '🔁 Duplicate'}
                                        </span>
                                        {statusBadge(item.status)}
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        Primary: <strong style={{ color: 'var(--text-primary)' }}>{item.primary.id}</strong> — {item.primary.citizen} ({item.primary.state})
                                        {item.secondary && <> · Secondary: <strong style={{ color: 'var(--text-primary)' }}>{item.secondary.id}</strong> — {item.secondary.citizen}</>}
                                    </p>
                                    {item.similarity && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Similarity score:</span>
                                            <div style={{ height: 4, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ width: `${item.similarity}%`, height: '100%', background: item.similarity > 90 ? '#EF4444' : '#F59E0B', borderRadius: 2 }} />
                                            </div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.similarity > 90 ? '#EF4444' : '#F59E0B' }}>{item.similarity}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons (always visible) */}
                                {item.status === 'Pending Review' && (
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleAction(item.id, 'confirm')} style={{
                                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                            color: '#EF4444', borderRadius: 6, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                        }}><MdFlag /> Confirm</button>
                                        <button onClick={() => handleAction(item.id, 'dismiss')} style={{
                                            background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)',
                                            color: '#00C896', borderRadius: 6, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                        }}><MdCheck /> Dismiss</button>
                                    </div>
                                )}
                            </div>

                            {/* Expanded Detail */}
                            {expanded === item.id && (
                                <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                                    <div style={{
                                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                                        borderRadius: 8, padding: '12px 16px', marginTop: 16, marginBottom: 16
                                    }}>
                                        <h5 style={{ fontSize: '0.78rem', color: '#A78BFA', marginBottom: 6 }}>🤖 AI Reasoning</h5>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.aiReason}</p>
                                    </div>
                                    <div className={item.secondary ? "responsive-grid-2" : ""} style={{ display: 'grid', gridTemplateColumns: item.secondary ? undefined : '1fr', gap: 16 }}>
                                        {[item.primary, item.secondary].filter(Boolean).map((g, gi) => (
                                            <div key={gi} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '14px 16px' }}>
                                                <h5 style={{ fontSize: '0.78rem', color: 'var(--saffron)', marginBottom: 8 }}>
                                                    {gi === 0 ? 'Primary' : 'Secondary'} — {g.id}
                                                </h5>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                                    <strong style={{ color: 'var(--text-primary)' }}>{g.citizen}</strong> · {g.state}
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{g.description}</p>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>Filed: {g.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
