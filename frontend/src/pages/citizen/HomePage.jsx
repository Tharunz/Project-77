import React, { useEffect, useRef, useState, Suspense, lazy, useCallback, memo, useMemo } from 'react';
import { apiGetPublicPredictions } from '../../services/api.service';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdShield, MdDashboard, MdPerson } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import IntelligenceTerminal from '../../components/IntelligenceTerminal';
import HowItWorksBriefing from '../../components/HowItWorksBriefing';
import MobileParticles from '../../components/MobileParticles';
import QuantumHeroBg from '../../components/QuantumHeroBg';
import DesktopParticles from '../../components/DesktopParticles';
import { PROJECT_NAME } from '../../config/constants';
import './HomePage.css';

const IndiaMap = lazy(() => import('../../components/IndiaMap'));

/* ── Page data ── */
const DEFAULT_ALERTS = [
    '⚡ PreSeva Alert · Water Supply Failure predicted · Bihar · 91% confidence · Dept. Alerted',
    '✓ Resolved · 2.3L citizens received PM Kisan benefits in Rajasthan · Avg time: 1.8 days',
    '⚡ PreSeva Alert · Healthcare Gap predicted · Madhya Pradesh · 84% · Health Dept. Alerted',
    '📊 Grievance #GRV-8847 resolved in 1.2 days · SLA met 3.8 days early',
    '⚡ PreSeva Alert · Infrastructure Risk predicted · Odisha · 78% · PWD Alerted',
    '✓ 43 Problems Prevented This Month · 8,743 Citizens Never Faced a Service Failure',
];
const DEFAULT_PREDS = [
    { prob: 91, title: 'Water Supply Failure', sub: 'Bihar · 48 hrs', status: 'Dept. Alerted', sc: '#FFB800' },
    { prob: 84, title: 'Healthcare Gap', sub: 'Madhya Pradesh · 48 hrs', status: 'Under Review', sc: '#5C8EFF' },
    { prob: 78, title: 'Infrastructure Risk', sub: 'Odisha · 48 hrs', status: 'Monitoring', sc: '#00E5A0' },
];

/* ── Hooks ── */
function useCounter(target, dur = 2200) {
    const [v, setV] = useState(0); const ref = useRef(); const fired = useRef(false);
    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !fired.current) {
                fired.current = true;
                const t0 = performance.now();
                const tick = (now) => { const p = Math.min((now - t0) / dur, 1); setV(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(tick); };
                requestAnimationFrame(tick);
            }
        }, { threshold: .4 });
        obs.observe(ref.current); return () => obs.disconnect();
    }, [target, dur]);
    return [v, ref];
}
function useSR() {
    const ref = useRef();
    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { ref.current.classList.add('in'); obs.unobserve(ref.current); }
        }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
        obs.observe(ref.current); return () => obs.disconnect();
    }, []);
    return ref;
}
function Ring({ prob, color }) {
    const r = 22, circ = 2 * Math.PI * r;
    return (<div className="it-pred-ring"><svg viewBox="0 0 56 56"><circle className="ring-bg" cx="28" cy="28" r={r} fill="none" strokeWidth="3" /><circle className="ring-fill" cx="28" cy="28" r={r} fill="none" strokeWidth="3" stroke={color} strokeDasharray={`${circ * prob / 100} ${circ}`} /></svg><div className="it-pred-pct">{prob}%</div></div>);
}
const Chakra = ({ size = 28 }) => (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="rgba(255,85,0,.1)" /><circle cx="20" cy="20" r="11.5" stroke="#FF5500" strokeWidth="1.8" fill="none" /><circle cx="20" cy="20" r="2.8" fill="#FF5500" />{Array.from({ length: 24 }).map((_, i) => <line key={i} x1="20" y1="9.5" x2="20" y2="12.5" stroke="#FF5500" strokeWidth="1.1" strokeLinecap="round" transform={`rotate(${i * 15} 20 20)`} />)}</svg>);


