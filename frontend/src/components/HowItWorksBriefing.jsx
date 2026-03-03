import React, { useEffect, useRef, useState, memo } from 'react';
import './HowItWorksBriefing.css';

const PHASES = [
    {
        id: '01',
        tag: 'PHASE 01',
        title: 'Distributed Ingestion Network',
        subtext: 'Citizen inputs arrive via 22 WhatsApp languages and web forms.',
        color: '#FF6B2C',
        type: 'ingestion'
    },
    {
        id: '02',
        tag: 'PHASE 02',
        title: 'Contextual AI Synthesis',
        subtext: 'Unstructured complaints are mapped to 500+ scheme schemas.',
        color: '#8B5CF6',
        type: 'synthesis'
    },
    {
        id: '03',
        tag: 'PHASE 03',
        title: 'PreSeva Threat Modeling',
        subtext: 'Detecting systemic failure patterns across district borders.',
        color: '#3B82F6',
        type: 'prediction'
    },
    {
        id: '04',
        tag: 'PHASE 04',
        title: 'Automated Officer Routing',
        subtext: 'Escalated directly to the specific accountable local block officer.',
        color: '#10B981',
        type: 'resolution'
    }
];

const LiveIndicator = ({ type, color }) => {
    if (type === 'ingestion') {
        return (
            <div className="hb-ind-ingestion">
                <div className="hb-ii-field">
                    <div className="hb-ii-text t1" style={{ backgroundColor: color }}></div>
                </div>
                <div className="hb-ii-field">
                    <div className="hb-ii-text t2" style={{ backgroundColor: color }}></div>
                </div>
                <div className="hb-ii-field">
                    <div className="hb-ii-text t3" style={{ backgroundColor: color }}></div>
                </div>
            </div>
        );
    }

    if (type === 'synthesis') {
        return (
            <div className="hb-ind-synthesis">
                <div className="hb-is-folder" style={{ borderColor: color }}>
                    <div className="hb-is-tab" style={{ backgroundColor: color }}></div>
                </div>
                <div className="hb-is-chips">
                    <div className="hb-is-chip c1" style={{ backgroundColor: color }}></div>
                    <div className="hb-is-chip c2" style={{ backgroundColor: color }}></div>
                    <div className="hb-is-chip c3" style={{ backgroundColor: color }}></div>
                </div>
            </div>
        );
    }

    if (type === 'prediction') {
        return (
            <div className="hb-ind-prediction">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="hb-ip-svg">
                    <path
                        className="hb-ip-line"
                        d="M0 15 L30 15 L35 5 L45 25 L50 15 L80 15 L85 10 L90 20 L95 15 L100 15"
                        stroke={color}
                    />
                </svg>
                <div className="hb-ip-scan" />
            </div>
        );
    }

    if (type === 'resolution') {
        return (
            <div className="hb-ind-resolution">
                <div className="hb-ir-row r1"></div>
                <div className="hb-ir-row r2"></div>
                <div className="hb-ir-row r3"></div>
            </div>
        );
    }

    return null;
};

function HowItWorksBriefing() {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!sectionRef.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.2 });

        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="hb-section" ref={sectionRef}>
            <div className="hb-container">
                <div className="hb-header">
                    <h2 className="hb-title">OPERATION BRIEFING</h2>
                    <p className="hb-subtitle">Systemic execution protocol. Real-time sequence.</p>
                </div>

                <div className="hb-rack">
                    {PHASES.map((phase, index) => (
                        <div
                            key={phase.id}
                            className={`hb-row ${isVisible ? 'visible' : ''}`}
                            style={{
                                '--accent': phase.color,
                                '--delay': `${index * 0.15}s`
                            }}
                        >
                            <div className="hb-content-left">
                                <div className="hb-tag" style={{ color: phase.color }}>{phase.tag}</div>
                                <div className="hb-divider"></div>
                                <div className="hb-text-group">
                                    <div className="hb-row-title">{phase.title}</div>
                                    <div className="hb-row-subtext">{phase.subtext}</div>
                                </div>
                            </div>

                            <div className="hb-content-right">
                                <div className="hb-indicator-label">LIVE STATUS</div>
                                <div className="hb-indicator-box">
                                    <LiveIndicator type={phase.type} color={phase.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default memo(HowItWorksBriefing);
