import { useState } from 'react'
import { format } from 'date-fns'
import { avatarColor, initials, fileSize } from '../../utils/helpers'

export default function MessageBubble({ message, isOwn, showAvatar, onReply, onDelete }) {
  const [showTime, setShowTime] = useState(false)

  if (message.type === 'system') {
    return (
      <div className="sys-msg">
        <span>{message.content}</span>
      </div>
    )
  }

  const sender    = message.sender
  const isDeleted = message.deleted

  const renderContent = () => {
    if (isDeleted) return <span style={{ opacity: .6, fontStyle: 'italic' }}>🚫 This message was deleted</span>

    if (message.type === 'image' && message.media?.url) {
      return (
        <div className="msg-image-wrap">
          <img className="msg-img"
            src={message.media.url}
            alt={message.media.filename || 'image'}
            onClick={() => window.open(message.media.url, '_blank')}
          />
          {message.content && <p className="msg-caption">{message.content}</p>}
        </div>
      )
    }

    if (message.type === 'file' && message.media?.url) {
      return (
        <a className="msg-file-card" href={message.media.url}
          target="_blank" rel="noreferrer" download={message.media.filename}
          style={{ color: isOwn ? 'var(--bg-900)' : 'var(--t100)', textDecoration: 'none' }}>
          <span className="msg-file-icon">📎</span>
          <div className="msg-file-info">
            <span className="msg-file-name">{message.media.filename}</span>
            <span className="msg-file-size">{fileSize(message.media.size)}</span>
          </div>
          <span className="msg-file-dl">↓</span>
        </a>
      )
    }

    return <p className="msg-text">{message.content}</p>
  }

  return (
    <div className={`msg-row ${isOwn ? 'own' : ''}`}>
      {/* Avatar (other users only) */}
      {!isOwn && (
        <div className="msg-sender-avatar"
          style={{ background: avatarColor(sender?.username), opacity: showAvatar ? 1 : 0 }}>
          {sender?.avatar
            ? <img src={sender.avatar} alt={sender.username} style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
            : initials(sender?.username)
          }
        </div>
      )}

      <div className="msg-body">
        {!isOwn && showAvatar && (
          <span className="msg-sender-name">{sender?.username}</span>
        )}

        {/* Reply reference */}
        {message.replyTo && (
          <div className="reply-ref">
            <span className="reply-ref-name">
              {message.replyTo.sender?.username || 'User'}
            </span>
            <span className="reply-ref-text">
              {message.replyTo.content?.slice(0, 60)}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div className={`msg-bubble ${isOwn ? 'own' : 'other'} ${isDeleted ? 'deleted' : ''}`}
          onClick={() => setShowTime(v => !v)}>
          {renderContent()}
        </div>

        {showTime && (
          <span className="msg-timestamp">
            {format(new Date(message.createdAt), 'HH:mm · MMM d')}
            {message.edited ? ' · edited' : ''}
          </span>
        )}
      </div>

      {/* Hover actions */}
      {!isDeleted && (
        <div className="msg-actions">
          <button className="msg-action-btn" onClick={onReply} title="Reply">↩</button>
          {isOwn && (
            <button className="msg-action-btn del" onClick={onDelete} title="Delete">
              <svg width="11" height="11" viewBox="0 0 20 20" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M8 6V4h8v2"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}