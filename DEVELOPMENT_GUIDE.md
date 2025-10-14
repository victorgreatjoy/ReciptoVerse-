# ReciptoVerse Development Workflow Guide

## 🚀 Quick Start Commands

### Local Development (Recommended for daily work)

```bash
# Backend (Terminal 1)
cd backend
npm run dev:local              # Uses SQLite, no setup needed

# Frontend (Terminal 2)
cd frontend
npm run dev                    # Uses localhost:3000 API

# Visit: http://localhost:5173
```

### Cloud Development (For team testing)

```bash
# Backend
cd backend
npm run dev:cloud              # Uses cloud database

# Frontend
cd frontend
npm run build:staging          # Uses staging API
npm run preview
```

### Production Deployment

```bash
# Deploy to Railway/Vercel
git push origin main           # Auto-deploys via GitHub integration
```

## 🔧 Environment Switching

### Switch to Local Development

```bash
# Copy development config
cp .env.development .env
npm run dev:local
```

### Switch to Cloud Development

```bash
# Copy staging config with your cloud DB URL
cp .env.staging .env
# Update DATABASE_URL in .env
npm run dev:cloud
```

### Switch to Production

```bash
# Production deployment handles this automatically
# Just push to main branch
```

## 🗃️ Database Management

### Local Development (SQLite)

- Database file: `backend/reciptoverse.db`
- No setup required
- Perfect for UI development
- Data persists between restarts

### Cloud Development (PostgreSQL)

- Use Railway/Supabase dashboard
- Shared between team members
- Good for testing Hedera transactions
- Production-like environment

## 🔐 Environment Variables

### Required for All Environments:

- `OPERATOR_ID` - Your Hedera account ID
- `OPERATOR_KEY` - Your Hedera private key
- `RECV_TOKEN_ID` - Your RECV token ID
- `RNFT_TOKEN_ID` - Your rNFT token ID

### Cloud-Only Variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong production secret

### Production-Only Variables:

- `HEDERA_NETWORK=mainnet` - Use mainnet
- Strong `JWT_SECRET`
- Production `DATABASE_URL`

## 📊 Best Practices

### Development Phase:

1. Use local SQLite for UI/UX work
2. Use testnet for all Hedera operations
3. Test frequently with cloud staging

### Pre-Production:

1. Test with cloud database
2. Verify all Hedera transactions
3. Load test with realistic data

### Production:

1. Use mainnet for Hedera
2. Monitor database performance
3. Set up proper logging and alerts

## 🏆 Recommended Services

### For Small Team (0-10 users):

- **Database**: Railway PostgreSQL ($5/month)
- **Backend**: Railway (Free tier)
- **Frontend**: Vercel (Free tier)
- **Total Cost**: ~$5/month

### For Growing Project (10-1000 users):

- **Database**: Supabase Pro ($25/month)
- **Backend**: Railway Pro ($20/month)
- **Frontend**: Vercel Pro ($20/month)
- **Total Cost**: ~$65/month

### For Production (1000+ users):

- **Database**: Dedicated PostgreSQL
- **Backend**: Multiple Railway instances
- **Frontend**: Vercel with CDN
- **Total Cost**: $200-500/month
