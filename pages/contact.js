import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Contact() {
  const [config, setConfig] = useState({
    email: 'khyatiadedhia@gmail.com',
    phone: '+1 (647)-213-8054',
    location: 'Toronto, ON',
    instagram: 'https://instagram.com/makeupandhairbykhyati'
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
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
      setConfig({
        ...config,
        ...data
      })
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // For now, just show success message
    // You can add a contact API endpoint later if needed
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Thank you for your message! We\'ll get back to you soon.' })
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <>
      <Head>
        <title>Contact - Makeup & Hair Styling</title>
      </Head>
      <Navbar businessName={config.businessName || 'Makeup by Khyati'} activePage="contact" />
      
      <section className="page-header">
        <div className="container">
          <h1>Get In Touch</h1>
          <p>I'd love to hear from you. Let's connect!</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info">
              <h2>Contact Information</h2>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p id="contact-email">{config.email}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p id="contact-phone">{config.phone}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="contact-details">
                  <h3>Location</h3>
                  <p id="contact-location">{config.location}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fab fa-instagram"></i>
                </div>
                <div className="contact-details">
                  <h3>Instagram</h3>
                  <p>
                    <a href={config.instagram} id="contact-instagram" target="_blank" rel="noopener noreferrer">
                      @makeupandhairbykhyati
                    </a>
                  </p>
                </div>
              </div>
              <div className="social-links-contact">
                <a href={config.instagram} id="contact-instagram-link" className="social-link-large" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                  <span>Follow on Instagram</span>
                </a>
              </div>
            </div>
            <div className="contact-form-wrapper">
              <h2>Send a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
              {message.text && (
                <div className={`form-message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <h2>Find Us</h2>
          <div className="map-placeholder">
            <i className="fas fa-map-marked-alt"></i>
            <p>Map integration can be added here (Google Maps, etc.)</p>
            <p id="map-location">{config.location}</p>
          </div>
        </div>
      </section>

      <Footer config={config} />
    </>
  )
}

