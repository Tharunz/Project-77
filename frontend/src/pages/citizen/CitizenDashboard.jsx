import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdDashboard, MdSchool, MdEdit, MdTrackChanges, MdChat, MdArrowForward, MdCheckCircle, MdHourglassEmpty, MdWarning, MdTimeline, MdAnalytics, MdShield, MdMap, MdClose } from 'react-icons/md';
import { apiGetMyGrievances, apiGetMatchedSchemes, apiGetBenefitRoadmap, apiGetBenefitGap, apiGetPreSevaAlerts, apiGetHeatmapStateDetail } from '../../services/api.service';

const STATUS_ICONS = { Pending: <MdHourglassEmpty />, Resolved: <MdCheckCircle />, Critical: <MdWarning />, 'In Progress': <MdEdit /> };
const STATUS_COLORS = { Pending: '#F59E0B', Resolved: '#00C896', Critical: '#EF4444', 'In Progress': '#3B82F6' };

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [roadmap, setRoadmap] = useState(null);
    const [gap, setGap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [presevaAlert, setPresevaAlert] = useState(null);
    const [distressData, setDistressData] = useState(null);
    const [dismissedAlert, setDismissedAlert] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [g, s, r, gp] = await Promise.all([
                    apiGetMyGrievances(),
                    apiGetMatchedSchemes(),
                    apiGetBenefitRoadmap(),
                    apiGetBenefitGap()
                ]);
                setGrievances(g && Array.isArray(g.data) ? g.data : []);
                setSchemes(s && Array.isArray(s.data) ? s.data : []);
                setRoadmap(r && r.data ? r.data : null);
                setGap(gp && gp.data ? gp.data : null);
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }

            // Load PRESEVA predictions for user's state
            try {
                const alerts = await apiGetPreSevaAlerts();
                const userState = user?.state;
                if (alerts.success && Array.isArray(alerts.data)) {
                    const stateAlert = alerts.data.find(a => !a.prevented && a.urgency === 'critical' && (!userState || a.state === userState || userState === a.state));
                    if (stateAlert) setPresevaAlert(stateAlert);
                }
            } catch (_) {}

            // Load heatmap/distress data for user's state
            if (user?.state) {
                try {
                    const hd = await apiGetHeatmapStateDetail(user.state);
                    if (hd.success && hd.data) setDistressData(hd.data);
                } catch (_) {}
            }
        };
        load();
    }, [user?.id]);

    const quickActions = [
        { to: '/citizen/file-grievance', icon: <MdEdit />, label: 'File Grievance', color: '#FF6B2C', desc: 'Raise a new complaint' },
        { to: '/citizen/schemes', icon: <MdSchool />, label: 'Browse Schemes', color: '#00C896', desc: 'Discover benefits' },
        { to: '/citizen/track', icon: <MdTrackChanges />, label: 'Track Status', color: '#3B82F6', desc: 'Check your cases' },
        { to: '/citizen/chatbot', icon: <MdChat />, label: 'AI Assistant', color: '#8B5CF6', desc: 'Ask anything' },
    ];

    const stats = [
        { label: 'Total Filed', value: (grievances || []).length, color: '#3B82F6' },
        { label: 'Resolved', value: (grievances || []).filter(g => g.status === 'Resolved').length, color: '#00C896' },
        { label: 'Missed Benefits', value: gap ? gap.gapCount : 0, color: '#EF4444' },
        { label: 'Matched Schemes', value: gap ? gap.eligibleCount : (schemes || []).length, color: '#8B5CF6' },
    ];

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* PRESEVA Alert Banner */}
            {presevaAlert && !dismissedAlert && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <MdShield style={{ color: '#EF4444', fontSize: '1.2rem', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#EF4444' }}>⚡ PRESEVA Alert — </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{presevaAlert.title} predicted in <strong>{presevaAlert.daysUntil} days</strong> in <strong>{presevaAlert.district}, {presevaAlert.state}</strong>. Government has been notified.</span>
                    </div>
                    <button onClick={() => setDismissedAlert(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }}><MdClose /></button>
                </div>
            )}

            {/* Welcome */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,107,44,0.1) 0%, rgba(0,200,150,0.06) 100%)',
                border: '1px solid rgba(255,107,44,0.2)', borderRadius: 'var(--radius-lg)', padding: '24px 28px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--saffron), var(--teal))' }} />
                <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>
                    Namaste, <span style={{ color: 'var(--saffron)' }}>{user?.name?.split(' ')[0] || 'Citizen'}</span> 🙏
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Your personal dashboard — 2nd Gen AI features now fully integrated.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {user?.state && <span className="badge badge-inprogress">📍 {user.state}</span>}
                    {user?.age && <span className="badge badge-pending">🎂 Age {user.age}</span>}
                    {gap && <span className="badge badge-critical" style={{ background: 'rgba(239,68,68,0.15)', borderColor: '#EF4444' }}>⚠️ {gap.gapCount} Missed Benefits</span>}
                </div>
            </div>

            {/* Gap Analysis Card */}
            {gap && (
                <div className="glass-card" style={{ padding: '20px 24px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdAnalytics style={{ color: '#EF4444' }} /> Benefit Gap Analysis
                        </h2>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EF4444' }}>{gap.gapPercentage}% Gap</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 5, overflow: 'hidden', marginBottom: 14 }}>
                        <div style={{ width: `${100 - gap.gapPercentage}%`, height: '100%', background: '#00C896', transition: 'width 1s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        You are currently missing out on <strong style={{ color: '#EF4444' }}>{gap.gapCount}</strong> schemes you are eligible for. Your profile qualifies for {gap.eligibleCount} benefits, but only {gap.claimedCount} are registered.
                    </p>
                    <Link to="/citizen/schemes" className="btn-secondary" style={{ marginTop: 14, alignSelf: 'flex-start', color: '#EF4444', borderColor: '#EF4444' }}>
                        Resolve Benefit Gaps <MdArrowForward />
                    </Link>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                {stats.map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Area Distress Card */}
            {distressData && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.06) 100%)',
                    border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-lg)', padding: '20px 24px',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <MdMap style={{ color: '#8B5CF6', fontSize: '1.2rem' }} />
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Area Distress Intelligence — {user?.state || 'Your State'}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 6 }}>Local Service Distress Index</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {distressData.topCategory ? `Most common issue in your area: ` : 'Analyzing local service patterns...'}
                                {distressData.topCategory && <strong style={{ color: '#A78BFA' }}>{distressData.topCategory}</strong>}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Total Issues', value: distressData.count || distressData.totalGrievances || 0, color: '#8B5CF6' },
                                { label: 'Resolved', value: distressData.resolved || 0, color: '#00C896' },
                                { label: 'Distress Index', value: `${distressData.distressIndex || Math.round(((distressData.pending || 0) / Math.max((distressData.count || distressData.totalGrievances || 1), 1)) * 100)}%`, color: '#F59E0B' },
                            ].map(d => (
                                <div key={d.label} style={{ textAlign: 'center', minWidth: 70 }}>
                                    <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: d.color }}>{d.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 3, transition: 'width 1s ease',
                            width: `${distressData.resolutionRate || Math.round(((distressData.resolved || 0) / Math.max((distressData.count || distressData.totalGrievances || 1), 1)) * 100)}%`,
                            background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)'
                        }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        Resolution rate: <strong style={{ color: '#A78BFA' }}>{distressData.resolutionRate || Math.round(((distressData.resolved || 0) / Math.max((distressData.count || distressData.totalGrievances || 1), 1)) * 100)}%</strong> in {user?.state}
                    </p>
                </div>
            )}

            {/* Roadmap */}
            {roadmap && (
                <div>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdTimeline style={{ color: 'var(--saffron)' }} /> Your Personalized Benefit Roadmap
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {roadmap.phases.map((phase) => (
                            <div key={phase.phase} className="glass-card" style={{ padding: 20, borderTop: `4px solid ${phase.phase === 1 ? '#00C896' : phase.phase === 2 ? '#F59E0B' : '#3B82F6'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Phase {phase.phase}</span>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>{phase.count} items</span>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>{phase.label}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {phase.schemes.slice(0, 3).map(s => (
                                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <MdCheckCircle style={{ color: phase.phase === 1 ? '#00C896' : '#6B7280', flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/citizen/schemes" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--saffron)', textDecoration: 'none', fontWeight: 700 }}>
                                    View Phase Details <MdArrowForward />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h2 style={{ fontSize: '1.1rem', marginBottom: 14, fontWeight: 700 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                    {quickActions.map(action => (
                        <Link key={action.to} to={action.to} style={{
                            background: `${action.color}10`,
                            border: `1px solid ${action.color}30`,
                            borderRadius: 'var(--radius)', padding: '18px 20px',
                            display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none',
                            transition: 'var(--transition)'
                        }}
                            className="glass-card">
                            <span style={{ fontSize: '1.4rem', color: action.color }}>{action.icon}</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-white)' }}>{action.label}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{action.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* My Grievances */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Grievances</h2>
                    <Link to="/citizen/track" style={{ fontSize: '0.82rem', color: 'var(--saffron)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View All <MdArrowForward />
                    </Link>
                </div>
                {loading ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading intelligence data...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(grievances || []).slice(0, 4).map(g => (
                            <Link
                                key={g.id}
                                to={`/citizen/track?id=${g.id}`}
                                className="glass-card"
                                style={{
                                    padding: '14px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    flexWrap: 'wrap',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'var(--transition)',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ color: STATUS_COLORS[g.status] || '#F59E0B', fontSize: '1.2rem' }}>
                                    {STATUS_ICONS[g.status] || <MdHourglassEmpty />}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.title}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{g.id} · {g.createdAt}</p>
                                </div>
                                <span className={`badge badge-${g.status === 'Resolved' ? 'resolved' : g.status === 'Critical' ? 'critical' : g.status === 'In Progress' ? 'inprogress' : 'pending'}`}>
                                    {g.status}
                                </span>
                            </Link>
                        ))}
                        {(grievances || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No grievances filed yet. <Link to="/citizen/file-grievance" style={{ color: 'var(--saffron)' }}>File your first →</Link></p>}
                    </div>
                )}
            </div>
        </div>
    );
}
