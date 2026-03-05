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


const STATE_NORMALIZE_MAP = {
    'jammu and kashmir': 'Jammu & Kashmir',
    'jammu & kashmir': 'Jammu & Kashmir',
    'j&k': 'Jammu & Kashmir',
    'j & k': 'Jammu & Kashmir',
    'andaman and nicobar': 'Andaman and Nicobar Islands',
    'andaman & nicobar': 'Andaman and Nicobar Islands',
    'andaman & nicobar islands': 'Andaman and Nicobar Islands',
    'andaman nicobar': 'Andaman and Nicobar Islands',
    'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'dadra & nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'dadra nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'uttaranchal': 'Uttarakhand',
    'orissa': 'Odisha',
    'pondicherry': 'Puducherry',
    'puducherry': 'Puducherry',
    'chattisgarh': 'Chhattisgarh',
    'chhattisgarh': 'Chhattisgarh',
    'lakshadweep': 'Lakshadweep',
    'delhi': 'Delhi',
    'nct of delhi': 'Delhi',
    'national capital territory of delhi': 'Delhi',
    'arunachal pradesh': 'Arunachal Pradesh',
    'assam': 'Assam',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram',
    'nagaland': 'Nagaland',
    'sikkim': 'Sikkim',
    'tripura': 'Tripura',
    'west bengal': 'West Bengal',
    'bihar': 'Bihar',
    'jharkhand': 'Jharkhand',
    'odisha': 'Odisha',
    'telangana': 'Telangana',
    'andhra pradesh': 'Andhra Pradesh',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'tamil nadu': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'goa': 'Goa',
    'maharashtra': 'Maharashtra',
    'gujarat': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'madhya pradesh': 'Madhya Pradesh',
    'uttar pradesh': 'Uttar Pradesh',
    'uttarakhand': 'Uttarakhand',
    'himachal pradesh': 'Himachal Pradesh',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'chandigarh': 'Chandigarh',
    'ladakh': 'Ladakh',
};

const normalizeStateName = (name) => {
    if (!name) return '';
    const n = name.trim();
    const key = n.toLowerCase();
    return STATE_NORMALIZE_MAP[key] || n;
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

            {/* Compact stats bar */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total', value: totalGrievances.toLocaleString(), color: '#3B82F6', icon: <MdPlace /> },
                    { label: 'Resolved', value: totalResolved.toLocaleString(), color: '#00C896', icon: <MdCheckCircle /> },
                    { label: 'Pending', value: totalPending.toLocaleString(), color: '#F59E0B', icon: <MdHourglassEmpty /> },
                    { label: 'Resolution %', value: `${totalGrievances ? Math.round((totalResolved / totalGrievances) * 100) : 0}%`, color: '#00C896', icon: <MdCheckCircle /> },
                ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', flex: '1 1 120px' }}>
                        <span style={{ color: s.color, fontSize: '1.1rem' }}>{s.icon}</span>
                        <div>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Intensity:</span>
                {[{ color: '#EF4444', label: 'Critical' }, { color: '#F97316', label: 'High' }, { color: '#F59E0B', label: 'Medium' }, { color: '#3B82F6', label: 'Low' }, { color: '#00C896', label: 'Safe' }].map(l => (
                    <div key={l.color} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} /> {l.label}
                    </div>
                ))}
            </div>

            {/* Two-column: Map + Right Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
                {/* Map */}
                <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [82.5, 23], scale: 820 }}
                        width={700} height={520}
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 480 }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) => geographies.map(geo => {
                                const rawName = geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.name || '';
                                const name = normalizeStateName(rawName);
                                const data = heatData[name] || {};
                                const color = getHeatColor(data.count, maxCount);
                                const isSelected = selectedState === name;
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => setHoveredState(name)}
                                        onMouseLeave={() => setHoveredState(null)}
                                        onClick={() => setSelectedState(isSelected ? null : name)}
                                        style={{
                                            default: { fill: data.count ? color : 'rgba(255,255,255,0.07)', stroke: '#1a2540', strokeWidth: 0.7, outline: 'none', opacity: isSelected ? 1 : 0.88, cursor: 'pointer', filter: isSelected ? 'brightness(1.2)' : 'none' },
                                            hover: { fill: data.count ? color : 'rgba(255,255,255,0.12)', stroke: '#fff', strokeWidth: 1.2, outline: 'none', opacity: 1, cursor: 'pointer' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                );
                            })}
                        </Geographies>
                    </ComposableMap>
                    {hoveredState && heatData[hoveredState] && (
                        <div style={{ position: 'absolute', bottom: 12, left: 12, background: '#0d1b2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 14px', fontSize: '0.78rem', pointerEvents: 'none' }}>
                            <strong style={{ color: 'white' }}>{hoveredState}</strong>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{heatData[hoveredState].count?.toLocaleString()} total · <span style={{ color: '#00C896' }}>{heatData[hoveredState].resolved?.toLocaleString()} resolved</span></div>
                            <div style={{ color: getHeatColor(heatData[hoveredState].count, maxCount), fontWeight: 700, fontSize: '0.72rem', marginTop: 2 }}>{getHeatLabel(heatData[hoveredState].count, maxCount)}</div>
                        </div>
                    )}
                </div>

                {/* Right panel: rankings + state detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* State detail card (when selected) */}
                    {selectedState && !selData && (
                        <div style={{ background: '#0a1628', border: '2px solid rgba(100,116,139,0.3)', borderRadius: 12, padding: 16, animation: 'fadeInUp 0.25s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{selectedState}</h3>
                                <button onClick={() => setSelectedState(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}><MdClose /></button>
                            </div>
                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
                                No grievance data available for this state yet.
                            </div>
                        </div>
                    )}
                    {selectedState && selData ? (
                        <div style={{ background: '#0a1628', border: `2px solid ${getHeatColor(selData.count, maxCount)}50`, borderRadius: 12, padding: 16, animation: 'fadeInUp 0.25s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{selectedState}</h3>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: getHeatColor(selData.count, maxCount) }}>{getHeatLabel(selData.count, maxCount)}</span>
                                </div>
                                <button onClick={() => setSelectedState(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: 2 }}><MdClose /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                {[{ l: 'Total', v: selData.count?.toLocaleString(), c: '#3B82F6' }, { l: 'Resolved', v: selData.resolved?.toLocaleString(), c: '#00C896' }, { l: 'Pending', v: selData.pending?.toLocaleString(), c: '#F59E0B' }, { l: 'Rate', v: `${Math.round((selData.resolved || 0) / Math.max(selData.count || 1, 1) * 100)}%`, c: '#00C896' }].map(d => (
                                    <div key={d.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 800, color: d.c }}>{d.v}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.l}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.round((selData.resolved || 0) / Math.max(selData.count || 1, 1) * 100)}%`, background: 'linear-gradient(90deg,#00C896,#3B82F6)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                            </div>
                            {selData.topCategory && <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--saffron)' }}>Top issue: <strong>{selData.topCategory}</strong></div>}
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            Click any state on the map to view details
                        </div>
                    )}

                    {/* Top states ranked list */}
                    <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top States by Volume</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {statesSorted.slice(0, 8).map(([state, d], i) => {
                                const pct = Math.round((d.count / maxCount) * 100);
                                const col = getHeatColor(d.count, maxCount);
                                return (
                                    <div key={state} onClick={() => setSelectedState(state === selectedState ? null : state)}
                                        style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 8, background: selectedState === state ? `${col}12` : 'transparent', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', minWidth: 16 }}>{i + 1}</span>
                                            <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state}</span>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: col }}>{d.count?.toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginLeft: 24 }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 2 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
