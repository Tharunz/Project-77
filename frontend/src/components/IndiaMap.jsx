import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { apiGetPublicPredictions } from '../services/api.service';

const GEO_URL = "/india_states.geojson";
let globalGeoCache = null;

const normalizeStateName = (name) => {
    if (!name) return "";
    const map = {
        // North variants
        'Jammu & Kashmir': 'Jammu and Kashmir',
        'J & K': 'Jammu and Kashmir',
        'J&K': 'Jammu and Kashmir',
        // South variants — THIS IS THE KEY FIX
        'Tamilnadu': 'Tamil Nadu',
        'TamilNadu': 'Tamil Nadu',
        'tamil nadu': 'Tamil Nadu',
        'TamilNadu': 'Tamil Nadu',
        'karnataka': 'Karnataka',
        'kerala': 'Kerala',
        'Andra Pradesh': 'Andhra Pradesh',
        'Andhra': 'Andhra Pradesh',
        'AP': 'Andhra Pradesh',
        'TS': 'Telangana',
        'Telegana': 'Telangana',
        // NE variants
        'Arunanchal Pradesh': 'Arunachal Pradesh',
        'Arunachal': 'Arunachal Pradesh',
        // UT variants
        'Dadra & Nagar Haveli': 'Dadra and Nagar Haveli',
        'Dadra and Nagar Haveli and Daman and Diu': 'Dadra and Nagar Haveli',
        'Daman and Diu': 'Dadra and Nagar Haveli',
        'Andaman & Nicobar': 'Andaman and Nicobar',
        'Andaman & Nicobar Islands': 'Andaman and Nicobar',
        'Andaman and Nicobar Islands': 'Andaman and Nicobar',
        'A & N Islands': 'Andaman and Nicobar',
        'NCT of Delhi': 'Delhi',
        'Delhi NCT': 'Delhi',
        'NCT Delhi': 'Delhi',
        'Pondicherry': 'Puducherry',
    };
    return map[name] || name;
};

// Fallback distress levels (used while SageMaker data is loading)
const STATE_DISTRESS_FALLBACK = {
    'Jammu and Kashmir': 3, 'Ladakh': 1, 'Himachal Pradesh': 1, 'Punjab': 2, 'Chandigarh': 1, 'Uttarakhand': 1,
    'Haryana': 2, 'Delhi': 3, 'Uttar Pradesh': 4, 'Rajasthan': 3, 'Bihar': 4, 'Sikkim': 0, 'West Bengal': 2, 'Assam': 2,
    'Arunachal Pradesh': 1, 'Nagaland': 1, 'Manipur': 3, 'Meghalaya': 1, 'Tripura': 2, 'Mizoram': 0, 'Gujarat': 2,
    'Dadra and Nagar Haveli and Daman and Diu': 1, 'Maharashtra': 2, 'Madhya Pradesh': 3, 'Jharkhand': 4, 'Odisha': 3,
    'Chhattisgarh': 3, 'Goa': 0, 'Karnataka': 2, 'Telangana': 2, 'Andhra Pradesh': 2, 'Tamil Nadu': 1, 'Kerala': 1,
    'Puducherry': 0, 'Andaman and Nicobar Islands': 0, 'Lakshadweep': 0,
};

const STATE_DISTRESS_KEYS = Object.keys(STATE_DISTRESS_FALLBACK);

// Risk level → numeric distress level
const RISK_TO_LEVEL = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

