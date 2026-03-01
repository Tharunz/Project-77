import React, { useState, useEffect } from 'react';
import { MdTimerOff, MdTimer, MdWarning, MdCheckCircle, MdPerson, MdStars, MdVerified } from 'react-icons/md';
import { apiGetSLAData, apiGetOfficerLeaderboard } from '../../services/api.service';

const STATUS_CFG = {
    'Breached': { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: <MdTimerOff /> },
    'Due Today': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: <MdWarning /> },
    'At Risk': { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', icon: <MdWarning /> },
    'On Track': { color: '#00C896', bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.2)', icon: <MdCheckCircle /> },
};

const BADGE_CONFIG = {
    Gold: { icon: <MdStars style={{ color: '#FFD700' }} />, label: 'Top Performer', bg: 'rgba(255,215,0,0.1)' },
    Silver: { icon: <MdStars style={{ color: '#C0C0C0' }} />, label: 'Exceeding SLA', bg: 'rgba(192,192,192,0.1)' },
    Bronze: { icon: <MdStars style={{ color: '#CD7F32' }} />, label: 'On Track', bg: 'rgba(205,127,50,0.1)' },
    Warning: { icon: <MdWarning style={{ color: '#EF4444' }} />, label: 'Probation', bg: 'rgba(239,68,68,0.1)' },
};

function HoursDisplay({ hours }) {
    if (hours < 0) return <span style={{ color: '#EF4444', fontWeight: 700, fontFamily: 'monospace' }}>+{Math.abs(hours)}h overdue</span>;
    if (hours < 12) return <span style={{ color: '#EF4444', fontWeight: 700, fontFamily: 'monospace' }}>{hours}h left</span>;
    if (hours < 48) return <span style={{ color: '#F59E0B', fontWeight: 700, fontFamily: 'monospace' }}>{hours}h left</span>;
    return <span style={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>{hours}h left</span>;
}

export default function SLATracker() {
    const [slaData, setSlaData] = useState([]);
    const [officerData, setOfficerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [s, o] = await Promise.all([apiGetSLAData(), apiGetOfficerLeaderboard()]);
                setSlaData(Array.isArray(s.data) ? s.data : []);
                setOfficerData(Array.isArray(o.data) ? o.data : []);
            } catch (err) {
                console.error("SLA Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const breached = slaData.filter(s => s.status === 'Breached').length;
    const dueToday = slaData.filter(s => s.status === 'Due Today').length;
    const atRisk = slaData.filter(s => s.status === 'At Risk').length;
    const onTrack = slaData.filter(s => s.status === 'On Track').length;

    const filtered = filterStatus === 'All' ? slaData : slaData.filter(s => s.status === filterStatus);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdTimer className="icon" style={{ color: '#F59E0B' }} /> SLA & Officer Accountability</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Live monitoring of officer response times. Badges are auto-assigned by AI based on composite performance scores.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
                {[
                    { label: 'SLA Breached', value: breached, color: '#EF4444', icon: '💔' },
                    { label: 'Due Today', value: dueToday, color: '#F59E0B', icon: '⚡' },
                    { label: 'At Risk', value: atRisk, color: '#F97316', icon: '⚠️' },
                    { label: 'On Track', value: onTrack, color: '#00C896', icon: '✅' },
                ].map(s => (
                    <div key={s.label} className="metric-card" style={{ '--accent-color': s.color, textAlign: 'center' }}>
                        <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
                {['All', 'Breached', 'Due Today', 'At Risk', 'On Track'].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)} style={{
                        padding: '7px 14px', borderRadius: 8, border: '1px solid',
                        borderColor: filterStatus === f ? 'var(--saffron)' : 'var(--border)',
                        background: filterStatus === f ? 'rgba(255,107,44,0.12)' : 'transparent',
                        color: filterStatus === f ? 'var(--saffron)' : 'var(--text-secondary)',
                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>{f}</button>
                ))}
            </div>

            {/* SLA Table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Active Grievance SLA Monitor</h3>
                </div>
                {loading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Querying Service Level Engine...</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Brief</th>
                                    <th>Region</th>
                                    <th>Officer</th>
                                    <th>Deadline</th>
                                    <th>Compliance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, i) => {
                                    const cfg = STATUS_CFG[item.status] || STATUS_CFG['On Track'];
                                    return (
                                        <tr key={item.id} style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{item.trackingId || item.id}</td>
                                            <td style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: 200 }}>{item.title}</td>
                                            <td style={{ fontSize: '0.78rem' }}>{item.state}</td>
                                            <td style={{ fontSize: '0.78rem', color: item.officer === 'Unassigned' ? '#EF4444' : 'var(--text-secondary)', fontWeight: item.officer === 'Unassigned' ? 700 : 400 }}>
                                                {item.officer || item.assignedTo}
                                            </td>
                                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(item.slaDeadline).toLocaleString()}</td>
                                            <td><HoursDisplay hours={item.hoursLeft} /></td>
                                            <td>
                                                <span style={{
                                                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                                                    padding: '4px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700,
                                                    display: 'inline-flex', alignItems: 'center', gap: 4
                                                }}>
                                                    {cfg.icon} {item.status}
                                                    {item.breachCount > 0 && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', padding: '1px 5px', borderRadius: 100, fontSize: '0.78rem', marginLeft: 2 }}>×{item.breachCount}</span>}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Officer Accountability Leaderboard */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
                    <MdPerson style={{ verticalAlign: 'middle', color: 'var(--saffron)', marginRight: 6 }} />
                    Officer Accountability Leaderboard (Live Rankings)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {officerData.map((o, i) => {
                        const badge = BADGE_CONFIG[o.badge] || BADGE_CONFIG.Bronze;
                        const rankColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)';
                        return (
                            <div key={o.id} className="glass-card" style={{ padding: '20px', position: 'relative', borderLeft: `4px solid ${rankColor}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: rankColor }}>#{i + 1}</div>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{o.name}</h4>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {o.id}</div>
                                        </div>
                                    </div>
                                    <div style={{ background: badge.bg, color: badge.icon.props.style.color, padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {badge.icon} {o.badge}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 8 }}>
                                    {[
                                        { label: 'Files', value: o.casesHandled || 0 },
                                        { label: 'On-Time', value: `${o.slaCompliance || 0}%` },
                                        { label: 'Breaches', value: o.breaches ?? 0 },
                                        { label: 'Speed', value: `${o.avgResolutionDays || 0}d` }
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>{s.label}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Composite Score</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: o.compositeScore >= 90 ? '#00C896' : o.compositeScore >= 75 ? '#F59E0B' : '#EF4444' }}>{o.compositeScore}/100</span>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                                        <div style={{ width: `${o.compositeScore}%`, height: '100%', background: `linear-gradient(90deg, ${rankColor}, #00C896)`, transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
