
// export default AuthPage;
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AuthPage() {
  const [mode,    setMode]    = useState('login')
  const [form,    setForm]    = useState({ username: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.username, form.email, form.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => { setMode(m); setError('') }

  return (
    <div className="auth-page">
      <div className="auth-noise" />
      <div className="auth-glow" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div className="auth-logo-text">
            <h1>QuickChat</h1>
            <p>Real-time messaging, reimagined</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}>Sign In</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}>Create Account</button>
          <div className="auth-tab-slider"
            style={{ left: mode === 'login' ? '4px' : 'calc(50% + 2px)' }} />
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <div className="field">
              <label>Username</label>
              <input type="text" placeholder="cooluser42"
                value={form.username} onChange={set('username')} required minLength={3} />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading
              ? <span className="spinner" />
              : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}