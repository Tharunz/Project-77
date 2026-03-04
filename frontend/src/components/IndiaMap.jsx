import React, { useState, useEffect, memo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = "/india_states.geojson";
let globalGeoCache = null;

const normalizeStateName = (name) => {
    if (!name) return "";
    const n = name.trim().toLowerCase();
    if (n.includes("delhi")) return "Delhi";
    if (n.includes("andaman")) return "Andaman and Nicobar Islands";
    if (n.includes("dadara") || n.includes("dadra") || n.includes("daman")) return "Dadra and Nagar Haveli and Daman and Diu";
    if (n === "jammu & kashmir" || n === "jammu and kashmir") return "Jammu and Kashmir";
    if (n === "uttaranchal" || n === "uttarakhand") return "Uttarakhand";
    if (n === "orissa" || n === "odisha") return "Odisha";
    if (n === "pondicherry") return "Puducherry";

    // Case-insensitive fallback match
    const standardName = Object.keys(STATE_DISTRESS).find(k => k.toLowerCase() === n);
    return standardName || name;
};

const STATE_DISTRESS = {
    'Jammu and Kashmir': 3, 'Ladakh': 1, 'Himachal Pradesh': 1, 'Punjab': 2, 'Chandigarh': 1, 'Uttarakhand': 1,
    'Haryana': 2, 'Delhi': 3, 'Uttar Pradesh': 4, 'Rajasthan': 3, 'Bihar': 4, 'Sikkim': 0, 'West Bengal': 2, 'Assam': 2,
    'Arunachal Pradesh': 1, 'Nagaland': 1, 'Manipur': 3, 'Meghalaya': 1, 'Tripura': 2, 'Mizoram': 0, 'Gujarat': 2,
    'Dadra and Nagar Haveli and Daman and Diu': 1, 'Maharashtra': 2, 'Madhya Pradesh': 3, 'Jharkhand': 4, 'Odisha': 3,
    'Chhattisgarh': 3, 'Goa': 0, 'Karnataka': 2, 'Telangana': 2, 'Andhra Pradesh': 2, 'Tamil Nadu': 1, 'Kerala': 1,
    'Puducherry': 0, 'Andaman and Nicobar Islands': 0, 'Lakshadweep': 0,
};

const STATE_DISTRESS_KEYS = Object.keys(STATE_DISTRESS);

const STATE_MOCK_DATA = {
    'Uttar Pradesh': { g: 12405, top: 'Healthcare', rr: '82%', pred: 'Water Supply Issue', resp: '24h' },
    'Bihar': { g: 9832, top: 'Education', rr: '76%', pred: 'Staff Shortage', resp: '36h' },
    'Jharkhand': { g: 7421, top: 'Pension', rr: '71%', pred: 'Payment Delay', resp: '48h' },
    'Delhi': { g: 6521, top: 'Transport', rr: '88%', pred: 'DTC Congestion', resp: '12h' },
    'Maharashtra': { g: 5892, top: 'Agriculture', rr: '85%', pred: 'Grid Load Max', resp: '18h' },
    'West Bengal': { g: 5432, top: 'Infrastructure', rr: '79%', pred: 'Bridge Integrity', resp: '28h' },
    'Madhya Pradesh': { g: 4982, top: 'Public Works', rr: '81%', pred: 'Road Repair', resp: '30h' },
    'Gujarat': { g: 4521, top: 'Energy', rr: '89%', pred: 'Solar Grid Balance', resp: '15h' },
    'Rajasthan': { g: 4231, top: 'Water', rr: '74%', pred: 'Canal Leakage', resp: '40h' },
    'Karnataka': { g: 3982, top: 'Technology', rr: '92%', pred: 'Broadband Outage', resp: '10h' },
    'Tamil Nadu': { g: 3765, top: 'Industry', rr: '87%', pred: 'Industrial Waste', resp: '20h' },
    'Andhra Pradesh': { g: 3421, top: 'Fisheries', rr: '83%', pred: 'Port Congestion', resp: '22h' },
    'Telangana': { g: 3102, top: 'IT Services', rr: '94%', pred: 'Server Latency', resp: '8h' },
    'Odisha': { g: 2987, top: 'Disaster Mgmt', rr: '91%', pred: 'Cyclone Warning', resp: '6h' },
    'Kerala': { g: 2765, top: 'Tourism', rr: '88%', pred: 'Eco-System Balance', resp: '18h' },
    'Assam': { g: 2543, top: 'Environment', rr: '76%', pred: 'Flood Risk', resp: '36h' },
    'Punjab': { g: 2321, top: 'Agriculture', rr: '85%', pred: 'Crop Yield Opt', resp: '24h' },
    'Haryana': { g: 2109, top: 'Livestock', rr: '84%', pred: 'Fodder Scarcity', resp: '26h' },
    'Chhattisgarh': { g: 1987, top: 'Mining', rr: '78%', pred: 'Safety Protocol', resp: '32h' },
    'Uttarakhand': { g: 1765, top: 'Hydropower', rr: '82%', pred: 'Turbine Maint', resp: '24h' },
    'Himachal Pradesh': { g: 1543, top: 'Horticulture', rr: '86%', pred: 'Apple Export', resp: '20h' },
    'Jammu and Kashmir': { g: 1321, top: 'Connectivity', rr: '72%', pred: 'Network Blackout', resp: '48h' },
    'Ladakh': { g: 876, top: 'Logistics', rr: '95%', pred: 'Supply Chain Opt', resp: '12h' },
    'Goa': { g: 654, top: 'Maritime', rr: '93%', pred: 'Beach Safety', resp: '14h' },
    'Manipur': { g: 543, top: 'Public Safety', rr: '68%', pred: 'Civil Order', resp: '72h' },
    'Nagaland': { g: 432, top: 'Rural Dev', rr: '75%', pred: 'Village Access', resp: '48h' },
    'Arunachal Pradesh': { g: 321, top: 'Border Infra', rr: '81%', pred: 'Strategic Route', resp: '24h' },
    'Mizoram': { g: 210, top: 'Forestry', rr: '90%', pred: 'Bamboo Flowering', resp: '18h' },
    'Tripura': { g: 198, top: 'Communication', rr: '83%', pred: 'Signal Strength', resp: '22h' },
    'Meghalaya': { g: 187, top: 'Weather', rr: '89%', pred: 'Heavy Rain Prep', resp: '14h' },
    'Sikkim': { g: 154, top: 'Organic Farming', rr: '96%', pred: 'Certification', resp: '10h' },
    'Chandigarh': { g: 142, top: 'Urban Planning', rr: '97%', pred: 'Zoning Efficiency', resp: '8h' },
    'Puducherry': { g: 132, top: 'Coastal', rr: '94%', pred: 'Erosion Monitor', resp: '12h' },
    'Dadra and Nagar Haveli and Daman and Diu': { g: 121, top: 'Industry', rr: '92%', pred: 'Factory Safety', resp: '14h' },
    'Lakshadweep': { g: 98, top: 'Marine Life', rr: '98%', pred: 'Coral Health', resp: '6h' },
    'Andaman and Nicobar Islands': { g: 112, top: 'Naval Logistics', rr: '95%', pred: 'Port Transit', resp: '10h' },
    'default': { g: 3102, top: 'Civic', rr: '91%', pred: 'Normal Operation', resp: '14h' }
};

const DC = ['#00E5A0', '#5C8EFF', '#FFB800', '#FF5500', '#FF3B3B'];
const LEVEL_LABELS = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const MapOverlays = memo(() => (
    <></>
));

const StateBaseLayer = memo(({ geoData, clickedStateName, hoveredLegendLevel, onHoverState, onClickState, bootPhase }) => {
    const hasClick = clickedStateName !== null;
    const hasLegendHover = hoveredLegendLevel !== null;

    // Use a memoized callback for the render prop to prevent excessive re-renders
    return (
        <g className={`map-geographies ${hasClick ? 'has-click' : ''} ${hasLegendHover ? 'has-legend-hover' : ''}`} style={{ willChange: 'filter, opacity' }}>
            <Geographies geography={geoData}>
                {({ geographies }) =>
                    geographies.map(geo => {
                        const name = geo.properties._normalizedName || normalizeStateName(geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.name || geo.properties.state_name || '');
                        const level = STATE_DISTRESS[name] ?? 1;
                        const isClicked = clickedStateName === name;
                        const isLegendPulsed = hoveredLegendLevel === level;
                        const isBoot = bootPhase === 'building';

                        const isThreatSource = false;
                        const isThreatDest = false;

                        let filter = 'none';
                        if (isClicked) {
                            filter = `drop-shadow(0 0 16px ${DC[level]})`;
                        }

                        let fillVal = 'rgba(0,229,255,0.15)';
                        if (!hasClick) {
                            if (level === 4) fillVal = 'url(#bloom-crit)';
                            else if (level === 3) fillVal = 'url(#bloom-high)';
                            else if (level === 2) fillVal = 'rgba(255,184,0,0.12)';
                            else if (level === 1) fillVal = 'rgba(92,142,255,0.12)';
                            else fillVal = 'rgba(0,229,160,0.12)';

                            if (isBoot) fillVal = 'transparent';
                        } else if (isClicked) {
                            fillVal = `${DC[level]}59`;
                        }

                        let strokeColor = isLegendPulsed ? '#FFFFFF' : DC[level];
                        let strokeWidth = isClicked ? 2.5 : 2;
                        let strokeOpacity = 1;

                        if (isClicked) {
                            strokeColor = DC[level];
                            strokeWidth = 2.5;
                            strokeOpacity = 1;
                        }

                        let extraClass = `state-breathe-${level}`;

                        const delaySecs = (geoData.delayMap && geoData.delayMap[name]) || 0;
                        const pathStyle = isBoot ? { strokeDasharray: 1000, strokeDashoffset: 1000, animation: `drawState 0.6s ease-out forwards`, animationDelay: `${delaySecs}s` } : {};
                        const fillStyle = isBoot ? { opacity: 0, animation: `bootFadeIn 0.6s ease forwards`, animationDelay: `${delaySecs + 0.8}s` } : {};

                        return (
                            <g key={geo.rsmKey || name}
                                className={`state-layer-group ${isClicked ? 'is-clicked' : ''} ${isLegendPulsed ? 'is-legend-pulsed' : ''}`}
                                style={{ transformOrigin: '50% 50%', filter, opacity: (hasClick && !isClicked) ? 0.4 : 1, transition: 'opacity 0.4s ease', ...fillStyle }}>
                                <Geography
                                    geography={geo}
                                    onMouseEnter={() => !hasClick && onHoverState(name)}
                                    onMouseLeave={() => !hasClick && onHoverState(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickState({ name, level, coords: geo.properties._centroid, geoPath: geo });
                                    }}
                                    style={{
                                        default: { fill: fillVal, stroke: strokeColor, strokeWidth, strokeOpacity, outline: 'none', cursor: 'pointer', ...pathStyle },
                                        hover: { fill: isClicked ? fillVal : `${DC[level]}44`, stroke: '#FFFFFF', strokeWidth: 2, strokeOpacity: 1, outline: 'none', cursor: 'pointer', ...pathStyle },
                                        pressed: { outline: 'none', ...pathStyle },
                                    }}
                                    className={`state-geo-path ${extraClass}`}
                                >
                                    <title>{name}</title>
                                </Geography>
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

    const [clickedState, setClickedState] = useState(null);
    const [isClosingClick, setIsClosingClick] = useState(false);

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

    // Holographic Core Boot Engine (Web Worker Powered)
    useEffect(() => {
        if (!globalGeoCache) {
            let p = 0;
            let dataReady = false;

            // Initialize Multi-Threaded Parallel Processing Pool
            const coreCount = Math.min(navigator.hardwareConcurrency || 4, 8);
            const workers = [];
            let completedWorkers = 0;
            const allFeatures = [];
            const allDelayMaps = {};
            const allCentroids = {};
            let baseGeoJson = null;

            fetch(GEO_URL).then(r => r.json()).then(geojson => {
                baseGeoJson = geojson;
                const featuresPerWorker = Math.ceil(geojson.features.length / coreCount);

                for (let i = 0; i < coreCount; i++) {
                    const worker = new Worker(new URL('../workers/geoWorker.js', import.meta.url), { type: 'module' });
                    workers.push(worker);

                    worker.onmessage = (e) => {
                        const { type, data, error } = e.data;
                        if (type === 'SUCCESS') {
                            allFeatures.push(...data.features);
                            Object.assign(allDelayMaps, data.delayMap);
                            Object.assign(allCentroids, data.centroids);
                            completedWorkers++;

                            if (completedWorkers === coreCount) {
                                const finalData = {
                                    ...baseGeoJson,
                                    features: allFeatures,
                                    delayMap: allDelayMaps,
                                    centroids: allCentroids
                                };
                                globalGeoCache = finalData;
                                setGeoData(finalData);
                                dataReady = true;
                                workers.forEach(w => w.terminate());
                            }
                        }
                    };

                    const chunk = geojson.features.slice(i * featuresPerWorker, (i + 1) * featuresPerWorker);
                    worker.postMessage({
                        action: 'process_chunk',
                        data: { features: chunk, stateDistressKeys: STATE_DISTRESS_KEYS }
                    });
                }
            });

            const pInterval = setInterval(() => {
                if (!dataReady && p >= 85) {
                    p = 85;
                } else {
                    p += Math.random() * (dataReady ? 15 : 8);
                }

                if (p > 100) p = 100;
                setBootProgress(p);

                if (p < 25) setBootText('ESTABLISHING SECURE LINK...');
                else if (p < 55) setBootText('ORCHESTRATING GPU CLUSTER...');
                else if (p < 85) setBootText(`PARALLELIZING ACROSS ${coreCount} CORES...`);
                else setBootText('NEURAL GRID SYNCHRONIZED.');

                if (p >= 100) {
                    clearInterval(pInterval);
                    setBootPhase('building'); // Trigger the drawing animation
                    setTimeout(() => {
                        setIsFading(true);
                        setTimeout(() => {
                            setBootPhase('ready');
                            if (onReady) onReady();
                        }, 800);
                    }, 1200);
                }
            }, 120);

            return () => {
                clearInterval(pInterval);
                workers.forEach(w => w.terminate());
            };
        } else {
            setGeoData(globalGeoCache);
            setIsFading(true);
            setBootPhase('ready');
            if (onReady) onReady();
        }
    }, [onReady]);

    // Hover is handled internally by Geography style to ensure 60fps fluidity
    const handleHoverState = useCallback(() => { }, []);

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
                        projectionConfig={{ center: [82.5, 22.5], scale: 1450 }}
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
                                <rect x="-100" y="-100" width="1400" height="1150" />
                            </clipPath>

                            <linearGradient id="radar-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="transparent" /><stop offset="30%" stopColor="rgba(0,255,238,0.1)" /><stop offset="50%" stopColor="rgba(0,255,238,0.2)" /><stop offset="70%" stopColor="rgba(0,255,238,0.1)" /><stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>

                        <StateBaseLayer
                            geoData={geoData}
                            clickedStateName={clickedState?.name || null}
                            hoveredLegendLevel={hoveredLegendLevel}
                            onHoverState={handleHoverState}
                            onClickState={handleClickState}
                            bootPhase={bootPhase}
                        />

                        <MapOverlays />
                    </ComposableMap>

                    {/* DOM Element HUD — LEFT PANEL (Isolated State) */}
                    {hasClick && (() => {
                        const mockData = STATE_MOCK_DATA[clickedState.name] || STATE_MOCK_DATA['default'];
                        const distressLevel = clickedState.level;
                        const activeColor = DC[distressLevel];

                        return (
                            <div className={`detail-card-left ${isClosingClick ? 'slide-out-left' : 'slide-in-left'}`}>
                                <div className="iso-target-hud" style={{ '--ac': activeColor }}>
                                    <div className="hud-corner top-left"></div>
                                    <div className="hud-corner top-right"></div>
                                    <div className="hud-corner bottom-left"></div>
                                    <div className="hud-corner bottom-right"></div>

                                    <div className="hud-header">
                                        <span className="hud-flash">● LIVE NODE</span>
                                        <span className="hud-sys">SYS.LINK.ESTABLISHED</span>
                                    </div>

                                    <h3 className="iso-state-name">{clickedState.name}</h3>

                                    <div className="hud-divider"></div>

                                    <div className="hud-core-metrics">
                                        <div className="iso-metric">
                                            <span className="iso-metric-lbl">RISK LEVEL</span>
                                            <div className="iso-score-circle" style={{ borderColor: activeColor, background: `${activeColor}15`, color: activeColor, textShadow: `0 0 10px ${activeColor}` }}>
                                                {10 + distressLevel * 22}
                                            </div>
                                        </div>

                                        <div className="hud-chart-container">
                                            <div className="hud-bar" style={{ animationDelay: '0.1s', height: '60%' }}></div>
                                            <div className="hud-bar" style={{ animationDelay: '0.2s', height: '80%' }}></div>
                                            <div className="hud-bar" style={{ animationDelay: '0.3s', height: '40%' }}></div>
                                            <div className="hud-bar" style={{ animationDelay: '0.4s', height: '100%', background: activeColor, boxShadow: `0 0 10px ${activeColor}` }}></div>
                                            <div className="hud-bar" style={{ animationDelay: '0.5s', height: '50%' }}></div>
                                        </div>
                                    </div>

                                    <div className="iso-metric" style={{ marginTop: '16px' }}>
                                        <span className="iso-metric-lbl">ACTIVE GRIEVANCES</span>
                                        <div className="iso-desc">
                                            {mockData.g.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="hud-ai-analysis" style={{ borderLeft: `2px solid ${activeColor}` }}>
                                        <div className="hud-ai-title">AI PREDICTION</div>
                                        <div className="hud-ai-value">{mockData.pred}</div>
                                        <div className="hud-ai-conf" style={{ color: activeColor }}>{mockData.rr} Confidence Level</div>
                                    </div>

                                    <div className="hud-scanner"></div>
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
