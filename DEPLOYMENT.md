# Deployment Guide 🚀

## Frontend Deployment (Vercel)

### Step 1: Prepare for Deployment

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial ReciptoVerse MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/reciptoverse.git
   git push -u origin main
   ```

2. **Update API URL** in frontend/src/App.jsx:
   ```javascript
   // Replace localhost with your deployed backend URL
   const API_BASE =
     process.env.NODE_ENV === "production"
       ? "https://your-backend-url.railway.app"
       : "http://localhost:3000";
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" → Import your GitHub repo
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
5. Deploy!

---

## Backend Deployment (Railway)

### Step 1: Prepare Backend

1. **Create Procfile** in backend directory:

   ```
   web: cd src && node server.js
   ```

2. **Update package.json** in backend:
   ```json
   {
     "scripts": {
       "start": "cd src && node server.js",
       "dev": "cd src && nodemon server.js"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   OPERATOR_ID=0.0.6913837
   OPERATOR_KEY=your_private_key
   RECV_TOKEN_ID=0.0.6922722
   RNFT_TOKEN_ID=0.0.6922732
   PINATA_API_KEY=your_key
   PINATA_SECRET_API_KEY=your_secret
   PINATA_JWT=your_jwt
   PORT=3000
   ```
6. Deploy!

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

- ✅ Free subdomain (e.g., reciptoverse.vercel.app)
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

Your ReciptoVerse MVP will be live in ~30 minutes! 🎉
