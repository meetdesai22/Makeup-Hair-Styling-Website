import { getGallery, saveGallery, uploadFile, deleteFile } from '../../../lib/storage'

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
  if (!requireAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const gallery = await getGallery()
      res.status(200).json(gallery)
    } catch (error) {
      console.error('Error getting admin gallery:', error)
      res.status(500).json({ error: 'Failed to load gallery' })
    }
  } else if (req.method === 'POST') {
    // File upload handling would go here
    // For now, return not implemented
    res.status(501).json({ error: 'File upload not yet implemented in Next.js API route' })
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    try {
      const gallery = await getGallery()
      const item = gallery.find(i => i.id === id)
      
      if (item && item.image) {
        try {
          await deleteFile(item.image)
        } catch (error) {
          console.warn('Error deleting image file:', error)
        }
      }

      const filtered = gallery.filter(i => i.id !== id)
      await saveGallery(filtered)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

