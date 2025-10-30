# ReceiptoVerse 🧾⚡

**Blockchain-Verified Receipts & Loyalty on Hedera**

A complete receipt management and loyalty platform leveraging **Hedera Consensus Service (HCS)** for immutable receipt anchoring, **Hedera Token Service (HTS)** for on-chain reward points, and NFT rewards — built for the **Hedera Hackathon**.

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00D4AA?style=for-the-badge&logo=hedera&logoColor=white)](https://hashscan.io/testnet)
[![HCS Topic](https://img.shields.io/badge/HCS%20Topic-0.0.7153725-0052FF?style=for-the-badge)](https://hashscan.io/testnet/topic/0.0.7153725)
[![RVP Token](https://img.shields.io/badge/RVP%20Token-0.0.7154427-00D4AA?style=for-the-badge)](https://hashscan.io/testnet/token/0.0.7154427)

---

## 📋 Table of Contents

- [🎯 The Problem](#-the-problem)
- [💡 Our Solution](#-our-solution)
- [🔷 Hedera Integration Deep-Dive](#-hedera-integration-deep-dive)
- [🏗️ Architecture](#-architecture)
- [🎬 Live Demo](#-live-demo)
- [✨ Key Features](#-key-features)
- [🚀 Getting Started](#-getting-started)
- [📚 API Reference](#-api-reference)
- [🛠️ Technology Stack](#-technology-stack)
- [🏆 Hackathon Compliance](#-hackathon-compliance)
- [👥 Team & Contact](#-team--contact)

---

## 🎯 The Problem

Traditional receipt systems face critical challenges:

1. **Fraud & Tampering** — Paper receipts are easily forged; digital receipts lack integrity proofs.
2. **Lost Receipts** — Consumers lose ~30% of paper receipts, making returns/warranties difficult.
3. **Privacy Concerns** — Centralized databases expose sensitive purchase data.
4. **Loyalty Fragmentation** — Each merchant has separate loyalty programs with opaque point systems.
5. **No Verifiability** — Third parties (insurers, auditors) cannot verify receipt authenticity.

**Impact**: Billions lost annually to retail fraud, poor customer experience, and paper waste.

---

## 💡 Our Solution

**ReceiptoVerse** combines three Hedera services to create a **decentralized, verifiable, privacy-preserving receipt ecosystem**:

### 1. Immutable Receipt Anchoring (HCS)

Receipts are cryptographically hashed and anchored to Hedera Consensus Service, creating immutable, timestamped proofs-of-existence that anyone can verify without revealing private data.

### 2. On-Chain Loyalty Points (HTS)

Reward points (RVP tokens) are minted as **real fungible tokens** on Hedera Token Service. Users truly **own** their points on-chain, viewable on HashScan.

### 3. NFT Collectible Rewards

Milestone achievements unlock NFT rewards (Bronze Rabbit, Silver Fox, Gold Eagle) with **real perks** like discounts and bonuses.

---

## 🔷 Hedera Integration Deep-Dive

### Hedera Consensus Service (HCS)

- **Immutable Timestamping**: Once anchored, receipts cannot be altered.
- **Public Verifiability**: Anyone can verify a receipt’s hash via Mirror Node.
- **Privacy-Safe**: Only hashed data goes on-chain.
- **Cost-Effective**: ≈ $0.0001 per message.

### Hedera Token Service (HTS)

- **True Ownership**: Users own RVP tokens in their wallets.
- **Transparency**: Balances visible on HashScan.
- **Atomic Operations**: Mint, transfer, and burn are atomic on-chain transactions.
- **Interoperability**: Tokens can be used across merchants or bridged elsewhere.

**Token Details**

| Field          | Value         |
| -------------- | ------------- |
| **Token ID**   | `0.0.7154427` |
| **Symbol**     | RVP           |
| **Decimals**   | 2             |
| **Max Supply** | 1,000,000,000 |
| **Treasury**   | `0.0.6913837` |

---

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Vite + Tailwind + HashConnect)
│  - Dashboard     │
│  - Wallet UI     │
│  - RVP Balance   │
└────────┬────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│           Express Backend (Node.js)       │
│  ┌─────────────────────────────────────┐ │
│  │ DLT Gateway (HCS/HTS Client)        │ │
│  ├─────────────────────────────────────┤ │
│  │ Services: Receipts / Points / NFT   │ │
│  ├─────────────────────────────────────┤ │
│  │ Database: SQLite (dev) / Postgres   │ │
│  └─────────────────────────────────────┘ │
└───────────────────────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Hedera Testnet         │
│ - HCS Topic (0.0.7153725)
│ - HTS Token (0.0.7154427)
│ - NFT Collection (0.0.6927730)
└────────────────────────┘
         │
         ▼
   HashScan / Mirror Node
```

---

## 🎬 Live Demo

### Testnet Instructions

1. Visit the frontend (e.g. `http://localhost:5173` or deployed link)
2. Connect HashPack wallet (testnet mode)
3. Get test HBAR from the [Hedera Faucet](https://portal.hedera.com/faucet)
4. Associate RVP Token
5. Make a purchase via POS or API
6. View on-chain data:
   - [Topic 0.0.7153725](https://hashscan.io/testnet/topic/0.0.7153725)
   - [RVP Token 0.0.7154427](https://hashscan.io/testnet/token/0.0.7154427)

---

## ✨ Key Features

### Consumers

- ✅ Digital Receipt Wallet
- ✅ Blockchain Verification
- ✅ Real RVP Token Rewards
- ✅ Collectible NFT Rewards
- ✅ Privacy-Preserving Design

### Merchants

- ✅ Fraud Prevention via HCS
- ✅ Automated Loyalty Points
- ✅ POS QR Integration
- ✅ Analytics Dashboard

### Auditors & Insurers

- ✅ Public Verification
- ✅ Immutable Audit Trail
- ✅ Zero Database Dependence

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Hedera Testnet account + HBAR
- PostgreSQL (prod) or SQLite (dev)
- Optional: Pinata for NFT IPFS storage

### Environment Setup

Create `backend/.env`:

```properties
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxxx
OPERATOR_KEY=302e020100...

HCS_RECEIPT_TOPIC_ID=0.0.7153725
HTS_POINTS_TOKEN_ID=0.0.7154427

NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secret_here
DATABASE_URL=

EMAIL_HOST=smtp.gmail.com
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@receiptoverse.com

PINATA_API_KEY=
PINATA_SECRET_API_KEY=
PINATA_JWT=
```

### Installation

**Backend**

```bash
cd backend
npm install
npm run migrate
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Then visit **http://localhost:5173**

---

## 📚 API Reference

| Endpoint                          | Method | Description                   | Auth   |
| --------------------------------- | ------ | ----------------------------- | ------ |
| `/api/users/register`             | POST   | Register new user             | Public |
| `/api/users/login`                | POST   | Login                         | Public |
| `/api/users/wallet-connect`       | POST   | Link wallet                   | JWT    |
| `/api/users/associate-rvp`        | POST   | Associate token               | JWT    |
| `/api/receipts`                   | POST   | Create receipt (auto-anchors) | JWT    |
| `/api/receipts/public/:id/verify` | GET    | Verify on-chain               | Public |
| `/api/token/info`                 | GET    | Token info                    | Public |
| `/api/token/balance/:accountId`   | GET    | Balance                       | Public |
| `/api/nft/mint`                   | POST   | Mint NFT reward               | JWT    |

---

## 🛠️ Technology Stack

**Backend**

- Node.js + Express
- @hashgraph/sdk
- SQLite / PostgreSQL
- Joi, JWT, Socket.IO, Nodemailer

**Frontend**

- React + Vite + Tailwind
- HashConnect Wallet
- Redux Toolkit, Framer Motion

**Infrastructure**

- Hedera Testnet (HCS, HTS, NFT)
- IPFS (Pinata)
- HashScan + Mirror Node API

---

## 🏆 Hackathon Compliance

✅ **HCS Used** — Topic `0.0.7153725` for immutable receipt anchoring  
✅ **HTS Used** — Token `0.0.7154427` for loyalty points  
✅ **NFTs Used** — Collection `0.0.6927730` for gamified loyalty  
✅ **Public Mirror Node Queries** — Verification via REST API  
✅ **Wallet Integration** — HashConnect (HashPack & Blade)

---

## 👥 Team & Contact

Built by the ReceiptoVerse Team  
🌐 **Website:** Coming soon  
💬 **Contact:** receiptoverse@protonmail.com  
🖤 Built with love on **Hedera**
