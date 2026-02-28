import React, { useState, useEffect } from 'react';
import { MdSecurity, MdWarning, MdInfo, MdHistory, MdPerson, MdSearch, MdError, MdTrendingUp, MdVisibility } from 'react-icons/md';
import { apiGetGhostAuditAlerts } from '../../services/api.service';
import { PROJECT_NAME } from '../../config/constants';

export default function GhostAudits() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await apiGetGhostAuditAlerts();
            setAlerts(res.data);
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
                    <p className="dash-subtitle">Autonomous officer accountability & ticket closure verification</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
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
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Audit Integrity Trend</h3>
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <MdTrendingUp style={{ fontSize: '3rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '0.8rem', marginTop: 10 }}>Officer closure quality increased by 14% since implementation.</p>
                    </div>
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
                                <button className="btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }}>
                                    <MdVisibility /> View Full Audit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
