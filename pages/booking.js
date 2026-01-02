import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Booking() {
  const [config, setConfig] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    message: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConfig()
    // Set minimum date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]
    const dateInput = document.getElementById('booking-date')
    if (dateInput) {
      dateInput.setAttribute('min', minDate)
    }
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

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Booking request submitted successfully!' })
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          service: '',
          message: ''
        })
      } else {
        setMessage({ type: 'error', text: data.message || 'Error submitting booking request' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error submitting booking request. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Book Appointment - Makeup & Hair Styling</title>
      </Head>
      <Navbar businessName={config.businessName || 'Beauty Studio'} activePage="booking" />
      
      <section className="page-header">
        <div className="container">
          <h1>Book Your Appointment</h1>
          <p>Fill out the form below to request your booking</p>
        </div>
      </section>

      <section className="booking-section">
        <div className="container">
          <div className="booking-wrapper">
            <div className="booking-info">
              <h2>Booking Information</h2>
              <div className="info-card">
                <i className="fas fa-clock"></i>
                <h3>Available Hours</h3>
                <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                <p>Sunday: By appointment only</p>
              </div>
              <div className="info-card">
                <i className="fas fa-calendar-check"></i>
                <h3>Booking Process</h3>
                <p>1. Fill out the booking form</p>
                <p>2. We'll confirm your appointment</p>
                <p>3. You'll receive a confirmation email</p>
              </div>
              <div className="info-card">
                <i className="fas fa-info-circle"></i>
                <h3>Important Notes</h3>
                <p>• Please book at least 48 hours in advance</p>
                <p>• Cancellations must be made 24 hours prior</p>
                <p>• Trial sessions available for bridal packages</p>
              </div>
            </div>
            <div className="booking-form-wrapper">
              <h2>Appointment Request</h2>
              <form className="booking-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="booking-name">Full Name *</label>
                  <input 
                    type="text" 
                    id="booking-name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-email">Email Address *</label>
                  <input 
                    type="email" 
                    id="booking-email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-phone">Phone Number *</label>
                  <input 
                    type="tel" 
                    id="booking-phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-date">Preferred Date *</label>
                  <input 
                    type="date" 
                    id="booking-date" 
                    name="date" 
                    value={formData.date}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-time">Preferred Time *</label>
                  <select 
                    id="booking-time" 
                    name="time" 
                    value={formData.time}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="booking-service">Service Type *</label>
                  <select 
                    id="booking-service" 
                    name="service" 
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="Makeup Only">Makeup Only</option>
                    <option value="Hair Styling Only">Hair Styling Only</option>
                    <option value="Makeup + Hair">Makeup + Hair</option>
                    <option value="Bridal Package">Bridal Package</option>
                    <option value="Bridal Trial">Bridal Trial</option>
                    <option value="Photoshoot Makeup">Photoshoot Makeup</option>
                    <option value="Event Makeup">Event Makeup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="booking-additional-message">Additional Message</label>
                  <textarea 
                    id="booking-additional-message" 
                    name="message" 
                    rows="4" 
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any special requests or details about your event..."
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
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

      <Footer config={config} />
    </>
  )
}

