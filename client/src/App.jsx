import { useState }   from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider }        from './context/SocketContext'
import { useRooms }              from './hooks/useRooms'
import AuthPage   from './components/Auth/AuthPage'
import Sidebar    from './components/Chat/Sidebar'
import ChatWindow from './components/Chat/ChatWindow'

/* ─── Inner app (authenticated) ─── */
function ChatApp() {
  const { rooms, loading: roomsLoading, addRoom } = useRooms()
  const [activeRoom,  setActiveRoom]  = useState(null)
  const [mobileView,  setMobileView]  = useState('sidebar') // 'sidebar' | 'chat'

  const selectRoom = (room) => {
    setActiveRoom(room)
    setMobileView('chat')
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className={`sidebar-slot ${mobileView === 'chat' ? 'mobile-hidden' : ''}`}>
        {roomsLoading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 12px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--amber-dim)' }} />
              <div className="skeleton" style={{ width: 80, height: 16, borderRadius: 6 }} />
            </div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="skeleton skeleton-room" />
            ))}
          </div>
        ) : (
          <Sidebar
            rooms={rooms}
            activeRoom={activeRoom}
            onSelectRoom={selectRoom}
            onRoomCreated={addRoom}
          />
        )}
      </div>

      {/* Main chat area */}
      <div className={`main-slot ${mobileView === 'sidebar' ? 'mobile-hidden' : ''}`}>
        {activeRoom ? (
          <ChatWindow
            key={activeRoom._id}
            room={activeRoom}
            onBack={() => setMobileView('sidebar')}
          />
        ) : (
          <div className="welcome">
            <div className="welcome-inner">
              <div className="welcome-icon">⚡</div>
              <h2>Welcome to QuickChat</h2>
              <p>Pick a conversation from the sidebar, or start a new one.</p>
              <div className="welcome-hints">
                <div className="welcome-hint">
                  <span>💬</span>
                  <span>Direct message anyone on the platform</span>
                </div>
                <div className="welcome-hint">
                  <span>👥</span>
                  <span>Create group channels for teams</span>
                </div>
                <div className="welcome-hint">
                  <span>📎</span>
                  <span>Share images and files up to 10 MB</span>
                </div>
                <div className="welcome-hint">
                  <span>⚡</span>
                  <span>Real-time updates via WebSockets</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Auth gate ─── */
function AppGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-icon">⚡</div>
        <div className="app-loading-name">QuickChat</div>
      </div>
    )
  }

  return user ? <ChatApp /> : <AuthPage />
}

/* ─── Root with providers ─── */
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppGate />
      </SocketProvider>
    </AuthProvider>
  )
}