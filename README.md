# ReceiptoVerse • Hedera HCS + HTS + NFTs 🧾⚡

End-to-end receipt verification and loyalty on Hedera: immutable receipt anchoring (HCS), on-chain points (HTS RVP), and collectible reward NFTs — with a React frontend and a Node/Express API.

## Overview

ReceiptoVerse anchors each receipt to Hedera Consensus Service for public integrity proofs, mints fungible RVP points on Hedera Token Service for purchases, and offers mintable reward NFTs. It includes a merchant POS flow, a modern dashboard with wallet connect and RVP balance/association, and public verification endpoints.

Key IDs (testnet):

- HCS Topic: `0.0.7153725`
- RVP Token (HTS): `0.0.7154427` (decimals: 2)
- Operator/Treasury: `0.0.6913837`

See also: `ARCHITECTURE_DIAGRAM.md`, `API_REFERENCE.md`, `HTS_PHASE2_COMPLETE.md`.

## Features

- Receipt integrity on-chain (HCS): anchor, verify, and prove receipts without exposing PII
- On-chain loyalty points (HTS): earn RVP on purchase; frontend shows balance and association
- Public verification: anyone can verify a receipt’s hash and topic sequence
- Merchant POS routes: scan QR, create receipts, auto-award points (and auto-anchor)
- NFT rewards: marketplace endpoints, benefits, monthly bonuses
- Robust DB migrations for HCS and HTS, SQLite (dev) and Postgres (prod)

## Architecture

Backend (Node.js/Express)

- DLT Gateway: centralized Hedera client with HCS/HTS helpers (`dltGateway.js`)
- HCS Receipt Service: anchor/verify/proof (`hcsReceiptService.js`), routes in `/api/receipts`
- HTS Points Service: initialize/token ops/balance (`htsPointsService.js`), endpoints in `/api/token`
- Receipts/Users/Merchants/Points/NFT routes wired in `src/server.js`
- Database: `src/database.js` (SQLite dev, Postgres prod) + `run-migrations.js`

Frontend (React + Vite)

- HashConnect wallet pairing
- RVPTokenCard: associate RVP, view balance and HashScan link
- User dashboard with receipts and NFT gallery

Hedera

- HCS topic per receipts anchoring; Mirror Node lookups
- HTS fungible token RVP for loyalty; decimals=2; mint/transfer via operator treasury

## Quick start

Prerequisites

- Node 18+
- Hedera testnet account with HBAR (for OPERATOR)
- Optional Postgres for production (SQLite used locally)
- Pinata or compatible IPFS pinning

Environment (.env)
Create `backend/.env` using these keys (sample):

```properties
NODE_ENV=development
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxxx
OPERATOR_KEY=302e020100300506032b657004220420... # or 0x... format

# HCS (set to reuse an existing topic; otherwise created on first run)
HCS_RECEIPT_TOPIC_ID=0.0.7153725

# HTS Points (set after token is created or use the provided testnet token)
HTS_POINTS_TOKEN_ID=0.0.7154427

# Auth and server
JWT_SECRET=change_me
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database (empty = SQLite local)
DATABASE_URL=

# Email (optional) & reCAPTCHA (optional in dev)
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
RECAPTCHA_SECRET_KEY=

# IPFS (Pinata)
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
PINATA_JWT=
```

Install and run (Windows PowerShell)

- Backend
  1. `cd backend`
  2. `npm install`
  3. `npm run migrate`
  4. `npm run dev` (or `npm start`)
- Frontend
  1. `cd frontend`
  2. `npm install`
  3. `npm run dev`

Visit: http://localhost:5173

## Hedera integrations

HCS: Receipts anchoring and public verification

- Anchor: POST `/api/receipts/:id/anchor` (auth)
- Verify: GET `/api/receipts/:id/verify` (public)
- Public verify: GET `/api/receipts/public/:id/verify`
- Proof bundle: GET `/api/receipts/:id/proof`
  What’s stored on-chain: deterministic receipt hash, minimal metadata, no PII.

HTS: RVP points token

