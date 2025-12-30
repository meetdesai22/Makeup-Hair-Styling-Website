# Deployment Checklist - Complete Guide

## ✅ Pre-Deployment Checklist

### 1. Code is Ready
- [x] All files updated and tested
- [x] `api/index.js` - Main serverless function
- [x] `lib/storage.js` - Storage abstraction layer
- [x] `lib/session-store.js` - Session management
- [x] `vercel.json` - Vercel configuration

### 2. Dependencies
- [x] `package.json` includes all required dependencies
- [x] Run `npm install` to ensure all packages are installed

### 3. Environment Variables Setup

#### Required in Vercel Dashboard:
1. **SESSION_SECRET** (REQUIRED)
   - Generate with: `openssl rand -base64 32`
   - Or use any random 32+ character string
   - Example: `my-super-secret-key-12345`

#### Optional (for booking functionality):
2. **EMAIL_USER** - Your Gmail address
3. **EMAIL_PASS** - Gmail App Password (not regular password)
4. **GOOGLE_SHEETS_CREDENTIALS** - JSON string of service account
5. **GOOGLE_SHEET_ID** - Your Google Sheet ID

#### Auto-Added by Vercel (when you create storage):
- `KV_REST_API_URL` - Automatically set
- `KV_REST_API_TOKEN` - Automatically set
- `BLOB_READ_WRITE_TOKEN` - Automatically set

## 🚀 Step-by-Step Deployment

### Step 1: Create Vercel KV Database

1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **KV** (Redis)
5. Name it: `website-kv`
6. Choose region closest to your users
7. Click **Create**
8. ✅ Vercel automatically adds environment variables

### Step 2: Create Vercel Blob Storage

1. In the same **Storage** tab
2. Click **Create Database** again
3. Select **Blob**
4. Name it: `website-blob`
5. Click **Create**
6. ✅ Vercel automatically adds environment variables

### Step 3: Set Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add `SESSION_SECRET`:
   - Key: `SESSION_SECRET`
   - Value: (generate a random string)
   - Environment: Production, Preview, Development (all)
3. Add optional variables if needed (EMAIL_USER, etc.)
4. Click **Save**

### Step 4: Deploy

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Vercel will automatically detect and deploy
3. Or manually trigger deployment in Vercel dashboard

### Step 5: Verify Deployment

1. **Test Homepage**: Visit your deployed URL
2. **Test Admin Panel**: 
   - Go to `/admin`
   - Default password: `admin123`
   - ⚠️ **CHANGE PASSWORD IMMEDIATELY!**
3. **Test Gallery**:
   - Upload an image in admin panel
   - Check that it appears in gallery
4. **Test Configuration**:
   - Update business info in admin panel
   - Verify it saves and displays on homepage

## 🔧 Troubleshooting

### Issue: Admin panel shows "Unauthorized"
**Solution**: 
- Check that `SESSION_SECRET` is set in Vercel
- Verify Vercel KV is created and connected
- Check browser console for errors

### Issue: Images not uploading
**Solution**:
- Verify Vercel Blob Storage is created
- Check that `BLOB_READ_WRITE_TOKEN` is set (auto-set by Vercel)
- Check function logs in Vercel dashboard

### Issue: Data not persisting
**Solution**:
- Verify Vercel KV is created
- Check that `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- Check function logs for errors

### Issue: Sessions not working
**Solution**:
- Ensure `SESSION_SECRET` is set
- Verify Vercel KV is created (sessions use Redis)
- Check cookie settings (should be secure on HTTPS)

## 📋 Post-Deployment Tasks

1. **Change Admin Password**
   - Log into admin panel
   - Go to Settings → Change Password
   - Use a strong password

2. **Upload Gallery Images**
   - Go to Gallery section in admin
   - Upload your portfolio images
   - Add titles and categories

3. **Update Configuration**
   - Go to Configuration section
   - Update business name, email, phone, location
   - Upload hero image
   - Add Instagram link

4. **Test Booking Form**
   - Fill out booking form on website
   - Verify email notification (if configured)
   - Check Google Sheets (if configured)

## 🎯 Quick Test Commands

After deployment, test these endpoints:

```bash
# Test config endpoint
curl https://your-domain.vercel.app/api/config

# Test gallery endpoint
curl https://your-domain.vercel.app/api/gallery

# Test admin login (should return success with correct password)
curl -X POST https://your-domain.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

## 📝 Notes

- **Default Password**: `admin123` - CHANGE THIS IMMEDIATELY!
- **Local Development**: Uses filesystem storage (works out of the box)
- **Production**: Uses Vercel KV and Blob Storage (requires setup)
- **Sessions**: Use Redis on Vercel, memory store locally
- **File Uploads**: Use Blob Storage on Vercel, filesystem locally

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Homepage loads with your content
- ✅ Admin panel login works
- ✅ You can upload images successfully
- ✅ Images appear in gallery
- ✅ Configuration saves persist
- ✅ Sessions work across page refreshes

## 🆘 Need Help?

1. Check Vercel function logs: Dashboard → Functions → View logs
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure Vercel KV and Blob Storage are created
5. Review `DEPLOYMENT_GUIDE.md` for detailed instructions

