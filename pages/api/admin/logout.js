export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Clear session cookie - adjust Secure flag based on environment
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  let cookieString = 'admin_session=; HttpOnly; Path=/; Max-Age=0'
  if (isProduction) {
    cookieString += '; Secure; SameSite=None'
  } else {
    cookieString += '; SameSite=Lax'
  }
  
  res.setHeader('Set-Cookie', cookieString)
  res.status(200).json({ success: true })
}

