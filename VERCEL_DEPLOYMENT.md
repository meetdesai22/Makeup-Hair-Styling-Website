# Vercel Deployment Guide

## Important Notes

### File System Limitations
⚠️ **CRITICAL**: Vercel's serverless functions have a **read-only filesystem** (except `/tmp`). This means:

1. **File uploads won't persist**: Files uploaded to `/public/uploads` will be lost when the function restarts
2. **Data files won't persist**: Changes to files in `/data` directory won't persist across deployments

**Solutions:**
- Use cloud storage for uploads (AWS S3, Cloudinary, Vercel Blob Storage)
- Use a database for data storage (MongoDB, PostgreSQL, Vercel KV)
- Consider using Vercel's serverless functions with external storage

### Session Storage
Sessions use in-memory storage, which means:
- Sessions won't persist across serverless function invocations
- For production, consider using Redis or another external session store

## Environment Variables

Make sure to set all environment variables in Vercel's dashboard:
- `SESSION_SECRET` (required for production)
- `EMAIL_USER` (optional)
- `EMAIL_PASS` (optional)
- `GOOGLE_SHEETS_CREDENTIALS` (optional)
- `GOOGLE_SHEET_ID` (optional)

## Deployment Steps

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Vercel will automatically detect the `vercel.json` configuration
4. Set environment variables in Vercel dashboard
5. Deploy!

## Testing Locally with Vercel

Install Vercel CLI:
```bash
npm i -g vercel
```

Run locally:
```bash
vercel dev
```

