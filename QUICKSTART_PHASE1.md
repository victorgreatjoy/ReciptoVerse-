# 🚀 Quick Start: Phase 1 - HCS Receipt Anchoring

## TL;DR - Get Started in 5 Minutes

### 1. Install Dependencies (if not already installed)

```bash
cd backend
npm install
```

### 2. Get Hedera Testnet Account

Visit: https://portal.hedera.com/register

- Create account
- Save your Account ID (0.0.XXXXX)
- Save your Private Key

### 3. Configure Environment

Add to `backend/.env`:

```bash
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY
```

### 4. Run Database Migration

```bash
cd backend
# PostgreSQL
psql -U your_user -d receiptoverse -f migrations/001_add_hcs_fields.sql

# Or use your migration tool
npm run migrate
```

### 5. Setup Blockchain

```bash
npm run blockchain:setup
```

This will:

- ✅ Initialize Hedera connection
- ✅ Create HCS topic for receipts
- ✅ Test anchoring a sample receipt
- ✅ Output your HCS_RECEIPT_TOPIC_ID

### 6. Add Topic ID to .env

Copy the topic ID from setup output:

```bash
HCS_RECEIPT_TOPIC_ID=0.0.YOUR_TOPIC_ID
```

### 7. Start Server

```bash
npm run dev
```

### 8. Test API

```bash
# Anchor a receipt
curl -X POST http://localhost:3000/api/receipts/YOUR_RECEIPT_ID/anchor \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verify receipt
curl http://localhost:3000/api/receipts/YOUR_RECEIPT_ID/verify

# Get proof
curl http://localhost:3000/api/receipts/YOUR_RECEIPT_ID/proof
```

---

## ✅ Success Checklist

- [ ] Hedera testnet account created
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Blockchain setup script ran successfully
- [ ] HCS_RECEIPT_TOPIC_ID added to .env
- [ ] Server starts without errors
- [ ] Test receipt anchored
- [ ] Verification returns `isValid: true`
- [ ] HashScan shows your topic messages

**View on HashScan:** https://hashscan.io/testnet/topic/YOUR_TOPIC_ID

---

## 📁 Files Created

```
backend/
├── src/
│   ├── services/
│   │   └── blockchain/
│   │       ├── dltGateway.js           # Central Hedera service
│   │       ├── hcsReceiptService.js    # Receipt anchoring
│   │       └── initBlockchain.js       # Initialization
│   └── routes/
│       └── hcsReceipts.js              # API endpoints
├── migrations/
│   └── 001_add_hcs_fields.sql          # Database schema
├── setup-blockchain.js                  # One-time setup
└── .env.blockchain                      # Config template
```

---

## 🎯 What You Can Do Now

### 1. Anchor Receipts

Every receipt in your system can now be anchored to the Hedera blockchain for tamper-proof storage.

### 2. Verify Receipts

Anyone can verify a receipt's authenticity using the blockchain proof.

### 3. Provide Proofs

Give customers/advertisers blockchain proof of their purchases.

### 4. Third-Party Integration

Other apps can verify your receipts via the Mirror Node API.

---

## 💡 Next Steps

**After Phase 1 is working:**

**Phase 2: HTS Reward Tokens** (Coming next)

- Create fungible RVP token
- Award tokens for receipts
- Token transfers and balances

**Phase 3: Smart Contracts**

- NFT benefits manager
- Upgrade mechanics
- Marketplace escrow

---

## 🆘 Need Help?

1. **Check logs** for error messages
2. **Verify .env** has all required variables
3. **Check HashScan** to see if transactions went through
4. **Review PHASE1_README.md** for detailed documentation

---

**You're ready to make receipts immutable! 🎉**
