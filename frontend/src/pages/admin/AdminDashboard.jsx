import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import {
    MdDashboard, MdTrendingUp, MdWarning, MdCheckCircle,
    MdHourglassEmpty, MdBolt, MdArrowUpward, MdArrowDownward,
    MdRefresh, MdNotificationsActive, MdListAlt
} from 'react-icons/md';
import {
    apiGetDashboardStats, apiGetActivityFeed,
    apiGetMonthlyTrend, apiGetCategoryBreakdown
} from '../../services/api.service';
import './AdminDashboard.css';

const KPICard = ({ label, value, sub, icon, color, trend, trendUp }) => (
    <div className="kpi-card" style={{ '--accent': color }}>
        <div className="kpi-top">
            <div className="kpi-icon" style={{ background: `${color}20`, color }}>
                {icon}
            </div>
            {trend && (
                <div className={`kpi-trend ${trendUp ? 'up' : 'down'}`}>
                    {trendUp ? <MdArrowUpward /> : <MdArrowDownward />}
                    {trend}
                </div>
            )}
        </div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
    </div>
);

const ActivityItem = ({ item }) => {
    const colors = {
        new: '#FF6B2C', resolved: '#00C896', escalated: '#EF4444',
        assigned: '#3B82F6', default: '#F59E0B'
    };
    return (
        <div className="activity-item">
            <div className="activity-dot" style={{ background: colors[item.type] || colors.default }} />
            <div className="activity-content">
                <p className="activity-message">{item.message}</p>
                <span className="activity-time">{item.time}</span>
            </div>
            <span className="activity-state">{item.state}</span>
        </div>
    );
};

