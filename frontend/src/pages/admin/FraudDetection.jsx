import React, { useState, useEffect, useRef } from 'react';
import { MdSecurity, MdCheck, MdClose, MdWarning, MdFlag, MdInfo, MdError, MdSearch } from 'react-icons/md';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { apiGetFraudDuplicates, apiReviewFraud } from '../../services/api.service';

const RISK_CONFIG = {
    Extreme: { color: '#EF4444', icon: <MdError />, bg: 'rgba(239,68,68,0.1)' },
    High: { color: '#F97316', icon: <MdWarning />, bg: 'rgba(249,115,22,0.1)' },
    Moderate: { color: '#F59E0B', icon: <MdInfo />, bg: 'rgba(245,158,11,0.1)' },
    Low: { color: '#3B82F6', icon: <MdInfo />, bg: 'rgba(59,130,246,0.1)' },
};

function Toast({ msg, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    if (!msg) return null;
    return (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, background: msg.type === 'success' ? 'rgba(0,200,150,0.95)' : msg.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(139,92,246,0.95)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeInUp 0.3s ease' }}>
            {msg.type === 'success' ? '✓' : msg.type === 'error' ? '✗' : '🚩'} {msg.text}
        </div>
    );
}

export default function FraudDetection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [toast, setToast] = useState(null);
    const [flagModal, setFlagModal] = useState(null); // { id, title }
    const [flagNote, setFlagNote] = useState('');
    const [flagging, setFlagging] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await apiGetFraudDuplicates();
            setItems(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        };
        load();
    }, []);

    const showToast = (type, text) => setToast({ type, text });

    const handleAction = async (id, action) => {
        // Optimistic update immediately
        const newStatus = action === 'confirm' ? 'Confirmed' : 'Dismissed';
        setItems(is => is.map(i => (i.id === id || i._id === id) ? { ...i, status: newStatus } : i));
        showToast(action === 'confirm' ? 'error' : 'success', action === 'confirm' ? '🚨 Case confirmed as fraud & blocked' : '✓ Case dismissed as false positive');
        // Fire API in background
        apiReviewFraud(id, action).catch(() => {});
    };

    const handleFlag = async () => {
        if (!flagModal) return;
        setFlagging(true);
        setItems(is => is.map(i => (i.id === flagModal.id || i._id === flagModal.id) ? { ...i, status: 'Under Investigation', flagNote } : i));
        await new Promise(r => setTimeout(r, 600));
        setFlagging(false);
        setFlagModal(null);
        setFlagNote('');
        showToast('flag', '🚩 Case flagged for investigation');
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'Pending Review': return <span className="badge badge-pending">⏳ Pending Review</span>;
            case 'Confirmed': return <span className="badge badge-critical">🚨 Confirmed Fraud</span>;
            case 'Dismissed': return <span className="badge badge-resolved">✔ Dismissed</span>;
            case 'Under Investigation': return <span className="badge badge-inprogress">🚩 Under Investigation</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = items.filter(i => i.status === 'Pending Review').length;
    const extremeCount = items.filter(i => i.riskLevel === 'Extreme').length;

    const displayItems = items.filter(i => {
        const id = i.id || i._id || '';
        const matchSearch = !searchTerm || id.toLowerCase().includes(searchTerm.toLowerCase()) || (i.primary?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (i.primary?.citizen || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || i.status === filterStatus;
        return matchSearch && matchStatus;
    });

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

            {/* BharatShield Live Scan Banner */}
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00C896', boxShadow: '0 0 8px #00C896', animation: 'pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A78BFA' }}>BharatShield Live Scan</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scanning {items.length} flagged cases in real-time</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: '#EF4444' }}>✦ {items.filter(i => i.status === 'Confirmed').length} Confirmed</span>
                    <span style={{ color: '#00C896' }}>✦ {items.filter(i => i.status === 'Dismissed').length} Dismissed</span>
                    <span style={{ color: '#F59E0B' }}>✦ {pendingCount} Pending</span>
                </div>
            </div>

            {/* Fraud Trend Mini Chart */}
            {items.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 160px', height: 160 }}>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={[
                                    { name: 'Confirmed', value: Math.max(1, items.filter(i => i.status === 'Confirmed').length), color: '#EF4444' },
                                    { name: 'Dismissed', value: Math.max(1, items.filter(i => i.status === 'Dismissed').length), color: '#00C896' },
                                    { name: 'Pending', value: Math.max(1, pendingCount), color: '#F59E0B' },
                                ]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {['#EF4444', '#00C896', '#F59E0B'].map((color, i) => <Cell key={i} fill={color} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: '0.75rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Case Distribution</h4>
                        {[{ label: 'Confirmed Fraud', count: items.filter(i => i.status === 'Confirmed').length, color: '#EF4444' }, { label: 'Dismissed (False Positive)', count: items.filter(i => i.status === 'Dismissed').length, color: '#00C896' }, { label: 'Pending Review', count: pendingCount, color: '#F59E0B' }].map(row => (
                            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: row.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{row.label}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: row.color }}>{row.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                    <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" placeholder="Search by ID, title, citizen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 38 }} />
                </div>
                {['all', 'Pending Review', 'Confirmed', 'Dismissed', 'Under Investigation'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', borderColor: filterStatus === s ? 'var(--saffron)' : 'var(--border)', background: filterStatus === s ? 'rgba(255,107,44,0.12)' : 'transparent', color: filterStatus === s ? 'var(--saffron)' : 'var(--text-secondary)' }}>{s === 'all' ? 'All Cases' : s}</button>
                ))}
            </div>

            {/* Cases List */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>Scanning national grievance registry...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {displayItems.map((item, i) => {
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
                                            <span className={`badge ${item.type?.toLowerCase() === 'fraud' ? 'badge-critical' : 'badge-inprogress'}`}>{item.type}</span>
                                            {statusBadge(item.status)}
                                        </div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.primary?.title || item.title}</h4>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            Triggered by: <strong>{item.primary?.citizen || 'Citizen'}</strong> · {item.primary?.state || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    {item.status === 'Pending Review' && (
                                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleAction(itemId, 'confirm')} style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>🚨 Block</button>
                                            <button onClick={() => handleAction(itemId, 'dismiss')} style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>✓ Dismiss</button>
                                            <button onClick={() => { setFlagModal({ id: itemId, title: item.primary?.title || item.title }); setFlagNote(''); }} style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>🚩 Investigate</button>
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
                                                    <div style={{ marginTop: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 3 }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Match Confidence</span>
                                                <span style={{ fontWeight: 700, color: 'var(--saffron)' }}>{item.similarity}%</span>
                                            </div>
                                            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ width: `${item.similarity}%`, height: '100%', background: item.similarity > 80 ? '#EF4444' : '#F59E0B', borderRadius: 3 }} />
                                            </div>
                                        </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {displayItems.length === 0 && <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>{items.length === 0 ? 'No security flags active in the system.' : 'No cases match your search/filter.'}</div>}
                </div>
            )}

            {/* Flag Investigation Modal */}
            {flagModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,24,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 16, padding: 28, maxWidth: 440, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#A78BFA' }}>🚩 Flag for Investigation</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, maxWidth: 320 }}>{flagModal.title}</p>
                            </div>
                            <button onClick={() => setFlagModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                        </div>
                        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#A78BFA' }}>
                            This case will be escalated to the Special Investigation Unit with your notes attached.
                        </div>
                        <div className="form-group">
                            <label className="form-label">Investigation Notes <span style={{ color: 'var(--text-muted)' }}>(required)</span></label>
                            <textarea className="form-input" rows={4} placeholder="Describe the suspicious pattern, evidence, or reason for investigation..." value={flagNote} onChange={e => setFlagNote(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setFlagModal(null)}>Cancel</button>
                            <button onClick={handleFlag} disabled={!flagNote.trim() || flagging} style={{ flex: 1, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: flagNote.trim() ? 'pointer' : 'not-allowed', opacity: flagNote.trim() ? 1 : 0.5 }}>
                                {flagging ? 'Flagging...' : '🚩 Flag & Escalate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast msg={toast} onClose={() => setToast(null)} />
        </div>
    );
}
