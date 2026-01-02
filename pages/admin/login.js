import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid password' })
        setLoading(false)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error logging in. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </Head>
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <i className="fas fa-lock"></i>
            <h1>Admin Login</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message.text && (
            <div className={`form-message ${message.type}`} style={{ display: 'block' }}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

