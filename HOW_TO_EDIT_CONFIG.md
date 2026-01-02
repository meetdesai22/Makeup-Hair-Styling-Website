# How to Edit Website Configuration

## Problem: "Vercel KV not available" Error

If you're seeing this error, it means Vercel KV (database) hasn't been set up yet. You have **two options**:

---

## Option 1: Set Up Vercel KV (Recommended - Permanent Solution)

This is the proper way to fix it permanently:

### Steps:
1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Storage** tab (left sidebar)
4. Click **"Create Database"**
5. Select **"KV"** (Redis)
6. Name it: `website-kv`
7. Click **"Create"**
8. Go to **Deployments** tab
9. Click **"..."** on latest deployment → **"Redeploy"**

After redeploying, the admin panel will work and you can edit config there!

---

## Option 2: Edit Config File Directly (Quick Fix)

If you need to update the config **right now** without setting up KV:

### Steps:

1. **Edit the config file:**
   - Open `data/config.json` in your code editor
   - Edit the values you want to change:

```json
{
  "businessName": "Make up by Khyati Dedhia",
  "email": "khyatiadedhia@gmail.com",
  "phone": "+1 (647) 213 2628",
  "location": "Toronto, ON",
  "instagram": "https://www.instagram.com/makeupandhairby_khyati",
  "heroImage": "/uploads/gallery-1766678912713-954463250.JPEG"
}
```

2. **Save the file**

3. **Commit and push to GitHub:**
```bash
git add data/config.json
git commit -m "Update website configuration"
git push origin develop
```

4. **Vercel will automatically redeploy** with the new config

5. **The changes will appear on your live site!**

---

## Current Config File Location

📁 `data/config.json`

You can edit:
- `businessName` - Your business/website name
- `email` - Contact email
- `phone` - Phone number
- `location` - Location (city, state, etc.)
- `instagram` - Instagram profile URL
- `heroImage` - Path to hero image (optional)

---

## Which Option Should You Use?

- **Option 1 (KV Setup)**: Use this if you want the admin panel to work and be able to edit config through the web interface
- **Option 2 (Direct Edit)**: Use this for a quick fix right now, or if you prefer editing files directly

**Note:** Even after setting up KV, you can still edit the config file directly if you prefer!

---

## Troubleshooting

### Config changes not showing?
- Make sure you pushed to GitHub
- Check that Vercel redeployed (check Deployments tab)
- Clear your browser cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Still getting KV error after setup?
- Make sure you redeployed after creating KV
- Check that KV environment variables are set (Settings → Environment Variables)
- Check deployment logs for errors

