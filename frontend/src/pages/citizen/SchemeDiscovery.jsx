import React, { useState, useEffect } from 'react';
import { MdSchool, MdSearch, MdCheck, MdArrowForward, MdFilterList } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { apiGetSchemes } from '../../services/api.service';
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
    const [aiMode, setAiMode] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await apiGetSchemes({ search, category: filterCat, state: filterState });
            setSchemes(res.data);
            setLoading(false);
        };
        load();
    }, [search, filterCat, filterState]);

    const displayed = aiMode
        ? schemes.filter(s => user?.age >= s.minAge && user?.age <= s.maxAge && (s.maxIncome === 0 || (user?.income || 200000) <= s.maxIncome))
        : schemes;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="section-title"><MdSchool className="icon" /> Scheme Discovery</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        {displayed.length} schemes available · Discover what you qualify for
                    </p>
                </div>
                <button
                    onClick={() => setAiMode(!aiMode)}
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
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Scheme Grid */}
            {loading ? <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>Loading schemes...</p> : (
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
                                <span className="badge badge-resolved">Active</span>
                            </div>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{s.name}</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                                {s.eligibility}
                            </p>
                            <div style={{ padding: '10px 14px', background: 'rgba(0,200,150,0.08)', borderRadius: 8, marginBottom: 12 }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Benefit:</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 700 }}>{s.benefit}</p>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Coverage: {s.state} · Beneficiaries: {s.beneficiaries}
                            </p>

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
                            No schemes found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
