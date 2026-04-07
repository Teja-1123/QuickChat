import { useState } from 'react'
import api from '../../utils/api'
import { avatarColor, initials } from '../../utils/helpers'

export default function NewRoomModal({ type, onClose, onCreated }) {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [selected,  setSelected]  = useState([])
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [searching, setSearching] = useState(false)

  const searchUsers = async (q) => {
    setQuery(q)
    if (!q.trim()) return setResults([])
    setSearching(true)
    try {
      const { data } = await api.get(`/auth/users/search?q=${encodeURIComponent(q)}`)
      setResults(data.users.filter(u => !selected.find(s => s._id === u._id)))
    } finally { setSearching(false) }
  }

  const toggle = (u) => {
    setSelected(prev => prev.find(x => x._id === u._id)
      ? prev.filter(x => x._id !== u._id)
      : [...prev, u]
    )
    setResults([])
    setQuery('')
  }

  const create = async () => {
    if (!selected.length) return
    setLoading(true)
    try {
      if (type === 'private') {
        const { data } = await api.post('/rooms/private', { userId: selected[0]._id })
        onCreated(data.room)
      } else {
        if (!groupName.trim()) return
        const { data } = await api.post('/rooms/group', {
          name: groupName,
          description: groupDesc,
          memberIds: selected.map(u => u._id),
        })
        onCreated(data.room)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const canSubmit = selected.length > 0 && (type === 'private' || groupName.trim())

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === 'private' ? '💬 New Direct Message' : '👥 New Group'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {type === 'group' && (
            <>
              <div>
                <label className="modal-label">Group Name *</label>
                <input className="modal-input" placeholder="e.g. Design Team"
                  value={groupName} onChange={e => setGroupName(e.target.value)} />
              </div>
              <div>
                <label className="modal-label">Description</label>
                <input className="modal-input" placeholder="What's this group about?"
                  value={groupDesc} onChange={e => setGroupDesc(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label className="modal-label">
              {type === 'private' ? 'Find User' : 'Add Members'}
            </label>
            <div className="modal-search-box">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none"
                stroke="var(--t400)" strokeWidth="2">
                <circle cx="9" cy="9" r="6"/><path d="m15 15 4 4"/>
              </svg>
              <input className="modal-search-input"
                placeholder="Search by username or email…"
                value={query} onChange={e => searchUsers(e.target.value)} />
            </div>
          </div>

          {selected.length > 0 && (
            <div className="chips-row">
              {selected.map(u => (
                <span key={u._id} className="chip">
                  {u.username}
                  <button onClick={() => toggle(u)}>×</button>
                </span>
              ))}
            </div>
          )}

          {searching && (
            <p style={{ fontSize: 12, color: 'var(--t300)', textAlign: 'center' }}>
              Searching…
            </p>
          )}

          {results.length > 0 && (
            <div className="user-results">
              {results.map(u => (
                <button key={u._id} className="user-result" onClick={() => toggle(u)}>
                  <div className="user-result-av" style={{ background: avatarColor(u.username) }}>
                    {initials(u.username)}
                  </div>
                  <div>
                    <div className="user-result-name">{u.username}</div>
                    <div className="user-result-email">{u.email}</div>
                  </div>
                  <span className="user-result-add">+</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={create}
            disabled={!canSubmit || loading}
            style={{ minWidth: 110 }}>
            {loading
              ? <span className="spinner" style={{ borderTopColor: 'var(--bg-900)' }} />
              : type === 'private' ? 'Start Chat' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}