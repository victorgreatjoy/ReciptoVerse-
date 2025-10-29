# 🚀 Phase 1: HCS Receipt Anchoring - Implementation Complete

## Overview

Phase 1 implements **Hedera Consensus Service (HCS)** integration for immutable receipt storage on the blockchain.

### What's Included

✅ **DLT Gateway** - Central service for all Hedera interactions  
✅ **HCS Receipt Service** - Receipt anchoring and verification  
✅ **Database Schema** - HCS fields added to receipts table  
✅ **API Endpoints** - Anchor, verify, and get proofs  
✅ **Setup Script** - One-command initialization

---

## 📋 Prerequisites

1. **Hedera Testnet Account**

   - Get free account: https://portal.hedera.com/
   - You'll receive: Account ID (0.0.XXXXX) and Private Key

2. **HBAR Balance**

   - Testnet HBAR is free
   - Each HCS message costs ~$0.0001 (mainnet)

3. **Dependencies**
   ```bash
   npm install @hashgraph/sdk axios
   ```

---

## 🛠️ Setup Instructions

### Step 1: Configure Environment

1. Copy blockchain environment template:

   ```bash
   cp backend/.env.blockchain backend/.env
   ```

2. Add your Hedera credentials to `.env`:
   ```bash
   HEDERA_NETWORK=testnet
   HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY_HERE
   ```

### Step 2: Run Database Migration

```bash
cd backend
psql -U your_user -d receiptoverse -f migrations/001_add_hcs_fields.sql
```

Or use your existing migration system.

### Step 3: Initialize Blockchain Services

Run the setup script:

```bash
cd backend
node setup-blockchain.js
```

This will:

- Initialize DLT Gateway
- Create HCS topic for receipts
- Test anchoring a sample receipt
- Verify the test receipt
- Output your HCS_RECEIPT_TOPIC_ID

### Step 4: Add Topic ID to Environment

Copy the topic ID from setup output and add to `.env`:

```bash
HCS_RECEIPT_TOPIC_ID=0.0.YOUR_TOPIC_ID
```

### Step 5: Update Server Initialization

Add to your `backend/src/index.js` or `server.js`:

```javascript
const {
  initializeBlockchainServices,
} = require("./services/blockchain/initBlockchain");

// After database connection, before starting server
await initializeBlockchainServices();
```

### Step 6: Register Routes

Add HCS receipt routes to your Express app:

```javascript
const hcsReceiptRoutes = require("./routes/hcsReceipts");
app.use("/api/receipts", hcsReceiptRoutes);
```

---

## 📡 API Endpoints

### 1. Anchor Receipt to HCS

**POST** `/api/receipts/:id/anchor`

Anchors a receipt to the Hedera blockchain for immutable storage.

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "success": true,
  "message": "Receipt successfully anchored to Hedera blockchain",
  "data": {
    "receiptId": "uuid-here",
    "receiptHash": "sha256-hash",
    "hcsTopicId": "0.0.12345",
    "hcsSequence": "1234567890",
    "hcsTimestamp": "1234567890.123456789",
    "hcsTransactionId": "0.0.12345@1234567890.123456789"
  }
}
```

### 2. Verify Receipt

**GET** `/api/receipts/:id/verify`

Verifies receipt integrity by comparing database hash with HCS message.

**Response:**

```json
{
  "success": true,
  "message": "Receipt verified successfully",
  "data": {
    "isValid": true,
    "receipt": {
      "id": "uuid-here",
      "hash": "sha256-hash",
      "hcsTopicId": "0.0.12345",
      "hcsSequence": "1234567890",
      "hcsTimestamp": "timestamp"
    },
    "hcsData": {
      "hash": "sha256-hash",
      "timestamp": 1698765432,
      "consensusTimestamp": "1234567890.123456789",
      "runningHash": "hex-hash"
    },
    "match": {
      "hashMatch": true,
      "receiptIdMatch": true
    }
  }
}
```

### 3. Get Receipt Proof

**GET** `/api/receipts/:id/proof`

Returns blockchain proof for third-party verification.

**Response:**

```json
{
  "success": true,
  "message": "Receipt proof retrieved successfully",
  "data": {
    "receiptId": "uuid-here",
    "receiptHash": "sha256-hash",
    "hcsProof": {
      "topicId": "0.0.12345",
      "sequenceNumber": "1234567890",
      "consensusTimestamp": "timestamp",
      "transactionId": "0.0.12345@timestamp",
      "anchoredAt": "2025-10-28T12:00:00Z",
      "runningHash": "hex-hash"
    },
    "receiptData": {
      "total": 99.99,
      "currency": "USD",
      "date": "2025-10-28"
    },
    "verificationUrl": "https://your-api.com/api/receipts/uuid/verify",
    "mirrorNodeUrl": "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.12345/messages/1234567890"
  }
}
```

### 4. Bulk Anchor Receipts

**POST** `/api/receipts/bulk-anchor`

Anchor multiple receipts at once (for migration).

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**

```json
{
  "receiptIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk anchoring completed",
  "data": {
    "success": [
      { "receiptId": "uuid-1", "hcsSequence": "123" },
      { "receiptId": "uuid-2", "hcsSequence": "124" }
    ],
    "failed": [{ "receiptId": "uuid-3", "error": "Not found" }]
  }
}
```

### 5. Get HCS Status

**GET** `/api/receipts/hcs/status`

Check if HCS services are running.

**Response:**

```json
{
  "success": true,
  "data": {
    "initialized": true,
    "receiptTopicId": "0.0.12345",
    "network": {
      "network": "testnet",
      "operatorId": "0.0.YOUR_ACCOUNT",
      "mirrorNodeUrl": "https://testnet.mirrornode.hedera.com",
      "isInitialized": true
    }
  }
}
```

---

## 🧪 Testing

### Test Anchoring

```bash
curl -X POST http://localhost:3000/api/receipts/YOUR_RECEIPT_ID/anchor \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Verification

