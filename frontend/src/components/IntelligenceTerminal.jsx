import React, { useState, useEffect, useRef } from 'react';
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

            <div className={`it-terminal ${visible ? 'visible' : ''}`}>
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
        </section>
    );
}
