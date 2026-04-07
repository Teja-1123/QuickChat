import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

export function useMessages(roomId) {
  const [messages,    setMessages]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [hasMore,     setHasMore]     = useState(false)
  const [page,        setPage]        = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const { user }    = useAuth()
  const { on, off, emit } = useSocket()
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const fetchMessages = useCallback(async (rid, pg = 1, append = false) => {
    if (!rid) return
    pg === 1 ? setLoading(true) : setLoadingMore(true)
    try {
      const { data } = await api.get(`/messages/${rid}?page=${pg}&limit=50`)
      if (!mounted.current) return
      setMessages(prev => append ? [...data.messages, ...prev] : data.messages)
      setHasMore(data.pagination.hasMore)
      setPage(pg)
    } finally {
      if (!mounted.current) return
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (!roomId) return
    setMessages([])
    fetchMessages(roomId, 1, false)
    emit('room:join',     { roomId })
    emit('messages:read', { roomId })
  }, [roomId, fetchMessages, emit])

  // Live socket events
  useEffect(() => {
    if (!roomId) return
    const onNew = ({ message, roomId: rid }) => {
      if (rid !== roomId) return
      setMessages(prev => [...prev, message])
      emit('messages:read', { roomId })
    }
    const onDeleted = ({ messageId }) => {
      setMessages(prev =>
        prev.map(m => m._id === messageId
          ? { ...m, deleted: true, content: 'This message was deleted', media: undefined }
          : m
        )
      )
    }
    on('message:new',     onNew)
    on('message:deleted', onDeleted)
    return () => { off('message:new', onNew); off('message:deleted', onDeleted) }
  }, [roomId, on, off, emit])

  const loadMore     = () => { if (!loadingMore && hasMore) fetchMessages(roomId, page + 1, true) }
  const sendMessage  = (payload) => emit('message:send', { roomId, ...payload })
  const deleteMsg    = (messageId) => emit('message:delete', { messageId, roomId })

  return { messages, loading, hasMore, loadingMore, loadMore, sendMessage, deleteMsg }
}