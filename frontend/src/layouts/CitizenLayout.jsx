import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    MdDashboard, MdSchool, MdEdit, MdTrackChanges,
    MdChat, MdPerson, MdLogout, MdMenu, MdClose, MdChevronRight,
    MdMap, MdPeople, MdNewspaper
} from 'react-icons/md';
import './CitizenLayout.css';

const navItems = [
    { to: '/citizen', icon: <MdDashboard />, label: 'My Dashboard', end: true },
    { to: '/citizen/schemes', icon: <MdSchool />, label: 'Explore Schemes' },
    { to: '/citizen/file-grievance', icon: <MdEdit />, label: 'File Grievance' },
    { to: '/citizen/track', icon: <MdTrackChanges />, label: 'Track Grievance' },
    { to: '/citizen/roadmap', icon: <MdMap />, label: 'Benefit Roadmap', badge: 'AI' },
    { to: '/citizen/chatbot', icon: <MdChat />, label: 'AI Assistant' },
    { to: '/citizen/community', icon: <MdPeople />, label: 'Community' },
    { to: '/citizen/news', icon: <MdNewspaper />, label: 'Seva News' },
    { to: '/citizen/profile', icon: <MdPerson />, label: 'My Profile' },
];

export default function CitizenLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="citizen-shell">
            {/* Top Nav Bar */}
            <header className="citizen-header">
                <div className="citizen-logo">
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="20" fill="rgba(255,107,44,0.15)" />
                        <circle cx="20" cy="20" r="12" stroke="#FF6B2C" strokeWidth="2" fill="none" />
                        <circle cx="20" cy="20" r="3" fill="#FF6B2C" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <line key={i} x1="20" y1="9" x2="20" y2="13" stroke="#FF6B2C" strokeWidth="1.5"
                                transform={`rotate(${i * 45} 20 20)`} strokeLinecap="round" />
                        ))}
                    </svg>
                    <span className="citizen-logo-text">Project<span>-77</span></span>
                </div>

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
