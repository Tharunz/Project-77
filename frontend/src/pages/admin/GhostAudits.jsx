import React, { useState, useEffect } from 'react'

export default function GhostAudits() {
  const [audits, setAudits] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [viewingDoc, setViewingDoc] = useState(null)
  const [docUrl, setDocUrl] = useState(null)
  const [docLoading, setDocLoading] = useState(false)

  const fetchAudits = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        'http://localhost:5000/api/admin/ghost-audits',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      setAudits(data.audits || [])
      setSummary(data.summary || {})
    } catch(err) {
      console.error('Ghost audits fetch failed:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchAudits() }, [])

  const getScoreColor = (score) => {
    if (score >= 70) return '#ef4444'
    if (score >= 40) return '#f59e0b'
    return '#22c55e'
  }

  const getScoreGlow = (score) => {
    if (score >= 70) return '0 0 20px rgba(239,68,68,0.3)'
    if (score >= 40) return '0 0 20px rgba(245,158,11,0.3)'
    return '0 0 20px rgba(34,197,94,0.15)'
  }

  const getStatusBadge = (status) => {
    const styles = {
      CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)', icon: '🚨' },
      REVIEW:   { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', icon: '⚠️' },
      CLEARED:  { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)', icon: '✅' }
    }
    return styles[status] || styles.CLEARED
  }

  const handleViewDocument = async (audit) => {
    setViewingDoc(audit)
    setDocUrl(null)
    setDocLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      // Get presigned URL from backend
      const res = await fetch(
        `http://localhost:5000/api/admin/document-url?key=${encodeURIComponent(audit.documentKey)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.url) {
        setDocUrl(data.url)
      }
    } catch(err) {
      console.error('Failed to get document URL:', err)
    }
    setDocLoading(false)
  }

  // ESC key handler
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setViewingDoc(null)
        setDocUrl(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = filter === 'ALL' 
    ? audits 
    : audits.filter(a => a.status === filter)

  return (
    <div style={{ 
      padding: '24px', 
      color: '#e2e8f0',
      minHeight: '100vh',
      background: 'transparent'
    }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 0 20px rgba(239,68,68,0.4)'
          }}>
            👻
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              Ghost Audit System
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              AI-powered document fraud detection · Powered by Amazon Rekognition
            </p>
          </div>
          <button
            onClick={fetchAudits}
            style={{
              marginLeft: 'auto',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#818cf8',
              padding: '8px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            🔄 Re-scan All Documents
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {[
          { label: 'Documents Scanned', value: summary.total || 0, icon: '📄', color: '#06b6d4' },
          { label: 'Flagged for Review', value: summary.flagged || 0, icon: '🚩', color: '#f59e0b' },
          { label: 'Critical Threats', value: summary.critical || 0, icon: '🚨', color: '#ef4444' },
          { label: 'Cleared & Verified', value: summary.cleared || 0, icon: '✅', color: '#22c55e' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.8)',
            border: `1px solid ${stat.color}22`,
            borderRadius: '14px',
            padding: '18px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{stat.icon}</div>
            <div style={{ 
              fontSize: '2rem', fontWeight: 800, 
              color: stat.color,
              fontVariantNumeric: 'tabular-nums'
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* AWS Badge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(99,102,241,0.06))',
        border: '1px solid rgba(6,182,212,0.15)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.1rem' }}>🔍</span>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
          <strong style={{ color: '#06b6d4' }}>Amazon Rekognition</strong>
          {' '}performs real-time label detection and content moderation
          on every uploaded document. Each scan checks for{' '}
          <strong style={{ color: '#cbd5e1' }}>15 object labels</strong>
          {' '}and{' '}
          <strong style={{ color: '#cbd5e1' }}>content moderation flags</strong>
          {' '}to calculate a fraud probability score.
        </p>
        <span style={{
          marginLeft: 'auto',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          color: '#4ade80',
          fontSize: '0.72rem',
          padding: '3px 10px',
          borderRadius: '20px',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          ● LIVE
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {['ALL', 'CRITICAL', 'REVIEW', 'CLEARED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f 
                ? 'rgba(99,102,241,0.2)' 
                : 'rgba(255,255,255,0.03)',
              border: filter === f
                ? '1px solid rgba(99,102,241,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
              color: filter === f ? '#818cf8' : '#64748b',
              padding: '6px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: filter === f ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {f === 'ALL' ? `All (${audits.length})` : f}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Amazon Rekognition scanning documents...
          </p>
        </div>
      )}

      {/* Audit Cards Grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map((audit) => {
            const scoreColor = getScoreColor(audit.fraudScore || 0)
            const statusStyle = getStatusBadge(audit.status)
            const isExpanded = expandedId === audit.auditId
            const score = audit.fraudScore || audit.fraudProbability || 0

            return (
              <div
                key={audit.auditId}
                style={{
                  background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(10,15,30,0.95))',
                  border: `1px solid ${score >= 70 ? 'rgba(239,68,68,0.3)' : score >= 40 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: getScoreGlow(score),
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: statusStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem'
                    }}>
                      {statusStyle.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#f8fafc',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {audit.citizen}
                        {audit.isReal ? (
                          <span style={{
                            background: 'rgba(34,197,94,0.1)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            color: '#4ade80',
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontWeight: 600
                          }}>
                            ● Live Document
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(100,116,139,0.1)',
                            border: '1px solid rgba(100,116,139,0.2)',
                            color: '#94a3b8',
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '20px'
                          }}>
                            Test Document
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.73rem',
                        color: '#94a3b8'
                      }}>
                        {audit.state} • {audit.category}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    background: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                    color: statusStyle.color,
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {statusStyle.icon} {audit.status}
                  </span>
                </div>

                {/* Document Analyzed Section */}
                <div style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {/* File type icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}>
                    {(() => {
                      const ext = (audit.documentKey || '').split('.').pop().toLowerCase()
                      if (['jpg','jpeg','png','webp','gif'].includes(ext)) return '🖼️'
                      if (ext === 'pdf') return '📑'
                      return '📄'
                    })()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: 0, 
                      color: '#94a3b8', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 600
                    }}>
                      Document Analyzed
                    </p>
                    <p style={{
                      margin: '2px 0 0 0',
                      color: '#cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {audit.documentKey 
                        ? audit.documentKey.split('/').pop()
                        : 'Document analyzed'}
                    </p>
                    <p style={{
                      margin: '1px 0 0 0',
                      color: '#475569',
                      fontSize: '0.72rem'
                    }}>
                      s3://ncie-documents-tharun-lab/{audit.documentKey}
                    </p>
                  </div>

                  {/* View Document Button */}
                  <button
                    onClick={() => handleViewDocument(audit)}
                    style={{
                      background: 'rgba(6,182,212,0.1)',
                      border: '1px solid rgba(6,182,212,0.25)',
                      color: '#06b6d4',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}
                  >
                    👁️ View
                  </button>
                </div>

                {/* Fraud Score Section */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600
                    }}>
                      Fraud Probability Score
                    </span>
                    <span style={{
                      color: scoreColor,
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {score}%
                    </span>
                  </div>

                  {/* Score Bar */}
                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: `${score}%`,
                      height: '100%',
                      background: score >= 70
                        ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                        : score >= 40
                          ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                          : 'linear-gradient(90deg, #16a34a, #22c55e)',
                      borderRadius: '8px',
                      transition: 'width 1s ease',
                      boxShadow: `0 0 8px ${scoreColor}88` 
                    }} />
                  </div>

                  {/* Flag Reason */}
                  <p style={{
                    margin: '0 0 14px 0',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    fontStyle: 'italic',
                    lineHeight: 1.5
                  }}>
                    {audit.flagReason}
                  </p>

                  {/* Expand Toggle */}
                  <button
                    onClick={() => setExpandedId(
                      isExpanded ? null : audit.auditId
                    )}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isExpanded ? '▲ Hide Details' : '▼ View Rekognition Analysis'}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px' }}>

                      {/* Detected Labels */}
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{
                          margin: '0 0 10px 0',
                          color: '#475569',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>🏷️</span> Detected Labels
                          <span style={{
                            color: '#06b6d4',
                            fontStyle: 'normal',
                            textTransform: 'none',
                            letterSpacing: 0,
                            fontSize: '0.72rem'
                          }}>
                            ({audit.labels?.length || 0} found)
                          </span>
                        </p>

                        {audit.labels && audit.labels.length > 0 ? (
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '6px' 
                          }}>
                            {audit.labels.map((label, i) => (
                              <div key={i} style={{
                                background: 'rgba(6,182,212,0.06)',
                                border: '1px solid rgba(6,182,212,0.15)',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{
                                  color: '#cbd5e1',
                                  fontSize: '0.8rem',
                                  fontWeight: 500
                                }}>
                                  {label.name}
                                </span>
                                <span style={{
                                  background: 'rgba(6,182,212,0.15)',
                                  color: '#06b6d4',
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  fontWeight: 700
                                }}>
                                  {label.confidence}%
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#334155', fontSize: '0.8rem', margin: 0 }}>
                            No labels detected above confidence threshold
                          </p>
                        )}
                      </div>

                      {/* Moderation Flags */}
                      <div>
                        <p style={{
                          margin: '0 0 10px 0',
                          color: '#475569',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>🛡️</span> Moderation Flags
                        </p>

                        {audit.moderationFlags && audit.moderationFlags.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {audit.moderationFlags.map((flag, i) => (
                              <span key={i} style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                color: '#f87171',
                                fontSize: '0.78rem',
                                fontWeight: 600
                              }}>
                                ⚑ {flag.name} ({flag.confidence}%)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(34,197,94,0.06)',
                            border: '1px solid rgba(34,197,94,0.15)',
                            borderRadius: '8px',
                            padding: '8px 12px'
                          }}>
                            <span style={{ fontSize: '0.9rem' }}>✅</span>
                            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 500 }}>
                              Clean document — No moderation flags
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Analysis Metadata */}
                      <div style={{
                        marginTop: '14px',
                        padding: '10px 12px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          color: '#334155', 
                          fontSize: '0.72rem' 
                        }}>
                          {audit.source || 'Amazon Rekognition'}
                        </span>
                        <span style={{ 
                          color: '#334155', 
                          fontSize: '0.72rem' 
                        }}>
                          {audit.analyzedAt 
                            ? new Date(audit.analyzedAt).toLocaleTimeString()
                            : 'Just now'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#475569'
        }}>
          <p style={{ fontSize: '2rem', margin: '0 0 12px 0' }}>🔍</p>
          <p style={{ margin: 0 }}>No audits found for filter: {filter}</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingDoc(null)
              setDocUrl(null)
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div style={{
            background: 'linear-gradient(145deg, #0f172a, #0a0f1e)',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 30px 100px rgba(0,0,0,0.9)'
          }}>

            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(99,102,241,0.08))',
              borderBottom: '1px solid rgba(6,182,212,0.15)',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexShrink: 0
            }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}>
                🔍
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 700 }}>
                  Rekognition Document Analysis
                </h3>
                <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                  {viewingDoc.documentKey?.split('/').pop()} · 
                  {' '}{viewingDoc.citizen} · {viewingDoc.grievanceId}
                </p>
              </div>

              {/* Fraud score chip in modal header */}
              <div style={{
                background: (viewingDoc.fraudScore || 0) >= 70 
                  ? 'rgba(239,68,68,0.15)' 
                  : (viewingDoc.fraudScore || 0) >= 40
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(34,197,94,0.15)',
                border: `1px solid ${getScoreColor(viewingDoc.fraudScore || 0)}44`,
                borderRadius: '20px',
                padding: '4px 14px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.65rem' }}>FRAUD SCORE</p>
                <p style={{ 
                  margin: 0, 
                  color: getScoreColor(viewingDoc.fraudScore || 0),
                  fontSize: '1.1rem',
                  fontWeight: 800
                }}>
                  {viewingDoc.fraudScore || 0}%
                </p>
              </div>

              <button
                onClick={() => { setViewingDoc(null); setDocUrl(null) }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                  width: '34px', height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Two column layout: image + analysis */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              flex: 1,
              overflow: 'hidden'
            }}>

              {/* LEFT: Document Preview */}
              <div style={{
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <p style={{ 
                    margin: 0, color: '#475569', 
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600
                  }}>
                    📎 Analyzed Document
                  </p>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  overflow: 'auto'
                }}>
                  {docLoading ? (
                    <div style={{ textAlign: 'center', color: '#475569' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>
                        Loading document...
                      </p>
                    </div>
                  ) : docUrl ? (
                    <img
                      src={docUrl}
                      alt="Analyzed document"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                      onError={(e) => {
                        // If image fails, show PDF/other file message
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#475569' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem' }}>
                        {viewingDoc.documentKey?.split('/').pop()}
                      </p>
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: 'rgba(6,182,212,0.1)',
                            border: '1px solid rgba(6,182,212,0.25)',
                            color: '#06b6d4',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.82rem'
                          }}
                        >
                          Open Document ↗
                        </a>
                      )}
                    </div>
                  )}

                  {/* Hidden fallback for non-image files */}
                  <div style={{ display: 'none', textAlign: 'center', color: '#475569' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📑</div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem' }}>
                      {viewingDoc.documentKey?.split('/').pop()}
                    </p>
                    {docUrl && (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'rgba(6,182,212,0.1)',
                          border: '1px solid rgba(6,182,212,0.25)',
                          color: '#06b6d4',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '0.82rem',
                          display: 'inline-block'
                        }}
                      >
                        Open in New Tab ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Rekognition Results */}
              <div style={{ overflowY: 'auto', padding: '16px 20px' }}>
                <p style={{
                  margin: '0 0 14px 0',
                  color: '#475569',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600
                }}>
                  🔍 Rekognition Analysis Results
                </p>

                {/* Labels */}
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: '#64748b', 
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}>
                  Detected Labels ({viewingDoc.labels?.length || 0})
                </p>
                <div style={{ marginBottom: '16px' }}>
                  {viewingDoc.labels && viewingDoc.labels.length > 0 ? (
                    viewingDoc.labels.map((label, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                          {label.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '80px',
                            height: '4px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '4px'
                          }}>
                            <div style={{
                              width: `${label.confidence}%`,
                              height: '100%',
                              background: '#06b6d4',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ 
                            color: '#06b6d4', 
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            minWidth: '36px',
                            textAlign: 'right'
                          }}>
                            {label.confidence}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#334155', fontSize: '0.8rem' }}>
                      No labels detected
                    </p>
                  )}
                </div>

                {/* Moderation */}
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: '#64748b', 
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}>
                  Moderation Flags
                </p>
                {viewingDoc.moderationFlags && 
                 viewingDoc.moderationFlags.length > 0 ? (
                  viewingDoc.moderationFlags.map((flag, i) => (
                    <div key={i} style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: '#f87171', fontSize: '0.8rem' }}>
                        ⚑ {flag.name}
                      </span>
                      <span style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>
                        {flag.confidence}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{
                    background: 'rgba(34,197,94,0.06)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>✅</span>
                    <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>
                      No moderation flags — Clean document
                    </span>
                  </div>
                )}

                {/* Open full document link */}
                {docUrl && (
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '16px',
                      background: 'rgba(6,182,212,0.08)',
                      border: '1px solid rgba(6,182,212,0.2)',
                      color: '#06b6d4',
                      padding: '10px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    ↗ Open Original Document in New Tab
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              padding: '10px 24px',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <span style={{ color: '#334155', fontSize: '0.72rem' }}>
                Press ESC or click outside to close
              </span>
              <span style={{ color: '#334155', fontSize: '0.72rem' }}>
                Analyzed by Amazon Rekognition · 
                {viewingDoc.analyzedAt 
                  ? new Date(viewingDoc.analyzedAt).toLocaleString()
                  : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
