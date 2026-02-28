import React, { useState, useEffect, Suspense, useRef } from 'react';
import {
    MdShowChart, MdAnalytics, MdChat, MdAssignment, MdTimeline, MdAccessTime,
    MdPeople, MdShield, MdDeviceHub, MdAttachMoney, MdFormatListNumbered,
    MdWbCloudy, MdGroupAdd, MdAssessment, MdHistory, MdLock,
    MdReplay, MdMonetizationOn, MdScreenRotation, MdExplore, MdDirections
} from 'react-icons/md';
import './IntelligenceModules.css';

const MODULES = [
    {
        id: 'M-01',
        name: 'PreSeva Prevention',
        icon: <MdShowChart />,
        color: '#A78BFA',
        span: 'span-12',
        viz: 'sparkline',
        badge: 'PREDICTIVE',
        desc: 'The worlds first government failure prevention engine. Stops problems before you face them.'
    },
    {
        id: 'M-02',
        name: 'Distress Index',
        icon: <MdAnalytics />,
        color: '#FF5500',
        span: 'span-4',
        viz: 'bars',
        desc: 'Real-time per-state suffering score with live accountability tracking.'
    },
    {
        id: 'M-03',
        name: 'AI Chatbot',
        icon: <MdChat />,
        color: '#00E5A0',
        span: 'span-4',
        viz: 'dots',
        desc: 'Voice-enabled context-aware AI in 22 Indian languages.'
    },
    {
        id: 'M-04',
        name: 'Grievance Engine',
        icon: <MdAssignment />,
        color: '#5C8EFF',
        span: 'span-4',
        viz: 'ring',
        desc: 'Automatic escalation system with legally binding SLA enforcement.'
    },
    {
        id: 'M-05',
        name: 'Benefit Roadmap',
        icon: <MdTimeline />,
        color: '#FFB800',
        span: 'span-7',
        viz: 'roadmap',
        desc: '30-day AI-generated path to unlock every govt benefit you are entitled to.'
    },
    {
        id: 'M-06',
        name: 'Officer SLA Tracker',
        icon: <MdAccessTime />,
        color: '#FF3B3B',
        span: 'span-5',
        viz: 'timer',
        badge: 'LIVE',
        desc: 'Real-time countdown to officer escalation. Transparency at every step.'
    },
    {
        id: 'M-07',
        name: 'JanConnect',
        icon: <MdPeople />,
        color: '#EC4899',
        span: 'span-4',
        viz: 'avatars',
        desc: 'Community-driven discussion platform with official officer oversight.'
    },
    {
        id: 'M-08',
        name: 'Fraud Detection',
        icon: <MdShield />,
        color: '#10B981',
        span: 'span-4',
        viz: 'shield',
        desc: 'Deep learning system catching duplicate logins and gaming with 94% accuracy.'
    },
    {
        id: 'M-09',
        name: 'Grievance DNA',
        icon: <MdDeviceHub />,
        color: '#8B5CF6',
        span: 'span-4',
        viz: 'dna',
        desc: 'Traces the root cause of systemic issues across multiple departments.'
    },
    {
        id: 'M-10',
        name: 'Benefit Gap Calc',
        icon: <MdAttachMoney />,
        color: '#F97316',
        span: 'span-5',
        viz: 'gap',
        desc: 'Calculates the exact monthly value you are missing in government support.'
    },
    {
        id: 'M-11',
        name: 'Officer Accountability Wall',
        icon: <MdFormatListNumbered />,
        color: '#6366F1',
        span: 'span-7',
        viz: 'wall',
        desc: 'Public leaderboard of the highest and lowest performing government officials.'
    },
    {
        id: 'M-12',
        name: 'Grievance Weather',
        icon: <MdWbCloudy />,
        color: '#0EA5E9',
        span: 'span-4',
        viz: 'weather',
        desc: 'Predictive forecast of service disruptions in your locality for the week.'
    },
    {
        id: 'M-13',
        name: 'Mass Petition Engine',
        icon: <MdGroupAdd />,
        color: '#8B5CF6',
        span: 'span-4',
        viz: 'petition',
        desc: 'Unite with thousands of citizens to force the resolution of shared issues.'
    },
    {
        id: 'M-14',
        name: 'Jan Shakti Score',
        icon: <MdAssessment />,
        color: '#D946EF',
        span: 'span-4',
        viz: 'shakti',
        desc: 'Measure your impact on public reform through engagement.'
    },
    {
        id: 'M-15',
        name: 'Scheme Time Machine',
        icon: <MdHistory />,
        color: '#F59E0B',
        span: 'span-5',
        viz: 'history',
        desc: 'Back-track missing benefits from the last 5 years with AI recovery.'
    },
    {
        id: 'M-16',
        name: 'Whisper Mode',
        icon: <MdLock />,
        color: '#B8C5D6',
        span: 'span-7',
        viz: 'whisper',
        badge: 'SECURE',
        desc: 'Submit zero-knowledge proof grievances without revealing your identity.'
    },
    {
        id: 'M-17',
        name: 'Resolution Replay',
        icon: <MdReplay />,
        color: '#2DD4BF',
        span: 'span-4',
        viz: 'replay',
        desc: 'Visual timeline of exactly how your complaint moved through the system.'
    },
    {
        id: 'M-18',
        name: 'Impact Rupee Counter',
        icon: <MdMonetizationOn />,
        color: '#F43F5E',
        span: 'span-4',
        viz: 'rupee',
        desc: 'Total currency value unlocked for citizens in real-time.'
    },
    {
        id: 'M-19',
        name: 'Seva Mirror',
        icon: <MdScreenRotation />,
        color: '#3B82F6',
        span: 'span-4',
        viz: 'mirror',
        desc: 'Dynamic graph of how the government sees your citizen profile.'
    },
    {
        id: 'M-20',
        name: 'Predict My Future',
        icon: <MdExplore />,
        color: '#8B5CF6',
        span: 'span-5',
        viz: 'future',
        desc: 'AI predicts your eligibility for next years schemes before they launch.'
    },
    {
        id: 'M-21',
        name: 'Threat Corridors',
        icon: <MdDirections />,
        color: '#FF5500',
        span: 'span-7',
        viz: 'corridors',
        badge: 'PREDICTIVE',
        desc: 'The final hero module: Mapping systemic failures as they travel across states.'
    }
];

