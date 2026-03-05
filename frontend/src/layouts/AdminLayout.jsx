import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguagePill } from '../context/LanguageContext';
import {
    MdDashboard, MdListAlt, MdPsychology, MdMap, MdSchool,
    MdNotifications, MdSecurity, MdAnalytics, MdLogout, MdMenu,
    MdClose, MdAdminPanelSettings, MdChevronRight, MdWarning, MdTimer, MdShield, MdAccountBalanceWallet
} from 'react-icons/md';
import { PROJECT_NAME } from '../config/constants';
import './AdminLayout.css';

const navItems = [
    { to: '/admin', icon: <MdDashboard />, label: 'Dashboard', end: true },
    { to: '/admin/grievances', icon: <MdListAlt />, label: 'Grievances' },
    { to: '/admin/sentiment', icon: <MdPsychology />, label: 'Sentiment AI' },
    { to: '/admin/heatmap', icon: <MdMap />, label: 'India Heatmap' },
    { to: '/admin/schemes', icon: <MdSchool />, label: 'Schemes' },
    { to: '/admin/notifications', icon: <MdNotifications />, label: 'Notifications' },
    { to: '/admin/fraud', icon: <MdSecurity />, label: 'Fraud Detection' },
    { to: '/admin/analytics', icon: <MdAnalytics />, label: 'Analytics' },
    { to: '/admin/distress', icon: <MdWarning />, label: 'Distress Index' },
    { to: '/admin/sla', icon: <MdTimer />, label: 'SLA Tracker' },
    { to: '/admin/preseva', icon: <MdShield />, label: 'PRESEVA AI' },
    { to: '/admin/escrow', icon: <MdAccountBalanceWallet />, label: 'NYAYKOSH Ledger' },
    { to: '/admin/audits', icon: <MdSecurity />, label: 'Ghost Audits' }
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                        <div className="sidebar-logo">
                            <div className="logo-icon">
                                <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="20" fill="rgba(255,107,44,0.15)" />
                                    <circle cx="20" cy="20" r="12" stroke="#FF6B2C" strokeWidth="2" fill="none" />
                                    <circle cx="20" cy="20" r="3" fill="#FF6B2C" />
                                    {/* Chakra spokes */}
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
                        </div>
                    )}
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={!sidebarOpen ? { background: 'transparent', border: 'none', color: 'var(--text-white)' } : {}}>
                        <MdMenu style={!sidebarOpen ? { fontSize: '1.6rem' } : {}} />
                    </button>
                </div>

                <div className="sidebar-badge">
                    <MdAdminPanelSettings />
                    <span>Admin Portal</span>
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
                            <span className="admin-name">{user?.name || 'Admin'}</span>
                            <span className="admin-role">{user?.role || 'Super Admin'}</span>
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
                    <div className="topbar-title">{PROJECT_NAME} — Integrated Citizen Intelligence Platform</div>
                    <div className="topbar-right">
                        <LanguagePill />
                        <div className="topbar-status">
                            <span className="status-dot" />
                            <span>Live</span>
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