const CUSTOM_COLORS = ['#FF6B2C', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name}: <strong>{p.value.toLocaleString()}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [feed, setFeed] = useState([]);
    const [trend, setTrend] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [s, f, t, c] = await Promise.all([
                apiGetDashboardStats(), apiGetActivityFeed(),
                apiGetMonthlyTrend(), apiGetCategoryBreakdown()
            ]);
            setStats(s.data);
            setFeed(f.data);
            setTrend(t.data);
            setCategories(c.data);
            setLoading(false);
        };
        load();
    }, []);

    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const dashboard = document.querySelector('.admin-dashboard');
        if (!dashboard) return;

        let timeout;
        const observer = new ResizeObserver(() => {
            setIsResizing(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setIsResizing(false);
            }, 300); // Wait 300ms after the last resize event to redraw
        });

        observer.observe(dashboard);
        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, []);

    if (loading) return (
        <div className="dash-loading">
            <div className="spinner" /><span>Loading intelligence data...</span>
        </div>
    );

    const resolutionPct = stats.totalGrievances > 0
        ? Math.round((stats.resolved / stats.totalGrievances) * 100)
        : 0;

    return (
        <div className="admin-dashboard page-wrapper">
            {/* Page Header */}
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">
                        <MdDashboard className="icon" /> Platform Overview
                    </h1>
                    <p className="dash-subtitle">Real-time intelligence across all 28 states & UTs</p>
                </div>
                <div className="dash-header-right">
                    <div className="platform-health">
                        <span className="health-dot" />
                        All systems operational
                    </div>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            {/* Impact Banner */}
            <div className="impact-banner">
                <div className="impact-item">
                    <span className="impact-number">1.4B</span>
                    <span className="impact-label">Citizens Served</span>
                </div>
                <div className="impact-divider" />
                <div className="impact-item">
                    <span className="impact-number">{stats.schemesAvailable}+</span>
                    <span className="impact-label">Active Schemes</span>
                </div>
                <div className="impact-divider" />
                <div className="impact-item">
                    <span className="impact-number">{stats.statesCovered}</span>
                    <span className="impact-label">States & UTs</span>
                </div>
                <div className="impact-divider" />
                <div className="impact-item">
                    <span className="impact-number">{stats.languagesSupported}</span>
                    <span className="impact-label">Languages</span>
                </div>
                <div className="impact-divider" />
                <div className="impact-item">
                    <span className="impact-number" style={{ color: '#00C896' }}>{resolutionPct}%</span>
                    <span className="impact-label">Resolution Rate</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid stagger">
                <KPICard
                    label="Total Grievances" value={stats.totalGrievances.toLocaleString()}
                    sub={`+${stats.todayFiled} today`} icon={<MdListAlt style={{ fontSize: '1.4rem' }} />}
                    color="#3B82F6" trend="12.4%" trendUp={true}
                />
                <KPICard
                    label="Resolved" value={stats.resolved.toLocaleString()}
                    sub={`+${stats.todayResolved} today`} icon={<MdCheckCircle style={{ fontSize: '1.4rem' }} />}
                    color="#00C896" trend="8.2%" trendUp={true}
                />
                <KPICard
                    label="Pending" value={stats.pending.toLocaleString()}
                    sub="Awaiting action" icon={<MdHourglassEmpty style={{ fontSize: '1.4rem' }} />}
                    color="#F59E0B" trend="3.1%" trendUp={false}
                />
                <KPICard
                    label="Critical / High Distress" value={stats.critical.toLocaleString()}
                    sub="AI-flagged urgent" icon={<MdWarning style={{ fontSize: '1.4rem' }} />}
                    color="#EF4444" trend="5.7%" trendUp={true}
                />
                <KPICard
                    label="In Progress" value={stats.inProgress.toLocaleString()}
                    sub="By officer" icon={<MdBolt style={{ fontSize: '1.4rem' }} />}
                    color="#8B5CF6" trend="2.3%" trendUp={true}
                />
                <KPICard
                    label="Avg Response Time" value={stats.avgResponseTime}
                    sub="Target: 3 days" icon={<MdTrendingUp style={{ fontSize: '1.4rem' }} />}
                    color="#FF6B2C" trend="0.4d" trendUp={false}
                />
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Monthly Trend */}
                <div className="chart-box chart-large">
                    <div className="chart-header">
                        <h3>Monthly Grievance Trend</h3>
                        <span className="chart-sub">Filed vs Resolved (last 7 months)</span>
                    </div>
                    <div style={{ height: 220, position: 'relative', width: '100%' }}>
                        {isResizing ? (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, opacity: 0.3 }} />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradFiled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00C896" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.10)" />
                                    <XAxis dataKey="month" tick={{ fill: '#B8C5D6', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#B8C5D6', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#B8C5D6', fontSize: 12 }} />
                                    <Area type="monotone" dataKey="filed" name="Filed" stroke="#3B82F6" strokeWidth={2} fill="url(#gradFiled)" />
                                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#00C896" strokeWidth={2} fill="url(#gradResolved)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Category Pie */}
                <div className="chart-box chart-small">
                    <div className="chart-header">
                        <h3>By Category</h3>
                        <span className="chart-sub">Volume breakdown</span>
                    </div>
                    <div style={{ height: 160, position: 'relative', width: '100%' }}>
                        {isResizing ? (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, opacity: 0.3 }} />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categories} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                        dataKey="count" nameKey="category" paddingAngle={3}>
                                        {categories.map((entry, index) => (
                                            <Cell key={index} fill={CUSTOM_COLORS[index % CUSTOM_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="pie-legend">
                        {categories.slice(0, 4).map((c, i) => (
                            <div key={i} className="pie-legend-item">
                                <span className="pie-dot" style={{ background: CUSTOM_COLORS[i] }} />
                                <span>{c.category}</span>
                                <span className="pie-count">{c.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Live Feed + Resolution Ring */}
            <div className="dash-bottom-row">
                {/* Live Activity Feed */}
                <div className="live-feed-box">
                    <div className="chart-header">
                        <h3>
                            <MdNotificationsActive style={{ color: '#FF6B2C', marginRight: 8, verticalAlign: 'middle' }} />
                            Live Activity Feed
                        </h3>
                        <span className="live-badge">● LIVE</span>
                    </div>
                    <div className="activity-list">
                        {feed.map(item => <ActivityItem key={item.id} item={item} />)}
                    </div>
                </div>

                {/* Resolution Progress */}
                <div className="resolution-box">
                    <div className="chart-header">
                        <h3>Resolution Overview</h3>
                    </div>
                    <div className="resolution-ring-wrap">
                        <svg viewBox="0 0 120 120" className="resolution-ring">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="10" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#00C896" strokeWidth="10"
                                strokeDasharray={`${resolutionPct * 3.14} 314`}
                                strokeLinecap="round"
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dasharray 1s ease' }}
                            />
                        </svg>
                        <div className="ring-center">
                            <span className="ring-pct">{resolutionPct}%</span>
                            <span className="ring-label">Resolved</span>
                        </div>
                    </div>

                    <div className="resolution-stats">
                        <div className="res-stat">
                            <div className="res-dot" style={{ background: '#00C896' }} />
                            <span>Resolved</span>
                            <strong>{stats.resolved.toLocaleString()}</strong>
                        </div>
                        <div className="res-stat">
                            <div className="res-dot" style={{ background: '#F59E0B' }} />
                            <span>Pending</span>
                            <strong>{stats.pending.toLocaleString()}</strong>
                        </div>
                        <div className="res-stat">
                            <div className="res-dot" style={{ background: '#EF4444' }} />
                            <span>Critical</span>
                            <strong>{stats.critical.toLocaleString()}</strong>
                        </div>
                        <div className="res-stat">
                            <div className="res-dot" style={{ background: '#8B5CF6' }} />
                            <span>In Progress</span>
                            <strong>{stats.inProgress.toLocaleString()}</strong>
                        </div>
                    </div>

                    {/* Top States */}
                    <div className="top-states">
                        <h4>Top States by Volume</h4>
                        {[
                            { state: 'Uttar Pradesh', count: 2847, pct: 85 },
                            { state: 'Maharashtra', count: 2134, pct: 64 },
                            { state: 'Bihar', count: 1923, pct: 57 },
                            { state: 'West Bengal', count: 1654, pct: 49 },
                        ].map(s => (
                            <div key={s.state} className="state-bar-item">
                                <span className="state-name">{s.state}</span>
                                <div className="state-bar-track">
                                    <div className="state-bar-fill" style={{ width: `${s.pct}%` }} />
                                </div>
                                <span className="state-count">{s.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
