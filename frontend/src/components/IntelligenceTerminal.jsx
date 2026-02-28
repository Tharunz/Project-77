import React, { useState, useEffect, useRef } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import './IntelligenceTerminal.css';
import TerminalViz from './TerminalViz';

const MODULES_DATA = [
    {
        id: 'M-01',
        name: 'PreSeva Prevention',
        color: '#A78BFA',
        desc: 'The world\'s first proactive public service failure prediction system. AI analyzes millions of historical grievances to predict failures 48-72hrs before they happen and alerts departments preemptively.',
        badge: 'WORLD FIRST',
        badgeColor: 'violet',
        impactVal: '48-72 hrs',
        impactCtx: 'early warning lead time',
        awsSvc: 'Amazon SageMaker',
        vizType: 'preseva'
    },
    {
        id: 'M-02',
        name: 'Distress Index',
        color: '#F43F5E',
        desc: 'Real-time per-state citizen suffering score (0-100). Like a stock market index for governance accountability. Live national scoreboard with state rankings and trend arrows.',
        badge: 'LIVE',
        badgeColor: 'cyan',
        impactVal: '247',
        impactCtx: 'regional states monitored',
        awsSvc: 'Amazon Kinesis Data Analytics',
        vizType: 'distress'
    },
    {
        id: 'M-03',
        name: 'AI Chatbot',
        color: '#10B981',
        desc: 'Interact with government services instantly through automated dialogue and voice interaction, removing language barriers and simplifying application processes.',
        badge: 'AI-POWERED',
        badgeColor: 'cyan',
        impactVal: '22',
        impactCtx: 'Indian languages supported natively',
        awsSvc: 'Amazon Lex & Polly',
        vizType: 'chat'
    },
    {
        id: 'M-04',
        name: 'Grievance Engine',
        color: '#3B82F6',
        desc: 'A seamless filing, tracking, and resolution engine that replaces outdated forms with a real-time tracking kanban board for clear line of sight.',
        badge: null,
        impactVal: '100%',
        impactCtx: 'digital tracking adoption',
        awsSvc: 'Amazon DynamoDB',
        vizType: 'kanban'
    },
    {
        id: 'M-05',
        name: 'Benefit Roadmap',
        color: '#F59E0B',
        desc: 'AI generates a personalized 30-day action plan with massive unlockable benefits formatted along a citizen\'s life stages and changing needs.',
        badge: 'PERSONAL',
        badgeColor: 'cyan',
        impactVal: '₹48,000+',
        impactCtx: 'avg unlocked benefit value',
        awsSvc: 'Amazon Personalize',
        vizType: 'roadmap'
    },
    {
        id: 'M-06',
        name: 'Officer SLA Tracker',
        color: '#EF4444',
        desc: 'Public officer performance leaderboard with countdown timers. Breach SLA = auto-escalation. Unparalleled transparent officer accountability.',
        badge: 'ACCOUNTABILITY',
        badgeColor: 'violet',
        impactVal: '99.4%',
        impactCtx: 'SLA compliance enforced',
        awsSvc: 'AWS Lambda (CRON)',
        vizType: 'sla'
    },
    {
        id: 'M-07',
        name: 'JanConnect',
        color: '#EC4899',
        desc: 'Peer-to-peer Q&A community with AI moderation and official government officer responses. Upvotes, verified badges, and localized language support.',
        badge: null,
        impactVal: '2.5M+',
        impactCtx: 'active citizens connected',
        awsSvc: 'Amazon OpenSearch',
        vizType: 'janconnect'
    },
    {
        id: 'M-08',
        name: 'Fraud Detection',
        color: '#22C55E',
        desc: 'Real-time monitoring stream analyzing scheme applications and grievance filings for anomalous bot behavior, duplicated identities, or syndicate activity.',
        badge: 'AI-POWERED',
        badgeColor: 'cyan',
        impactVal: '847',
        impactCtx: 'frauds blocked daily average',
        awsSvc: 'Amazon Fraud Detector',
        vizType: 'fraud'
    },
    {
        id: 'M-09',
        name: 'Grievance DNA',
        color: '#8B5CF6',
        desc: 'Every complaint is assigned a unique topological map mapping its relation to historic grievances based on severity, emotion, location, and department.',
        badge: 'INNOVATION',
        badgeColor: 'violet',
        impactVal: 'DNA-Level',
        impactCtx: 'pattern matching accuracy',
        awsSvc: 'Amazon Neptune',
        vizType: 'dna'
    },
    {
        id: 'M-10',
        name: 'Benefit Gap Calculator',
        color: '#F97316',
        desc: 'Dynamically computes the monetary deficit between a citizen\'s currently claimed schemes and what their profile is legally entitled to receive.',
        badge: null,
        impactVal: '₹4,200',
        impactCtx: 'monthly missing average uncovered',
        awsSvc: 'AWS Step Functions',
        vizType: 'gap'
    },
    {
        id: 'M-11',
        name: 'Officer Accountability Wall',
        color: '#0EA5E9',
        desc: 'A live tracking system establishing a competitive podium for officers resolving grievances, driven by speed and citizen satisfaction metrics.',
        badge: null,
        impactVal: '+40%',
        impactCtx: 'increase in resolution speed',
        awsSvc: 'Amazon RDS',
        vizType: 'podium'
    },
    {
        id: 'M-12',
        name: 'Grievance Weather',
        color: '#38BDF8',
        desc: '7-day predictive forecast anticipating volume surges in complaints for specific districts, allowing preemptive resource allocation.',
        badge: null,
        impactVal: '7-Day',
        impactCtx: 'forecast horizon window',
        awsSvc: 'Amazon Forecast',
        vizType: 'weather'
    },
    {
        id: 'M-13',
        name: 'Mass Petition Engine',
        color: '#D946EF',
        desc: 'A coordinated engine allowing local grievances to rapidly consolidate into mass petitions that auto-escalate directly to ministry level when thresholds hit.',
        badge: null,
        impactVal: '10,000',
        impactCtx: 'citizen signatures to auto-escalate',
        awsSvc: 'Amazon SQS',
        vizType: 'petition'
    },
    {
        id: 'M-14',
        name: 'Jan Shakti Score',
        color: '#14B8A6',
        desc: 'A gamified citizen impact rating dynamically built across scheme participation, grievance helpfulness, and community engagement.',
        badge: 'GAMIFIED',
        badgeColor: 'violet',
        impactVal: 'Level 4',
        impactCtx: 'average active citizen tier',
        awsSvc: 'Amazon DynamoDB',
        vizType: 'shakti'
    },
    {
        id: 'M-15',
        name: 'Scheme Time Machine',
        color: '#EAB308',
        desc: 'Analyzes citizen history to retroactively identify benefits they missed claiming in past years, calculating total historical opportunity lost.',
        badge: null,
        impactVal: '₹87K+',
        impactCtx: 'historical average missed per family',
        awsSvc: 'Amazon Redshift',
        vizType: 'timemachine'
    },
    {
        id: 'M-16',
        name: 'Whisper Mode',
        color: '#8899AA',
        desc: 'Highly secure, anonymized reporting pipeline for severe corruption. Uses military-grade encryption and obfuscates identifying metadata before delivery.',
        badge: null,
        impactVal: 'AES-256',
        impactCtx: 'end-to-end encryption standard',
        awsSvc: 'AWS KMS',
        vizType: 'whisper'
    },
    {
        id: 'M-17',
        name: 'Resolution Replay',
        color: '#10B981',
        desc: 'Full transparency tracker providing a minute-by-minute playback of a grievance\'s lifecycle from filing through investigation and resolution.',
        badge: null,
        impactVal: '100%',
        impactCtx: 'process transparency achieved',
        awsSvc: 'Amazon EventBridge',
        vizType: 'replay'
    },
    {
        id: 'M-18',
        name: 'Impact Rupee Counter',
        color: '#F43F5E',
        desc: 'A live tracking metric calculating the exact aggregate monetary value delivered to citizens across the platform through verified schemes.',
        badge: null,
        impactVal: '₹2.4 Cr+',
        impactCtx: 'delivered in current month',
        awsSvc: 'Amazon EC2',
        vizType: 'rupee'
    },
    {
        id: 'M-19',
        name: 'Seva Mirror',
        color: '#3B82F6',
        desc: 'A dynamic, interconnected graph showing exactly how the government views your aggregate citizen footprint—schemes, family context, and interactions.',
        badge: 'PROFILE',
        badgeColor: 'cyan',
        impactVal: '360°',
        impactCtx: 'unified citizen schema view',
        awsSvc: 'Amazon Neptune',
        vizType: 'mirror'
    },
    {
        id: 'M-20',
        name: 'Predict My Future',
        color: '#8B5CF6',
        desc: 'Forecasts scheme eligibility based on approaching life milestones like incoming children, graduation, or retirement ages before they occur.',
        badge: 'PREDICTIVE',
        badgeColor: 'violet',
        impactVal: '5 Years',
        impactCtx: 'rolling future forecast projection',
        awsSvc: 'Amazon SageMaker',
        vizType: 'future'
    },
    {
        id: 'M-21',
        name: 'Threat Corridors',
        color: '#FF5500',
        desc: 'Maps the systemic ripple effects of public failures across state lines. Predicts how a water shortage in UP will strain hospitals in Bihar.',
        badge: 'WORLD FIRST',
        badgeColor: 'violet',
        impactVal: '78%',
        impactCtx: 'cross-border contagion risk accuracy',
        awsSvc: 'AWS Step Functions',
        vizType: 'corridors'
    },
    // Adding the rest of 33 to fill the list, though only 21 have unique visuals described.
    ...Array.from({ length: 12 }).map((_, i) => ({
        id: `M-${i + 22}`,
        name: `Auxiliary System 0${i + 1}`,
        desc: 'Running background intelligence routines for data coherence and load balancing.',
        badge: null, impactVal: 'N/A', impactCtx: 'Support System', awsSvc: 'AWS Core', vizType: 'default'
    }))
];

