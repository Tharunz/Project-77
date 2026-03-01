import React, { useState, useEffect } from 'react';
import { MdMap, MdCheckCircle, MdArrowForward, MdLock } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { apiGetBenefitRoadmap } from '../../services/api.service';
import { PROJECT_NAME } from '../../config/constants';

export default function BenefitRoadmap() {
    const { user } = useAuth();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(null);

    useEffect(() => {
        apiGetBenefitRoadmap().then(res => {
            if (res.success && res.data) {
                setRoadmap(res.data);
            }
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ marginRight: 12 }} /> Generating your personalized benefit roadmap...
        </div>
    );

    if (!roadmap) return (
        <div className="page-wrapper" style={{ textAlign: 'center', py: 50 }}>
            <p style={{ color: 'var(--text-secondary)' }}>Unable to load your roadmap at this time. Please try again later.</p>
        </div>
    );

    // Flatten phases into a single steps array for the timeline
    const allSteps = (roadmap.phases || []).flatMap(p =>
        (p.schemes || []).map(s => ({
            ...s,
            phaseId: p.phase,
            phaseLabel: p.label,
            // Map backend scheme properties to roadmap step properties
            title: s.phaseLabel || s.name,
            scheme: s.name,
            benefit: s.benefit || "Multiple Benefits",
            done: !!s.done,
            dueDate: s.dueDate || (p.phase === 1 ? 'Apply Now' : p.phase === 2 ? 'In 15 Days' : 'Next Month'),
            documents: s.documents || ['Aadhaar Card', 'Income Certificate', 'Residence Proof']
        }))
    );

    // Calculate totals locally since backend might not provide summarized Roadmap object
    const totalPotentialBenefit = allSteps.reduce((acc, s) => {
        const val = parseInt(String(s.benefit).replace(/[^0-9]/g, '')) || 0;
        return acc + val;
    }, 0) || 45000;

    const completedSteps = allSteps.filter(s => s.done).length;
    const totalSteps = allSteps.length;
    const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 760, margin: '0 auto' }}>
            {/* Header */}
            <div>
                <h1 className="section-title"><MdMap className="icon" style={{ color: '#00C896' }} /> Your Benefit Roadmap</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    AI-generated 30-day action plan to unlock maximum government benefits for your profile
                </p>
            </div>

            {/* Summary Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,200,150,0.1), rgba(59,130,246,0.06))',
                border: '1px solid rgba(0,200,150,0.25)', borderRadius: 'var(--radius-xl)', padding: '28px 32px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--teal), #3B82F6)' }} />
                <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Potential Annual Benefit</p>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '2.4rem', fontWeight: 900, color: 'var(--teal)' }}>
                            ₹{totalPotentialBenefit.toLocaleString()}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>+₹5 lakh health cover</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Progress ({completedSteps}/{totalSteps} steps)</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--teal)' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 12, background: 'rgba(255, 255, 255, 0.12)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--teal), #3B82F6)', borderRadius: 100, transition: 'width 1s ease' }} />
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                            Complete {totalSteps - completedSteps} more steps to unlock full benefits
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Explainer */}
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: '0.83rem', color: '#A78BFA' }}>
                🤖 <strong>How this works:</strong> {PROJECT_NAME}'s AI analyzed your profile (age {roadmap.userProfile?.age || user?.age || '?'}, state: {roadmap.userProfile?.state || user?.state || '?'}, income: ₹{Number(roadmap.userProfile?.income || user?.income || 0).toLocaleString()}) and identified the schemes you're most likely to qualify for, in the optimal application order to unlock maximum benefits with least effort.
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {allSteps.map((step, i) => {
                    const isActive = activeStep === step.id;
                    const isNext = !step.done && allSteps.find((s, si) => !s.done && si === i);
                    return (
                        <div key={step.id || i} style={{ display: 'flex', gap: 0 }}>
                            {/* Timeline column */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', zIndex: 1, flexShrink: 0,
                                    background: step.done ? 'rgba(0,200,150,0.2)' : isNext ? 'rgba(255,107,44,0.2)' : 'rgba(255, 255, 255, 0.10)',
                                    border: `2px solid ${step.done ? 'var(--teal)' : isNext ? 'var(--saffron)' : 'rgba(255,255,255,0.12)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: step.done ? '1.1rem' : '0.8rem', fontWeight: 800,
                                    color: step.done ? 'var(--teal)' : isNext ? 'var(--saffron)' : 'var(--text-muted)',
                                    transition: 'all 0.3s'
                                }}>
                                    {step.done ? '✓' : i + 1}
                                </div>
                                {i < allSteps.length - 1 && (
                                    <div style={{ width: 2, flex: 1, minHeight: 24, background: step.done ? 'rgba(0,200,150,0.4)' : 'rgba(255,255,255,0.08)' }} />
                                )}
                            </div>

                            {/* Card */}
                            <div style={{
                                flex: 1, marginLeft: 16, marginBottom: i < allSteps.length - 1 ? 16 : 0,
                                background: step.done ? 'rgba(0,200,150,0.05)' : isNext ? 'rgba(255,107,44,0.06)' : 'var(--bg-card)',
                                border: `1px solid ${step.done ? 'rgba(0,200,150,0.2)' : isNext ? 'rgba(255,107,44,0.2)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius)', overflow: 'hidden', opacity: !step.done && !isNext ? 0.6 : 1,
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ padding: '14px 18px', cursor: !step.done ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                                    onClick={() => setActiveStep(isActive ? null : step.id)}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: step.done ? 'var(--teal)' : 'var(--text-white)' }}>{step.title}</h3>
                                            {step.done && <span className="badge badge-resolved">✓ Done</span>}
                                            {!step.done && isNext && <span className="badge badge-pending">👉 {step.phaseLabel}</span>}
                                            {!step.done && !isNext && <MdLock style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />}
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{step.scheme}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: step.done ? 'var(--teal)' : 'var(--saffron)', fontFamily: 'Space Grotesk' }}>{step.benefit}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.dueDate}</div>
                                    </div>
                                </div>

                                {isActive && !step.done && (
                                    <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', animation: 'fadeIn 0.3s ease' }}>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 14, marginBottom: 10 }}>{step.description}</p>
                                        <div style={{ marginBottom: 12 }}>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Documents needed:</p>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {(step.documents || []).map(doc => (
                                                    <span key={doc} style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{doc}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="btn-primary" style={{ fontSize: '0.82rem' }}>
                                            {step.actionText || `Apply for ${step.scheme}`} <MdArrowForward />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
