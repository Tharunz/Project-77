import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdBarChart, MdTimeline, MdStars, MdArrowForward, MdTrendingUp, MdCheckCircle, MdSchool, MdEdit, MdPeople } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { apiGetCitizenScore, apiGetCitizenFootprint, apiGetCitizenPredictFuture } from '../../services/api.service';

const LEVEL_CONFIG = {
    'CI Champion': { color: '#FF6B2C', bg: 'rgba(255,107,44,0.12)', border: 'rgba(255,107,44,0.3)', icon: '🏆' },
    'Jan Shakti Champion': { color: '#FF6B2C', bg: 'rgba(255,107,44,0.12)', border: 'rgba(255,107,44,0.3)', icon: '🏆' }, // backward compat
    'Active Citizen': { color: '#00C896', bg: 'rgba(0,200,150,0.12)', border: 'rgba(0,200,150,0.3)', icon: '⭐' },
    'Aware Citizen': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', icon: '🎯' },
    'Beginner': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '🌱' },
};

const EVENT_ICONS = {
    account_created: '🎉',
    grievance_filed: '📋',
    grievance_resolved: '✅',
    scheme_matched: '🏛️',
    petition_signed: '✍️',
};

const CATEGORY_COLORS = {
    'Education': '#8B5CF6',
    'Healthcare': '#EF4444',
    'Business': '#3B82F6',
    'Housing': '#10B981',
    'Pension': '#F59E0B',
    'Employment': '#FF6B2C',
};

