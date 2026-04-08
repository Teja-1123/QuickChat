import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token } = useAuth()
  const socketRef  = useRef(null)
  const [connected,   setConnected]   = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    const socket = io(
      import.meta.env.VITE_API_URL,
      { auth: { token }, transports: ['websocket', 'polling'] }
    )

    socket.on('connect',       ()      => setConnected(true))
    socket.on('disconnect',    ()      => setConnected(false))
    socket.on('users:online',  (users) => setOnlineUsers(users))
    socket.on('user:status',   ({ userId, status }) => {
      setOnlineUsers(prev =>
        status === 'online'
          ? prev.includes(userId) ? prev : [...prev, userId]
          : prev.filter(id => id !== userId)
      )
    })

    socketRef.current = socket
    return () => socket.disconnect()
  }, [token])

  const emit = (event, data) => socketRef.current?.emit(event, data)
  const on   = (event, cb)   => socketRef.current?.on(event, cb)
  const off  = (event, cb)   => socketRef.current?.off(event, cb)

  return (
    <SocketContext.Provider value={{ connected, onlineUsers, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}