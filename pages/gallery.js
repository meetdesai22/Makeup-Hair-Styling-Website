import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Gallery() {
  const [gallery, setGallery] = useState([])
  const [filter, setFilter] = useState('all')
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGallery()
    loadConfig()
  }, [])

  async function loadGallery() {
    try {
      const res = await fetch('/api/gallery')
      const data = await res.json()
      setGallery(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading gallery:', error)
      setLoading(false)
    }
  }

  async function loadConfig() {
    try {
      const res = await fetch('/api/config')
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const filteredGallery = filter === 'all' 
    ? gallery 
    : gallery.filter(item => item.category === filter)

  return (
    <>
      <Head>
        <title>Gallery - Makeup & Hair Styling</title>
      </Head>
      <Navbar businessName={config.businessName || 'Makeup by Khyati'} activePage="gallery" />
      
      <section className="page-header">
        <div className="container">
          <h1>Our Work</h1>
          <p>Showcasing beautiful transformations and stunning looks</p>
        </div>
      </section>

      <section className="gallery-section">
        <div className="container">
          <div className="gallery-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'makeup' ? 'active' : ''}`}
              onClick={() => setFilter('makeup')}
            >
              Makeup
            </button>
            <button 
              className={`filter-btn ${filter === 'hair' ? 'active' : ''}`}
              onClick={() => setFilter('hair')}
            >
              Hair Styling
            </button>
            <button 
              className={`filter-btn ${filter === 'bridal' ? 'active' : ''}`}
              onClick={() => setFilter('bridal')}
            >
              Bridal
            </button>
            <button 
              className={`filter-btn ${filter === 'photoshoot' ? 'active' : ''}`}
              onClick={() => setFilter('photoshoot')}
            >
              Photoshoot
            </button>
          </div>

          <div className="gallery-grid">
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading gallery...</p>
              </div>
            ) : filteredGallery.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                <p>No items found in this category.</p>
              </div>
            ) : (
              filteredGallery.map((item) => {
                // Handle image paths: blob URLs, absolute paths, or relative paths
                let imageSrc = item.image || ''
                if (!imageSrc) return null
                
                // If it's already a full URL (blob storage), use it as is
                if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://') && !imageSrc.startsWith('/')) {
                  // Add leading slash for relative paths
                  imageSrc = '/' + imageSrc
                }
                
                return (
                  <div key={item.id} className="gallery-item">
                    <div className="gallery-image">
                      <img 
                        src={imageSrc}
                        alt={item.title || 'Gallery image'}
                        loading="lazy"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      <div className="gallery-overlay">
                        <h3>{item.title || 'Gallery Item'}</h3>
                        <p>{item.category || 'all'}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Love What You See?</h2>
          <p>Book your appointment and let's create your perfect look</p>
          <Link href="/booking" className="btn btn-primary btn-large">Book Now</Link>
        </div>
      </section>

      <Footer config={config} />
    </>
  )
}

