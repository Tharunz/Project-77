import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguagePill, useLanguage } from '../context/LanguageContext';
import {
    MdDashboard, MdListAlt, MdPsychology, MdMap, MdSchool,
    MdNotifications, MdSecurity, MdAnalytics, MdLogout, MdMenu,
    MdClose, MdAdminPanelSettings, MdChevronRight, MdWarning, MdTimer, MdShield, MdAccountBalanceWallet
} from 'react-icons/md';
import { PROJECT_NAME } from '../config/constants';
import './AdminLayout.css';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { to: '/admin', icon: <MdDashboard />, label: t('dashboard'), end: true },
        { to: '/admin/preseva', icon: <MdShield />, label: t('PRESEVA AI'), highlight: true },
        { to: '/admin/grievances', icon: <MdListAlt />, label: t('grievances') },
        { to: '/admin/sentiment', icon: <MdPsychology />, label: t('Sentiment AI') },
        { to: '/admin/heatmap', icon: <MdMap />, label: t('India Heatmap') },
        { to: '/admin/schemes', icon: <MdSchool />, label: t('schemes') },
        { to: '/admin/notifications', icon: <MdNotifications />, label: t('Notifications') },
        { to: '/admin/fraud', icon: <MdSecurity />, label: t('Fraud Detection') },
        { to: '/admin/analytics', icon: <MdAnalytics />, label: t('Analytics') },
        { to: '/admin/distress', icon: <MdWarning />, label: t('Distress Index') },
        { to: '/admin/sla', icon: <MdTimer />, label: t('SLA Tracker') },
        { to: '/admin/escrow', icon: <MdAccountBalanceWallet />, label: t('NYAYKOSH Ledger') },
        { to: '/admin/audits', icon: <MdSecurity />, label: t('Ghost Audits') }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header" style={{ justifyContent: sidebarOpen ? 'space-between' : 'center', padding: sidebarOpen ? '20px 16px 16px' : '20px 0 16px' }}>
                    {sidebarOpen && (
                        <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
                            <div className="logo-icon">
                                <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="20" fill="rgba(255,107,44,0.15)" />
                                    <circle cx="20" cy="20" r="12" stroke="#FF6B2C" strokeWidth="2" fill="none" />
                                    <circle cx="20" cy="20" r="3" fill="#FF6B2C" />
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <line
                                            key={i}
                                            x1="20" y1="9" x2="20" y2="13"
                                            stroke="#FF6B2C" strokeWidth="1.5"
                                            transform={`rotate(${i * 45} 20 20)`}
                                            strokeLinecap="round"
                                        />
                                    ))}
                                </svg>
                                <span className="logo-text">{PROJECT_NAME}</span>
                            </div>
                        </Link>
                    )}
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={!sidebarOpen ? { background: 'transparent', border: 'none', color: 'var(--text-white)' } : {}}>
                        <MdMenu style={!sidebarOpen ? { fontSize: '1.6rem' } : {}} />
                    </button>
                </div>

                <div className="sidebar-badge">
                    <MdAdminPanelSettings />
                    <span>{t('Admin Portal')}</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-arrow"><MdChevronRight /></span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-avatar">{user?.name?.[0] || 'A'}</div>
                        <div className="admin-user-details">
                            <span className="admin-name">{t(user?.name) || t('Admin')}</span>
                            <span className="admin-role">{t(user?.role) || t('Super Admin')}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <MdLogout />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">{PROJECT_NAME} — {t('Integrated Citizen Intelligence Platform')}</div>
                    <div className="topbar-right">
                        <LanguagePill />
                        <div className="topbar-status">
                            <span className="status-dot" />
                            <span>{t('Live')}</span>
                        </div>
                        <div className="topbar-date">
                            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </header>
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
