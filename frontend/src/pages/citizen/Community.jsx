import React, { useState, useEffect } from 'react';
import { MdPeople, MdThumbUp, MdComment, MdVerified } from 'react-icons/md';
import { apiGetCommunityPosts, apiUpvotePost } from '../../services/api.service';

const CATS = ['All', 'schemes', 'grievance', 'general'];
const CAT_EMOJI = { schemes: '🏛️', grievance: '📋', general: '💬' };

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState('All');
    const [newPost, setNewPost] = useState({ title: '', body: '', category: 'general' });
    const [showForm, setShowForm] = useState(false);
    const [upvoted, setUpvoted] = useState({});

    useEffect(() => {
        apiGetCommunityPosts().then(res => { setPosts(res.data); setLoading(false); });
    }, []);

    const handleUpvote = async (id) => {
        if (upvoted[id]) return;
        await apiUpvotePost(id);
        setPosts(ps => ps.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
        setUpvoted(u => ({ ...u, [id]: true }));
    };

    const handlePost = () => {
        if (!newPost.title.trim()) return;
        const p = {
            id: `POST-${Date.now()}`, ...newPost, author: 'You', state: 'Your State',
            time: 'Just now', upvotes: 0, replies: 0, officerResponse: false,
            officerResponseText: null, tags: [], verified: false
        };
        setPosts([p, ...posts]);
        setNewPost({ title: '', body: '', category: 'general' });
        setShowForm(false);
    };

    const filtered = catFilter === 'All' ? posts : posts.filter(p => p.category === catFilter);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="section-title"><MdPeople className="icon" style={{ color: '#8B5CF6' }} /> JanConnect Community</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        Ask questions, share tips, get official responses. Peer-to-peer + government support in one place.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Ask Question</button>
            </div>

            {/* New Post Form */}
            {showForm && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, animation: 'fadeInUp 0.3s ease' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 14 }}>Ask the Community</h3>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-input" value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}>
                            <option value="general">General</option>
                            <option value="schemes">Government Schemes</option>
                            <option value="grievance">Grievance Help</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Question Title</label>
                        <input className="form-input" placeholder="What do you want to ask?" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Details (optional)</label>
                        <textarea className="form-input" rows={3} placeholder="Add more context..." value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-primary" onClick={handlePost}>Post Question</button>
                        <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 8 }}>
                {CATS.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} style={{
                        padding: '7px 14px', borderRadius: 100, border: '1px solid',
                        borderColor: catFilter === c ? '#8B5CF6' : 'var(--border)',
                        background: catFilter === c ? 'rgba(139,92,246,0.12)' : 'transparent',
                        color: catFilter === c ? '#A78BFA' : 'var(--text-secondary)',
                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        {c !== 'All' && CAT_EMOJI[c]} {c === 'All' ? '📌 All' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            {/* Posts */}
            {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading community posts...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filtered.map((post, i) => (
                        <div key={post.id} className="glass-card" style={{ padding: 20, animation: `fadeInUp 0.3s ease ${i * 0.07}s both` }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                {/* Upvote */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                    <button onClick={() => handleUpvote(post.id)} style={{
                                        background: upvoted[post.id] ? 'rgba(139,92,246,0.2)' : 'rgba(255, 255, 255, 0.10)',
                                        border: `1px solid ${upvoted[post.id] ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
                                        color: upvoted[post.id] ? '#A78BFA' : 'var(--text-muted)',
                                        width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'all 0.2s'
                                    }}>
                                        <MdThumbUp />
                                    </button>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: upvoted[post.id] ? '#A78BFA' : 'var(--text-muted)' }}>{post.upvotes}</span>
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.78rem' }}>{CAT_EMOJI[post.category]}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{post.author}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>·</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{post.state}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>·</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{post.time}</span>
                                        {post.verified && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: 'var(--teal)', borderRadius: 100, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700 }}>
                                                <MdVerified style={{ fontSize: '0.8rem' }} /> Verified Info
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                                    <p style={{ fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{post.body}</p>

                                    {/* Tags */}
                                    {post.tags?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                            {post.tags.map(t => (
                                                <span key={t} style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', borderRadius: 100, padding: '2px 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{t}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Officer Response */}
                                    {post.officerResponse && post.officerResponseText && (
                                        <div style={{ marginTop: 14, background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 10, padding: '12px 16px', borderLeft: '3px solid var(--teal)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--teal)', background: 'rgba(0,200,150,0.15)', padding: '2px 8px', borderRadius: 100 }}>
                                                    🏛️ Official Government Response
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{post.officerResponseText}</p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            <MdComment /> {post.replies} replies
                                        </span>
                                        <button style={{
                                            background: 'none', border: 'none', color: 'var(--saffron)', fontSize: '0.78rem',
                                            fontWeight: 600, cursor: 'pointer', padding: '4px 0', fontFamily: 'Inter'
                                        }}>Reply →</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
