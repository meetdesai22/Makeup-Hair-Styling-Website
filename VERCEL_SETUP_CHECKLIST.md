# ✅ Vercel Setup Checklist

## What You Need to Do on Vercel Dashboard

### 1. **Import Your Project** (First Time Only)
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Makeup-Hair-Styling-Website`
   - Select branch: `develop` (or `main` if you merged)
   - Framework: Next.js (auto-detected)
   - Click "Deploy" (you can configure the rest after)

### 2. **Create KV Database** (Required for Data Storage)
   - In your Vercel project dashboard
   - Go to **Storage** tab (left sidebar)
   - Click **"Create Database"**
   - Select **"KV"** (Redis)
   - Name it: `website-kv` (or any name)
   - Select region closest to you
   - Click **"Create"**
   
   ✅ **Vercel automatically adds these environment variables:**
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   
   **You don't need to set these manually!**

### 3. **Create Blob Storage** (Required for Image Uploads)
   - Still in **Storage** tab
   - Click **"Create Database"** again
   - Select **"Blob"**
   - Name it: `website-blob` (or any name)
   - Click **"Create"**
   
   ✅ **Vercel automatically adds:**
   - `BLOB_READ_WRITE_TOKEN`
   
   **You don't need to set this manually!**

### 4. **Set Environment Variables** (Required)
   - Go to **Settings** → **Environment Variables**
   - Add the following:

   #### Required:
   ```
   SESSION_SECRET = [Generate a random string]
   ```
   - Click "Add"
   - Select: Production, Preview, Development
   - **How to generate SESSION_SECRET:**
     - Run: `openssl rand -base64 32` in terminal
     - Or use: https://randomkeygen.com/
     - Or any random string (at least 32 characters)

   #### Optional (for email notifications):
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-app-password
   ```
   
   #### Optional (for Google Sheets logging):
   ```
   GOOGLE_SHEETS_CREDENTIALS = [JSON string]
   GOOGLE_SHEET_ID = [Sheet ID]
   ```

### 5. **Redeploy After Adding Storage**
   - After creating KV and Blob, go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - This ensures the new environment variables are available

### 6. **Verify Everything Works**
   - Visit your Vercel URL (e.g., `your-app.vercel.app`)
   - Test homepage - images should load
   - Test `/admin` - login with `admin123`
   - Test saving configuration in admin panel
   - Test gallery upload (if implemented)

## 🎯 Quick Summary

**What Vercel Does Automatically:**
- ✅ Detects Next.js framework
- ✅ Sets up build configuration
- ✅ Adds KV environment variables when you create KV
- ✅ Adds Blob environment variables when you create Blob
- ✅ Handles HTTPS and CDN

**What You Must Do:**
1. ✅ Create KV database (Storage tab)
2. ✅ Create Blob storage (Storage tab)
3. ✅ Set `SESSION_SECRET` environment variable
4. ✅ Redeploy after creating storage

**What's Optional:**
- Email configuration (EMAIL_USER, EMAIL_PASS)
- Google Sheets (GOOGLE_SHEETS_CREDENTIALS, GOOGLE_SHEET_ID)

## 🔍 How to Verify Storage is Connected

After deployment, check your deployment logs:
1. Go to **Deployments** tab
2. Click on a deployment
3. Click **"Build Logs"**
4. Look for any errors about KV or Blob

If you see warnings like "Vercel KV not available", it means:
- KV wasn't created, OR
- Environment variables weren't set (should be automatic)

## 📝 Important Notes

1. **Storage Creation**: You must create KV and Blob in the Vercel dashboard. The code won't work without them.

2. **Environment Variables**: 
   - KV and Blob tokens are **automatically added** by Vercel
   - You only need to manually set `SESSION_SECRET`

3. **Redeploy**: After creating storage, you must redeploy for the environment variables to be available.

4. **Free Tier**: Vercel's free tier includes:
   - KV: 256 MB storage, 30K reads/day
   - Blob: 1 GB storage, 1M operations/month
   - More than enough for your website!

## 🆘 Troubleshooting

### "Vercel KV not available" in logs
- ✅ Check that KV database was created
- ✅ Check that deployment happened AFTER creating KV
- ✅ Redeploy the project

### "Vercel Blob not available" in logs
- ✅ Check that Blob storage was created
- ✅ Check that deployment happened AFTER creating Blob
- ✅ Redeploy the project

### Admin panel not working
- ✅ Check that `SESSION_SECRET` is set
- ✅ Check browser console for cookie errors
- ✅ Try clearing browser cookies

## ✅ You're Done!

Once you've:
1. Created KV database
2. Created Blob storage  
3. Set SESSION_SECRET
4. Redeployed

Your website should be fully functional! 🎉

