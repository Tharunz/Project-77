import React, { useState, useEffect } from 'react';
import { PROJECT_NAME } from '../config/constants';
import './IntelligenceTerminalViz.css';

export default function TerminalViz({ vizType, color }) {
    const [score, setScore] = useState(847);
    const [rupee, setRupee] = useState(24783291);
    const [petitionCount, setPetitionCount] = useState(1204);

    useEffect(() => {
        let intShakti, intRupee, intPetition;

        if (vizType === 'shakti') {
            intShakti = setInterval(() => {
                setScore(s => s > 900 ? 840 : s + Math.floor(Math.random() * 5));
            }, 800);
        }

        if (vizType === 'rupee') {
            intRupee = setInterval(() => {
                setRupee(r => r + Math.floor(Math.random() * 100));
            }, 50);
        }

        if (vizType === 'petition') {
            intPetition = setInterval(() => {
                setPetitionCount(p => p > 9900 ? 1204 : p + Math.floor(Math.random() * 15) + 1);
            }, 100);
        }

        return () => {
            clearInterval(intShakti);
            clearInterval(intRupee);
            clearInterval(intPetition);
        };
    }, [vizType]);

    // -------------------------------------------------------------
    // M-01 PreSeva
    if (vizType === 'preseva') {
        return (
            <div className="viz-preseva">
                <div className="vp-grid" />
                <svg className="vp-line-svg" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <path className="vp-line" d="M0 200 L400 200 L450 190 L500 210 L550 195 L650 200 L700 80 L720 280 L750 200 L1000 200" stroke={color} fill="none" strokeWidth="3" />
                </svg>
                <div className="vp-spike-line" />
                <div className="vp-spike-label" style={{ color }}>PreSeva Detected<br />Day 22</div>
                <div className="vp-safe-zone">
                    <span>Problem Prevented</span>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-02 Distress Index
    if (vizType === 'distress') {
        const states = Array.from({ length: 36 }).map((_, i) => {
            const temp = Math.random();
            const bg = temp > 0.9 ? '#EF4444' : temp > 0.7 ? '#F59E0B' : temp > 0.4 ? '#3B82F6' : '#10B981';
            const pulse = temp > 0.9 ? 'pulse-danger' : '';
            return <div key={i} className={`vd-cell ${pulse}`} style={{ background: bg }}>S{i + 1}</div>;
        });
        return (
            <div className="viz-distress">
                <div className="vd-ticker">247 districts monitored</div>
                <div className="vd-grid">{states}</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-03 AI Chatbot
    if (vizType === 'chat') {
        return (
            <div className="viz-chat">
                <div className="vc-lang">22 languages</div>
                <div className="vc-msg user">मुझे PM Kisan का लाभ मिलेगा?</div>
                <div className="vc-msg ai">हाँ! आप eligible हैं। ₹6,000/year</div>
                <div className="vc-msg user typing">
                    Voice mein bolunga?
                    <span className="vc-cursor" />
                </div>
                <div className="vc-dots">
                    <span /><span /><span />
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-04 Grievance Kanban
    if (vizType === 'kanban') {
        return (
            <div className="viz-kanban">
                <div className="vk-col">
                    <div className="vk-header">FILED <span>24</span></div>
                    <div className="vk-card c1">GRV-8847 · Water · UP</div>
                    <div className="vk-card c4">GRV-9B21 · Health · BR</div>
                </div>
                <div className="vk-col">
                    <div className="vk-header">PROCESSING <span>12</span></div>
                    <div className="vk-card c2">GRV-7112 · Subsidy · MP</div>
                </div>
                <div className="vk-col">
                    <div className="vk-header">RESOLVED <span>1,432</span></div>
                    <div className="vk-card c3">GRV-6004 · Roads · TN</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-05 Benefit Roadmap
    if (vizType === 'roadmap') {
        return (
            <div className="viz-roadmap">
                <div className="vr-timeline">
                    <div className="vr-dot" />
                </div>
                <div className="vr-stages">
                    <div className="vr-stage">🎓 Student<div className="vr-chip p1">PM Scholarship</div></div>
                    <div className="vr-stage">💼 Worker<div className="vr-chip p2">Skill India</div></div>
                    <div className="vr-stage">👨‍👩‍👧 Parent<div className="vr-chip p3">Janani Suraksha</div></div>
                    <div className="vr-stage">👴 Senior<div className="vr-chip p4">Atal Pension</div></div>
                    <div className="vr-stage">🏠 Retired<div className="vr-chip p5">Ayushman Bharat</div></div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-06 Officer SLA Tracker
    if (vizType === 'sla') {
        return (
            <div className="viz-sla">
                <div className="vs-table">
                    <div className="vs-thead">
                        <span>Officer</span><span>Cases</span><span>Avg Days</span><span>SLA%</span><span>Score</span>
                    </div>
                    <div className="vs-row"><span>R. Kumar</span><span>142</span><span>2.1</span><span>99%</span><span>9.8</span></div>
                    <div className="vs-row"><span>S. Verma</span><span>98</span><span>3.4</span><span>95%</span><span>8.4</span></div>
                    <div className="vs-row breach"><span>A. Singh</span><span>211</span><span>14.2</span><span>41%</span><span>⚠️ BREACH</span></div>
                    <div className="vs-row"><span>M. Das</span><span>84</span><span>1.8</span><span>100%</span><span>9.9</span></div>
                </div>
                <div className="vs-alert">Escalated to Senior Directory</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-07 JanConnect
    if (vizType === 'janconnect') {
        return (
            <div className="viz-janconnect">
                <div className="vj-pinned">📌 Bijli nahi hai 3 din se — Varanasi</div>
                <div className="vj-reply r1">↳ Same problem Allahabad <span className="vj-up">+1</span></div>
                <div className="vj-reply r2 off">↳ Filed grievance, resolved in 2 days <span className="vj-badge">✅ Govt</span></div>
                <div className="vj-reply r3">↳ 2,341 people facing same issue</div>
                <div className="vj-btn-wrap">
                    <div className="vj-join">JOIN PETITION</div>
                    <div className="vj-counter">2,342 joined</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-08 Fraud Detection
    if (vizType === 'fraud') {
        return (
            <div className="viz-fraud">
                <div className="vf-counter">847 files secured today</div>
                <div className="vf-stream">
                    <div className="vf-log ok">✓ SCANNED · DOC-9ABF2.pdf</div>
                    <div className="vf-log ok">✓ SCANNED · IMG-12X21.png</div>
                    <div className="vf-log warn">⚠ ANALYZING · ARX-QQ412.zip</div>
                    <div className="vf-log ok">✓ SCANNED · TXT-98N21.txt</div>
                    <div className="vf-log block">⛔ MALWARE DETECTED — BLOCKED · BIN-00XVOID.exe</div>
                    <div className="vf-log ok">✓ SCANNED · DOC-LLK21.docx</div>
                    <div className="vf-log ok">✓ SCANNED · IMG-XAQ11.jpg</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-09 Grievance DNA
    if (vizType === 'dna') {
        return (
            <div className="viz-dna">
                <div className="vn-nodes">
                    <div className="vn-node n1">Category</div>
                    <div className="vn-node n2">State</div>
                    <div className="vn-node n3">Emotion</div>
                    <div className="vn-node n4">Severity</div>
                    <div className="vn-node n5">Dept</div>
                    <div className="vn-node n6">Time</div>
                </div>
                <div className="vn-center-svg">
                    <svg viewBox="0 0 100 100" className="vn-dna-spin">
                        <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="none" stroke={color} strokeWidth="2" />
                        <circle cx="50" cy="50" r="15" fill={color} />
                    </svg>
                </div>
                <div className="vn-id">Unique ID: GRV-9A3F2D</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-10 Benefit Gap Calc
    if (vizType === 'gap') {
        return (
            <div className="viz-gap">
                <div className="vg-val">₹4,200</div>
                <div className="vg-sub">/month you are missing right now</div>
                <div className="vg-bar-wrap">
                    <div className="vg-bar">
                        <div className="vg-fill" />
                        <div className="vg-unclaim" />
                    </div>
                </div>
                <div className="vg-labels">
                    <span>Claimed</span>
                    <span style={{ color: '#F97316' }}>Unclaimed (₹4,200)</span>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-11 Officer Accountability Wall
    if (vizType === 'podium') {
        return (
            <div className="viz-podium">
                <div className="vp-card p2">
                    <div className="vpc-rank">#2</div>
                    <div className="vpc-name">K. Singh</div>
                    <div className="vpc-score">94.2</div>
                </div>
                <div className="vp-card p1">
                    <div className="vpc-rank">#1</div>
                    <div className="vpc-name">A. Patel</div>
                    <div className="vpc-score">98.7</div>
                </div>
                <div className="vp-card p3">
                    <div className="vpc-rank">#3</div>
                    <div className="vpc-name">M. Das</div>
                    <div className="vpc-score">89.4</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-12 Grievance Weather
    if (vizType === 'weather') {
        return (
            <div className="viz-weather">
                <div className="vw-scan" />
                <div className="vw-days">
                    <div className="vw-day"><div>Day 1</div><div className="vwd-icon">🌤</div><div>32 expecting</div></div>
                    <div className="vw-day"><div>Day 2</div><div className="vwd-icon">🌤</div><div>38 expecting</div></div>
                    <div className="vw-day"><div>Day 3</div><div className="vwd-icon">☁️</div><div>85 expecting</div></div>
                    <div className="vw-day alert">
                        <div className="vwd-badge">DEPT ALERTED</div>
                        <div>Day 4</div><div className="vwd-icon">⛈</div><div>189 expecting</div>
                    </div>
                    <div className="vw-day"><div>Day 5</div><div className="vwd-icon">🌧</div><div>142 expecting</div></div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-13 Mass Petition Engine
    if (vizType === 'petition') {
        return (
            <div className="viz-petition">
                <div className="vpe-counter">
                    <span className="vpe-num live">{petitionCount.toLocaleString('en-IN')} citizens</span>
                </div>
                <div className="vpe-bar-wrap">
                    <div className="vpe-bar" />
                </div>
                <div className="vpe-limit">At 10,000 → Auto-escalates to Minister</div>
                <div className="vpe-confetti" />
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-14 Jan Shakti Score
    if (vizType === 'shakti') {
        return (
            <div className="viz-shakti">
                <div className="vs-rings">
                    <svg viewBox="0 0 200 200" className="vs-svg">
                        <circle cx="100" cy="100" r="80" className="vs-r1" />
                        <circle cx="100" cy="100" r="60" className="vs-r2" />
                        <circle cx="100" cy="100" r="40" className="vs-r3" />
                    </svg>
                    <div className="vs-score">{score}</div>
                </div>
                <div className="vs-lvl">⭐ Level 4 — {PROJECT_NAME} Guardian</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-15 Scheme Time Machine
    if (vizType === 'timemachine') {
        return (
            <div className="viz-time">
                <div className="vt-track">
                    <div className="vt-scan" />
                    <span>2019</span><span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span>
                    <div className="vt-chip c1">PM Kisan eligible</div>
                    <div className="vt-chip c2">Missing: ₹12,000</div>
                    <div className="vt-chip c3">Ayushman eligible</div>
                </div>
                <div className="vt-total">₹87,000 missed total</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-16 Whisper Mode
    if (vizType === 'whisper') {
        return (
            <div className="viz-whisper">
                <div className="vw-scan-line" />
                <div className="vw-text-layer redact">
                    ████████ ███ ████████████ ████<br />
                    ███████████████ ██████ ████
                </div>
                <div className="vw-text-layer decrypt">
                    District Collector demanding<br />
                    bribes for ration card approvals — Sitapur, UP
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-17 Resolution Replay
    if (vizType === 'replay') {
        return (
            <div className="viz-replay">
                <div className="vrr-track">
                    <div className="vrr-dot" />
                    <div className="vrr-point p1" />
                    <div className="vrr-point p2" />
                    <div className="vrr-point p3" />
                    <div className="vrr-point p4" />
                    <div className="vrr-point p5" />

                    <div className="vrr-card c1">9:32am · Filed by Ramesh</div>
                    <div className="vrr-card c2">10:14am · Assigned to Officer Sharma</div>
                    <div className="vrr-card c3">11:00am · Under Investigation</div>
                    <div className="vrr-card c4">2:47pm · Resolved ✓</div>
                    <div className="vrr-card c5">3:01pm · Citizen notified</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-18 Impact Rupee Counter
    if (vizType === 'rupee') {
        return (
            <div className="viz-rupee">
                <div className="vru-val">₹{rupee.toLocaleString('en-IN')}</div>
                <div className="vru-sub">saved for 47,382 citizens this month</div>
                <svg className="vru-spark" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <path d="M0 40 L40 35 L80 30 L120 20 L160 25 L200 5" fill="none" stroke="#F43F5E" strokeWidth="2" />
                </svg>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-19 Seva Mirror
    if (vizType === 'mirror') {
        return (
            <div className="viz-mirror">
                <div className="vm-nodes">
                    <div className="vm-center">Ramesh, UP</div>
                    <div className="vm-sat s1">PM Kisan<div className="vm-tip">₹6,000/year · Active</div></div>
                    <div className="vm-sat s2">Ayushman</div>
                    <div className="vm-sat s3">3 Grievances</div>
                    <div className="vm-sat s4">JanConnect</div>
                    <div className="vm-sat s5">2 pending</div>
                </div>
                <svg className="vm-lines" viewBox="0 0 300 300">
                    <line x1="150" y1="150" x2="150" y2="50" />
                    <line x1="150" y1="150" x2="245" y2="81" />
                    <line x1="150" y1="150" x2="209" y2="231" />
                    <line x1="150" y1="150" x2="91" y2="231" />
                    <line x1="150" y1="150" x2="55" y2="81" />
                </svg>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-20 Predict My Future
    if (vizType === 'future') {
        return (
            <div className="viz-future">
                <div className="vfu-header">If you have a child →</div>
                <div className="vfu-cols">
                    <div className="vfu-col">
                        <div className="vfu-title">1 Year</div>
                        <div className="vfu-chip f1">Janani Suraksha</div>
                    </div>
                    <div className="vfu-col">
                        <div className="vfu-title">3 Years</div>
                        <div className="vfu-chip f2">PM Matritva</div>
                    </div>
                    <div className="vfu-col">
                        <div className="vfu-title">5 Years</div>
                        <div className="vfu-chip f3">Poshan Abhiyan</div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-21 Threat Corridors
    if (vizType === 'corridors') {
        return (
            <div className="viz-corridors">
                <svg className="vco-map" viewBox="0 0 300 200">
                    <path d="M100 20 L200 40 L250 120 L150 180 L50 120 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <path className="vco-arc a1" d="M120 60 Q 150 30 180 80" fill="none" />
                    <path className="vco-arc a2" d="M80 140 Q 120 180 160 140" fill="none" />
                </svg>
                <div className="vco-log">UP → Bihar · Water Infrastructure · 78% risk</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-21 Timeline
    if (vizType === 'timeline') {
        return (
            <div className="viz-timeline">
                <div className="vtl-line" />
                <div className="vtl-event e1" style={{ borderLeftColor: color }}>
                    <div className="vtl-time">10:00 AM</div>
                    <div className="vtl-desc">New proposal in Sector 4</div>
                </div>
                <div className="vtl-event e2" style={{ borderLeftColor: color }}>
                    <div className="vtl-time">11:30 AM</div>
                    <div className="vtl-desc">50 upvotes reached</div>
                </div>
                <div className="vtl-event e3" style={{ borderLeftColor: color }}>
                    <div className="vtl-time">02:15 PM</div>
                    <div className="vtl-desc">Forwarded to Municipal Council</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-02 Shield
    if (vizType === 'shield') {
        return (
            <div className="viz-shield">
                <svg viewBox="0 0 100 120" className="vsh-svg">
                    <path d="M50 5 L90 25 L90 60 C90 90 70 110 50 115 C30 110 10 90 10 60 L10 25 Z"
                        fill="rgba(16, 185, 129, 0.1)" stroke={color} strokeWidth="2" className="vsh-path" />
                </svg>
                <div className="vsh-lock">
                    <div className="vsh-shackle" />
                    <div className="vsh-body">AES-256</div>
                </div>
                <div className="vsh-scan" />
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-22 Newsfeed
    if (vizType === 'newsfeed') {
        return (
            <div className="viz-newsfeed">
                <div className="vnf-marquee">
                    <span>[URGENT] Water supply restored in Ward 12</span>
                    <span className="dot">•</span>
                    <span>New EV subsidy approved by State Council</span>
                    <span className="dot">•</span>
                    <span>Highway 4B expansion tender opens tomorrow</span>
                    <span className="dot">•</span>
                    <span>[ALERT] Heavy rain warning issued for Coastal zones</span>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-01 Globe
    if (vizType === 'globe') {
        return (
            <div className="viz-globe">
                <div className="vgl-sphere" style={{ boxShadow: `inset 0 0 50px ${color}40, 0 0 20px ${color}20` }}>
                    <div className="vgl-eq" />
                    <div className="vgl-mer" />
                    <div className="vgl-mer m2" />
                    <div className="vgl-mer m3" />
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-03 Biometric
    if (vizType === 'biometric') {
        return (
            <div className="viz-biometric">
                <div className="vbm-print" style={{ color: color }}>
                    {[...Array(6)].map((_, i) => <div className={`vbm-ridge r${i}`} key={i} />)}
                </div>
                <div className="vbm-scan" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }} />
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-06 Profile Hologram
    if (vizType === 'profile') {
        return (
            <div className="viz-profile">
                <div className="vpr-card" style={{ borderColor: `${color}40` }}>
                    <div className="vpr-head" />
                    <div className="vpr-body" />
                    <div className="vpr-lines">
                        <div className="vpr-l1" />
                        <div className="vpr-l2" />
                        <div className="vpr-l3" />
                    </div>
                </div>
                <div className="vpr-base" style={{ background: `radial-gradient(ellipse at center, ${color}60 0%, transparent 70%)` }} />
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-09 Radar
    if (vizType === 'radar') {
        return (
            <div className="viz-radar" style={{ borderColor: `${color}40` }}>
                <div className="vrd-sweep" style={{ background: `conic-gradient(from 0deg, transparent 70%, ${color} 100%)` }} />
                <div className="vrd-dot d1" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                <div className="vrd-dot d2" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                <div className="vrd-dot d3" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-13 Translate
    if (vizType === 'translate') {
        return (
            <div className="viz-translate">
                <div className="vtr-box left">A</div>
                <div className="vtr-arrows">→</div>
                <div className="vtr-box right" style={{ color: color, textShadow: `0 0 10px ${color}` }}>अ</div>
                <div className="vtr-stream">
                    <span>नमस्ते</span><span>வணக்கம்</span><span>ನಮಸ್ಕಾರ</span><span>হ্যালো</span>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-14 Waveform
    if (vizType === 'waveform') {
        return (
            <div className="viz-waveform">
                {[...Array(15)].map((_, i) => (
                    <div className="vwf-bar" key={i} style={{ background: color, animationDelay: `${Math.random() * -2}s` }} />
                ))}
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-16 Dictation
    if (vizType === 'dictation') {
        return (
            <div className="viz-dictation">
                <div className="vdc-mic">🎤</div>
                <div className="vdc-ring ring1" style={{ borderColor: color }} />
                <div className="vdc-ring ring2" style={{ borderColor: color }} />
                <div className="vdc-ring ring3" style={{ borderColor: color }} />
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-18 Barcode
    if (vizType === 'barcode') {
        return (
            <div className="viz-barcode">
                <div className="vbc-lines">
                    {[...Array(20)].map((_, i) => (
                        <div className="vbc-line" key={i} style={{ width: `${Math.max(2, Math.random() * 8)}px` }} />
                    ))}
                </div>
                <div className="vbc-laser" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                <div className="vbc-hash">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // ADVANCED UPGRADES
    // -------------------------------------------------------------

    if (vizType === 'v-portal') {
        return (
            <div className="viz-portal">
                <div className="vpt-ring r1" style={{ borderColor: color }} />
                <div className="vpt-ring r2" style={{ borderColor: color }} />
                <div className="vpt-ring r3" style={{ borderColor: color }} />
                <div className="vpt-core">
                    <span className="vpt-lang l1">नमस्ते</span>
                    <span className="vpt-lang l2">வணக்கம்</span>
                    <span className="vpt-lang l3">Hello</span>
                    <span className="vpt-lang l4">नमो नमः</span>
                </div>
            </div>
        );
    }

    if (vizType === 'v-holoform') {
        return (
            <div className="viz-holoform">
                <div className="vhf-doc" style={{ borderColor: `${color}40`, boxShadow: `0 0 20px ${color}20` }}>
                    <div className="vhf-header" style={{ background: color }} />
                    <div className="vhf-lines">
                        <div className="vhf-line w80" />
                        <div className="vhf-line w60" />
                        <div className="vhf-line w90" />
                        <div className="vhf-line w40" />
                    </div>
                    <div className="vhf-scanner" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }} />
                    <div className="vhf-stamp" style={{ color: '#10B981', borderColor: '#10B981' }}>APPROVED</div>
                </div>
            </div>
        );
    }

    if (vizType === 'v-dashboard') {
        return (
            <div className="viz-dashboard">
                <div className="vdb-dials">
                    <svg viewBox="0 0 100 100" className="vdb-dial">
                        <circle cx="50" cy="50" r="40" className="vdb-bg" />
                        <circle cx="50" cy="50" r="40" className="vdb-fg" style={{ stroke: color }} />
                    </svg>
                    <div className="vdb-stats">
                        <div className="vdb-bar b1" style={{ background: color }} />
                        <div className="vdb-bar b2" style={{ background: color }} />
                        <div className="vdb-bar b3" style={{ background: color }} />
                    </div>
                </div>
                <div className="vdb-grid">
                    <div className="vdb-cell c1" />
                    <div className="vdb-cell c2" />
                    <div className="vdb-cell c3" />
                </div>
            </div>
        );
    }

    if (vizType === 'v-shortcuts') {
        return (
            <div className="viz-shortcuts">
                <div className="vsc-center" style={{ background: color, boxShadow: `0 0 20px ${color}` }}>⚡</div>
                <div className="vsc-orbit">
                    <div className="vsc-node n1">📄</div>
                    <div className="vsc-node n2">💳</div>
                    <div className="vsc-node n3">🏥</div>
                    <div className="vsc-node n4">🎓</div>
                </div>
                <div className="vsc-pulses">
                    <div className="vsc-pulse p1" style={{ borderColor: color }} />
                    <div className="vsc-pulse p2" style={{ borderColor: color }} />
                </div>
            </div>
        );
    }

    if (vizType === 'v-vault') {
        return (
            <div className="viz-vault">
                <div className="vvt-door">
                    <div className="vvt-gear g1" />
                    <div className="vvt-gear g2" />
                    <div className="vvt-center">
                        <div className="vvt-lock-status">SECURE</div>
                    </div>
                </div>
                <div className="vvt-shield">🛡️</div>
            </div>
        );
    }

    if (vizType === 'v-synapse') {
        return (
            <div className="viz-synapse">
                <div className="vsn-side left">
                    <div className="vsn-dot" />
                    <div className="vsn-dot" />
                    <div className="vsn-dot" />
                </div>
                <div className="vsn-beams">
                    <div className="vsn-beam b1" style={{ background: color }} />
                    <div className="vsn-beam b2" style={{ background: color }} />
                    <div className="vsn-beam b3" style={{ background: color }} />
                    <div className="vsn-core" style={{ boxShadow: `0 0 30px ${color}` }}>99.8%</div>
                </div>
                <div className="vsn-side right">
                    <div className="vsn-dot" />
                    <div className="vsn-dot" />
                </div>
            </div>
        );
    }

    if (vizType === 'v-hexagon') {
        return (
            <div className="viz-hexagon">
                <div className="vhx-grid">
                    <div className="vhx-hex h1" style={{ borderColor: color }}><div className="vhx-inner" /></div>
                    <div className="vhx-hex h2" style={{ borderColor: color }}><div className="vhx-inner pulse" /></div>
                    <div className="vhx-hex h3" style={{ borderColor: color }}><div className="vhx-inner" /></div>
                    <div className="vhx-hex h4" style={{ borderColor: color }}><div className="vhx-inner pulse" /></div>
                    <div className="vhx-hex h5 pulse-border" style={{ borderColor: color, boxShadow: `0 0 20px ${color} inset` }}>
                        <div className="vhx-core-val">87<br /><span>PTS</span></div>
                    </div>
                    <div className="vhx-hex h6" style={{ borderColor: color }}><div className="vhx-inner pulse" /></div>
                    <div className="vhx-hex h7" style={{ borderColor: color }}><div className="vhx-inner" /></div>
                </div>
                <div className="vhx-sweeper" />
            </div>
        );
    }

    if (vizType === 'v-constellation') {
        return (
            <div className="viz-constellation">
                <div className="vcs-space">
                    <div className="vcs-node n1" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                    <div className="vcs-node n2" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                    <div className="vcs-node n3" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                    <div className="vcs-node n4" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                    <div className="vcs-node n5" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                    <div className="vcs-line l1" style={{ background: color }} />
                    <div className="vcs-line l2" style={{ background: color }} />
                    <div className="vcs-line l3" style={{ background: color }} />
                    <div className="vcs-line l4" style={{ background: color }} />
                    <div className="vcs-scanner" />
                </div>
                <div className="vcs-legend">
                    <div>AGRI</div><div>MED</div><div>EDU</div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // M-20 Escrow Verification
    if (vizType === 'escrow') {
        return (
            <div className="viz-escrow">
                <div className="ves-system">
                    <div className="ves-ai-core">
                        <div className="ves-photo">
                            <div className="ves-mesh" />
                            <div className="ves-scan-line" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                            <div className="ves-cam">📷</div>
                        </div>
                        <div className="ves-status">AI VERIFYING</div>
                    </div>
                    <div className="ves-beam">
                        <div className="ves-particles" />
                    </div>
                    <div className="ves-vault">
                        <div className="ves-lock">
                            <div className="ves-shackle" />
                            <div className="ves-rupee">₹</div>
                        </div>
                        <div className="ves-funds">FUNDS RELEASED</div>
                    </div>
                </div>
            </div>
        );
    }

    if (vizType === 'v-citizendash') {
        return (
            <div className="viz-citizendash">
                <div className="vds-hologram" style={{ borderColor: color, boxShadow: `0 0 20px ${color}40`, background: `${color}10` }}>
                    <div className="vds-header">
                        <div className="vds-avatar" style={{ borderColor: color, background: `${color}30` }} />
                        <div className="vds-title-bar" style={{ background: color }} />
                    </div>
                    <div className="vds-grid">
                        <div className="vds-donut-card" style={{ borderColor: `${color}40` }}>
                            <div className="vds-donut" style={{ borderTopColor: color, borderRightColor: color }} />
                            <div className="vds-donut-inner" style={{ borderBottomColor: color, borderLeftColor: color }} />
                        </div>
                        <div className="vds-bar-card" style={{ borderColor: `${color}40` }}>
                            <div className="vds-bar b1" style={{ background: color }} />
                            <div className="vds-bar b2" style={{ background: color }} />
                            <div className="vds-bar b3" style={{ background: color }} />
                            <div className="vds-bar b4" style={{ background: color }} />
                        </div>
                    </div>
                    <div className="vds-notifications">
                        <div className="vds-notif n1" style={{ background: `${color}30` }} />
                        <div className="vds-notif n2" style={{ background: `${color}30` }} />
                        <div className="vds-notif n3" style={{ background: `${color}30` }} />
                    </div>
                    <div className="vds-scanner" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                </div>
            </div>
        );
    }

    if (vizType === 'v-reactor') {
        return (
            <div className="viz-reactor">
                <div className="vrc-core" style={{ boxShadow: `0 0 30px ${color}, inset 0 0 20px #fff`, background: color }}>
                    <div className="vrc-energy" />
                </div>
                <div className="vrc-ring-x" style={{ borderColor: `${color}80` }} />
                <div className="vrc-ring-y" style={{ borderColor: `${color}80` }} />
                <div className="vrc-sphere">
                    <div className="vrc-orb o1" style={{ background: color, boxShadow: `0 0 15px ${color}` }}>⚡</div>
                    <div className="vrc-orb o2" style={{ background: color, boxShadow: `0 0 15px ${color}` }}>💳</div>
                    <div className="vrc-orb o3" style={{ background: color, boxShadow: `0 0 15px ${color}` }}>🏥</div>
                </div>
                <div className="vrc-lightning l1" style={{ background: color }} />
                <div className="vrc-lightning l2" style={{ background: color }} />
            </div>
        );
    }

    if (vizType === 'v-aimatch') {
        return (
            <div className="viz-aimatch">
                <div className="vam-cube">
                    <div className="vam-face f-front" style={{ borderColor: color }} />
                    <div className="vam-face f-back" style={{ borderColor: color }} />
                    <div className="vam-face f-right" style={{ borderColor: color }} />
                    <div className="vam-face f-left" style={{ borderColor: color }} />
                    <div className="vam-face f-top" style={{ borderColor: color }} />
                    <div className="vam-face f-bottom" style={{ borderColor: color }} />
                    <div className="vam-ai-core">AI</div>
                </div>
                <div className="vam-cards">
                    <div className="vam-card c1" style={{ background: `${color}20`, borderColor: color }}>+ PM KISAN</div>
                    <div className="vam-card c2" style={{ background: `${color}20`, borderColor: color }}>+ AYUSHMAN</div>
                </div>
                <div className="vam-scan" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }} />
            </div>
        );
    }

    if (vizType === 'v-firewall') {
        return (
            <div className="viz-firewall">
                <div className="vfw-attacks">
                    <div className="vfw-attack a1" />
                    <div className="vfw-attack a2" />
                    <div className="vfw-attack a3" />
                </div>
                <div className="vfw-shield-container">
                    <div className="vfw-shield-front" style={{ borderColor: color, boxShadow: `0 0 30px ${color}` }}>
                        <div className="vfw-shield-glaze" />
                        <div className="vfw-lock-icon">🔒</div>
                    </div>
                    <div className="vfw-waves">
                        <div className="vfw-wave w1" style={{ borderColor: color }} />
                        <div className="vfw-wave w2" style={{ borderColor: color }} />
                    </div>
                </div>
                <div className="vfw-status">
                    <div className="vfw-status-text" style={{ color: '#10B981' }}>CONSENT SECURED</div>
                </div>
            </div>
        );
    }

    if (vizType === 'v-quantumid') {
        return (
            <div className="viz-quantumid">
                <div className="vqi-network">
                    <div className="vqi-node n1" />
                    <div className="vqi-node n2" />
                    <div className="vqi-node n3" />
                    <div className="vqi-node n4" />
                    <div className="vqi-link l1" />
                    <div className="vqi-link l2" />
                    <div className="vqi-link l3" />
                </div>
                <div className="vqi-core-hologram">
                    <div className="vqi-plate" style={{ borderColor: color }}>
                        <div className="vqi-hash">ID: 0x7A99F...</div>
                        <div className="vqi-barcode">
                            <div className="vqi-bar b1" />
                            <div className="vqi-bar b2" />
                            <div className="vqi-bar b3" />
                            <div className="vqi-bar b4" />
                            <div className="vqi-bar b5" />
                        </div>
                        <div className="vqi-scan-plane" style={{ color: color }} />
                    </div>
                    <div className="vqi-ring r1" style={{ borderColor: color }} />
                    <div className="vqi-ring r2" style={{ borderColor: color }} />
                </div>
                <div className="vqi-floating-data">
                    <div className="vqi-data d1">ENCRYPTED</div>
                    <div className="vqi-data d2">VERIFIED</div>
                </div>
            </div>
        );
    }

    if (vizType === 'v-broadcast') {
        return (
            <div className="viz-broadcast">
                <div className="vbc-ticker-3d">
                    <div className="vbc-row r1">
                        <div className="vbc-tag" style={{ background: color }}>BREAKING</div>
                        <div className="vbc-text">WATER SUPPLY RESTORED — WARD 12 PUMP REPAIRED</div>
                    </div>
                    <div className="vbc-row r2">
                        <div className="vbc-tag" style={{ background: color }}>STATE ALERT</div>
                        <div className="vbc-text">HEAVY RAIN WARNING — COASTAL ZONES ON STANDBY</div>
                    </div>
                    <div className="vbc-row r3">
                        <div className="vbc-tag" style={{ background: color }}>SUBSIDY LIVE</div>
                        <div className="vbc-text">NEW EV SCHEME FUNDS DISBURSED TO 14,000 CITIZENS</div>
                    </div>
                </div>
                <div className="vbc-deco-lines">
                    <div className="vbc-line" style={{ background: color }} />
                    <div className="vbc-line" style={{ background: color }} />
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // Default Fallback
    return (
        <div className="viz-fallback" style={{ color }}>
            [ {vizType.toUpperCase()} ]<br />
            <span style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: '8px', display: 'block' }}>Signal Established</span>
        </div>
    );
}
