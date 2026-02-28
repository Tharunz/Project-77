import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdTrendingDown, MdRemove, MdWarning } from 'react-icons/md';
import { apiGetDistressIndex } from '../../services/api.service';

const SCORE_BAND = (score) => {
    if (score >= 80) return { label: 'Crisis', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' };
    if (score >= 60) return { label: 'High', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
    if (score >= 40) return { label: 'Moderate', color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' };
    return { label: 'Low', color: '#00C896', bg: 'rgba(0,200,150,0.10)' };
};

export default function DistressIndex() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGetDistressIndex().then(res => { setData(res.data); setLoading(false); });
    }, []);

    const nationalScore = data.length ? Math.round(data.reduce((a, s) => a + s.score, 0) / data.length) : 0;
    const band = SCORE_BAND(nationalScore);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdWarning className="icon" style={{ color: '#F59E0B' }} /> Bharat AI Distress Index</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Real-time AI-computed citizen suffering score — like a stock index, but for governance accountability
                    </p>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C896', display: 'inline-block', boxShadow: '0 0 6px #00C896' }} />
                    Live · Updated every 15 min
                </div>
            </div>

            {/* National Score Hero */}
            {!loading && (
                <div style={{
                    background: `linear-gradient(135deg, ${band.bg}, rgba(255,255,255,0.02))`,
                    border: `1px solid ${band.color}30`, borderRadius: 'var(--radius-xl)', padding: '32px 40px',
                    display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap'
                }}>
                    <div style={{ textAlign: 'center', minWidth: 140 }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '4rem', fontWeight: 900, color: band.color, lineHeight: 1 }}>{nationalScore}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>National Score /100</div>
                        <span style={{ display: 'inline-block', marginTop: 8, background: band.bg, color: band.color, border: `1px solid ${band.color}40`, padding: '4px 14px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 800 }}>
                            {band.label} Distress
                        </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 260 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--text-white)' }}>What this means</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            The Bharat AI Distress Index aggregates sentiment scores, critical grievance density, resolution failures,
                            and escalation rates across all 28 states. A score below 30 means excellent governance.
                            Above 80 signals a crisis requiring immediate central intervention.
                        </p>
                        <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
                            {[
                                { range: '0–30', label: 'Excellent', color: '#00C896' },
                                { range: '31–59', label: 'Moderate', color: '#3B82F6' },
                                { range: '60–79', label: 'High', color: '#F59E0B' },
                                { range: '80–100', label: 'Crisis', color: '#EF4444' },
                            ].map(b => (
                                <div key={b.range} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.range}: {b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* State Rankings */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>State-wise Distress Rankings</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Higher score = more citizen suffering</span>
                </div>
                {loading ? <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Computing distress scores...</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>State</th>
                                    <th>Distress Score</th>
                                    <th>Distress Level</th>
                                    <th>Trend (7d)</th>
                                    <th>Critical Cases</th>
                                    <th>Top Issue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((s, i) => {
                                    const b = SCORE_BAND(s.score);
                                    return (
                                        <tr key={s.state} style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}>
                                            <td>
                                                <span style={{
                                                    fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '0.9rem',
                                                    color: s.rank <= 3 ? '#EF4444' : 'var(--text-muted)'
                                                }}>#{s.rank}</span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{s.state}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 80, height: 8, background: 'rgba(255, 255, 255, 0.12)', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div style={{ width: `${s.score}%`, height: '100%', background: b.color, borderRadius: 4, transition: 'width 1s ease' }} />
                                                    </div>
                                                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, color: b.color, fontSize: '0.95rem', minWidth: 28 }}>{s.score}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ background: b.bg, color: b.color, border: `1px solid ${b.color}30`, padding: '3px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700 }}>
                                                    {b.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 700,
                                                    color: s.trend === 'up' ? '#EF4444' : s.trend === 'down' ? '#00C896' : '#B8C5D6'
                                                }}>
                                                    {s.trend === 'up' ? <MdTrendingUp /> : s.trend === 'down' ? <MdTrendingDown /> : <MdRemove />}
                                                    {s.delta}
                                                </span>
                                            </td>
                                            <td style={{ color: '#EF4444', fontWeight: 700 }}>{s.criticalGrievances}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.topCategory}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
