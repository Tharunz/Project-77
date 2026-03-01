import React, { useState, useEffect, useCallback } from 'react';
import { MdListAlt, MdSearch, MdFilterList, MdEdit, MdCheck, MdClose, MdArrowUpward, MdRefresh, MdDownload } from 'react-icons/md';
import { apiGetGrievances, apiUpdateGrievance, apiSearchGrievances } from '../../services/api.service';
import { INDIAN_STATES, GRIEVANCE_CATEGORIES } from '../../mock/mockData';

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
        setEditModal(true);
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
                                            <div title={g.description} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
                                                {g.title}
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 560
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1.1rem' }}>Update Grievance <span style={{ color: 'var(--saffron)' }}>{selected.id}</span></h2>
                            <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}><MdClose /></button>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{selected.citizenName}</strong> — {selected.state}
                            </p>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, maxHeight: 200, overflowY: 'auto', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{selected.description}</div>
                        </div>
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
                        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}><MdCheck /> Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
