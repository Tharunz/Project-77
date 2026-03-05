import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdSchool, MdArrowForward, MdCheckCircle, MdHourglassEmpty, MdClose, MdShare, MdEdit, MdDownload, MdPhone, MdOpenInNew, MdRefresh, MdBookmark, MdEmail, MdInfo, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiGetMySchemeApplications } from '../../services/api.service';

const STATUS_STEPS = ['Submitted', 'Under Review', 'Document Verification', 'Approved'];

const STATUS_COLOR = {
    Submitted: '#F59E0B',
    'Under Review': '#3B82F6',
    'Document Verification': '#8B5CF6',
    Approved: '#00C896',
    Rejected: '#EF4444',
};

const catColors = {
    Agriculture: '#10B981', Healthcare: '#EF4444', Housing: '#3B82F6',
    Education: '#8B5CF6', 'Labour & Employment': '#F59E0B',
    'Pension & Social Security': '#FF6B2C', 'Women & Child': '#EC4899'
};

function StatusTimeline({ status }) {
    const rejected = status === 'Rejected';
    const currentIdx = rejected ? -1 : STATUS_STEPS.indexOf(status);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', margin: '10px 0' }}>
            {STATUS_STEPS.map((step, i) => {
                const done = !rejected && i <= currentIdx;
                const active = !rejected && i === currentIdx;
                return (
                    <React.Fragment key={step}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: done ? (active ? 'linear-gradient(135deg,#00C896,#3B82F6)' : 'rgba(0,200,150,0.2)') : 'rgba(255,255,255,0.06)',
                                border: `2px solid ${done ? '#00C896' : 'rgba(255,255,255,0.1)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', color: done ? '#00C896' : 'var(--text-muted)',
                                transition: 'all 0.4s', flexShrink: 0,
                                boxShadow: active ? '0 0 12px rgba(0,200,150,0.4)' : 'none',
                            }}>
                                {done && !active ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.6rem', color: done ? '#00C896' : 'var(--text-muted)', fontWeight: done ? 700 : 400, textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>{step}</span>
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                            <div style={{ height: 2, flex: 0.5, background: done && i < currentIdx ? '#00C896' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s', marginBottom: 20 }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function NextStepsCard({ application }) {
    const steps = [
        { icon: '📄', title: 'Keep Documents Ready', desc: 'Aadhaar, income certificate, and category certificate may be requested.' },
        { icon: '📱', title: 'Check SMS Updates', desc: 'Status updates will be sent to your registered mobile number.' },
        { icon: '🏛️', title: 'Visit Seva Kendra if needed', desc: 'Physical verification may be required at your district office.' },
        { icon: '📧', title: 'Check Email', desc: 'Approval/rejection letters are sent to your registered email.' },
    ];
    return (
        <div style={{ background: 'rgba(0,200,150,0.04)', border: '1px solid rgba(0,200,150,0.18)', borderRadius: 12, padding: '16px 18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, color: '#00C896', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdCheckCircle /> Next Steps
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {steps.map(s => (
                    <div key={s.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const SCHEME_DETAILS = {
    'SCH-001': { benefit: '₹6,000/year direct benefit transfer', eligibility: 'Small & marginal farmers owning up to 2 hectares', ministry: 'Ministry of Agriculture', state: 'All India' },
    'SCH-002': { benefit: '₹5 lakh health cover per family/year', eligibility: 'BPL families, SECC 2011 data', ministry: 'Ministry of Health', state: 'All India' },
    'SCH-003': { benefit: 'Free LPG connection + cylinder subsidy', eligibility: 'BPL women aged 18+', ministry: 'Ministry of Petroleum', state: 'All India' },
};

export default function MySchemeApplications() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState({}); // { appId: true }

    useEffect(() => {
        apiGetMySchemeApplications().then(res => {
            if (res.success && Array.isArray(res.data)) setApplications(res.data);
            setLoading(false);
        });
    }, []);

    const handleShare = (app) => {
        const text = `Scheme Application: ${app.schemeName} | Ref: ${app.id} | Status: ${app.status}`;
        if (navigator.clipboard) navigator.clipboard.writeText(text);
        const el = document.createElement('div');
        el.textContent = '🔗 Reference copied!';
        el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a2a3a;color:#00C896;padding:10px 18px;border-radius:8px;font-size:0.83rem;font-weight:700;z-index:9999;border:1px solid rgba(0,200,150,0.3);';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    };

    const handleContactHelpdesk = (app) => {
        const subject = encodeURIComponent(`Helpdesk Query — Application Ref: ${app.id}`);
        const body = encodeURIComponent(`Hello NCIE Helpdesk,\n\nI am writing regarding my scheme application:\n\nScheme: ${app.schemeName}\nApplication ID: ${app.id}\nStatus: ${app.status}\nApplied: ${new Date(app.submittedAt).toLocaleDateString('en-IN')}\n\nPlease assist me with the above application.\n\nThank you.`);
        window.open(`mailto:helpdesk.ncie@gov.in?subject=${subject}&body=${body}`);
    };

    const handleDownload = (app) => {
        const date = new Date(app.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const content = [
            'NCIE — Scheme Application Reference',
            '=====================================',
            '',
            `Application ID  : ${app.id}`,
            `Scheme Name     : ${app.schemeName}`,
            `Category        : ${app.category}`,
            `Status          : ${app.status}`,
            `Date Applied    : ${date}`,
            `Applicant       : ${user?.name || 'Citizen'}`,
            `State           : ${user?.state || 'N/A'}`,
            '',
            app.additionalInfo ? `Notes           : ${app.additionalInfo}` : '',
            '',
            '-------------------------------------',
            'Keep this reference for tracking your application.',
            'Track online at: localhost:5173/citizen/schemes/applications',
            '© Project NCIE — National Citizen Intelligence & Empowerment',
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NCIE-Application-${app.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleDetails = (appId) => setDetailsOpen(d => ({ ...d, [appId]: !d[appId] }));

    if (loading) return <div className="dash-loading"><div className="spinner" /><span>Loading applications...</span></div>;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="section-title"><MdSchool className="icon" /> {t('myApplications')}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Track your scheme applications · {applications.length} total
                    </p>
                </div>
                <Link to="/citizen/schemes" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    <MdSchool /> {t('schemes')} <MdArrowForward />
                </Link>
            </div>

            {applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <MdSchool style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>No Applications Yet</h3>
                    <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>You haven't applied to any government schemes yet.</p>
                    <Link to="/citizen/schemes" className="btn-primary"><MdSchool /> Explore Schemes</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {applications.map(app => {
                        const color = STATUS_COLOR[app.status] || '#F59E0B';
                        const isSelected = selected === app.id;
                        return (
                            <div key={app.id} style={{
                                background: `linear-gradient(135deg, ${color}06 0%, rgba(10,22,40,0.8) 100%)`,
                                border: `1px solid ${color}30`,
                                borderLeft: `4px solid ${color}`,
                                borderRadius: 14, overflow: 'hidden',
                                transition: 'box-shadow 0.2s',
                            }}>
                                {/* Card Header — always visible */}
                                <div style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => setSelected(isSelected ? null : app.id)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--saffron)' }}>{app.id}</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 100, padding: '1px 8px' }}>{app.status}</span>
                                            </div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 3 }}>{app.schemeName}</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied {new Date(app.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                                            <button onClick={e => { e.stopPropagation(); handleShare(app); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}><MdShare /> Share</button>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'transform 0.2s', transform: isSelected ? 'rotate(90deg)' : 'none' }}>▶</div>
                                        </div>
                                    </div>
                                    {/* Status Timeline — always shown */}
                                    <StatusTimeline status={app.status} />
                                </div>

                                {/* Expanded Detail */}
                                {isSelected && (
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.25s ease' }}>
                                        {/* Action Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                                            {/* File Grievance */}
                                            <Link to={`/citizen/file-grievance?scheme=${app.schemeId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'rgba(255,107,44,0.1)', border: '1px solid rgba(255,107,44,0.25)', borderRadius: 10, textDecoration: 'none', color: 'var(--text-white)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                <MdEdit style={{ color: '#FF6B2C', fontSize: '1.15rem', flexShrink: 0 }} /> File Related Grievance
                                            </Link>
                                            {/* Contact Helpdesk → mailto */}
                                            <button onClick={() => handleContactHelpdesk(app)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, color: 'var(--text-white)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                <MdEmail style={{ color: '#3B82F6', fontSize: '1.15rem', flexShrink: 0 }} /> Contact Helpdesk
                                            </button>
                                            {/* View Scheme Details → toggle inline panel */}
                                            <button onClick={() => toggleDetails(app.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: detailsOpen[app.id] ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.1)', border: `1px solid ${detailsOpen[app.id] ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.25)'}`, borderRadius: 10, color: 'var(--text-white)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                                <MdInfo style={{ color: '#8B5CF6', fontSize: '1.15rem', flexShrink: 0 }} /> View Scheme Details {detailsOpen[app.id] ? <MdExpandLess style={{ marginLeft: 'auto', color: '#8B5CF6' }} /> : <MdExpandMore style={{ marginLeft: 'auto', color: '#8B5CF6' }} />}
                                            </button>
                                            {/* Download Reference → actual file */}
                                            <button onClick={() => handleDownload(app)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 10, color: 'var(--text-white)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                <MdDownload style={{ color: '#00C896', fontSize: '1.15rem', flexShrink: 0 }} /> Download Reference
                                            </button>
                                        </div>

                                        {/* Inline Scheme Details Panel */}
                                        {detailsOpen[app.id] && (() => {
                                            const details = SCHEME_DETAILS[app.schemeId];
                                            return (
                                                <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '16px 18px', animation: 'fadeIn 0.25s ease' }}>
                                                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 12, color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 6 }}><MdInfo /> {app.schemeName} — Full Details</h4>
                                                    {details ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            {[['💰 Benefit', details.benefit], ['✅ Eligibility', details.eligibility], ['🏛️ Ministry', details.ministry], ['📍 Coverage', details.state], ['📋 Category', app.category], ['🆔 Application ID', app.id], ['📅 Applied On', new Date(app.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })]].map(([label, value]) => (
                                                                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 130, flexShrink: 0 }}>{label}</span>
                                                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-white)', fontWeight: 600, lineHeight: 1.4 }}>{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            {[['📋 Category', app.category], ['🆔 Application ID', app.id], ['📅 Applied On', new Date(app.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })], ['📊 Status', app.status]].map(([label, value]) => (
                                                                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 130, flexShrink: 0 }}>{label}</span>
                                                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-white)', fontWeight: 600 }}>{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Application Details */}
                                        {app.additionalInfo && (
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                <strong style={{ color: 'var(--text-white)' }}>Notes: </strong>{app.additionalInfo}
                                            </div>
                                        )}

                                        <NextStepsCard application={app} />

                                        {/* AI Benefit Tip */}
                                        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem' }}>
                                            <p style={{ color: '#A78BFA', fontWeight: 700, marginBottom: 4 }}>🤖 AI Tip</p>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Based on this application, you may also qualify for related schemes in the same category. <Link to="/citizen/schemes" style={{ color: 'var(--saffron)', fontWeight: 700, textDecoration: 'none' }}>Explore similar schemes →</Link></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
