# 🎯 FINAL SETUP STEP - ADD WEBHOOK SECRET TO SUPABASE

## ✅ COMPLETED SO FAR:
- ✅ Stripe webhook endpoint created
- ✅ Webhook URL: `https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/stripe-webhook`
- ✅ Webhook Secret: `whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf`
- ✅ Webhook Status: Enabled
- ✅ Events: `checkout.session.completed`, `payment_intent.payment_failed`

---

## 🚨 ONLY 1 STEP LEFT (2 MINUTES):

### **Add Secret to Supabase Dashboard**

1. **Open this link in your browser:**
   ```
   https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/settings/functions
   ```

2. **Scroll down** to the "Secrets" section

3. **Click the "Add new secret" button**

4. **In the popup, enter:**
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf`

5. **Click "Save" or "Add secret"**

6. **Done!** The webhook is now fully configured! ✅

---

## 🧪 TEST IT WORKS:

After adding the secret:

### Step 1: Make a Test Payment
1. Go to your website
2. Add items to cart
3. Go to checkout
4. Fill in customer details
5. Click "Paga Ora" (Pay Now)
6. Complete payment on Stripe

### Step 2: Check Order Created After Payment
Run this command:
```bash
node check-recent-orders.js
```

### Step 3: Verify Order Details
The order should have:
- ✅ `payment_status: 'paid'` (not 'pending')
- ✅ `stripe_session_id: 'cs_xxxxxxxxxxxxx'` (not NULL)
- ✅ `paid_amount: 17.00` (or whatever amount)
- ✅ `paid_at: '2025-11-18T...'` (timestamp)

### Step 4: Check Printer
- ✅ Printer should receive the order!
- ✅ Receipt should print automatically!

---

## 🐛 TROUBLESHOOTING:

### If webhook doesn't fire:
1. Check Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. Go to "Events" tab
4. Check if event shows "Succeeded" or "Failed"

### If order not created:
1. Check Supabase function logs:
   - Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/functions
   - Click on `stripe-webhook` function
   - View logs

### If printer doesn't receive order:
1. Check order exists: `node check-recent-orders.js`
2. Check notification created in `order_notifications` table
3. Check printer app is running and monitoring

---

## ✅ SUCCESS CRITERIA:

When everything works:
1. ❌ Order NOT created when user clicks "Pay Now"
2. ✅ Order ONLY created after Stripe payment succeeds
3. ✅ Order has `payment_status='paid'` immediately
4. ✅ Printer receives order automatically
5. ✅ Admin panel shows only PAID orders
6. ✅ No abandoned/unpaid orders in database

---

## 📋 SUMMARY OF ENTIRE FIX:

1. ✅ Frontend: Removed early order creation
2. ✅ Frontend: Send order data in Stripe metadata
3. ✅ Webhook: Create order AFTER payment
4. ✅ Webhook: Create order items
5. ✅ Webhook: Create notification for printer
6. ✅ Stripe: Webhook endpoint created
7. ⏳ **YOU:** Add secret to Supabase (final step!)

