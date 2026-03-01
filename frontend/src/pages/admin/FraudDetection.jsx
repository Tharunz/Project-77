import React, { useState, useEffect } from 'react';
import { MdSecurity, MdCheck, MdClose, MdWarning, MdFlag, MdInfo, MdError } from 'react-icons/md';
import { apiGetFraudDuplicates, apiReviewFraud } from '../../services/api.service';

const RISK_CONFIG = {
    Extreme: { color: '#EF4444', icon: <MdError />, bg: 'rgba(239,68,68,0.1)' },
    High: { color: '#F97316', icon: <MdWarning />, bg: 'rgba(249,115,22,0.1)' },
    Moderate: { color: '#F59E0B', icon: <MdInfo />, bg: 'rgba(245,158,11,0.1)' },
    Low: { color: '#3B82F6', icon: <MdInfo />, bg: 'rgba(59,130,246,0.1)' },
};

export default function FraudDetection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await apiGetFraudDuplicates();
            setItems(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        };
        load();
    }, []);

    const handleAction = async (id, action) => {
        const res = await apiReviewFraud(id, action);
        if (res.success) {
            setItems(is => is.map(i => (i.id === id || i._id === id) ? { ...i, status: action === 'confirm' ? 'Confirmed' : 'Dismissed' } : i));
        }
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'Pending Review': return <span className="badge badge-pending">⏳ Pending Review</span>;
            case 'Confirmed': return <span className="badge badge-critical">🚨 Confirmed Fraud</span>;
            case 'Dismissed': return <span className="badge badge-resolved">✔ Dismissed</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = items.filter(i => i.status === 'Pending Review').length;
    const fraudCount = items.filter(i => i.type?.toLowerCase().includes('fraud')).length;
    const extremeCount = items.filter(i => i.riskLevel === 'Extreme').length;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdSecurity className="icon" /> AI Fraud & Duplicate Guardian</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Powered by BharatShield AI — analyzing cross-state patterns and behavioral anomalies.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {[
                    { label: 'Extreme Risks', value: extremeCount, color: '#EF4444', icon: '🔥' },
                    { label: 'Pending Review', value: pendingCount, color: '#F59E0B', icon: '⏳' },
                    { label: 'Total Flagged', value: items.length, color: '#8B5CF6', icon: '🤖' },
                    { label: 'Trust Index', value: '98.2%', color: '#00C896', icon: '🛡️' },
                ].map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color, textAlign: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: stat.color, marginTop: 6 }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* AI Explanation */}
            <div style={{
                background: 'rgba(5,11,26,0.4)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '14px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 12
            }}>
                <span style={{ fontSize: '1.4rem' }}>🧠</span>
                <div>
                    <h4 style={{ fontSize: '0.88rem', color: 'var(--saffron)', marginBottom: 4 }}>Anomaly Detection Intelligence</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        BharatShield AI flags grievances with a confidence score based on Aadhaar-Link validation, NLP similarity, and GPS geolocation clustering. Review the "AI Reasoning" before taking action.
                    </p>
                </div>
            </div>

            {/* Cases List */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>Scanning national grievance registry...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {items.map((item, i) => {
                        const risk = RISK_CONFIG[item.riskLevel] || RISK_CONFIG.Low;
                        const itemId = item.id || item._id;
                        return (
                            <div key={itemId} style={{
                                background: 'var(--bg-card)',
                                border: `1px solid ${expanded === itemId ? 'var(--saffron)' : 'var(--border)'}`,
                                borderLeft: `4px solid ${risk.color}`,
                                borderRadius: 'var(--radius)', overflow: 'hidden',
                                animation: `fadeInUp 0.3s ease ${i * 0.05}s both`
                            }}>
                                {/* Card Header */}
                                <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
                                    onClick={() => setExpanded(expanded === itemId ? null : itemId)}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                        background: risk.bg, color: risk.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                    }}>
                                        {risk.icon}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--saffron)', background: 'rgba(255,107,44,0.1)', padding: '2px 6px', borderRadius: 4 }}>{itemId}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: risk.color }}>{item.riskLevel} Risk</span>
                                            <span className={`badge ${item.type?.toLowerCase() === 'fraud' ? 'badge-critical' : 'badge-inprogress'}`}>
                                                {item.type}
                                            </span>
                                            {statusBadge(item.status)}
                                        </div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.primary?.title || item.title}</h4>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            Triggered by: <strong>{item.primary?.citizen || 'Citizen'}</strong> · {item.primary?.state || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    {item.status === 'Pending Review' && (
                                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleAction(itemId, 'confirm')} style={{
                                                background: '#EF4444', color: 'white', border: 'none',
                                                borderRadius: 6, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                                            }}>Block & Flag</button>
                                            <button onClick={() => handleAction(itemId, 'dismiss')} style={{
                                                background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                                                borderRadius: 6, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                                            }}>Dismiss</button>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Detail */}
                                {expanded === itemId && (
                                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{
                                            background: 'rgba(255,107,44,0.05)', border: '1px solid rgba(255,107,44,0.2)',
                                            borderRadius: 8, padding: '14px 18px', marginTop: 16, marginBottom: 16
                                        }}>
                                            <h5 style={{ fontSize: '0.75rem', color: 'var(--saffron)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <MdSecurity /> BharatShield AI Reasoning
                                            </h5>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{item.aiReason}"</p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: item.secondary ? '1fr 1fr' : '1fr', gap: 16 }}>
                                            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                                                <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Primary Evidence</h5>
                                                <p style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>{item.primary?.title}</p>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.primary?.description}</p>
                                            </div>
                                            {item.secondary && (
                                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                                                    <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Conflict Reference</h5>
                                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>{item.secondary?.title}</p>
                                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.secondary?.description}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--saffron)', marginTop: 8, fontWeight: 700 }}>MATCH CONFIDENCE: {item.similarity}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {items.length === 0 && <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>No security flags active in the system.</div>}
                </div>
            )}
        </div>
    );
}
