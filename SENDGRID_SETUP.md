# SendGrid Setup Guide for Railway Production

Since Railway blocks outbound SMTP connections (which is why Gmail email is timing out in production), we've integrated SendGrid as the email service for Railway deployment.

## 🚨 Quick Summary
Your email service is now configured to automatically:
1. **Use SendGrid** if `SENDGRID_API_KEY` is available (preferred for Railway)
2. **Fall back to SMTP** (Gmail) if SendGrid isn't configured
3. **Log codes to console** as final fallback

## 📋 SendGrid Setup Steps

### 1. Create SendGrid Account
- Go to [SendGrid.com](https://sendgrid.com)
- Sign up for a free account (100 emails/day free tier)
- Verify your email address

### 2. Create API Key
1. In SendGrid dashboard, go to **Settings > API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it a name like "Railway-ReceiptoVerse"
5. Under **Mail Send**, select **Full Access**
6. Click **Create & View**
7. **COPY THE API KEY** (you won't see it again!)

### 3. Verify Sender Identity
1. Go to **Settings > Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Name**: ReceiptoVerse
   - **From Email**: Use your domain email (e.g., noreply@yourdomain.com)
   - **Reply To**: Your support email
4. Verify the email address

### 4. Configure Railway Environment Variables
In your Railway dashboard, add these environment variables:

```
SENDGRID_API_KEY=SG.your_actual_api_key_here
EMAIL_FROM=ReceiptoVerse <noreply@yourdomain.com>
```

**Important**: Use the exact email address you verified in step 3 for `EMAIL_FROM`.

## 🧪 Testing the Setup

### Local Testing
```bash
# Test the email service locally
cd backend
node -e "
const emailService = require('./src/emailService');
emailService.sendVerificationCode('test@example.com', '123456', 'TestUser')
  .then(result => console.log('✅ Test result:', result))
  .catch(err => console.error('❌ Test failed:', err));
"
```

### Production Testing
Once deployed to Railway with the environment variables:
1. Try the email verification flow in your app
2. Check Railway logs for email service debug messages
3. Look for "SendGrid email sent" success messages

## 🔍 Debugging

### Check Environment Variables
Use the debug endpoint we created:
```
GET https://your-railway-app.railway.app/debug/env
```

### Check Logs
In Railway dashboard, check the deployment logs for:
- `📧 SendGrid API key found, setting up SendGrid service...`
- `✅ SendGrid email service configured successfully`
- `📧 [SENDGRID] Sending email via SendGrid API...`
- `📧 [SUCCESS] SendGrid email sent in XXXms`

## 🚨 Common Issues

### API Key Not Working
- Make sure the API key starts with `SG.`
- Ensure it has "Mail Send" permissions
- Check that it hasn't expired

### Sender Not Verified
- You must verify the sender email address in SendGrid
- Use the exact same email in `EMAIL_FROM` variable

### Still Getting Timeouts
- Make sure `SENDGRID_API_KEY` is set in Railway (not just locally)
- Restart the Railway deployment after adding variables
- Check that SendGrid package is installed (`@sendgrid/mail`)

## 📊 Current Email Service Status

Your emailService.js now includes:
- ✅ SendGrid integration (priority #1)
- ✅ SMTP fallback (Gmail)
- ✅ Console logging fallback
- ✅ Comprehensive error handling
- ✅ Timeout protection (20 seconds)
- ✅ Enhanced debugging logs

## 🎯 Next Steps

1. **Set up SendGrid account** (steps above)
2. **Add environment variables to Railway**
3. **Deploy to Railway**
4. **Test email verification flow**
5. **Monitor logs for success/failure**

Once SendGrid is configured, your production email should work reliably on Railway!