const STATE_MOCK_DATA = {
    'Uttar Pradesh': { g: 12405, rr: '82%', resp: '24h' },
    'Bihar': { g: 9832, rr: '76%', resp: '36h' },
    'Jharkhand': { g: 7421, rr: '71%', resp: '48h' },
    'Delhi': { g: 6521, rr: '88%', resp: '12h' },
    'Maharashtra': { g: 5892, rr: '85%', resp: '18h' },
    'West Bengal': { g: 5432, rr: '79%', resp: '28h' },
    'Madhya Pradesh': { g: 4982, rr: '81%', resp: '30h' },
    'Gujarat': { g: 4521, rr: '89%', resp: '15h' },
    'Rajasthan': { g: 4231, rr: '74%', resp: '40h' },
    'Karnataka': { g: 3982, rr: '92%', resp: '10h' },
    'Tamil Nadu': { g: 3765, rr: '87%', resp: '20h' },
    'Andhra Pradesh': { g: 3421, rr: '83%', resp: '22h' },
    'Telangana': { g: 3102, rr: '94%', resp: '8h' },
    'Odisha': { g: 2987, rr: '91%', resp: '6h' },
    'Kerala': { g: 2765, rr: '88%', resp: '18h' },
    'Assam': { g: 2543, rr: '76%', resp: '36h' },
    'Punjab': { g: 2321, rr: '85%', resp: '24h' },
    'Haryana': { g: 2109, rr: '84%', resp: '26h' },
    'Chhattisgarh': { g: 1987, rr: '78%', resp: '32h' },
    'Uttarakhand': { g: 1765, rr: '82%', resp: '24h' },
    'Himachal Pradesh': { g: 1543, rr: '86%', resp: '20h' },
    'Jammu and Kashmir': { g: 1321, rr: '72%', resp: '48h' },
    'Ladakh': { g: 876, rr: '95%', resp: '12h' },
    'Goa': { g: 654, rr: '93%', resp: '14h' },
    'Manipur': { g: 543, rr: '68%', resp: '72h' },
    'Nagaland': { g: 432, rr: '75%', resp: '48h' },
    'Arunachal Pradesh': { g: 321, rr: '81%', resp: '24h' },
    'Mizoram': { g: 210, rr: '90%', resp: '18h' },
    'Tripura': { g: 198, rr: '83%', resp: '22h' },
    'Meghalaya': { g: 187, rr: '89%', resp: '14h' },
    'Sikkim': { g: 154, rr: '96%', resp: '10h' },
    'Chandigarh': { g: 142, rr: '97%', resp: '8h' },
    'Puducherry': { g: 132, rr: '94%', resp: '12h' },
    'Dadra and Nagar Haveli and Daman and Diu': { g: 121, rr: '92%', resp: '14h' },
    'Lakshadweep': { g: 98, rr: '98%', resp: '6h' },
    'Andaman and Nicobar Islands': { g: 112, rr: '95%', resp: '10h' },
    'default': { g: 3102, rr: '91%', resp: '14h' }
};

const DC = ['#00E5A0', '#5C8EFF', '#FFB800', '#FF5500', '#FF3B3B'];
const LEVEL_LABELS = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const MapOverlays = memo(() => (
    <></>
));

const getRiskBorderColor = (pred) => {
    if (!pred) return '#06b6d4'; // default = safe blue
    switch (pred.probabilityLabel) {
        case 'CRITICAL': return '#ef4444'; // red
        case 'HIGH': return '#f97316'; // orange
        case 'MEDIUM': return '#eab308'; // yellow
        case 'LOW': return '#06b6d4'; // cyan blue
        default: return '#06b6d4';
    }
};

const StateBaseLayer = memo(({ geoData, clickedStateName, hoveredLegendLevel, onHoverState, onClickState, bootPhase, sageMakerLevels, predictionMap }) => {
    const hasClick = clickedStateName !== null;
    const hasLegendHover = hoveredLegendLevel !== null;

    return (
        <g className={`map-geographies ${hasClick ? 'has-click' : ''} ${hasLegendHover ? 'has-legend-hover' : ''}`}>
            <Geographies geography={geoData}>
                {({ geographies }) => {
                    const groups = [[], [], [], [], []];
                    geographies.forEach(geo => {
                        const rawName = geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.name || geo.properties.state_name || '';
                        const name = geo.properties._normalizedName || normalizeStateName(rawName);
                        const level = sageMakerLevels[name] !== undefined ? sageMakerLevels[name] : (STATE_DISTRESS_FALLBACK[name] ?? 1);
                        groups[level].push({ geo, name, level, rawName });
                    });

                    return groups.map((geos, level) => (
                        <g key={level} className={`state-breathe-${level}`}>
                            {geos.map(({ geo, name, rawName }) => {
                                const isClicked = clickedStateName === name;
                                const isLegendPulsed = hoveredLegendLevel === level;
                                const isBoot = bootPhase === 'building';
                                const pred = predictionMap[name];
                                const riskColor = getRiskBorderColor(pred);

                                console.log('SVG state name:', rawName, '→ normalized:', name, '→ risk:', pred?.probabilityLabel);

                                let fillVal = riskColor + '1a'; // Subtle tint (10% opacity)
                                if (isBoot) {
                                    fillVal = 'transparent';
                                } else if (hasClick && isClicked) {
                                    fillVal = riskColor + '40';
                                } else if (hasClick && !isClicked) {
                                    fillVal = riskColor + '10';
                                }

                                const strokeColor = isLegendPulsed ? '#FFFFFF' : riskColor;
                                const strokeWidth = isClicked ? 2.5 : 2;

                                const delaySecs = (geoData.delayMap && geoData.delayMap[name]) || 0;
                                const pathStyle = isBoot ? { strokeDasharray: 1000, strokeDashoffset: 1000, animation: `drawState 0.6s ease-out forwards`, animationDelay: `${delaySecs}s` } : {};
                                const fillStyle = isBoot ? { opacity: 0, animation: `bootFadeIn 0.6s ease forwards`, animationDelay: `${delaySecs + 0.8}s` } : {};

                                return (
                                    <g key={geo.rsmKey || name}
                                        className={`state-layer-group ${isClicked ? 'is-clicked' : ''} ${isLegendPulsed ? 'is-legend-pulsed' : ''}`}
                                        style={{
                                            ...(isClicked ? { '--ac': riskColor } : {}),
                                            opacity: (hasClick && !isClicked) ? 0.4 : 1,
                                            transition: 'opacity 0.4s ease',
                                            ...fillStyle
                                        }}>
                                        <Geography
                                            geography={geo}
                                            onMouseEnter={() => !hasClick && onHoverState(name)}
                                            onMouseLeave={() => !hasClick && onHoverState(null)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClickState({ name, level, coords: geo.properties._centroid, geoPath: geo });
                                            }}
                                            style={{
                                                default: { fill: fillVal, stroke: strokeColor, strokeWidth, strokeOpacity: 1, outline: 'none', cursor: 'pointer', ...pathStyle },
                                                hover: { fill: isClicked ? fillVal : riskColor + '30', stroke: '#FFFFFF', strokeWidth: 2, strokeOpacity: 1, outline: 'none', cursor: 'pointer', ...pathStyle },
                                                pressed: { outline: 'none', ...pathStyle },
                                            }}
                                            className="state-geo-path"
                                        >
                                            <title>{name}</title>
                                        </Geography>
                                    </g>
                                );
                            })}
                        </g>
                    ));
                }}
            </Geographies>
        </g>
    );
});



