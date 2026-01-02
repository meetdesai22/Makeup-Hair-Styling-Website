import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('config')
  const [config, setConfig] = useState({
    businessName: '',
    email: '',
    phone: '',
    location: '',
    instagram: '',
    heroImage: ''
  })
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/config', {
        credentials: 'include' // Important: include cookies
      })
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to load config')
      }
      const data = await res.json()
      setConfig(data)
      loadGallery()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    }
  }

  async function loadGallery() {
    try {
      const res = await fetch('/api/admin/gallery', {
        credentials: 'include' // Important: include cookies
      })
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Unauthorized')
      }
      const data = await res.json()
      setGallery(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading gallery:', error)
      setLoading(false)
    }
  }

  const handleConfigSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify(config)
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Error saving configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving configuration' })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include' // Important: include cookies
      })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </Head>
      <nav className="admin-nav">
        <div className="admin-nav-content">
          <h2><i className="fas fa-palette"></i> Admin Panel</h2>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="admin-sidebar">
          <ul className="admin-menu">
            <li>
              <a 
                href="#config" 
                className={`admin-menu-item ${activeSection === 'config' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveSection('config') }}
              >
                <i className="fas fa-cog"></i> Configuration
              </a>
            </li>
            <li>
              <a 
                href="#gallery" 
                className={`admin-menu-item ${activeSection === 'gallery' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveSection('gallery') }}
              >
                <i className="fas fa-images"></i> Gallery
              </a>
            </li>
            <li>
              <a 
                href="#password" 
                className={`admin-menu-item ${activeSection === 'password' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveSection('password') }}
              >
                <i className="fas fa-key"></i> Change Password
              </a>
            </li>
          </ul>
        </div>

        <div className="admin-content">
          {activeSection === 'config' && (
            <section id="config-section" className="admin-section active">
              <h2>Website Configuration</h2>
              <form onSubmit={handleConfigSubmit} className="admin-form">
                <div className="form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <input 
                    type="text" 
                    id="businessName" 
                    value={config.businessName}
                    onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input 
                    type="text" 
                    id="location" 
                    value={config.location}
                    onChange={(e) => setConfig({ ...config, location: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="instagram">Instagram URL</label>
                  <input 
                    type="url" 
                    id="instagram" 
                    value={config.instagram}
                    onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary">Save Configuration</button>
              </form>
              {message.text && (
                <div className={`form-message ${message.type}`} style={{ display: 'block' }}>
                  {message.text}
                </div>
              )}
            </section>
          )}

          {activeSection === 'gallery' && (
            <section id="gallery-section" className="admin-section active">
              <h2>Gallery Management</h2>
              <p>Gallery upload functionality coming soon. Use the API directly for now.</p>
              {loading ? (
                <p>Loading gallery...</p>
              ) : (
                <div>
                  <p>Total items: {gallery.length}</p>
                  {/* Gallery items display can be added here */}
                </div>
              )}
            </section>
          )}

          {activeSection === 'password' && (
            <section id="password-section" className="admin-section active">
              <h2>Change Password</h2>
              <p>Password change functionality coming soon. Use the API directly for now.</p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

