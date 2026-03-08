import React, { useState, useEffect, useCallback } from 'react';
import { MdListAlt, MdSearch, MdFilterList, MdEdit, MdCheck, MdClose, MdArrowUpward, MdRefresh, MdDownload, MdSmartToy, MdAutoAwesome, MdWarning, MdCheckCircle, MdBolt, MdExpandMore } from 'react-icons/md';
import { apiGetGrievances, apiUpdateGrievance, apiSearchGrievances, apiSummarizeGrievance } from '../../services/api.service';
import { INDIAN_STATES, GRIEVANCE_CATEGORIES } from '../../mock/mockData';
import TextractViewer from '../../components/TextractViewer';

const STATUS_COLORS = {
    Pending: 'badge-pending', Resolved: 'badge-resolved', Critical: 'badge-critical',
    'In Progress': 'badge-inprogress', Escalated: 'badge-critical',
    'Resolved (Pending Verification)': 'badge-verification'
};

const STATUS_LABELS = {
    'Resolved (Pending Verification)': 'Awaiting User'
};

const PRIORITY_COLORS = {
    High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low'
};

function SentimentBar({ score }) {
    const pct = Math.round(score * 100);
    const color = score < 0.3 ? '#EF4444' : score < 0.6 ? '#F59E0B' : '#00C896';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color, fontWeight: 700, minWidth: 28 }}>{pct}%</span>
        </div>
    );
}