```bash
curl http://localhost:3000/api/receipts/YOUR_RECEIPT_ID/verify
```

### Test Proof Retrieval

```bash
curl http://localhost:3000/api/receipts/YOUR_RECEIPT_ID/proof
```

---

## 🔍 How It Works

### Receipt Anchoring Flow

1. **User creates receipt** → Stored in PostgreSQL database
2. **System generates hash** → SHA-256 of receipt data (merchant, total, date, items)
3. **Publish to HCS topic** → Minimal data sent to Hedera (no PII)
4. **Store consensus data** → Topic ID, sequence number, timestamp saved in DB
5. **Return proof** → User receives blockchain proof

### Data Privacy

**On-Chain (HCS Topic):**

```json
{
  "receiptId": "uuid",
  "hash": "sha256-hash",
  "timestamp": 1698765432,
  "merchantId": "hashed-id", // ← Privacy-preserving
  "userId": "hashed-id", // ← No PII
  "total": 99.99,
  "currency": "USD",
  "itemCount": 5
}
```

**Off-Chain (Database):**

- Full receipt details
- Images, OCR data
- Personal information
- Linked to blockchain via hash

### Verification Process

1. **Fetch receipt from DB** → Get stored hash
2. **Query HCS topic** → Get message by sequence number
3. **Compare hashes** → DB hash vs HCS hash
4. **Return result** → Valid if hashes match

---

## 💰 Costs

### Testnet

- **Free** - All operations are free on testnet

### Mainnet (when you deploy)

- **HCS message**: ~$0.0001 USD
- **10,000 receipts/month**: ~$1 USD
- **100,000 receipts/month**: ~$10 USD

**Extremely affordable compared to other blockchains!**

---

## 🔗 Useful Links

- **HashScan (Testnet)**: https://hashscan.io/testnet

  - View your HCS topic messages
  - Track transactions

- **Hedera Portal**: https://portal.hedera.com/

  - Get testnet accounts
  - Manage your account

- **Mirror Node API**: https://testnet.mirrornode.hedera.com/api/v1/docs

  - Query blockchain data
  - REST API documentation

- **Hedera Docs**: https://docs.hedera.com/
  - HCS documentation
  - SDK guides

---

## 🐛 Troubleshooting

### "Failed to initialize DLT Gateway"

- Check that `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` are set in `.env`
- Verify account ID format: `0.0.XXXXX`
- Ensure private key is valid

### "Insufficient balance"

- Get free testnet HBAR at: https://portal.hedera.com/
- Check balance on HashScan

### "Topic not found"

- Run `setup-blockchain.js` to create topic
- Add `HCS_RECEIPT_TOPIC_ID` to `.env`

### "Receipt not anchored to HCS yet"

- Receipt hasn't been anchored yet
- Call `POST /api/receipts/:id/anchor` first

---

## ✅ What's Next - Phase 2

After Phase 1 is working, we'll implement:

**Phase 2: HTS Reward Tokens**

- Create fungible reward token (RVP)
- Mint tokens to users for receipts
- Token transfers and balances
- Enhanced NFT collections

**Estimated Time**: 3-4 weeks

---

## 📊 Success Metrics

- ✅ HCS topic created
- ✅ Test receipt anchored successfully
- ✅ Verification returns `isValid: true`
- ✅ Proof URL accessible
- ✅ Database fields populated
- ✅ API endpoints responding
- ✅ ViewHashScan shows messages

**When all checkboxes are ✅, Phase 1 is complete!**

---

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Hedera documentation
3. Check HashScan for your transactions
4. Verify environment variables

---

**Phase 1 Complete! 🎉**

Ready to move to Phase 2? Let me know!
