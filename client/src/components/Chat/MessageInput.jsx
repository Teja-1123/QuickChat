import { useState, useRef, useEffect } from 'react'
import { useSocket } from '../../context/SocketContext'
import api from '../../utils/api'

const ALLOWED_TYPES = [
  'image/jpeg','image/png','image/gif','image/webp',
  'application/pdf','text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]

export default function MessageInput({ onSend, roomId }) {
  const [text,     setText]     = useState('')
  const [preview,  setPreview]  = useState(null)  // { url?, name, file, isImage }
  const [uploading,setUploading]= useState(false)
  const [progress, setProgress] = useState(0)
  const [error,    setError]    = useState('')
  const fileRef    = useRef(null)
  const taRef      = useRef(null)
  const typingTimer= useRef(null)
  const { emit }   = useSocket()

  // Auto-resize textarea
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [text])

  const emitTyping = (value) => {
    setText(value)
    emit('typing:start', { roomId })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => emit('typing:stop', { roomId }), 1500)
  }

  useEffect(() => () => clearTimeout(typingTimer.current), [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() }
  }

  const sendText = () => {
    if (!text.trim()) return
    onSend({ content: text.trim(), type: 'text' })
    setText('')
    emit('typing:stop', { roomId })
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    if (!ALLOWED_TYPES.includes(file.type))
      return setError('File type not allowed.')
    if (file.size > 10 * 1024 * 1024)
      return setError('File exceeds 10 MB limit.')
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setPreview({ url: ev.target.result, name: file.name, file, isImage: true })
      reader.readAsDataURL(file)
    } else {
      setPreview({ name: file.name, file, isImage: false })
    }
  }

  const sendFile = async () => {
    if (!preview) return
    setUploading(true)
    setProgress(0)
    try {
      const fd = new FormData()
      fd.append('file', preview.file)
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round(e.loaded * 100 / e.total)),
      })
      onSend({
        content: text.trim(),
        type:    data.type,
        media:   { url: data.url, filename: data.filename, size: data.size, mimeType: data.mimeType },
      })
      setPreview(null)
      setText('')
    } catch { setError('Upload failed — try again.') }
    finally {
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="input-area">
      {error && <div className="input-error">{error}</div>}

      {/* File preview bar */}
      {preview && (
        <div className="file-preview-bar">
          {preview.isImage
            ? <img className="file-preview-img" src={preview.url} alt="preview" />
            : <div className="file-preview-info"><span>📎</span><span>{preview.name}</span></div>
          }
          <div className="file-preview-actions">
            {uploading ? (
              <div className="upload-progress-wrap">
                <div className="upload-bar-track">
                  <div className="upload-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            ) : (
              <>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={cancelPreview}>Cancel</button>
                <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={sendFile}>Send</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="input-row">
        <button className="attach-btn" title="Attach file"
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        <input ref={fileRef} type="file" hidden
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          onChange={handleFile} />

        <textarea ref={taRef} className="msg-textarea" rows={1}
          placeholder="Message… (Enter to send, Shift+Enter for new line)"
          value={text} onChange={e => emitTyping(e.target.value)}
          onKeyDown={handleKeyDown} disabled={uploading} />

        <button className="send-btn" onClick={sendText}
          disabled={!text.trim() || uploading}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}