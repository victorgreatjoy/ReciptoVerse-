# ReceiptoVerse Deployment Guide 🚀

**Production Deployment Guide for Railway (Backend) + Vercel (Frontend)**

This guide covers deploying the complete ReceiptoVerse platform to production with proper environment configuration for Hedera Testnet integration.

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Hedera testnet account with HBAR balance
- [ ] Environment variables documented (see `.env.example`)
- [ ] Database migrations tested locally
- [ ] All Hedera service IDs confirmed (HCS topic, HTS token, NFT collection)
- [ ] Pinata account configured for IPFS (optional for NFTs)

---

## 🎯 Architecture Overview

```
┌─────────────┐
│   Vercel    │  Frontend (React + Vite)
│  (Frontend) │  → https://receiptoverse.vercel.app
└──────┬──────┘
       │ API calls
       ▼
┌─────────────┐
│   Railway   │  Backend (Node.js + Express)
│  (Backend)  │  → https://receiptoverse-api.railway.app
└──────┬──────┘
       │ Hedera SDK
       ▼
┌─────────────┐
│   Hedera    │  Testnet
│  Testnet    │  - HCS Topic: 0.0.7153725
└─────────────┘  - HTS Token: 0.0.7154427
                 - NFT Collection: 0.0.6927730
```

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend for Production

1. **Create `backend/Procfile`** (if not exists):

   ```
   web: node src/server.js
   ```

2. **Update `backend/package.json`**:

   ```json
   {
     "scripts": {
       "start": "node src/server.js",
       "dev": "nodemon src/server.js",
       "migrate": "node run-migrations.js"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **Verify `.gitignore`** excludes:
   ```
   .env
   .env.local
   .env.production
   node_modules/
   ```

### Step 2: Deploy to Railway

1. **Sign Up**: Go to [railway.app](https://railway.app) → Sign in with GitHub

2. **Create New Project**:

   - Click "New Project" → "Deploy from GitHub repo"
   - Select `ReceiptoVerse` repository
   - Choose `main` branch

3. **Configure Build Settings**:

   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run migrate`
   - **Start Command**: `npm start`

4. **Add Environment Variables** (Critical!):

   Click "Variables" tab and add:

   ```bash
   # Hedera Configuration
   HEDERA_NETWORK=testnet
   OPERATOR_ID=0.0.6913837
   OPERATOR_KEY=302e020100300506032b6570042204205e... # Your full private key

   # HCS Receipt Topic
   HCS_RECEIPT_TOPIC_ID=0.0.7153725

   # HTS RVP Token
   HTS_POINTS_TOKEN_ID=0.0.7154427

   # NFT Collection (optional)
   NFT_COLLECTION_ID=0.0.6927730
   PINATA_API_KEY=your_key
   PINATA_SECRET_API_KEY=your_secret
   PINATA_JWT=your_jwt
   PORT=3000
   ```

5. Deploy!

---

## Alternative: Render Deployment

### Backend on Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service":
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend/src && node server.js`
   - **Root Directory**: Leave empty
4. Add same environment variables as above
5. Deploy!

---

## Domain & SSL

Both Vercel and Railway provide:

- ✅ Free subdomain (e.g., ReceiptoVerse.vercel.app)
- ✅ Automatic SSL certificates
- ✅ Custom domain support (optional)

---

## Post-Deployment Checklist

### ✅ Frontend Testing

- [ ] App loads at deployed URL
- [ ] Mock wallet connection works
- [ ] Form submissions work
- [ ] API calls reach backend

### ✅ Backend Testing

- [ ] Health check endpoint responds
- [ ] Environment variables loaded
- [ ] Hedera connection working
- [ ] IPFS uploads functional

### ✅ Integration Testing

- [ ] Create test receipt NFT
- [ ] Verify on HashScan
- [ ] Check IPFS metadata

---

## Monitoring & Maintenance

### Error Tracking

- Vercel: Built-in analytics
- Railway: Application logs
- Consider: Sentry for error monitoring

### Performance

- Lighthouse scores for frontend
- Response times for API endpoints
- Hedera transaction success rates

---

## Cost Estimates

### Free Tier Limits:

- **Vercel**: 100GB bandwidth/month
- **Railway**: 500 hours runtime/month
- **Render**: 750 hours/month

### When to Upgrade:

- High traffic (>10K monthly users)
- Need custom domains
- Require advanced features

---

## Security for Production

### Environment Variables

- Never commit sensitive keys
- Use platform-specific env var management
- Rotate keys regularly

### API Security

- Add rate limiting
- Implement proper CORS
- Validate all inputs
- Use HTTPS only

### Hedera Best Practices

- Use different accounts for prod/test
- Implement proper key management
- Monitor transaction costs
- Set up alerts for unusual activity

---

## Quick Deploy Commands

### Frontend (Vercel CLI)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Backend (Railway CLI)

```bash
cd backend
npm install -g @railway/cli
railway login
railway deploy
```

---

## Custom Domain Setup (Optional)

### Free Options:

- GitHub Pages custom domain
- Vercel custom domain
- Railway custom domain

### Paid Options:

- Buy domain from Namecheap/GoDaddy
- Configure DNS settings
- Enable automatic SSL

---

Your ReceiptoVerse MVP will be live in ~30 minutes! 🎉
