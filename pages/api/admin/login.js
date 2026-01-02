import { getPasswordHash } from '../../../lib/storage'
import bcrypt from 'bcrypt'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { password } = req.body
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' })
    }
    
    const hash = await getPasswordHash()
    const match = await bcrypt.compare(password, hash)
    
    if (match) {
      // Set session cookie - adjust Secure flag based on environment
      const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
      const cookieValue = Buffer.from(JSON.stringify({ authenticated: true, timestamp: Date.now() })).toString('base64')
      
      // Build cookie string
      let cookieString = `admin_session=${cookieValue}; HttpOnly; Path=/; Max-Age=86400`
      if (isProduction) {
        cookieString += '; Secure; SameSite=None'
      } else {
        cookieString += '; SameSite=Lax'
      }
      
      res.setHeader('Set-Cookie', cookieString)
      res.status(200).json({ success: true })
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Login error' })
  }
}

