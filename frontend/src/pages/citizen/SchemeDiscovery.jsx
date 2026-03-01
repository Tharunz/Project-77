import React, { useState, useEffect } from 'react';
import { MdSchool, MdSearch, MdCheck, MdArrowForward, MdFilterList, MdHistory, MdHelpOutline, MdClose } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { apiGetSchemes, apiGetMatchedSchemes, apiGetSchemesEligibilityCheck, apiGetSchemesTimeMachine } from '../../services/api.service';
import { INDIAN_STATES } from '../../mock/mockData';

const CATEGORIES = ['Agriculture', 'Healthcare', 'Housing', 'Education', 'Labour & Employment', 'Pension & Social Security', 'Women & Child'];

const catColors = {
    Agriculture: '#10B981', Healthcare: '#EF4444', Housing: '#3B82F6',
    Education: '#8B5CF6', 'Labour & Employment': '#F59E0B',
    'Pension & Social Security': '#FF6B2C', 'Women & Child': '#EC4899'
};

export default function SchemeDiscovery() {
    const { user } = useAuth();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterState, setFilterState] = useState('');
    const [aiMode, setAiMode] = useState(true);
    const [selected, setSelected] = useState(null);

    // Group 2 Features
    const [timeMachineYear, setTimeMachineYear] = useState(2026);
    const [eligibilityModal, setEligibilityModal] = useState(false);
    const [eliForm, setEliForm] = useState({ age: 18, income: 100000, state: 'Delhi', gender: 'male' });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            let res;
            if (aiMode) {
                res = await apiGetMatchedSchemes();
            } else if (timeMachineYear < 2026) {
                res = await apiGetSchemesTimeMachine(timeMachineYear);
                // Time machine returns { year, historicalYear, schemes, total }
                if (res.success) res.data = res.data.schemes;
            } else {
                res = await apiGetSchemes({ search, category: filterCat, state: filterState });
            }
            setSchemes(res && Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        };
        load();
    }, [search, filterCat, filterState, aiMode, timeMachineYear]);

    const handleEligibilityCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await apiGetSchemesEligibilityCheck(eliForm);
        setSchemes(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
        setEligibilityModal(false);
    };

    // Helper to normalize backend structure
    const getSchemeData = (s) => {
        if (!s) return null;
        return {
            ...s,
            minAge: s.minAge ?? s.eligibility?.minAge ?? 0,
            maxAge: s.maxAge ?? s.eligibility?.maxAge ?? 100,
            maxIncome: s.maxIncome ?? s.eligibility?.maxIncome ?? 0,
            benefit: s.benefit || s.benefits || 'See details',
            eligibilityText: typeof s.eligibility === 'string' ? s.eligibility : 'Check details for eligibility',
            category: s.category || 'General'
        };
    };

    const displayed = (schemes || []).map(getSchemeData).filter(s => s);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="section-title"><MdSchool className="icon" /> Scheme Discovery</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Showing <strong>{displayed.length}</strong> {aiMode ? 'eligible' : 'national'} schemes {aiMode ? `(matched to ${user?.name || 'your profile'})` : 'available in library'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setEligibilityModal(true)}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                    >
                        <MdHelpOutline /> Eligibility Check
                    </button>
                    <button
                        onClick={() => { setAiMode(!aiMode); setTimeMachineYear(2026); }}
                        style={{
                            padding: '10px 18px', borderRadius: 8, border: '1px solid',
                            borderColor: aiMode ? 'var(--saffron)' : 'var(--border)',
                            background: aiMode ? 'rgba(255,107,44,0.12)' : 'rgba(255, 255, 255, 0.06)',
                            color: aiMode ? 'var(--saffron)' : 'var(--text-secondary)',
                            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        🤖 {aiMode ? 'AI Match ON' : 'AI Match OFF'}
                    </button>
                </div>
            </div>

            {/* Time Machine Slider */}
            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdHistory style={{ color: 'var(--saffron)' }} /> Heritage Time Machine
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--saffron)', fontWeight: 800 }}>Year {timeMachineYear}</span>
                </div>
                <input
                    type="range" min="2015" max="2026" step="1"
                    value={timeMachineYear}
                    onChange={(e) => { setTimeMachineYear(parseInt(e.target.value)); setAiMode(false); }}
                    style={{ width: '100%', accentColor: 'var(--saffron)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    <span>2015</span>
                    <span>2018</span>
                    <span>2020</span>
                    <span>2023</span>
                    <span>Present Day (2026)</span>
                </div>
            </div>

            {aiMode && (
                <div style={{ background: 'rgba(255,107,44,0.08)', border: '1px solid rgba(255,107,44,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: 'var(--saffron)' }}>
                    🤖 Showing schemes matched to your profile — Age: {user?.age || '?'}, Income: ₹{(user?.income || 0).toLocaleString()}, State: {user?.state || 'N/A'}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                    <input className="form-input" placeholder="Search schemes..." value={search}
                        onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: '100%' }} />
                </div>
                <select className="form-input" style={{ flex: '0 1 180px' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="form-input" style={{ flex: '0 1 180px' }} value={filterState} onChange={e => setFilterState(e.target.value)}>
                    <option value="">All India</option>
                    {(INDIAN_STATES || []).map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Scheme Grid */}
            {loading ? <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>Synchronizing with database...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {displayed.map((s, i) => (
                        <div key={s.id} className="glass-card" style={{ padding: 20, animation: `fadeInUp 0.3s ease ${i * 0.03}s both`, cursor: 'pointer' }}
                            onClick={() => setSelected(selected?.id === s.id ? null : s)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{
                                    background: `${catColors[s.category] || '#6B7280'}15`,
                                    color: catColors[s.category] || '#6B7280',
                                    border: `1px solid ${catColors[s.category] || '#6B7280'}30`,
                                    padding: '3px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700
                                }}>{s.category}</span>
                                <span className={`badge ${s.isActive ? 'badge-resolved' : 'badge-pending'}`}>{s.isActive ? 'Active' : 'Closed'}</span>
                            </div>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{s.name}</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                                {s.eligibilityText}
                            </p>
                            <div style={{ padding: '10px 14px', background: 'rgba(0,200,150,0.08)', borderRadius: 8, marginBottom: 12 }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Benefit:</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 700 }}>{s.benefit}</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>📍 {s.state}</span>
                                <span>👥 {s.beneficiaries?.toLocaleString() || '0'}</span>
                                {s.matchScore && <span style={{ color: 'var(--saffron)', fontWeight: 700 }}>Match: {s.matchScore}%</span>}
                            </div>

                            {/* Expanded */}
                            {selected?.id === s.id && (
                                <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14, animation: 'fadeIn 0.3s ease' }}>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{s.description}</p>
                                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                                        Apply for this Scheme <MdArrowForward />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {displayed.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                            No record found in the state archives for this criteria.
                        </div>
                    )}
                </div>
            )}

            {/* Eligibility Check Modal */}
            {eligibilityModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,26,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 450 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Open Eligibility Checker</h2>
                            <MdClose style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setEligibilityModal(false)} />
                        </div>
                        <form onSubmit={handleEligibilityCheck} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input type="number" className="form-input" value={eliForm.age} onChange={e => setEliForm({ ...eliForm, age: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Monthly Income (₹)</label>
                                <input type="number" className="form-input" value={eliForm.income} onChange={e => setEliForm({ ...eliForm, income: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <select className="form-input" value={eliForm.state} onChange={e => setEliForm({ ...eliForm, state: e.target.value })}>
                                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-input" value={eliForm.gender} onChange={e => setEliForm({ ...eliForm, gender: e.target.value })}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: 10, justifyContent: 'center' }}>Run Eligibility Scan</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
