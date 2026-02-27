import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { geoCentroid, geoMercator } from 'd3-geo';

const GEO_URL = "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson";
let globalGeoCache = null;

const STATE_DISTRESS = {
    'Jammu & Kashmir': 3, 'Jammu and Kashmir': 3, 'Ladakh': 1, 'Himachal Pradesh': 1, 'Punjab': 2, 'Chandigarh': 1, 'Uttarakhand': 1,
    'Haryana': 2, 'Delhi': 3, 'Uttar Pradesh': 4, 'Rajasthan': 3, 'Bihar': 4, 'Sikkim': 0, 'West Bengal': 2, 'Assam': 2,
    'Arunachal Pradesh': 1, 'Nagaland': 1, 'Manipur': 3, 'Meghalaya': 1, 'Tripura': 2, 'Mizoram': 0, 'Gujarat': 2, 'Dadra and Nagar Haveli': 1,
    'Daman and Diu': 1, 'Maharashtra': 2, 'Madhya Pradesh': 3, 'Jharkhand': 4, 'Odisha': 3, 'Chhattisgarh': 3, 'Goa': 0,
    'Karnataka': 2, 'Telangana': 2, 'Andhra Pradesh': 2, 'Tamil Nadu': 1, 'Kerala': 1, 'Puducherry': 0, 'Andaman and Nicobar Islands': 0, 'Lakshadweep': 0,
};

const STATE_MOCK_DATA = {
    'Uttar Pradesh': { g: 12405, top: 'Healthcare', rr: '82%', pred: 'Water Supply Issue', resp: '24h' },
    'Bihar': { g: 9832, top: 'Education', rr: '76%', pred: 'Staff Shortage', resp: '36h' },
    'Jharkhand': { g: 7421, top: 'Pension', rr: '71%', pred: 'Payment Delay', resp: '48h' },
    'Delhi': { g: 6521, top: 'Transport', rr: '88%', pred: 'DTC Congestion', resp: '12h' },
    'Maharashtra': { g: 5892, top: 'Agriculture', rr: '85%', pred: 'Grid Load Max', resp: '18h' },
    'default': { g: 3102, top: 'Civic', rr: '91%', pred: 'Normal Operation', resp: '14h' }
};

const DC = ['#00E5A0', '#5C8EFF', '#FFB800', '#FF5500', '#FF3B3B'];
const DC_FAINT = ['rgba(0,229,160,0.08)', 'rgba(92,142,255,0.08)', 'rgba(255,184,0,0.08)', 'rgba(255,85,0,0.08)', 'rgba(255,59,59,0.08)'];
const LEVEL_LABELS = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const CITIES = [
    { name: 'Lucknow', coords: [80.946, 26.846], level: 4, st: 'Uttar Pradesh', cat: 'Water' },
    { name: 'Patna', coords: [85.137, 25.594], level: 4, st: 'Bihar', cat: 'Education' },
    { name: 'Ranchi', coords: [85.309, 23.344], level: 4, st: 'Jharkhand', cat: 'Pension' },
    { name: 'New Delhi', coords: [77.209, 28.613], level: 3, st: 'Delhi', cat: 'Transport' },
    { name: 'Jaipur', coords: [75.787, 26.912], level: 3, st: 'Rajasthan', cat: 'Power' },
    { name: 'Bhopal', coords: [77.412, 23.259], level: 3, st: 'Madhya Pradesh', cat: 'Roads' },
    { name: 'Raipur', coords: [81.629, 21.251], level: 3, st: 'Chhattisgarh', cat: 'Civic' },
    { name: 'Mumbai', coords: [72.877, 19.076], level: 2, st: 'Maharashtra', cat: 'Police' },
    { name: 'Kolkata', coords: [88.363, 22.572], level: 2, st: 'West Bengal', cat: 'Water' },
    { name: 'Bengaluru', coords: [77.594, 12.971], level: 2, st: 'Karnataka', cat: 'Traffic' },
    { name: 'Chennai', coords: [80.270, 13.082], level: 1, st: 'Tamil Nadu', cat: 'Health' },
];

const PRE_SEVA_LINKS = [
    { s: [80.946, 26.846], d: [85.137, 25.594], msg: 'Water Supply Prop' },
    { s: [85.137, 25.594], d: [85.309, 23.344], msg: 'Grid Overload' },
    { s: [77.209, 28.613], d: [75.787, 26.912], msg: 'Logistics Delay' }
];

