import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { useSocket } from '../context/SocketContext'

export function useRooms() {
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const { on, off } = useSocket()

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await api.get('/rooms')
      setRooms(data.rooms)
    } catch (e) {
      console.error('useRooms:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  // Keep sidebar previews fresh on new messages
  useEffect(() => {
    const handler = ({ message, roomId }) => {
      setRooms(prev =>
        prev
          .map(r => r._id === roomId
            ? { ...r, lastMessage: message, lastActivity: message.createdAt }
            : r
          )
          .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      )
    }
    on('message:new', handler)
    return () => off('message:new', handler)
  }, [on, off])

  const addRoom = (room) =>
    setRooms(prev => prev.find(r => r._id === room._id) ? prev : [room, ...prev])

  return { rooms, loading, addRoom, refetch: fetchRooms }
}