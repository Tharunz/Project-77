import React, { useState, useEffect, useRef } from 'react';
import { MdSchool, MdAdd, MdEdit, MdSearch, MdCheck, MdClose, MdDeleteForever, MdUndo, MdWarning } from 'react-icons/md';
import { apiGetSchemes, apiAddScheme, apiUpdateScheme, apiDeleteScheme } from '../../services/api.service';

const SCHEME_CATEGORIES = ['Agriculture', 'Healthcare', 'Housing', 'Education', 'Labour & Employment', 'Pension & Social Security', 'Women & Child', 'Others'];

const emptyScheme = { name: '', category: '', state: 'All India', benefit: '', eligibility: '', description: '', minAge: 18, maxAge: 65, maxIncome: 0 };

export default function SchemeManagement() {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [modal, setModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(emptyScheme);
    const [editId, setEditId] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null); // scheme to delete
    const [undoToast, setUndoToast] = useState(null); // { id, name, timer }
    const undoTimerRef = useRef(null);

    useEffect(() => {
        load();
    }, [search, filterCat]);

    const load = async () => {
        setLoading(true);
        const res = await apiGetSchemes({ search, category: filterCat });
        setSchemes(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    };

    const openAdd = () => { setForm(emptyScheme); setEditMode(false); setEditId(null); setModal(true); };
    const openEdit = (s) => { setForm({ ...s }); setEditMode(true); setEditId(s.id); setModal(true); };

    const handleDeleteConfirm = async () => {
        if (!deleteModal) return;
        const { id, name } = deleteModal;
        setDeleteModal(null);
        setDeleting(id);
        await apiDeleteScheme(id);
        setSchemes(ss => ss.filter(s => s.id !== id));
        setDeleting(null);
        // Start undo timer (6 seconds)
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoToast({ id, name, progress: 100 });
        undoTimerRef.current = setTimeout(() => setUndoToast(null), 6000);
    };

    const handleUndo = async () => {
        if (!undoToast) return;
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoToast(null);
        await apiUpdateScheme(undoToast.id, { isActive: true });
        load(); // Reload to show restored scheme
    };

    const handleSave = async () => {
        if (editMode) {
            await apiUpdateScheme(editId, form);
            setSchemes(ss => ss.map(s => s.id === editId ? { ...s, ...form } : s));
        } else {
            const res = await apiAddScheme(form);
            setSchemes(ss => [res.data, ...ss]);
        }
        setModal(false);
    };

    const catColors = {
        Agriculture: '#10B981', Healthcare: '#EF4444', Housing: '#3B82F6',
        Education: '#8B5CF6', 'Labour & Employment': '#F59E0B',
        'Pension & Social Security': '#FF6B2C', 'Women & Child': '#EC4899', Others: '#6B7280'
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdSchool className="icon" /> Scheme Management — NAGRIQ</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        {(schemes || []).length} government schemes managed on this platform
                    </p>
                </div>
                <button className="btn-primary" onClick={openAdd}><MdAdd /> Add New Scheme</button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                    <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                    <input className="form-input" placeholder="Search schemes..." value={search}
                        onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: '100%' }} />
                </div>
                <select className="form-input" style={{ flex: '0 1 180px' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {SCHEME_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            {/* Scheme Cards Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>Loading schemes...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {(schemes || []).filter(s => s).map((rawScheme, i) => {
                        const scheme = {
                            ...rawScheme,
                            benefit: rawScheme.benefit || rawScheme.benefits || 'See details',
                            eligibility: typeof rawScheme.eligibility === 'string' ? rawScheme.eligibility : 'Check details',
                            beneficiaries: rawScheme.beneficiaries || 'N/A'
                        };
                        return (
                        <div key={scheme.id || i} className="glass-card" style={{
                            padding: 20,
                            animation: `fadeInUp 0.4s ease ${i * 0.04}s both`,
                            border: `1px solid rgba(255,255,255,0.07)`
                        }}>
                            {/* Category tag */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{
                                    background: `${catColors[scheme.category] || '#6B7280'}20`,
                                    color: catColors[scheme.category] || '#6B7280',
                                    border: `1px solid ${catColors[scheme.category] || '#6B7280'}40`,
                                    padding: '3px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700
                                }}>{scheme.category}</span>
                                <span className="badge badge-resolved">Active</span>
                            </div>

                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 8, lineHeight: 1.3 }}>
                                {scheme.name}
                            </h3>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                                {scheme.description}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                                <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>Benefit:</span>
                                    <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{scheme.benefit}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>Eligibility:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{scheme.eligibility}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>Coverage:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{scheme.state}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>Beneficiaries:</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{scheme.beneficiaries}</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            {scheme.applicants > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        <span>{scheme.resolved?.toLocaleString()} served</span>
                                        <span>{Math.round(scheme.resolved / scheme.applicants * 100)}% coverage</span>
                                    </div>
                                    <div style={{ height: 5, background: 'rgba(255, 255, 255, 0.12)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.round(scheme.resolved / scheme.applicants * 100)}%`,
                                            height: '100%', background: 'linear-gradient(90deg, var(--teal), #138808)', borderRadius: 3
                                        }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button className="btn-secondary" onClick={() => openEdit(scheme)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}>
                                    <MdEdit /> Edit
                                </button>
                                <button onClick={() => setDeleteModal({ id: scheme.id, name: scheme.name })} disabled={deleting === scheme.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {deleting === scheme.id ? '...' : <><MdDeleteForever /> Delete</>}
                                </button>
                            </div>
                        </div>
                    );})}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
                    <div style={{ background: '#0a1628', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16, padding: 28, maxWidth: 440, width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#EF4444', flexShrink: 0 }}><MdWarning /></div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#EF4444' }}>Deactivate Scheme?</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>This will hide it from all citizens immediately.</p>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-white)' }}>
                            {deleteModal.name}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Citizens who have already applied will not be affected. You can undo this within 6 seconds after confirming.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button onClick={handleDeleteConfirm} style={{ flex: 1, background: 'linear-gradient(135deg,#EF4444,#B91C1C)', color: 'white', border: 'none', borderRadius: 8, padding: '11px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Inter' }}><MdDeleteForever /> Deactivate</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Undo Toast */}
            {undoToast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 3000, background: '#0D1B2E', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 300, animation: 'fadeInUp 0.3s ease' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>Deactivated: <strong style={{ color: 'var(--text-white)' }}>{undoToast.name}</strong></span>
                    <button onClick={handleUndo} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 8, color: '#00C896', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter' }}><MdUndo /> Undo</button>
                    <button onClick={() => setUndoToast(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}><MdClose /></button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {modal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(5,11,26,0.85)',
                    backdropFilter: 'blur(8px)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 600,
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.1rem' }}>{editMode ? 'Edit Scheme' : 'Add New Scheme'}</h2>
                            <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}><MdClose /></button>
                        </div>
                        <div className="responsive-grid-2" style={{ gap: 16 }}>
                            {[
                                { key: 'name', label: 'Scheme Name', span: 2 },
                                { key: 'category', label: 'Category', type: 'select', options: SCHEME_CATEGORIES },
                                { key: 'state', label: 'State Coverage' },
                                { key: 'benefit', label: 'Benefit', span: 2 },
                                { key: 'eligibility', label: 'Eligibility', span: 2 },
                                { key: 'description', label: 'Description', type: 'textarea', span: 2 },
                                { key: 'minAge', label: 'Min Age', type: 'number' },
                                { key: 'maxAge', label: 'Max Age', type: 'number' },
                                { key: 'maxIncome', label: 'Max Income (₹)', type: 'number' },
                            ].map(field => (
                                <div key={field.key} className="form-group" style={{ gridColumn: field.span === 2 ? '1/-1' : 'auto' }}>
                                    <label className="form-label">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea className="form-input" rows={3} value={form[field.key] || ''}
                                            onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                            style={{ resize: 'none' }} />
                                    ) : field.type === 'select' ? (
                                        <select className="form-input" value={form[field.key] || ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}>
                                            {field.options.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    ) : (
                                        <input className="form-input" type={field.type || 'text'} value={form[field.key] || ''}
                                            onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}><MdCheck /> {editMode ? 'Update Scheme' : 'Add Scheme'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
