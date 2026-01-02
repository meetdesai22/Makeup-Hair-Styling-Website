import { getConfig } from '../../lib/storage'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

async function sendBookingEmail(bookingData, config) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: config.email || process.env.EMAIL_USER,
    subject: `New Booking Request from ${bookingData.name}`,
    html: `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${bookingData.name}</p>
      <p><strong>Email:</strong> ${bookingData.email}</p>
      <p><strong>Phone:</strong> ${bookingData.phone}</p>
      <p><strong>Date:</strong> ${bookingData.date}</p>
      <p><strong>Time:</strong> ${bookingData.time}</p>
      <p><strong>Service:</strong> ${bookingData.service}</p>
      <p><strong>Message:</strong> ${bookingData.message || 'N/A'}</p>
    `
  }

  await transporter.sendMail(mailOptions)
}

async function logToGoogleSheets(bookingData) {
  if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
    throw new Error('Google Sheets credentials not configured')
  }

  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS)
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const values = [[
    new Date().toISOString(),
    bookingData.name,
    bookingData.email,
    bookingData.phone,
    bookingData.date,
    bookingData.time,
    bookingData.service,
    bookingData.message || ''
  ]]

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: 'Bookings!A:H',
    valueInputOption: 'USER_ENTERED',
    resource: { values }
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, phone, date, time, service, message } = req.body

    if (!name || !email || !phone || !date || !time || !service) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      })
    }

    const results = []
    const config = await getConfig()
    
    // Send email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendBookingEmail({ name, email, phone, date, time, service, message }, config)
        results.push('email sent')
      } catch (error) {
        console.error('Email error:', error)
        results.push('email failed')
      }
    }

    // Log to Google Sheets
    if (process.env.GOOGLE_SHEETS_CREDENTIALS && process.env.GOOGLE_SHEET_ID) {
      try {
        await logToGoogleSheets({ name, email, phone, date, time, service, message })
        results.push('sheet updated')
      } catch (error) {
        console.error('Google Sheets error:', error)
        results.push('sheet failed')
      }
    }

    if (results.length === 0) {
      console.log('New booking request (no email/sheets configured):', { name, email, phone, date, time, service, message })
    }

    res.status(200).json({ success: true, message: 'Booking request submitted successfully!' })
  } catch (error) {
    console.error('Booking error:', error)
    res.status(500).json({ success: false, message: 'Error processing booking request' })
  }
}

