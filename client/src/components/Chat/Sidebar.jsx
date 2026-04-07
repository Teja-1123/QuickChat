import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { formatDistanceToNow } from 'date-fns'
import { avatarColor, initials } from '../../utils/helpers'
import NewRoomModal from './NewRoomModal'

function RoomAvatar({ name, size = 38 }) {
  return (
    <div className="room-avatar" style={{
      background: avatarColor(name),
      width: size, height: size,
      borderRadius: Math.round(size * 0.28),
    }}>
      {initials(name)}
    </div>
  )
}

export default function Sidebar({ rooms, activeRoom, onSelectRoom, onRoomCreated }) {
  const { user, logout }        = useAuth()
  const { connected, onlineUsers } = useSocket()
  const [query, setQuery]       = useState('')
  const [modal, setModal]       = useState(null) 

  const getDisplay = (room) => {
    if (room.type === 'private') {
      const other = room.members?.find(m => m._id !== user?._id)
      return { name: other?.username ?? 'Unknown', otherId: other?._id }
    }
    return { name: room.name ?? 'Unnamed', otherId: null }
  }

  const preview = (room) => {
    const msg = room.lastMessage
    if (!msg) return 'No messages yet'
    if (msg.type === 'image')  return '📷 Photo'
    if (msg.type === 'file')   return '📎 File'
    if (msg.type === 'system') return msg.content
    const who  = msg.sender?.username === user?.username ? 'You' : msg.sender?.username
    const text = msg.content?.slice(0, 36) ?? ''
    return `${who}: ${text}${(msg.content?.length ?? 0) > 36 ? '…' : ''}`
  }

  const filtered = rooms.filter(r => {
    const { name } = getDisplay(r)
    return name.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <>
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">⚡</div>
            <span className="sidebar-brand-name">QuickChat</span>
          </div>
          <div className={`conn-badge ${connected ? 'on' : 'off'}`}>
            <span className="conn-dot" />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <div className="sidebar-search-inner">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"
              stroke="var(--t400)" strokeWidth="2">
              <circle cx="9" cy="9" r="6"/><path d="m15 15 4 4"/>
            </svg>
            <input placeholder="Search…" value={query}
              onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="sidebar-actions">
          <button className="sidebar-action-btn" onClick={() => setModal('private')}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M20 2H0v13h5l5 5 5-5h5z"/>
            </svg>
            Direct
          </button>
          <button className="sidebar-action-btn" onClick={() => setModal('group')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/>
              <path d="M2 20a6 6 0 0 1 12 0"/><path d="M16 15a5 5 0 0 1 6 5"/>
            </svg>
            Group
          </button>
        </div>

        <div className="sidebar-section-label">Conversations</div>

        {/* Rooms */}
        <div className="rooms-list">
          {filtered.length === 0 ? (
            <div className="rooms-empty">
              <div className="rooms-empty-icon">💬</div>
              <h3>No conversations</h3>
              <p>Start a direct message<br/>or create a group channel</p>
            </div>
          ) : filtered.map(room => {
            const { name, otherId } = getDisplay(room)
            const isOnline  = otherId ? onlineUsers.includes(otherId) : false
            const isActive  = activeRoom?._id === room._id

            return (
              <button key={room._id}
                className={`room-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="room-avatar" style={{ background: avatarColor(name) }}>
                  {initials(name)}
                  {room.type === 'private' && (
                    <span className={`status-pip ${isOnline ? 'on' : 'off'}`} />
                  )}
                </div>
                <div className="room-meta">
                  <div className="room-row">
                    <span className="room-name">{name}</span>
                    {room.lastActivity && (
                      <span className="room-time">
                        {formatDistanceToNow(new Date(room.lastActivity))}
                      </span>
                    )}
                  </div>
                  <span className="room-preview">{preview(room)}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-mini-avatar" style={{ background: avatarColor(user?.username) }}>
              {initials(user?.username)}
            </div>
            <div>
              <div className="user-mini-name">{user?.username}</div>
              <div className="user-mini-status">● Online</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {modal && (
        <NewRoomModal
          type={modal}
          onClose={() => setModal(null)}
          onCreated={(room) => { onRoomCreated(room); onSelectRoom(room); setModal(null) }}
        />
      )}
    </>
  )
}