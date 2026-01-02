import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import fs from 'fs'
import path from 'path'

export default function EditConfig() {
  const router = useRouter()
  const [config, setConfig] = useState({
    businessName: '',
    email: '',
    phone: '',
    location: '',
    instagram: '',
    heroImage: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const res = await fetch('/api/config')
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Edit Configuration</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </Head>
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
        <h1>Edit Website Configuration</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Update your website name, contact information, and other settings.
        </p>

        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="businessName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              value={config.businessName}
              onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Location
            </label>
            <input
              type="text"
              id="location"
              value={config.location}
              onChange={(e) => setConfig({ ...config, location: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="instagram" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Instagram URL
            </label>
            <input
              type="url"
              id="instagram"
              value={config.instagram}
              onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#d4af37',
              color: '#fff',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>

        {message.text && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '4px',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0 }}>Alternative: Edit Config File Directly</h3>
          <p>If the admin panel isn't working, you can edit the config file directly:</p>
          <ol>
            <li>Open <code>data/config.json</code> in your code editor</li>
            <li>Edit the values</li>
            <li>Save the file</li>
            <li>Restart your development server or redeploy</li>
          </ol>
        </div>
      </div>
    </>
  )
}

