# Complete Deployment Guide

This guide will help you deploy your website to Vercel with full functionality including database, file storage, and admin panel.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier works)
3. Your code pushed to GitHub

## Step 1: Set Up Vercel KV (Database)

Vercel KV is a Redis-compatible database for storing your configuration, gallery, and password data.

### In Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to **Storage** → **Create Database**
3. Select **KV** (Redis)
4. Choose a name (e.g., `website-kv`)
5. Select a region close to your users
6. Click **Create**

Vercel will automatically add these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Step 2: Set Up Vercel Blob Storage (File Uploads)

Vercel Blob Storage is for storing uploaded images (gallery and hero images).

### In Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to **Storage** → **Create Database**
3. Select **Blob**
4. Choose a name (e.g., `website-blob`)
5. Click **Create**

Vercel will automatically add this environment variable:
- `BLOB_READ_WRITE_TOKEN`

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

### Required:
- `SESSION_SECRET` - A random secret string (generate with: `openssl rand -base64 32`)

### Optional (for booking functionality):
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Gmail App Password (not your regular password)
- `GOOGLE_SHEETS_CREDENTIALS` - JSON string of Google service account credentials
- `GOOGLE_SHEET_ID` - Your Google Sheet ID

**Note:** KV and Blob tokens are automatically added by Vercel - you don't need to set them manually.

## Step 4: Deploy

1. Push your code to GitHub
2. Vercel will automatically detect the push and deploy
3. Or manually trigger a deployment from the Vercel dashboard

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Test the admin panel at `/admin`
   - Default password: `admin123` (change this immediately!)
3. Upload a test image to verify blob storage works
4. Check that configuration saves persist

## Local Development

For local development, the app will automatically use filesystem storage:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

3. Set `SESSION_SECRET` in `.env` (other vars optional for local dev)

4. Run locally:
   ```bash
   npm start
   ```

The app will use:
- Filesystem for data storage (`/data` directory)
- Filesystem for file uploads (`/public/uploads` directory)
- Memory store for sessions

## Migration from Local to Vercel

If you have existing data in your local `/data` directory:

1. **Export your data:**
   ```bash
   # Your config.json, gallery.json, and password.json are in /data
   ```

2. **After deploying to Vercel:**
   - Log into admin panel
   - Re-enter your configuration
   - Re-upload your gallery images
   - Change your password

3. **Or use Vercel KV CLI** (advanced):
   ```bash
   npm install -g @vercel/kv
   # Import your data to KV
   ```

## Troubleshooting

### Admin Panel Not Working

- **Sessions not persisting:** Make sure Vercel KV is set up and environment variables are configured
- **Can't log in:** Check that `SESSION_SECRET` is set in Vercel environment variables

### File Uploads Not Working

- **Images not saving:** Verify Vercel Blob Storage is set up
- **404 on images:** Check that `BLOB_READ_WRITE_TOKEN` is set (auto-set by Vercel)

### Data Not Persisting

- **Changes lost:** Ensure Vercel KV is properly configured
- **Check logs:** Go to Vercel dashboard → Functions → View logs

## Architecture Overview

### Storage Layer (`lib/storage.js`)
- **Production (Vercel):** Uses Vercel KV for data, Vercel Blob for files
- **Development (Local):** Uses filesystem (`/data` and `/public/uploads`)

### Session Management (`lib/session-store.js`)
- **Production (Vercel):** Uses Redis via Vercel KV
- **Development (Local):** Uses in-memory store

### Benefits
- ✅ Works seamlessly in both local and production
- ✅ No code changes needed between environments
- ✅ Automatic fallback to filesystem if cloud services unavailable
- ✅ Scalable and production-ready

## Cost Considerations

### Vercel Free Tier Includes:
- **KV:** 256 MB storage, 30K reads/day, 30K writes/day
- **Blob:** 1 GB storage, 1M reads/month, 1M writes/month

For most small-to-medium websites, the free tier is sufficient.

## Security Notes

1. **Change default password immediately** after first deployment
2. **Use strong SESSION_SECRET** (32+ random characters)
3. **Never commit `.env` file** to Git
4. **Use environment variables** in Vercel dashboard, not in code

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables are set
3. Ensure KV and Blob storage are created
4. Check that dependencies are installed (`npm install`)

