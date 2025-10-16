# 🚀 DEPLOY NOW - Manual Steps (5 Minutes!)

## ✅ What's Already Done

- ✅ Code committed and pushed to GitHub
- ✅ .env.local created with VAPID keys
- ✅ All files ready

## 🎯 What You Need to Do (Follow These Steps)

---

## STEP 1: Create Database Table (2 minutes)

### Go to Supabase Dashboard

1. **Open:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/editor
2. **Click:** "SQL Editor" in left sidebar
3. **Click:** "+ New query" button
4. **Copy & Paste** the entire content from: `RUN_IN_SUPABASE.sql`
5. **Click:** "Run" button (bottom right)
6. **Verify:** You should see "Success. No rows returned"

### Verify Table Was Created

1. **Click:** "Table Editor" in left sidebar
2. **You should see:** `push_subscriptions` table in the list
3. **Click on it** to see the columns

✅ **Done! Table created.**

---

## STEP 2: Deploy Edge Function (3 minutes)

### Option A: Using Supabase Dashboard (EASIEST)

1. **Go to:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/functions
2. **Click:** "Create a new function" button
3. **Function name:** `send-order-notification`
4. **Click:** "Create function"
5. **In the code editor:**
   - **Delete** all existing code
   - **Copy** entire content from: `supabase/functions/send-order-notification/index.ts`
   - **Paste** into editor
6. **Click:** "Deploy" button
7. **Wait** for deployment (~30 seconds)

### Set Environment Secrets

1. **Stay on Edge Functions page**
2. **Click:** "Settings" tab
3. **Scroll to:** "Secrets" section
4. **Add Secret #1:**
   - Name: `VAPID_PUBLIC_KEY`
   - Value: `BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw`
   - Click: "Add"

5. **Add Secret #2:**
   - Name: `VAPID_PRIVATE_KEY`
   - Value: `QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA`
   - Click: "Add"

### Test Edge Function

1. **Go back to:** Functions list
2. **Click:** `send-order-notification`
3. **Click:** "Invoke" tab
4. **Paste this test payload:**
```json
{
  "order_id": "test-123",
  "customer_name": "Test Customer",
  "total_amount": 25.50
}
```
5. **Click:** "Run"
6. **Expected result:** `{"message": "No subscriptions found", "sent": 0}`
   - This is CORRECT! (No subscriptions yet until someone opens the app)

✅ **Done! Edge Function deployed.**

---

## STEP 3: Setup Webhook (1 minute)

### Create Database Webhook

1. **Go to:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/database/hooks
2. **Click:** "Create a new hook" (or "Enable Webhooks" if needed)
3. **Select:** "Database Webhooks"
4. **Configuration:**
   - **Name:** `notify-new-order`
   - **Table:** `orders`
   - **Events:** ☑️ Insert (check only INSERT)
   - **Type:** HTTP Request
   - **Method:** POST
   - **URL:** `https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification`
   - **HTTP Headers:** Click "Add header"
     - Key: `Authorization`
     - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I`
   - **HTTP Params:** (leave empty)
   - **Body/Payload:** 
```json
{
  "order_id": "{{record.id}}",
  "customer_name": "{{record.customer_name}}",
  "total_amount": {{record.total_amount}}
}
```

5. **Click:** "Create webhook"

✅ **Done! Webhook configured.**

---

## STEP 4: Build & Deploy Frontend (AUTOMATIC!)

The frontend will auto-deploy because we pushed to GitHub!

1. **Go to:** https://app.netlify.com
2. **Your site:** pizzeria-regina-2000-torino
3. **Check:** Deploys tab - should show "Building..." or "Published"
4. **Wait:** 2-3 minutes for build to complete

✅ **Done! Frontend will deploy automatically.**

---

## 🎯 STEP 5: TEST EVERYTHING!

### Test 1: Subscribe to Push Notifications

1. **Open your site:** https://pizzeria-regina-2000-torino.netlify.app/ordini
2. **Open DevTools:** Press F12
3. **Click Console tab**
4. **Look for these logs:**
```
📱 [MobileNotification] Creating new push subscription...
✅ [MobileNotification] Push subscription created
✅ [MobileNotification] Push subscription saved to database
```

5. **Verify in Supabase:**
   - Go to: Table Editor → push_subscriptions
   - You should see 1 row with your subscription!

### Test 2: Send Manual Push

**In Supabase:**
1. Go to: Functions → send-order-notification → Invoke
2. Paste:
```json
{
  "order_id": "test-999",
  "customer_name": "Manual Test",
  "total_amount": 99.99
}
```
3. Click: "Run"
4. **Result:** Should say "sent": 1

**On your device:**
- You should receive a notification!
- "🍕 Nuovo Ordine!"
- "Ordine da Manual Test - €99.99"

### Test 3: Real Order (FINAL TEST!)

1. **CLOSE the /ordini app completely** on your phone
2. **Lock your phone screen**
3. **Place a test order** from your website
4. **Wait 5-10 seconds...**
5. **Your phone vibrates!** 📳
6. **Notification appears!** 🔔
7. **SUCCESS!** ✅

---

## ✅ Completion Checklist

- [ ] Database table created
- [ ] Edge Function deployed
- [ ] VAPID secrets set
- [ ] Webhook configured
- [ ] Frontend built & deployed
- [ ] Test subscription successful
- [ ] Test manual push successful
- [ ] Test real order successful

---

## 🎉 YOU'RE DONE!

**Congratulations!** You now have TRUE background push notifications!

**How it works:**
```
New order → Webhook → Edge Function → Push Service → Your Phone (EVEN IF APP CLOSED!)
```

**Test it now:**
1. Close app completely
2. Place an order
3. Get notified!

---

## 🆘 Troubleshooting

### "No subscriptions found"
**Solution:** Open /ordini page once to subscribe

### "VAPID key not found"
**Solution:** Make sure you added both secrets in Edge Function settings

### "Webhook not triggering"
**Solution:** 
- Check Database → Webhooks → Logs
- Make sure webhook is "Enabled"
- Verify the URL is correct

### "Still no notification when app closed"
**Solution:**
- Make sure you subscribed first (Test 1)
- Check if Android killed the browser (disable battery optimization)
- Verify webhook fired (check logs)

---

## 📞 Need Help?

All the code is deployed and ready. If something doesn't work:

1. Check Supabase Edge Function logs
2. Check Database Webhook logs
3. Check browser console for errors
4. Verify all secrets are set correctly

**The system is complete and ready to use!** 🚀
