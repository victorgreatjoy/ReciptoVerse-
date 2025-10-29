# ReceiptoVerse Development Guide 🛠️

**Complete local development setup and testing guide**

This guide covers everything you need to run ReceiptoVerse locally, test Hedera integrations, and debug issues.

---

## 🚀 Quick Start (Windows)

### Prerequisites

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **Hedera Testnet Account** ([Create at portal.hedera.com](https://portal.hedera.com/))
- ✅ **HBAR from Faucet** ([Get free testnet HBAR](https://portal.hedera.com/faucet))
- ⚠️ **PostgreSQL** (optional - SQLite auto-created for local dev)

### Step 1: Clone & Install

```powershell
# Clone repository
git clone https://github.com/victorgreatjoy/ReciptoVerse-.git
cd ReciptoVerse-

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

Create `backend/.env`:

```bash
# Hedera Network
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxxx           # Your testnet account
OPERATOR_KEY=302e020100...       # Your private key (DER or 0x hex)

# HCS Receipt Topic (leave blank to auto-create)
HCS_RECEIPT_TOPIC_ID=0.0.7153725

# HTS RVP Token (leave blank to auto-create)
HTS_POINTS_TOKEN_ID=0.0.7154427

# NFT Collection (optional)
NFT_COLLECTION_ID=0.0.6927730

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_random_secret_minimum_32_characters

# Database (leave empty for SQLite)
DATABASE_URL=

# Email (optional - for user verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@receiptoverse.com

# reCAPTCHA (optional in dev)
RECAPTCHA_SECRET_KEY=

# IPFS Pinata (for NFT metadata)
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
PINATA_JWT=
```

### Step 3: Run Database Migrations

```powershell
cd backend
npm run migrate
```

**Output should show:**

```
✅ Running migrations on SQLite...
✅ Migration: Add HCS fields to receipts
✅ Migration: Add HTS support to users
✅ All migrations completed successfully
```

### Step 4: Start Development Servers

**Terminal 1 - Backend:**

```powershell
cd backend
npm run dev
```

**Output:**

```
🚀 Server running on http://localhost:3000
✅ DLT Gateway initialized
✅ HTS Points Service initialized (Token: 0.0.7154427)
📊 Database: SQLite connected
```

**Terminal 2 - Frontend:**

```powershell
cd frontend
npm run dev
```

**Output:**

```
  VITE v7.0.0  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Test the Application

1. Open http://localhost:5173
2. Register a new user
3. Connect HashPack wallet (testnet mode)
4. Associate RVP token
5. Create a test receipt
6. Verify it appears on HashScan!

---

## 🧪 Testing Hedera Integrations

# Production deployment handles this automatically

# Just push to main branch

```

## 🗃️ Database Management

### Local Development (SQLite)

- Database file: `backend/ReceiptoVerse.db`
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
```
