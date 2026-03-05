import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRegister } from '../../services/api.service';
import { MdPerson, MdEmail, MdLock, MdLocationOn, MdCake, MdAttachMoney, MdShield, MdVerified, MdUpload, MdCheckCircle } from 'react-icons/md';
import { INDIAN_STATES } from '../../mock/mockData';
import { PROJECT_NAME } from '../../config/constants';
import './AuthPages.css';

const STEPS = [
    { id: 1, label: 'Account', icon: '👤' },
    { id: 2, label: 'Verify Email', icon: '📧' },
    { id: 3, label: 'KYC', icon: '🛡️' },
    { id: 4, label: 'Welcome', icon: '🎉' },
];

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', password: '', state: '', age: '', income: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Step 2 — OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const otpRefs = useRef([]);
    // Step 3 — KYC
    const [aadhaar, setAadhaar] = useState('');
    const [idUploaded, setIdUploaded] = useState(false);
    const [kycVerifying, setKycVerifying] = useState(false);
    const [kycDone, setKycDone] = useState(false);
    // Step 4 — registered user
    const [registeredUser, setRegisteredUser] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleStep1 = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.password || !form.state) { setError('Please fill all required fields.'); return; }
        setOtpSending(true);
        await new Promise(r => setTimeout(r, 700)); // Simulate OTP send
        setOtpSending(false);
        setStep(2);
    };

    const handleOtpInput = (val, idx) => {
        const digits = val.replace(/\D/g, '').slice(0, 1);
        const next = [...otp]; next[idx] = digits; setOtp(next);
        if (digits && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code !== '123456') { setOtpError('Invalid OTP. Demo: use 123456'); return; }
        setOtpError('');
        setStep(3);
    };

    const handleKyc = async () => {
        if (!aadhaar || aadhaar.replace(/\s/g,'').length < 12) { return; }
        setKycVerifying(true);
        await new Promise(r => setTimeout(r, 1800));
        setKycVerifying(false);
        setKycDone(true);
        await new Promise(r => setTimeout(r, 600));
        // Now actually register
        const res = await apiRegister(form);
        if (res.success) { setRegisteredUser(res.user); setStep(4); }
        else { setError(res.error || 'Registration failed.'); setStep(1); }
    };

    useEffect(() => {
        if (step === 4 && registeredUser) {
            const t = setTimeout(() => {
                login(registeredUser);
                // Check if already done onboarding for this specific user
                const done = localStorage.getItem(`ncie_onboarding_done_${registeredUser.id}`);
                navigate(done ? '/citizen' : '/onboarding');
            }, 2800);
            return () => clearTimeout(t);
        }
    }, [step, registeredUser]);

    const progressPct = ((step - 1) / 3) * 100;

    return (
        <div className="auth-bg">
            <div className="auth-container" style={{ maxWidth: 520 }}>
                <div className="auth-card">
                    {/* Logo */}
                    <div className="auth-logo-wrap">
                        <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
                            <circle cx="28" cy="28" r="28" fill="rgba(0,200,150,0.15)" />
                            <circle cx="28" cy="28" r="16" stroke="#00C896" strokeWidth="2.5" fill="none" />
                            <circle cx="28" cy="28" r="4" fill="#00C896" />
                            {Array.from({ length: 8 }).map((_, i) => (
                                <line key={i} x1="28" y1="13" x2="28" y2="18" stroke="#00C896" strokeWidth="2" transform={`rotate(${i * 45} 28 28)`} strokeLinecap="round" />
                            ))}
                        </svg>
                    </div>

                    {/* Step Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: step >= s.id ? 'linear-gradient(135deg,#00C896,#138808)' : 'rgba(255,255,255,0.07)', border: `2px solid ${step >= s.id ? '#00C896' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: step > s.id ? '1rem' : '0.9rem', transition: 'all 0.3s' }}>
                                        {step > s.id ? '✓' : s.icon}
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: step >= s.id ? '#00C896' : 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div style={{ height: 2, flex: 1, background: step > s.id ? '#00C896' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s', marginBottom: 20 }} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#00C896,#138808)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>

                    {/* ── STEP 1: Form ── */}
                    {step === 1 && (
                        <>
                            <h1 className="auth-title" style={{ background: 'linear-gradient(135deg,#00C896,#138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>Create Account</h1>
                            <p className="auth-subtitle" style={{ marginBottom: 20 }}>Join 14 crore citizens on {PROJECT_NAME}</p>
                            {error && <div className="auth-error">{error}</div>}
                            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
                                {[
                                    { key: 'name', icon: <MdPerson />, type: 'text', placeholder: 'Full Name *', required: true },
                                    { key: 'email', icon: <MdEmail />, type: 'email', placeholder: 'Email Address *', required: true },
                                    { key: 'password', icon: <MdLock />, type: 'password', placeholder: 'Create Password *', required: true },
                                    { key: 'age', icon: <MdCake />, type: 'number', placeholder: 'Age' },
                                    { key: 'income', icon: <MdAttachMoney />, type: 'number', placeholder: 'Annual Income (₹)' },
                                ].map(f => (
                                    <div key={f.key} className="auth-input-group">
                                        <span className="auth-input-icon">{f.icon}</span>
                                        <input className="auth-input" type={f.type} placeholder={f.placeholder} required={f.required} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                    </div>
                                ))}
                                <div className="auth-input-group">
                                    <span className="auth-input-icon"><MdLocationOn /></span>
                                    <select className="auth-input" required value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}>
                                        <option value="">Select State *</option>
                                        {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="btn-teal auth-submit-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={otpSending}>
                                    {otpSending ? 'Sending OTP...' : 'Continue → Verify Email'}
                                </button>
                            </form>
                            <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
                        </>
                    )}

                    {/* ── STEP 2: Email OTP ── */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>📧</div>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>Verify Your Email</h2>
                                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    A 6-digit OTP has been sent to <strong style={{ color: '#00C896' }}>{form.email}</strong>.<br />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demo: enter 123456</span>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }} onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={e => handleOtpInput(e.target.value, i)}
                                        onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus(); }}
                                        style={{ width: 48, height: 56, textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, borderRadius: 10, border: `2px solid ${digit ? '#00C896' : 'rgba(255,255,255,0.12)'}`, background: digit ? 'rgba(0,200,150,0.08)' : 'rgba(255,255,255,0.04)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
                                    />
                                ))}
                            </div>
                            {otpError && <p style={{ color: '#EF4444', fontSize: '0.82rem', textAlign: 'center' }}>{otpError}</p>}
                            <button className="btn-teal" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVerifyOtp} disabled={otp.join('').length < 6}>
                                Verify OTP →
                            </button>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }} onClick={() => setStep(1)}>← Back to Form</button>
                        </div>
                    )}

                    {/* ── STEP 3: KYC ── */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🛡️</div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>KYC Verification</h2>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Required by DigiLocker & Aadhaar integration</p>
                            </div>
                            {!kycDone ? (
                                <>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Aadhaar Number</label>
                                        <input className="auth-input" type="text" placeholder="XXXX XXXX XXXX" maxLength={14}
                                            value={aadhaar}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                setAadhaar(raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
                                            }}
                                            style={{ letterSpacing: '0.15em', textAlign: 'center', fontSize: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', color: 'white', width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', background: idUploaded ? 'rgba(0,200,150,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s', borderColor: idUploaded ? 'rgba(0,200,150,0.4)' : 'rgba(255,255,255,0.12)' }}
                                        onClick={() => setIdUploaded(true)}>
                                        {idUploaded ? (
                                            <div style={{ color: '#00C896', fontWeight: 700, fontSize: '0.88rem' }}>✓ ID Document Uploaded</div>
                                        ) : (
                                            <>
                                                <MdUpload style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: 6 }} />
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload ID Proof</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Aadhaar / Voter ID / Passport</div>
                                            </>
                                        )}
                                    </div>
                                    <button className="btn-teal" style={{ width: '100%', justifyContent: 'center' }}
                                        disabled={kycVerifying || aadhaar.replace(/\s/g,'').length < 12 || !idUploaded}
                                        onClick={handleKyc}>
                                        {kycVerifying ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                                Verifying Aadhaar...
                                            </span>
                                        ) : 'Verify & Create Account →'}
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <div style={{ fontSize: '3rem', animation: 'fadeIn 0.5s ease' }}>✅</div>
                                    <p style={{ color: '#00C896', fontWeight: 700, marginTop: 10 }}>KYC Verified!</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Creating your account...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: Welcome ── */}
                    {step === 4 && (
                        <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,200,150,0.2),rgba(19,136,8,0.2))', border: '3px solid #00C896', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', animation: 'fadeIn 0.6s ease' }}>🎉</div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg,#00C896,#138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome, {form.name.split(' ')[0]}!</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>Your account has been created and KYC verified.<br />Redirecting to your dashboard...</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                                {['✓ Account Created', '✓ Email Verified', '✓ KYC Approved'].map((item, i) => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#00C896', fontWeight: 600, animation: `fadeInUp 0.4s ease ${i * 0.15}s both` }}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                                <div style={{ height: '100%', background: 'linear-gradient(90deg,#00C896,#138808)', borderRadius: 4, animation: 'progressFill 2.8s linear forwards' }} />
                            </div>
                            <style>{`@keyframes progressFill { from { width:0% } to { width:100% } } @keyframes spin { to { transform:rotate(360deg) } }`}</style>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
