import { useState, useMemo, useCallback } from 'react'
import './App.css'
import {
  MOCK_WHISPERS,
  MOCK_AREAS,
  MOCK_REPLIES,
  MOCK_USERS,
  CURRENT_LOCATION,
  REACTION_CONFIG,
  calcWhisperOpacity,
  type Whisper,
  type WhisperReply,
  type ReactionType,
  type AreaGroup,
} from './whisperMockData'

// ============================================================
// ユーティリティ
// ============================================================

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
}

function remainingPercent(whisper: Whisper): number {
  const created = new Date(whisper.createdAt).getTime()
  const expires = new Date(whisper.expiresAt).getTime()
  const total = expires - created
  const remaining = expires - Date.now()
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

function getInitial(name: string): string {
  return name.charAt(0)
}

// ============================================================
// コンポーネント
// ============================================================

function WhisperCard({
  whisper,
  onClick,
  replies,
}: {
  whisper: Whisper
  onClick: () => void
  replies?: WhisperReply[]
}) {
  const opacity = calcWhisperOpacity(whisper)
  const remaining = remainingPercent(whisper)

  return (
    <div
      className="whisper-card"
      style={{ opacity: Math.max(0.15, opacity) }}
      onClick={onClick}
    >
      <div className="whisper-header">
        <div className="avatar">{getInitial(whisper.user.username)}</div>
        <div className="whisper-meta">
          <div className="whisper-username">{whisper.user.username}</div>
          <div className="whisper-time-distance">
            <span>{timeAgo(whisper.createdAt)}</span>
            <span>{formatDistance(whisper.distanceMeters)}</span>
            <span>{whisper.areaName}</span>
          </div>
        </div>
      </div>

      <div className="whisper-content">{whisper.content}</div>

      <div className="whisper-footer">
        <div className="whisper-reactions">
          {whisper.reactions.map((r) => (
            <span key={r.type} className="reaction-badge">
              {REACTION_CONFIG[r.type].emoji} {r.count}
            </span>
          ))}
        </div>
        {whisper.replyCount > 0 && (
          <div className="whisper-reply-count">
            💬 {whisper.replyCount}
          </div>
        )}
      </div>

      <div className="expiry-bar">
        <div className="expiry-fill" style={{ width: `${remaining}%` }} />
      </div>

      {replies && replies.length > 0 && (
        <div className="reply-thread">
          {replies.map((r) => (
            <div key={r.id} className="reply-item">
              <div className="avatar reply-avatar">
                {getInitial(r.user.username)}
              </div>
              <div className="reply-body">
                <span className="reply-username">{r.user.username}</span>
                <span className="reply-text">{r.content}</span>
                <div className="reply-time">{timeAgo(r.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailModal({
  whisper,
  replies,
  onClose,
  onReact,
}: {
  whisper: Whisper
  replies: WhisperReply[]
  onClose: () => void
  onReact: (type: ReactionType) => void
}) {
  const [replyText, setReplyText] = useState('')
  const remaining = remainingPercent(whisper)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="whisper-header">
          <div className="avatar">{getInitial(whisper.user.username)}</div>
          <div className="whisper-meta">
            <div className="whisper-username">{whisper.user.username}</div>
            <div className="whisper-time-distance">
              <span>{timeAgo(whisper.createdAt)}</span>
              <span>{formatDistance(whisper.distanceMeters)}</span>
              <span>{whisper.areaName}</span>
            </div>
          </div>
        </div>

        <div className="whisper-content" style={{ fontSize: 17, margin: '12px 0' }}>
          {whisper.content}
        </div>

        <div className="expiry-bar" style={{ marginBottom: 16 }}>
          <div className="expiry-fill" style={{ width: `${remaining}%` }} />
        </div>

        <div className="reaction-picker">
          {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => (
            <button
              key={type}
              className="reaction-picker-btn"
              onClick={() => onReact(type)}
            >
              {REACTION_CONFIG[type].emoji}
              <span className="label">{REACTION_CONFIG[type].label}</span>
            </button>
          ))}
        </div>

        <div className="reply-thread" style={{ borderTop: `1px solid var(--border)`, paddingTop: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            返信 ({replies.length})
          </div>
          {replies.map((r) => (
            <div key={r.id} className="reply-item">
              <div className="avatar reply-avatar">
                {getInitial(r.user.username)}
              </div>
              <div className="reply-body">
                <span className="reply-username">{r.user.username}</span>
                <span className="reply-text">{r.content}</span>
                <div className="reply-time">{timeAgo(r.createdAt)}</div>
              </div>
            </div>
          ))}
          {replies.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>
              まだ返信はありません
            </div>
          )}
        </div>

        <div className="compose-inner" style={{ marginTop: 12 }}>
          <input
            className="compose-input"
            placeholder="返信する..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className="compose-btn" disabled={!replyText.trim()}>
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// メインアプリ
// ============================================================

function App() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedWhisper, setSelectedWhisper] = useState<Whisper | null>(null)
  const [composeText, setComposeText] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [whispers, setWhispers] = useState(MOCK_WHISPERS)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const filteredWhispers = useMemo(() => {
    let items = [...whispers]
    if (selectedArea) {
      const area = MOCK_AREAS.find((a) => a.id === selectedArea)
      if (area) {
        items = items.filter((w) => w.areaName === area.name)
      }
    }
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [whispers, selectedArea])

  const groupedWhispers = useMemo(() => {
    const near: Whisper[] = []
    const mid: Whisper[] = []
    const far: Whisper[] = []

    for (const w of filteredWhispers) {
      if (w.distanceMeters <= 100) near.push(w)
      else if (w.distanceMeters <= 400) mid.push(w)
      else far.push(w)
    }

    return { near, mid, far }
  }, [filteredWhispers])

  const totalUsers = MOCK_AREAS.reduce((s, a) => s + a.activeUserCount, 0)

  const handleCompose = () => {
    if (!composeText.trim()) return

    const newWhisper: Whisper = {
      id: `w-new-${Date.now()}`,
      user: MOCK_USERS[0],
      content: composeText.trim(),
      latitude: CURRENT_LOCATION.latitude,
      longitude: CURRENT_LOCATION.longitude,
      areaName: '渋谷駅前',
      distanceMeters: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      replyCount: 0,
      reactionCount: 0,
      reactions: [],
    }

    setWhispers((prev) => [newWhisper, ...prev])
    setComposeText('')
    showToast('つぶやきました')
  }

  const handleReact = (type: ReactionType) => {
    if (!selectedWhisper) return
    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWhisper.id) return w
        const existing = w.reactions.find((r) => r.type === type)
        const reactions = existing
          ? w.reactions.map((r) =>
              r.type === type ? { ...r, count: r.count + 1 } : r
            )
          : [...w.reactions, { type, count: 1 }]
        return { ...w, reactions, reactionCount: w.reactionCount + 1 }
      })
    )
    showToast(`${REACTION_CONFIG[type].emoji} ${REACTION_CONFIG[type].label}`)
    setSelectedWhisper(null)
  }

  const repliesForSelected = selectedWhisper
    ? MOCK_REPLIES.filter((r) => r.whisperId === selectedWhisper.id)
    : []

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div className="header-location">
            <span className="pin">📍</span>
            渋谷駅周辺
          </div>
          <div className="header-people">
            <span className="dot" />
            {totalUsers}人がこの近くにいます
          </div>
        </div>
        <div className="area-chips">
          <button
            className={`area-chip ${!selectedArea ? 'active' : ''}`}
            onClick={() => setSelectedArea(null)}
          >
            すべて
          </button>
          {MOCK_AREAS.map((area) => (
            <button
              key={area.id}
              className={`area-chip ${selectedArea === area.id ? 'active' : ''}`}
              onClick={() => setSelectedArea(area.id)}
            >
              {area.name}
              <span className="chip-count">{area.whisperCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="feed">
        {filteredWhispers.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🤫</div>
            <p>
              このエリアにはまだつぶやきがありません。
              <br />
              最初のつぶやきを投稿してみましょう!
            </p>
          </div>
        ) : (
          <>
            {groupedWhispers.near.length > 0 && (
              <>
                <div className="section-label">📍 今いるエリア</div>
                {groupedWhispers.near.map((w) => (
                  <WhisperCard
                    key={w.id}
                    whisper={w}
                    onClick={() => setSelectedWhisper(w)}
                    replies={
                      w.id === 'w1'
                        ? MOCK_REPLIES.filter((r) => r.whisperId === 'w1')
                        : undefined
                    }
                  />
                ))}
              </>
            )}

            {groupedWhispers.mid.length > 0 && (
              <>
                <div className="section-label">🚶 近くのエリア</div>
                {groupedWhispers.mid.map((w) => (
                  <WhisperCard
                    key={w.id}
                    whisper={w}
                    onClick={() => setSelectedWhisper(w)}
                  />
                ))}
              </>
            )}

            {groupedWhispers.far.length > 0 && (
              <>
                <div className="section-label">🌙 さっきいた場所</div>
                {groupedWhispers.far.map((w) => (
                  <WhisperCard
                    key={w.id}
                    whisper={w}
                    onClick={() => setSelectedWhisper(w)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Compose Bar */}
      <div className="compose-bar">
        <div className="compose-inner">
          <input
            className="compose-input"
            placeholder="つぶやく..."
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompose()}
          />
          <button
            className="compose-btn"
            disabled={!composeText.trim()}
            onClick={handleCompose}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Bottom Nav (decorative) */}
      <div className="bottom-nav" style={{ bottom: 56 }}>
        <button className="nav-item">
          <span className="nav-icon">🔍</span>
          Pulse
        </button>
        <button className="nav-item">
          <span className="nav-icon">🗺️</span>
          Nearby
        </button>
        <button className="nav-item active">
          <span className="nav-icon">🤫</span>
          Whisper
        </button>
        <button className="nav-item">
          <span className="nav-icon">📋</span>
          Timeline
        </button>
        <button className="nav-item">
          <span className="nav-icon">👤</span>
          Profile
        </button>
      </div>

      {/* Detail Modal */}
      {selectedWhisper && (
        <DetailModal
          whisper={selectedWhisper}
          replies={repliesForSelected}
          onClose={() => setSelectedWhisper(null)}
          onReact={handleReact}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

export default App
