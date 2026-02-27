import React, { useState, useEffect } from 'react';
import { MdNotifications, MdMarkEmailRead, MdWarning, MdCheckCircle, MdInfo, MdSecurity, MdArrowUpward, MdFilterList } from 'react-icons/md';
import { apiGetNotifications, apiMarkNotificationRead } from '../../services/api.service';

const TYPE_CONFIG = {
    resolution: { icon: <MdCheckCircle />, color: '#00C896', bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.25)', label: 'Resolved' },
    critical: { icon: <MdWarning />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Critical' },
    escalation: { icon: <MdArrowUpward />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Escalation' },
    duplicate: { icon: <MdInfo />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', label: 'Duplicate' },
    new_scheme: { icon: <MdInfo />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', label: 'Scheme' },
    fraud: { icon: <MdSecurity />, color: '#EC4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', label: 'Fraud' },
};

export default function NotificationsPanel() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        apiGetNotifications().then(res => {
            setNotifications(res.data);
            setLoading(false);
        });
    }, []);

    const markRead = async (id) => {
        await apiMarkNotificationRead(id);
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

    const filtered = filter === 'all' ? notifications
        : filter === 'unread' ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.type === filter);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title">
                        <MdNotifications className="icon" /> Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                background: '#EF4444', color: 'white', borderRadius: '50px',
                                padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700, marginLeft: 8
                            }}>{unreadCount}</span>
                        )}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        {unreadCount} unread · {notifications.length} total
                    </p>
                </div>
                <button className="btn-secondary" onClick={markAllRead} style={{ fontSize: '0.82rem' }}>
                    <MdMarkEmailRead /> Mark All Read
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: `Unread (${unreadCount})` },
                    { key: 'critical', label: '🔴 Critical' },
                    { key: 'resolution', label: '✅ Resolved' },
                    { key: 'escalation', label: '⬆️ Escalated' },
                    { key: 'fraud', label: '🔒 Fraud' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                        padding: '7px 14px', borderRadius: 8, border: '1px solid',
                        borderColor: filter === tab.key ? 'var(--saffron)' : 'var(--border)',
                        background: filter === tab.key ? 'rgba(255,107,44,0.12)' : 'transparent',
                        color: filter === tab.key ? 'var(--saffron)' : 'var(--text-secondary)',
                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                    const count = notifications.filter(n => n.type === type).length;
                    return (
                        <div key={type} style={{
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10
                        }}>
                            <span style={{ color: cfg.color, fontSize: '1.2rem' }}>{cfg.icon}</span>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: cfg.color, fontFamily: 'Space Grotesk' }}>{count}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cfg.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Notification List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>Loading notifications...</div>
                ) : filtered.map((notif, i) => {
                    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.resolution;
                    return (
                        <div key={notif.id} style={{
                            background: notif.read ? 'rgba(255,255,255,0.02)' : cfg.bg,
                            border: `1px solid ${notif.read ? 'rgba(255, 255, 255, 0.12)' : cfg.border}`,
                            borderRadius: 'var(--radius)', padding: '16px 20px',
                            display: 'flex', alignItems: 'flex-start', gap: 14,
                            animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
                            opacity: notif.read ? 0.75 : 1,
                            transition: 'all 0.2s'
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: cfg.bg, border: `1px solid ${cfg.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: cfg.color, fontSize: '1.2rem', flexShrink: 0
                            }}>{cfg.icon}</div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <h4 style={{ fontSize: '0.88rem', color: 'var(--text-white)', fontWeight: 700 }}>{notif.title}</h4>
                                    <span style={{
                                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                                        padding: '2px 8px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700
                                    }}>{cfg.label}</span>
                                    {!notif.read && (
                                        <span style={{ background: '#3B82F6', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700 }}>NEW</span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                                    {notif.citizen && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {notif.citizen}</span>}
                                </div>
                            </div>

                            {!notif.read && (
                                <button onClick={() => markRead(notif.id)} style={{
                                    background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
                                    borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer',
                                    flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap'
                                }}>Mark Read</button>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        No notifications for this filter
                    </div>
                )}
            </div>
        </div>
    );
}
