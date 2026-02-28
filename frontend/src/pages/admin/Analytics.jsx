import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { MdAnalytics, MdDownload, MdTrendingUp } from 'react-icons/md';
import { apiGetStateAnalytics, apiGetMonthlyTrend, apiGetCategoryBreakdown, apiGetSentimentTrend } from '../../services/api.service';

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

export default function Analytics() {
    const [stateData, setStateData] = useState([]);
    const [trend, setTrend] = useState([]);
    const [catData, setCatData] = useState([]);
    const [sentTrend, setSentTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGetStateAnalytics(), apiGetMonthlyTrend(),
            apiGetCategoryBreakdown(), apiGetSentimentTrend()
        ]).then(([s, t, c, st]) => {
            setStateData(s.data);
            setTrend(t.data);
            setCatData(c.data);
            setSentTrend(st.data);
            setLoading(false);
        });
    }, []);

    const CAT_COLORS = ['#FF6B2C', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ marginRight: 12 }} />Generating analytics...
        </div>
    );

    const totalFiled = stateData.reduce((a, s) => a + s.filed, 0);
    const totalResolved = stateData.reduce((a, s) => a + s.resolved, 0);
    const avgResolutionRate = Math.round(stateData.reduce((a, s) => a + s.resolutionRate, 0) / stateData.length);
    const bestState = stateData.reduce((a, b) => b.resolutionRate > a.resolutionRate ? b : a, stateData[0]);
    const worstState = stateData.reduce((a, b) => b.resolutionRate < a.resolutionRate ? b : a, stateData[0]);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdAnalytics className="icon" /> Analytics & Reports</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Deep insights into grievance patterns across Bharat
                    </p>
                </div>
                <button className="btn-primary" style={{ fontSize: '0.82rem' }}><MdDownload /> Export Report</button>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {[
                    { label: 'Total Filed', value: totalFiled.toLocaleString(), color: '#3B82F6', desc: 'Across all tracked states' },
                    { label: 'Total Resolved', value: totalResolved.toLocaleString(), color: '#00C896', desc: 'Successfully addressed' },
                    { label: 'Avg Resolution Rate', value: `${avgResolutionRate}%`, color: '#FF6B2C', desc: 'Across all states' },
                    { label: 'Best Performer', value: bestState?.state?.split(' ')[0], color: '#10B981', desc: `${bestState?.resolutionRate}% resolution rate` },
                    { label: 'Needs Attention', value: worstState?.state?.split(' ')[0], color: '#EF4444', desc: `${worstState?.resolutionRate}% resolution rate` },
                ].map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, color: stat.color, marginBottom: 6 }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{stat.desc}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="responsive-grid-2">
                {/* Monthly Trend */}
                <div className="chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Grievance Filing vs Resolution Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gFiled" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00C896" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.10)" />
                            <XAxis dataKey="month" tick={{ fill: '#B8C5D6', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#B8C5D6', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#B8C5D6', fontSize: 12 }} />
                            <Area type="monotone" dataKey="filed" name="Filed" stroke="#3B82F6" strokeWidth={2} fill="url(#gFiled)" />
                            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#00C896" strokeWidth={2} fill="url(#gResolved)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Category-wise Volume</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={catData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                            <XAxis type="number" tick={{ fill: '#B8C5D6', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="category" tick={{ fill: '#B8C5D6', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Grievances" radius={[0, 4, 4, 0]}>
                                {catData.map((entry, index) => (
                                    <Cell key={index} fill={CAT_COLORS[index % CAT_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* State-wise Resolution Rate */}
            <div className="chart-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>State-wise Resolution Rate</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>% of grievances resolved</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[...stateData].sort((a, b) => b.resolutionRate - a.resolutionRate)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.10)" />
                        <XAxis dataKey="state" tick={{ fill: '#B8C5D6', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#B8C5D6', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="resolutionRate" name="Resolution Rate" radius={[4, 4, 0, 0]}>
                            {stateData.sort((a, b) => b.resolutionRate - a.resolutionRate).map((entry, index) => (
                                <Cell key={index} fill={entry.resolutionRate > 70 ? '#00C896' : entry.resolutionRate > 50 ? '#F59E0B' : '#EF4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Sentiment Trend */}
            <div className="chart-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Sentiment Distribution Over Time</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>High / Medium / Low distress grievances</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sentTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.10)" />
                        <XAxis dataKey="month" tick={{ fill: '#B8C5D6', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#B8C5D6', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#B8C5D6', fontSize: 12 }} />
                        <Bar dataKey="high" name="Critical" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="medium" name="High Distress" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="low" name="Moderate" stackId="a" fill="#00C896" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* State-wise table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>State Performance Table</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>State</th>
                                <th>Filed</th>
                                <th>Resolved</th>
                                <th>Pending</th>
                                <th>Resolution Rate</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...stateData].sort((a, b) => b.resolutionRate - a.resolutionRate).map((s, i) => (
                                <tr key={s.state}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{s.state}</td>
                                    <td style={{ color: '#3B82F6', fontWeight: 600 }}>{s.filed.toLocaleString()}</td>
                                    <td style={{ color: '#00C896', fontWeight: 600 }}>{s.resolved.toLocaleString()}</td>
                                    <td style={{ color: '#F59E0B', fontWeight: 600 }}>{(s.filed - s.resolved).toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, background: 'rgba(255, 255, 255, 0.12)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                                                <div style={{ width: `${s.resolutionRate}%`, height: '100%', background: s.resolutionRate > 70 ? '#00C896' : s.resolutionRate > 50 ? '#F59E0B' : '#EF4444', borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: 34, color: s.resolutionRate > 70 ? '#00C896' : s.resolutionRate > 50 ? '#F59E0B' : '#EF4444' }}>{s.resolutionRate}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${s.resolutionRate > 70 ? 'badge-resolved' : s.resolutionRate > 50 ? 'badge-medium' : 'badge-critical'}`}>
                                            {s.resolutionRate > 70 ? 'Good' : s.resolutionRate > 50 ? 'Average' : 'Needs Attention'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
