import React, { useEffect, useRef, useState, Suspense, lazy, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdShield } from 'react-icons/md';
import IntelligenceTerminal from '../../components/IntelligenceTerminal';
import HowItWorksBriefing from '../../components/HowItWorksBriefing';
import MobileParticles from '../../components/MobileParticles';
import QuantumHeroBg from '../../components/QuantumHeroBg';
import { PROJECT_NAME } from '../../config/constants';
import './HomePage.css';

const IndiaMap = lazy(() => import('../../components/IndiaMap'));

/* ── Page data ── */
const ALERTS = [
    '⚡ PreSeva Alert · Water Supply Failure predicted · Muzaffarpur, Bihar · 91% confidence · Dept. Alerted',
    '✓ Resolved · 2.3L citizens received PM Kisan benefits in Rajasthan · Avg time: 1.8 days',
    '⚡ PreSeva Alert · Road maintenance failure predicted · Varanasi, UP · 84% · PWD Notified',
    '📊 Grievance #GRV-8847 resolved in 1.2 days · SLA met 3.8 days early',
    '⚡ PreSeva Alert · PHC Staffing Gap · Palamu, Jharkhand · 78% · Health Dept. Alerted',
    '✓ 43 Problems Prevented This Month · 8,743 Citizens Never Faced a Service Failure',
];
const PREDS = [
    { prob: 91, title: 'Water Supply Failure', sub: 'Muzaffarpur, Bihar · 48 hrs', status: 'Dept. Alerted', sc: '#FFB800' },
    { prob: 84, title: 'Road Collapse — NH-27', sub: 'Varanasi, UP · 4 days', status: '✓ Prevented', sc: '#00E5A0' },
    { prob: 78, title: 'PHC Doctor Gap', sub: 'Palamu, Jharkhand · 6 days', status: 'Under Review', sc: '#5C8EFF' },
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


export default function HomePage() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => { const fn = () => setScrolled(window.scrollY > 32); window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn); }, []);
    const [vC, rC] = useCounter(142, 2400); const [vS, rS] = useCounter(500, 1900);
    const [vL, rL] = useCounter(22, 1600); const [vA, rA] = useCounter(91, 2100);
    const sr1 = useSR(), sr2 = useSR(), sr3 = useSR(), sr4 = useSR(), sr5 = useSR();
    const [tickerQueue, setTickerQueue] = useState(ALERTS);
    const [hoveredLegend, setHoveredLegend] = useState(null);
    const [activeLegendFilter, setActiveLegendFilter] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);
    const [liveGrievanceCount, setLiveGrievanceCount] = useState(247);

    const handleMapReady = useCallback(() => setMapReady(true), []);

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

    const handleMapPulse = (msg) => {
        setTickerQueue(prev => [msg, ...prev].slice(0, 15));
    };

    const mapLegend = [
        { lbl: 'SAFE', c: '#00E5A0', lvl: 0 },
        { lbl: 'LOW', c: '#5C8EFF', lvl: 1 },
        { lbl: 'MEDIUM', c: '#FFB800', lvl: 2 },
        { lbl: 'HIGH', c: '#FF5500', lvl: 3 },
        { lbl: 'CRITICAL', c: '#FF3B3B', lvl: 4 },
    ];

    return (
        <div className="it">
            {/* Ticker */}
            <div className="ticker">
                <div className="ticker-badge"><div className="ticker-badge-dot" />LIVE INTELLIGENCE</div>
                <div className="ticker-track">
                    <div className="ticker-inner">
                        {tickerQueue.map((a, i) => (
                            <span key={i + '-' + a.substring(0, 8)} className="ticker-item" style={{ animation: i === 0 ? 'slideInNew 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}>{a}</span>
                        ))}
                        {/* Duplicate for infinite feel although prepending handles it mostly, let's just show the queue */}
                        {tickerQueue.map((a, i) => (
                            <span key={'dup-' + i + '-' + a.substring(0, 8)} className="ticker-item">{a}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className={`it-nav ${scrolled ? 'scrolled' : ''}`}>
                <Link to="/" className="it-logo"><Chakra size={26} /> Project<strong>-77</strong><div className="it-live"><div className="it-live-dot" /> LIVE</div></Link>
                <div className="it-nav-links">
                    <a href="#preseva" className="it-nav-a">PreSeva</a>
                    <a href="#caps" className="it-nav-a">Capabilities</a>
                    <a href="#how" className="it-nav-a">How it Works</a>
                    <div className="it-sep" />
                    <Link to="/login" className="it-ghost">Citizen Login</Link>
                    <Link to="/register" className="it-solid">Access Portal <MdArrowForward /></Link>
                </div>
            </nav>

            {/* Hero — Split */}
            <section className="it-hero" style={{ position: 'relative' }}>
                <QuantumHeroBg />
                <MobileParticles />
                <div className="it-hero-left" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="it-hero-tag">AI-Powered Citizen Services</div>
                    <h1 className="it-title">Problems<br /><span className="it-title-a">solved</span><br />before they<br /><span className="it-title-b">happen.</span></h1>
                    <p className="it-sub">{PROJECT_NAME} is an intelligent platform that predicts government service failures before citizens are affected. 500+ schemes, 22 languages, grievance tracking, officer accountability — unified.</p>
                    <div className="it-ctas">
                        <Link to="/register" className="it-cta-p">Access Citizen Portal <MdArrowForward /></Link>
                        <Link to="/login" className="it-cta-s">Officer Login →</Link>
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
                                    <IndiaMap onPulse={handleMapPulse} hoveredLegendLevel={hoveredLegend} activeFilterLevel={activeLegendFilter} onReady={handleMapReady} />
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
                                            style={{ '--pill-color': item.c, '--pill-color-rgb': item.c === '#00E5A0' ? '0,229,160' : item.c === '#5C8EFF' ? '92,142,255' : item.c === '#FFB800' ? '255,184,0' : item.c === '#FF5500' ? '255,85,0' : '255,59,59' }}
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
                    <p className="it-pv-desc">PreSeva AI mines 8M+ historical grievances to detect patterns — then <strong>alerts departments before citizens are affected</strong>, ensuring proactive governance.</p>
                    <div className="it-pv-stats">
                        <div className="it-stat-blk" style={{ borderColor: '#FF5500' }}><span className="it-stat-val" style={{ color: '#FF5500' }}>43</span><span className="it-stat-lbl">Problems Prevented</span></div>
                        <div className="it-stat-blk" style={{ borderColor: '#00E5A0' }}><span className="it-stat-val" style={{ color: '#00E5A0' }}>8,743</span><span className="it-stat-lbl">Citizens Unaffected</span></div>
                    </div>
                </div>
                <div className="it-pv-right sr" ref={sr2}>
                    {PREDS.map((p, i) => { const rc = p.prob > 88 ? '#FF5500' : p.prob > 80 ? '#FFB800' : '#5C8EFF'; return (<div key={i} className="it-pred"><Ring prob={p.prob} color={rc} /><div className="it-pred-info"><h4>{p.title}</h4><p>{p.sub}</p></div><span className="it-pred-badge" style={{ background: `${p.sc}18`, color: p.sc, border: `1px solid ${p.sc}30` }}>{p.status}</span></div>); })}
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
                    <h2>Digital Governance.<br /><span>Redefined for Bharat.</span></h2>
                    <p>500+ schemes · 22 languages · AI prevention · officer accountability · community — unified for 1.4 billion Indians.</p>
                    <div className="it-cta-btns">
                        <Link to="/register" className="it-cta-p">Citizen Access <MdArrowForward /></Link>
                        <Link to="/login" className="it-cta-s">Department Login</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="it-footer">
                <Link to="/" className="it-logo"><Chakra size={16} /> <strong>{PROJECT_NAME}</strong></Link>
                <p>India's Most Advanced Citizen Intelligence Platform · Digital India Initiative</p>
                <p>© 2026 {PROJECT_NAME}. All rights reserved.</p>
            </footer>
        </div>
    );
}
