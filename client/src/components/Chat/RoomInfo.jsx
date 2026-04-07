import api from '../../utils/api'
import { useSocket } from '../../context/SocketContext'
import { avatarColor, initials } from '../../utils/helpers'

export default function RoomInfo({ room, onClose, currentUser }) {
  const { onlineUsers } = useSocket()

  const leave = async () => {
    if (!confirm('Leave this conversation?')) return
    try {
      await api.delete(`/rooms/${room._id}/leave`)
      window.location.reload()
    } catch (e) { console.error(e) }
  }

  const roomName = room.type === 'group'
    ? room.name
    : room.members?.find(m => m._id !== currentUser._id)?.username ?? 'Direct Message'

  return (
    <div className="room-info-panel">
      <div className="rip-header">
        <h3>Details</h3>
        <button className="icon-btn" onClick={onClose}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
      </div>

      <div className="rip-body">
        <div className="rip-avatar" style={{ background: avatarColor(roomName) }}>
          {initials(roomName)}
        </div>
        <div className="rip-name">{roomName}</div>

        {room.description && (
          <div className="rip-desc">{room.description}</div>
        )}

        <div className="rip-meta">
          <span>{room.type === 'group' ? '👥 Group' : '🔒 Private'}</span>
          <span>📅 {new Date(room.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="rip-section">
          <div className="rip-section-label">Members ({room.members?.length})</div>
          {room.members?.map(m => {
            const isOnline  = onlineUsers.includes(m._id)
            const isAdmin   = room.admins?.some(a => (a._id || a) === m._id)
            const isYou     = m._id === currentUser._id
            return (
              <div key={m._id} className="member-row">
                <div className="member-av" style={{ background: avatarColor(m.username) }}>
                  {m.avatar
                    ? <img src={m.avatar} alt={m.username} style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
                    : initials(m.username)
                  }
                  <span className={`status-pip ${isOnline ? 'on' : 'off'}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <span className="member-name">{m.username}{isYou ? ' (you)' : ''}</span>
                  <span className={`member-status ${isOnline ? 'on' : 'off'}`}>
                    {isOnline ? '● Online' : '● Offline'}
                  </span>
                </div>
                {isAdmin && <span className="admin-tag">Admin</span>}
              </div>
            )
          })}
        </div>

        {room.type === 'group' && (
          <button className="leave-btn" onClick={leave}>🚪 Leave Group</button>
        )}
      </div>
    </div>
  )
}