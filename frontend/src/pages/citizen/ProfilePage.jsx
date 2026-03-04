import React, { useState, useEffect } from 'react';
import { MdPerson, MdEdit, MdSave, MdClose, MdLocationOn, MdCake, MdEmail, MdAttachMoney, MdDownload, MdDeleteForever, MdLock, MdPhone, MdVerified, MdBookmark, MdSchool, MdArrowForward, MdShield } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES } from '../../mock/mockData';
import { PROJECT_NAME } from '../../config/constants';
import { apiUpdateProfile, apiGetProfile, apiExportData, apiDeleteAccount, apiChangePassword, apiSendOTP, apiVerifyOTP, apiGetBookmarkedSchemes, apiUnbookmarkScheme } from '../../services/api.service';

export default function ProfilePage() {
    const { user, login, logout } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', state: user?.state || '', age: user?.age || '', income: user?.income || '' });
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileStats, setProfileStats] = useState([
        { label: 'Grievances Filed', value: '…', color: '#3B82F6' },
        { label: 'Resolved', value: '…', color: '#00C896' },
        { label: 'Pending', value: '…', color: '#F59E0B' },
        { label: 'Schemes Matched', value: '…', color: '#8B5CF6' },
    ]);
    const [bookmarks, setBookmarks] = useState([]);

    // Delete account modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Password change state
    const [showPwSection, setShowPwSection] = useState(false);
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [pwMsg, setPwMsg] = useState(null);
    const [pwSaving, setPwSaving] = useState(false);

    // KYC / Phone verification state
    const [showKyc, setShowKyc] = useState(false);
    const [phone, setPhone] = useState(user?.phone || '');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [kycMsg, setKycMsg] = useState(null);
    const [kycLoading, setKycLoading] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(user?.mobileVerified || false);

    useEffect(() => {
        apiGetProfile().then(res => {
            if (res.success && res.data?.stats) {
                const s = res.data.stats;
                setProfileStats([
                    { label: 'Grievances Filed', value: s.totalGrievances ?? 0, color: '#3B82F6' },
                    { label: 'Resolved', value: s.resolvedGrievances ?? 0, color: '#00C896' },
                    { label: 'Pending', value: s.pendingGrievances ?? 0, color: '#F59E0B' },
                    { label: 'Schemes Matched', value: s.schemesMatched ?? 0, color: '#8B5CF6' },
                ]);
                setMobileVerified(res.data.mobileVerified || false);
                setPhone(res.data.phone || '');
            }
        });
        apiGetBookmarkedSchemes().then(res => {
            if (res.success && Array.isArray(res.data)) setBookmarks(res.data);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await apiUpdateProfile({ name: form.name, state: form.state, age: form.age, income: form.income });
        setSaving(false);
        if (res.success && res.data) login({ ...user, ...res.data });
        else login({ ...user, ...form });
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleExport = async () => {
        const res = await apiExportData();
        if (res.success && res.data) {
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `ncie-data-${user?.id || 'export'}.json`; a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setDeleting(true);
        const res = await apiDeleteAccount();
        setDeleting(false);
        if (res.success) logout();
    };

    const handlePasswordChange = async () => {
        if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
        if (pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
        setPwSaving(true);
        const res = await apiChangePassword(pwForm.current, pwForm.newPw);
        setPwSaving(false);
        if (res.success) { setPwMsg({ type: 'success', text: 'Password changed successfully!' }); setPwForm({ current: '', newPw: '', confirm: '' }); }
        else setPwMsg({ type: 'error', text: res.message || 'Failed to change password.' });
    };

    const handleSendOTP = async () => {
        setKycLoading(true); setKycMsg(null);
        const res = await apiSendOTP(phone);
        setKycLoading(false);
        if (res.success) { setOtpSent(true); setKycMsg({ type: 'success', text: 'OTP sent! (Demo: use 1234)' }); }
        else setKycMsg({ type: 'error', text: res.message || 'Failed to send OTP.' });
    };

    const handleVerifyOTP = async () => {
        setKycLoading(true); setKycMsg(null);
        const res = await apiVerifyOTP(otp);
        setKycLoading(false);
        if (res.success) { setMobileVerified(true); setKycMsg({ type: 'success', text: 'Mobile verified successfully! ✓' }); login({ ...user, mobileVerified: true, phone }); }
        else setKycMsg({ type: 'error', text: res.message || 'Invalid OTP.' });
    };

    const handleUnbookmark = async (id) => {
        await apiUnbookmarkScheme(id);
        setBookmarks(prev => prev.filter(s => s.id !== id));
    };

    const catColors = { Agriculture: '#10B981', Healthcare: '#EF4444', Housing: '#3B82F6', Education: '#8B5CF6', 'Labour & Employment': '#F59E0B', 'Pension & Social Security': '#FF6B2C', 'Women & Child': '#EC4899', Others: '#6B7280' };

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700, margin: '0 auto' }}>
            <div>
                <h1 className="section-title"><MdPerson className="icon" /> My Profile</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>Manage your account details and preferences</p>
            </div>

            {saved && (
                <div style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    ✓ Profile updated successfully!
                </div>
            )}

            {/* Profile Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), #138808)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', border: '3px solid rgba(0,200,150,0.3)' }}>
                        {user?.name?.[0] || 'C'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.2rem' }}>{user?.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user?.email}</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            <span className="badge badge-resolved">✓ Citizen Account</span>
                            {mobileVerified ? <span className="badge badge-resolved"><MdVerified style={{ marginRight: 3 }} />Mobile Verified</span>
                                : <span className="badge badge-pending">Mobile Unverified</span>}
                        </div>
                    </div>
                    <button onClick={editMode ? handleSave : () => setEditMode(true)} className={editMode ? 'btn-teal' : 'btn-secondary'} style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }} disabled={saving}>
                        {editMode ? (saving ? 'Saving...' : <><MdSave /> Save</>) : <><MdEdit /> Edit</>}
                    </button>
                    {editMode && <button className="btn-secondary" style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }} onClick={() => setEditMode(false)}><MdClose /> Cancel</button>}
                </div>

                <div className="responsive-grid-2" style={{ gap: 16 }}>
                    {[{ key: 'name', label: 'Full Name', icon: <MdPerson />, type: 'text' }, { key: 'email', label: 'Email Address', icon: <MdEmail />, type: 'email' }, { key: 'age', label: 'Age', icon: <MdCake />, type: 'number' }, { key: 'income', label: 'Annual Income (₹)', icon: <MdAttachMoney />, type: 'number' }].map(field => (
                        <div key={field.key} className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: 'var(--saffron)', fontSize: '0.9rem' }}>{field.icon}</span> {field.label}</label>
                            {editMode ? <input className="form-input" type={field.type} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                                : <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>{field.key === 'income' ? `₹${Number(user?.[field.key] || 0).toLocaleString()}` : user?.[field.key] || '—'}</p>}
                        </div>
                    ))}
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MdLocationOn style={{ color: 'var(--saffron)' }} /> State</label>
                        {editMode ? <select className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}><option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}</select>
                            : <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>{user?.state || '—'}</p>}
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

            {/* Mobile Verification / KYC */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><MdPhone style={{ color: 'var(--saffron)' }} /> Mobile Verification</h4>
                    {!showKyc && <button className="btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => setShowKyc(true)}>{mobileVerified ? 'Update Mobile' : 'Verify Now'}</button>}
                </div>
                {!showKyc ? (
                    <p style={{ fontSize: '0.82rem', color: mobileVerified ? 'var(--teal)' : 'var(--text-secondary)' }}>
                        {mobileVerified ? `✓ Verified: +91 ${phone}` : 'Verify your mobile number to unlock additional features and receive SMS alerts.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input className="form-input" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} style={{ flex: 1 }} maxLength={10} />
                            <button className="btn-secondary" onClick={handleSendOTP} disabled={kycLoading || otpSent}>{kycLoading && !otpSent ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}</button>
                        </div>
                        {otpSent && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="form-input" placeholder="Enter OTP (demo: 1234)" value={otp} onChange={e => setOtp(e.target.value)} style={{ flex: 1 }} maxLength={6} />
                                <button className="btn-primary" onClick={handleVerifyOTP} disabled={kycLoading}>{kycLoading ? 'Verifying...' : 'Verify OTP'}</button>
                            </div>
                        )}
                        {kycMsg && <p style={{ fontSize: '0.82rem', color: kycMsg.type === 'success' ? 'var(--teal)' : 'var(--red)' }}>{kycMsg.text}</p>}
                        <button className="btn-secondary" style={{ fontSize: '0.78rem', alignSelf: 'flex-start' }} onClick={() => { setShowKyc(false); setOtpSent(false); setKycMsg(null); }}>Cancel</button>
                    </div>
                )}
            </div>

            {/* Password Change */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><MdLock style={{ color: 'var(--saffron)' }} /> Change Password</h4>
                    <button className="btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => setShowPwSection(!showPwSection)}>{showPwSection ? 'Cancel' : 'Change'}</button>
                </div>
                {showPwSection && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['current', 'newPw', 'confirm'].map((k, i) => (
                            <input key={k} className="form-input" type="password" placeholder={i === 0 ? 'Current password' : i === 1 ? 'New password (min 6 chars)' : 'Confirm new password'}
                                value={pwForm[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} />
                        ))}
                        {pwMsg && <p style={{ fontSize: '0.82rem', color: pwMsg.type === 'success' ? 'var(--teal)' : 'var(--red)' }}>{pwMsg.text}</p>}
                        <button className="btn-primary" onClick={handlePasswordChange} disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>{pwSaving ? 'Saving...' : <><MdLock /> Update Password</>}</button>
                    </div>
                )}
            </div>

            {/* Bookmarked Schemes */}
            {bookmarks.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}><MdBookmark style={{ color: '#8B5CF6' }} /> Bookmarked Schemes ({bookmarks.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {bookmarks.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColors[s.category] || '#6B7280', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.category} • {s.state}</p>
                                </div>
                                <button onClick={() => handleUnbookmark(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, fontSize: '1rem' }} title="Remove bookmark">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data & Privacy */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}><MdShield style={{ color: 'var(--saffron)' }} /> Data & Privacy</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                    Your personal data is protected under the Digital Personal Data Protection Act, 2023. {PROJECT_NAME} stores only the minimum information required to process your grievances and match you with schemes.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={handleExport}><MdDownload /> Download My Data</button>
                    <button onClick={() => setShowDeleteModal(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdDeleteForever /> Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 8 }}>⚠️</div>
                            <h2 style={{ fontSize: '1.2rem', color: 'var(--red)', marginBottom: 8 }}>Delete Account Permanently</h2>
                            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                This action is <strong style={{ color: 'var(--red)' }}>irreversible</strong>. All your grievances, data, and profile will be permanently deleted. You will be logged out immediately.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 14 }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>Type <strong style={{ color: 'var(--red)' }}>DELETE</strong> to confirm:</p>
                            <input className="form-input" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE here" style={{ borderColor: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.6)' : undefined }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancel</button>
                            <button onClick={handleDelete} disabled={deleteConfirm !== 'DELETE' || deleting}
                                style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: deleteConfirm === 'DELETE' ? '#DC2626' : 'rgba(239,68,68,0.2)', color: deleteConfirm === 'DELETE' ? 'white' : 'rgba(239,68,68,0.4)', fontWeight: 700, fontSize: '0.85rem', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed', fontFamily: 'Inter' }}>
                                {deleting ? 'Deleting...' : '🗑 Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
