# ReceiptoVerse Documentation

This folder contains comprehensive documentation for the ReceiptoVerse project.

## 📚 Documentation Index

### **Active Documentation**

- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete REST API endpoint documentation with request/response examples
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide for Railway, Vercel, and other platforms
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development setup, testing, and debugging guide

### **Project Root**

- **[README.md](../README.md)** - Main project documentation (start here!)

### **Archived Documentation**

- **[archive/](./archive/)** - Historical implementation notes, phase completion reports, and process documentation from development

## 🚀 Quick Links

### For Developers

1. Start with the [main README](../README.md) to understand the project
2. Follow [DEVELOPMENT.md](./DEVELOPMENT.md) for local setup
3. Refer to [API_REFERENCE.md](./API_REFERENCE.md) for endpoint details

### For Deployment

1. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
2. Configure environment variables as documented
3. Run database migrations before first deployment

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
