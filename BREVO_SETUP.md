# Brevo Email Setup (Forever Free - 300 emails/day)

## Step 1: Create Brevo Account
1. Go to https://www.brevo.com/
2. Click "Sign up free"
3. Enter your email and create account
4. Verify your email

## Step 2: Get SMTP Credentials
1. Login to Brevo dashboard
2. Go to **Settings** (top right) → **SMTP & API**
3. Click **SMTP** tab
4. You'll see:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Your email address
   - **SMTP Key**: Click "Create a new SMTP key" → Copy it

## Step 3: Update Environment Variables

### Local (.env file):
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
EMAIL_USER=your-brevo-login-email@gmail.com
EMAIL_PASS=your-smtp-key-from-brevo
```

### Production (Render):
1. Go to Render Dashboard → Backend Service
2. Click **Environment** tab
3. Add/Update these variables:
   - `SMTP_HOST` = `smtp-relay.brevo.com`
   - `SMTP_PORT` = `587`
   - `EMAIL_USER` = Your Brevo login email
   - `EMAIL_PASS` = Your SMTP key from Brevo
4. Click "Save Changes"
5. Backend will auto-redeploy

## Step 4: Verify Sender Email (Important!)
1. In Brevo dashboard, go to **Senders** → **Domains & Addresses**
2. Click "Add a sender"
3. Enter your email (gfp.footprint2024@gmail.com)
4. Verify it via email confirmation
5. Wait for approval (usually instant)

## Done!
Emails will now work on production. Test by:
- Registering a new user
- Reporting an issue
- Commenting on an issue

## Limits:
- ✅ 300 emails/day forever free
- ✅ No credit card required
- ✅ No expiration
