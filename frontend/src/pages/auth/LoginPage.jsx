import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiLogin } from '../../services/api.service';
import { MdEmail, MdLock, MdAdminPanelSettings, MdPerson } from 'react-icons/md';
import { PROJECT_NAME } from '../../config/constants';
import './AuthPages.css';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await apiLogin(form.email, form.password);
        setLoading(false);
        if (res.success) {
            login(res.user);
            navigate(res.user.role === 'admin' ? '/admin' : '/citizen');
        } else {
            setError(res.error);
        }
    };

    const quickFill = (type) => {
        if (type === 'admin') setForm({ email: 'admin@gov.in', password: 'admin123' });
        else setForm({ email: 'ramesh@gmail.com', password: 'ramesh123' });
    };

    return (
        <div className="auth-bg">
            <div className="auth-container">
                <div className="auth-card">
                    {/* Logo */}
                    <div className="auth-logo-wrap">
                        <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
                            <circle cx="28" cy="28" r="28" fill="rgba(255,107,44,0.15)" />
                            <circle cx="28" cy="28" r="16" stroke="#FF6B2C" strokeWidth="2.5" fill="none" />
                            <circle cx="28" cy="28" r="4" fill="#FF6B2C" />
                            {Array.from({ length: 8 }).map((_, i) => (
                                <line key={i} x1="28" y1="13" x2="28" y2="18" stroke="#FF6B2C" strokeWidth="2"
                                    transform={`rotate(${i * 45} 28 28)`} strokeLinecap="round" />
                            ))}
                        </svg>
                    </div>

                    <h1 className="auth-title">{PROJECT_NAME}</h1>
                    <p className="auth-subtitle">Citizen Services Platform — Government of India</p>

                    {/* Quick Login Buttons */}
                    <div className="quick-login-row">
                        <button className="quick-login-btn" onClick={() => quickFill('admin')}>
                            <MdAdminPanelSettings /> Admin Demo
                        </button>
                        <button className="quick-login-btn" onClick={() => quickFill('citizen')}>
                            <MdPerson /> Citizen Demo
                        </button>
                    </div>

                    <div className="auth-divider"><span>or sign in manually</span></div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-input-group">
                            <MdEmail className="auth-input-icon" />
                            <input type="email" className="auth-input" placeholder="Email address"
                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="auth-input-group">
                            <MdLock className="auth-input-icon" />
                            <input type="password" className="auth-input" placeholder="Password"
                                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        </div>
                        <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        New to {PROJECT_NAME}? <Link to="/register">Create Account</Link>
                    </p>
                    <p style={{ textAlign: 'center', marginTop: 8 }}>
                        <Link to="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
