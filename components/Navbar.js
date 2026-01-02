import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar({ businessName = 'Makeup by Khyati', activePage = '' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <i className="fas fa-paint-brush"></i>
          <span className="logo-text">{businessName}</span>
        </div>
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link href="/" className={activePage === '' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/gallery" className={activePage === 'gallery' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/contact" className={activePage === 'contact' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </li>
          <li>
            <Link href="/booking" className={`btn-booking ${activePage === 'booking' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Book Now
            </Link>
          </li>
        </ul>
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  )
}

