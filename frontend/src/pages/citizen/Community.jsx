import React, { useState, useEffect } from 'react';
import { MdPeople, MdThumbUp, MdComment, MdVerified, MdGavel, MdAdd, MdShare } from 'react-icons/md';
import {
    apiGetCommunityPosts, apiUpvotePost, apiCreateCommunityPost,
    apiGetPetitions, apiSignPetition, apiCreatePetition
} from '../../services/api.service';

const CATS = ['All', 'General', 'Water Supply', 'Healthcare', 'Finance', 'Transport', 'Employment'];
const TABS = ['Posts', 'Petitions'];

export default function Community() {
    const [tab, setTab] = useState('Posts');
    const [posts, setPosts] = useState([]);
    const [petitions, setPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState('All');
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [showForm, setShowForm] = useState(false);
    const [votedPosts, setVotedPosts] = useState({});
    const [signedPetitions, setSignedPetitions] = useState({});
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [postsRes, petitionsRes] = await Promise.all([
                apiGetCommunityPosts(),
                apiGetPetitions()
            ]);
            if (postsRes.success) setPosts((postsRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            if (petitionsRes.success) setPetitions((petitionsRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (e) {
            setError('Failed to load community data. Please try again.');
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpvote = async (id) => {
        if (votedPosts[id]) return;
        const res = await apiUpvotePost(id);
        if (res.success) {
            setPosts(ps => ps.map(p => p.id === id ? { ...p, votes: res.data?.votes ?? (p.votes + 1) } : p));
            setVotedPosts(u => ({ ...u, [id]: true }));
        }
    };

    const handleSignPetition = async (id) => {
        if (signedPetitions[id]) return;
        const res = await apiSignPetition(id);
        if (res.success) {
            setPetitions(ps => ps.map(p => p.id === id ? { ...p, petitionCount: res.data?.petitionCount ?? (p.petitionCount + 1) } : p));
            setSignedPetitions(s => ({ ...s, [id]: true }));
        } else {
            // Already signed or error
            setSignedPetitions(s => ({ ...s, [id]: true }));
        }
    };

    const handlePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        const res = await apiCreateCommunityPost(newPost);
        if (res.success && res.data) {
            setPosts([res.data, ...posts]);
        } else {
            // Optimistic fallback
            const p = {
                id: `POST-${Date.now()}`,
                ...newPost,
                authorName: 'You',
                state: 'All India',
                votes: 0, voters: [],
                responses: [],
                isPetition: false,
                createdAt: new Date().toISOString()
            };
            setPosts([p, ...posts]);
        }
        setNewPost({ title: '', content: '', category: 'General' });
        setShowForm(false);
    };

    const handleShare = (id, title) => {
        const url = `${window.location.origin}/citizen/community?post=${id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
        }
        const el = document.createElement('div');
        el.textContent = '🔗 Link copied!';
        el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a2a3a;color:#00C896;padding:10px 18px;border-radius:8px;font-size:0.83rem;font-weight:700;z-index:9999;border:1px solid rgba(0,200,150,0.3);';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    };

    const filteredPosts = catFilter === 'All' ? posts : posts.filter(p => p.category === catFilter);
    const filteredPetitions = catFilter === 'All' ? petitions : petitions.filter(p => p.category === catFilter);

    const tabBtnStyle = (t) => ({
        padding: '8px 20px', borderRadius: 100, border: '1px solid',
        borderColor: tab === t ? '#8B5CF6' : 'var(--border)',
        background: tab === t ? 'rgba(139,92,246,0.12)' : 'transparent',
        color: tab === t ? '#A78BFA' : 'var(--text-secondary)',
        fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
    });

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="section-title"><MdPeople className="icon" style={{ color: '#8B5CF6' }} /> JanConnect Community</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Ask questions, share tips, sign petitions, get official responses.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MdAdd /> {tab === 'Posts' ? 'Ask Question' : 'Start Petition'}
                </button>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 8 }}>
                {TABS.map(t => <button key={t} style={tabBtnStyle(t)} onClick={() => setTab(t)}>{t === 'Petitions' ? '📜 ' : '💬 '}{t}</button>)}
            </div>

            {/* New Post / Petition Form */}
            {showForm && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, animation: 'fadeInUp 0.3s ease' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 14 }}>{tab === 'Posts' ? 'Ask the Community' : 'Start a Petition'}</h3>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-input" value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}>
                            {['General', 'Water Supply', 'Healthcare', 'Finance', 'Transport', 'Employment', 'Infrastructure', 'Education'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{tab === 'Posts' ? 'Question Title' : 'Petition Title'}</label>
                        <input className="form-input" placeholder={tab === 'Posts' ? 'What do you want to ask?' : 'What change do you want?'}
                            value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Details</label>
                        <textarea className="form-input" rows={3} placeholder="Add more context..."
                            value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-primary" onClick={handlePost}>Submit</button>
                        <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATS.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} style={{
                        padding: '6px 14px', borderRadius: 100, border: '1px solid',
                        borderColor: catFilter === c ? '#8B5CF6' : 'var(--border)',
                        background: catFilter === c ? 'rgba(139,92,246,0.12)' : 'transparent',
                        color: catFilter === c ? '#A78BFA' : 'var(--text-secondary)',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        {c}
                    </button>
                ))}
            </div>

            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', fontSize: '0.85rem' }}>
                    {error} <button onClick={fetchData} style={{ background: 'none', border: 'none', color: 'var(--saffron)', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
                </div>
            )}

            {loading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading community data...</p>
            ) : tab === 'Posts' ? (
                /* POSTS TAB */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                            No posts yet. Be the first to ask a question!
                        </div>
                    ) : filteredPosts.map((post, i) => (
                        <div key={post.id} className="glass-card" style={{ padding: 20, animation: `fadeInUp 0.3s ease ${i * 0.07}s both` }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                {/* Upvote */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                    <button onClick={() => handleUpvote(post.id)} style={{
                                        background: votedPosts[post.id] ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.10)',
                                        border: `1px solid ${votedPosts[post.id] ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
                                        color: votedPosts[post.id] ? '#A78BFA' : 'var(--text-muted)',
                                        width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'all 0.2s'
                                    }}>
                                        <MdThumbUp />
                                    </button>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: votedPosts[post.id] ? '#A78BFA' : 'var(--text-muted)' }}>
                                        {post.votes || 0}
                                    </span>
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{post.authorName || 'Citizen'}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>·</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{post.state || 'All India'}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>·</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN') : 'Just now'}
                                        </span>
                                        <span style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA', borderRadius: 100, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                            {post.category || 'General'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                                    <p style={{ fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{post.content}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            <MdComment /> {post.responses?.length || 0} replies
                                        </span>
                                        <button onClick={() => handleShare(post.id, post.title)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', padding: 0 }}>
                                            <MdShare /> Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* PETITIONS TAB */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredPetitions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                            No active petitions. Start one to drive change!
                        </div>
                    ) : filteredPetitions.map((petition, i) => {
                        const pct = Math.min(100, Math.round(((petition.petitionCount || 0) / (petition.targetSignatures || 1000)) * 100));
                        return (
                            <div key={petition.id} className="glass-card" style={{ padding: 20, animation: `fadeInUp 0.3s ease ${i * 0.07}s both` }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                                    <span style={{ background: 'rgba(255,107,44,0.12)', border: '1px solid rgba(255,107,44,0.2)', color: 'var(--saffron)', borderRadius: 100, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                                        📜 PETITION
                                    </span>
                                    <span style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA', borderRadius: 100, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                        {petition.category}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                        {petition.state || 'All India'}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 8, lineHeight: 1.4 }}>{petition.title}</h3>
                                <p style={{ fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{petition.content}</p>
                                {/* Signature progress */}
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {(petition.petitionCount || 0).toLocaleString('en-IN')} signatures
                                        </span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            Goal: {(petition.targetSignatures || 1000).toLocaleString('en-IN')} · {pct}%
                                        </span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 100, transition: 'width 0.5s ease',
                                            width: `${pct}%`,
                                            background: pct >= 90 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, var(--saffron), var(--gold))'
                                        }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <button
                                        onClick={() => handleSignPetition(petition.id)}
                                        disabled={signedPetitions[petition.id]}
                                        className={signedPetitions[petition.id] ? 'btn-secondary' : 'btn-primary'}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                                    >
                                        <MdGavel />
                                        {signedPetitions[petition.id] ? '✓ Signed' : 'Sign Petition'}
                                    </button>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        by {petition.authorName || 'Citizen'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