function IndiaMap({ onPulse, hoveredLegendLevel, activeFilterLevel, onReady, onPredictionsLoaded }) {
    const [geoData, setGeoData] = useState(globalGeoCache);
    const [bootPhase, setBootPhase] = useState('loading');
    const [isFading, setIsFading] = useState(false);
    const [bootProgress, setBootProgress] = useState(0);
    const [bootText, setBootText] = useState('ESTABLISHING SECURE LINK...');

    const [clickedState, setClickedState] = useState(null);
    const [isClosingClick, setIsClosingClick] = useState(false);

    // SageMaker state
    const [sageMakerLevels, setSageMakerLevels] = useState({});
    const [publicPredictions, setPublicPredictions] = useState([]);
    const predictionMapRef = useRef({});

    // Fetch public predictions on mount
    useEffect(() => {
        const loadPredictions = async () => {
            try {
                const res = await apiGetPublicPredictions();
                if (res.success && Array.isArray(res.data)) {
                    setPublicPredictions(res.data);
                    // Build dynamic distress level map and cache map from SageMaker predictions
                    const levelMap = {};
                    const map = {};
                    res.data.forEach(pred => {
                        const normalizedName = normalizeStateName(pred.state);
                        map[normalizedName] = pred;
                        const level = RISK_TO_LEVEL[pred.riskLevel] || 1;
                        // Use highest level for that state
                        if (!levelMap[normalizedName] || level > levelMap[normalizedName]) {
                            levelMap[normalizedName] = level;
                        }
                    });
                    predictionMapRef.current = map;
                    setSageMakerLevels(levelMap);

                    console.log('Prediction map keys:', Object.keys(predictionMapRef.current));
                    console.log('Tamil Nadu pred:', predictionMapRef.current['Tamil Nadu']);
                    console.log('Kerala pred:', predictionMapRef.current['Kerala']);

                    // Notify parent about predictions (for ticker)
                    if (onPredictionsLoaded) onPredictionsLoaded(res.data, res.poweredBy);
                }
            } catch (err) {
                console.warn('[IndiaMap] Could not load API predictions:', err.message);
            }
        };
        loadPredictions();
    }, [onPredictionsLoaded]);

    // Document click to close details
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!clickedState || isClosingClick) return;
            if (!e.target.closest('.state-geo-path') && !e.target.closest('.detail-card-overlay')) {
                setIsClosingClick(true);
                setTimeout(() => {
                    setClickedState(null);
                    setIsClosingClick(false);
                }, 300);
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
                        const { type, data } = e.data;
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
                    setBootPhase('building');
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

    const handleHoverState = useCallback(() => { }, []);

    const handleClickState = useCallback(async (stateData) => {
        if (isClosingClick) return;
        setClickedState(stateData);
        // Instant panel open using cached predictionMapRef.current[stateData.name]
    }, [isClosingClick]);

    const hasClick = clickedState !== null;

    const getPreSevaIntelText = (prediction) => {
        if (!prediction) return 'All systems normal. Routine monitoring in place.';
        const { category, confidence, riskLevel } = prediction;
        const conf = confidence || '50%';
        switch (riskLevel) {
            case 'CRITICAL':
                return `${category} · ${conf} confidence. Immediate intervention required. Deploy emergency response.`;
            case 'HIGH':
                return `${category} · ${conf} confidence. Elevated risk detected. Priority dispatch recommended.`;
            case 'MEDIUM':
                return `${category} · ${conf} confidence. Moderate risk. Schedule preventive inspection.`;
            case 'LOW':
            default:
                return `${category} · ${conf} confidence. Situation stable. Routine monitoring in place.`;
        }
    };

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
                                <stop offset="0%" stopColor="#FF3B3B" stopOpacity="0.05" />
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
                            sageMakerLevels={sageMakerLevels}
                            predictionMap={predictionMapRef.current}
                        />

                        <MapOverlays />
                    </ComposableMap>

                    {/* DOM Element HUD — LEFT PANEL */}
                    {hasClick && (() => {
                        const mockData = STATE_MOCK_DATA[clickedState.name] || STATE_MOCK_DATA['default'];
                        const pred = predictionMapRef.current[clickedState.name];
                        const activeColor = getRiskBorderColor(pred);
                        // AI Prediction details
                        const riskLevelLabel = pred ? pred.riskLevel : 'LOW';
                        const aiCategory = pred ? pred.category : 'No active threats detected';
                        const aiConfidence = pred ? `${pred.confidence} Confidence Level` : 'Monitoring active';

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
                                                {riskLevelLabel}
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
                                            {pred ? (pred.citizensAtRisk || mockData.g).toLocaleString() : mockData.g.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="hud-ai-analysis" style={{ borderLeft: `2px solid ${activeColor}` }}>
                                        <div className="hud-ai-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            AI PREDICTION
                                        </div>
                                        <div className="hud-ai-value">{aiCategory}</div>
                                        <div className="hud-ai-conf" style={{ color: activeColor }}>{aiConfidence}</div>
                                    </div>

                                    <div className="hud-scanner"></div>
                                </div>
                            </div>
                        )
                    })()}

                    {/* DOM Element HUD — RIGHT PANEL */}
                    {hasClick && (() => {
                        const mockData = STATE_MOCK_DATA[clickedState.name] || STATE_MOCK_DATA['default'];
                        const pred = predictionMapRef.current[clickedState.name];
                        const activeColor = getRiskBorderColor(pred);

                        const riskLevelLabel = pred ? pred.riskLevel : 'LOW';
                        const topCategory = pred ? pred.category : 'General';
                        const topConfidence = pred ? pred.confidence : 'N/A';
                        const intelText = getPreSevaIntelText(pred);

                        return (
                            <div className={`detail-card-overlay ${isClosingClick ? 'slide-out' : 'slide-in'}`}>
                                <div className="dco-top">
                                    <div className="dco-title">
                                        <div className="dco-dot" style={{ background: activeColor }} />
                                        {clickedState.name} Intelligence
                                    </div>
                                    <button className="dco-close" onClick={() => setIsClosingClick(true)}>×</button>
                                </div>

                                <div className="dco-div" />

                                <div className="dco-status">
                                    <span>STATUS</span>
                                    <div style={{ color: activeColor }}>{riskLevelLabel}</div>
                                </div>

                                <div className="dco-grid">
                                    <div className="dco-box">
                                        <label>GRIEVANCES</label>
                                        <span style={{ color: '#FFB800' }}>{pred ? (pred.citizensAtRisk || mockData.g).toLocaleString() : mockData.g.toLocaleString()}</span>
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
                                        <label>AI CONFIDENCE</label>
                                        <span style={{ color: activeColor }}>{topConfidence}</span>
                                    </div>
                                </div>

                                <div className="dco-cats">
                                    <label>CRITICAL CATEGORIES</label>
                                    <div className="dco-pills">
                                        <span>{topCategory}</span>
                                        <span>Infrastructure</span>
                                    </div>
                                </div>

                                <div className="dco-intel">
                                    <div className="dco-intel-tl">
                                        ⚡ PRESEVA INTEL
                                    </div>
                                    <div className="dco-intel-tx">
                                        {intelText}
                                    </div>
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
