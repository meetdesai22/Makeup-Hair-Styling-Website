import { getGallery } from '../../lib/storage'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const gallery = await getGallery()
    const galleryWithPaths = gallery.map(item => ({
      ...item,
      image: item.image && (item.image.startsWith('http') || item.image.startsWith('/')) 
        ? item.image 
        : '/' + (item.image || '')
    }))
    res.status(200).json(galleryWithPaths)
  } catch (error) {
    console.error('Error getting gallery:', error)
    res.status(500).json({ error: 'Failed to load gallery' })
  }
}

