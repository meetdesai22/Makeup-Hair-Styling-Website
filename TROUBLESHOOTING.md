# Troubleshooting Deployment Errors

## FUNCTION_INVOCATION_FAILED Error

If you're seeing `FUNCTION_INVOCATION_FAILED` on Vercel, here are the fixes applied:

### ✅ Fixes Applied

1. **Lazy Initialization**: Services (KV, Blob, Redis) now initialize only when needed, not during module load
2. **Error Handling**: All initialization wrapped in try-catch blocks
3. **Graceful Fallbacks**: If cloud services fail, the app falls back to filesystem (for local) or continues without them
4. **Safe Session Store**: Redis connection doesn't block function startup

### Common Causes & Solutions

#### 1. Missing Environment Variables
**Error**: Function crashes on startup
**Solution**: 
- Ensure `SESSION_SECRET` is set in Vercel dashboard
- Check that KV and Blob storage are created (they auto-add env vars)

#### 2. Redis Connection Issues
**Error**: Function crashes when trying to connect to Redis
**Solution**: 
- The code now handles Redis failures gracefully
- If Redis isn't available, it uses memory store (sessions won't persist, but app works)

#### 3. Module Import Errors
**Error**: Cannot find module '@vercel/kv' or '@vercel/blob'
**Solution**:
- Run `npm install` locally to ensure dependencies are in package.json
- Push package.json and package-lock.json to Git
- Vercel will install dependencies automatically

#### 4. Path Resolution Issues
**Error**: Cannot find module '../lib/storage'
**Solution**:
- Ensure `lib/` directory exists in your project
- Check that all files are committed to Git

### How to Debug

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on the function → View Logs
   - Look for error messages

2. **Test Locally**:
   ```bash
   npm install
   npm start
   ```
   If it works locally but not on Vercel, it's likely an environment variable issue.

3. **Check Environment Variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all required variables are set
   - Make sure they're set for the correct environment (Production/Preview/Development)

### Quick Fixes

#### If function still crashes:

1. **Remove Redis temporarily** (sessions won't persist but app will work):
   - Comment out Redis initialization in `lib/session-store.js`
   - Deploy again

2. **Check package.json**:
   - Ensure all dependencies are listed
   - Run `npm install` and commit package-lock.json

3. **Simplify vercel.json**:
   - Use the minimal version provided
   - Remove any custom build commands if present

### Verification Steps

After deploying, test these endpoints:

```bash
# Should return config (even if empty)
curl https://your-domain.vercel.app/api/config

# Should return gallery array (even if empty)
curl https://your-domain.vercel.app/api/gallery

# Should return HTML
curl https://your-domain.vercel.app/
```

If these work, your function is running correctly!

### Still Having Issues?

1. Check Vercel function logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Vercel KV and Blob Storage are created
4. Try deploying with minimal code first, then add features

