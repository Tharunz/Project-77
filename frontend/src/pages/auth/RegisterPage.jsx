import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRegister } from '../../services/api.service';
import { MdPerson, MdEmail, MdLock, MdLocationOn, MdCake, MdAttachMoney } from 'react-icons/md';
import { INDIAN_STATES } from '../../mock/mockData';
import { PROJECT_NAME } from '../../config/constants';
import './AuthPages.css';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', state: '', age: '', income: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.password || !form.state) {
            setError('Please fill all required fields.'); return;
        }
        setLoading(true);
        const res = await apiRegister(form);
        setLoading(false);
        if (res.success) { login(res.user); navigate('/citizen'); }
        else setError(res.error || 'Registration failed.');
    };

    const fields = [
        { key: 'name', label: 'Full Name', icon: <MdPerson />, type: 'text', placeholder: 'Ramesh Kumar', required: true },
        { key: 'email', label: 'Email Address', icon: <MdEmail />, type: 'email', placeholder: 'ramesh@gmail.com', required: true },
        { key: 'password', label: 'Create Password', icon: <MdLock />, type: 'password', placeholder: '••••••••', required: true },
        { key: 'age', label: 'Age', icon: <MdCake />, type: 'number', placeholder: '35' },
        { key: 'income', label: 'Annual Income (₹)', icon: <MdAttachMoney />, type: 'number', placeholder: '150000' },
    ];

    return (
        <div className="auth-bg">
            <div className="auth-container" style={{ maxWidth: 500 }}>
                <div className="auth-card">
                    <div className="auth-logo-wrap">
                        <svg width="44" height="44" viewBox="0 0 56 56" fill="none">
                            <circle cx="28" cy="28" r="28" fill="rgba(0,200,150,0.15)" />
                            <circle cx="28" cy="28" r="16" stroke="#00C896" strokeWidth="2.5" fill="none" />
                            <circle cx="28" cy="28" r="4" fill="#00C896" />
                            {Array.from({ length: 8 }).map((_, i) => (
                                <line key={i} x1="28" y1="13" x2="28" y2="18" stroke="#00C896" strokeWidth="2"
                                    transform={`rotate(${i * 45} 28 28)`} strokeLinecap="round" />
                            ))}
                        </svg>
                    </div>
                    <h1 className="auth-title" style={{ background: 'linear-gradient(135deg, #00C896, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Create Account
                    </h1>
                    <p className="auth-subtitle">Join 14 crore citizens on {PROJECT_NAME}</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        {fields.map(f => (
                            <div key={f.key} className="auth-input-group">
                                <span className="auth-input-icon">{f.icon}</span>
                                <input className="auth-input" type={f.type} placeholder={f.placeholder} required={f.required}
                                    value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                            </div>
                        ))}
                        <div style={{ position: 'relative' }}>
                            <MdLocationOn className="auth-input-icon" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                            <select className="auth-input" style={{ paddingLeft: 42 }} required
                                value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}>
                                <option value="">Select State *</option>
                                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn-teal auth-submit-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                            {loading ? 'Creating account...' : 'Create My Account →'}
                        </button>
                    </form>
                    <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
}