const Viz = ({ type, color, hover }) => {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), hover ? 1000 : 1500);
        return () => clearInterval(interval);
    }, [hover]);

    switch (type) {
        case 'sparkline':
            return (
                <svg width="120" height="30" viewBox="0 0 120 30" fill="none">
                    <path
                        d="M0 15H30L35 5L45 25L50 15H120"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="200"
                        strokeDashoffset={hover ? "0" : "200"}
                        style={{ transition: 'stroke-dashoffset 2s ease-in-out', animation: hover ? 'none' : 'dashPulse 3s infinite' }}
                    />
                </svg>
            );
        case 'bars':
            return (
                <div className="viz-bars" style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '24px' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="viz-di-bar" style={{
                            height: `${10 + Math.sin((tick + i) * 0.8) * 12}px`,
                            background: i === 4 ? '#FF3B3B' : i === 3 ? '#FF5500' : i === 2 ? '#FFB800' : '#00E5A0'
                        }} />
                    ))}
                </div>
            );
        case 'dots':
            return (
                <div style={{ display: 'flex', gap: '6px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className="viz-bot-dot" style={{ animationDelay: `${i * 0.2}s`, backgroundColor: color }} />
                    ))}
                </div>
            );
        case 'ring':
            return (
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="rgba(255, 255, 255, 0.10)" strokeWidth="3" fill="none" />
                    <circle
                        cx="20" cy="20" r="16" stroke={color} strokeWidth="3" fill="none"
                        strokeDasharray="100" strokeDashoffset={tick % 2 === 0 ? "28" : "100"}
                        className="viz-ring-circ"
                    />
                </svg>
            );
        case 'roadmap':
            return (
                <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className="viz-rd-line" style={{ width: `${60 + (tick + i) % 3 * 20}%`, backgroundColor: color }} />
                    ))}
                </div>
            );
        case 'timer':
            return <div className="viz-sla-timer">2d 14h {59 - (tick % 60)}m</div>;
        case 'avatars':
            return (
                <div style={{ display: 'flex' }}>
                    {['JS', 'RK', 'AM'].map((n, i) => (
                        <div key={i} className="viz-jc-av" style={{
                            marginLeft: i === 0 ? 0 : -6,
                            backgroundColor: i === 0 ? '#EC4899' : i === 1 ? '#6366F1' : '#10B981',
                            transform: `translateX(${(tick + i) % 2 * 2}px)`
                        }}>{n}</div>
                    ))}
                </div>
            );
        case 'shield':
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MdShield size={20} color={tick % 4 === 0 ? '#EF4444' : '#10B981'} style={{ transition: 'color 0.3s' }} />
                    {tick % 4 === 0 && <span className="viz-fd-text">BLOCKED</span>}
                </div>
            );
        case 'dna':
            return (
                <svg width="60" height="30" viewBox="0 0 60 30">
                    {[0, 1, 2, 3].map(i => (
                        <circle key={i} cx={10 + i * 15} cy={15 + Math.sin(tick + i) * 5} r="2" fill={color} className="viz-dna-node" />
                    ))}
                    <path d={`M10 ${15 + Math.sin(tick) * 5} L25 ${15 + Math.sin(tick + 1) * 5} L40 ${15 + Math.sin(tick + 2) * 5} L55 ${15 + Math.sin(tick + 3) * 5}`} stroke={color} strokeWidth="1" opacity="0.3" fill="none" />
                </svg>
            );
        case 'gap':
            return <div className="viz-gap-val">₹{4200 + (tick % 5 * 150)}</div>;
        case 'wall':
            return (
                <div style={{ width: '100px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className="viz-aw-row">
                            <span className="viz-aw-rank">{i + 1}</span>
                            <div className="viz-aw-bar" style={{ width: `${80 - i * 20}%`, backgroundColor: color }} />
                        </div>
                    ))}
                </div>
            );
        case 'weather':
            return (
                <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="viz-w-col">
                            <div className="viz-w-dot" style={{ backgroundColor: i === 3 ? '#FF5500' : color }} />
                            <div className="viz-w-bar" style={{ height: `${8 + Math.sin(tick + i) * 8}px` }} />
                        </div>
                    ))}
                </div>
            );
        case 'petition':
            return <div className="viz-pe-join">+1 joined</div>;
        case 'shakti':
            return (
                <div style={{ color: color, fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700 }}>
                    {840 + (tick % 7)}
                </div>
            );
        case 'history':
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: color }}>
                    <span>2019</span>
                    <div style={{ width: '20px', height: '1px', background: color }} />
                    <span style={{ color: '#FFF' }}>{2020 + (tick % 5)}</span>
                </div>
            );
        case 'whisper':
            return (
                <div className="viz-wm-text">
                    {tick % 4 === 0 ? 'CORRUPTION' : '██████████'}
                </div>
            );
        case 'replay':
            return (
                <div style={{ width: '100px', height: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', left: `${(tick * 20) % 100}%`, top: '-2px',
                        width: '6px', height: '6px', borderRadius: '50%', background: color
                    }} />
                </div>
            );
        case 'rupee':
            return <div style={{ color: color, fontFamily: 'JetBrains Mono', fontSize: '0.9rem', fontWeight: 800 }}>₹2.4 Cr.{tick % 99}</div>;
        case 'mirror':
            return (
                <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: `rotate(${tick * 45}deg)`, transition: 'transform 1s linear' }}>
                    <circle cx="20" cy="20" r="2" fill={color} />
                    {[0, 72, 144, 216, 288].map(d => (
                        <line key={d} x1="20" y1="20" x2="20" y2="10" stroke={color} strokeWidth="1" transform={`rotate(${d} 20 20)`} strokeDasharray="2 2" />
                    ))}
                </svg>
            );
        case 'future':
            return (
                <div style={{ fontNames: 'JetBrains Mono', fontSize: '0.78rem', color: color }}>
                    {tick % 3 === 0 ? 'PMAY (G) eligibility predicted' : tick % 3 === 1 ? 'Ujjwala 2.0 scan' : 'Kisan credit loop'}
                </div>
            );
        case 'corridors':
            return (
                <div className="viz-tc-text">
                    UP <span style={{ color }}>──→</span> BIHAR
                </div>
            );
        default: return null;
    }
};

