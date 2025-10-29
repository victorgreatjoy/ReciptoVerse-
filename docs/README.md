# ReceiptoVerse Documentation

This folder contains comprehensive documentation for the ReceiptoVerse project.

## 📚 Documentation Index

### **Essential Guides**

1. **[API_REFERENCE.md](./API_REFERENCE.md)**

   - Complete REST API endpoint documentation
   - Request/response examples for all endpoints
   - Authentication methods (JWT, API Key, Public)
   - HCS, HTS, NFT, Points, and Admin APIs

2. **[DEVELOPMENT.md](./DEVELOPMENT.md)**

   - Local development setup guide
   - Environment configuration
   - Database migrations
   - Running backend and frontend servers
   - Hedera testnet account setup

3. **[DEPLOYMENT.md](./DEPLOYMENT.md)**

   - Production deployment to Railway (backend) + Vercel (frontend)
   - Environment variable configuration
   - Database setup (PostgreSQL production)
   - Hedera service IDs configuration
   - Post-deployment verification

4. **[TESTING.md](./TESTING.md)** ✨ NEW
   - HCS integration testing (receipt anchoring, verification)
   - HTS integration testing (RVP minting, association)
   - NFT testing with HCS proof metadata
   - API endpoint testing
   - End-to-end user journey tests
   - Debugging common issues

### **Project Root**

- **[README.md](../README.md)** - Main project documentation ⭐ **START HERE FOR JUDGES**

### **Archived Documentation**

- **[archive/](./archive/)** - Historical implementation notes, phase completion reports, and process documentation from development

## 🚀 Quick Links

### For Developers

1. **Getting Started**: Read [DEVELOPMENT.md](./DEVELOPMENT.md)
2. **API Documentation**: See [API_REFERENCE.md](./API_REFERENCE.md)
3. **Testing Guide**: Follow [TESTING.md](./TESTING.md)
4. **Deploy to Production**: Use [DEPLOYMENT.md](./DEPLOYMENT.md)

### For Hackathon Judges

1. **Overview**: Read the [main README](../README.md) for complete Hedera integration details
2. **Live Testnet Resources**:
   - HCS Topic: [0.0.7153725](https://hashscan.io/testnet/topic/0.0.7153725)
   - RVP Token: [0.0.7154427](https://hashscan.io/testnet/token/0.0.7154427)
   - NFT Collection: [0.0.6927730](https://hashscan.io/testnet/token/0.0.6927730)
   - Treasury: [0.0.6913837](https://hashscan.io/testnet/account/0.0.6913837)
3. **Test the API**: Try the examples in [TESTING.md](./TESTING.md)

4. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
5. Configure environment variables as documented
6. Run database migrations before first deployment

### For Hackathon Judges

1. Read the comprehensive [README](../README.md) for full Hedera integration details
2. Check live testnet resources:
   - HCS Topic: [0.0.7153725](https://hashscan.io/testnet/topic/0.0.7153725)
   - RVP Token: [0.0.7154427](https://hashscan.io/testnet/token/0.0.7154427)
   - NFT Collection: [0.0.6927730](https://hashscan.io/testnet/token/0.0.6927730)

## 📂 Project Structure

```
ReceiptoVerse/
├── README.md                    # Main documentation (JUDGE-READY)
├── backend/                     # Node.js Express API
│   ├── src/
│   │   ├── services/blockchain/ # HCS, HTS, NFT services
│   │   ├── routes/             # API route handlers
│   │   └── database.js         # Database configuration
│   └── run-migrations.js       # HCS/HTS schema migrations
├── frontend/                    # React Vite app
│   └── src/
│       ├── components/         # UI components (including RVPTokenCard)
│       └── services/           # API clients
└── docs/                       # Documentation (you are here)
    ├── API_REFERENCE.md        # API endpoints
    ├── DEPLOYMENT.md           # Production guide
    ├── DEVELOPMENT.md          # Dev setup
    └── archive/                # Historical docs
```

## 🔧 Common Tasks

### Starting Development

```powershell
# Backend
cd backend
npm install
npm run migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Testing Hedera Integration

```powershell
# Test HCS service
cd backend
node test-hts-service.js

# Test NFT API
node test-nft-api.js

# Check user HTS fields
node check-user-hts.js
```

### Database Operations

```powershell
# Apply migrations
cd backend
npm run migrate

# Verify schema
node verify-db-schema.js
```

## 🔗 External Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [HashConnect SDK](https://github.com/Hashpack/hashconnect)
- [Hedera SDK for JavaScript](https://github.com/hashgraph/hedera-sdk-js)
- [HashScan Explorer](https://hashscan.io/testnet)
- [Hedera Portal (Faucet)](https://portal.hedera.com/)

---

**For questions or issues**, refer to the troubleshooting section in the [main README](../README.md#-troubleshooting).
