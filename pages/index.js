import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  const [config, setConfig] = useState({
    businessName: 'Makeup by Khyati',
    email: 'contact@beautystudio.com',
    phone: '+1 (555) 123-4567',
    location: 'Your City, State',
    instagram: 'https://instagram.com/beautystudio',
    heroImage: ''
  })
  const [gallery, setGallery] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
    loadGallery()
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % gallery.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length)
  }

  const itemsPerView = typeof window !== 'undefined' && window.innerWidth <= 768 ? 2 : 3
  const offset = -(currentSlide * (100 / itemsPerView))

  return (
    <>
      <Head>
        <title>Makeup & Hair Styling - Professional Beauty Services</title>
      </Head>
      <Navbar businessName={config.businessName} activePage="" />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Your Look</h1>
          <p className="hero-subtitle">Professional Makeup & Hair Styling Services</p>
          <p className="hero-description">Bringing out your natural beauty with expert techniques and premium products</p>
          <div className="hero-buttons">
            <Link href="/booking" className="btn btn-primary">Book Appointment</Link>
            <Link href="/gallery" className="btn btn-secondary">View Gallery</Link>
          </div>
        </div>
        <div 
          className="hero-image" 
          id="hero-image-container"
          style={{
            backgroundImage: config.heroImage ? `url(${config.heroImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="hero-overlay"></div>
        </div>
      </section>

      {/* Gallery Carousel Section */}
      <section className="carousel-section">
        <div className="container">
          <h2 className="section-title">Featured Work</h2>
          <div className="carousel-container">
            <div className="carousel-wrapper">
              <div 
                className="carousel-track" 
                style={{ transform: `translateX(${offset}%)` }}
              >
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', width: '100%' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                    <p>Loading gallery...</p>
                  </div>
                ) : gallery.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)', width: '100%' }}>
                    <p>No gallery items yet.</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Upload images in the admin panel to see them here!</p>
                  </div>
                ) : (
                  gallery.map((item, index) => {
                    // Handle image paths: blob URLs, absolute paths, or relative paths
                    let imageSrc = item.image || ''
                    if (!imageSrc) return null
                    
                    // If it's already a full URL (blob storage), use it as is
                    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
                      // Use regular img for external URLs
                      return (
                        <div key={item.id || index} className="carousel-item">
                          <div>
                            <img 
                              src={imageSrc}
                              alt={item.title || 'Gallery image'}
                              loading={index < 3 ? 'eager' : 'lazy'}
                              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                      )
                    } else {
                      // For local images, ensure they start with /
                      if (!imageSrc.startsWith('/')) {
                        imageSrc = '/' + imageSrc
                      }
                      
                      return (
                        <div key={item.id || index} className="carousel-item">
                          <div>
                            <img 
                              src={imageSrc}
                              alt={item.title || 'Gallery image'}
                              loading={index < 3 ? 'eager' : 'lazy'}
                              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                      )
                    }
                  })
                )}
              </div>
            </div>
            {gallery.length > itemsPerView && (
              <>
                <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-palette"></i>
              </div>
              <h3>Makeup Services</h3>
              <p>Professional makeup application for weddings, events, photoshoots, and special occasions</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-scissors"></i>
              </div>
              <h3>Hair Styling</h3>
              <p>Expert hair styling, updos, braids, and hair extensions for any occasion</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-gem"></i>
              </div>
              <h3>Bridal Packages</h3>
              <p>Complete bridal makeup and hair packages with trial sessions included</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-camera-retro"></i>
              </div>
              <h3>Photoshoot Ready</h3>
              <p>Makeup and styling services tailored for professional photoshoots</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Me</h2>
              <p>With years of experience in the beauty industry, I specialize in creating stunning looks that enhance your natural features. Whether it's a glamorous evening look, a natural everyday style, or a complete bridal transformation, I'm here to make you feel confident and beautiful.</p>
              <p>I use only premium, high-quality products and stay updated with the latest trends and techniques in makeup and hair styling.</p>
              <div className="social-links">
                <a href={config.instagram} className="social-link" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                  <span>Follow on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Look Your Best?</h2>
          <p>Book your appointment today and let's create something beautiful together</p>
          <Link href="/booking" className="btn btn-primary btn-large">Book Your Appointment</Link>
        </div>
      </section>

      <Footer config={config} />
    </>
  )
}