const Module = ({ mod, index, parentVisible }) => {
    const [hover, setHover] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!parentVisible) return;
        const timer = setTimeout(() => setVisible(true), index * 60);
        return () => clearTimeout(timer);
    }, [index, parentVisible]);

    if (mod.span === 'span-12') {
        const isEnd = mod.id === 'M-21';
        return (
            <div
                className={`mod-card span-12 ${visible ? 'visible' : ''} ${isEnd ? 'hero-end' : ''}`}
                style={{ '--mc': mod.color }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div className="mod-edge" />
                <div className="mod-status">
                    <div className="mod-s-dot" />
                    <span className="mod-s-txt">ACTIVE</span>
                </div>
                {mod.badge && <div className="mod-badge">{mod.badge}</div>}

                <div className="mod-content-wrap">
                    <div className="mod-body-left">
                        <div className="mod-id">{mod.id}</div>
                        <div className="mod-icon">{mod.icon}</div>
                        <h3 className="mod-name">{mod.name}</h3>
                        <p className="mod-desc">{mod.desc}</p>
                    </div>
                    <div className="mod-divider" />
                    <div className="mod-viz-right">
                        <Viz type={mod.viz} color={mod.color} hover={hover} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`mod-card ${mod.span} ${visible ? 'visible' : ''}`}
            style={{ '--mc': mod.color }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="mod-edge" />
            <div className="mod-status">
                <div className="mod-s-dot" />
                <span className="mod-s-txt">ACTIVE</span>
            </div>
            {mod.badge && <div className="mod-badge">{mod.badge}</div>}

            <div className="mod-content">
                <div className="mod-id">{mod.id}</div>
                <div className="mod-viz-container">
                    <Viz type={mod.viz} color={mod.color} hover={hover} />
                </div>
                <div className="mod-icon">{mod.icon}</div>
                <h3 className="mod-name">{mod.name}</h3>
                <p className="mod-desc">{mod.desc}</p>
            </div>
        </div>
    );
};

export default function IntelligenceModules() {
    const [sectionVisible, setSectionVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setSectionVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="caps" className="sys-modules-section" ref={sectionRef}>
            <div className="sys-mod-header">
                <div className="smh-left">
                    <div className="smh-tag">SYSTEM MODULES</div>
                    <h2 className="smh-title">33 Active Capabilities.<br /><span className="smh-highlight">Zero Competition.</span></h2>
                </div>
                <div className="smh-right">
                    <div className="smh-status">
                        <div className="smh-dot" />
                        ALL SYSTEMS OPERATIONAL
                    </div>
                    <div className="smh-audit">Last audit: 2 minutes ago</div>
                </div>
            </div>

            <div className="sys-mod-grid">
                {MODULES.map((mod, i) => (
                    <Module key={mod.id} mod={mod} index={i} parentVisible={sectionVisible} />
                ))}
            </div>
        </section>
    );
}
