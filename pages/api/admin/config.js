import { getConfig, saveConfig } from '../../../lib/storage'

function getSession(req) {
  const cookie = req.headers.cookie
  if (!cookie) return null
  const sessionCookie = cookie.split(';').find(c => c.trim().startsWith('admin_session='))
  if (!sessionCookie) return null
  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.split('=')[1], 'base64').toString())
    return sessionData
  } catch {
    return null
  }
}

function requireAuth(req) {
  const session = getSession(req)
  return session && session.authenticated
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!requireAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    try {
      const config = await getConfig()
      res.status(200).json(config)
    } catch (error) {
      console.error('Error getting admin config:', error)
      res.status(500).json({ error: 'Failed to load configuration' })
    }
  } else if (req.method === 'POST') {
    if (!requireAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    try {
      await saveConfig(req.body)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error saving config:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

