import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { PROJECT_NAME } from '../config/constants';
import './IntelligenceTerminal.css';
import TerminalViz from './TerminalViz';

const MODULES_DATA = [
    {
        id: 'M-01',
        name: 'Multilingual Homepage',
        color: '#38BDF8',
        desc: 'Immersive landing portal with live feature ticker to guarantee top-tier digital equity across the nation.',
        badge: 'ACCESSIBILITY',
        badgeColor: 'cyan',
        impactVal: '10+',
        impactCtx: 'regional languages supported',
        awsSvc: 'Amazon CloudFront',
        vizType: 'v-portal'
    },
    {
        id: 'M-02',
        name: 'Secure Authentication',
        color: '#10B981',
        desc: 'Role-based login and intelligent redirection ensuring that citizens and officers access exactly what they need safely.',
        badge: 'SECURE',
        badgeColor: 'violet',
        impactVal: 'AES-256',
        impactCtx: 'encryption standard',
        awsSvc: 'Amazon Cognito',
        vizType: 'shield'
    },
    {
        id: 'M-03',
        name: 'User Registration',
        color: '#F43F5E',
        desc: 'Adaptive forms with regional dropdown selections built to be inclusive and friction-free for every citizen.',
        badge: null,
        impactVal: '99%',
        impactCtx: 'accessibility compliance',
        awsSvc: 'Amazon RDS',
        vizType: 'v-holoform'
    },
    {
        id: 'M-04',
        name: 'Citizen Dashboard',
        color: '#3B82F6',
        desc: 'Personalized welcome view with quick metrics aggregating all your governmental interactions in one clear hub.',
        badge: 'PROFILE',
        badgeColor: 'cyan',
        impactVal: '360°',
        impactCtx: 'citizen perspective',
        awsSvc: 'Amazon DynamoDB',
        vizType: 'v-citizendash'
    },
    {
        id: 'M-05',
        name: 'Quick Actions Module',
        color: '#F59E0B',
        desc: 'Dedicated rapid-access shortcuts dynamically adapting to your most frequent public service needs.',
        badge: null,
        impactVal: '< 1s',
        impactCtx: 'time to action',
        awsSvc: 'AWS Lambda',
        vizType: 'v-reactor'
    },
    {
        id: 'M-06',
        name: 'Profile Management',
        color: '#8B5CF6',
        desc: 'Complete capability to view, edit, and manage personal data with strict verified identity guardrails.',
        badge: null,
        impactVal: '100%',
        impactCtx: 'data ownership',
        awsSvc: 'Amazon S3',
        vizType: 'profile'
    },
    {
        id: 'M-07',
        name: 'Data Privacy Controls',
        color: '#EC4899',
        desc: 'Strict settings for consent and engagement tracking, putting the power of data sovereignty back in the citizen\'s hands.',
        badge: 'PRIVACY',
        badgeColor: 'violet',
        impactVal: 'Zero',
        impactCtx: 'knowledge architecture',
        awsSvc: 'AWS KMS',
        vizType: 'v-firewall'
    },
    {
        id: 'M-08',
        name: 'Engagement Dashboard',
        color: '#2DD4BF',
        desc: 'Personal tracking of schemes claimed and grievances filed, visualizing your direct engagement with the state.',
        badge: null,
        impactVal: 'Live',
        impactCtx: 'engagement tracking',
        awsSvc: 'Amazon CloudWatch',
        vizType: 'v-hexagon'
    },
    {
        id: 'M-09',
        name: 'Scheme Discovery Hub',
        color: '#0EA5E9',
        desc: 'Searchable repository of active government schemes spanning agriculture, education, healthcare and more.',
        badge: 'SEARCH',
        badgeColor: 'cyan',
        impactVal: '200+',
        impactCtx: 'schemes indexed',
        awsSvc: 'Amazon OpenSearch',
        vizType: 'v-constellation'
    },
    {
        id: 'M-10',
        name: 'AI Scheme Match',
        color: '#F97316',
        desc: 'Intelligent algorithm automatically matching users to eligible benefits based on their precise demographic profile.',
        badge: 'AI-POWERED',
        badgeColor: 'violet',
        impactVal: '94%',
        impactCtx: 'match accuracy',
        awsSvc: 'Amazon Personalize',
        vizType: 'v-aimatch'
    },
    {
        id: 'M-11',
        name: 'Benefit Roadmaps',
        color: '#D946EF',
        desc: 'Customized, step-by-step AI-generated guides yielding precise instructions to unlock claimed benefits efficiently.',
        badge: 'AI-POWERED',
        badgeColor: 'violet',
        impactVal: '30-Day',
        impactCtx: 'claim roadmap',
        awsSvc: 'Amazon SageMaker',
        vizType: 'roadmap'
    },
    {
        id: 'M-12',
        name: 'AI Chatbot',
        color: '#10B981',
        desc: 'Automated 24/7 support resolving minor queries instantly, serving as the first line of digital assistance.',
        badge: 'AI-POWERED',
        badgeColor: 'cyan',
        impactVal: '24/7',
        impactCtx: 'instant resolution',
        awsSvc: 'Amazon Lex',
        vizType: 'chat'
    },
    {
        id: 'M-13',
        name: 'Multilingual AI',
        color: '#3B82F6',
        desc: 'Dynamic real-time translation across 10 regional languages allowing every citizen to be heard in their mother tongue.',
        badge: null,
        impactVal: '10',
        impactCtx: 'languages translated',
        awsSvc: 'Amazon Translate',
        vizType: 'translate'
    },
    {
        id: 'M-14',
        name: 'Voice-to-Text Input',
        color: '#A78BFA',
        desc: 'Accessibility allowing spoken interaction with the AI, completely sidestepping literacy barriers in rural areas.',
        badge: 'ACCESSIBILITY',
        badgeColor: 'violet',
        impactVal: 'Real-Time',
        impactCtx: 'speech transcription',
        awsSvc: 'Amazon Transcribe',
        vizType: 'waveform'
    },
    {
        id: 'M-15',
        name: 'Grievance Filing Flow',
        color: '#EF4444',
        desc: 'Complete, validated submission engine for complaints with intelligent categorization routing directly to the right officer.',
        badge: 'REVOLUTIONARY',
        badgeColor: 'violet',
        impactVal: '100%',
        impactCtx: 'issue routing',
        awsSvc: 'Amazon EventBridge',
        vizType: 'petition'
    },
    {
        id: 'M-16',
        name: 'Voice Input (Filing)',
        color: '#EAB308',
        desc: 'Accessibility allowing citizens to actively dictate grievances natively within the complaint flow.',
        badge: null,
        impactVal: 'Speech',
        impactCtx: 'to evidence conversion',
        awsSvc: 'Amazon Polly',
        vizType: 'dictation'
    },
    {
        id: 'M-17',
        name: 'Secure File Uploads',
        color: '#14B8A6',
        desc: 'Capability to seamlessly attach evidentiary documents, images, and proof to directly bolster grievance claims.',
        badge: null,
        impactVal: 'S3 Secured',
        impactCtx: 'evidence storage',
        awsSvc: 'Amazon S3',
        vizType: 'fraud'
    },
    {
        id: 'M-18',
        name: 'Unique Tracking IDs',
        color: '#8B5CF6',
        desc: 'Secure ticket generation for real-time monitoring ensuring no complaint is ever lost in the bureaucracy again.',
        badge: null,
        impactVal: 'Blockchain',
        impactCtx: 'immutable ledgers',
        awsSvc: 'Amazon QLDB',
        vizType: 'v-quantumid'
    },
    {
        id: 'M-19',
        name: 'Status Timeline',
        color: '#F43F5E',
        desc: 'Visual progress tracker mapping a grievance\'s resolution journey step-by-step from filing to closure.',
        badge: null,
        impactVal: 'Transparent',
        impactCtx: 'officer accountability',
        awsSvc: 'AWS Step Functions',
        vizType: 'timeline'
    },
    {
        id: 'M-20',
        name: 'Citizen Escrow Verification',
        color: '#10B981',
        desc: 'Users are prompted by the AI to physically verify (via photo) that a grievance in their area was resolved before government funds are released.',
        badge: 'REVOLUTIONARY',
        badgeColor: 'violet',
        impactVal: 'Escrow',
        impactCtx: 'fund release blockade',
        awsSvc: 'Amazon Rekognition',
        vizType: 'escrow'
    },
    {
        id: 'M-21',
        name: 'Community Forum',
        color: '#3B82F6',
        desc: 'Social platform enabling peer-to-peer municipal discussion, upvoting, and collective neighborhood action.',
        badge: 'COMMUNITY',
        badgeColor: 'cyan',
        impactVal: 'P2P',
        impactCtx: 'municipal engagement',
        awsSvc: 'Amazon OpenSearch',
        vizType: 'janconnect'
    },
    {
        id: 'M-22',
        name: 'Seva News Feed',
        color: '#F97316',
        desc: 'Live scrolling feed distributing verified government announcements, combating misinformation with truth.',
        badge: null,
        impactVal: 'Verified',
        impactCtx: 'official broadcasts',
        awsSvc: 'Amazon Kinesis',
        vizType: 'v-broadcast'
    }
];