export default function EngagementDashboard() {
    const { user } = useAuth();
    const [score, setScore] = useState(null);
    const [footprint, setFootprint] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGetCitizenScore(),
            apiGetCitizenFootprint(),
            apiGetCitizenPredictFuture()
        ]).then(([s, f, p]) => {
            if (s.success && s.data) setScore(s.data);
            if (f.success && f.data) setFootprint(f.data);
            if (p.success && p.data) setPredictions(p.data);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)', gap: 12 }}>
            <div className="spinner" /> Loading your engagement data...
        </div>
    );

    const levelCfg = LEVEL_CONFIG[score?.level] || LEVEL_CONFIG['Beginner'];
    const ciScore = score?.ciScore || score?.janShaktiScore || 0;
    const scoreMax = (score?.level === 'CI Champion' || score?.level === 'Jan Shakti Champion') ? 300 : score?.level === 'Active Citizen' ? 200 : score?.level === 'Aware Citizen' ? 100 : 70;
    const scorePct = score ? Math.min((ciScore / scoreMax) * 100, 100) : 0;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Header */}
            <div>
                <h1 className="section-title"><MdBarChart className="icon" /> CI Score & Engagement</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    Your civic engagement profile, footprint, and AI-powered life trajectory
                </p>
            </div>

            {/* Jan Shakti Score Card */}
            {score && (
                <div className="glass-card" style={{
                    padding: 28,
                    background: `linear-gradient(135deg, ${levelCfg.bg} 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid ${levelCfg.border}`,
                    borderTop: `3px solid ${levelCfg.color}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <MdStars style={{ color: levelCfg.color, fontSize: '1.4rem' }} />
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CI Score — Civic Intelligence</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                                <span style={{ fontFamily: 'Space Grotesk', fontSize: '3.5rem', fontWeight: 900, color: levelCfg.color, lineHeight: 1 }}>
                                    {ciScore}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>/ {scoreMax} pts</span>
                            </div>
                            <div style={{ width: '100%', maxWidth: 360, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                                <div style={{ width: `${scorePct}%`, height: '100%', background: levelCfg.color, borderRadius: 4, transition: 'width 1s ease' }} />
                            </div>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: levelCfg.bg, border: `1px solid ${levelCfg.border}`,
                                color: levelCfg.color, padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700
                            }}>
                                {levelCfg.icon} {score.level}
                            </span>
                        </div>

                        {/* Score Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Breakdown</p>
                            {Object.entries(score.breakdown || {}).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: '0.83rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span style={{ fontWeight: 700, color: levelCfg.color }}>+{val} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Predict My Future */}
            {predictions && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <MdTrendingUp style={{ color: 'var(--saffron)', fontSize: '1.3rem' }} />
                        <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Predict My Future</h2>
                        <span className="badge badge-inprogress" style={{ fontSize: '0.72rem' }}>AI-Powered</span>
                    </div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                        {predictions.summary}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                        {(predictions.forecasts || []).map((f, i) => {
                            const catColor = CATEGORY_COLORS[f.category] || 'var(--saffron)';
                            return (
                                <div key={i} className="glass-card" style={{
                                    padding: 16,
                                    borderLeft: `3px solid ${catColor}`,
                                    background: `${catColor}08`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{f.timeframe}</span>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: catColor, background: `${catColor}18`, padding: '2px 8px', borderRadius: 10 }}>{f.category}</span>
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 8 }}>{f.prediction}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ width: f.confidence, height: '100%', background: catColor }} />
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: catColor, fontWeight: 700 }}>{f.confidence}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <Link to="/citizen/schemes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--saffron)', fontSize: '0.83rem', fontWeight: 700, textDecoration: 'none' }}>
                            Explore Relevant Schemes <MdArrowForward />
                        </Link>
                    </div>
                </div>
            )}

            {/* Seva Mirror — Civic Footprint */}
            {footprint && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <MdTimeline style={{ color: 'var(--teal)', fontSize: '1.3rem' }} />
                            <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Seva Mirror — Your Civic Footprint</h2>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {footprint.totalInteractions} interactions recorded
                        </span>
                    </div>

                    {footprint.timeline && footprint.timeline.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {footprint.timeline.slice(0, 8).map((event, i) => (
                                <div key={event.id} style={{ display: 'flex', gap: 14, paddingBottom: i < footprint.timeline.length - 1 ? 20 : 0, position: 'relative' }}>
                                    {i < footprint.timeline.slice(0, 8).length - 1 && (
                                        <div style={{ position: 'absolute', left: 17, top: 36, bottom: 0, width: 2, background: 'var(--border)' }} />
                                    )}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                                        background: 'rgba(0,200,150,0.1)', border: '2px solid rgba(0,200,150,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                                    }}>
                                        {EVENT_ICONS[event.type] || '📌'}
                                    </div>
                                    <div style={{ paddingTop: 4, flex: 1 }}>
                                        <p style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-white)', marginBottom: 2 }}>{event.title}</p>
                                        <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{event.description}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                            <MdTimeline style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: 8 }} />
                            <p style={{ fontSize: '0.85rem' }}>No civic activity recorded yet.</p>
                            <Link to="/citizen/file-grievance" style={{ color: 'var(--saffron)', fontSize: '0.83rem', marginTop: 8, display: 'inline-block' }}>
                                File your first grievance →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[
                    { to: '/citizen/file-grievance', icon: <MdEdit />, label: 'File Grievance', color: '#FF6B2C', desc: '+10 pts' },
                    { to: '/citizen/schemes', icon: <MdSchool />, label: 'Explore Schemes', color: '#00C896', desc: 'Earn eligibility' },
                    { to: '/citizen/community', icon: <MdPeople />, label: 'Join Community', color: '#8B5CF6', desc: '+5 pts/action' },
                    { to: '/citizen/roadmap', icon: <MdCheckCircle />, label: 'Benefit Roadmap', color: '#3B82F6', desc: 'Claim schemes' },
                ].map(a => (
                    <Link key={a.to} to={a.to} className="glass-card" style={{
                        padding: 16, display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none',
                        background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 'var(--radius)'
                    }}>
                        <span style={{ fontSize: '1.3rem', color: a.color }}>{a.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--text-white)' }}>{a.label}</span>
                        <span style={{ fontSize: '0.74rem', color: a.color, fontWeight: 600 }}>{a.desc}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
