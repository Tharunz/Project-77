import React, { useState, useEffect } from 'react';
import { MdMap, MdPlace, MdWarning, MdCheckCircle, MdHourglassEmpty } from 'react-icons/md';
import { apiGetHeatmapData } from '../../services/api.service';

// SVG India map paths — simplified bounding box positions for each state
const STATE_POSITIONS = {
    'Uttar Pradesh': { x: 52, y: 32, w: 14, h: 10 },
    'Maharashtra': { x: 38, y: 52, w: 12, h: 12 },
    'Bihar': { x: 62, y: 30, w: 8, h: 8 },
    'West Bengal': { x: 68, y: 34, w: 7, h: 14 },
    'Madhya Pradesh': { x: 42, y: 40, w: 16, h: 10 },
    'Rajasthan': { x: 28, y: 28, w: 16, h: 16 },
    'Tamil Nadu': { x: 48, y: 72, w: 9, h: 12 },
    'Karnataka': { x: 42, y: 63, w: 10, h: 10 },
    'Gujarat': { x: 25, y: 42, w: 12, h: 12 },
    'Andhra Pradesh': { x: 50, y: 60, w: 10, h: 11 },
    'Odisha': { x: 62, y: 44, w: 9, h: 10 },
    'Telangana': { x: 50, y: 56, w: 8, h: 8 },
    'Jharkhand': { x: 63, y: 38, w: 7, h: 7 },
    'Assam': { x: 76, y: 28, w: 10, h: 6 },
    'Punjab': { x: 34, y: 18, w: 7, h: 6 },
    'Chhattisgarh': { x: 54, y: 44, w: 9, h: 11 },
    'Haryana': { x: 36, y: 22, w: 7, h: 6 },
    'Kerala': { x: 43, y: 74, w: 5, h: 12 },
    'Uttarakhand': { x: 44, y: 20, w: 8, h: 7 },
    'Himachal Pradesh': { x: 38, y: 14, w: 8, h: 7 },
    'Delhi': { x: 40, y: 25, w: 3, h: 3 },
    'Jammu & Kashmir': { x: 32, y: 6, w: 14, h: 10 },
};

function getHeatColor(count, maxCount) {
    const ratio = count / maxCount;
    if (ratio > 0.8) return '#EF4444';
    if (ratio > 0.6) return '#F59E0B';
    if (ratio > 0.4) return '#FF6B2C';
    if (ratio > 0.2) return '#3B82F6';
    return '#00C896';
}

function getHeatOpacity(count, maxCount) {
    return 0.3 + (count / maxCount) * 0.65;
}

