import React, { useState, useEffect } from 'react';
import { MdShield, MdCheckCircle, MdClose, MdPeople, MdFlightTakeoff, MdPlayArrow, MdRefresh } from 'react-icons/md';
import { apiGetPreSevaAlerts, apiGetPreSevaStats, apiMarkPrevented, apiPresevAssignAlert, apiFetch } from '../../services/api.service';

const MOCK_MISSIONS = [
    { id: 'M-001', title: 'Water Supply Failure', state: 'Bihar', district: 'Muzaffarpur', urgency: 'critical', timeLeft: 41, confidence: 91, citizensAtRisk: 24000, officersDeployed: 0, budgetAllocated: 0, status: 'pending', dept: 'Jal Shakti Ministry', icon: '💧' },
    { id: 'M-002', title: 'PHC Staffing Crisis', state: 'Jharkhand', district: 'Palamu', urgency: 'critical', timeLeft: 68, confidence: 78, citizensAtRisk: 18500, officersDeployed: 3, budgetAllocated: 120000, status: 'dispatched', dept: 'Health Department', icon: '🏥' },
    { id: 'M-003', title: 'Road Collapse Risk — NH-27', state: 'Uttar Pradesh', district: 'Varanasi', urgency: 'high', timeLeft: 96, confidence: 84, citizensAtRisk: 8200, officersDeployed: 2, budgetAllocated: 85000, status: 'dispatched', dept: 'PWD', icon: '🛣️' },
    { id: 'M-004', title: 'Grid Overload — Industrial Zone', state: 'Gujarat', district: 'Surat', urgency: 'high', timeLeft: 120, confidence: 72, citizensAtRisk: 35000, officersDeployed: 0, budgetAllocated: 0, status: 'pending', dept: 'DISCOMS', icon: '⚡' },
    { id: 'M-005', title: 'Flood Risk — Brahmaputra', state: 'Assam', district: 'Dibrugarh', urgency: 'medium', timeLeft: 144, confidence: 65, citizensAtRisk: 12000, officersDeployed: 5, budgetAllocated: 250000, status: 'resolved', dept: 'Disaster Management', icon: '🌊' },
];

function CountdownTimer({ hours }) {
    const h = Math.max(0, Math.floor(hours));
    const urgent = h < 48;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800, color: urgent ? '#EF4444' : '#F59E0B' }}>
            {urgent && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />}
            {String(h).padStart(2, '0')}h left
        </div>
    );
}

function MissionCard({ mission, onDispatch, onResolve }) {
    const urgConf = { critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)' }, high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' }, medium: { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)' } }[mission.urgency];
    const statusConfig = { pending: { label: 'AWAITING DISPATCH', color: '#F59E0B' }, dispatched: { label: 'RESOURCES DEPLOYED', color: '#3B82F6' }, resolved: { label: 'THREAT NEUTRALISED', color: '#00C896' } }[mission.status];
    return (
        <div style={{ background: urgConf.bg, border: `1px solid ${urgConf.border}`, borderLeft: `4px solid ${urgConf.color}`, borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${urgConf.color}18`, border: `1px solid ${urgConf.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{mission.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 3 }}>{mission.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5 }}>{mission.district}, {mission.state} · {mission.dept}</div>
                    <CountdownTimer hours={mission.timeLeft} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[{ l: 'Confidence', v: `${mission.confidence}%`, c: urgConf.color }, { l: 'Citizens at Risk', v: mission.citizensAtRisk.toLocaleString(), c: '#A78BFA' }, { l: 'Officers', v: mission.officersDeployed || '—', c: mission.officersDeployed ? '#00C896' : 'var(--text-muted)' }].map(d => (
                    <div key={d.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: d.c }}>{d.v}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.l}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: statusConfig.color, background: `${statusConfig.color}18`, border: `1px solid ${statusConfig.color}40`, borderRadius: 20, padding: '3px 10px' }}>{statusConfig.label}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    {mission.status !== 'resolved' && <button onClick={() => onDispatch(mission)} style={{ background: urgConf.color, color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><MdFlightTakeoff style={{ fontSize: '0.9rem' }} />{mission.status === 'dispatched' ? 'Update' : 'Dispatch'}</button>}
                    {mission.status === 'dispatched' && <button onClick={() => onResolve(mission.id)} style={{ background: 'rgba(0,200,150,0.15)', color: '#00C896', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 8, padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>✓ Resolved</button>}
                </div>
            </div>
        </div>
    );
}

const URGENCY = {
    critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: '🔴 CRITICAL' },
    high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: '🟠 HIGH' },
    medium: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', label: '🔵 MEDIUM' },
};