// Identical projection to map settings to map lonlat -> pixels for custom SVG pathing
const projection = geoMercator().center([82.5, 23.0]).scale(1050).translate([250, 275]);

// Replaced by Threat Auras
const PRE_SEVA_SOURCES = ['Andhra Pradesh', 'Uttar Pradesh', 'Maharashtra'];
const PRE_SEVA_DESTS = ['Karnataka', 'Bihar', 'Goa'];

// Replaced by pulse rings

const StateBaseLayer = memo(({ geoData, clickedStateName, hoveredLegendLevel, onHoverState, onClickState, bootPhase }) => {
    const hasClick = clickedStateName !== null;
    const hasLegendHover = hoveredLegendLevel !== null;

    return (
        <g className={`map-geographies ${hasClick ? 'has-click' : ''} ${hasLegendHover ? 'has-legend-hover' : ''}`}>
            <Geographies geography={geoData}>
                {({ geographies }) =>
                    geographies.map(geo => {
                        const name = geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.name || '';
                        const delaySecs = geoData.delayMap[name] || 0;
                        const level = STATE_DISTRESS[name] ?? 1;
                        const isClicked = clickedStateName === name;
                        const isLegendPulsed = hoveredLegendLevel === level;
                        const isBoot = bootPhase === 'building';

                        const isThreatSource = PRE_SEVA_SOURCES.includes(name);
                        const isThreatDest = PRE_SEVA_DESTS.includes(name);

                        // If there is a click, isolate the state. Ghost out all others.
                        let groupOpacity = 1;
                        let filter = 'drop-shadow(0 0 10px rgba(0,255,238,0.65))';
                        if (hasClick && !isClicked) {
                            groupOpacity = 0.08;
                            filter = 'saturate(0)';
                        }

                        let fillVal = 'rgba(0,229,255,0.07)';
                        if (!hasClick) {
                            if (level === 4) fillVal = 'url(#bloom-crit)';
                            else if (level === 3) fillVal = 'url(#bloom-high)';
                            // Aura blooms
                            if (isThreatSource) fillVal = 'rgba(245, 158, 11, 0.05)';
                            if (isThreatDest) fillVal = 'rgba(139, 92, 246, 0.05)';
                            // During boot, invisible
                            if (isBoot) fillVal = 'transparent';
                        } else if (isClicked) {
                            // Richer distress color at 25% opacity
                            fillVal = `${DC[level]}40`; // 40 hex is 25%
                        }

                        let strokeColor = isLegendPulsed ? '#FFFFFF' : '#00FFEE';
                        let strokeWidth = isLegendPulsed ? 1.8 : 1.8;
                        let strokeOpacity = isLegendPulsed ? 1 : 0.9;

                        // Clicked state: Bright border, 2.5px width, Outer Glow
                        if (isClicked) {
                            strokeColor = DC[level];
                            strokeWidth = 2.5;
                            strokeOpacity = 1;
                            filter = `drop-shadow(0 0 16px ${DC[level]})`;
                        }

                        // Threat Aura Borders (Animated via CSS classes)
                        let extraClass = '';
                        if (!hasClick) {
                            if (isThreatSource) extraClass = 'aura-source';
                            if (isThreatDest) extraClass = 'aura-dest';
                        }

                        const pathStyle = isBoot ? { strokeDasharray: 1000, strokeDashoffset: 1000, animation: `drawState 0.6s ease-out forwards`, animationDelay: `${delaySecs}s` } : {};
                        const fillStyle = isBoot ? { opacity: 0, animation: `bootFadeIn 0.6s ease forwards`, animationDelay: `${delaySecs + 0.8}s` } : {};

                        return (
                            <g key={geo.rsmKey}
                                className={`state-layer-group ${isClicked ? 'is-clicked' : ''} ${isLegendPulsed ? 'is-legend-pulsed' : ''}`}
                                style={{ transformOrigin: '50% 50%', opacity: groupOpacity, filter, transition: 'all 0.5s ease', ...fillStyle }}>
                                <Geography
                                    geography={geo}
                                    onMouseEnter={() => !hasClick && onHoverState(name)}
                                    onMouseLeave={() => !hasClick && onHoverState(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickState({ name, level, coords: geoCentroid(geo), geoPath: geo });
                                    }}
                                    style={{
                                        default: { fill: fillVal, stroke: strokeColor, strokeWidth, strokeOpacity, outline: 'none', cursor: 'pointer', ...pathStyle },
                                        hover: { fill: 'rgba(0,229,255,0.14)', stroke: '#FFFFFF', strokeWidth: 1.8, strokeOpacity: 1, outline: 'none', cursor: 'pointer', ...pathStyle },
                                        pressed: { outline: 'none', ...pathStyle },
                                    }}
                                    className={`state-geo-path ${extraClass}`}
                                />
                            </g>
                        );
                    })
                }
            </Geographies>
        </g>
    );
});

