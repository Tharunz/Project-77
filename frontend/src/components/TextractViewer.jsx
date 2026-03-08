import React, { useState, useEffect } from 'react'

// Search within document text
const SearchInDocument = ({ text, query, onQueryChange }) => {
  const matches = query.trim() !== '' 
    ? (text.match(new RegExp(query.replace(
        /[.*+?^${}()|[\]\\]/g, '\\$&'
      ), 'gi')) || []).length
    : 0

  return (
    <div style={{
      padding: '10px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0
    }}>
      <span style={{ color: '#475569', fontSize: '0.85rem' }}>🔍</span>
      <input
        type="text"
        placeholder="Search within document..."
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '7px 12px',
          color: '#e2e8f0',
          fontSize: '0.83rem',
          outline: 'none'
        }}
      />
      {query && (
        <span style={{
          color: matches > 0 ? '#4ade80' : '#f87171',
          fontSize: '0.78rem',
          whiteSpace: 'nowrap'
        }}>
          {matches > 0 
            ? `${matches} match${matches !== 1 ? 'es' : ''}` 
            : 'No matches'}
        </span>
      )}
    </div>
  )
}

// Render text with line numbers
const HighlightedText = ({ text, searchQuery }) => {
  const lines = text.split('\n')

  // Helper to highlight matches in a line
  const highlightLine = (line) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return (
        <span style={{ color: '#cbd5e1' }}>
          {line || ' '}
        </span>
      )
    }

    // Escape special regex characters
    const escaped = searchQuery.replace(
      /[.*+?^${}()|[\]\\]/g, '\\$&'
    )
    const regex = new RegExp(`(${escaped})`, 'gi')
    const parts = line.split(regex)

    if (parts.length === 1) {
      return (
        <span style={{ color: '#cbd5e1' }}>
          {line || ' '}
        </span>
      )
    }

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span
              key={i}
              style={{
                background: '#fbbf24',
                color: '#0f172a',
                borderRadius: '3px',
                padding: '1px 2px',
                fontWeight: 700
              }}
            >
              {part}
            </span>
          ) : (
            <span key={i} style={{ color: '#cbd5e1' }}>
              {part}
            </span>
          )
        )}
      </span>
    )
  }

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '16px',
            padding: '2px 0',
            borderBottom: i < lines.length - 1
              ? '1px solid rgba(255,255,255,0.02)'
              : 'none',
            // Highlight entire line bg if it has a match
            background: searchQuery && 
              line.toLowerCase().includes(
                searchQuery.toLowerCase()
              )
              ? 'rgba(251,191,36,0.05)'
              : 'transparent'
          }}
        >
          {/* Line Number */}
          <span style={{
            color: searchQuery && 
              line.toLowerCase().includes(
                searchQuery.toLowerCase()
              )
              ? '#fbbf24'
              : '#334155',
            fontSize: '0.75rem',
            minWidth: '28px',
            textAlign: 'right',
            userSelect: 'none',
            paddingTop: '1px',
            lineHeight: 1.8,
            fontWeight: searchQuery && 
              line.toLowerCase().includes(
                searchQuery.toLowerCase()
              )
              ? 700
              : 400
          }}>
            {i + 1}
          </span>
          {/* Line Content with highlights */}
          <span style={{
            fontSize: '0.85rem',
            lineHeight: 1.8,
            flex: 1,
            wordBreak: 'break-word'
          }}>
            {highlightLine(line)}
          </span>
        </div>
      ))}
    </div>
  )
}

