import { getConfig } from '../../lib/storage'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const config = await getConfig()
    res.status(200).json(config)
  } catch (error) {
    console.error('Error getting config:', error)
    res.status(500).json({ error: 'Failed to load configuration' })
  }
}

