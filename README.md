# Makeup & Hair Styling Website

A beautiful, dynamic website for a makeup and hair styling freelancer built with Node.js and Express.

## Features

- **Home Page**: Showcase services and information
- **Gallery**: Filterable gallery to showcase client work
- **Contact Page**: Contact information and message form
- **Booking System**: Appointment booking with email notifications and Google Sheets integration
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Beautiful, professional design

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (copy from `env.example`):
   ```bash
   cp env.example .env
   ```

4. Configure your `.env` file with your settings:
   - **Email**: Set up Gmail credentials for booking notifications
   - **Google Sheets** (optional): Configure for automatic booking logging

## Email Setup

To enable email notifications for bookings:

1. Use a Gmail account
2. Enable "Less secure app access" or better yet, use an "App Password":
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Generate an App Password
   - Use this App Password in your `.env` file

## Google Sheets Setup (Optional)

To log bookings to Google Sheets:

1. Create a Google Cloud Project
2. Enable the Google Sheets API
3. Create a Service Account
4. Download the credentials JSON file
5. Share your Google Sheet with the service account email
6. Create a sheet named "Bookings" with headers: Timestamp, Name, Email, Phone, Date, Time, Service, Message
7. Add the credentials to your `.env` file

## Running the Application

### Local Development

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The website will be available at `http://localhost:3001`

**Note:** Local development uses filesystem storage (`/data` directory) and memory sessions.

### Production Deployment (Vercel)

This application is configured for deployment on Vercel with:
- **Vercel KV** for data storage (config, gallery, passwords)
- **Vercel Blob Storage** for file uploads
- **Redis sessions** for persistent authentication

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

Quick steps:
1. Set up Vercel KV and Blob Storage in Vercel dashboard
2. Configure environment variables
3. Deploy from GitHub

## Customization

### Contact Information

You can customize contact information by editing the JavaScript in `public/script.js` or by updating the HTML directly in the respective pages.

### Instagram Link

Update the Instagram URL in `public/script.js` in the `loadConfiguration()` function.

### Gallery Images

Replace the placeholder gallery items in `public/gallery.html` with actual images. You can:
- Add images to a `public/images/` folder
- Update the `gallery-item` divs with actual image tags
- Or keep the placeholder gradients for now

### Styling

All styles are in `public/styles.css`. The color scheme uses CSS variables defined at the top of the file, making it easy to customize.

## Project Structure

```
Website/
├── server.js              # Express server for local development
├── api/
│   └── index.js          # Serverless function for Vercel
├── lib/
│   ├── storage.js        # Storage abstraction (KV/Blob/filesystem)
│   └── session-store.js  # Session store (Redis/memory)
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
├── .env.example          # Environment variables template
├── public/
│   ├── index.html        # Home page
│   ├── gallery.html      # Gallery page
│   ├── contact.html      # Contact page
│   ├── booking.html      # Booking page
│   ├── admin/            # Admin panel
│   ├── styles.css        # All styles
│   ├── script.js         # Main JavaScript
│   ├── gallery.js        # Gallery functionality
│   ├── contact.js        # Contact form handling
│   └── booking.js        # Booking form handling
├── DEPLOYMENT_GUIDE.md   # Complete deployment instructions
└── README.md             # This file
```

## API Endpoints

- `POST /api/booking` - Submit a booking request
  - Body: `{ name, email, phone, date, time, service, message }`
  - Returns: `{ success: boolean, message: string }`

## License

ISC

## Support

For issues or questions, please contact the developer.