const TickerItem = memo(({ text, isNew }) => (
    <span className="ticker-item" style={{ animation: isNew ? 'slideInNew 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}>
        {text}
    </span>
));

const ItNav = memo(() => {
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();
    const isCitizen = user?.role === 'citizen';

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 32);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <nav className={`it-nav ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="it-logo"><Chakra size={26} /> Project<strong> NCIE</strong><div className="it-live"><div className="it-live-dot" /> LIVE</div></Link>
            <div className="it-nav-links">
                <a href="#preseva" className="it-nav-a">PreSeva</a>
                <a href="#caps" className="it-nav-a">Seva Modules</a>
                <a href="#how" className="it-nav-a">System Protocol</a>
                <div className="it-sep" />
                {isCitizen ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,107,44,0.1)', borderRadius: 8, border: '1px solid rgba(255,107,44,0.25)', cursor: 'default' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--saffron),#00C896)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#fff', flexShrink: 0 }}>
                                {user.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-white)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name?.split(' ')[0]}</span>
                        </div>
                        <Link to="/citizen" className="it-solid"><MdDashboard style={{ marginRight: 4 }} /> My Dashboard</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="it-ghost">Citizen Login</Link>
                        <Link to="/register" className="it-solid">Access Portal <MdArrowForward /></Link>
                    </>
                )}
            </div>
        </nav>
    );
});

export default function HomePage() {
    const [vC, rC] = useCounter(142, 2400); const [vS, rS] = useCounter(500, 1900);
    const [vL, rL] = useCounter(22, 1600); const [vA, rA] = useCounter(91, 2100);
    const sr1 = useSR(), sr2 = useSR(), sr3 = useSR(), sr4 = useSR(), sr5 = useSR();
    const [tickerQueue, setTickerQueue] = useState(DEFAULT_ALERTS);
    const [hoveredLegend, setHoveredLegend] = useState(null);
    const [activeLegendFilter, setActiveLegendFilter] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);
    const [liveGrievanceCount, setLiveGrievanceCount] = useState(247);
    const [sagePredictions, setSagePredictions] = useState(DEFAULT_PREDS);
    const [sageMakerActive, setSageMakerActive] = useState(false);

    // Fetch live SageMaker predictions for ticker and PreSeva section
    useEffect(() => {
        apiGetPublicPredictions().then(res => {
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                const isSM = res.poweredBy === 'Amazon SageMaker';
                setSageMakerActive(isSM);
                // Populate ticker with live alerts
                const liveAlerts = res.data.map(p =>
                    `⚡ PreSeva Alert · ${p.category} · ${p.state} · ${p.confidence} · Dispatch Recommended`
                );
                setTickerQueue(prev => [
                    ...liveAlerts,
                    '✓ Resolved · 2.3L citizens received PM Kisan benefits in Rajasthan · Avg time: 1.8 days',
                    '📊 Grievance #GRV-8847 resolved in 1.2 days · SLA met 3.8 days early',
                    '✓ 43 Problems Prevented This Month · 8,743 Citizens Never Faced a Service Failure',
                ]);
                // Populate PreSeva prediction cards
                const livePreds = res.data.slice(0, 3).map(p => ({
                    prob: Math.round(p.probability * 100),
                    title: `${p.category} Risk`,
                    sub: `${p.state} · ${p.predictedTimeframe || '48 hrs'}`,
                    status: p.riskLevel === 'CRITICAL' ? '🚨 Critical' : p.riskLevel === 'HIGH' ? '⚠️ High Risk' : 'Monitoring',
                    sc: p.riskLevel === 'CRITICAL' ? '#FF3B3B' : p.riskLevel === 'HIGH' ? '#FF5500' : '#FFB800'
                }));
                setSagePredictions(livePreds);
            }
        }).catch(() => { /* silent fallback */ });
    }, []);

    const handleMapReady = useCallback(() => setMapReady(true), []);

    // Called by IndiaMap when it loads its own predictions (optional enrichment)
    const handlePredictionsLoaded = useCallback((preds, poweredBy) => {
        if (poweredBy === 'Amazon SageMaker') setSageMakerActive(true);
    }, []);

    // Handle real-time map pulse events for ticker
    const handleMapPulse = useCallback((msg) => {
        setTickerQueue(prev => {
            if (prev[0] === msg) return prev;
            return [msg, ...prev].slice(0, 15);
        });
    }, []);

    // Live Kinesis Feed via SSE
    useEffect(() => {
        const eventSource = new EventSource('/api/live-feed');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                let msg = '';

                switch (data.type) {
                    case 'GRIEVANCE_FILED':
                        msg = `📊 Grievance Filed · ${data.category} · ${data.state} · Priority: ${data.priority}`;
                        break;
                    case 'FRAUD_REVIEW':
                        msg = `🛡️ Fraud Review · ${data.grievanceId} · Result: ${data.finalStatus}`;
                        break;
                    case 'USER_LOGIN':
                        msg = `👤 Access Portal · Citizen Login from ${data.state || 'India'}`;
                        break;
                    case 'PRESEVA_ANALYSIS_RUN':
                        msg = `🔮 PreSeva Active · Predicted ${data.criticalCount} Critical Anomalies`;
                        break;
                    case 'PRESEVA_PREVENTED':
                        msg = `✅ Threat Mitigated · ${data.category} · ${data.state} · Prevention Confirmed`;
                        break;
                    default:
                        msg = `⚡ Project NCIE · Real-time Operational Pulse detected`;
                }

                handleMapPulse(msg);
            } catch (err) {
                console.error('[SSE] Parse error:', err);
            }
        };

        eventSource.onerror = () => {
            console.warn('[SSE] Connection lost. Attempting reconnect...');
        };

        return () => eventSource.close();
    }, [handleMapPulse]);

    useEffect(() => {
        const t1 = setInterval(() => {
            setTimeSinceUpdate(p => {
                if (p > 12) return -1; // -1 represents the syncing state
                return p + 1;
            });
        }, 1000);
        const t2 = setInterval(() => setLiveGrievanceCount(p => p + 1), 9000);
        return () => { clearInterval(t1); clearInterval(t2); }
    }, []);

    const mapLegend = [
        { lbl: 'SAFE', c: '#06b6d4', lvl: 0 },
        { lbl: 'LOW', c: '#06b6d4', lvl: 1 },
        { lbl: 'MEDIUM', c: '#eab308', lvl: 2 },
        { lbl: 'HIGH', c: '#f97316', lvl: 3 },
        { lbl: 'CRITICAL', c: '#ef4444', lvl: 4 },
    ];

    // Memoize the ticker entries to prevent reset of animation
    const tickerContent = useMemo(() => {
        const PIXELS_PER_SECOND = 80;
        const contentWidth = tickerQueue.length * 320;
        const duration = contentWidth / PIXELS_PER_SECOND;

        return (
            <div className="ticker-inner" style={{
                animation: `ticker-scroll ${duration}s linear infinite`
            }}>
                {tickerQueue.map((a, i) => (
                    <TickerItem key={`q-${i}-${a.substring(0, 10)}`} text={a} isNew={i === 0} />
                ))}
                {tickerQueue.map((a, i) => (
                    <TickerItem key={`d-${i}-${a.substring(0, 10)}`} text={a} />
                ))}
            </div>
        );
    }, [tickerQueue]);

    return (
        <div className="it">
            {/* Ticker */}
            <div className="ticker">
                <div className="ticker-badge"><div className="ticker-badge-dot" />LIVE INTELLIGENCE</div>
                <div className="ticker-track">
                    {tickerContent}
                </div>
            </div>



            <ItNav />

            {/* Hero — Split */}
            <section className="it-hero" style={{ position: 'relative' }}>
                <QuantumHeroBg />
                <DesktopParticles />
                <MobileParticles />
                <div className="it-hero-left" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="it-hero-tag">AI-Powered Citizen Services</div>
                    <h1 className="it-title" style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                        <span style={{ color: 'white' }}>India's Voice.</span>
                        <span style={{ color: '#FF6B2C' }}>India's Power.</span>
                        <span style={{ color: '#00C896' }}>India's Platform.</span>
                    </h1>
                    <div className="hero-cinematic-desc sr ae-levitate" ref={useSR()}>
                        <div className="text-line">
                            <span className="line-content ae-laser-text" data-text="Project NCIE unifies every citizen service, predicts every">
                                Project NCIE unifies <span className="ae-flicker delay-1">every citizen service</span>, predicts every
                            </span>
                        </div>
                        <div className="text-line">
                            <span className="line-content ae-laser-text" data-text="governance failure, and holds every rupee accountable —">
                                governance failure, and holds every rupee <span className="ae-flicker delay-2">accountable</span> —
                            </span>
                        </div>
                        <div className="text-line">
                            <span className="line-content ae-laser-text" data-text="in one AWS-powered ecosystem.">
                                in one <span className="highlight-gradient ae-flicker delay-3">AWS-powered ecosystem.</span>
                            </span>
                        </div>
                    </div>

                    <div className="hero-precision-ctas sr" ref={useSR()}>
                        <Link to="/register" className="btn-precision-primary">
                            <span>Citizen Gateway</span>
                        </Link>

                        <Link to="/login" className="btn-precision-secondary">
                            <span>Department Console</span>
                            <div className="btn-underline-glow"></div>
                        </Link>
                    </div>
                </div>
                <div className="it-hero-right" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="it-map-container">
                        {/* Top Command Strip */}
                        <div className={`it-cmd-strip ${mapReady ? 'fade-in' : 'hidden'}`}>
                            <div className="it-cmd-left">
                                <Chakra size={14} />
                                <span className="it-cmd-title">INDIA DISTRESS INTELLIGENCE</span>
                                <div className="it-cmd-div" />
                                <span className="it-cmd-time">
                                    {timeSinceUpdate === -1 ? 'Syncing...' : timeSinceUpdate === 0 ? 'Updated just now' : `Updated ${timeSinceUpdate}s ago`}
                                </span>
                            </div>
                            <div className="it-cmd-right">
                                <span className="it-cmd-preseva">PRESEVA ACTIVE</span>
                                <div className="it-cmd-dot-v" />
                                <div className="it-cmd-div" />
                                <div className="it-cmd-dot-g" />
                                <span className="it-cmd-live">LIVE</span>
                            </div>
                        </div>

                        <div className={`it-map-body ${!mapReady ? 'booting' : ''}`}>
                            {/* The Holographic Map */}
                            <div className="it-map-svg-wrap">
                                <Suspense fallback={<div className="map-fallback">INITIALIZING INTELLIGENCE CORE...</div>}>
                                    <IndiaMap onPulse={handleMapPulse} hoveredLegendLevel={hoveredLegend} activeFilterLevel={activeLegendFilter} onReady={handleMapReady} onPredictionsLoaded={handlePredictionsLoaded} />
                                </Suspense>
                            </div>
                        </div>

                        {/* Bottom Status Strip */}
                        <div className={`it-status-strip ${mapReady ? 'fade-in' : 'hidden'}`}>
                            <div className="it-ss-left">
                                {mapLegend.map(item => {
                                    const isActive = activeLegendFilter === item.lvl;
                                    return (
                                        <button
                                            key={item.lbl}
                                            className={`it-ss-pill ${isActive ? 'active' : ''}`}
                                            style={{ '--pill-color': item.c, '--pill-color-rgb': item.c === '#06b6d4' ? '6,182,212' : item.c === '#00E5A0' ? '0,229,160' : item.c === '#5C8EFF' ? '92,142,255' : item.c === '#eab308' ? '234,179,8' : item.c === '#FFB800' ? '255,184,0' : item.c === '#f97316' ? '249,115,22' : item.c === '#FF5500' ? '255,85,0' : item.c === '#ef4444' ? '239,68,68' : '255,59,59' }}
                                            onMouseEnter={() => setHoveredLegend(item.lvl)}
                                            onMouseLeave={() => setHoveredLegend(null)}
                                            onClick={() => setActiveLegendFilter(isActive ? null : item.lvl)}
                                        >
                                            <div className="it-ss-dot" style={{ background: item.c }} />
                                            <span>{item.lbl}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="it-ss-right">

                                <div className="it-ss-stat"><span>36</span> STATES MONITORED</div>
                                <div className="it-ss-div" />
                                <div className="it-ss-stat"><span>{liveGrievanceCount}</span> ACTIVE GRIEVANCES</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unified Intersection Observers for Counters */}
            <div className="stats-triggers" style={{ display: 'flex', width: '100%', height: '1px', opacity: 0, pointerEvents: 'none' }}>
                <div ref={rC} style={{ flex: 1 }} />
                <div ref={rS} style={{ flex: 1 }} />
                <div ref={rL} style={{ flex: 1 }} />
                <div ref={rA} style={{ flex: 1 }} />
            </div>

            {/* Neural Data Pipeline Counters (Desktop) */}
            <div className="it-pipeline-wrapper desktop-pipeline">
                <div className="it-pipeline">
                    <div className="it-pipeline-track">
                        <div className="it-pipeline-glow"></div>
                    </div>

                    <div className="it-pipeline-nodes">
                        {/* Citizens Served */}
                        <div className="it-node" style={{ '--node-color': '#FF5500' }}>
                            <div className="it-node-val">{vC < 142 ? vC : '14.2'}Cr</div>
                            <div className="it-node-point"><div className="it-node-pulse"></div></div>
                            <div className="it-node-lbl">Citizens Served</div>
                        </div>

                        {/* Govt Schemes */}
                        <div className="it-node" style={{ '--node-color': '#A78BFA' }}>
                            <div className="it-node-val">{vS}+</div>
                            <div className="it-node-point"><div className="it-node-pulse"></div></div>
                            <div className="it-node-lbl">Govt. Schemes</div>
                        </div>

                        {/* Indian Languages */}
                        <div className="it-node" style={{ '--node-color': '#00E5A0' }}>
                            <div className="it-node-val">{vL}+</div>
                            <div className="it-node-point"><div className="it-node-pulse"></div></div>
                            <div className="it-node-lbl">Indian Languages</div>
                        </div>

                        {/* AI Accuracy */}
                        <div className="it-node" style={{ '--node-color': '#5C8EFF' }}>
                            <div className="it-node-val">{vA}%</div>
                            <div className="it-node-point"><div className="it-node-pulse"></div></div>
                            <div className="it-node-lbl">AI Accuracy</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Mobile Data Stack */}
            <div className="mobile-data-stack">
                <div className="mds-item">
                    <div className="mds-bar" style={{ background: '#FF5500', width: `${(vC / 142) * 100}%` }}></div>
                    <div className="mds-content">
                        <span className="mds-lbl">Citizens Served</span>
                        <span className="mds-val">{vC < 142 ? vC : '14.2'}Cr</span>
                    </div>
                </div>
                <div className="mds-item">
                    <div className="mds-bar" style={{ background: '#A78BFA', width: `${(vS / 500) * 100}%` }}></div>
                    <div className="mds-content">
                        <span className="mds-lbl">Govt. Schemes</span>
                        <span className="mds-val">{vS}+</span>
                    </div>
                </div>
                <div className="mds-item">
                    <div className="mds-bar" style={{ background: '#00E5A0', width: `${(vL / 22) * 100}%` }}></div>
                    <div className="mds-content">
                        <span className="mds-lbl">Indian Languages</span>
                        <span className="mds-val">{vL}+</span>
                    </div>
                </div>
                <div className="mds-item">
                    <div className="mds-bar" style={{ background: '#5C8EFF', width: `${(vA / 91) * 100}%` }}></div>
                    <div className="mds-content">
                        <span className="mds-lbl">AI Accuracy</span>
                        <span className="mds-val">{vA}%</span>
                    </div>
                </div>
            </div>

            {/* PreSeva */}
            <section id="preseva" className="it-pv">
                <div className="sr" ref={sr1}>
                    <div className="it-pv-tag"><MdShield /> PRESEVA · ACTIVE</div>
                    <h2 className="it-pv-title">What if the government<br />fixed things <em>before you complained?</em></h2>
                    <p className="it-pv-desc">
                        PreSeva is India's first predictive governance intelligence engine. Deployed on AWS, it analyzes patterns across millions of historical service records to detect systemic failures before they manifest. When a risk is identified, the responsible government department is automatically notified and given a structured response protocol. Citizens are protected. Departments are empowered. Problems are solved before they become crises. This is not reactive governance. This is governance at the speed of intelligence.
                    </p>
                    <div className="it-pv-stats">
                        <div className="it-stat-blk" style={{ borderColor: '#FF5500' }}><span className="it-stat-val" style={{ color: '#FF5500' }}>43</span><span className="it-stat-lbl">Problems Prevented</span></div>
                        <div className="it-stat-blk" style={{ borderColor: '#00E5A0' }}><span className="it-stat-val" style={{ color: '#00E5A0' }}>8,743</span><span className="it-stat-lbl">Citizens Unaffected</span></div>
                    </div>
                </div>
                <div className="it-pv-right sr" ref={sr2}>
                    {sagePredictions.map((p, i) => { const rc = p.prob > 88 ? '#FF5500' : p.prob > 80 ? '#FFB800' : '#5C8EFF'; return (<div key={i} className="it-pred"><Ring prob={p.prob} color={rc} /><div className="it-pred-info"><h4>{p.title}</h4><p>{p.sub}</p></div><span className="it-pred-badge" style={{ background: `${p.sc}18`, color: p.sc, border: `1px solid ${p.sc}30` }}>{p.status}</span></div>); })}
                </div>
            </section>

            {/* Change 3: Three Guarantees Section */}
            <section className="guarantees-section">
                <div className="sr" ref={sr3}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#334155', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>// CIVIC COMMITMENT</p>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 'clamp(2.2rem,4vw,3.2rem)', lineHeight: 1.1 }}>
                        <span style={{ color: 'white' }}>Three Promises.</span><br />
                        <span style={{ color: '#FF6B2C' }}>Backed by Technology.</span>
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.75, maxWidth: 600, marginTop: 16 }}>
                        For the first time in India's history, these are not just policy commitments. They are technically enforced guarantees — powered by AWS and impossible to bypass.
                    </p>
                </div>

                <div className="guarantees-grid">
                    <div className="guarantee-card sr" ref={useSR()} style={{ '--card-color': '#00C896', '--card-rgb': '0,200,150', transitionDelay: '0ms' }}>
                        <div className="guarantee-card-body">
                            <p className="guarantee-tag">GUARANTEE</p>
                            <div className="guarantee-number">01</div>
                            <h3 className="guarantee-title">No Complaint Goes Unresolved.</h3>
                            <p className="guarantee-desc">
                                Our AI Ghost Audit engine continuously monitors every officer action. A grievance closed without genuine resolution is automatically detected, reopened, and escalated — without any human intervention. The system enforces accountability so officials don't have to.
                            </p>
                        </div>
                        <div className="guarantee-footer">
                            <span className="aws-tag">⚡ AWS COMPREHEND + STEP FUNCTIONS</span>
                        </div>
                    </div>

                    <div className="guarantee-card sr" ref={useSR()} style={{ '--card-color': '#FF6B2C', '--card-rgb': '255,107,44', transitionDelay: '120ms' }}>
                        <div className="guarantee-card-body">
                            <p className="guarantee-tag">GUARANTEE</p>
                            <div className="guarantee-number">02</div>
                            <h3 className="guarantee-title">Every Rupee Reaches Its Destination.</h3>
                            <p className="guarantee-desc">
                                Digital Budget Escrow automatically locks allocated government funds in a verified AWS ledger. Funds are released only when citizens themselves confirm work is completed on the ground. No officer can release funds prematurely. The money is safe by design.
                            </p>
                        </div>
                        <div className="guarantee-footer">
                            <span className="aws-tag">⚡ AWS QLDB + LAMBDA + SNS</span>
                        </div>
                    </div>

                    <div className="guarantee-card sr" ref={useSR()} style={{ '--card-color': '#8B5CF6', '--card-rgb': '139,92,246', transitionDelay: '240ms' }}>
                        <div className="guarantee-card-body">
                            <p className="guarantee-tag">GUARANTEE</p>
                            <div className="guarantee-number">03</div>
                            <h3 className="guarantee-title">Problems Are Resolved Before They Begin.</h3>
                            <p className="guarantee-desc">
                                PreSeva mines patterns across millions of historical governance events to predict systemic failures up to 48 hours in advance. The responsible department is automatically alerted and resources deployed — before a single citizen is affected or files a complaint.
                            </p>
                        </div>
                        <div className="guarantee-footer">
                            <span className="aws-tag">⚡ AWS SAGEMAKER + EVENTBRIDGE + KINESIS</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <IntelligenceTerminal />

            {/* =========================================
                3. HOW {PROJECT_NAME.toUpperCase()} WORKS (OPERATION BRIEFING)
            ========================================= */}
            <HowItWorksBriefing />

            {/* CTA */}
            <section className="it-cta">
                <div className="it-cta-box sr" ref={sr5}>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900 }}>
                        <span style={{ color: 'white' }}>Project NCIE.</span><br />
                        <span style={{ color: '#FF6B2C' }}>India's Digital Governance Revolution.</span>
                    </h2>
                    <p>
                        A Digital India initiative powered by AWS.<br />
                        36 features · 500+ schemes · 22 Indian languages ·<br />
                        AI-powered prediction · Citizen-verified accountability.<br />
                        Built for every Indian. Deployed for the nation.
                    </p>
                    <div className="it-cta-btns">
                        <Link to="/register" className="it-cta-p">Citizen Access <MdArrowForward /></Link>
                        <Link to="/login" className="it-cta-s">Department Login</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="it-footer">
                <Link to="/" className="it-logo"><Chakra size={16} /> <strong>{PROJECT_NAME}</strong></Link>
                <div style={{ marginTop: 20 }}>
                    <p style={{ color: 'white', marginBottom: 4 }}>Project NCIE · India's Civic Operating System</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>A Digital India Initiative · Powered by AWS · Serving 1.4 Billion Citizens</p>
                </div>
                <p style={{ marginTop: 20, fontSize: '0.75rem', opacity: 0.5 }}>© 2026 {PROJECT_NAME}. All rights reserved.</p>
            </footer>

            <style>{`

                
                .guarantees-section {
                    padding: 100px 48px;
                    max-width: 1300px;
                    margin: 0 auto;
                }
                .guarantees-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 48px;
                    align-items: stretch; /* Ensure cards have the same height */
                }
                .guarantee-card {
                    border-radius: 16px;
                    background: rgba(var(--card-rgb), 0.03);
                    border: 1px solid rgba(var(--card-rgb), 0.1);
                    border-top: 3px solid var(--card-color);
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    transform: translateY(24px);
                    will-change: transform, opacity;
                    overflow: hidden;
                }
                .guarantee-card-body {
                    padding: 32px;
                    flex: 1; /* Pushes footer to bottom */
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .guarantee-tag {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.6rem;
                    color: #475569;
                    letter-spacing: 1px;
                }
                .guarantee-number {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 900;
                    font-size: 2.8rem;
                    color: var(--card-color);
                    margin-bottom: -5px;
                    line-height: 1;
                }
                .guarantee-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 1.2rem;
                    color: white;
                }
                .guarantee-desc {
                    font-size: 0.85rem;
                    color: #94A3B8;
                    line-height: 1.7;
                    margin: 0;
                }
                .guarantee-footer {
                    background: rgba(var(--card-rgb), 0.08);
                    border-top: 1px solid rgba(var(--card-rgb), 0.12);
                    padding: 16px 32px;
                    display: flex;
                    align-items: center;
                }
                .aws-tag {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.6rem;
                    color: rgba(255,255,255,0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .guarantee-card.in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
                .guarantee-card:hover {
                    transform: translateY(-8px);
                    background: rgba(var(--card-rgb), 0.05);
                    border-color: rgba(var(--card-rgb), 0.2);
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45);
                }
                
                @media (max-width: 900px) {
                    .guarantees-grid {
                        grid-template-columns: 1fr;
                    }
                    .guarantees-section {
                        padding: 60px 24px;
                    }
                }

                /* --- Cinematic Typography Details --- */
                .hero-cinematic-desc {
                    margin-top: 48px;
                    margin-bottom: 48px;
                    max-width: 580px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    position: relative;
                    padding: 6px 0;
                }

                /* AE Animation 1: Smooth Levitation */
                .ae-levitate {
                    animation: subtleFloat 6s ease-in-out infinite alternate;
                }
                @keyframes subtleFloat {
                    0% { transform: translateY(0px); }
                    100% { transform: translateY(-8px); }
                }

                /* AE Animation 2: Typographic Pure Light Laser Sweep + Tricolor Bloom */
                .ae-laser-text {
                    position: relative;
                    display: inline-block;
                    color: transparent; /* Keep text transparent to show gradient mask */
                    background: linear-gradient(
                        100deg, 
                        #64748B 0%, 
                        #64748B 40%, 
                        #FF6B2C 48%,     /* Saffron Core */
                        #FFFFFF 50%,     /* Pure White Core */
                        #00C896 52%,     /* Green Core */
                        #64748B 60%, 
                        #64748B 100%
                    );
                    background-size: 300% 100%;
                    background-position: 100% 0;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: laserWipe 6s cubic-bezier(0.8, 0, 0.2, 1) infinite;
                    z-index: 2; /* Ensure original text is above the bloom */
                }

                /* The Synchronized Emissive Bloom (Corona) */
                .ae-laser-text::after {
                    content: attr(data-text);
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: transparent;
                    /* Same gradient as text to perfectly mirror the light source */
                    background: linear-gradient(
                        100deg, 
                        transparent 0%, 
                        transparent 40%, 
                        #FF6B2C 45%,     /* Wide Saffron Bloom */
                        #FFFFFF 50%,     /* Intense White Bloom Center */
                        #00C896 55%,     /* Wide Green Bloom */
                        transparent 60%, 
                        transparent 100%
                    );
                    background-size: 300% 100%;
                    background-position: 100% 0;
                    -webkit-background-clip: text;
                    background-clip: text;
                    /* Heavy blur to turn text shape into purely volumetric light */
                    filter: blur(12px); 
                    opacity: 0.9;
                    z-index: -1; 
                    /* Identical animation to perfectly sync with the laser passing through the text */
                    animation: laserWipe 6s cubic-bezier(0.8, 0, 0.2, 1) infinite;
                }

                /* Staggering the laser wipe line by line so light flows downwards */
                .text-line:nth-child(1) .ae-laser-text, .text-line:nth-child(1) .ae-laser-text::after { animation-delay: 0s; }
                .text-line:nth-child(2) .ae-laser-text, .text-line:nth-child(2) .ae-laser-text::after { animation-delay: 0.2s; }
                .text-line:nth-child(3) .ae-laser-text, .text-line:nth-child(3) .ae-laser-text::after { animation-delay: 0.4s; }

                @keyframes laserWipe {
                    0% { background-position: 100% 0; }
                    25% { background-position: 0% 0; }
                    100% { background-position: 0% 0; }
                }

                /* AE Animation 3: Micro-glitching */
                .ae-flicker {
                    position: relative;
                    animation: dataFlicker 3s infinite;
                }
                .ae-flicker.delay-1 { animation-delay: 0.5s; }
                .ae-flicker.delay-2 { animation-delay: 2.1s; }
                .ae-flicker.delay-3 { animation-delay: 1.4s; }

                @keyframes dataFlicker {
                    0%, 96%, 100% { opacity: 1; filter: sepia(0) hue-rotate(0deg); }
                    97% { opacity: 0.8; filter: sepia(100%) hue-rotate(340deg); }
                    98% { opacity: 1; }
                    99% { opacity: 0.5; filter: sepia(100%) hue-rotate(180deg); }
                }

                .text-line {
                    overflow: hidden; 
                    display: inline-block;
                    line-height: 1.5;
                }

                .line-content {
                    display: inline-block;
                    font-size: 1.15rem;
                    font-weight: 400;
                    color: #94A3B8;
                    letter-spacing: -0.01em;
                    transform: translateY(110%);
                    opacity: 0;
                    animation: slideUpReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .text-line:nth-child(2) .line-content { animation-delay: 0.1s; }
                .text-line:nth-child(3) .line-content { animation-delay: 0.25s; }
                .text-line:nth-child(4) .line-content { animation-delay: 0.4s; }

                @keyframes slideUpReveal {
                    0% { transform: translateY(110%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }

                .highlight-gradient {
                    font-weight: 700;
                    color: transparent;
                    background: linear-gradient(90deg, #fff 0%, #E2E8F0 50%, #94A3B8 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: shineWords 4s linear infinite;
                }
                @keyframes shineWords {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }

                /* --- Precision CTAs --- */
                .hero-precision-ctas {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    margin-top: 10px;
                    animation: ctaFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
                }
                
                @keyframes ctaFadeIn {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                /* Robust Hardware-Accelerated Primary Button */
                .btn-precision-primary {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 40px;
                    background: linear-gradient(135deg, #FF8D4A 0%, #FF5A1C 100%);
                    background-size: 200% 200%;
                    background-position: 0% 0%;
                    color: white;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 0.95rem;
                    letter-spacing: 0.04em;
                    text-decoration: none;
                    border-radius: 100px;
                    box-shadow: 0 8px 24px rgba(255, 107, 44, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                                box-shadow 0.3s ease, 
                                background-position 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                .btn-precision-primary:hover {
                    transform: translateY(-3px) scale(1.02);
                    background-position: 100% 100%;
                    box-shadow: 0 16px 40px rgba(255, 107, 44, 0.5), inset 0 2px 0 rgba(255,255,255,0.4);
                }

                /* Secondary Button (Ghost/Line style) */
                .btn-precision-secondary {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 16px;
                    color: #94A3B8;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 600;
                    font-size: 0.95rem;
                    text-decoration: none;
                    letter-spacing: 0.02em;
                    transition: color 0.3s ease;
                }

                .btn-precision-secondary:hover {
                    color: white;
                }

                .btn-underline-glow {
                    position: absolute;
                    bottom: 4px; left: 16px; right: 16px;
                    height: 1px;
                    background: rgba(92, 142, 255, 0.3);
                    box-shadow: 0 0 10px rgba(92, 142, 255, 0);
                    transition: all 0.4s ease;
                }

                .btn-precision-secondary:hover .btn-underline-glow {
                    background: rgba(92, 142, 255, 1);
                    box-shadow: 0 0 15px rgba(92, 142, 255, 0.6);
                    left: 0; right: 0; /* Expands outwards */
                }

                @media (max-width: 640px) {
                    .hero-cinematic-desc {
                        margin-top: 32px;
                        margin-bottom: 32px;
                    }
                    .text-line {
                        font-size: 1rem;
                    }
                    .hero-precision-ctas {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .btn-precision-primary {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
