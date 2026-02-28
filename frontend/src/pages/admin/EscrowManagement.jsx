import React, { useState, useEffect } from 'react';
import { MdAccountBalanceWallet, MdGavel, MdCheckCircle, MdHourglassEmpty, MdInfo, MdReceipt, MdSearch } from 'react-icons/md';
import { apiGetEscrowProjects } from '../../services/api.service';

export default function EscrowManagement() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            const res = await apiGetEscrowProjects();
            setProjects(res.data);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.grievanceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="dash-loading"><div className="spinner" /><span>Decrypting Escrow Ledger...</span></div>;

    const totalLocked = projects.reduce((acc, p) => acc + p.lockedAmount, 0);
    const totalDisbursed = projects.reduce((acc, p) => acc + p.disbursedAmount, 0);

    return (
        <div className="escrow-management page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-header" style={{ marginBottom: 32, alignItems: 'flex-start' }}>
                <div>
                    <h1 className="dash-title"><MdAccountBalanceWallet className="icon" /> Digital Budget Escrow</h1>
                    <p className="dash-subtitle">Algorithmic fund locking based on citizen verification</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', minWidth: 160 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Locked</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--saffron)' }}>₹{(totalLocked / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', minWidth: 160 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Disbursed</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--teal)' }}>₹{(totalDisbursed / 100000).toFixed(1)}L</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="form-input"
                        placeholder="Search by Project, Contractor or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: 40, width: '100%' }}
                    />
                </div>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdGavel /> Manual Override
                </button>
            </div>

            {/* Ledger Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '16px 20px' }}>Project & ID</th>
                            <th>Contractor</th>
                            <th>Budget</th>
                            <th>Status / Progress</th>
                            <th>Verification</th>
                            <th style={{ textAlign: 'right', paddingRight: 20 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--saffron)', fontFamily: 'monospace', marginTop: 2 }}>{p.id} • {p.grievanceId}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{p.contractor}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 700 }}>₹{p.budget.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.7rem', color: p.lockedAmount > 0 ? 'var(--saffron)' : 'var(--teal)' }}>
                                        {p.lockedAmount > 0 ? 'LOCKED' : 'DISBURSED'}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${p.progress}%`, height: '100%', background: p.progress === 100 ? 'var(--teal)' : 'var(--saffron)' }} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem' }}>{p.progress}%</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.status}</div>
                                </td>
                                <td>
                                    {p.citizenVerified ? (
                                        <div style={{ color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <MdCheckCircle /> Verified ({p.rating}⭐)
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <MdHourglassEmpty /> Awaiting Citizen
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: 20 }}>
                                    <button className="btn-icon" title="View Proof">
                                        <MdReceipt />
                                    </button>
                                    <button className="btn-icon" title="Project Info">
                                        <MdInfo />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AI Insight Overlay */}
            <div className="glass-card" style={{ marginTop: 24, padding: 20, borderLeft: '4px solid var(--teal)', background: 'linear-gradient(90deg, rgba(0,200,150,0.05), transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <MdGavel style={{ color: 'var(--teal)', fontSize: '1.2rem' }} />
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-white)' }}>AI Escrow Strategy Active</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Currently monitoring <strong>{projects.length}</strong> infrastructure projects.
                    <strong>₹4.2 Lakh</strong> was saved this month by algorithmically blocking payouts to 2 contractors where the AI detected failed resolution metadata.
                </p>
            </div>
        </div>
    );
}
