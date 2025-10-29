# ReceiptoVerse 🧾⚡# ReceiptoVerse 🧾⚡

**Blockchain-Verified Receipts & Loyalty on Hedera\*\***Blockchain-Verified Receipts & Loyalty on Hedera\*\*

A complete receipt management and loyalty platform leveraging Hedera Consensus Service (HCS) for immutable receipt anchoring, Hedera Token Service (HTS) for on-chain reward points, and NFT rewards — built for the Hedera Hackathon.A complete receipt management and loyalty platform leveraging Hedera Consensus Service (HCS) for immutable receipt anchoring, Hedera Token Service (HTS) for on-chain reward points, and NFT rewards — built for the Hedera Hackathon.

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00D4AA?style=for-the-badge&logo=hedera&logoColor=white)](https://hashscan.io/testnet)[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00D4AA?style=for-the-badge&logo=hedera&logoColor=white)](https://hashscan.io/testnet)

[![HCS Topic](https://img.shields.io/badge/HCS%20Topic-0.0.7153725-0052FF?style=for-the-badge)](https://hashscan.io/testnet/topic/0.0.7153725)[![HCS Topic](https://img.shields.io/badge/HCS%20Topic-0.0.7153725-0052FF?style=for-the-badge)](https://hashscan.io/testnet/topic/0.0.7153725)

[![RVP Token](https://img.shields.io/badge/RVP%20Token-0.0.7154427-00D4AA?style=for-the-badge)](https://hashscan.io/testnet/token/0.0.7154427)[![RVP Token](https://img.shields.io/badge/RVP%20Token-0.0.7154427-00D4AA?style=for-the-badge)](https://hashscan.io/testnet/token/0.0.7154427)

---

## 📋 Table of Contents## 📋 Table of Contents

- [The Problem](#-the-problem)- [The Problem](#-the-problem)

- [Our Solution](#-our-solution)- [Our Solution](#-our-solution)

- [Hedera Integration](#-hedera-integration-deep-dive)- [Hedera Integration](#-hedera-integration-deep-dive)

- [Architecture](#-architecture)- [Architecture](#-architecture)

- [Live Demo](#-live-demo)- [Live Demo](#-live-demo)

- [Key Features](#-key-features)- [Key Features](#-key-features)

- [Getting Started](#-getting-started)- [Getting Started](#-getting-started)

- [API Reference](#-api-reference)- [API Reference](#-api-reference)

- [Technology Stack](#-technology-stack)- [Technology Stack](#-technology-stack)

- [Hackathon Compliance](#-hackathon-compliance)- [Hackathon Compliance](#-hackathon-compliance)

- [Team & Contact](#-team--contact)- [Team & Contact](#-team--contact)

---

## 🎯 The Problem## 🎯 The Problem

Traditional receipt systems face critical challenges:Traditional receipt systems face critical challenges:

1. **Fraud & Tampering**: Paper receipts are easily forged; digital receipts lack integrity proofs1. **Fraud & Tampering**: Paper receipts are easily forged; digital receipts lack integrity proofs

2. **Lost Receipts**: Consumers lose ~30% of paper receipts, making returns/warranties difficult2. **Lost Receipts**: Consumers lose ~30% of paper receipts, making returns/warranties difficult

3. **Privacy Concerns**: Centralized receipt databases expose sensitive purchase data3. **Privacy Concerns**: Centralized receipt databases expose sensitive purchase data

4. **Loyalty Fragmentation**: Each merchant has separate loyalty programs with opaque point systems4. **Loyalty Fragmentation**: Each merchant has separate loyalty programs with opaque point systems

5. **No Verifiability**: Third parties (insurers, auditors) cannot verify receipt authenticity5. **No Verifiability**: Third parties (insurers, auditors) cannot verify receipt authenticity

**Impact**: Billions in retail fraud annually, poor customer experience, environmental waste from paper receipts.**Impact**: Billions in retail fraud annually, poor customer experience, environmental waste from paper receipts.

---

## 💡 Our Solution## 💡 Our Solution

**ReceiptoVerse** combines three Hedera services to create a **decentralized, verifiable, privacy-preserving receipt ecosystem**:**ReceiptoVerse** combines three Hedera services to create a **decentralized, verifiable, privacy-preserving receipt ecosystem**:

### 1. **Immutable Receipt Anchoring (HCS)**### 1. **Immutable Receipt Anchoring (HCS)**

Every receipt is cryptographically hashed and anchored to Hedera Consensus Service, creating an immutable, timestamped proof-of-existence. Anyone can verify a receipt's integrity without exposing sensitive data.Every receipt is cryptographically hashed and anchored to Hedera Consensus Service, creating an immutable, timestamped proof-of-existence. Anyone can verify a receipt's integrity without exposing sensitive data.

### 2. **On-Chain Loyalty Points (HTS)**### 2. **On-Chain Loyalty Points (HTS)**

Reward points (RVP tokens) are minted as **real, fungible tokens on Hedera Token Service**. Users own their points on-chain and can view balances on HashScan — no more "phantom points" in opaque databases.Reward points (RVP tokens) are minted as **real, fungible tokens on Hedera Token Service**. Users own their points on-chain and can view balances on HashScan — no more "phantom points" in opaque databases.

### 3. **NFT Collectible Rewards**### 3. **NFT Collectible Rewards**

Milestone achievements unlock tiered NFT rewards (Bronze Rabbit, Silver Fox, Gold Eagle) with real utility: discounts, monthly bonuses, and exclusive perks.Milestone achievements unlock tiered NFT rewards (Bronze Rabbit, Silver Fox, Gold Eagle) with real utility: discounts, monthly bonuses, and exclusive perks.

---## Features

## 🔷 Hedera Integration Deep-Dive- Receipt integrity on-chain (HCS): anchor, verify, and prove receipts without exposing PII

- On-chain loyalty points (HTS): earn RVP on purchase; frontend shows balance and association

### **Hedera Consensus Service (HCS)** — Receipt Integrity Layer- Public verification: anyone can verify a receipt’s hash and topic sequence

- Merchant POS routes: scan QR, create receipts, auto-award points (and auto-anchor)

**Why HCS?**- NFT rewards: marketplace endpoints, benefits, monthly bonuses

- **Immutable Timestamping**: Once anchored, receipt data cannot be altered (unlike traditional databases)- Robust DB migrations for HCS and HTS, SQLite (dev) and Postgres (prod)

- **Public Verifiability**: Anyone can verify receipts via Mirror Node without accessing private databases

- **Privacy-Safe**: Only hashed fingerprints go on-chain; PII stays off-ledger## Architecture

- **Cost-Effective**: ~$0.0001 per message vs. expensive smart contract storage

Backend (Node.js/Express)

**How We Use It:**

- DLT Gateway: centralized Hedera client with HCS/HTS helpers (`dltGateway.js`)

```javascript- HCS Receipt Service: anchor/verify/proof (`hcsReceiptService.js`), routes in `/api/receipts`

// 1. Generate deterministic receipt hash- HTS Points Service: initialize/token ops/balance (`htsPointsService.js`), endpoints in `/api/token`

const receiptHash = SHA256({- Receipts/Users/Merchants/Points/NFT routes wired in `src/server.js`

receiptId: "abc-123",- Database: `src/database.js` (SQLite dev, Postgres prod) + `run-migrations.js`

merchantId: hash(merchantId), // Privacy: one-way hash

userId: hash(userId), // Privacy: one-way hashFrontend (React + Vite)

total: 42.50,

currency: "USD",- HashConnect wallet pairing

itemCount: 3,- RVPTokenCard: associate RVP, view balance and HashScan link

timestamp: 1730211600000- User dashboard with receipts and NFT gallery

});

Hedera

// 2. Publish to HCS topic 0.0.7153725

await TopicMessageSubmitTransaction()- HCS topic per receipts anchoring; Mirror Node lookups

.setTopicId("0.0.7153725")- HTS fungible token RVP for loyalty; decimals=2; mint/transfer via operator treasury

.setMessage(JSON.stringify({

    receiptHash,## Quick start

    timestamp,

    metadata: { total, currency, itemCount }Prerequisites

}))

.execute(client);- Node 18+

- Hedera testnet account with HBAR (for OPERATOR)

// 3. Store sequence # in database- Optional Postgres for production (SQLite used locally)

receipt.hcs_sequence = receipt.sequenceNumber;- Pinata or compatible IPFS pinning

receipt.hcs_timestamp = receipt.consensusTimestamp;

````Environment (.env)

Create `backend/.env` using these keys (sample):

**Public Verification Flow:**

```bash```properties

# Anyone can verify without authenticationNODE_ENV=development

GET /api/receipts/public/:id/verifyHEDERA_NETWORK=testnet

OPERATOR_ID=0.0.xxxxxx

# Returns:OPERATOR_KEY=302e020100300506032b657004220420... # or 0x... format

{

  "isValid": true,# HCS (set to reuse an existing topic; otherwise created on first run)

  "receipt": {HCS_RECEIPT_TOPIC_ID=0.0.7153725

    "id": "abc-123",

    "hash": "a3f5...",# HTS Points (set after token is created or use the provided testnet token)

    "hcsTopicId": "0.0.7153725",HTS_POINTS_TOKEN_ID=0.0.7154427

    "hcsSequence": 42,

    "consensusTimestamp": "2025-10-29T12:00:00Z"# Auth and server

  },JWT_SECRET=change_me

  "hcsData": {PORT=3000

    "hash": "a3f5...",  // ✅ Matches!FRONTEND_URL=http://localhost:5173

    "runningHash": "b7c2...",

    "consensusTimestamp": "2025-10-29T12:00:00Z"# Database (empty = SQLite local)

  },DATABASE_URL=

  "hashMatch": true

}# Email (optional) & reCAPTCHA (optional in dev)

```EMAIL_HOST=

EMAIL_USER=

**View on HashScan:**EMAIL_PASS=

- Topic: [0.0.7153725](https://hashscan.io/testnet/topic/0.0.7153725)EMAIL_FROM=

- Example Message: [View on Mirror Node](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7153725/messages)RECAPTCHA_SECRET_KEY=



---# IPFS (Pinata)

PINATA_API_KEY=

### **Hedera Token Service (HTS)** — On-Chain Loyalty PointsPINATA_SECRET_API_KEY=

PINATA_JWT=

**Why HTS?**```

- **True Ownership**: Users own RVP tokens in their Hedera wallet (not "points in a database")

- **Transparency**: All balances visible on-chain via HashScanInstall and run (Windows PowerShell)

- **Interoperability**: Tokens could be traded, used across merchants, or bridged to other ecosystems

- **Atomic Operations**: Mint/transfer/burn are atomic on-chain transactions- Backend

  1. `cd backend`

**Token Details:**  2. `npm install`

- **Token ID**: `0.0.7154427`  3. `npm run migrate`

- **Symbol**: RVP (ReceiptoVerse Points)  4. `npm run dev` (or `npm start`)

- **Type**: Fungible Token- Frontend

- **Decimals**: 2 (13 points = 13.00 RVP on-chain)  1. `cd frontend`

- **Max Supply**: 1,000,000,000  2. `npm install`

- **Treasury**: `0.0.6913837`  3. `npm run dev`



**How We Use It:**Visit: http://localhost:5173



```javascript## Hedera integrations

// 1. User makes $100 purchase

// 2. Award 100 points (10,000 units on-chain due to 2 decimals)HCS: Receipts anchoring and public verification



// Check association first (Mirror Node API)- Anchor: POST `/api/receipts/:id/anchor` (auth)

const isAssociated = await checkAssociation(userAccountId, RVP_TOKEN_ID);- Verify: GET `/api/receipts/:id/verify` (public)

- Public verify: GET `/api/receipts/public/:id/verify`

if (isAssociated) {- Proof bundle: GET `/api/receipts/:id/proof`

  // 3. Mint tokens to treasury  What’s stored on-chain: deterministic receipt hash, minimal metadata, no PII.

  await TokenMintTransaction()

    .setTokenId(RVP_TOKEN_ID)HTS: RVP points token

    .setAmount(100 * 100)  // 10,000 units

    .execute(client);- Token info: GET `/api/token/info`

- Balance: GET `/api/token/balance/:accountId`

  // 4. Transfer to user- Association status: GET `/api/token/association-status/:accountId`

  await TransferTransaction()- Award flow: merchant → POS receipt → `awardPoints()` → on-chain mint to associated accounts

    .addTokenTransfer(RVP_TOKEN_ID, TREASURY, -10000)- Decimals handling: RVP has 2 decimals; 13 points → 1300 units on-chain → shows as 13.00 RVP

    .addTokenTransfer(RVP_TOKEN_ID, userAccountId, +10000)

    .execute(client);Frontend wallet + RVP UX

}

```- Connect via HashConnect; backend records `hedera_account_id`

- RVPTokenCard lets users associate the token (wallet-signed TokenAssociateTransaction)

**User Experience:**- After association, backend `awardPoints` mints on-chain and UI shows live balance + HashScan links

1. **Connect Wallet**: HashPack/Blade wallet via HashConnect

2. **Associate Token**: One-time association (user signs `TokenAssociateTransaction`)NFT rewards

3. **Earn Points**: Automatic on-chain minting when making purchases

4. **View Balance**: Frontend shows live balance + HashScan link- Types, eligibility, mint, collection, benefits, discount, and monthly bonuses under `/api/nft`

5. **Use Points**: Redeem for NFTs or merchant discounts- Metadata pinned to IPFS; planned: include HCS proof fields into NFT metadata



**View on HashScan:**## API surface (high level)

- Token: [0.0.7154427](https://hashscan.io/testnet/token/0.0.7154427)

- Treasury: [0.0.6913837](https://hashscan.io/testnet/account/0.0.6913837)- Users: register/login/profile/QR/wallet connect/associate/disconnect

- Receipts: CRUD, categories, list, single, HCS verify/proof, NFT gallery

---- Token (HTS): info, balance, association-status

- Points: balance, history, award, tiers, stats

### **NFT Rewards** — Gamified Loyalty

**Token ID**: `0.0.6927730` (Receipt NFT Collection)

**Tiers:**
- 🐰 **Bronze Rabbit** (100 points) — 5% discount, 10 bonus points/month
- 🦊 **Silver Fox** (500 points) — 10% discount, 25 bonus points/month
- 🦅 **Gold Eagle** (1000 points) — 15% discount, 50 bonus points/month

**Metadata (IPFS via Pinata) with HCS Proof:**
```json
{
  "name": "Gold Eagle #42",
  "description": "Premium tier loyalty NFT",
  "image": "ipfs://QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP",
  "attributes": [
    { "trait_type": "Tier", "value": "Gold" },
    { "trait_type": "Animal", "value": "Eagle" },
    { "trait_type": "Discount", "value": "15%" },
    { "trait_type": "Monthly Bonus", "value": "50 RVP" },
    { "trait_type": "Receipt Verified", "value": "true" },
    { "trait_type": "HCS Topic", "value": "0.0.7153725" },
    { "trait_type": "HCS Sequence", "value": "42" }
  ],
  "properties": {
    "receiptHash": "a3f5c8d2e9b1f4a7c6d8...",
    "hcsProof": {
      "topicId": "0.0.7153725",
      "sequence": 42,
      "timestamp": "2025-10-29T12:00:00.000Z",
      "hashscanUrl": "https://hashscan.io/testnet/topic/0.0.7153725/message/42"
    },
    "verified": true,
    "verificationMethod": "Hedera Consensus Service (HCS)"
  }
}
```

**🔗 Cross-Service Integration**: Each NFT is cryptographically linked to a verified receipt on HCS, proving authenticity and enabling third-party verification via HashScan.

---

  ]2. Creates receipt via `/api/merchant/pos/create-receipt` or `/api/merchant/scan-qr`

}3. System auto-anchors receipt to HCS (fire-and-forget)

```4. Points awarded via `awardPoints` → HTS mint if the user is associated

5. Notifications dispatched; merchant stats updated

---

## Try it

## 🏗️ Architecture

1. Connect your HashPack (testnet) in the UI

```2. Use the RVP card to “Associate RVP Token” if needed

┌─────────────────┐3. Create a purchase from the merchant test script or UI — watch RVP balance update

│  React Frontend │  (Vite + Tailwind + HashConnect)4. Open HashScan to view:

│  - Dashboard    │   - Account: https://hashscan.io/testnet/account/0.0.<yourAccount>

│  - Wallet UI    │   - Token: https://hashscan.io/testnet/token/0.0.7154427

│  - RVP Balance  │   - HCS topic: https://hashscan.io/testnet/topic/0.0.7153725

└────────┬────────┘

         │ REST API## Troubleshooting

         │

┌────────▼────────────────────────────────────────┐- “Account is not associated”: Associate RVP in the UI first; backend will skip on-chain minting if not associated

│           Express Backend (Node.js)             │- “RVP shows 0.13 for 13 points”: Fixed via decimals scaling (token has 2 decimals; UI displays humanized balance)

│  ┌──────────────────────────────────────────┐  │- “Missing columns/SQLite errors”: run `npm run migrate` in `backend`

│  │         DLT Gateway Service              │  │- “HTS service not initialized”: ensure `HTS_POINTS_TOKEN_ID` and valid `OPERATOR_ID/KEY` are set

│  │  (Unified Hedera Client Management)      │  │

│  └──────────────┬───────────────────────────┘  │## Security notes

│                 │                                │

│    ┌────────────┼────────────┐                  │- Do not commit real operator/private keys; use env vars or a secret manager

│    │            │            │                  │- Enforce rate limits (AI routes already limited); validate inputs (Joi used across routes)

│    ▼            ▼            ▼                  │- Consider multisig for treasury; minimize operator-key surface in production

│  ┌────┐     ┌─────┐     ┌──────┐               │

│  │HCS │     │ HTS │     │ NFT  │               │## Tech stack

│  │Svc │     │ Svc │     │ Svc  │               │

│  └────┘     └─────┘     └──────┘               │- Backend: Node.js, Express, @hashgraph/sdk, SQLite/Postgres, Joi, Nodemailer, SendGrid (optional), Socket.IO

│                                                  │- Frontend: React, Vite, Tailwind, HashConnect, Redux Toolkit

│  ┌──────────────────────────────────────────┐  │- Storage: IPFS (Pinata)

│  │  SQLite (dev) / PostgreSQL (prod)        │  │- Network: Hedera testnet

│  │  - users, receipts, merchants, points    │  │

│  │  - HCS fields (topic_id, sequence, hash) │  │## Useful scripts

│  │  - HTS fields (account_id, balance, txs) │  │

│  └──────────────────────────────────────────┘  │- `backend/run-migrations.js` — applies HCS/HTS schema

└─────────────────────────────────────────────────┘- `backend/test-hts-service.js` — quick HTS init/assoc/balance diagnostics

                     │- `backend/test-token-api.ps1` — token API checks on Windows

                     │- `backend/check-user-hts.js` — view user’s HTS fields and points sync

         ┌───────────▼──────────────┐

         │   Hedera Testnet         │## License

         │                          │

         │  ┌────────────────────┐  │This is a hackathon/MVP-grade project for demonstration and exploration. See individual package licenses for third-party dependencies.

         │  │ HCS Topic          │  │

         │  │ 0.0.7153725        │  │— Built with ❤️ on Hedera

         │  │ (Receipt Anchors)  │  │
         │  └────────────────────┘  │
         │                          │
         │  ┌────────────────────┐  │
         │  │ HTS Token          │  │
         │  │ 0.0.7154427 (RVP)  │  │
         │  │ Fungible, 2 dec.   │  │
         │  └────────────────────┘  │
         │                          │
         │  ┌────────────────────┐  │
         │  │ NFT Collection     │  │
         │  │ 0.0.6927730        │  │
         │  │ (Reward Tiers)     │  │
         │  └────────────────────┘  │
         └──────────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │ Mirror Node │ (Public queries)
              └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  HashScan   │ (Block Explorer)
              └─────────────┘
````

### Data Flow: Purchase → Points → On-Chain

```
1. Customer scans QR at merchant POS
2. Merchant creates receipt via API
   ├─> Backend anchors receipt to HCS (async)
   └─> Backend awards points to user
       └─> Query: Is user's wallet associated with RVP?
           ├─> YES: Mint RVP tokens on-chain → Transfer to user
           └─> NO:  Store points in DB (can sync later)
3. User sees updated RVP balance in dashboard
4. User clicks "View on HashScan" → sees on-chain balance
```

---

## 🎬 Live Demo

### **Try It Yourself (Testnet)**

1. **Visit**: Frontend app (if deployed to Vercel/Railway)
2. **Connect Wallet**: Use HashPack (testnet mode)
3. **Get Test HBAR**: [Hedera Faucet](https://portal.hedera.com/faucet)
4. **Associate RVP Token**: Click "Associate RVP Token" in dashboard
5. **Make Test Purchase**: Use merchant POS or test endpoint
6. **View Results**:
   - On-chain balance: [Your Account on HashScan](https://hashscan.io/testnet/account/YOUR_ID)
   - Receipt proof: Click "Verify on Hedera" badge
   - HCS messages: [Topic 0.0.7153725](https://hashscan.io/testnet/topic/0.0.7153725)

### **Example API Test**

```bash
# 1. Create receipt (auto-anchors to HCS)
curl -X POST http://localhost:3000/api/receipts \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Coffee Shop",
    "amount": 15.50,
    "receiptDate": "2025-10-29",
    "category": "food",
    "items": [
      {"name": "Latte", "price": 4.50, "quantity": 2},
      {"name": "Croissant", "price": 6.50, "quantity": 1}
    ]
  }'

# 2. Verify receipt on-chain
curl http://localhost:3000/api/receipts/public/{receiptId}/verify

# 3. Check RVP balance
curl http://localhost:3000/api/token/balance/0.0.YOUR_ACCOUNT_ID
```

---

## ✨ Key Features

### **For Consumers**

- ✅ **Digital Receipt Wallet**: All receipts in one secure place
- ✅ **Blockchain Verification**: Prove receipt authenticity anytime, anywhere
- ✅ **Earn Real Tokens**: RVP points are actual Hedera tokens you own
- ✅ **Collectible NFT Rewards**: Unlock rare NFTs with special perks
- ✅ **Privacy First**: Purchase details stay private; only hashes on-chain
- ✅ **Cross-Merchant**: Use one app for all participating merchants

### **For Merchants**

- ✅ **Fraud Prevention**: HCS timestamps eliminate receipt tampering
- ✅ **Customer Loyalty**: Automated points + NFT rewards increase retention
- ✅ **POS Integration**: Simple QR scan → instant receipt + rewards
- ✅ **Analytics Dashboard**: Track customer behavior, popular items
- ✅ **API Access**: RESTful API for custom integrations

### **For Auditors/Insurers**

- ✅ **Public Verification**: Verify receipts without merchant cooperation
- ✅ **Immutable Audit Trail**: All receipts timestamped on Hedera
- ✅ **No Database Access**: Verify via Mirror Node (no proprietary APIs)

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- Hedera testnet account with HBAR ([Get from Faucet](https://portal.hedera.com/faucet))
- PostgreSQL (production) or SQLite (development - auto-created)
- Pinata account for IPFS (optional for NFTs)

### **Environment Setup**

Create `backend/.env`:

```properties
# Hedera Network
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxxx           # Your operator account
OPERATOR_KEY=302e020100...       # Your private key (DER or 0x hex)

# HCS Receipt Topic (or leave blank to auto-create)
HCS_RECEIPT_TOPIC_ID=0.0.7153725

# HTS RVP Token (or leave blank to create new)
HTS_POINTS_TOKEN_ID=0.0.7154427

# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_random_secret_here

# Database (leave empty for SQLite)
DATABASE_URL=

# Email (optional for verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@receiptoverse.com

# reCAPTCHA (optional in dev)
RECAPTCHA_SECRET_KEY=

# IPFS (Pinata - for NFT metadata)
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
PINATA_JWT=
```

### **Installation & Running**

**Backend:**

```powershell
cd backend
npm install
npm run migrate      # Apply HCS/HTS database schema
npm run dev          # Start development server (port 3000)
```

**Frontend:**

```powershell
cd frontend
npm install
npm run dev          # Start Vite dev server (port 5173)
```

**Access**: Open http://localhost:5173

---

## 📚 API Reference

### **Core Endpoints**

| Endpoint                                   | Method | Description                          | Auth    |
| ------------------------------------------ | ------ | ------------------------------------ | ------- |
| `/api/users/register`                      | POST   | Register new user                    | Public  |
| `/api/users/login`                         | POST   | Login with email/password            | Public  |
| `/api/users/wallet-connect`                | POST   | Link Hedera account                  | JWT     |
| `/api/users/associate-rvp`                 | POST   | Associate RVP token                  | JWT     |
| `/api/receipts`                            | GET    | List user receipts                   | JWT     |
| `/api/receipts`                            | POST   | Create receipt (auto-anchors to HCS) | JWT     |
| `/api/receipts/:id/verify`                 | GET    | Verify receipt on HCS                | JWT     |
| `/api/receipts/public/:id/verify`          | GET    | Public verification                  | Public  |
| `/api/receipts/:id/proof`                  | GET    | Get HCS proof bundle                 | JWT     |
| `/api/token/info`                          | GET    | RVP token details                    | Public  |
| `/api/token/balance/:accountId`            | GET    | Get on-chain RVP balance             | Public  |
| `/api/token/association-status/:accountId` | GET    | Check if associated                  | Public  |
| `/api/points/balance`                      | GET    | User points balance                  | JWT     |
| `/api/points/history`                      | GET    | Points transaction history           | JWT     |
| `/api/merchant/pos/create-receipt`         | POST   | Create receipt + award points        | API Key |
| `/api/nft/types`                           | GET    | Available NFT tiers                  | Public  |
| `/api/nft/mint`                            | POST   | Mint NFT reward                      | JWT     |

**Full API documentation**: See `docs/API_REFERENCE.md`

---

## 🛠️ Technology Stack

### **Backend**

- **Runtime**: Node.js 18+
- **Framework**: Express 5.1
- **Blockchain**: @hashgraph/sdk 2.73.2
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Validation**: Joi
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Nodemailer / SendGrid
- **Storage**: IPFS (Pinata)
- **Real-time**: Socket.IO

### **Frontend**

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3.4
- **Wallet**: HashConnect (HashPack/Blade)
- **State**: Redux Toolkit
- **Routing**: React Router 7
- **Animations**: Framer Motion

### **Blockchain Infrastructure**

- **Network**: Hedera Testnet
- **Services**: HCS (Consensus), HTS (Token), NFT
- **Explorer**: HashScan
- **API**: Mirror Node REST API

---

## 🏆 Hackathon Compliance

### **Hedera Services Utilized**

✅ **Hedera Consensus Service (HCS)**

- **Topic ID**: 0.0.7153725
- **Use Case**: Immutable receipt anchoring, public verification
- **Implementation**: `backend/src/services/blockchain/hcsReceiptService.js`
- **Evidence**: [View Topic on HashScan](https://hashscan.io/testnet/topic/0.0.7153725)

✅ **Hedera Token Service (HTS)**

- **Token ID**: 0.0.7154427 (RVP)
- **Use Case**: On-chain loyalty points, true token ownership
- **Implementation**: `backend/src/services/blockchain/htsPointsService.js`
- **Evidence**: [View Token on HashScan](https://hashscan.io/testnet/token/0.0.7154427)

✅ **NFT Rewards (HTS NFT)**

- **Collection ID**: 0.0.6927730
- **Use Case**: Gamified tiered rewards with utility perks
- **Implementation**: `backend/src/routes/nftRoutes.js`
- **Evidence**: [View Collection on HashScan](https://hashscan.io/testnet/token/0.0.6927730)

### **Innovation Highlights**

1. **Privacy-First HCS**: Only hashes go on-chain; PII stays off-ledger
2. **Dual-Ledger Architecture**: Database for queries + Hedera for immutability
3. **Association-Aware HTS**: Smart minting only for associated accounts
4. **Auto-Anchoring**: Fire-and-forget async receipt anchoring
5. **Public Verifiability**: Anyone can verify receipts via Mirror Node

---

## 🧪 Testing

### **Manual Test Flow**

```powershell
# 1. Start backend
cd backend
npm run dev

# 2. Test HCS anchoring
curl -X POST http://localhost:3000/api/receipts \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"storeName":"Test Store","amount":10.00,"category":"food"}'

# 3. Verify on-chain
curl http://localhost:3000/api/receipts/public/{RECEIPT_ID}/verify

# 4. Check HashScan
# Visit: https://hashscan.io/testnet/topic/0.0.7153725
```

### **Automated Tests**

```powershell
# Backend API tests
cd backend
npm test                      # Unit tests
node test-hts-service.js      # HTS integration test
node test-nft-api.js          # NFT endpoint test
```

---

## 🐛 Troubleshooting

| Issue                          | Solution                                                               |
| ------------------------------ | ---------------------------------------------------------------------- |
| "Account is not associated"    | Associate RVP token in UI first (one-time `TokenAssociateTransaction`) |
| "RVP shows 0.13 for 13 points" | Fixed: Token has 2 decimals, UI displays correctly as 13.00 RVP        |
| "Missing columns in database"  | Run `npm run migrate` in `backend/`                                    |
| "HTS service not initialized"  | Ensure `HTS_POINTS_TOKEN_ID` and `OPERATOR_ID/KEY` are set in `.env`   |
| "Invalid operator key"         | Use full DER format or 0x hex; check for whitespace/newlines           |

---

## 🔒 Security Notes

- ⚠️ **Never commit** private keys to Git (use `.env` with `.gitignore`)
- 🔐 Use secret management (Railway Secrets, Vercel Env Vars) in production
- 🚦 Rate limiting enabled on AI and auth endpoints
- ✅ Input validation via Joi schemas on all routes
- 🔍 Consider multisig treasury for production HTS operations

---

## 📖 Documentation

- **Architecture**: See ASCII diagram above
- **API Reference**: Full endpoint docs in `docs/API_REFERENCE.md`
- **Deployment**: Production guide in `docs/DEPLOYMENT.md`
- **Development**: Local setup details in `docs/DEVELOPMENT.md`
- **Archived Process Docs**: See `docs/archive/` (historical implementation notes)

---

## 📞 Team & Contact

**Project**: ReceiptoVerse  
**Built For**: Hedera Hackathon 2024  
**Network**: Hedera Testnet

**Quick Links**:

- HCS Topic: [0.0.7153725](https://hashscan.io/testnet/topic/0.0.7153725)
- RVP Token: [0.0.7154427](https://hashscan.io/testnet/token/0.0.7154427)
- NFT Collection: [0.0.6927730](https://hashscan.io/testnet/token/0.0.6927730)
- Treasury: [0.0.6913837](https://hashscan.io/testnet/account/0.0.6913837)

---

## 📄 License

This is a hackathon/MVP project for demonstration purposes. See individual package licenses for third-party dependencies.

---

**Built with ❤️ on Hedera Hashgraph**

_"True ownership, immutable proof, gamified rewards — all on-chain."_
