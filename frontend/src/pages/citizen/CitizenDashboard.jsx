import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MdDashboard, MdSchool, MdEdit, MdTrackChanges, MdChat, MdArrowForward, MdCheckCircle, MdHourglassEmpty, MdWarning, MdTimeline, MdAnalytics, MdShield, MdMap, MdClose, MdBookmark, MdStar } from 'react-icons/md';
import { apiGetMyGrievances, apiGetMatchedSchemes, apiGetBenefitRoadmap, apiGetBenefitGap, apiGetPreSevaAlerts, apiGetHeatmapStateDetail, apiGetMySchemeApplications, apiGetBookmarkedSchemes, apiFetch } from '../../services/api.service';

const STATUS_ICONS = { Pending: <MdHourglassEmpty />, Resolved: <MdCheckCircle />, Critical: <MdWarning />, 'In Progress': <MdEdit /> };
const STATUS_COLORS = { Pending: '#F59E0B', Resolved: '#00C896', Critical: '#EF4444', 'In Progress': '#3B82F6' };

export default function CitizenDashboard() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [grievances, setGrievances] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [roadmap, setRoadmap] = useState(null);
    const [gap, setGap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [presevaAlert, setPresevaAlert] = useState(null);
    const [distressData, setDistressData] = useState(null);
    const [dismissedAlert, setDismissedAlert] = useState(false);
    const [schemeApplications, setSchemeApplications] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [ciScore, setCiScore] = useState(null);
    const [ciLevel, setCiLevel] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Load applications first so we can pass applied schemeIds to benefit gap
                const [g, s, r, sa, bk] = await Promise.all([
                    apiGetMyGrievances(),
                    apiGetMatchedSchemes(),
                    apiGetBenefitRoadmap(),
                    apiGetMySchemeApplications(),
                    apiGetBookmarkedSchemes()
                ]);
                setGrievances(g && Array.isArray(g.data) ? g.data : []);
                setSchemes(s && Array.isArray(s.data) ? s.data : []);
                setRoadmap(r && r.data ? r.data : null);
                const appliedApps = (sa.success && Array.isArray(sa.data)) ? sa.data : [];
                setSchemeApplications(appliedApps);
                if (bk.success && Array.isArray(bk.data)) setBookmarks(bk.data);

                // Fetch CI Score from dedicated endpoint
                try {
                    const scoreRes = await apiFetch('/citizen/score');
                    if (scoreRes.success && scoreRes.data) {
                        setCiScore(scoreRes.data.ciScore || scoreRes.data.janShaktiScore || scoreRes.data.score);
                        setCiLevel(scoreRes.data.level);
                    }
                } catch (_) { }

                // Pass applied schemeIds so benefit gap reflects real claimed count
                const claimedIds = appliedApps.map(a => a.schemeId).filter(Boolean);
                const gp = await apiGetBenefitGap(claimedIds);
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
            } catch (_) { }

            // Load heatmap/distress data for user's state
            if (user?.state) {
                try {
                    const hd = await apiGetHeatmapStateDetail(user.state);
                    if (hd.success && hd.data) setDistressData(hd.data);
                } catch (_) { }
            }
        };
        load();
    }, [user?.id]);

    const quickActions = [
        { to: '/citizen/file-grievance', icon: <MdEdit />, label: t('fileGrievance'), color: '#FF6B2C', desc: 'Raise a new complaint' },
        { to: '/citizen/schemes', icon: <MdSchool />, label: t('schemes'), color: '#00C896', desc: 'Discover benefits' },
        { to: '/citizen/track', icon: <MdTrackChanges />, label: t('trackGrievance'), color: '#3B82F6', desc: 'Check your cases' },
        { to: '/citizen/chatbot', icon: <MdChat />, label: t('aiAssistant'), color: '#8B5CF6', desc: 'Ask anything' },
    ];

    const stats = [
        { label: t('totalFiled'), value: (grievances || []).length, color: '#3B82F6' },
        { label: t('resolved'), value: (grievances || []).filter(g => g.status === 'Resolved').length, color: '#00C896' },
        { label: 'Missed Benefits', value: gap ? gap.gapCount : 0, color: '#EF4444' },
        { label: t('matchedSchemes'), value: gap ? gap.eligibleCount : (schemes || []).length, color: '#8B5CF6' },
    ];

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* PRESEVA Alert Banner — Prominent */}
            {presevaAlert && !dismissedAlert && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.05) 100%)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderLeft: '4px solid #EF4444',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(239,68,68,0.12)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #EF4444, #F97316, transparent)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <MdShield style={{ color: '#EF4444', fontSize: '1.6rem' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 10px #EF4444', animation: 'pulse 1.2s ease-in-out infinite' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: '#F87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚡ PRESEVA Predictive Alert — {presevaAlert.urgency?.toUpperCase() || 'CRITICAL'}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 3 }}>{presevaAlert.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Predicted in <strong style={{ color: '#FCA5A5' }}>{presevaAlert.daysUntil} days</strong> in {presevaAlert.district}, {presevaAlert.state}. <span style={{ color: '#00C896' }}>Government departments have been automatically alerted.</span></div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 900, color: '#EF4444' }}>{presevaAlert.probability}%</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Probability</div>
                    </div>
                    <button onClick={() => setDismissedAlert(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0, alignSelf: 'flex-start' }}><MdClose /></button>
                </div>
            )}

            {/* Welcome */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,107,44,0.1) 0%, rgba(0,200,150,0.06) 100%)',
                border: '1px solid rgba(255,107,44,0.2)', borderRadius: 'var(--radius-lg)', padding: '24px 28px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--saffron), var(--teal))' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>
                            Namaste, <span style={{ color: 'var(--saffron)' }}>{user?.name?.split(' ')[0] || 'Citizen'}</span> 🙏
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Your personal PRESEVA-aware governance dashboard — AI features active.
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {user?.state && <span className="badge badge-inprogress">📍 {user.state}</span>}
                            {user?.age && <span className="badge badge-pending">🎂 Age {user.age}</span>}
                            {gap && <span className="badge badge-critical" style={{ background: 'rgba(239,68,68,0.15)', borderColor: '#EF4444' }}>⚠️ {gap.gapCount} Missed Benefits</span>}
                            {distressData && <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 100, padding: '2px 8px' }}>📊 Area Distress: {distressData.distressIndex || Math.round(((distressData.pending || 0) / Math.max((distressData.count || distressData.totalGrievances || 1), 1)) * 100)}%</span>}
                        </div>
                    </div>
                    {/* CI Score badge */}
                    <Link to="/citizen/engagement" style={{ textDecoration: 'none', flexShrink: 0 }}>
                        <div style={{ background: ciScore >= 60 ? 'rgba(0,200,150,0.1)' : 'rgba(255,107,44,0.08)', border: `1px solid ${ciScore >= 60 ? 'rgba(0,200,150,0.35)' : 'rgba(255,107,44,0.25)'}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 90, transition: 'transform 0.2s', cursor: 'pointer', position: 'relative' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            <MdStar style={{ color: ciScore >= 60 ? '#00C896' : '#FF6B2C', fontSize: '1.3rem' }} />
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 900, color: ciScore >= 60 ? '#00C896' : '#FF6B2C', lineHeight: 1, marginTop: 4 }}>
                                {ciScore !== null ? ciScore : (user?.ciScore || user?.janShaktiScore || '...')}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: ciScore >= 60 ? 'var(--teal)' : 'var(--saffron)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>CI Score</div>
                            {ciLevel && <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: 1 }}>{ciLevel}</div>}
                        </div>
                    </Link>
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
                        {t('resolveGaps')} <MdArrowForward />
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
                <h2 style={{ fontSize: '1.1rem', marginBottom: 14, fontWeight: 700 }}>{t('quickActions')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                    {quickActions.map(action => (
                        <Link key={action.to} to={action.to} style={{
                            background: `${action.color}08`,
                            border: `1px solid ${action.color}25`,
                            borderRadius: 'var(--radius-lg)', padding: '22px 20px',
                            display: 'flex', flexDirection: 'column', gap: 10, textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            position: 'relative', overflow: 'hidden'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${action.color}20`; e.currentTarget.style.borderColor = `${action.color}50`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${action.color}25`; }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${action.color}, transparent)` }} />
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${action.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: action.color }}>{action.icon}</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-white)', marginBottom: 3 }}>{action.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{action.desc}</div>
                            </div>
                            <MdArrowForward style={{ color: action.color, fontSize: '1rem', alignSelf: 'flex-end', opacity: 0.7 }} />
                        </Link>
                    ))}
                </div>
            </div>

            {/* My Applied Schemes (F11) */}
            {schemeApplications.length > 0 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><MdSchool style={{ color: '#00C896' }} /> My Scheme Applications</h2>
                        <Link to="/citizen/schemes" style={{ fontSize: '0.82rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 4 }}>Explore More <MdArrowForward /></Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {schemeApplications.map(app => {
                            const statusColor = app.status === 'Approved' ? '#00C896' : app.status === 'Rejected' ? '#EF4444' : app.status === 'Under Review' ? '#3B82F6' : '#F59E0B';
                            return (
                                <div key={app.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, flexShrink: 0, boxShadow: `0 0 8px ${statusColor}` }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{app.schemeName}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.category} · Applied {app.appliedOn} · <span style={{ color: 'var(--teal)' }}>{app.benefit}</span></p>
                                    </div>
                                    <span style={{ padding: '4px 10px', borderRadius: 20, background: `${statusColor}18`, border: `1px solid ${statusColor}50`, color: statusColor, fontSize: '0.75rem', fontWeight: 700 }}>{app.status}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* State Intelligence Mini-Card (F12) */}
            {user?.state && (
                <div style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.06), rgba(92,142,255,0.05))', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #00E5A0, #5C8EFF)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🗺️ State Intelligence — {user.state}</div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>PRESEVA Active Predictions</h3>
                        </div>
                        <Link to="/citizen/file-grievance" className="btn-secondary" style={{ fontSize: '0.78rem' }}>+ Raise Grievance</Link>
                    </div>
                    {presevaAlert ? (
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>⚡</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#EF4444', marginBottom: 4 }}>{presevaAlert.title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Predicted in <strong>{presevaAlert.state}</strong> within <strong>{presevaAlert.daysUntil} days</strong> · {presevaAlert.confidence}% confidence</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 12 }}>
                            {[{ label: 'Active Alerts', val: '3', color: '#EF4444' }, { label: 'Prevented', val: '12', color: '#00C896' }, { label: 'Under Watch', val: '7', color: '#F59E0B' }].map(d => (
                                <div key={d.label} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: d.color }}>{d.val}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{d.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bookmark Hub (F13) */}
            {bookmarks.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><MdBookmark style={{ color: '#8B5CF6' }} /> Saved Items</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {bookmarks.slice(0, 6).map(s => (
                            <div key={s.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color || '#8B5CF6', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.category}</p>
                                </div>
                                <MdBookmark style={{ color: '#8B5CF6', flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                    {bookmarks.length > 6 && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>+{bookmarks.length - 6} more saved — <Link to="/citizen/profile" style={{ color: '#8B5CF6' }}>View All</Link></p>}
                </div>
            )}

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