export default function IntelligenceTerminal() {
    const [selectedId, setSelectedId] = useState(MODULES_DATA[0].id);
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef(null);

    const activeMod = MODULES_DATA.find(m => m.id === selectedId) || MODULES_DATA[0];

    useEffect(() => {
        if (!sectionRef.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [cardStyle, setCardStyle] = useState({ transform: 'rotateX(0deg) rotateY(0deg)', transition: 'none' });

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
        setCardStyle(prev => ({ ...prev, transition: 'none' }));
    }

    const onTouchMove = (e) => {
        const cx = e.targetTouches[0].clientX;
        const cy = e.targetTouches[0].clientY;
        setTouchEnd(cx);

        if (touchStart) {
            // Calculate a 3D tilt based on swipe distance
            const dx = cx - touchStart.x;
            const dy = cy - touchStart.y;
            // Cap the rotation to max 15 degrees
            const rotateY = Math.max(-15, Math.min(15, dx * 0.1));
            const rotateX = Math.max(-15, Math.min(15, -dy * 0.1));

            setCardStyle({
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'none'
            });
        }
    }

    const currentIdx = MODULES_DATA.findIndex(m => m.id === selectedId);

    const handleNext = () => setSelectedId(MODULES_DATA[(currentIdx + 1) % 21].id);
    const handlePrev = () => setSelectedId(MODULES_DATA[currentIdx === 0 ? 20 : currentIdx - 1].id);

    // Auto-scroll functionality
    useEffect(() => {
        if (!visible) return; // Only auto-scroll when the section is visible

        const autoScrollTimer = setInterval(() => {
            handleNext();
        }, 4000); // 4 seconds per slide

        return () => clearInterval(autoScrollTimer);
    }, [visible, currentIdx]);

    const onTouchEnd = () => {
        // Snap the card back to flat immediately with a smooth spring transition
        setCardStyle({ transform: 'rotateX(0deg) rotateY(0deg)', transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' });

        if (!touchStart || !touchEnd) return;
        const distance = touchStart.x - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();
    }

    return (
        <section className="it-terminal-section" ref={sectionRef}>
            <div className={`it-term-header-container ${visible ? 'visible' : ''}`}>
                <div className="it-th-left">
                    <div className="it-th-tag">// SYSTEM MODULES</div>
                    <h2 className="it-th-title">33 Active Capabilities.</h2>
                    <h2 className="it-th-title highlight">Zero Competition.<span className="it-cursor" /></h2>
                </div>
                <div className="it-th-right">
                    <div className="it-th-status">
                        <div className="it-th-dot" />
                        ALL SYSTEMS OPERATIONAL
                    </div>
                    <div className="it-th-audit">Last verified: just now</div>
                </div>
            </div>

            <div className={`it-terminal desktop-only ${visible ? 'visible' : ''}`}>
                <div className="it-col-left">
                    <div className="it-left-header">
                        <span className="it-lh-title">// SYSTEM PROCESSES</span>
                        <span className="it-lh-count">33 active</span>
                    </div>
                    <div className="it-process-list">
                        {MODULES_DATA.map((mod) => (
                            <div
                                key={mod.id}
                                className={`it-process-row ${mod.id === selectedId ? 'active' : ''}`}
                                style={{ '--accent': mod.color }}
                                onClick={() => setSelectedId(mod.id)}
                            >
                                <div className="it-pr-dot" />
                                <div className="it-pr-id">{mod.id}</div>
                                <div className="it-pr-name">{mod.name}</div>
                                <div className="it-pr-dots">
                                    <span /><span /><span /><span /><span />
                                </div>
                                <div className="it-pr-status">ACTIVE</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="it-term-divider" />

                <div className="it-col-right" style={{ '--accent': activeMod.color }}>
                    <div className="it-zone-a">
                        <div className="it-za-left">
                            PROCESS / [{activeMod.id}] / {activeMod.name}
                        </div>
                        <div className="it-za-right">
                            <div className="it-za-pulse" />
                            RUNNING
                        </div>
                    </div>

                    <div className="it-zone-b">
                        {MODULES_DATA.map((mod) => (
                            <div
                                key={mod.id}
                                className={`it-viz-layer ${mod.id === selectedId ? 'active' : ''}`}
                            >
                                <TerminalViz vizType={mod.vizType} color={mod.color} />
                            </div>
                        ))}
                    </div>

                    <div className="it-zone-c">
                        <div className="it-zc-col1">
                            <h3 className="it-zc-title">
                                {activeMod.name}
                                {activeMod.badge && (
                                    <span className={`it-zc-badge ${activeMod.badgeColor}`}>
                                        {activeMod.badge}
                                    </span>
                                )}
                            </h3>
                            <p className="it-zc-desc">{activeMod.desc}</p>
                        </div>
                        <div className="it-zc-col2">
                            <div className="it-zc-label">IMPACT</div>
                            <div className="it-zc-val">{activeMod.impactVal}</div>
                            <div className="it-zc-ctx">{activeMod.impactCtx}</div>
                        </div>
                        <div className="it-zc-col3">
                            <div className="it-zc-label">POWERED BY</div>
                            <div className="it-zc-aws">{activeMod.awsSvc}</div>
                            <div className="it-zc-aws-logo">AWS</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Exclusive Capabilities UI */}
            <div className={`mobile-capabilities-ui mobile-only ${visible ? 'visible' : ''}`}>
                <div className="mc-particles">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div
                            key={i}
                            className="mc-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${Math.random() * 4 + 3}s`,
                                background: Math.random() > 0.5 ? '#00E5A0' : '#FF6B2C',
                                boxShadow: `0 0 12px ${Math.random() > 0.5 ? '#00E5A0' : '#FF6B2C'}`,
                                opacity: Math.random() * 0.5 + 0.3
                            }}
                        />
                    ))}
                </div>

                <div className="mc-holo-deck">
                    <div
                        className="mc-holo-card"
                        key={activeMod.id}
                        style={{ '--accent': activeMod.color, transform: cardStyle.transform, transition: cardStyle.transition }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="mc-scanline-fx" />
                        <div className="mc-card-header">
                            <span className="mc-card-id">[{activeMod.id}]</span>
                            <span className="mc-card-status">
                                <div className="it-za-pulse" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle', width: 6, height: 6 }} />
                                ACTIVE
                            </span>
                        </div>
                        <h3 className="mc-card-title">
                            {activeMod.name}
                            {activeMod.badge && <span className="mc-card-badge" style={{ color: activeMod.color, borderColor: activeMod.color }}>{activeMod.badge}</span>}
                        </h3>
                        <p className="mc-card-desc">{activeMod.desc}</p>
                        <div className="mc-card-stats">
                            <div className="mc-stat" style={{ flex: 1 }}>
                                <span className="mc-stat-lbl">IMPACT</span>
                                <span className="mc-stat-val">{activeMod.impactVal}</span>
                                <span className="mc-stat-ctx">{activeMod.impactCtx}</span>
                            </div>
                            <div className="mc-stat" style={{ flex: 1 }}>
                                <span className="mc-stat-lbl">POWERED BY</span>
                                <span className="mc-stat-aws">{activeMod.awsSvc}</span>
                                <span className="mc-stat-ctx">AWS Architecture</span>
                            </div>
                        </div>
                    </div>

                    <div className="mc-controls">
                        <button className="mc-btn" onClick={handlePrev}>
                            <MdKeyboardArrowLeft size={28} />
                        </button>

                        <div className="mc-tracker">
                            <div className="mc-tracker-text">
                                SYS.MOD // {currentIdx + 1 < 10 ? '0' + (currentIdx + 1) : currentIdx + 1}<span>/21</span>
                            </div>
                            <div className="mc-tracker-bar">
                                <div className="mc-tracker-fill" style={{ width: `${((currentIdx + 1) / 21) * 100}%` }} />
                            </div>
                        </div>

                        <button className="mc-btn" onClick={handleNext}>
                            <MdKeyboardArrowRight size={28} />
                        </button>
                    </div>

                    <div className="mc-dot-matrix">
                        {MODULES_DATA.slice(0, 21).map((m) => (
                            <div
                                key={m.id}
                                className={`mc-micro-dot ${m.id === activeMod.id ? 'active' : ''}`}
                                onClick={() => setSelectedId(m.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
