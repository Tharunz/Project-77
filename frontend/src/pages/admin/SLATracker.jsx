import React, { useState, useEffect } from 'react';
import { MdTimerOff, MdTimer, MdWarning, MdCheckCircle, MdPerson } from 'react-icons/md';
import { apiGetSLAData, apiGetOfficerSLA } from '../../services/api.service';

const STATUS_CFG = {
    'Breached': { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: <MdTimerOff /> },
    'Due Today': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: <MdWarning /> },
    'At Risk': { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', icon: <MdWarning /> },
    'On Track': { color: '#00C896', bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.2)', icon: <MdCheckCircle /> },
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
        Promise.all([apiGetSLAData(), apiGetOfficerSLA()]).then(([s, o]) => {
            setSlaData(s.data);
            setOfficerData(o.data);
            setLoading(false);
        });
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
                        Radical transparency — every officer's performance is tracked and publicly accountable. Breach SLA = auto-escalation.
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
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Grievance SLA Monitor</h3>
                </div>
                {loading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Grievance ID</th>
                                    <th>Title</th>
                                    <th>State</th>
                                    <th>Officer</th>
                                    <th>Priority</th>
                                    <th>SLA Deadline</th>
                                    <th>Time Left</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, i) => {
                                    const cfg = STATUS_CFG[item.status] || STATUS_CFG['On Track'];
                                    return (
                                        <tr key={item.id} style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{item.id}</td>
                                            <td style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: 200 }}>{item.title}</td>
                                            <td style={{ fontSize: '0.78rem' }}>{item.state}</td>
                                            <td style={{ fontSize: '0.78rem', color: item.assignedTo === 'Unassigned' ? '#EF4444' : 'var(--text-secondary)', fontWeight: item.assignedTo === 'Unassigned' ? 700 : 400 }}>
                                                {item.assignedTo}
                                            </td>
                                            <td><span className={`badge badge-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.slaDeadline}</td>
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
                    Officer Accountability Leaderboard
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {officerData.sort((a, b) => b.rating - a.rating).map((o, i) => (
                        <div key={o.officer} className="glass-card" style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: i === 0 ? 'linear-gradient(135deg, #F59E0B, #FF6B2C)' : 'rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: 800, color: i === 0 ? 'white' : 'var(--text-muted)'
                                    }}>#{i + 1}</div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{o.officer}</h4>
                                </div>
                                <div style={{
                                    fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 900,
                                    color: o.rating >= 90 ? '#00C896' : o.rating >= 75 ? '#F59E0B' : '#EF4444'
                                }}>{o.rating}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {[
                                    { label: 'Assigned', value: o.totalAssigned, color: '#3B82F6' },
                                    { label: 'On Time', value: o.onTime, color: '#00C896' },
                                    { label: 'Breaches', value: o.breaches, color: '#EF4444' },
                                    { label: 'Avg Days', value: `${o.avgResolutionDays}d`, color: '#F59E0B' },
                                ].map(stat => (
                                    <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Performance Score</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: o.rating >= 90 ? '#00C896' : o.rating >= 75 ? '#F59E0B' : '#EF4444' }}>{o.rating}/100</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.12)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ width: `${o.rating}%`, height: '100%', borderRadius: 3, background: o.rating >= 90 ? '#00C896' : o.rating >= 75 ? '#F59E0B' : '#EF4444' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
