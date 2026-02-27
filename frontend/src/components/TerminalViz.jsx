import React, { useState, useEffect } from 'react';
import './IntelligenceTerminalViz.css';

export default function TerminalViz({ vizType, color }) {
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
                <div className="vf-counter">847 frauds blocked today</div>
                <div className="vf-stream">
                    <div className="vf-log ok">✓ VERIFIED · USR-9ABF2</div>
                    <div className="vf-log ok">✓ VERIFIED · USR-12X21</div>
                    <div className="vf-log warn">⚠ ANALYZING · USR-QQ412</div>
                    <div className="vf-log ok">✓ VERIFIED · USR-98N21</div>
                    <div className="vf-log block">⛔ FRAUD DETECTED — BLOCKED · USR-00XVOID</div>
                    <div className="vf-log ok">✓ VERIFIED · USR-LLK21</div>
                    <div className="vf-log ok">✓ VERIFIED · USR-XAQ11</div>
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
                    <span className="vpe-num n1">1 citizen</span>
                    <span className="vpe-num n2">47 citizens</span>
                    <span className="vpe-num n3">1,204 citizens</span>
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
                    <div className="vs-score">847</div>
                </div>
                <div className="vs-lvl">⭐ Level 4 — JanSevak</div>
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
                <div className="vru-val">₹2,47,83,<span className="vru-tick">291</span></div>
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
    // Default Fallback

    return (
        <div className="viz-fallback" style={{ color }}>
            [ {vizType.toUpperCase()} ]<br />
            <span style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: '8px', display: 'block' }}>Signal Established</span>
        </div>
    );
}
