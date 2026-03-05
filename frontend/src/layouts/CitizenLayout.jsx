import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguagePill, useLanguage } from '../context/LanguageContext';
import {
    MdDashboard, MdSchool, MdEdit, MdTrackChanges,
    MdChat, MdPerson, MdLogout, MdMenu, MdClose, MdChevronRight,
    MdMap, MdPeople, MdNewspaper, MdBarChart, MdAssignment
} from 'react-icons/md';
import { PROJECT_NAME } from '../config/constants';
import './CitizenLayout.css';

export default function CitizenLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { to: '/citizen', icon: <MdDashboard />, label: t('dashboard'), end: true },
        { to: '/citizen/schemes', icon: <MdSchool />, label: t('schemes') },
        { to: '/citizen/schemes/applications', icon: <MdAssignment />, label: t('myApplications') },
        { to: '/citizen/file-grievance', icon: <MdEdit />, label: t('fileGrievance') },
        { to: '/citizen/track', icon: <MdTrackChanges />, label: t('trackGrievance') },
        { to: '/citizen/roadmap', icon: <MdMap />, label: t('roadmap'), badge: 'AI' },
        { to: '/citizen/chatbot', icon: <MdChat />, label: t('assistant') },
        { to: '/citizen/engagement', icon: <MdBarChart />, label: 'CI Score' },
        { to: '/citizen/community', icon: <MdPeople />, label: t('community') },
        { to: '/citizen/news', icon: <MdNewspaper />, label: t('news') },
        { to: '/citizen/profile', icon: <MdPerson />, label: t('profile') },
    ];

    return (
        <div className="citizen-shell">
            {/* Top Nav Bar */}
            <header className="citizen-header">
                <Link to="/" className="citizen-logo" style={{ textDecoration: 'none' }}>
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="20" fill="rgba(255,107,44,0.15)" />
                        <circle cx="20" cy="20" r="12" stroke="#FF6B2C" strokeWidth="2" fill="none" />
                        <circle cx="20" cy="20" r="3" fill="#FF6B2C" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <line key={i} x1="20" y1="9" x2="20" y2="13" stroke="#FF6B2C" strokeWidth="1.5"
                                transform={`rotate(${i * 45} 20 20)`} strokeLinecap="round" />
                        ))}
                    </svg>
                    <span className="citizen-logo-text">{PROJECT_NAME}</span>
                </Link>

                <nav className="citizen-nav-desktop">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to} to={item.to} end={item.end}
                            className={({ isActive }) => `citizen-nav-item ${isActive ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            {item.icon} {item.label}
                            {item.badge && <span style={{ fontSize: '0.78rem', fontWeight: 800, background: 'rgba(0,200,150,0.25)', color: 'var(--teal)', padding: '1px 4px', borderRadius: 4, marginLeft: 4 }}>{item.badge}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="citizen-header-right">
                    <LanguagePill />
                    <div className="citizen-user-badge">
                        <div className="citizen-avatar">{user?.name?.[0] || 'C'}</div>
                        <span className="citizen-name-text">{user?.name?.split(' ')[0] || 'Citizen'}</span>
                    </div>
                    <button className="logout-btn-header" onClick={handleLogout}><MdLogout /></button>
                    <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <MdClose /> : <MdMenu />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Drawer */}
            {mobileOpen && (
                <div className="mobile-drawer" onClick={() => setMobileOpen(false)}>
                    <div className="mobile-nav" onClick={e => e.stopPropagation()}>
                        {navItems.map(item => (
                            <NavLink
                                key={item.to} to={item.to} end={item.end}
                                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.icon} {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Main */}
            <main className="citizen-main">
                <Outlet />
            </main>
        </div>
    );
}
