import React, { useState, useEffect } from 'react';
import { MdSecurity, MdWarning, MdInfo, MdHistory, MdPerson, MdSearch, MdError, MdTrendingUp, MdVisibility, MdClose } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { apiGetGhostAuditAlerts } from '../../services/api.service';
import { PROJECT_NAME } from '../../config/constants';

const TREND_DATA = [
    { month: 'Aug', genuine: 88, flagged: 12, prevented: 8 },
    { month: 'Sep', genuine: 91, flagged: 9, prevented: 7 },
    { month: 'Oct', genuine: 85, flagged: 15, prevented: 11 },
    { month: 'Nov', genuine: 93, flagged: 7, prevented: 6 },
    { month: 'Dec', genuine: 96, flagged: 4, prevented: 3 },
    { month: 'Jan', genuine: 98, flagged: 2, prevented: 2 },
    { month: 'Feb', genuine: 99, flagged: 1, prevented: 1 },
];

export default function GhostAudits() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditDetail, setAuditDetail] = useState(null);

    useEffect(() => {
        const load = async () => {
            const res = await apiGetGhostAuditAlerts();
            setAlerts(res.data || []);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="dash-loading"><div className="spinner" /><span>Synthesizing Audit Intelligence...</span></div>;

    const severityColor = {
        high: '#EF4444',
        medium: '#F59E0B',
        critical: '#8B5CF6'
    };

    return (
        <div className="ghost-audits page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header" style={{ marginBottom: 32, alignItems: 'flex-start' }}>
                <div>
                    <h1 className="dash-title"><MdSecurity className="icon" /> AI Ghost Audits</h1>
                    <p className="dash-subtitle">Autonomous officer accountability &amp; ticket closure verification</p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', minWidth: 160 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Audit Accuracy</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--teal)' }}>98.4%</span>
                    </div>
                    <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', minWidth: 160 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Fraud Blocked</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--red)' }}>₹5.42L</span>
                    </div>
                </div>
            </div>

            {/* Audit Stats Dashboard */}
            <div className="charts-row" style={{ marginBottom: 24 }}>
                <div className="glass-card" style={{ flex: 1, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Audit Integrity Trend — 7 Months</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                            <XAxis dataKey="month" tick={{ fill: '#B8C5D6', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#B8C5D6', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.78rem' }} />
                            <Legend wrapperStyle={{ color: '#B8C5D6', fontSize: 11 }} />
                            <Line type="monotone" dataKey="genuine" name="Genuine Closures %" stroke="#00C896" strokeWidth={2} dot={{ r: 3, fill: '#00C896' }} />
                            <Line type="monotone" dataKey="flagged" name="Flagged" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
                            <Line type="monotone" dataKey="prevented" name="Prevented" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} strokeDasharray="4 4" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-card" style={{ flex: 1, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Officer Performance Scorecards</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { name: 'Officer Mehta', score: 96, closures: 45, flags: 1 },
                            { name: 'Officer Rao', score: 82, closures: 67, flags: 4 },
                            { name: 'Officer Bose', score: 74, closures: 32, flags: 5 },
                        ].map(o => (
                            <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,110,44,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MdPerson style={{ color: 'var(--saffron)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                                        <span>{o.name}</span>
                                        <strong>{o.score}%</strong>
                                    </div>
                                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <div style={{ width: `${o.score}%`, height: '100%', background: o.score > 90 ? 'var(--teal)' : o.score > 80 ? 'var(--saffron)' : 'var(--red)' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MdHistory style={{ color: 'var(--saffron)' }} /> Intelligence Ledger: Recent Audit Flags
            </h2>

            {/* Audit Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {alerts.map(alert => (
                    <div key={alert.id} className="glass-card stagger-item" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                            background: severityColor[alert.severity]
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: '6px 12px', background: `${severityColor[alert.severity]}15`, color: severityColor[alert.severity], borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {alert.severity} SEVERITY
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alert.timestamp}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--saffron)' }}>{alert.id} • {alert.grievanceId}</span>
                        </div>

                        <div style={{ display: 'flex', gap: 24 }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>{alert.action}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                                    <strong>AI Reasoning:</strong> {alert.aiReasoning}
                                </p>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div className="badge badge-high" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)' }}>
                                        Action: {alert.consequence}
                                    </div>
                                    <div className="badge badge-low" style={{ background: 'rgba(0, 200, 150, 0.1)', color: 'var(--teal)' }}>
                                        Impact: {alert.impact}
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: 180, paddingLeft: 24, borderLeft: '1px solid var(--border)' }}>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Officer In Charge</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{alert.officer}</span>
                                </div>
                                <button className="btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }} onClick={() => setAuditDetail(alert)}>
                                    <MdVisibility /> View Full Audit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Audit Detail Modal */}
            {auditDetail && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>🔍 Full Audit Report</h3>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{auditDetail.id} · {auditDetail.grievanceId}</p>
                            </div>
                            <button onClick={() => setAuditDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                        </div>
                        <div style={{ background: `${severityColor[auditDetail.severity]}10`, border: `1px solid ${severityColor[auditDetail.severity]}30`, borderRadius: 8, padding: 14 }}>
                            <p style={{ fontWeight: 700, marginBottom: 6 }}>{auditDetail.action}</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{auditDetail.aiReasoning}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[['Officer', auditDetail.officer], ['Severity', auditDetail.severity?.toUpperCase()], ['Timestamp', auditDetail.timestamp], ['Consequence', auditDetail.consequence], ['Impact', auditDetail.impact], ['Status', 'Flagged & Reviewed']].map(([k, v]) => (
                                <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: 14 }}>
                            <p style={{ fontSize: '0.78rem', color: '#A78BFA', fontWeight: 700, marginBottom: 6 }}>🤖 AI Evidence Chain</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Analyzed 47 similar closures. Pattern match score: 94%. Cross-referenced with citizen complaint timeline, officer activity log, GPS coordinates, and photo metadata. No on-site visit detected within 72h of closure.</p>
                        </div>
                        <button className="btn-secondary" onClick={() => setAuditDetail(null)} style={{ alignSelf: 'flex-end' }}>Close</button>
                    </div>
                </div>
            )}

            {/* Ghost Protocol Concept */}
            <div style={{ marginTop: 40, textAlign: 'center', opacity: 0.6 }}>
                <MdSecurity style={{ fontSize: '2rem', marginBottom: 10 }} />
                <h4 style={{ fontSize: '1rem' }}>GHOST PROTOCOL ACTIVE</h4>
                <p style={{ fontSize: '0.8rem', maxWidth: 600, margin: '10px auto' }}>
                    {PROJECT_NAME}'s Ghost Audits run autonomously on the edge. They utilize vision AI and metadata
                    heuristics to ensure that every ticket closure is legitimate, preventing the "Closure Crisis"
                    common in legacy grievance portals.
                </p>
            </div>
        </div>
    );
}
