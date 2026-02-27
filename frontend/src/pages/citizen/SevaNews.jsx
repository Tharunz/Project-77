import React, { useState, useEffect } from 'react';
import { MdNewspaper, MdTranslate, MdBookmark, MdShare } from 'react-icons/md';
import { apiGetSevaNews } from '../../services/api.service';

const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' }, { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' }, { code: 'mr', label: 'मराठी' },
];

const IMPACT_BADGE = {
    high: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: '🔴 High Impact' },
    medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: '🟡 Medium Impact' },
    low: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: '🔵 Low Impact' },
};

const CAT_COLORS = {
    'Agriculture': '#10B981',
    'Healthcare': '#EF4444',
    'Labour & Employment': '#F59E0B',
    'Education': '#8B5CF6',
};

export default function SevaNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en');
    const [bookmarked, setBookmarked] = useState({});

    useEffect(() => {
        apiGetSevaNews().then(res => { setNews(res.data); setLoading(false); });
    }, []);

    const getTitle = (item) => {
        if (language === 'hi' && item.titleHi) return item.titleHi;
        return item.title;
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="section-title"><MdNewspaper className="icon" style={{ color: 'var(--saffron)' }} /> Seva News</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Government scheme updates, policy changes & announcements — in your language, before you miss out
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdTranslate style={{ color: 'var(--saffron)', fontSize: '1.1rem' }} />
                    <select className="form-input" value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: '0.82rem', padding: '7px 12px', width: 130 }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                </div>
            </div>

            {/* AI Translation Notice */}
            {language !== 'en' && (
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8rem', color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 8 }}>
                    🤖 Content auto-translated using AI • Amazon Translate • Results may vary slightly from official text
                </div>
            )}

            {/* Categories shortcut */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {['All', 'Agriculture', 'Healthcare', 'Labour & Employment', 'Education'].map(c => (
                    <button key={c} style={{
                        padding: '6px 14px', borderRadius: 100, border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.2s', borderColor: CAT_COLORS[c] ? `${CAT_COLORS[c]}40` : 'var(--border)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,44,0.08)'; e.currentTarget.style.color = 'var(--saffron)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >{c === 'All' ? '📰 All' : c}</button>
                ))}
            </div>

            {/* News Cards */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[1, 2, 3].map(n => <div key={n} style={{ height: 140, background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease infinite' }} />)}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {news.map((item, i) => {
                        const impact = IMPACT_BADGE[item.impact] || IMPACT_BADGE.low;
                        const catColor = CAT_COLORS[item.category] || 'var(--saffron)';
                        const isBookmarked = bookmarked[item.id];
                        return (
                            <div key={item.id} className="glass-card" style={{
                                padding: 22, animation: `fadeInUp 0.3s ease ${i * 0.08}s both`,
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {/* Top row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: catColor, background: `${catColor}18`, border: `1px solid ${catColor}30`, padding: '2px 10px', borderRadius: 100 }}>{item.category}</span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: impact.color, background: impact.bg, padding: '2px 10px', borderRadius: 100 }}>{impact.label}</span>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.date}</span>
                                        </div>
                                        <h3 style={{
                                            fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-white)', lineHeight: 1.4,
                                            fontFamily: language === 'hi' ? 'Noto Sans Devanagari, Inter, sans-serif' : 'inherit'
                                        }}>{getTitle(item)}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button onClick={() => setBookmarked(b => ({ ...b, [item.id]: !b[item.id] }))} style={{
                                            background: isBookmarked ? 'rgba(255,107,44,0.15)' : 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid var(--border)', borderRadius: 8, width: 34, height: 34,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: isBookmarked ? 'var(--saffron)' : 'var(--text-muted)', transition: 'all 0.2s'
                                        }}>
                                            <MdBookmark />
                                        </button>
                                        <button style={{
                                            background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)',
                                            borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s'
                                        }}>
                                            <MdShare />
                                        </button>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 12 }}>{item.body}</p>

                                {/* Impact info */}
                                <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Beneficiaries</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron)' }}>{item.beneficiaries}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Affected States</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {item.affectedStates.join(', ')}
                                        </span>
                                    </div>
                                    {item.tags?.map(t => (
                                        <span key={t} style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', borderRadius: 100, padding: '2px 10px', fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'flex-end' }}>#{t}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
