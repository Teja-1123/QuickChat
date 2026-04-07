import { useState, useEffect, useRef } from 'react'
import { useAuth }    from '../../context/AuthContext'
import { useSocket }  from '../../context/SocketContext'
import { useMessages } from '../../hooks/useMessages'
import { avatarColor, initials } from '../../utils/helpers'
import MessageBubble from './MessageBubble'
import MessageInput  from './MessageInput'
import RoomInfo      from './RoomInfo'

export default function ChatWindow({ room, onBack }) {
  const { user }             = useAuth()
  const { onlineUsers, on, off } = useSocket()
  const { messages, loading, hasMore, loadingMore, loadMore, sendMessage, deleteMsg }
    = useMessages(room._id)

  const [typingUsers, setTypingUsers] = useState([])
  const [replyTo,     setReplyTo]     = useState(null)
  const [showInfo,    setShowInfo]    = useState(false)
  const bottomRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Reset state when room changes
  useEffect(() => {
    setTypingUsers([])
    setReplyTo(null)
    setShowInfo(false)
  }, [room._id])

  // Typing events
  useEffect(() => {
    const onStart = ({ userId, username, roomId }) => {
      if (roomId !== room._id || userId === user._id) return
      setTypingUsers(p => p.includes(username) ? p : [...p, username])
    }
    const onStop = ({ userId, roomId }) => {
      if (roomId !== room._id) return
      setTypingUsers(p => p.filter(u => u !== userId))
    }
    on('typing:start', onStart)
    on('typing:stop',  onStop)
    return () => { off('typing:start', onStart); off('typing:stop', onStop) }
  }, [room._id, user._id, on, off])

  const otherUser = room.type === 'private'
    ? room.members?.find(m => m._id !== user._id)
    : null

  const roomName = otherUser?.username ?? room.name ?? 'Chat'
  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false

  const handleSend = (payload) => {
    sendMessage({ ...payload, replyTo: replyTo?._id })
    setReplyTo(null)
  }

  return (
    <div className="chat-window">
      {/* ── Header ── */}
      <div className="chat-header">
        <div className="chat-header-left">
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          )}
          <div className="chat-header-avatar"
            style={{ background: avatarColor(roomName) }}>
            {initials(roomName)}
            {room.type === 'private' && (
              <span className={`status-pip ${isOnline ? 'on' : 'off'}`} />
            )}
          </div>
          <div>
            <div className="chat-header-name">{roomName}</div>
            <div className={`chat-header-sub ${isOnline ? 'online' : ''}`}>
              {room.type === 'group'
                ? `${room.members?.length ?? 0} members`
                : isOnline ? '● Online' : '● Offline'
              }
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="icon-btn" onClick={() => setShowInfo(v => !v)} title="Room info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8"  x2="12" y2="8"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="messages-area">
        {hasMore && (
          <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : '↑ Load earlier messages'}
          </button>
        )}

        {loading ? (
          <div className="msg-skeletons">
            {[55, 70, 40, 65, 50].map((w, i) => (
              <div key={i} className={`skeleton msg-sk ${i % 2 ? 'r' : ''}`}
                style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="msgs-empty">
            <div className="msgs-empty-avatar" style={{ background: avatarColor(roomName) }}>
              {initials(roomName)}
            </div>
            <h3>Start chatting with {roomName}</h3>
            <p>No messages yet — say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prev = messages[idx - 1]
            const showAvatar = !prev || prev.sender?._id !== msg.sender?._id
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender?._id === user._id}
                showAvatar={showAvatar}
                onReply={() => setReplyTo(msg)}
                onDelete={() => deleteMsg(msg._id)}
              />
            )
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-row">
            <div className="typing-dots">
              <span /><span /><span />
            </div>
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Reply bar ── */}
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-bar-content">
            <span className="reply-bar-label">↩ Replying to {replyTo.sender?.username}</span>
            <span className="reply-bar-text">{replyTo.content?.slice(0, 80)}</span>
          </div>
          <button className="reply-bar-close" onClick={() => setReplyTo(null)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Input ── */}
      <MessageInput onSend={handleSend} roomId={room._id} />

      {/* ── Info panel ── */}
      {showInfo && (
        <RoomInfo room={room} onClose={() => setShowInfo(false)} currentUser={user} />
      )}
    </div>
  )
}