export default function IndiaHeatmap() {
    const [heatData, setHeatData] = useState({});
    const [loading, setLoading] = useState(true);
    const [hoveredState, setHoveredState] = useState(null);
    const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
    const [selectedState, setSelectedState] = useState(null);

    useEffect(() => {
        apiGetHeatmapData().then(res => {
            setHeatData(res.data);
            setLoading(false);
        });
    }, []);

    const maxCount = Math.max(...Object.values(heatData).map(d => d.count || 0), 1);

    const statesSorted = Object.entries(heatData)
        .sort((a, b) => b[1].count - a[1].count);

    const totalGrievances = Object.values(heatData).reduce((a, d) => a + d.count, 0);
    const totalResolved = Object.values(heatData).reduce((a, d) => a + d.resolved, 0);
    const totalPending = Object.values(heatData).reduce((a, d) => a + d.pending, 0);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdMap className="icon" /> India Grievance Heatmap</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        State-wise grievance distribution across Bharat
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                    { label: 'Total Grievances', value: totalGrievances.toLocaleString(), color: '#3B82F6', icon: <MdPlace /> },
                    { label: 'Resolved', value: totalResolved.toLocaleString(), color: '#00C896', icon: <MdCheckCircle /> },
                    { label: 'Pending', value: totalPending.toLocaleString(), color: '#F59E0B', icon: <MdHourglassEmpty /> },
                ].map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color }}>
                        <div style={{ color: stat.color, fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Map Visualization */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 24,
                    position: 'relative', minHeight: 480
                }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>State-wise Heatmap</h3>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[
                            { color: '#EF4444', label: 'Very High (>80%)' },
                            { color: '#F59E0B', label: 'High (60-80%)' },
                            { color: '#FF6B2C', label: 'Medium (40-60%)' },
                            { color: '#3B82F6', label: 'Low (20-40%)' },
                            { color: '#00C896', label: 'Very Low (<20%)' },
                        ].map(l => (
                            <div key={l.color} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, opacity: 0.8 }} />
                                {l.label}
                            </div>
                        ))}
                    </div>

                    {/* Grid-based map */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: 3,
                        padding: '0 16px'
                    }}>
                        {loading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                                Loading heatmap data...
                            </div>
                        ) : (
                            statesSorted.map(([state, data]) => {
                                const color = getHeatColor(data.count, maxCount);
                                const opacity = getHeatOpacity(data.count, maxCount);
                                const isSelected = selectedState === state;
                                const abbrevs = {
                                    'Uttar Pradesh': 'UP', 'Maharashtra': 'MH', 'Bihar': 'BR',
                                    'West Bengal': 'WB', 'Madhya Pradesh': 'MP', 'Rajasthan': 'RJ',
                                    'Tamil Nadu': 'TN', 'Karnataka': 'KA', 'Gujarat': 'GJ',
                                    'Andhra Pradesh': 'AP', 'Odisha': 'OD', 'Telangana': 'TS',
                                    'Jharkhand': 'JH', 'Assam': 'AS', 'Punjab': 'PB',
                                    'Chhattisgarh': 'CG', 'Haryana': 'HR', 'Kerala': 'KL',
                                    'Uttarakhand': 'UK', 'Himachal Pradesh': 'HP', 'Delhi': 'DL',
                                    'Jammu & Kashmir': 'JK', 'Ladakh': 'LA', 'Chandigarh': 'CH',
                                };

                                return (
                                    <div
                                        key={state}
                                        title={`${state}: ${data.count} grievances, ${data.resolved} resolved, ${data.pending} pending`}
                                        onClick={() => setSelectedState(isSelected ? null : state)}
                                        style={{
                                            background: color,
                                            opacity: isSelected ? 1 : opacity,
                                            borderRadius: 6,
                                            padding: '10px 4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 2,
                                            border: isSelected ? `2px solid white` : '2px solid transparent',
                                            transition: 'all 0.2s',
                                            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                        }}
                                    >
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                                            {abbrevs[state] || state.substring(0, 2).toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                                            {data.count > 1000 ? `${(data.count / 1000).toFixed(1)}K` : data.count}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Selected state detail */}
                    {selectedState && heatData[selectedState] && (
                        <div style={{
                            position: 'absolute', bottom: 16, left: 16, right: 16,
                            background: 'rgba(10,22,40,0.95)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '14px 18px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: 4 }}>{selectedState}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click state to deselect</p>
                            </div>
                            <div style={{ display: 'flex', gap: 20 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 800, color: '#3B82F6', fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>
                                        {heatData[selectedState].count.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 800, color: '#00C896', fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>
                                        {heatData[selectedState].resolved.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Resolved</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 800, color: '#F59E0B', fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>
                                        {heatData[selectedState].pending.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 800, color: heatData[selectedState].resolved / heatData[selectedState].count > 0.6 ? '#00C896' : '#EF4444', fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>
                                        {Math.round(heatData[selectedState].resolved / heatData[selectedState].count * 100)}%</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Resolution</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* State Rankings List */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 20, overflowY: 'auto', maxHeight: 580
                }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>State Rankings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {statesSorted.map(([state, data], i) => {
                            const resRate = Math.round(data.resolved / data.count * 100);
                            const color = getHeatColor(data.count, maxCount);
                            return (
                                <div
                                    key={state}
                                    onClick={() => setSelectedState(selectedState === state ? null : state)}
                                    style={{
                                        background: selectedState === state ? 'rgba(255,107,44,0.08)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${selectedState === state ? 'rgba(255,107,44,0.3)' : 'rgba(255, 255, 255, 0.12)'}`,
                                        borderRadius: 8, padding: '10px 12px', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{
                                            background: color, color: 'white', borderRadius: 4, padding: '2px 6px',
                                            fontSize: '0.78rem', fontWeight: 800, minWidth: 22, textAlign: 'center'
                                        }}>{i + 1}</span>
                                        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{state}</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{data.count.toLocaleString()}</span>
                                    </div>
                                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ flex: 1, height: 4, background: 'rgba(255, 255, 255, 0.12)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ width: `${resRate}%`, height: '100%', background: resRate > 60 ? '#00C896' : resRate > 40 ? '#F59E0B' : '#EF4444', borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: '0.78rem', color: resRate > 60 ? '#00C896' : resRate > 40 ? '#F59E0B' : '#EF4444', fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{resRate}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
