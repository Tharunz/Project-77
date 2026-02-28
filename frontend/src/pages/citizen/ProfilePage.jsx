import React, { useState } from 'react';
import { MdPerson, MdEdit, MdSave, MdClose, MdLocationOn, MdCake, MdEmail, MdAttachMoney } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES } from '../../mock/mockData';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        state: user?.state || '',
        age: user?.age || '',
        income: user?.income || '',
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        login({ ...user, ...form });
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const profileStats = [
        { label: 'Grievances Filed', value: 5, color: '#3B82F6' },
        { label: 'Resolved', value: 3, color: '#00C896' },
        { label: 'Pending', value: 2, color: '#F59E0B' },
        { label: 'Schemes Matched', value: 4, color: '#8B5CF6' },
    ];

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, margin: '0 auto' }}>
            <div>
                <h1 className="section-title"><MdPerson className="icon" /> My Profile</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    Manage your account details and preferences
                </p>
            </div>

            {saved && (
                <div style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    ✓ Profile updated successfully!
                </div>
            )}

            {/* Profile Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
                {/* Avatar Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--teal), #138808)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 800, color: 'white',
                        border: '3px solid rgba(0,200,150,0.3)'
                    }}>
                        {user?.name?.[0] || 'C'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.2rem' }}>{user?.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user?.email}</p>
                        <span className="badge badge-resolved" style={{ marginTop: 6 }}>✓ Citizen Account</span>
                    </div>
                    <button
                        onClick={editMode ? handleSave : () => setEditMode(true)}
                        className={editMode ? 'btn-teal' : 'btn-secondary'}
                        style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }}
                    >
                        {editMode ? <><MdSave /> Save</> : <><MdEdit /> Edit</>}
                    </button>
                    {editMode && (
                        <button className="btn-secondary" style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }}
                            onClick={() => setEditMode(false)}>
                            <MdClose /> Cancel
                        </button>
                    )}
                </div>

                {/* Fields */}
                <div className="responsive-grid-2" style={{ gap: 16 }}>
                    {[
                        { key: 'name', label: 'Full Name', icon: <MdPerson />, type: 'text' },
                        { key: 'email', label: 'Email Address', icon: <MdEmail />, type: 'email' },
                        { key: 'age', label: 'Age', icon: <MdCake />, type: 'number' },
                        { key: 'income', label: 'Annual Income (₹)', icon: <MdAttachMoney />, type: 'number' },
                    ].map(field => (
                        <div key={field.key} className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ color: 'var(--saffron)', fontSize: '0.9rem' }}>{field.icon}</span> {field.label}
                            </label>
                            {editMode ? (
                                <input className="form-input" type={field.type} value={form[field.key]}
                                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                                    {field.key === 'income' ? `₹${Number(user?.[field.key] || 0).toLocaleString()}` : user?.[field.key] || '—'}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* State - full width */}
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MdLocationOn style={{ color: 'var(--saffron)' }} /> State
                        </label>
                        {editMode ? (
                            <select className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                                <option value="">Select State</option>
                                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                                {user?.state || '—'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>Activity Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                    {profileStats.map(stat => (
                        <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color, textAlign: 'center', padding: '16px 12px' }}>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data & Privacy */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 12 }}>Data & Privacy</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                    Your personal data is protected under the Digital Personal Data Protection Act, 2023. Project-77 stores only the minimum information required to process your grievances and match you with schemes.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>📥 Download My Data</button>
                    <button style={{
                        padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.08)', color: 'var(--red)', fontSize: '0.8rem',
                        cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600
                    }}>🗑 Delete Account</button>
                </div>
            </div>
        </div>
    );
}
