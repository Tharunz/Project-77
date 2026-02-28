import React, { useState, useEffect, Suspense, useRef } from 'react';
import {
    MdShowChart, MdAnalytics, MdChat, MdAssignment, MdTimeline, MdAccessTime,
    MdPeople, MdShield, MdDeviceHub, MdAttachMoney, MdFormatListNumbered,
    MdWbCloudy, MdGroupAdd, MdAssessment, MdHistory, MdLock,
    MdReplay, MdMonetizationOn, MdScreenRotation, MdExplore, MdDirections, MdOutlineMemory
} from 'react-icons/md';
import './IntelligenceModules.css';

const MODULES = [
    {
        id: 'M-01',
        name: 'Multilingual Homepage',
        icon: <MdWbCloudy />,
        color: '#38BDF8',
        span: 'span-12',
        viz: 'sparkline',
        badge: 'ACCESSIBILITY',
        desc: 'Immersive landing portal with live feature ticker to guarantee top-tier digital equity across the nation.'
    },
    {
        id: 'M-02',
        name: 'Secure Authentication',
        icon: <MdShield />,
        color: '#10B981',
        span: 'span-4',
        viz: 'shield',
        desc: 'Role-based login and intelligent redirection ensuring that citizens and officers access exactly what they need safely.'
    },
    {
        id: 'M-03',
        name: 'User Registration',
        icon: <MdFormatListNumbered />,
        color: '#F43F5E',
        span: 'span-4',
        viz: 'dna',
        desc: 'Adaptive forms with regional dropdown selections built to be inclusive and friction-free for every citizen.'
    },
    {
        id: 'M-04',
        name: 'Citizen Dashboard',
        icon: <MdShowChart />,
        color: '#3B82F6',
        span: 'span-4',
        viz: 'bars',
        desc: 'Personalized welcome view with quick metrics aggregating all your governmental interactions in one clear hub.'
    },
    {
        id: 'M-05',
        name: 'Quick Actions Module',
        icon: <MdTimeline />,
        color: '#F59E0B',
        span: 'span-7',
        viz: 'roadmap',
        badge: 'FAST',
        desc: 'Dedicated rapid-access shortcuts dynamically adapting to your most frequent public service needs.'
    },
    {
        id: 'M-06',
        name: 'Profile Management',
        icon: <MdPeople />,
        color: '#8B5CF6',
        span: 'span-5',
        viz: 'avatars',
        desc: 'Complete capability to view, edit, and manage personal data with strict verified identity guardrails.'
    },
    {
        id: 'M-07',
        name: 'Data Privacy Controls',
        icon: <MdLock />,
        color: '#EC4899',
        span: 'span-4',
        viz: 'whisper',
        badge: 'PRIVACY',
        desc: 'Strict settings for consent and engagement tracking, putting the power of data sovereignty back in the citizen\'s hands.'
    },
    {
        id: 'M-08',
        name: 'Engagement Dashboard',
        icon: <MdAnalytics />,
        color: '#2DD4BF',
        span: 'span-4',
        viz: 'ring',
        desc: 'Personal tracking of schemes claimed and grievances filed, visualizing your direct engagement with the state.'
    },
    {
        id: 'M-09',
        name: 'Scheme Discovery Hub',
        icon: <MdExplore />,
        color: '#0EA5E9',
        span: 'span-4',
        viz: 'weather',
        desc: 'Searchable repository of active government schemes spanning agriculture, education, healthcare and more.'
    },
    {
        id: 'M-10',
        name: 'AI Scheme Match',
        icon: <MdAssessment />,
        color: '#F97316',
        span: 'span-5',
        viz: 'gap',
        badge: 'AI-POWERED',
        desc: 'Intelligent algorithm automatically matching users to eligible benefits based on their precise demographic profile.'
    },
    {
        id: 'M-11',
        name: 'Benefit Roadmaps',
        icon: <MdDirections />,
        color: '#D946EF',
        span: 'span-7',
        viz: 'future',
        badge: 'AI-POWERED',
        desc: 'Customized, step-by-step AI-generated guides yielding precise instructions to unlock claimed benefits efficiently.'
    },
    {
        id: 'M-12',
        name: 'AI Chatbot',
        icon: <MdChat />,
        color: '#10B981',
        span: 'span-4',
        viz: 'dots',
        badge: 'AI-POWERED',
        desc: 'Automated 24/7 support resolving minor queries instantly, serving as the first line of digital assistance.'
    },
    {
        id: 'M-13',
        name: 'Multilingual AI',
        icon: <MdGroupAdd />,
        color: '#3B82F6',
        span: 'span-4',
        viz: 'petition',
        desc: 'Dynamic real-time translation across 10 regional languages allowing every citizen to be heard in their mother tongue.'
    },
    {
        id: 'M-14',
        name: 'Voice-to-Text Input',
        icon: <MdChat />,
        color: '#A78BFA',
        span: 'span-4',
        viz: 'dots',
        badge: 'ACCESSIBILITY',
        desc: 'Accessibility allowing spoken interaction with the AI, completely sidestepping literacy barriers in rural areas.'
    },
    {
        id: 'M-15',
        name: 'Grievance Filing Flow',
        icon: <MdAssignment />,
        color: '#EF4444',
        span: 'span-5',
        viz: 'wall',
        desc: 'Complete, validated submission engine for complaints with intelligent categorization routing directly to the right officer.'
    },
    {
        id: 'M-16',
        name: 'Voice Input (Filing)',
        icon: <MdChat />,
        color: '#EAB308',
        span: 'span-7',
        viz: 'dots',
        desc: 'Accessibility allowing citizens to actively dictate grievances natively within the complaint flow.'
    },
    {
        id: 'M-17',
        name: 'Secure File Uploads',
        icon: <MdLock />,
        color: '#14B8A6',
        span: 'span-4',
        viz: 'shield',
        desc: 'Capability to seamlessly attach evidentiary documents, images, and proof to directly bolster grievance claims.'
    },
    {
        id: 'M-18',
        name: 'Unique Tracking IDs',
        icon: <MdHistory />,
        color: '#8B5CF6',
        span: 'span-4',
        viz: 'history',
        desc: 'Secure ticket generation for real-time monitoring ensuring no complaint is ever lost in the bureaucracy again.'
    },
    {
        id: 'M-19',
        name: 'Status Timeline',
        icon: <MdTimeline />,
        color: '#F43F5E',
        span: 'span-4',
        viz: 'roadmap',
        desc: 'Visual progress tracker mapping a grievance\'s resolution journey step-by-step from filing to closure.'
    },
    {
        id: 'M-20',
        name: 'Citizen Escrow Verification',
        icon: <MdMonetizationOn />,
        color: '#10B981',
        span: 'span-5',
        viz: 'rupee',
        badge: 'REVOLUTIONARY',
        desc: 'Users are prompted by the AI to physically verify (via photo) that a grievance in their area was resolved before government funds are released.'
    },
    {
        id: 'M-21',
        name: 'Community Forum',
        icon: <MdPeople />,
        color: '#3B82F6',
        span: 'span-7',
        viz: 'avatars',
        badge: 'COMMUNITY',
        desc: 'Social platform enabling peer-to-peer municipal discussion, upvoting, and collective neighborhood action.'
    },
    {
        id: 'M-22',
        name: 'Seva News Feed',
        icon: <MdWbCloudy />,
        color: '#F97316',
        span: 'span-12',
        viz: 'weather',
        desc: 'Live scrolling feed distributing verified government announcements, combating misinformation with truth.'
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
                    <h2 className="smh-title">22 Features.<br /><span className="smh-highlight">Zero Competition.</span></h2>
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
