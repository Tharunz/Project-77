import React, { useState, useEffect } from 'react';
import { MdMap, MdPlace, MdWarning, MdCheckCircle, MdHourglassEmpty, MdClose } from 'react-icons/md';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { apiGetHeatmapData } from '../../services/api.service';

const GEO_URL = '/india_states.geojson';

function getHeatColor(count, maxCount) {
    if (!count || !maxCount) return 'rgba(255,255,255,0.04)';
    const ratio = count / maxCount;
    if (ratio > 0.8) return '#EF4444';
    if (ratio > 0.6) return '#F97316';
    if (ratio > 0.4) return '#F59E0B';
    if (ratio > 0.2) return '#3B82F6';
    return '#00C896';
}

function getHeatLabel(count, maxCount) {
    if (!count || !maxCount) return 'No Data';
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'CRITICAL';
    if (ratio > 0.6) return 'HIGH';
    if (ratio > 0.4) return 'MEDIUM';
    if (ratio > 0.2) return 'LOW';
    return 'SAFE';
}


const normalizeStateName = (name) => {
    if (!name) return '';
    const n = name.trim();
    if (n.includes('Jammu') || n === 'J&K') return 'Jammu & Kashmir';
    if (n.includes('Andaman')) return 'Andaman and Nicobar Islands';
    if (n.includes('Dadra') || n.includes('Daman')) return 'Dadra and Nagar Haveli and Daman and Diu';
    if (n === 'Uttaranchal') return 'Uttarakhand';
    if (n === 'Orissa') return 'Odisha';
    if (n === 'Pondicherry') return 'Puducherry';
    return n;
};

