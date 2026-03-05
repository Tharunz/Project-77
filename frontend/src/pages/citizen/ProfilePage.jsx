import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    // Secondary mobile
    const [showSecondaryMobile, setShowSecondaryMobile] = useState(false);
    const [secondaryPhone, setSecondaryPhone] = useState('');
    const [secondaryOtpSent, setSecondaryOtpSent] = useState(false);
    const [secondaryOtp, setSecondaryOtp] = useState('');
    const [secondaryMsg, setSecondaryMsg] = useState(null);
    // Email OTP verification
    const [emailOtpModal, setEmailOtpModal] = useState(null);
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpMsg, setEmailOtpMsg] = useState(null);
    const [emailOtpLoading, setEmailOtpLoading] = useState(false);
    // Password OTP step
    const [pwOtpStep, setPwOtpStep] = useState(false);
    const [pwOtp, setPwOtp] = useState('');

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
        // If email changed, require email OTP verification first
        if (form.email && form.email !== (user?.email || '')) {
            setEmailOtpModal({ pendingEmail: form.email });
            setEmailOtp('');
            setEmailOtpMsg(null);
            return;
        }
        setSaving(true);
        const res = await apiUpdateProfile({ name: form.name, email: form.email, state: form.state, age: form.age, income: form.income });
        setSaving(false);
        if (res.success && res.data) {
            login({ ...user, ...res.data });
        } else {
            login({ ...user, ...form });
        }
        // Re-fetch full profile to sync stats and ensure DB state is reflected
        apiGetProfile().then(r => {
            if (r.success && r.data) {
                login({ ...user, ...r.data });
                if (r.data.stats) {
                    const s = r.data.stats;
                    setProfileStats([
                        { label: 'Grievances Filed', value: s.totalGrievances ?? 0, color: '#3B82F6' },
                        { label: 'Resolved', value: s.resolvedGrievances ?? 0, color: '#00C896' },
                        { label: 'Pending', value: s.pendingGrievances ?? 0, color: '#F59E0B' },
                        { label: 'Schemes Matched', value: s.schemesMatched ?? 0, color: '#8B5CF6' },
                    ]);
                }
            }
        });
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleEmailOtpConfirm = async () => {
        if (emailOtp !== '123456') { setEmailOtpMsg({ type: 'error', text: 'Invalid OTP. Demo: use 123456' }); return; }
        setEmailOtpLoading(true);
        const res = await apiUpdateProfile({ name: form.name, email: emailOtpModal.pendingEmail, state: form.state, age: form.age, income: form.income });
        setEmailOtpLoading(false);
        if (res.success && res.data) login({ ...user, ...res.data, email: emailOtpModal.pendingEmail });
        else login({ ...user, ...form, email: emailOtpModal.pendingEmail });
        setEmailOtpModal(null);
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
        if (!pwOtpStep) {
            if (pwForm.newPw === pwForm.current) { setPwMsg({ type: 'error', text: 'New password cannot be the same as your current password.' }); return; }
            if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
            if (pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
            setPwSaving(true);
            await apiSendOTP(user?.email);
            setPwSaving(false);
            setPwOtpStep(true);
            setPwMsg({ type: 'success', text: 'OTP sent to your registered email. (Demo: use 123456)' });
            return;
        }
        if (pwOtp !== '123456') { setPwMsg({ type: 'error', text: 'Invalid OTP. Demo: use 123456' }); return; }
        setPwSaving(true);
        const res = await apiChangePassword(pwForm.current, pwForm.newPw);
        setPwSaving(false);
        if (res.success) { setPwMsg({ type: 'success', text: 'Password changed successfully!' }); setPwForm({ current: '', newPw: '', confirm: '' }); setPwOtpStep(false); setPwOtp(''); }
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
                    {mobileVerified && !showKyc && <button className="btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => setShowSecondaryMobile(v => !v)}>{showSecondaryMobile ? 'Cancel' : '+ Add Secondary'}</button>}
                    {!mobileVerified && !showKyc && <button className="btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => setShowKyc(true)}>Verify Now</button>}
                </div>

                {mobileVerified && !showKyc ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 10, padding: '12px 16px' }}>
                            <MdVerified style={{ color: 'var(--teal)', fontSize: '1.4rem', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.88rem' }}>Mobile Number Verified</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>+91 {phone ? phone.slice(0, 2) + '••••••' + phone.slice(-2) : '••••••••••'}</div>
                            </div>
                        </div>
                        {showSecondaryMobile && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Add Secondary Mobile</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form-input" placeholder="10-digit secondary number" value={secondaryPhone} onChange={e => setSecondaryPhone(e.target.value)} style={{ flex: 1 }} maxLength={10} />
                                    <button className="btn-secondary" onClick={async () => { await apiSendOTP(secondaryPhone); setSecondaryOtpSent(true); setSecondaryMsg({ type: 'success', text: 'OTP sent! (Demo: 123456)' }); }} disabled={secondaryOtpSent}>Send OTP</button>
                                </div>
                                {secondaryOtpSent && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input className="form-input" placeholder="Enter OTP (demo: 123456)" value={secondaryOtp} onChange={e => setSecondaryOtp(e.target.value)} style={{ flex: 1 }} maxLength={6} />
                                        <button className="btn-primary" onClick={() => { if (secondaryOtp === '123456') { setSecondaryMsg({ type: 'success', text: '✓ Secondary number added!' }); setSecondaryOtpSent(false); setSecondaryPhone(''); setSecondaryOtp(''); } else setSecondaryMsg({ type: 'error', text: 'Invalid OTP' }); }}>Verify</button>
                                    </div>
                                )}
                                {secondaryMsg && <p style={{ fontSize: '0.78rem', color: secondaryMsg.type === 'success' ? 'var(--teal)' : 'var(--red)' }}>{secondaryMsg.text}</p>}
                            </div>
                        )}
                    </div>
                ) : !showKyc ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Verify your mobile number to unlock additional features and receive SMS alerts.</p>
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
                        {!pwOtpStep ? (
                            ['current', 'newPw', 'confirm'].map((k, i) => (
                                <input key={k} className="form-input" type="password" placeholder={i === 0 ? 'Current password' : i === 1 ? 'New password (min 6 chars)' : 'Confirm new password'}
                                    value={pwForm[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} />
                            ))
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📧 Enter the OTP sent to your registered email to confirm this change.</p>
                                <input className="form-input" placeholder="Enter OTP (demo: 123456)" value={pwOtp} onChange={e => setPwOtp(e.target.value)} maxLength={6} />
                            </div>
                        )}
                        {pwMsg && <p style={{ fontSize: '0.82rem', color: pwMsg.type === 'success' ? 'var(--teal)' : 'var(--red)' }}>{pwMsg.text}</p>}
                        <div style={{ display: 'flex', gap: 8 }}>
                            {pwOtpStep && <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => { setPwOtpStep(false); setPwOtp(''); setPwMsg(null); }}>← Back</button>}
                            <button className="btn-primary" onClick={handlePasswordChange} disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>{pwSaving ? 'Sending OTP...' : pwOtpStep ? '✓ Confirm Change' : <><MdLock /> Continue →</>}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bookmarked Schemes */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}><MdBookmark style={{ color: '#8B5CF6' }} /> Bookmarked Schemes {bookmarks.length > 0 && `(${bookmarks.length})`}</h4>
                {bookmarks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <MdBookmark style={{ fontSize: '2rem', marginBottom: 8, opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                        No bookmarked schemes yet.<br />
                        <Link to="/citizen/schemes" style={{ color: 'var(--saffron)', fontWeight: 600 }}>Browse Schemes →</Link>
                    </div>
                )}
                {bookmarks.length > 0 && (
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
                )}
            </div>

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

            {/* Email OTP Verification Modal (F8) */}
            {emailOtpModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,24,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#0D1B2E', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📧</div>
                            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Verify New Email</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>An OTP has been sent to <strong style={{ color: 'var(--teal)' }}>{emailOtpModal.pendingEmail}</strong> to confirm this change.</p>
                        </div>
                        <input className="form-input" placeholder="Enter OTP (demo: 123456)" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} maxLength={6} style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.3em' }} />
                        {emailOtpMsg && <p style={{ fontSize: '0.82rem', color: emailOtpMsg.type === 'success' ? 'var(--teal)' : 'var(--red)', textAlign: 'center' }}>{emailOtpMsg.text}</p>}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEmailOtpModal(null)}>Cancel</button>
                            <button className="btn-teal" style={{ flex: 1 }} disabled={emailOtpLoading || emailOtp.length < 4} onClick={handleEmailOtpConfirm}>{emailOtpLoading ? 'Verifying...' : '✓ Confirm'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
                    <div style={{ background: '#0D1117', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: 32, maxWidth: 420, width: '90%', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 10000, opacity: 1 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 8 }}>⚠️</div>
                            <h2 style={{ fontSize: '1.1rem', color: '#EF4444', fontWeight: 700, marginBottom: 8 }}>Delete Account Permanently</h2>
                            <p style={{ fontSize: '0.83rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                                This action is <strong style={{ color: '#EF4444' }}>irreversible</strong>. All your grievances, data, and profile will be permanently deleted. You will be logged out immediately.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 14 }}>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 8 }}>Type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm:</p>
                            <input className="form-input" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE here" style={{ borderColor: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.6)' : undefined }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button style={{ flex: 1, padding: '10px 24px', borderRadius: 8, background: 'transparent', color: '#94A3B8', border: '1px solid #334155', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter' }} onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancel</button>
                            <button onClick={handleDelete} disabled={deleteConfirm !== 'DELETE' || deleting}
                                style={{ flex: 1, padding: '10px 24px', borderRadius: 8, border: 'none', background: deleteConfirm === 'DELETE' ? '#EF4444' : 'rgba(239,68,68,0.2)', color: deleteConfirm === 'DELETE' ? 'white' : 'rgba(239,68,68,0.4)', fontWeight: 600, fontSize: '0.85rem', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed', fontFamily: 'Inter' }}>
                                {deleting ? 'Deleting...' : '🗑 Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
