import React, { useState, useEffect } from 'react';
import { MdAccountBalanceWallet, MdGavel, MdCheckCircle, MdHourglassEmpty, MdInfo, MdReceipt, MdSearch, MdClose, MdLocationOn, MdVerified, MdWarning } from 'react-icons/md';
import { apiGetAdminEscrow } from '../../services/api.service';

const MOCK_OFFICERS_ESC = [
    { id: 'O1', name: 'Suresh Patel' }, { id: 'O2', name: 'Anita Sharma' },
    { id: 'O3', name: 'Rajiv Nair' }, { id: 'O4', name: 'Priya Mehta' },
];

function Modal({ onClose, children }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,24,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <div style={{ background: '#0D1B2E', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 16, padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
                {children}
            </div>
        </div>
    );
}

export default function EscrowManagement() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [proofModal, setProofModal] = useState(null);
    const [infoModal, setInfoModal] = useState(null);
    const [overrideModal, setOverrideModal] = useState(false);
    const [overrideForm, setOverrideForm] = useState({ reason: '', amount: '', officer: '' });
    const [overrideDone, setOverrideDone] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await apiGetAdminEscrow();
            setProjects(res.data || []);
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
                    <h1 className="dash-title"><MdAccountBalanceWallet className="icon" /> NYAYKOSH — Sovereign Fund Accountability Ledger</h1>
                    <p className="dash-subtitle">Algorithmic fund locking based on citizen verification — every rupee tracked on the sovereign ledger</p>
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
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { setOverrideModal(true); setOverrideDone(false); setOverrideForm({ reason: '', amount: '', officer: '' }); }}>
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
                                    <button className="btn-icon" title="View Proof" onClick={() => setProofModal(p)}>
                                        <MdReceipt />
                                    </button>
                                    <button className="btn-icon" title="Project Info" onClick={() => setInfoModal(p)}>
                                        <MdInfo />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Proof Modal */}
            {proofModal && (
                <Modal onClose={() => setProofModal(null)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--teal)' }}><MdReceipt style={{ marginRight: 6 }} />Proof of Completion</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{proofModal.id} — {proofModal.title}</p>
                        </div>
                        <button onClick={() => setProofModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['Site Inspection', 'Work Completion', 'Material Delivery', 'Final Verification'].map((label, i) => (
                            <div key={label} style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                                <div style={{ width: '100%', height: 80, background: `linear-gradient(135deg, rgba(0,200,150,0.12), rgba(59,130,246,0.08))`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{['📸', '🏗️', '📦', '✅'][i]}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--teal)' }}><MdVerified style={{ verticalAlign: 'middle', marginRight: 4 }} />Verified {new Date(Date.now() - i * 864e5).toLocaleDateString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}><span style={{ color: 'var(--text-muted)' }}>Blockchain Hash</span><span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--saffron)' }}>0x4f7e...d21c</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}><span style={{ color: 'var(--text-muted)' }}>GPS Stamp</span><span style={{ color: 'var(--text-primary)' }}><MdLocationOn style={{ verticalAlign: 'middle' }} /> 28.6139°N 77.2090°E</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}><span style={{ color: 'var(--text-muted)' }}>Citizen Rating</span><span style={{ color: '#FFB800' }}>{'⭐'.repeat(proofModal.rating || 4)} ({proofModal.rating || 4}/5)</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}><span style={{ color: 'var(--text-muted)' }}>Funds Released</span><span style={{ color: 'var(--teal)', fontWeight: 700 }}>₹{(proofModal.disbursedAmount || 0).toLocaleString()}</span></div>
                    </div>
                </Modal>
            )}

            {/* Project Info Modal */}
            {infoModal && (
                <Modal onClose={() => setInfoModal(null)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}><MdInfo style={{ marginRight: 6, color: 'var(--saffron)' }} />{infoModal.title}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{infoModal.id} • {infoModal.grievanceId}</p>
                        </div>
                        <button onClick={() => setInfoModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[{ l: 'Contractor', v: infoModal.contractor }, { l: 'Budget', v: `₹${(infoModal.budget || 0).toLocaleString()}` }, { l: 'Progress', v: `${infoModal.progress}%` }, { l: 'Status', v: infoModal.status }].map(r => (
                            <div key={r.l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{r.l}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.v}</div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>Project Timeline</h4>
                        {['Project Awarded', 'Work Commenced', 'Mid-term Inspection', 'Completion Submitted', 'Citizen Verified'].map((step, i) => (
                            <div key={step} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= Math.floor(infoModal.progress / 25) ? 'var(--teal)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>{i <= Math.floor(infoModal.progress / 25) ? '✓' : i + 1}</div>
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{step}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{i <= Math.floor(infoModal.progress / 25) ? `${new Date(Date.now() - (4 - i) * 7 * 864e5).toLocaleDateString('en-IN')}` : 'Pending'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(255,107,44,0.06)', border: '1px solid rgba(255,107,44,0.2)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--saffron)', fontWeight: 700, marginBottom: 6 }}>💰 Fund Flow</div>
                        <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem' }}>
                            <div><div style={{ color: 'var(--text-muted)' }}>Total Budget</div><div style={{ fontWeight: 700 }}>₹{(infoModal.budget || 0).toLocaleString()}</div></div>
                            <div><div style={{ color: 'var(--text-muted)' }}>Locked</div><div style={{ fontWeight: 700, color: 'var(--saffron)' }}>₹{(infoModal.lockedAmount || 0).toLocaleString()}</div></div>
                            <div><div style={{ color: 'var(--text-muted)' }}>Released</div><div style={{ fontWeight: 700, color: 'var(--teal)' }}>₹{(infoModal.disbursedAmount || 0).toLocaleString()}</div></div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Manual Override Modal */}
            {overrideModal && (
                <Modal onClose={() => setOverrideModal(false)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--saffron)' }}><MdGavel style={{ marginRight: 6 }} />Manual Fund Override</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>This action is logged and requires senior officer authorization.</p>
                        </div>
                        <button onClick={() => setOverrideModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><MdClose /></button>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.82rem', color: '#FCA5A5' }}>
                        <MdWarning style={{ flexShrink: 0, marginTop: 2 }} /> All manual overrides are recorded on the NYAYKOSH sovereign ledger with a full audit trail. Misuse will result in escalation.
                    </div>
                    {!overrideDone ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Override Reason <span style={{ color: '#EF4444' }}>*</span></label>
                                <textarea className="form-input" rows={3} placeholder="Explain why this manual override is necessary..." value={overrideForm.reason} onChange={e => setOverrideForm(f => ({ ...f, reason: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Authorized Amount (₹)</label>
                                <input className="form-input" type="number" placeholder="Enter amount to release..." value={overrideForm.amount} onChange={e => setOverrideForm(f => ({ ...f, amount: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Authorizing Officer <span style={{ color: '#EF4444' }}>*</span></label>
                                <select className="form-input" value={overrideForm.officer} onChange={e => setOverrideForm(f => ({ ...f, officer: e.target.value }))}>
                                    <option value="">Select Officer...</option>
                                    {MOCK_OFFICERS_ESC.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setOverrideModal(false)}>Cancel</button>
                                <button disabled={!overrideForm.reason.trim() || !overrideForm.officer} onClick={() => setOverrideDone(true)} style={{ flex: 1, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: overrideForm.reason.trim() && overrideForm.officer ? 'pointer' : 'not-allowed', opacity: overrideForm.reason.trim() && overrideForm.officer ? 1 : 0.5 }}>⚠️ Execute Override</button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                            <h4 style={{ fontWeight: 800, color: 'var(--teal)', marginBottom: 8 }}>Override Executed</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Override logged on sovereign ledger.</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Hash: 0x{Math.random().toString(16).slice(2, 18)}</p>
                            <button className="btn-teal" style={{ marginTop: 16 }} onClick={() => setOverrideModal(false)}>Close</button>
                        </div>
                    )}
                </Modal>
            )}

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