export default function IntelligenceTerminal() {
    const [spinIndex, setSpinIndex] = useState(0);
    const numItems = MODULES_DATA.length;
    const theta = 360 / numItems;
    const radius = 280;

    const activeIndex = ((spinIndex % numItems) + numItems) % numItems;
    const activeMod = MODULES_DATA[activeIndex];

    const [visible, setVisible] = useState(false);
    const sectionRef = useRef(null);

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

    const currentIdx = activeIndex;

    const handleNext = useCallback(() => setSpinIndex(prev => prev + 1), []);
    const handlePrev = useCallback(() => setSpinIndex(prev => prev - 1), []);

    const handleItemClick = (clickedIndex) => {
        setSpinIndex(prev => {
            const currentNorm = ((prev % numItems) + numItems) % numItems;
            let diff = clickedIndex - currentNorm;
            if (diff > numItems / 2) diff -= numItems;
            if (diff < -numItems / 2) diff += numItems;
            return prev + diff;
        });
    };

    const scrollTimeout = useRef(null);
    const handleWheel = (e) => {
        if (scrollTimeout.current) return;
        if (e.deltaY > 15) {
            handleNext();
            scrollTimeout.current = setTimeout(() => { scrollTimeout.current = null }, 300);
        } else if (e.deltaY < -15) {
            handlePrev();
            scrollTimeout.current = setTimeout(() => { scrollTimeout.current = null }, 300);
        }
    };

    // Auto-scroll functionality
    useEffect(() => {
        if (!visible) return; // Only auto-scroll when the section is visible

        const autoScrollTimer = setInterval(handleNext, 4000); // 4 seconds per slide

        return () => clearInterval(autoScrollTimer);
    }, [visible, spinIndex, handleNext]);

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
                    <h2 className="it-th-title">22 Features.</h2>
                    <h2 className="it-th-title highlight">Unified Intelligence.<span className="it-cursor" /></h2>
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
                        <span className="it-lh-title">// {PROJECT_NAME.toUpperCase()} MATRIX</span>
                        <span className="it-lh-count">3D ROTOR ACTIVE</span>
                    </div>
                    <div className="it-rotor-viewport" onWheel={handleWheel} style={{ '--active-accent': activeMod.color }}>
                        <div className="it-rotor-wheel" style={{ transform: `translateZ(${-radius}px) rotateX(${spinIndex * theta}deg)` }}>
                            {MODULES_DATA.map((mod, i) => {
                                const angle = -i * theta;
                                let dist = Math.abs(i - activeIndex);
                                if (dist > numItems / 2) dist = numItems - dist;
                                const isActive = dist === 0;

                                return (
                                    <div
                                        key={mod.id}
                                        className={`it-rotor-item ${isActive ? 'active' : ''}`}
                                        style={{ transform: `rotateX(${angle}deg) translateZ(${radius}px)`, '--dist': dist, '--accent': mod.color }}
                                        onClick={() => handleItemClick(i)}
                                    >
                                        {isActive && (
                                            <div className="it-ri-frame">
                                                <span className="it-rif tl"></span>
                                                <span className="it-rif tr"></span>
                                                <span className="it-rif bl"></span>
                                                <span className="it-rif br"></span>
                                            </div>
                                        )}
                                        <div className="it-ri-content">
                                            <div className="it-ri-dot"></div>
                                            <div className="it-ri-id">[{mod.id}]</div>
                                            <div className="it-ri-name">{mod.name}</div>
                                            {isActive && <div className="it-ri-status">EXEC</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="it-rotor-fade top"></div>
                        <div className="it-rotor-fade bottom"></div>
                        <div className="it-rotor-connector"></div>
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
                                className={`it-viz-layer ${mod.id === activeMod.id ? 'active' : ''}`}
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
                                SYS.MOD // {currentIdx + 1 < 10 ? '0' + (currentIdx + 1) : currentIdx + 1}<span>/22</span>
                            </div>
                            <div className="mc-tracker-bar">
                                <div className="mc-tracker-fill" style={{ width: `${((currentIdx + 1) / 22) * 100}%` }} />
                            </div>
                        </div>

                        <button className="mc-btn" onClick={handleNext}>
                            <MdKeyboardArrowRight size={28} />
                        </button>
                    </div>

                    <div className="mc-dot-matrix">
                        {MODULES_DATA.slice(0, 22).map((m) => (
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
