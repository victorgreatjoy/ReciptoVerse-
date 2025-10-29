# 🤖 Google AI (Gemini) API Key Setup Guide

## Get Your Free API Key

### Step 1: Visit Google AI Studio

Go to: **https://makersuite.google.com/app/apikey**

Or alternatively: **https://aistudio.google.com/app/apikey**

### Step 2: Sign In

- Sign in with your Google account
- No credit card required! ✅

### Step 3: Create API Key

1. Click **"Create API Key"** button
2. Select **"Create API key in new project"** (or use existing project)
3. Copy the generated API key
4. **Important:** Save it securely - you won't see it again!

### Step 4: Add to Environment Variables

**For Development (.env.development):**

```env
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**For Production (Railway):**

1. Go to Railway Dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Click **"New Variable"**
5. Add:
   - Key: `GOOGLE_AI_API_KEY`
   - Value: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
6. Redeploy

---

## Free Tier Limits

### Gemini 1.5 Flash (What we're using)

- ✅ **15 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **1 million tokens per minute**
- ✅ **Completely FREE**

### What This Means for ReceiptoVerse:

- **1,500 conversations per day** is plenty for early users
- That's **45,000 messages per month**!
- Average conversation uses ~500-1000 tokens
- No need to upgrade until you have thousands of daily users

---

## Testing the API Key

### Quick Test (Command Line):

```bash
cd backend
node -e "console.log('API Key:', process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Not set')"
```

### Test the AI Support Endpoint:

```bash
# Start the backend server
npm start

# In another terminal, test the health endpoint:
curl http://localhost:3000/api/ai-support/health
```

Expected response:

```json
{
  "success": true,
  "configured": true,
  "model": "gemini-1.5-flash",
  "status": "ready"
}
```

---

## Troubleshooting

### Error: "API key not configured"

**Solution:**

1. Check that `GOOGLE_AI_API_KEY` is in your `.env.development` file
2. Restart the backend server
3. Verify with: `echo $env:GOOGLE_AI_API_KEY` (PowerShell)

### Error: "Invalid API key"

**Solution:**

1. Double-check you copied the entire key
2. Make sure there are no extra spaces
3. Regenerate the key in Google AI Studio if needed

### Error: "Quota exceeded" or "Rate limit"

**Solution:**

- You've hit the 15 requests/minute or 1,500/day limit
- Wait 1 minute (for RPM limit) or 24 hours (for daily limit)
- Free tier resets daily

### API Key Not Working in Production

**Solution:**

1. Go to Railway Dashboard
2. Check Variables tab
3. Ensure `GOOGLE_AI_API_KEY` is set
4. Redeploy the service
5. Check logs for "✅ AI Support system initialized"

---

## Security Best Practices

✅ **DO:**

- Keep API key in environment variables
- Add `.env*` to `.gitignore`
- Regenerate if accidentally exposed
- Use different keys for dev/prod (optional)

❌ **DON'T:**

- Commit API keys to Git
- Share keys in public channels
- Hardcode keys in source code
- Use same key for multiple projects

---

## Upgrading (Future)

If you outgrow the free tier:

### Gemini API Pricing (Pay-as-you-go):

- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- Still very affordable! (~$0.04 per conversation)

### When to upgrade:

- More than 1,500 users chatting daily
- Need higher rate limits (60 RPM)
- Want longer context windows

---

## Alternative: Backup API Key

You can set up a second Google account with another API key as backup:

```env
# Primary
GOOGLE_AI_API_KEY=AIzaSy_primary_key

# Backup (optional)
GOOGLE_AI_API_KEY_BACKUP=AIzaSy_backup_key
```

The backend will automatically use the backup if primary hits rate limits.

---

## API Key Rotation

**Recommended schedule:**

- Rotate every 90 days for security
- Update both development and production
- Test before removing old key

**How to rotate:**

1. Create new API key in Google AI Studio
2. Update environment variables
3. Deploy to production
4. Verify it works
5. Delete old key from Google AI Studio

---

## Support

**Google AI Studio Issues:**

- Help: https://ai.google.dev/docs
- Community: https://discuss.ai.google.dev/

**ReceiptoVerse AI Integration:**

- Check backend logs for errors
- Test health endpoint
- Contact support team

---

🎉 **You're all set!** The AI support chat will be ready as soon as you add your API key!
