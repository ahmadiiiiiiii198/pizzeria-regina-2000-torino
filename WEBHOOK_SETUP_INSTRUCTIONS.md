# 🔧 STRIPE WEBHOOK SETUP - STEP BY STEP

## 🎯 OBJECTIVE
Configure Stripe webhook to create orders AFTER payment confirmation.

---

## 📋 STEP 1: Register Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - URL: https://dashboard.stripe.com/webhooks
   - Or: Dashboard → Developers → Webhooks

2. **Click "Add endpoint"**

3. **Enter Webhook URL:**
   ```
   https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/stripe-webhook
   ```

4. **Select Events to Listen:**
   - ✅ `checkout.session.completed` (REQUIRED)
   - ✅ `payment_intent.payment_failed` (optional but recommended)

5. **Click "Add endpoint"**

---

## 📋 STEP 2: Get Webhook Signing Secret

After creating the webhook endpoint:

1. **Click on the webhook endpoint** you just created

2. **Find "Signing secret"** section

3. **Click "Reveal"** to show the secret

4. **Copy the secret** - it looks like:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Keep this secret safe!** You'll add it to Supabase in the next step.

---

## 📋 STEP 3: Add Secret to Supabase

### Option A: Using Supabase Dashboard (RECOMMENDED)

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd

2. **Navigate to Edge Functions Settings:**
   - Project → Settings → Edge Functions (in sidebar)

3. **Add Environment Variable:**
   - Click "Add new secret"
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxxxxxxxxxxxxxxxxxx` (paste your secret)
   - Click "Save"

### Option B: Using Supabase CLI

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 📋 STEP 4: Deploy Webhook Function

The webhook function is already in your code at:
`supabase/functions/stripe-webhook/index.ts`

Deploy it to Supabase:

```bash
cd supabase
supabase functions deploy stripe-webhook
```

---

## 📋 STEP 5: Test the Webhook

### Option A: Using Stripe Test Mode

1. Make a test payment using a test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

2. Check webhook logs in Stripe Dashboard:
   - Dashboard → Developers → Webhooks
   - Click your endpoint
   - View "Events" tab

3. Verify order appears in database:
   ```bash
   node check-recent-orders.js
   ```

### Option B: Using Stripe CLI

```bash
stripe listen --forward-to https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/stripe-webhook

# In another terminal, trigger a test event:
stripe trigger checkout.session.completed
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Webhook endpoint visible in Stripe Dashboard
- [ ] Webhook secret added to Supabase environment
- [ ] Test payment completes successfully
- [ ] Webhook shows "Succeeded" in Stripe Dashboard
- [ ] Order created in database with:
  - `payment_status = 'paid'`
  - `stripe_session_id` is NOT NULL
  - All order items created
  - Notification created
- [ ] Printer receives order!

---

## 🐛 TROUBLESHOOTING

### Webhook shows "Failed" in Stripe

1. Check Supabase function logs:
   ```bash
   supabase functions logs stripe-webhook
   ```

2. Common issues:
   - Missing `STRIPE_WEBHOOK_SECRET` → Add it in Step 3
   - Invalid secret → Copy correct secret from Step 2
   - Database errors → Check table permissions

### Order not appearing

1. Check webhook fired:
   - Stripe Dashboard → Webhooks → Events tab
   - Should show "Succeeded"

2. Check Supabase logs:
   ```bash
   supabase functions logs stripe-webhook
   ```

3. Check database:
   ```bash
   node check-recent-orders.js
   ```

### Printer not receiving order

If webhook creates order but printer doesn't print:
- Check notification created in `order_notifications` table
- Check printer app is running and monitoring
- Check order visibility in admin panel

---

## 🚀 NEXT STEPS

Once webhook is working:

1. ✅ Orders only created AFTER payment
2. ✅ Printer receives PAID orders only
3. ✅ No abandoned/unpaid orders in system
4. ✅ Clean order flow!

