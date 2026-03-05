import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── Shared keyframe injection ─────────────────────────────── */
const STYLES = `
@keyframes ob-fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ob-slideL { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
@keyframes ob-slideR { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
@keyframes ob-grow   { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
@keyframes ob-pulse  { 0%,100%{ r:6; opacity:.8; } 50%{ r:11; opacity:1; } }
@keyframes ob-dash   { to { stroke-dashoffset: 0; } }
@keyframes ob-typing { from { width: 0; } to { width: 100%; } }
@keyframes ob-float  { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
@keyframes ob-spin   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes ob-glow   { 0%,100%{ opacity:.5; transform:scale(1); } 50%{ opacity:1; transform:scale(1.08); } }
@keyframes ob-checkin { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }
@keyframes ob-bar    { from { width: 0; } to { width: var(--w); } }
@keyframes ob-pop    { 0%{ transform:scale(0.6); opacity:0; } 60%{ transform:scale(1.08); opacity:1; } 100%{ transform:scale(1); } }
@keyframes ob-shimmer { 0%{ background-position: -200% center; } 100%{ background-position: 200% center; } }
@keyframes ob-progress { from { width: 0%; } to { width: 100%; } }
`;

/* ─── Slide 1: Welcome ───────────────────────────────────────── */
function SlideWelcome() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <svg width="320" height="220" viewBox="0 0 320 220" fill="none" style={{ animation: 'ob-fadein 0.8s ease' }}>
                {/* Background glow */}
                <circle cx="160" cy="110" r="90" fill="rgba(255,107,44,0.06)" />
                <circle cx="160" cy="110" r="60" fill="rgba(255,107,44,0.08)" style={{ animation: 'ob-glow 3s ease-in-out infinite' }} />
                {/* Chakra wheel */}
                <g style={{ animation: 'ob-spin 12s linear infinite', transformOrigin: '160px 110px' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <line key={i} x1="160" y1="74" x2="160" y2="84" stroke="#FF6B2C" strokeWidth="2.5" strokeLinecap="round"
                            transform={`rotate(${i * 45} 160 110)`} />
                    ))}
                </g>
                <circle cx="160" cy="110" r="22" stroke="#FF6B2C" strokeWidth="2.5" fill="none" />
                <circle cx="160" cy="110" r="6" fill="#FF6B2C" />
                {/* Orbiting dots */}
                <circle cx="160" cy="68" r="4" fill="#00C896" style={{ animation: 'ob-pulse 2s ease-in-out infinite' }} />
                <circle cx="202" cy="110" r="3.5" fill="#8B5CF6" style={{ animation: 'ob-pulse 2.4s ease-in-out .4s infinite' }} />
                <circle cx="160" cy="152" r="4" fill="#3B82F6" style={{ animation: 'ob-pulse 2.2s ease-in-out .8s infinite' }} />
                <circle cx="118" cy="110" r="3.5" fill="#F59E0B" style={{ animation: 'ob-pulse 2.6s ease-in-out 1.2s infinite' }} />
                {/* Stars */}
                {[[50,40],[265,35],[290,160],[30,175],[140,190]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.4)"
                        style={{ animation: `ob-pulse ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
                {/* Text "NCIE" */}
                <text x="160" y="195" textAnchor="middle" fill="rgba(255,107,44,0.7)" fontSize="11" fontWeight="800" fontFamily="'Space Grotesk',sans-serif" letterSpacing="4">NCIE</text>
            </svg>
            <div style={{ textAlign: 'center', animation: 'ob-fadein 0.9s ease 0.2s both' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg,#FF6B2C,#00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome to Project NCIE
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto' }}>
                    India's first AI-powered governance platform — designed to ensure every citizen receives the services, schemes, and justice they deserve.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                    {[{ c: '#FF6B2C', t: 'AI-Driven' }, { c: '#00C896', t: 'Multilingual' }, { c: '#8B5CF6', t: 'Predictive' }, { c: '#3B82F6', t: '1.4B Citizens' }].map((b, i) => (
                        <span key={b.t} style={{ fontSize: '0.75rem', fontWeight: 700, color: b.c, background: `${b.c}15`, border: `1px solid ${b.c}30`, borderRadius: 100, padding: '4px 12px', animation: `ob-pop 0.5s ease ${0.4 + i * 0.1}s both` }}>{b.t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Slide 2: File a Grievance ─────────────────────────────── */
function SlideGrievance() {
    const [phase, setPhase] = useState(0);
    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 600);
        const t2 = setTimeout(() => setPhase(2), 1400);
        const t3 = setTimeout(() => setPhase(3), 2400);
        return () => [t1, t2, t3].forEach(clearTimeout);
    }, []);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <svg width="340" height="220" viewBox="0 0 340 220" fill="none" style={{ animation: 'ob-fadein 0.6s ease' }}>
                {/* Phone/Form mock */}
                <rect x="80" y="20" width="180" height="180" rx="14" fill="#0a1628" stroke="rgba(255,107,44,0.3)" strokeWidth="1.5" />
                <rect x="88" y="36" width="164" height="12" rx="4" fill="rgba(255,107,44,0.12)" />
                <text x="170" y="46" textAnchor="middle" fill="rgba(255,107,44,0.8)" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">FILE A GRIEVANCE</text>
                {/* Form fields */}
                {[52, 72, 92, 112].map((y, i) => (
                    <g key={y} style={{ opacity: phase >= 1 ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.1}s` }}>
                        <rect x="95" y={y} width="70" height="10" rx="3" fill={phase >= 2 && i < 2 ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.04)'} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                        {phase >= 2 && i < 3 && <rect x="97" y={y+2} width={[45,55,60,0][i]} height="6" rx="2" fill={['rgba(255,107,44,0.4)', 'rgba(0,200,150,0.3)', 'rgba(59,130,246,0.3)'][i % 3]} />}
                        <rect x="172" y={y} width="70" height="10" rx="3" fill={phase >= 2 && i < 2 ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.04)'} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                        {phase >= 2 && i >= 1 && <rect x="174" y={y+2} width={[0,50,40,30][i]} height="6" rx="2" fill="rgba(139,92,246,0.3)" />}
                    </g>
                ))}
                {/* Mic icon */}
                <g style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.4s ease 0.4s' }}>
                    <rect x="95" y="130" width="147" height="34" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                    <circle cx="106" cy="147" r="7" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
                    <line x1="103" y1="147" x2="109" y2="147" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="106" y1="144" x2="106" y2="150" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
                    <text x="118" y="150" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Inter,sans-serif">Audio Grievance (Any Language)</text>
                </g>
                {/* Submit button */}
                <g style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.5s ease', animation: phase >= 3 ? 'ob-pop 0.4s ease' : 'none' }}>
                    <rect x="110" y="172" width="120" height="18" rx="9" fill="url(#ob-grad1)" />
                    <text x="170" y="184" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">✓ Submit Grievance</text>
                    <defs><linearGradient id="ob-grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6B2C"/><stop offset="100%" stopColor="#EF4444"/></linearGradient></defs>
                </g>
                {/* AI analysis badge */}
                {phase >= 3 && (
                    <g style={{ animation: 'ob-slideR 0.5s ease' }}>
                        <rect x="272" y="60" width="60" height="40" rx="6" fill="#0D1B2E" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
                        <text x="302" y="75" textAnchor="middle" fill="#A78BFA" fontSize="6.5" fontWeight="700" fontFamily="Inter,sans-serif">🤖 AI</text>
                        <text x="302" y="87" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5.5" fontFamily="Inter,sans-serif">Analyzed</text>
                        <line x1="272" y1="80" x2="260" y2="80" stroke="rgba(139,92,246,0.4)" strokeWidth="1" strokeDasharray="3,2" />
                    </g>
                )}
            </svg>
            <div style={{ textAlign: 'center', animation: 'ob-fadein 0.8s ease 0.3s both' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, color: '#FF6B2C' }}>File a Grievance</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
                    Submit complaints in text or your native language via audio. Our AI instantly analyzes sentiment, assigns priority, and routes to the correct department — within seconds.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
                    {['Text & Audio', 'AI Priority', '10 Languages', 'Real-time Track'].map((t, i) => (
                        <span key={t} style={{ fontSize: '0.72rem', color: '#FF6B2C', background: 'rgba(255,107,44,0.1)', border: '1px solid rgba(255,107,44,0.25)', borderRadius: 6, padding: '3px 9px', animation: `ob-pop 0.4s ease ${0.5 + i * 0.08}s both` }}>{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Slide 3: PRESEVA Prediction ───────────────────────────── */
function SlidePreseva() {
    const [phase, setPhase] = useState(0);
    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 400);
        const t2 = setTimeout(() => setPhase(2), 1200);
        const t3 = setTimeout(() => setPhase(3), 2000);
        return () => [t1, t2, t3].forEach(clearTimeout);
    }, []);
    const threats = [
        { x: 170, y: 90, label: 'UP', color: '#EF4444', pct: '91%', d: 0 },
        { x: 190, y: 120, label: 'Bihar', color: '#F97316', pct: '78%', d: 200 },
        { x: 130, y: 130, label: 'MP', color: '#F59E0B', pct: '65%', d: 400 },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <svg width="340" height="220" viewBox="0 0 340 220" fill="none" style={{ animation: 'ob-fadein 0.6s ease' }}>
                {/* India map silhouette */}
                <path d="M135 30 L155 25 L175 28 L190 35 L200 50 L205 65 L208 80 L210 95 L205 115 L200 130 L192 145 L185 158 L175 168 L165 175 L155 170 L148 160 L140 148 L132 135 L125 120 L120 105 L118 90 L120 75 L125 60 L130 45 Z"
                    fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="1.2" />
                {/* Threat pulse dots */}
                {threats.map((t, i) => phase >= 1 && (
                    <g key={t.label}>
                        <circle cx={t.x} cy={t.y} r="12" fill={`${t.color}20`} style={{ animation: `ob-glow 1.5s ease-in-out ${i * 0.4}s infinite` }} />
                        <circle cx={t.x} cy={t.y} r="5" fill={t.color} style={{ animation: `ob-pulse 1.2s ease-in-out ${i * 0.3}s infinite` }} />
                    </g>
                ))}
                {/* Prevention arrows */}
                {phase >= 2 && threats.map((t, i) => (
                    <g key={`arr-${t.label}`} style={{ animation: `ob-fadeIn 0.4s ease ${i * 0.2}s both` }}>
                        <line x1={t.x + 14} y1={t.y} x2={t.x + 28} y2={t.y - 8} stroke="#00C896" strokeWidth="1.5" strokeDasharray="40" style={{ strokeDashoffset: phase >= 2 ? 0 : 40, transition: 'stroke-dashoffset 0.6s ease' }} />
                    </g>
                ))}
                {/* Department alert boxes */}
                {phase >= 2 && [
                    { x: 240, y: 55, label: 'Jal Shakti', pct: threats[0].pct },
                    { x: 240, y: 100, label: 'Health Dept', pct: threats[1].pct },
                    { x: 240, y: 145, label: 'PWD', pct: threats[2].pct },
                ].map((b, i) => (
                    <g key={b.label} style={{ animation: `ob-slideR 0.4s ease ${i * 0.15}s both` }}>
                        <rect x={b.x} y={b.y - 8} width="72" height="26" rx="5" fill="#0D1B2E" stroke="rgba(0,200,150,0.35)" strokeWidth="1" />
                        <text x={b.x + 4} y={b.y + 4} fill="#00C896" fontSize="6" fontWeight="700" fontFamily="Inter,sans-serif">✓ {b.label}</text>
                        <text x={b.x + 4} y={b.y + 13} fill="rgba(255,255,255,0.4)" fontSize="5.5" fontFamily="Inter,sans-serif">Alerted · {b.pct} risk</text>
                    </g>
                ))}
                {/* Resolution animation */}
                {phase >= 3 && threats.map((t, i) => (
                    <g key={`res-${i}`} style={{ animation: 'ob-pop 0.4s ease both' }}>
                        <circle cx={t.x} cy={t.y} r="8" fill="rgba(0,200,150,0.25)" stroke="#00C896" strokeWidth="1.5" />
                        <text x={t.x} y={t.y + 4} textAnchor="middle" fill="#00C896" fontSize="8">✓</text>
                    </g>
                ))}
                {/* PRESEVA label */}
                <text x="50" y="200" fill="rgba(139,92,246,0.7)" fontSize="8" fontWeight="800" fontFamily="'Space Grotesk',sans-serif" letterSpacing="2">PRESEVA AI</text>
                <text x="50" y="210" fill="rgba(255,255,255,0.25)" fontSize="6.5" fontFamily="Inter,sans-serif">Predictive Governance Intelligence</text>
            </svg>
            <div style={{ textAlign: 'center', animation: 'ob-fadein 0.8s ease 0.3s both' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, color: '#8B5CF6' }}>PRESEVA — AI Prevents Problems</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
                    The world's first proactive governance AI. PRESEVA analyzes millions of patterns to predict public service failures 48–72 hours before they happen — alerting departments automatically.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
                    {['Predictive AI', '94% Accuracy', '48h Warning', 'Auto-Alerts'].map((t, i) => (
                        <span key={t} style={{ fontSize: '0.72rem', color: '#A78BFA', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 6, padding: '3px 9px', animation: `ob-pop 0.4s ease ${0.5 + i * 0.08}s both` }}>{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Slide 4: Scheme Discovery ─────────────────────────────── */
function SlideSchemes() {
    const cards = [
        { name: 'PM-KISAN', cat: 'Agriculture', match: 92, color: '#10B981' },
        { name: 'Ayushman Bharat', cat: 'Healthcare', match: 88, color: '#EF4444' },
        { name: 'PM Awas Yojana', cat: 'Housing', match: 75, color: '#3B82F6' },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <svg width="340" height="220" viewBox="0 0 340 220" fill="none" style={{ animation: 'ob-fadein 0.6s ease' }}>
                {/* AI match badge at top */}
                <rect x="110" y="12" width="120" height="20" rx="10" fill="rgba(255,107,44,0.12)" stroke="rgba(255,107,44,0.3)" strokeWidth="1" />
                <text x="170" y="25" textAnchor="middle" fill="#FF6B2C" fontSize="7.5" fontWeight="800" fontFamily="Inter,sans-serif">🤖 12 Schemes Matched to You</text>
                {/* Scheme cards */}
                {cards.map((c, i) => (
                    <g key={c.name} style={{ animation: `ob-slideL 0.5s ease ${0.2 + i * 0.2}s both` }}>
                        <rect x="50" y={44 + i * 54} width="240" height="46" rx="8"
                            fill={`${c.color}08`} stroke={`${c.color}30`} strokeWidth="1.2" />
                        <rect x="58" y={52 + i * 54} width="8" height="8" rx="2" fill={c.color} />
                        <text x="74" y={60 + i * 54} fill="rgba(255,255,255,0.9)" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">{c.name}</text>
                        <text x="74" y={72 + i * 54} fill="rgba(255,255,255,0.35)" fontSize="6.5" fontFamily="Inter,sans-serif">{c.cat}</text>
                        {/* Match bar */}
                        <rect x="58" y={78 + i * 54} width="110" height="4" rx="2" fill="rgba(255,255,255,0.07)" />
                        <rect x="58" y={78 + i * 54} width={c.match * 1.1} height="4" rx="2" fill={c.color}
                            style={{ animation: `ob-bar 0.8s ease ${0.4 + i * 0.2}s both`, '--w': `${c.match * 1.1}px` }} />
                        <text x="176" y={83 + i * 54} fill={c.color} fontSize="7" fontWeight="800" fontFamily="'Space Grotesk',sans-serif">{c.match}% match</text>
                        {/* Apply button */}
                        <rect x="224" y={52 + i * 54} width="48" height="14" rx="5" fill={`${c.color}20`} stroke={`${c.color}40`} strokeWidth="0.8" />
                        <text x="248" y={62 + i * 54} textAnchor="middle" fill={c.color} fontSize="6.5" fontWeight="700" fontFamily="Inter,sans-serif">Apply</text>
                    </g>
                ))}
                {/* Bottom badge */}
                <g style={{ animation: 'ob-fadein 0.5s ease 0.9s both' }}>
                    <rect x="90" y="198" width="160" height="16" rx="8" fill="rgba(0,200,150,0.1)" stroke="rgba(0,200,150,0.25)" strokeWidth="0.8" />
                    <text x="170" y="209" textAnchor="middle" fill="#00C896" fontSize="7" fontWeight="700" fontFamily="Inter,sans-serif">✓ Benefits track automatically after applying</text>
                </g>
            </svg>
            <div style={{ textAlign: 'center', animation: 'ob-fadein 0.8s ease 0.3s both' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, color: '#00C896' }}>AI Scheme Discovery</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
                    NAGRIQ AI analyzes your age, income, state and profession to match you with government schemes you qualify for — and shows the ones you've been missing out on.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
                    {['NAGRIQ AI', 'Auto-Match', 'Apply Online', 'Track Benefits'].map((t, i) => (
                        <span key={t} style={{ fontSize: '0.72rem', color: '#00C896', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 6, padding: '3px 9px', animation: `ob-pop 0.4s ease ${0.5 + i * 0.08}s both` }}>{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Slide 5: Your Dashboard ───────────────────────────────── */
function SlideDashboard({ onDone }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <svg width="340" height="210" viewBox="0 0 340 210" fill="none" style={{ animation: 'ob-fadein 0.6s ease' }}>
                {/* Navbar mock */}
                <rect x="30" y="15" width="280" height="18" rx="5" fill="#0a1628" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                {['Dashboard','Schemes','Grievance','Track','AI'].map((l, i) => (
                    <text key={l} x={62 + i * 52} y={27} fill={i === 0 ? '#FF6B2C' : 'rgba(255,255,255,0.3)'} fontSize="6" fontWeight={i === 0 ? '700' : '400'} fontFamily="Inter,sans-serif">{l}</text>
                ))}
                {/* Welcome card */}
                <rect x="30" y="40" width="180" height="50" rx="6" fill="rgba(255,107,44,0.07)" stroke="rgba(255,107,44,0.2)" strokeWidth="1" style={{ animation: 'ob-fadein 0.5s ease 0.2s both' }} />
                <text x="40" y="57" fill="rgba(255,255,255,0.9)" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">Namaste, Citizen 🙏</text>
                <text x="40" y="68" fill="rgba(255,255,255,0.4)" fontSize="6.5" fontFamily="Inter,sans-serif">Your PRESEVA-aware dashboard</text>
                <text x="40" y="80" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Inter,sans-serif">📍 Uttar Pradesh · 12 missed benefits ⚠️</text>
                {/* CI Score badge */}
                <rect x="220" y="40" width="90" height="50" rx="6" fill="rgba(0,200,150,0.08)" stroke="rgba(0,200,150,0.25)" strokeWidth="1" style={{ animation: 'ob-fadein 0.5s ease 0.3s both' }} />
                <text x="265" y="62" textAnchor="middle" fill="#00C896" fontSize="18" fontWeight="900" fontFamily="'Space Grotesk',sans-serif">72</text>
                <text x="265" y="75" textAnchor="middle" fill="rgba(0,200,150,0.7)" fontSize="6.5" fontWeight="700" fontFamily="Inter,sans-serif">CI SCORE</text>
                <text x="265" y="84" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="5.5" fontFamily="Inter,sans-serif">★ Civic Intelligence</text>
                {/* KPI mini tiles */}
                {[['10','Filed','#3B82F6'],['5','Resolved','#00C896'],['12','Schemes','#8B5CF6'],['41h','Alert','#EF4444']].map(([v,l,c],i) => (
                    <g key={l} style={{ animation: `ob-pop 0.4s ease ${0.4 + i * 0.1}s both` }}>
                        <rect x={30 + i * 72} y="100" width="64" height="34" rx="5" fill={`${c}08`} stroke={`${c}20`} strokeWidth="0.8" />
                        <text x={62 + i * 72} y="118" textAnchor="middle" fill={c} fontSize="11" fontWeight="800" fontFamily="'Space Grotesk',sans-serif">{v}</text>
                        <text x={62 + i * 72} y="128" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="6" fontFamily="Inter,sans-serif">{l}</text>
                    </g>
                ))}
                {/* Quick action tiles */}
                {[['🖊️','File','#FF6B2C'],['📋','Track','#3B82F6'],['🎓','Schemes','#00C896'],['🤖','AI Chat','#8B5CF6']].map(([ic,l,c],i) => (
                    <g key={l} style={{ animation: `ob-fadein 0.4s ease ${0.6 + i * 0.1}s both` }}>
                        <rect x={30 + i * 72} y="143" width="64" height="38" rx="6" fill={`${c}08`} stroke={`${c}20`} strokeWidth="0.8" />
                        <text x={62 + i * 72} y="161" textAnchor="middle" fontSize="12">{ic}</text>
                        <text x={62 + i * 72} y="175" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6.5" fontWeight="600" fontFamily="Inter,sans-serif">{l}</text>
                    </g>
                ))}
                {/* Preseva alert strip */}
                <rect x="30" y="188" width="280" height="16" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" strokeWidth="0.8" style={{ animation: 'ob-fadein 0.5s ease 0.8s both' }} />
                <text x="170" y="199" textAnchor="middle" fill="#F87171" fontSize="6.5" fontWeight="700" fontFamily="Inter,sans-serif">⚡ PRESEVA Alert: Water Supply Failure predicted in UP — Dept. notified</text>
            </svg>
            <div style={{ textAlign: 'center', animation: 'ob-fadein 0.8s ease 0.3s both' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg,#FF6B2C,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Governance Dashboard</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
                    Everything in one place — file grievances, track them, explore schemes, get AI assistance, check your CI Score, and stay ahead with PRESEVA alerts for your area.
                </p>
                <button onClick={onDone} style={{
                    marginTop: 20, padding: '12px 36px', borderRadius: 50, border: 'none',
                    background: 'linear-gradient(135deg, #FF6B2C, #8B5CF6)',
                    color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 32px rgba(255,107,44,0.4)',
                    animation: 'ob-pop 0.6s ease 0.5s both, ob-glow 2s ease-in-out 1s infinite',
                    display: 'inline-flex', alignItems: 'center', gap: 8
                }}>
                    🚀 Enter Dashboard
                </button>
            </div>
        </div>
    );
}

/* ─── Main Onboarding Page ───────────────────────────────────── */
const SLIDES = [
    { id: 'welcome',   title: 'Welcome',      Component: SlideWelcome },
    { id: 'grievance', title: 'File Grievance', Component: SlideGrievance },
    { id: 'preseva',   title: 'PRESEVA AI',    Component: SlidePreseva },
    { id: 'schemes',   title: 'Scheme Discovery', Component: SlideSchemes },
    { id: 'dashboard', title: 'Your Dashboard', Component: null },
];

export default function OnboardingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [slide, setSlide] = useState(0);
    const [exiting, setExiting] = useState(false);

    // Skip onboarding if already completed for this user
    useEffect(() => {
        if (user && localStorage.getItem(`ncie_onboarding_done_${user.id}`) === 'true') {
            navigate('/citizen', { replace: true });
        }
    }, [user]);

    const handleDone = () => {
        localStorage.setItem(`ncie_onboarding_done_${user?.id}`, 'true');
        navigate('/citizen');
    };

    const goNext = () => {
        if (slide >= SLIDES.length - 1) { handleDone(); return; }
        setExiting(true);
        setTimeout(() => { setSlide(s => s + 1); setExiting(false); }, 280);
    };

    const goBack = () => {
        if (slide === 0) return;
        setExiting(true);
        setTimeout(() => { setSlide(s => s - 1); setExiting(false); }, 280);
    };

    const CurrentSlide = SLIDES[slide].Component;

    return (
        <div style={{
            minHeight: '100vh', background: '#050b1a',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden'
        }}>
            <style>{STYLES}</style>
            {/* Background ambient */}
            <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,44,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, animation: 'ob-fadein 0.6s ease' }}>
                <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="rgba(255,107,44,0.15)" />
                    <circle cx="20" cy="20" r="12" stroke="#FF6B2C" strokeWidth="2" fill="none" />
                    <circle cx="20" cy="20" r="3" fill="#FF6B2C" />
                    {Array.from({ length: 8 }).map((_, i) => <line key={i} x1="20" y1="9" x2="20" y2="13" stroke="#FF6B2C" strokeWidth="1.5" transform={`rotate(${i * 45} 20 20)`} strokeLinecap="round" />)}
                </svg>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Inter,sans-serif' }}>Project <strong style={{ color: 'white' }}>NCIE</strong></span>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
                {SLIDES.map((s, i) => (
                    <button key={s.id} onClick={() => setSlide(i)} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', background: i === slide ? 'linear-gradient(90deg,#FF6B2C,#8B5CF6)' : i < slide ? 'rgba(0,200,150,0.5)' : 'rgba(255,255,255,0.12)' }} />
                ))}
            </div>

            {/* Slide container */}
            <div style={{
                width: '100%', maxWidth: 480,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '24px 24px 20px',
                opacity: exiting ? 0 : 1, transform: exiting ? 'translateY(12px)' : 'translateY(0)',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                backdropFilter: 'blur(12px)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                minHeight: 460, display: 'flex', flexDirection: 'column', gap: 0
            }}>
                <div style={{ flex: 1 }}>
                    {slide === 4 ? (
                        <SlideDashboard onDone={handleDone} />
                    ) : (
                        <CurrentSlide />
                    )}
                </div>

                {/* Navigation */}
                {slide < 4 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button onClick={goBack} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', cursor: slide === 0 ? 'not-allowed' : 'pointer', opacity: slide === 0 ? 0.3 : 1, fontFamily: 'Inter,sans-serif' }}>← Back</button>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleDone} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Skip tour</button>
                            <button onClick={goNext} style={{ background: 'linear-gradient(135deg,#FF6B2C,#8B5CF6)', color: 'white', border: 'none', borderRadius: 9, padding: '9px 24px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {slide === 3 ? '🚀 Final Step' : 'Next →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Step label */}
            <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif' }}>
                Step {slide + 1} of {SLIDES.length} · {SLIDES[slide].title}
            </div>
        </div>
    );
}
