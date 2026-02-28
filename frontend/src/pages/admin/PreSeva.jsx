import React, { useState, useEffect } from 'react';
import { MdShield, MdWarning, MdCheckCircle, MdSend, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { apiGetPreSevaAlerts, apiGetPreSevaStats, apiMarkPrevented } from '../../services/api.service';

const URGENCY = {
    critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: '🔴 CRITICAL', pulse: true },
    high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: '🟠 HIGH', pulse: false },
    medium: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', label: '🔵 MEDIUM', pulse: false },
};

const STATUS_BADGE = {
    'Department Notified': { cls: 'badge-inprogress', icon: '📡' },
    'Action Taken': { cls: 'badge-resolved', icon: '✅' },
    'Under Review': { cls: 'badge-pending', icon: '🔍' },
};

export default function PreSeva() {
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        Promise.all([apiGetPreSevaAlerts(), apiGetPreSevaStats()]).then(([a, s]) => {
            setAlerts(a.data);
            setStats(s.data);
            setLoading(false);
        });
    }, []);

    const markPrevented = async (id) => {
        await apiMarkPrevented(id);
        setAlerts(as => as.map(a => a.id === id ? { ...a, prevented: true, status: 'Action Taken' } : a));
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ marginRight: 12 }} /> Running prediction models...
        </div>
    );

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdShield className="icon" style={{ color: '#8B5CF6' }} /> PreSeva — AI Prevention Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        The world's first proactive public service failure prediction system. We solve problems before citizens experience them.
                    </p>
                </div>
                <div style={{
                    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 10, padding: '8px 16px', fontSize: '0.8rem', color: '#A78BFA', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6
                }}>
                    🤖 AI MODEL ACTIVE
                </div>
            </div>

            {/* Mission Statement */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06))',
                border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-lg)', padding: '20px 24px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #8B5CF6, #3B82F6, #00C896)' }} />
                <h3 style={{ fontSize: '1rem', color: '#A78BFA', marginBottom: 8 }}>The PreSeva Difference</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 700 }}>
                    Every government platform in the world is <strong style={{ color: 'white' }}>reactive</strong> — citizens suffer, then file, then wait. PreSeva is the global first:
                    our AI mines patterns across millions of historical grievances to <strong style={{ color: '#A78BFA' }}>predict failures 48–72 hours before they happen</strong>
                    — and alerts the relevant department to act preemptively. The result: citizens never even face the problem.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, color: '#00C896' }}>{stats?.prevented}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Problems Prevented</div>
                    </div>
                    <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, color: '#A78BFA' }}>{(stats?.totalGrievancesAvoided || 0).toLocaleString()}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Citizen Complaints Avoided</div>
                    </div>
                    <div style={{ background: 'rgba(255,107,44,0.1)', border: '1px solid rgba(255,107,44,0.25)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, color: 'var(--saffron)' }}>{stats?.topPredictionAccuracy}%</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Peak Prediction Accuracy</div>
                    </div>
                    <div style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: '#00C896' }}>{stats?.citySaved}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Public Funds Saved</div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {[
                    { label: 'Active Predictions', value: stats?.activePredictions, color: '#F59E0B', icon: '⚡' },
                    { label: 'Total Analyzed', value: stats?.totalPredictions, color: '#8B5CF6', icon: '🤖' },
                    { label: 'Prevention Rate', value: `${stats?.preventionRate}%`, color: '#00C896', icon: '🛡️' },
                    { label: 'Dept Alerts Sent', value: stats?.totalPredictions, color: '#3B82F6', icon: '📡' },
                ].map(s => (
                    <div key={s.label} className="metric-card" style={{ '--accent-color': s.color, textAlign: 'center' }}>
                        <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Prediction Cards */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>🔮 Active Predictions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {alerts.map((alert, i) => {
                        const urg = URGENCY[alert.urgency] || URGENCY.medium;
                        const sb = STATUS_BADGE[alert.status] || { cls: 'badge-pending', icon: '⏳' };
                        const isExpanded = expanded === alert.id;
                        return (
                            <div key={alert.id} style={{
                                background: alert.prevented ? 'rgba(0,200,150,0.04)' : urg.bg,
                                border: `1px solid ${alert.prevented ? 'rgba(0,200,150,0.25)' : urg.border}`,
                                borderRadius: 'var(--radius)', overflow: 'hidden',
                                animation: `fadeInUp 0.3s ease ${i * 0.08}s both`
                            }}>
                                {/* Card Row */}
                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }}
                                    onClick={() => setExpanded(isExpanded ? null : alert.id)}>
                                    {/* Probability ring */}
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '50%', flexShrink: 0, position: 'relative',
                                        background: `conic-gradient(${urg.color} ${alert.probability}%, rgba(255, 255, 255, 0.12) 0%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'Space Grotesk', fontSize: '0.78rem', fontWeight: 800, color: urg.color
                                        }}>{alert.probability}%</div>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{alert.id}</span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`, padding: '2px 8px', borderRadius: 100 }}>{urg.label}</span>
                                            <span className={`badge ${sb.cls}`}>{sb.icon} {alert.status}</span>
                                            {alert.prevented && <span className="badge badge-resolved">🛡️ PREVENTED</span>}
                                        </div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 4 }}>{alert.title}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            📍 {alert.district}, {alert.state} &nbsp;·&nbsp; 📅 Predicted: {alert.predictedDate} &nbsp;·&nbsp; ⏱️ {alert.daysUntil} days
                                        </p>
                                    </div>

                                    {/* Probability bar */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, minWidth: 100 }}>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>Confidence</div>
                                        <div style={{ height: 6, width: 100, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${alert.probability}%`, height: '100%', background: urg.color, borderRadius: 3, transition: 'width 1s ease' }} />
                                        </div>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: urg.color, textAlign: 'right' }}>{alert.probability}% likely</div>
                                    </div>

                                    {!alert.prevented && (
                                        <button onClick={e => { e.stopPropagation(); markPrevented(alert.id); }} style={{
                                            background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.3)',
                                            color: '#00C896', borderRadius: 8, padding: '8px 16px', fontSize: '0.78rem',
                                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                            flexShrink: 0, transition: 'all 0.2s'
                                        }}>
                                            <MdCheckCircle /> Mark Prevented
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', animation: 'fadeIn 0.3s ease' }}>
                                        <div className="responsive-grid-2" style={{ gap: 14, marginTop: 16 }}>
                                            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                                                <h5 style={{ fontSize: '0.78rem', color: '#A78BFA', marginBottom: 8 }}>🤖 AI Pattern Analysis</h5>
                                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.historicalPattern || 'Pattern analysis unavailable.'}</p>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>Based on {(alert.basisGrievances || 0).toLocaleString()} historical grievances</p>
                                            </div>
                                            <div style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                                                <h5 style={{ fontSize: '0.78rem', color: '#00C896', marginBottom: 8 }}>📋 Suggested Action</h5>
                                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.suggestedAction}</p>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>Dept: {alert.departmentAlerted} · Alerted: {alert.alertSentAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* How PreSeva Works */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>⚙️ How PreSeva Works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        { step: '01', title: 'Data Mining', desc: 'AI analyzes 8M+ historical grievances — by location, time, category, department.' },
                        { step: '02', title: 'Pattern Recognition', desc: 'Deep learning detects seasonal, geographic, and cyclical failure patterns.' },
                        { step: '03', title: 'Prediction Generation', desc: 'Failure probabilities computed 48-72hrs ahead with confidence scores.' },
                        { step: '04', title: 'Department Alerts', desc: 'Auto-alerts sent to the exact department that can prevent the failure.' },
                        { step: '05', title: 'Prevention Tracking', desc: 'Officers confirm action taken. System logs prevented grievances.' },
                        { step: '06', title: 'Model Learning', desc: 'Each prevention improves future accuracy. Self-improving intelligence.' },
                    ].map(s => (
                        <div key={s.step} style={{ borderLeft: '2px solid rgba(139,92,246,0.3)', paddingLeft: 14 }}>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 900, color: '#8B5CF6', opacity: 0.6 }}>{s.step}</div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