export default function GrievanceManagement() {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ state: '', category: '', status: '', priority: '', search: '' });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [editStatus, setEditStatus] = useState('');
    const [editNote, setEditNote] = useState('');
    const [editAssign, setEditAssign] = useState('');
    const [aiSummary, setAiSummary] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiExpanded, setAiExpanded] = useState(false);
    const PER_PAGE = 15;

    const loadGrievances = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiSearchGrievances({
                q: filters.search,
                status: filters.status,
                state: filters.state,
                category: filters.category,
                priority: filters.priority
            }, page);

            if (res.success) {
                // Backend might return { grievances: [], total: 0 } or just the array
                const data = Array.isArray(res.data) ? res.data : (res.data.grievances || []);
                setGrievances(data);
                // If it's the search endpoint, it might return total in res.data.total or res.total
                const count = res.total || (res.data && res.data.total) || data.length;
                // Note: we don't setPage(1) here to avoid loops, only when filters change
            }
        } catch (err) {
            console.error("Grievance Search Error:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadGrievances();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadGrievances]);

    const handleFilter = (key, val) => {
        setFilters(f => ({ ...f, [key]: val }));
        setPage(1); // Reset page on filter change
    };

    const openEdit = (g) => {
        setSelected(g);
        setEditStatus(g.status);
        setEditNote(g.resolutionNote || '');
        setEditAssign(g.assignedTo || '');
        setAiSummary(null);
        setAiLoading(false);
        setAiExpanded(false);
        setEditModal(true);
    };

    const handleGenerateSummary = async () => {
        if (!selected) return;
        setAiLoading(true);
        setAiExpanded(true);
        try {
            const res = await apiSummarizeGrievance(selected.id);
            if (res.success && res.data) setAiSummary(res.data);
        } catch (_) { }
        setAiLoading(false);
    };

    const handleSave = async () => {
        await apiUpdateGrievance(selected.id, { status: editStatus, resolutionNote: editNote, assignedTo: editAssign });
        setGrievances(gs => gs.map(g => g.id === selected.id
            ? { ...g, status: editStatus, resolutionNote: editNote, assignedTo: editAssign }
            : g
        ));
        setEditModal(false);
    };

    const paginated = grievances.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(grievances.length / PER_PAGE);

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdListAlt className="icon" /> Grievance Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        {grievances.length.toLocaleString()} grievances found across India
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={loadGrievances}>
                        <MdRefresh /> Refresh
                    </button>
                    <button className="btn-primary" style={{ fontSize: '0.8rem' }}>
                        <MdDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '16px 20px',
                display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                    <input
                        className="form-input" placeholder="Search by name, ID, description..."
                        value={filters.search}
                        onChange={e => handleFilter('search', e.target.value)}
                        style={{ paddingLeft: 36, width: '100%' }}
                    />
                </div>
                <select className="form-input" style={{ flex: '0 1 150px' }} value={filters.state} onChange={e => handleFilter('state', e.target.value)}>
                    <option value="">All States</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-input" style={{ flex: '0 1 160px' }} value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
                    <option value="">All Categories</option>
                    {GRIEVANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="form-input" style={{ flex: '0 1 130px' }} value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
                    <option value="">All Status</option>
                    {['Pending', 'In Progress', 'Resolved', 'Critical', 'Escalated'].map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="form-input" style={{ flex: '0 1 120px' }} value={filters.priority} onChange={e => handleFilter('priority', e.target.value)}>
                    <option value="">All Priority</option>
                    {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading grievances...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Citizen</th>
                                    <th>State</th>
                                    <th>Category</th>
                                    <th>Title</th>
                                    <th>Sentiment</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(g => (
                                    <tr key={g.id || g._id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{g.trackingId || g.id || g._id}</td>
                                        <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.citizenName}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.state}</td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{g.category}</td>
                                        <td style={{ maxWidth: 160, fontSize: '0.82rem' }}>
                                            <div title={g.description} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                                {g.description?.startsWith('[Audio grievance') && <span title="Audio Grievance" style={{ fontSize: '0.9rem', flexShrink: 0 }}>🎤</span>}
                                                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{g.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ minWidth: 100 }}>
                                            <SentimentBar score={g.sentimentScore ?? 0.5} />
                                        </td>
                                        <td><span className={`badge ${PRIORITY_COLORS[g.priority] || 'badge-medium'}`}>{g.priority}</span></td>
                                        <td>
                                            <span className={`badge ${STATUS_COLORS[g.status] || 'badge-pending'}`}>
                                                {STATUS_LABELS[g.status] || g.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            {g.assignedTo || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}
                                        </td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(g.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', borderRadius: 6, padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                                onClick={() => openEdit(g)}
                                            >
                                                <MdEdit style={{ verticalAlign: 'middle' }} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderTop: '1px solid var(--border)',
                    fontSize: '0.8rem', color: 'var(--text-secondary)'
                }}>
                    <span>Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, grievances.length)} of {grievances.length}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: 32, height: 32, borderRadius: 6, border: '1px solid',
                                borderColor: p === page ? 'var(--saffron)' : 'var(--border)',
                                background: p === page ? 'rgba(255,107,44,0.15)' : 'transparent',
                                color: p === page ? 'var(--saffron)' : 'var(--text-secondary)',
                                cursor: 'pointer', fontWeight: p === page ? 700 : 400, fontSize: '0.8rem'
                            }}>{p}</button>
                        ))}
                        {totalPages > 7 && <span style={{ padding: '0 8px' }}>...</span>}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && selected && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(5,11,26,0.85)',
                    backdropFilter: 'blur(8px)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 600,
                        maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.1rem' }}>
                                Update Grievance <span style={{ color: 'var(--saffron)' }}>{selected.id}</span>
                            </h2>
                            <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}><MdClose /></button>
                        </div>

                        {/* ── Grievance Info Box (restored) ── */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{selected.citizenName}</strong>
                                {' '}—{' '}{selected.state}
                                {selected.description?.startsWith('[Audio grievance') && (
                                    <span style={{ marginLeft: 8, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '1px 7px' }}>🎤 Audio Grievance</span>
                                )}
                            </p>
                            {/* Audio player */}
                            {selected.documents?.some(d => d.mimetype?.startsWith('audio/') || d.url?.includes('.webm') || d.url?.includes('.ogg') || d.url?.includes('.mp3')) && (
                                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                                    <p style={{ fontSize: '0.72rem', color: '#F87171', fontWeight: 700, marginBottom: 6 }}>🎤 Audio Recording</p>
                                    <audio controls src={selected.documents.find(d => d.mimetype?.startsWith('audio/') || d.url?.includes('.webm'))?.url} style={{ width: '100%', height: 36 }} />
                                </div>
                            )}
                            {/* Document Viewer */}
                            {selected.documents?.filter(d => !d.mimetype?.startsWith('audio/') && !d.url?.includes('.webm') && !d.url?.includes('.ogg') && !d.url?.includes('.mp3')).length > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>📎 Attached Documents ({selected.documents.filter(d => !d.mimetype?.startsWith('audio/')).length})</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {selected.documents.filter(d => !d.mimetype?.startsWith('audio/') && !d.url?.includes('.webm')).map((doc, i) => {
                                            const url = doc.url || doc.path;
                                            const name = doc.originalName || doc.filename || doc.name || `Document ${i + 1}`;
                                            const isImage = doc.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                                            return (
                                                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', maxWidth: isImage ? 160 : 180 }}>
                                                    {isImage && url ? (
                                                        <a href={url} target="_blank" rel="noreferrer">
                                                            <img src={url} alt={name} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                                                        </a>
                                                    ) : null}
                                                    <div style={{ padding: '6px 8px' }}>
                                                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{name}</p>
                                                        {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color: '#60A5FA', textDecoration: 'none' }}>{isImage ? '🔍 View Full' : '📄 Open'}</a>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <TextractViewer grievance={selected} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {selected.description}
                            </div>
                        </div>

                        {/* ── NCIE AI Analysis Section ── */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)',
                            border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, overflow: 'hidden'
                        }}>
                            {/* AI Card Header */}
                            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MdSmartToy style={{ color: '#A78BFA', fontSize: '1rem' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#A78BFA', letterSpacing: '0.06em' }}>NCIE AI Analysis</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LLM-powered grievance intelligence</div>
                                    </div>
                                </div>
                                {!aiExpanded ? (
                                    <button
                                        onClick={handleGenerateSummary}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, color: '#A78BFA', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                    >
                                        <MdAutoAwesome style={{ fontSize: '1rem' }} /> Generate AI Summary
                                    </button>
                                ) : (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                        {aiSummary ? `${aiSummary.confidence}% confidence` : 'Analyzing…'}
                                    </span>
                                )}
                            </div>

                            {/* AI Result / Loading */}
                            {aiExpanded && (
                                <div style={{ borderTop: '1px solid rgba(139,92,246,0.15)', padding: '16px 16px' }}>
                                    {aiLoading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                                            <div style={{ width: 20, height: 20, border: '2px solid rgba(139,92,246,0.3)', borderTop: '2px solid #A78BFA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: '0.82rem', color: '#A78BFA', fontWeight: 700 }}>Analyzing with NCIE AI…</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Processing description · Detecting urgency · Mapping department</div>
                                            </div>
                                        </div>
                                    ) : aiSummary ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {/* Summary text */}
                                            <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid #A78BFA', paddingLeft: 12 }}>
                                                "{aiSummary.summary}"
                                            </div>

                                            {/* Urgency bar */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Urgency Level</span>
                                                    <span style={{
                                                        fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                                                        color: aiSummary.urgencyLevel === 'Critical' ? '#EF4444' : aiSummary.urgencyLevel === 'High' ? '#F59E0B' : aiSummary.urgencyLevel === 'Medium' ? '#3B82F6' : '#00C896'
                                                    }}>{aiSummary.urgencyLevel?.toUpperCase()}</span>
                                                </div>
                                                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: 3, transition: 'width 0.8s ease',
                                                        width: `${Math.round(aiSummary.urgencyScore * 100)}%`,
                                                        background: aiSummary.urgencyLevel === 'Critical' ? '#EF4444' : aiSummary.urgencyLevel === 'High' ? '#F59E0B' : aiSummary.urgencyLevel === 'Medium' ? '#3B82F6' : '#00C896'
                                                    }} />
                                                </div>
                                            </div>

                                            {/* Key Issues + Actions grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Key Issues</div>
                                                    {aiSummary.keyIssues?.map((issue, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 5 }}>
                                                            <MdWarning style={{ color: '#F59E0B', fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }} />
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{issue}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recommended Actions</div>
                                                    {aiSummary.recommendedActions?.map((act, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 5 }}>
                                                            <MdCheckCircle style={{ color: '#00C896', fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }} />
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{act}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer meta */}
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                {[
                                                    { label: '🏛 Department', value: aiSummary.department },
                                                    { label: '👥 Est. Impact', value: aiSummary.estimatedImpact },
                                                    { label: '🎯 Confidence', value: `${aiSummary.confidence}%` }
                                                ].map(m => (
                                                    <div key={m.label} style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 6, padding: '5px 10px' }}>
                                                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-white)' }}>{m.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: '#EF4444', padding: '6px 0' }}>Failed to generate summary. Please try again.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Action Form ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Update Status</label>
                                <select className="form-input" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                                    {['Pending', 'In Progress', 'Resolved (Pending Verification)', 'Critical', 'Escalated'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assign To Officer</label>
                                <select className="form-input" value={editAssign} onChange={e => setEditAssign(e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {['Officer Mehta', 'Officer Rao', 'Officer Sharma', 'Officer Bose'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Resolution Note</label>
                                <textarea className="form-input" rows={3} value={editNote} onChange={e => setEditNote(e.target.value)}
                                    placeholder="Add a resolution note or update..." style={{ resize: 'none' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}><MdCheck /> Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