- Token info: GET `/api/token/info`
- Balance: GET `/api/token/balance/:accountId`
- Association status: GET `/api/token/association-status/:accountId`
- Award flow: merchant → POS receipt → `awardPoints()` → on-chain mint to associated accounts
- Decimals handling: RVP has 2 decimals; 13 points → 1300 units on-chain → shows as 13.00 RVP

Frontend wallet + RVP UX

- Connect via HashConnect; backend records `hedera_account_id`
- RVPTokenCard lets users associate the token (wallet-signed TokenAssociateTransaction)
- After association, backend `awardPoints` mints on-chain and UI shows live balance + HashScan links

NFT rewards

- Types, eligibility, mint, collection, benefits, discount, and monthly bonuses under `/api/nft`
- Metadata pinned to IPFS; planned: include HCS proof fields into NFT metadata

## API surface (high level)

- Users: register/login/profile/QR/wallet connect/associate/disconnect
- Receipts: CRUD, categories, list, single, HCS verify/proof, NFT gallery
- Token (HTS): info, balance, association-status
- Points: balance, history, award, tiers, stats
- Merchants: register/status/profile/stats; POS scan-qr/create-receipt; rewards-stats
- Admin: auth, users, merchants, stats, NFT settings
- AI Support: chat, suggestions, feedback, health

Full examples and payloads: see `API_REFERENCE.md`.

## Database schema (key tables)

- users: profile + wallet fields (`hedera_account_id`); HTS fields (`hts_account_id`, `hts_token_associated`, `hts_balance`, `hts_last_sync`)
- receipts: core receipt data + HCS fields (`hcs_topic_id`, `hcs_sequence`, `hcs_timestamp`, `receipt_hash`, ...)
- points_transactions: loyalty transactions; HTS sync (`hts_tx_id`, `hts_synced`)
- hts_transactions: on-chain mint/burn/transfer log
- hcs_events, hcs_topics: HCS topic messages and management
- merchants, merchant_rewards; nft_types and related tables

SQLite is used locally; Postgres in production. See `run-migrations.js` and `backend/migrations/*`.

## Merchant POS flow

1. Merchant scans customer QR (user id + optional account id)
2. Creates receipt via `/api/merchant/pos/create-receipt` or `/api/merchant/scan-qr`
3. System auto-anchors receipt to HCS (fire-and-forget)
4. Points awarded via `awardPoints` → HTS mint if the user is associated
5. Notifications dispatched; merchant stats updated

## Try it

1. Connect your HashPack (testnet) in the UI
2. Use the RVP card to “Associate RVP Token” if needed
3. Create a purchase from the merchant test script or UI — watch RVP balance update
4. Open HashScan to view:
   - Account: https://hashscan.io/testnet/account/0.0.<yourAccount>
   - Token: https://hashscan.io/testnet/token/0.0.7154427
   - HCS topic: https://hashscan.io/testnet/topic/0.0.7153725

## Troubleshooting

- “Account is not associated”: Associate RVP in the UI first; backend will skip on-chain minting if not associated
- “RVP shows 0.13 for 13 points”: Fixed via decimals scaling (token has 2 decimals; UI displays humanized balance)
- “Missing columns/SQLite errors”: run `npm run migrate` in `backend`
- “HTS service not initialized”: ensure `HTS_POINTS_TOKEN_ID` and valid `OPERATOR_ID/KEY` are set

## Security notes

- Do not commit real operator/private keys; use env vars or a secret manager
- Enforce rate limits (AI routes already limited); validate inputs (Joi used across routes)
- Consider multisig for treasury; minimize operator-key surface in production

## Tech stack

- Backend: Node.js, Express, @hashgraph/sdk, SQLite/Postgres, Joi, Nodemailer, SendGrid (optional), Socket.IO
- Frontend: React, Vite, Tailwind, HashConnect, Redux Toolkit
- Storage: IPFS (Pinata)
- Network: Hedera testnet

## Useful scripts

- `backend/run-migrations.js` — applies HCS/HTS schema
- `backend/test-hts-service.js` — quick HTS init/assoc/balance diagnostics
- `backend/test-token-api.ps1` — token API checks on Windows
- `backend/check-user-hts.js` — view user’s HTS fields and points sync

## License

This is a hackathon/MVP-grade project for demonstration and exploration. See individual package licenses for third-party dependencies.

— Built with ❤️ on Hedera
