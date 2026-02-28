import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdDashboard, MdSchool, MdEdit, MdTrackChanges, MdChat, MdArrowForward, MdCheckCircle, MdHourglassEmpty, MdWarning } from 'react-icons/md';
import { apiGetMyGrievances, apiGetMatchedSchemes } from '../../services/api.service';

const STATUS_ICONS = { Pending: <MdHourglassEmpty />, Resolved: <MdCheckCircle />, Critical: <MdWarning />, 'In Progress': <MdEdit /> };
const STATUS_COLORS = { Pending: '#F59E0B', Resolved: '#00C896', Critical: '#EF4444', 'In Progress': '#3B82F6' };

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            apiGetMyGrievances(user?.id),
            apiGetMatchedSchemes({ age: user?.age, income: user?.income, state: user?.state })
        ]).then(([g, s]) => {
            setGrievances(g && Array.isArray(g.data) ? g.data : []);
            setSchemes(s && Array.isArray(s.data) ? s.data.slice(0, 4) : []);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            setGrievances([]);
            setSchemes([]);
        });
    }, [user?.id, user?.age, user?.income, user?.state]);

    const quickActions = [
        { to: '/citizen/file-grievance', icon: <MdEdit />, label: 'File Grievance', color: '#FF6B2C', desc: 'Raise a new complaint' },
        { to: '/citizen/schemes', icon: <MdSchool />, label: 'Browse Schemes', color: '#00C896', desc: 'Discover benefits' },
        { to: '/citizen/track', icon: <MdTrackChanges />, label: 'Track Status', color: '#3B82F6', desc: 'Check your cases' },
        { to: '/citizen/chatbot', icon: <MdChat />, label: 'AI Assistant', color: '#8B5CF6', desc: 'Ask anything' },
    ];

    const stats = [
        { label: 'Total Filed', value: (grievances || []).length, color: '#3B82F6' },
        { label: 'Resolved', value: (grievances || []).filter(g => g.status === 'Resolved').length, color: '#00C896' },
        { label: 'Pending', value: (grievances || []).filter(g => g.status === 'Pending').length, color: '#F59E0B' },
        { label: 'Matched Schemes', value: (schemes || []).length, color: '#8B5CF6' },
    ];

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Welcome */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,107,44,0.1) 0%, rgba(0,200,150,0.06) 100%)',
                border: '1px solid rgba(255,107,44,0.2)', borderRadius: 'var(--radius-lg)', padding: '24px 28px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--saffron), var(--teal))' }} />
                <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>
                    Namaste, <span style={{ color: 'var(--saffron)' }}>{user?.name?.split(' ')[0] || 'Citizen'}</span> 🙏
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Your personal dashboard — manage grievances, discover schemes, and stay updated.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {user?.state && <span className="badge badge-inprogress">📍 {user.state}</span>}
                    {user?.age && <span className="badge badge-pending">🎂 Age {user.age}</span>}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                {stats.map(stat => (
                    <div key={stat.label} className="metric-card" style={{ '--accent-color': stat.color, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 style={{ fontSize: '1.1rem', marginBottom: 14, fontWeight: 700 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                    {quickActions.map(action => (
                        <Link key={action.to} to={action.to} style={{
                            background: `${action.color}10`,
                            border: `1px solid ${action.color}30`,
                            borderRadius: 'var(--radius)', padding: '18px 20px',
                            display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none',
                            transition: 'var(--transition)'
                        }}
                            className="glass-card">
                            <span style={{ fontSize: '1.4rem', color: action.color }}>{action.icon}</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-white)' }}>{action.label}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{action.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* My Grievances */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Grievances</h2>
                    <Link to="/citizen/track" style={{ fontSize: '0.82rem', color: 'var(--saffron)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View All <MdArrowForward />
                    </Link>
                </div>
                {loading ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(grievances || []).slice(0, 4).map(g => (
                            <Link
                                key={g.id}
                                to={`/citizen/track?id=${g.id}`}
                                className="glass-card"
                                style={{
                                    padding: '14px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    flexWrap: 'wrap',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'var(--transition)',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ color: STATUS_COLORS[g.status] || '#F59E0B', fontSize: '1.2rem' }}>
                                    {STATUS_ICONS[g.status] || <MdHourglassEmpty />}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.title}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{g.id} · {g.createdAt}</p>
                                </div>
                                <span className={`badge badge-${g.status === 'Resolved' ? 'resolved' : g.status === 'Critical' ? 'critical' : g.status === 'In Progress' ? 'inprogress' : 'pending'}`}>
                                    {g.status}
                                </span>
                            </Link>
                        ))}
                        {(grievances || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No grievances filed yet. <Link to="/citizen/file-grievance" style={{ color: 'var(--saffron)' }}>File your first →</Link></p>}
                    </div>
                )}
            </div>

            {/* Matched Schemes */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🤖 AI-Matched Schemes for You</h2>
                    <Link to="/citizen/schemes" style={{ fontSize: '0.82rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Explore All <MdArrowForward />
                    </Link>
                </div>
                {loading ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Analyzing your profile...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                        {(schemes || []).map(rawS => {
                            const s = {
                                ...rawS,
                                benefit: rawS.benefit || rawS.benefits || 'See details',
                                category: rawS.category || 'General'
                            };
                            return (
                            <div key={s.id} className="glass-card" style={{ padding: '16px 18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <span style={{ fontSize: '0.78rem', background: 'rgba(0,200,150,0.1)', color: 'var(--teal)', border: '1px solid rgba(0,200,150,0.2)', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>{s.category}</span>
                                    <span className="badge badge-resolved">✓ Eligible</span>
                                </div>
                                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{s.name}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>{s.benefit}</p>
                            </div>
                        );})}
                    </div>
                )}
            </div>
        </div>
    );
}