function IndiaMap({ onPulse, hoveredLegendLevel, activeFilterLevel, onReady }) {
    const [geoData, setGeoData] = useState(globalGeoCache);
    const [bootPhase, setBootPhase] = useState('loading'); // loading, ready 
    const [isFading, setIsFading] = useState(false);
    const [bootProgress, setBootProgress] = useState(0);
    const [bootText, setBootText] = useState('ESTABLISHING SECURE LINK...');

    const [hoveredState, setHoveredState] = useState(null);
    const [clickedState, setClickedState] = useState(null);
    const [isClosingClick, setIsClosingClick] = useState(false);

    const [activeArcs, setActiveArcs] = useState([PRE_SEVA_LINKS[0], PRE_SEVA_LINKS[1], PRE_SEVA_LINKS[2]]);

    // Document click to close details
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!clickedState || isClosingClick) return;
            if (!e.target.closest('.state-geo-path') && !e.target.closest('.detail-card-overlay')) {
                setIsClosingClick(true);
                setTimeout(() => {
                    setClickedState(null);
                    setIsClosingClick(false);
                }, 300); // Wait for reverse animation
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape' && clickedState && !isClosingClick) {
                setIsClosingClick(true);
                setTimeout(() => { setClickedState(null); setIsClosingClick(false); }, 300);
            }
        };
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => { document.removeEventListener('click', handleClickOutside); document.removeEventListener('keydown', handleEscape); };
    }, [clickedState, isClosingClick]);

    // Holographic Core Boot Engine
    useEffect(() => {
        if (!globalGeoCache) {
            let p = 0;
            let dataReady = false;

            fetch(GEO_URL).then(r => r.json()).then(d => {
                const dat = { ...d, delayMap: {} };
                globalGeoCache = dat;
                setGeoData(dat);
                dataReady = true;
            }).catch(e => console.error(e));

            const pInterval = setInterval(() => {
                if (!dataReady && p >= 85) {
                    p = 85;
                } else {
                    p += Math.random() * (dataReady ? 15 : 4);
                }

                if (p > 100) p = 100;
                setBootProgress(p);

                if (p < 25) setBootText('ESTABLISHING SECURE LINK...');
                else if (p < 55) setBootText('INITIALIZING PRESEVA AI...');
                else if (p < 85) setBootText('ALIGNING GEOSPATIAL NODES...');
                else setBootText('NATIONAL GRID ONLINE.');

                if (p >= 100) {
                    clearInterval(pInterval);
                    setTimeout(() => {
                        setIsFading(true);
                        setTimeout(() => {
                            setBootPhase('ready');
                            if (onReady) onReady();
                        }, 500);
                    }, 600); // 600ms showcase of 100% completion
                }
            }, 60);

            return () => clearInterval(pInterval);
        } else {
            setGeoData(globalGeoCache);
            setIsFading(true);
            setBootPhase('ready');
            if (onReady) onReady();
        }
    }, [onReady]);

    // Corridors Rotate
    useEffect(() => {
        if (bootPhase !== 'ready') return;
        const interval = setInterval(() => {
            setActiveArcs(prev => {
                const next = [...prev]; next.shift();
                const available = PRE_SEVA_LINKS.filter(a => !next.includes(a));
                next.push(available[Math.floor(Math.random() * available.length)]);
                return next;
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [bootPhase]);

    const handleHoverState = useCallback((name) => setHoveredState(name), []);
    const handleClickState = useCallback((stateData) => {
        if (isClosingClick) return;
        setClickedState(stateData);
    }, [isClosingClick]);

    const hasClick = clickedState !== null;

    if (!geoData && bootPhase !== 'loading') return null;

    return (
        <div className="india-map-canvas relative-canvas">
            {bootPhase === 'loading' && (
                <div className={`india-map-canvas hq-loader-wrap ${isFading ? 'is-fading' : ''}`}>
                    <div className="hq-rings-container">
                        <div className="hq-ring hq-ring-1"></div>
                        <div className="hq-ring hq-ring-2"></div>
                        <div className="hq-ring hq-ring-3"></div>
                        <div className="hq-core-value">
                            {Math.min(100, bootProgress).toFixed(1)}<span>%</span>
                        </div>
                    </div>
                    <div className="hq-loader-text-box">
                        <div className="hq-loader-text">{bootText}</div>
                        <div className="hq-progress-track">
                            <div className="hq-progress-fill" style={{ width: `${Math.min(100, bootProgress)}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {geoData && (
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: (bootPhase === 'loading' && !isFading) ? 0 : 1,
                    transition: 'opacity 0.5s ease'
                }}>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [82.5, 23.0], scale: 1420 }}
                        width={1200}
                        height={950}
                        viewBox="0 0 1200 950"
                        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                    >
                        <defs>
                            <radialGradient id="bloom-high"><stop offset="0%" stopColor="#FF5500" stopOpacity="0.04" /><stop offset="100%" stopColor="#FF5500" stopOpacity="0" /></radialGradient>
                            <radialGradient id="bloom-crit">
                                <stop offset="0%" stopColor="#FF3B3B"><animate attributeName="stop-opacity" values="0.03;0.07;0.03" dur="3s" repeatCount="indefinite" /></stop>
                                <stop offset="70%" stopColor="#FF3B3B" stopOpacity="0.01" />
                                <stop offset="100%" stopColor="#FF3B3B" stopOpacity="0" />
                            </radialGradient>

                            <clipPath id="india-clip">
                                <Geographies geography={geoData}>
                                    {({ geographies }) => geographies.map((geo, i) => <Geography key={'clip-' + i} geography={geo} />)}
                                </Geographies>
                            </clipPath>

                            <linearGradient id="radar-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="transparent" /><stop offset="30%" stopColor="rgba(0,255,238,0.1)" /><stop offset="50%" stopColor="rgba(0,255,238,0.2)" /><stop offset="70%" stopColor="rgba(0,255,238,0.1)" /><stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>

                        <g clipPath="url(#india-clip)" className={`radar-sweep-group ${(bootPhase === 'building' || bootPhase === 'fading') ? 'boot-hidden' : ''}`} style={{ pointerEvents: 'none', animationDelay: '1.8s' }}>
                            <rect x="-100" y="-100" width="1000" height="180" className="radar-beam" fill="url(#radar-gradient)" />
                        </g>

                        <StateBaseLayer
                            geoData={geoData}
                            clickedStateName={clickedState?.name || null}
                            hoveredLegendLevel={hoveredLegendLevel}
                            onHoverState={handleHoverState}
                            onClickState={handleClickState}
                            bootPhase={bootPhase}
                        />

                        {/* PreSeva Pulse Rings Removed in Favor of Threat Auras in StateBaseLayer */}

                        {/* Threat Corridors (PreSeva Arcs) */}
                        {!hasClick && activeArcs.map((arc, i) => (
                            <Line
                                key={'arc-' + i}
                                from={arc.s}
                                to={arc.d}
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                strokeOpacity={0.55}
                                strokeLinecap="round"
                                className="fade-in-arc"
                                style={{ filter: 'drop-shadow(0 0 8px #8B5CF6)' }}
                            />
                        ))}
                        {!hasClick && activeArcs.map((arc, i) => (
                            <Line
                                key={'dot-' + i}
                                from={arc.s}
                                to={arc.d}
                                stroke="#FFFFFF"
                                strokeWidth={6}
                                strokeOpacity={1}
                                strokeLinecap="round"
                                strokeDasharray="0.1 200"
                                className="fade-in-arc"
                                style={{ animation: 'travelDot 4s linear infinite', filter: 'drop-shadow(0 0 8px #8B5CF6)' }}
                            />
                        ))}

                        {/* Distress dots */}
                        {CITIES.map((city, i) => {
                            let baseR = (city.level >= 4 ? 3 : city.level >= 3 ? 2 : 1.2) * 1.4;
                            if (hasClick && clickedState?.name === city.st) baseR *= 1.8;

                            let dotOpacity = hasClick && clickedState?.name !== city.st ? 0.1 : 0.9;
                            if (!hasClick && activeFilterLevel !== undefined && activeFilterLevel !== null) {
                                if (city.level !== activeFilterLevel) dotOpacity = 0.1;
                            }

                            return (
                                <Marker key={'city-' + i} coordinates={city.coords}>
                                    <circle r={baseR} fill={DC[city.level]} filter="drop-shadow(0 0 11px currentColor)"
                                        opacity={dotOpacity} style={{ transition: 'opacity 0.4s ease' }} />
                                </Marker>
                            );
                        })}
                    </ComposableMap>

                    {/* DOM Element HUD — LEFT PANEL (Isolated State) */}
                    {hasClick && (() => {
                        const mockData = STATE_MOCK_DATA[clickedState.name] || STATE_MOCK_DATA['default'];
                        const distressLevel = clickedState.level;
                        const activeColor = DC[distressLevel];

                        return (
                            <div className={`detail-card-left ${isClosingClick ? 'slide-out-left' : 'slide-in-left'}`}>
                                <div className="iso-state-svg-wrap" style={{ filter: `drop-shadow(0 0 16px ${activeColor})` }}>
                                    {/* Render an isolated version of the exact state for that beautiful large shape */}
                                    <svg viewBox="0 0 900 700" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="iso-svg">
                                        <ComposableMap
                                            projection="geoMercator"
                                            projectionConfig={{ center: [82.5, 22.0], scale: 1050 }}
                                            width={900}
                                            height={700}
                                            viewBox="0 0 900 700"
                                            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                                        >
                                            <Geographies geography={{ type: "FeatureCollection", features: [clickedState.geoPath] }}>
                                                {({ geographies }) =>
                                                    geographies.map((geo) => (
                                                        <Geography
                                                            key={geo.rsmKey}
                                                            geography={geo}
                                                            style={{
                                                                default: {
                                                                    fill: `${activeColor}40`,
                                                                    stroke: activeColor,
                                                                    strokeWidth: 2.5
                                                                }
                                                            }}
                                                        />
                                                    ))
                                                }
                                            </Geographies>
                                        </ComposableMap>
                                    </svg>
                                </div>

                                <div className="iso-state-name">{clickedState.name}</div>

                                <div className="iso-score-circle" style={{ borderColor: activeColor, background: `${activeColor}33` }}>
                                    {10 + distressLevel * 22}
                                </div>

                                <div className="iso-desc">
                                    {mockData.g.toLocaleString()} active grievances
                                </div>
                            </div>
                        )
                    })()}

                    {/* DOM Element HUD — RIGHT PANEL (Mission Control Detailed View) */}
                    {hasClick && (() => {
                        const mockData = STATE_MOCK_DATA[clickedState.name] || STATE_MOCK_DATA['default'];
                        return (
                            <div className={`detail-card-overlay ${isClosingClick ? 'slide-out' : 'slide-in'}`}>
                                <div className="dco-top">
                                    <div className="dco-title">
                                        <div className="dco-dot" style={{ background: DC[clickedState.level] }} />
                                        {clickedState.name} Intelligence
                                    </div>
                                    <button className="dco-close" onClick={() => setIsClosingClick(true)}>×</button>
                                </div>

                                <div className="dco-div" />

                                <div className="dco-status">
                                    <span>STATUS</span>
                                    <div style={{ color: DC[clickedState.level] }}>{LEVEL_LABELS[clickedState.level]}</div>
                                </div>

                                <div className="dco-grid">
                                    <div className="dco-box">
                                        <label>GRIEVANCES</label>
                                        <span style={{ color: '#FFB800' }}>{mockData.g.toLocaleString()}</span>
                                    </div>
                                    <div className="dco-box">
                                        <label>RESOLVED</label>
                                        <span style={{ color: '#00E5A0' }}>{mockData.rr}</span>
                                    </div>
                                    <div className="dco-box">
                                        <label>RESPONSE</label>
                                        <span style={{ color: '#5C8EFF' }}>{mockData.resp}</span>
                                    </div>
                                    <div className="dco-box">
                                        <label>RISK LEVEL</label>
                                        <span style={{ color: DC[clickedState.level] }}>{(clickedState.level * 22) + 10}</span>
                                    </div>
                                </div>

                                <div className="dco-cats">
                                    <label>CRITICAL CATEGORIES</label>
                                    <div className="dco-pills">
                                        <span>{mockData.top}</span>
                                        <span>Administration</span>
                                    </div>
                                </div>

                                <div className="dco-intel">
                                    <div className="dco-intel-tl">⚡ PRESEVA INTEL</div>
                                    <div className="dco-intel-tx">{mockData.pred} · 82% confidence. Priority dispatch recommended.</div>
                                </div>

                                <button className="dco-cta">View Full Report →</button>
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    );
}

export default memo(IndiaMap);
