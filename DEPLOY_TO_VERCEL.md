# Deploy Next.js App to Vercel

## ✅ Code Pushed to GitHub

Your code is now on the `develop` branch at:
`https://github.com/meetdesai22/Makeup-Hair-Styling-Website`

## 🚀 Deploy to Vercel - Step by Step

### Option 1: Deploy from Develop Branch (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your repository: `Makeup-Hair-Styling-Website`
   - Vercel will auto-detect it's a Next.js project

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Select Branch**
   - Under "Git Branch", select `develop` instead of `main`
   - This will deploy from your develop branch

5. **Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     - `SESSION_SECRET` - Generate a random string (required)
     - `EMAIL_USER` - Your Gmail (optional)
     - `EMAIL_PASS` - Gmail App Password (optional)
     - `GOOGLE_SHEETS_CREDENTIALS` - JSON string (optional)
     - `GOOGLE_SHEET_ID` - Sheet ID (optional)

6. **Create Vercel KV Database**
   - In Vercel Dashboard → Your Project → Storage
   - Click "Create Database"
   - Select "KV" (Redis)
   - Name it: `website-kv`
   - Vercel will auto-add environment variables

7. **Create Vercel Blob Storage**
   - In the same Storage section
   - Click "Create Database" again
   - Select "Blob"
   - Name it: `website-blob`
   - Vercel will auto-add environment variables

8. **Deploy!**
   - Click "Deploy"
   - Vercel will build and deploy your Next.js app
   - Wait for deployment to complete

### Option 2: Merge to Main First

If you prefer to deploy from `main` branch:

```bash
# Switch to main branch
git checkout main

# Merge develop into main
git merge develop

# Push to GitHub
git push origin main
```

Then in Vercel, select `main` as the branch to deploy.

## 🔧 Post-Deployment Setup

### 1. Set Production Branch
- In Vercel Dashboard → Settings → Git
- Set "Production Branch" to `develop` (or `main` if you merged)

### 2. Configure Environment Variables
Make sure all environment variables are set for:
- Production
- Preview
- Development

### 3. Test Your Deployment
1. Visit your Vercel URL (e.g., `your-app.vercel.app`)
2. Test homepage - images should load
3. Test gallery page
4. Test booking form
5. Test admin panel: `/admin` → login with `admin123`

## ✅ Verification Checklist

- [ ] Homepage loads correctly
- [ ] Images display in carousel
- [ ] Gallery page shows images
- [ ] Booking form works
- [ ] Contact page works
- [ ] Admin login works (`/admin`)
- [ ] Admin dashboard accessible
- [ ] Configuration can be saved
- [ ] Vercel KV is connected
- [ ] Vercel Blob Storage is connected

## 🔄 Continuous Deployment

Once set up, Vercel will automatically:
- Deploy every push to your selected branch
- Create preview deployments for pull requests
- Run builds automatically

## 📝 Important Notes

1. **Default Admin Password**: `admin123` - **CHANGE THIS IMMEDIATELY** after first login!

2. **Environment Variables**: 
   - `SESSION_SECRET` is **REQUIRED**
   - KV and Blob tokens are auto-added by Vercel

3. **Branch Strategy**:
   - Deploy from `develop` for testing
   - Merge to `main` for production (if you prefer)

4. **Custom Domain**:
   - Add your domain in Vercel Dashboard → Settings → Domains

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify `next.config.js` is correct

### Images Not Loading
- Check that images are in `public/uploads/`
- Verify image paths in gallery.json
- Check browser console for 404 errors

### Admin Panel Not Working
- Verify `SESSION_SECRET` is set
- Check that cookies are being set (browser dev tools)
- Verify Vercel KV is created

## 🎉 Success!

Once deployed, your Next.js website will be live on Vercel with:
- ✅ Server-side rendering
- ✅ Automatic optimizations
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Zero configuration needed!

