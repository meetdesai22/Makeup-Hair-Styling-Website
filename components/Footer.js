import Link from 'next/link'

export default function Footer({ config = {} }) {
  const {
    businessName = 'Beauty Studio',
    email = 'contact@beautystudio.com',
    phone = '+1 (555) 123-4567',
    location = 'Your City, State',
    instagram = 'https://instagram.com/beautystudio'
  } = config

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{businessName}</h3>
            <p>Professional makeup and hair styling services</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/booking">Booking</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p><i className="fas fa-envelope"></i> <span id="footer-email">{email}</span></p>
            <p><i className="fas fa-phone"></i> <span id="footer-phone">{phone}</span></p>
            <p><i className="fas fa-map-marker-alt"></i> <span id="footer-location">{location}</span></p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href={instagram} id="footer-instagram" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