const TextractViewer = ({ grievance }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('fields')
  const [showDocModal, setShowDocModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowDocModal(false)
        setSearchQuery('')
      }
    }
    if (showDocModal) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showDocModal])

  // Don't render if no textract data at all
  if (!grievance.extractedText && 
      !grievance.detectedFields &&
      !grievance.blockCount) {
    return null
  }

  const hasFields = grievance.detectedFields && 
    Object.keys(grievance.detectedFields).some(
      k => grievance.detectedFields[k]
    )

  const hasText = grievance.extractedText && 
    grievance.extractedText.trim() !== ''

  const wordCount = hasText 
    ? grievance.extractedText.trim().split(/\s+/).length 
    : 0

  const lineCount = hasText
    ? grievance.extractedText.trim().split('\n').length
    : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(6,182,212,0.04) 0%, rgba(99,102,241,0.04) 100%)',
      border: '1px solid rgba(6,182,212,0.2)',
      borderRadius: '16px',
      overflow: 'hidden',
      marginTop: '20px'
    }}>

      {/* Header Bar */}
      <div style={{
        background: 'rgba(6,182,212,0.08)',
        borderBottom: '1px solid rgba(6,182,212,0.15)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'rgba(6,182,212,0.15)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem'
        }}>
          📄
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: 0, 
            color: '#06b6d4', 
            fontSize: '0.92rem',
            fontWeight: 700,
            letterSpacing: '0.02em'
          }}>
            Document Intelligence — Textract Analysis
          </h4>
          <p style={{ 
            margin: '2px 0 0 0', 
            color: '#64748b', 
            fontSize: '0.75rem' 
          }}>
            Automatically extracted using Amazon Textract OCR
          </p>
        </div>

        {/* Stats Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {grievance.blockCount > 0 && (
            <span style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.2)',
              color: '#06b6d4',
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              {grievance.blockCount} blocks
            </span>
          )}
          {wordCount > 0 && (
            <span style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#818cf8',
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              {wordCount} words
            </span>
          )}
          <span style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#4ade80',
            fontSize: '0.72rem',
            padding: '3px 10px',
            borderRadius: '20px',
            fontWeight: 600
          }}>
            ● Amazon Textract
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      {hasFields && hasText && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          {[
            { id: 'fields', label: '🎯 Detected Fields', show: hasFields },
            { id: 'text', label: '📝 Full Text', show: hasText }
          ].filter(t => t.show).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id 
                  ? '2px solid #06b6d4' 
                  : '2px solid transparent',
                color: activeTab === tab.id ? '#06b6d4' : '#64748b',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div style={{ padding: '20px' }}>

        {/* DETECTED FIELDS TAB */}
        {(activeTab === 'fields' || !hasText) && hasFields && (
          <div>
            <p style={{
              margin: '0 0 14px 0',
              color: '#94a3b8',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600
            }}>
              Auto-Extracted Document Fields
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(grievance.detectedFields)
                .filter(([k, v]) => v)
                .map(([key, value]) => {
                  const icons = {
                    name: '👤',
                    income: '💰',
                    address: '📍',
                    date: '📅',
                    amount: '💵',
                    id: '🪪',
                    phone: '📞'
                  }
                  const icon = icons[key.toLowerCase()] || '📋'
                  return (
                    <div key={key} style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '12px 14px'
                    }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        color: '#64748b',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}>
                        {icon} {key.replace(/_/g, ' ')}
                      </p>
                      <p style={{
                        margin: 0,
                        color: '#f1f5f9',
                        fontSize: '0.92rem',
                        fontWeight: 600
                      }}>
                        {key.toLowerCase() === 'income' 
                          ? `₹${value}` 
                          : value}
                      </p>
                    </div>
                  )
                })}
            </div>

            {/* Show text button if both exist */}
            {hasText && (
              <button
                onClick={() => setActiveTab('text')}
                style={{
                  marginTop: '16px',
                  background: 'none',
                  border: '1px solid rgba(6,182,212,0.3)',
                  color: '#06b6d4',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                View Full Extracted Text →
              </button>
            )}
          </div>
        )}

        {/* FULL TEXT TAB */}
        {(activeTab === 'text' || (!hasFields && hasText)) && hasText && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <p style={{
                margin: 0,
                color: '#94a3b8',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600
              }}>
                Complete Extracted Text
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  color: '#475569',
                  fontSize: '0.75rem'
                }}>
                  {lineCount} lines · {wordCount} words
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      grievance.extractedText
                    )
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Scrollable text area */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '16px',
              maxHeight: isExpanded ? 'none' : '240px',
              overflowY: isExpanded ? 'visible' : 'auto',
              position: 'relative',
              transition: 'max-height 0.3s ease'
            }}>
              <pre style={{
                margin: 0,
                color: '#cbd5e1',
                fontSize: '0.83rem',
                lineHeight: 1.8,
                fontFamily: "'Courier New', monospace",
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {grievance.extractedText}
              </pre>
            </div>

            {/* Open Document Viewer if text is long */}
            {grievance.extractedText.length > 500 && (
              <button
                onClick={() => setShowDocModal(true)}
                style={{
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))',
                  border: '1px solid rgba(6,182,212,0.3)',
                  color: '#06b6d4',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  width: '100%',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🔍</span>
                <span>Open Document Viewer — {wordCount} words</span>
                <span style={{ 
                  background: 'rgba(6,182,212,0.2)', 
                  padding: '1px 8px', 
                  borderRadius: '20px',
                  fontSize: '0.7rem'
                }}>
                  Full Screen
                </span>
              </button>
            )}
          </div>
        )}

        {/* NO TEXT EXTRACTED */}
        {!hasFields && !hasText && (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: '#475569'
          }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>🖼️</p>
            <p style={{ 
              margin: 0, 
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              No readable text detected in the attached document.
              The file may be an image without text content.
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p style={{ 
          margin: 0, 
          color: '#334155', 
          fontSize: '0.72rem' 
        }}>
          Processed by Amazon Textract · 
          Supports PDF, PNG, JPG, TIFF
        </p>
        {grievance.extractedText && (
          <p style={{ 
            margin: 0, 
            color: '#334155', 
            fontSize: '0.72rem' 
          }}>
            Extraction confidence: High
          </p>
        )}
      </div>

      {/* Full-Screen Document Viewer Modal */}
      {showDocModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) 
              setShowDocModal(false)
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #0a0f1e 100%)',
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(6,182,212,0.1)',
            overflow: 'hidden'
          }}>

            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(99,102,241,0.08))',
              borderBottom: '1px solid rgba(6,182,212,0.15)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexShrink: 0
            }}>
              {/* Doc Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                📄
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ 
                  margin: 0, 
                  color: '#f8fafc', 
                  fontSize: '1rem',
                  fontWeight: 700 
                }}>
                  Document Intelligence Viewer
                </h3>
                <p style={{ 
                  margin: '3px 0 0 0', 
                  color: '#64748b', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span>Grievance: {grievance.grievanceId || grievance.id}</span>
                  <span>·</span>
                  <span>{wordCount} words extracted</span>
                  <span>·</span>
                  <span>{lineCount} lines</span>
                </p>
              </div>

              {/* Stat Badges */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                flexShrink: 0 
              }}>
                <span style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#4ade80',
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 600
                }}>
                  ● Amazon Textract
                </span>
                <span style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#818cf8',
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: '20px'
                }}>
                  {grievance.blockCount || 0} blocks
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                flexShrink: 0 
              }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(grievance.extractedText)
                  }}
                  title="Copy all text"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  📋
                </button>
                <button
                  onClick={() => {
                    setShowDocModal(false)
                    setSearchQuery('')
                  }}
                  title="Close"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171',
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Detected Fields Strip (if exists) */}
            {hasFields && (
              <div style={{
                padding: '12px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                flexShrink: 0
              }}>
                <span style={{ 
                  color: '#475569', 
                  fontSize: '0.75rem',
                  alignSelf: 'center',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginRight: '4px'
                }}>
                  Detected:
                </span>
                {Object.entries(grievance.detectedFields)
                  .filter(([k, v]) => v)
                  .map(([key, value]) => {
                    const icons = {
                      name: '👤',
                      income: '💰',
                      address: '📍',
                      date: '📅',
                      amount: '💵',
                      id: '🪪',
                      phone: '📞'
                    }
                    const icon = icons[key.toLowerCase()] || '📋'
                    return (
                      <span key={key} style={{
                        background: 'rgba(6,182,212,0.08)',
                        border: '1px solid rgba(6,182,212,0.15)',
                        borderRadius: '8px',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        color: '#e2e8f0'
                      }}>
                        {icon} <strong style={{ color: '#94a3b8' }}>
                          {key}:
                        </strong>{' '}
                        {key.toLowerCase() === 'income' 
                          ? `₹${value}` 
                          : value}
                      </span>
                    )
                  })}
              </div>
            )}

            {/* Search Bar */}
            <SearchInDocument 
              text={grievance.extractedText}
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />

            {/* Scrollable Document Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(6,182,212,0.3) transparent'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '24px 28px',
                minHeight: '200px'
              }}>
                <HighlightedText
                  text={grievance.extractedText}
                  searchQuery={searchQuery}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <p style={{ 
                margin: 0, 
                color: '#334155', 
                fontSize: '0.72rem' 
              }}>
                Press ESC or click outside to close
              </p>
              <p style={{ 
                margin: 0, 
                color: '#334155', 
                fontSize: '0.72rem' 
              }}>
                Extracted by Amazon Textract · 
                High confidence
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TextractViewer
