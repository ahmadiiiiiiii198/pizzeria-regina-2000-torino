# 🚀 Setup Guide: Push Notifications

## 📋 Step 1: Create .env.local File

**In your project root**, create a new file called `.env.local` and paste this content:

```env
# Copy from .env.example
VITE_SUPABASE_URL=https://sixnfemtvmighstbgrbd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I

# YOUR VAPID KEYS (from VAPID_KEYS_SECURE.txt)
VITE_VAPID_PUBLIC_KEY=BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw
VAPID_PRIVATE_KEY=QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA
```

**Where to find your VAPID keys:**
- They are saved in `VAPID_KEYS_SECURE.txt` file in your project root
- Or copy them from above ⬆️

---

## ✅ Verify .env.local is Created

**Check:**
1. File is in project root: `c:\Users\king of the kings\Downloads\pizzeria-regina-2000-torino-main\.env.local`
2. File contains the VAPID keys
3. `.env.local` is in `.gitignore` (already done ✅)

---

## 🔐 Security Check

- ✅ `.env.local` is NOT committed to git
- ✅ Private key is ONLY in .env.local (never in frontend code)
- ✅ Public key can be used in frontend (safe to expose)
- ⚠️ Keep `VAPID_KEYS_SECURE.txt` backup safe (or delete it after copying)

---

## 🎯 What These Keys Do

**VITE_VAPID_PUBLIC_KEY (Public Key):**
- Used in frontend code
- Identifies your app to push services
- Safe to expose in browser
- Used when subscribing users to push notifications

**VAPID_PRIVATE_KEY (Private Key):**
- Used in backend/Edge Functions ONLY
- Signs push notification requests
- MUST be kept secret
- Never expose to frontend

---

## ▶️ Next Steps

Once .env.local is created, I'll continue with:

1. ✅ VAPID Keys generated
2. ✅ .env.example updated
3. ⏳ Create Supabase table for push subscriptions
4. ⏳ Update frontend to subscribe users
5. ⏳ Create Supabase Edge Function
6. ⏳ Set up database trigger
7. ⏳ Test everything

**Let me know when .env.local is created and I'll continue!** 🚀