const STATUS_BADGE = {
    'Department Notified': { cls: 'badge-inprogress', icon: '📡' },
    'Action Taken': { cls: 'badge-resolved', icon: '✅' },
    'Under Review': { cls: 'badge-pending', icon: '🔍' },
};

export default function PreSeva() {
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [allocateModal, setAllocateModal] = useState(null);
    const [allocateForm, setAllocateForm] = useState({ officers: '2', budget: '50000', note: '' });
    const [allocating, setAllocating] = useState(false);
    const [allocated, setAllocated] = useState({});
    const [activeTab, setActiveTab] = useState('predictions');
    const [missions, setMissions] = useState(MOCK_MISSIONS);
    const [dispatchModal, setDispatchModal] = useState(null);
    const [dispatchForm, setDispatchForm] = useState({ officers: 3, budget: 100000, eta: '24', note: '' });
    const [dispatching, setDispatching] = useState(false);
    const [mcFilter, setMcFilter] = useState('all');
    const [runLoading, setRunLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [sagePredictions, setSagePredictions] = useState([]);
    const [sageMakerActive, setSageMakerActive] = useState(false);
    const [smModelType, setSmModelType] = useState('');
    const [smAccuracy, setSmAccuracy] = useState('');

    const loadData = () => {
        Promise.all([apiGetPreSevaAlerts(), apiGetPreSevaStats()]).then(([a, s]) => {
            setAlerts(a.data || []);
            setStats(s.data || null);
            setLoading(false);
        });
        // Load live SageMaker predictions
        apiFetch('/preseva/predictions').then(res => {
            if (res.success && Array.isArray(res.data)) {
                setSagePredictions(res.data);
                const isSM = res.poweredBy === 'Amazon SageMaker';
                setSageMakerActive(isSM);
                if (res.data[0]) {
                    setSmModelType(res.data[0].modelType || '');
                    setSmAccuracy(res.data[0].accuracy || '');
                }
            }
        }).catch(() => { });
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const runPreSeva = async () => {
        setRunLoading(true);
        setRunResult(null);
        try {
            const res = await apiFetch('/preseva/run');
            setRunResult({ success: true, message: res.message || `PreSeva Complete — ${res.data?.alertsGenerated || 0} alerts generated` });
            loadData();
        } catch (err) {
            setRunResult({ success: false, message: 'PreSeva analysis failed: ' + (err.message || 'Unknown error') });
        } finally {
            setRunLoading(false);
        }
    };

    const markPrevented = async (id) => {
        await apiMarkPrevented(id);
        setAlerts(as => as.map(a => a.id === id ? { ...a, prevented: true, status: 'Action Taken' } : a));
        setStats(prev => prev ? { ...prev, prevented: (prev.prevented || 0) + 1, activePredictions: Math.max(0, (prev.activePredictions || 0) - 1) } : prev);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ marginRight: 12 }} /> Running prediction models...
        </div>
    );

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title"><MdShield className="icon" style={{ color: '#8B5CF6' }} /> PRESEVA — Predictive Governance Intelligence</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                        The world's first proactive public service failure prediction system. We solve problems before citizens experience them.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* ⚡ Run PreSeva Analysis Button */}
                    <button id="preseva-run-btn" onClick={runPreSeva} disabled={runLoading} style={{
                        background: runLoading ? 'rgba(255,107,44,0.4)' : 'linear-gradient(135deg, #FF6B2C, #FF8C5A)',
                        color: 'white', border: 'none', borderRadius: 10,
                        padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700,
                        cursor: runLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 15px rgba(255,107,44,0.3)',
                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}>
                        {runLoading
                            ? <><MdRefresh style={{ animation: 'spin 1s linear infinite' }} /> Analyzing patterns...</>
                            : <><MdPlayArrow /> ⚡ Run PreSeva Analysis</>}
                    </button>
                    <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '8px 16px', fontSize: '0.8rem', color: '#A78BFA', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        🤖 AI MODEL ACTIVE
                    </div>
                </div>
            </div>

            {/* Run Result Toast */}
            {runResult && (
                <div style={{
                    background: runResult.success ? 'rgba(0,200,150,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${runResult.success ? 'rgba(0,200,150,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 10, padding: '12px 18px',
                    display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeInUp 0.3s ease'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>{runResult.success ? '✅' : '❌'}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: runResult.success ? '#00C896' : '#EF4444', flex: 1 }}>
                        {runResult.message}
                    </span>
                    <button onClick={() => setRunResult(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}><MdClose /></button>
                </div>
            )}

            {/* Mission Statement Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #8B5CF6, #3B82F6, #00C896)' }} />
                <h3 style={{ fontSize: '1rem', color: '#A78BFA', marginBottom: 8 }}>The PreSeva Difference</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 700 }}>
                    Every government platform in the world is <strong style={{ color: 'white' }}>reactive</strong> — citizens suffer, then file, then wait. PreSeva is the global first:
                    our AI mines patterns across millions of historical grievances to <strong style={{ color: '#A78BFA' }}>predict failures 48–72 hours before they happen</strong>.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    {[
                        { val: stats?.prevented, label: 'Problems Prevented', color: '#00C896' },
                        { val: (stats?.totalGrievancesAvoided || 0).toLocaleString(), label: 'Complaints Avoided', color: '#A78BFA' },
                        { val: `${stats?.topPredictionAccuracy}%`, label: 'Peak Accuracy', color: 'var(--saffron)' },
                        { val: stats?.citySaved, label: 'Public Funds Saved', color: '#00C896' },
                    ].map(s => (
                        <div key={s.label} style={{ background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SageMaker Active Banner */}
            {sageMakerActive && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))',
                    border: '1px solid rgba(245,158,11,0.35)', borderLeft: '4px solid #F59E0B',
                    borderRadius: 10, padding: '12px 18px', animation: 'fadeInUp 0.4s ease'
                }}>
                    <span style={{ fontSize: '1.3rem' }}>⚡</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: '#F59E0B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Amazon SageMaker Active
                        </div>
                        <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {smModelType || 'Random Forest Classifier'} &nbsp;·&nbsp; {smAccuracy || '95%'} Accuracy
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, padding: '3px 10px' }}>LIVE</span>
                    </div>
                </div>
            )}

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
                {[{ key: 'predictions', icon: '🎯', label: 'AI Predictions' }, { key: 'missionControl', icon: '🚀', label: 'Mission Control' }].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: activeTab === t.key ? 'rgba(139,92,246,0.2)' : 'transparent', color: activeTab === t.key ? '#A78BFA' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                        {t.icon} {t.label}
                        {t.key === 'missionControl' && missions.filter(m => m.status === 'pending').length > 0 && (
                            <span style={{ background: '#EF4444', color: 'white', borderRadius: 10, fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{missions.filter(m => m.status === 'pending').length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── MISSION CONTROL TAB ── */}
            {activeTab === 'missionControl' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                        {[
                            { label: 'Pending Dispatch', val: missions.filter(m => m.status === 'pending').length, color: '#EF4444', icon: '🔴' },
                            { label: 'Resources Deployed', val: missions.filter(m => m.status === 'dispatched').length, color: '#3B82F6', icon: '🚁' },
                            { label: 'Threats Neutralised', val: missions.filter(m => m.status === 'resolved').length, color: '#00C896', icon: '✅' },
                            { label: 'Total Officers Out', val: missions.reduce((a, m) => a + (m.officersDeployed || 0), 0), color: '#A78BFA', icon: '👮' },
                            { label: 'Budget Deployed', val: `₹${(missions.reduce((a, m) => a + (m.budgetAllocated || 0), 0) / 100000).toFixed(1)}L`, color: '#F59E0B', icon: '💰' },
                        ].map(s => (
                            <div key={s.label} className="metric-card" style={{ '--accent-color': s.color, textAlign: 'center', padding: '16px 12px' }}>
                                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['all', 'pending', 'dispatched', 'resolved'].map(f => (
                            <button key={f} onClick={() => setMcFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid', borderColor: mcFilter === f ? '#8B5CF6' : 'var(--border)', background: mcFilter === f ? 'rgba(139,92,246,0.15)' : 'transparent', color: mcFilter === f ? '#A78BFA' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize' }}>{f === 'all' ? 'All Missions' : f}</button>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                        {missions.filter(m => mcFilter === 'all' || m.status === mcFilter).map(mission => {
                            // Merge with SageMaker data if available
                            const smPred = sagePredictions.find(p => p.state === mission.state && p.category?.includes(mission.icon === '💧' ? 'Water' : mission.icon === '🏥' ? 'Health' : ''));
                            const smMission = smPred ? {
                                ...mission,
                                confidence: Math.round(smPred.probability * 100),
                                citizensAtRisk: smPred.citizensAtRisk || mission.citizensAtRisk
                            } : mission;
                            return (
                                <div key={smMission.id} style={{ position: 'relative' }}>
                                    {sageMakerActive && (
                                        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, fontSize: '0.6rem', fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 4, padding: '2px 6px' }}>⚡ AMAZON SAGEMAKER</div>
                                    )}
                                    <MissionCard key={smMission.id} mission={smMission}
                                        onDispatch={m => { setDispatchModal(m); setDispatchForm({ officers: m.officersDeployed || 3, budget: m.budgetAllocated || 100000, eta: '24', note: '' }); }}
                                        onResolve={id => setMissions(ms => ms.map(m => m.id === id ? { ...m, status: 'resolved' } : m))}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dispatch Modal */}
            {dispatchModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,24,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
                    <div style={{ background: '#0D1B2E', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#EF4444' }}>🚁 Deploy Resources</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{dispatchModal.title} · {dispatchModal.district}, {dispatchModal.state}</p>
                            </div>
                            <button onClick={() => setDispatchModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#FCA5A5' }}>
                            ⚠️ {dispatchModal.citizensAtRisk.toLocaleString()} citizens at risk · {dispatchModal.timeLeft}h until predicted failure
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Officers to Deploy</span>
                                <span style={{ color: '#A78BFA', fontWeight: 800 }}>{dispatchForm.officers}</span>
                            </label>
                            <input type="range" min={1} max={20} value={dispatchForm.officers} onChange={e => setDispatchForm(f => ({ ...f, officers: +e.target.value }))} style={{ width: '100%', accentColor: '#8B5CF6' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDispatchModal(null)}>Cancel</button>
                            <button style={{ flex: 2, background: 'linear-gradient(135deg, #8B5CF6, #EF4444)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={dispatching}
                                onClick={async () => {
                                    setDispatching(true);
                                    await new Promise(r => setTimeout(r, 800));
                                    setMissions(ms => ms.map(m => m.id === dispatchModal.id ? { ...m, status: 'dispatched', officersDeployed: dispatchForm.officers, budgetAllocated: dispatchForm.budget } : m));
                                    setDispatching(false);
                                    setDispatchModal(null);
                                }}>
                                {dispatching ? 'Dispatching...' : <><MdFlightTakeoff /> Dispatch Now</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PREDICTIONS TAB ── */}
            {activeTab !== 'missionControl' && <>
                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                    {[
                        { label: 'Active Predictions', value: stats?.activePredictions, color: '#F59E0B', icon: '⚡' },
                        { label: 'Total Analyzed', value: stats?.totalPredictions, color: '#8B5CF6', icon: '🤖' },
                        { label: 'Prevention Rate', value: `${stats?.preventionRate}%`, color: '#00C896', icon: '🛡️' },
                        { label: 'Dept Alerts Sent', value: stats?.totalPredictions, color: '#3B82F6', icon: '📡' },
                    ].map(s => (
                        <div key={s.label} className="metric-card" style={{ '--accent-color': s.color, textAlign: 'center' }}>
                            <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Prediction Cards */}
                <div>
                    {/* Active Section */}
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 8px #EF4444' }} />
                        Active Predictions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                        {alerts.filter(a => !a.prevented).length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
                                No active failure threats detected. All systems nominal.
                            </div>
                        ) : alerts.filter(a => !a.prevented).map((alert, i) => {
                            const urg = URGENCY[alert.urgency] || URGENCY.medium;
                            const sb = STATUS_BADGE[alert.status] || { cls: 'badge-pending', icon: '⏳' };
                            const isExpanded = expanded === alert.id;
                            return (
                                <div key={alert.id} style={{ background: urg.bg, border: `1px solid ${urg.border}`, borderRadius: 'var(--radius)', overflow: 'hidden', animation: `fadeInUp 0.3s ease ${i * 0.08}s both` }}>
                                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }} onClick={() => setExpanded(isExpanded ? null : alert.id)}>
                                        <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, background: `conic-gradient(${urg.color} ${alert.probability}%, rgba(255,255,255,0.12) 0%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontSize: '0.78rem', fontWeight: 800, color: urg.color }}>{alert.probability}%</div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--saffron)' }}>{alert.id}</span>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`, padding: '2px 8px', borderRadius: 100 }}>{urg.label}</span>
                                                <span className={`badge ${sb.cls}`}>{sb.icon} {alert.status}</span>
                                            </div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: 4 }}>{alert.title}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {alert.district}, {alert.state} &nbsp;·&nbsp; 📅 {alert.predictedDate} &nbsp;·&nbsp; ⏱️ {alert.daysUntil} days</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                            <button onClick={e => { e.stopPropagation(); setAllocateModal(alert); setAllocateForm({ officers: '2', budget: '50000', note: '' }); }} style={{ background: 'rgba(255,107,44,0.12)', border: '1px solid rgba(255,107,44,0.3)', color: 'var(--saffron)', borderRadius: 8, padding: '7px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MdPeople /> Allocate Resources
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); markPrevented(alert.id); }} style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.3)', color: '#00C896', borderRadius: 8, padding: '7px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MdCheckCircle /> Mark Prevented
                                            </button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                                            <div className="responsive-grid-2" style={{ gap: 14, marginTop: 16 }}>
                                                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                                                    <h5 style={{ fontSize: '0.78rem', color: '#A78BFA', marginBottom: 8 }}>🤖 AI Pattern Analysis</h5>
                                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.historicalPattern || 'Pattern analysis unavailable.'}</p>
                                                </div>
                                                <div style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                                                    <h5 style={{ fontSize: '0.78rem', color: '#00C896', marginBottom: 8 }}>📋 Suggested Action</h5>
                                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.suggestedAction}</p>
                                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>Dept: {alert.departmentAlerted} · {alert.alertSentAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Solved Section */}
                    {alerts.some(a => a.prevented) && (
                        <>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, marginTop: 40 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }} />
                                Successfully Mitigated (Solved Archive)
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {alerts.filter(a => a.prevented).map((alert, i) => {
                                    const isExpanded = expanded === alert.id;
                                    return (
                                        <div key={alert.id} style={{
                                            background: 'rgba(16, 185, 129, 0.06)',
                                            border: '1px solid rgba(16, 185, 129, 0.25)',
                                            borderLeft: '4px solid #10B981',
                                            borderRadius: 'var(--radius)',
                                            overflow: 'hidden',
                                            transition: 'transform 0.2s ease'
                                        }}>
                                            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : alert.id)}>
                                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                                    <MdCheckCircle style={{ fontSize: '1.6rem' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 4 }}>{alert.id}</span>
                                                        <span className="badge" style={{ background: '#10B981', color: '#fff', fontSize: '0.65rem', padding: '1px 8px', borderRadius: 100, fontWeight: 800 }}>🛡️ THREAT NEUTRALISED</span>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {alert.district}, {alert.state}</span>
                                                    </div>
                                                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-white)' }}>{alert.title}</h3>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>
                                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Mitigated On</div>
                                                    <div style={{ fontWeight: 800, color: '#10B981', fontSize: '0.85rem' }}>{new Date(alert.updatedAt || alert.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div style={{ padding: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                                        <div style={{ flex: 1, minWidth: 200 }}>
                                                            <h5 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Mitigation Summary</h5>
                                                            <p style={{ lineHeight: 1.6 }}>PreSeva AI successfully predicted this <strong>{alert.category}</strong> failure with <strong>{alert.probability}%</strong> confidence. Proactive resource allocation prevented service disruption for an estimated <strong>{alert.basisGrievances || 'thousands of'}</strong> citizens.</p>
                                                        </div>
                                                        <div style={{ width: 220, borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 20 }}>
                                                            <h5 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Intelligence Source</h5>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-white)' }}>{alert.historicalPattern || 'Pattern-based predictive modeling.'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Resource Allocation Modal */}
                {allocateModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,107,44,0.3)', borderRadius: 16, padding: 28, maxWidth: 460, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--saffron)' }}>⚡ Allocate Resources</h3>
                                <button onClick={() => setAllocateModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                            </div>
                            <div className="responsive-grid-2" style={{ gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Officers to Deploy</label>
                                    <input className="form-input" type="number" min={1} max={20} value={allocateForm.officers} onChange={e => setAllocateForm(f => ({ ...f, officers: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Budget Allocated (₹)</label>
                                    <input className="form-input" type="number" min={0} value={allocateForm.budget} onChange={e => setAllocateForm(f => ({ ...f, budget: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Escalation Note</label>
                                <textarea className="form-input" rows={3} placeholder="Add notes for the department..." value={allocateForm.note} onChange={e => setAllocateForm(f => ({ ...f, note: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setAllocateModal(null)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1 }} disabled={allocating} onClick={async () => {
                                    setAllocating(true);
                                    await apiPresevAssignAlert(allocateModal.id, { ...allocateForm, assignedAt: new Date().toISOString() });
                                    setAllocated(a => ({ ...a, [allocateModal.id]: true }));
                                    setAlerts(as => as.map(a => a.id === allocateModal.id ? { ...a, status: 'Department Notified' } : a));
                                    setAllocating(false);
                                    setAllocateModal(null);
                                }}>{allocating ? 'Allocating...' : '✓ Confirm Allocation'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* How PreSeva Works */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>⚙️ How PreSeva Works</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { step: '01', title: 'Data Mining', desc: 'AI analyzes 8M+ historical grievances — by location, time, category, department.' },
                            { step: '02', title: 'Pattern Recognition', desc: 'Deep learning detects seasonal, geographic, and cyclical failure patterns.' },
                            { step: '03', title: 'Prediction Generation', desc: 'Failure probabilities computed 48-72hrs ahead with confidence scores.' },
                            { step: '04', title: 'Department Alerts', desc: 'Auto-alerts sent to the exact department that can prevent the failure.' },
                            { step: '05', title: 'Prevention Tracking', desc: 'Officers confirm action taken. System logs prevented grievances.' },
                            { step: '06', title: 'Model Learning', desc: 'Each prevention improves future accuracy. Self-improving intelligence.' },
                        ].map(s => (
                            <div key={s.step} style={{ borderLeft: '2px solid rgba(139,92,246,0.3)', paddingLeft: 14 }}>
                                <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 900, color: '#8B5CF6', opacity: 0.6 }}>{s.step}</div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </>}
        </div>
    );
}
