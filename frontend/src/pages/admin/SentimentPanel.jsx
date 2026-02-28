import React, { useState, useEffect } from 'react';
import { MdPsychology, MdWarning, MdSentimentVeryDissatisfied, MdArrowUpward } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { apiGetCriticalGrievances, apiGetSentimentTrend } from '../../services/api.service';

function SentimentBadge({ score }) {
    if (score < 0.25) return <span className="badge badge-critical">🔴 Critical Distress</span>;
    if (score < 0.45) return <span className="badge badge-high">🟠 High Distress</span>;
    if (score < 0.65) return <span className="badge badge-medium">🟡 Moderate</span>;
    return <span className="badge badge-resolved">🟢 Low Distress</span>;
}

function SentimentMeter({ score }) {
    const pct = Math.round(score * 100);
    const color = score < 0.25 ? '#EF4444' : score < 0.45 ? '#F59E0B' : score < 0.65 ? '#F59E0B' : '#00C896';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Distress Level</span>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`,
                    background: `linear-gradient(90deg, #00C896, #F59E0B ${pct > 50 ? '40%' : '100%'}, #EF4444)`,
                    borderRadius: 4, transition: 'width 0.8s ease'
                }} />
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, fontSize: '0.78rem' }}>{label}</p>
                {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
            </div>
        );
    }
    return null;
};

export default function SentimentPanel() {
    const [critical, setCritical] = useState([]);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            const [c, t] = await Promise.all([apiGetCriticalGrievances(), apiGetSentimentTrend()]);
            setCritical(c.data);
            setTrend(t.data);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = filter === 'all' ? critical
        : filter === 'critical' ? critical.filter(g => g.sentimentScore < 0.25)
            : critical.filter(g => g.sentimentScore >= 0.25 && g.sentimentScore < 0.45);

    const criticalCount = critical.filter(g => g.sentimentScore < 0.25).length;
    const highCount = critical.filter(g => g.sentimentScore >= 0.25 && g.sentimentScore < 0.45).length;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdPsychology className="icon" /> Sentiment Intelligence Panel</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        AI-powered distress detection across all grievances
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {[
                    { label: 'Critical Distress', value: criticalCount, color: '#EF4444', icon: '🔴', desc: 'Immediate action needed' },
                    { label: 'High Distress', value: highCount, color: '#F59E0B', icon: '🟠', desc: 'Action within 24 hours' },
                    { label: 'Total Flagged', value: critical.length, color: '#8B5CF6', icon: '🤖', desc: 'AI detected' },
                    { label: 'Avg Distress Score', value: critical.length ? `${Math.round(critical.reduce((a, g) => a + (1 - g.sentimentScore), 0) / critical.length * 100)}%` : '0%', color: '#3B82F6', icon: '📊', desc: 'Platform average' },
                ].map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color }}>
                        <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{stat.icon}</div>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.desc}</div>
                    </div>
                ))}
            </div>

            {/* Trend Chart */}
            <div className="chart-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Distress Trend Over Time</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly distribution by distress level</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.10)" />
                        <XAxis dataKey="month" tick={{ fill: '#B8C5D6', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#B8C5D6', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#B8C5D6', fontSize: 12 }} />
                        <Bar dataKey="high" name="Critical" fill="#EF4444" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="medium" name="High" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="low" name="Moderate" fill="#00C896" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: `All Flagged (${critical.length})` },
                    { key: 'critical', label: `🔴 Critical (${criticalCount})` },
                    { key: 'high', label: `🟠 High Distress (${highCount})` },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                        padding: '8px 16px', borderRadius: 8, border: '1px solid',
                        borderColor: filter === tab.key ? 'var(--saffron)' : 'var(--border)',
                        background: filter === tab.key ? 'rgba(255,107,44,0.12)' : 'transparent',
                        color: filter === tab.key ? 'var(--saffron)' : 'var(--text-secondary)',
                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Grievance Cards */}
            {loading ? <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>Analyzing sentiment data...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map((g, i) => (
                        <div key={g.id} style={{
                            background: g.sentimentScore < 0.25 ? 'rgba(239,68,68,0.06)' : 'var(--bg-card)',
                            border: `1px solid ${g.sentimentScore < 0.25 ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius)', padding: '16px 20px',
                            animation: `fadeInUp 0.4s ease ${i * 0.04}s both`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{g.id}</span>
                                        <SentimentBadge score={g.sentimentScore} />
                                        <span className={`badge badge-${g.priority.toLowerCase()}`}>{g.priority} Priority</span>
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>
                                        {g.citizenName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— {g.state}</span>
                                    </p>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.description}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                        Filed: {g.createdAt} · Category: {g.category}
                                    </p>
                                </div>
                                <div style={{ width: 200, flexShrink: 0 }}>
                                    <SentimentMeter score={g.sentimentScore} />
                                    <button className="btn-primary" style={{ width: '100%', marginTop: 12, fontSize: '0.78rem', justifyContent: 'center' }}>
                                        Take Action
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