export default function IndiaHeatmap() {
    const [heatData, setHeatData] = useState({});
    const [loading, setLoading] = useState(true);
    const [hoveredState, setHoveredState] = useState(null);
    const [selectedState, setSelectedState] = useState(null);

    useEffect(() => {
        apiGetHeatmapData().then(res => {
            setHeatData(res.data || {});
            setLoading(false);
        });
    }, []);

    const maxCount = Math.max(...Object.values(heatData).map(d => d.count || 0), 1);
    const statesSorted = Object.entries(heatData).sort((a, b) => b[1].count - a[1].count);
    const top10 = statesSorted.slice(0, 10).map(([state, d]) => ({ state: state.split(' ').slice(0, 2).join(' '), count: d.count, color: getHeatColor(d.count, maxCount) }));

    const totalGrievances = Object.values(heatData).reduce((a, d) => a + (d.count || 0), 0);
    const totalResolved = Object.values(heatData).reduce((a, d) => a + (d.resolved || 0), 0);
    const totalPending = Object.values(heatData).reduce((a, d) => a + (d.pending || 0), 0);

    const selData = selectedState ? heatData[selectedState] : null;

    if (loading) return <div className="dash-loading"><div className="spinner" /><span>Loading heatmap data...</span></div>;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdMap className="icon" /> India Grievance Heatmap</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Real-time state-wise grievance distribution — click any state for details
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="responsive-grid-3">
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

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Grievance Intensity:</span>
                {[{ color: '#EF4444', label: 'Critical' }, { color: '#F97316', label: 'High' }, { color: '#F59E0B', label: 'Medium' }, { color: '#3B82F6', label: 'Low' }, { color: '#00C896', label: 'Safe' }].map(l => (
                    <div key={l.color} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color }} /> {l.label}
                    </div>
                ))}
            </div>

            {/* Main layout: Map + Side Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedState ? '1fr 320px' : '1fr', gap: 20, transition: 'all 0.3s' }}>
                {/* ComposableMap choropleth */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [82.5, 22.5], scale: 1100 }}
                        width={900} height={700}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) => geographies.map(geo => {
                                const rawName = geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.name || '';
                                const name = normalizeStateName(rawName);
                                const data = heatData[name] || {};
                                const color = getHeatColor(data.count, maxCount);
                                const isSelected = selectedState === name;
                                const isHovered = hoveredState === name;
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => setHoveredState(name)}
                                        onMouseLeave={() => setHoveredState(null)}
                                        onClick={() => setSelectedState(isSelected ? null : name)}
                                        style={{
                                            default: { fill: data.count ? color : 'rgba(255,255,255,0.06)', stroke: '#1a2540', strokeWidth: 0.8, outline: 'none', opacity: isSelected ? 1 : 0.85, cursor: 'pointer' },
                                            hover: { fill: data.count ? color : 'rgba(255,255,255,0.1)', stroke: '#ffffff', strokeWidth: 1.5, outline: 'none', opacity: 1, cursor: 'pointer' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                );
                            })}
                        </Geographies>
                    </ComposableMap>
                    {/* Hover tooltip */}
                    {hoveredState && heatData[hoveredState] && (
                        <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(5,11,24,0.95)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: '0.82rem', pointerEvents: 'none', backdropFilter: 'blur(8px)' }}>
                            <div style={{ fontWeight: 800, color: 'white', marginBottom: 4 }}>{hoveredState}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {heatData[hoveredState].count?.toLocaleString()} grievances
                                · <span style={{ color: '#00C896' }}>{heatData[hoveredState].resolved?.toLocaleString()} resolved</span>
                                · <span style={{ color: '#F59E0B' }}>{heatData[hoveredState].pending?.toLocaleString()} pending</span>
                            </div>
                            <div style={{ marginTop: 4, fontSize: '0.75rem', color: getHeatColor(heatData[hoveredState].count, maxCount), fontWeight: 700 }}>
                                {getHeatLabel(heatData[hoveredState].count, maxCount)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Click-to-detail side panel */}
                {selectedState && selData && (
                    <div style={{ background: 'var(--bg-card)', border: `1px solid ${getHeatColor(selData.count, maxCount)}40`, borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedState}</h3>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: getHeatColor(selData.count, maxCount), background: `${getHeatColor(selData.count, maxCount)}18`, padding: '2px 8px', borderRadius: 10 }}>{getHeatLabel(selData.count, maxCount)}</span>
                            </div>
                            <button onClick={() => setSelectedState(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {[{ l: 'Total', v: selData.count?.toLocaleString(), c: '#3B82F6' }, { l: 'Resolved', v: selData.resolved?.toLocaleString(), c: '#00C896' }, { l: 'Pending', v: selData.pending?.toLocaleString(), c: '#F59E0B' }, { l: 'Resolution', v: `${Math.round((selData.resolved || 0) / Math.max(selData.count || 1, 1) * 100)}%`, c: (selData.resolved || 0) / Math.max(selData.count || 1, 1) > 0.6 ? '#00C896' : '#EF4444' }].map(d => (
                                <div key={d.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 800, color: d.c }}>{d.v}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{d.l}</div>
                                </div>
                            ))}
                        </div>
                        {/* Resolution bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 5 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Resolution Rate</span>
                                <span style={{ fontWeight: 700, color: '#00C896' }}>{Math.round((selData.resolved || 0) / Math.max(selData.count || 1, 1) * 100)}%</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.round((selData.resolved || 0) / Math.max(selData.count || 1, 1) * 100)}%`, background: '#00C896', borderRadius: 4, transition: 'width 0.8s ease' }} />
                            </div>
                        </div>
                        {selData.topCategory && <div style={{ background: 'rgba(255,107,44,0.07)', border: '1px solid rgba(255,107,44,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Top Category: </span>
                            <strong style={{ color: 'var(--saffron)' }}>{selData.topCategory}</strong>
                        </div>}
                    </div>
                )}
            </div>

            {/* Top 10 bar chart */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Top 10 States by Grievances</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={top10} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="state" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }} />
                        <Bar dataKey="count" name="Grievances" radius={[4, 4, 0, 0]}>
                            {top10.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
