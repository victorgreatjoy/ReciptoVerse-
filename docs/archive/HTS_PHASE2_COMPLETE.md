# HTS Phase 2 Complete ✅# Phase 2 Complete: HTS Points Token Integration

## Overview**Completed:** October 28, 2025

Phase 2 of the Hedera DLT Track implementation is now **COMPLETE**! We've successfully integrated Hedera Token Service (HTS) with the ReceiptoVerse points system, creating on-chain fungible tokens that represent user points.## 🎉 Summary

---Successfully integrated Hedera Token Service (HTS) with the ReceiptoVerse points system. Users can now earn on-chain fungible tokens when they make purchases, creating a transparent and verifiable loyalty program.

## What Was Implemented## ✅ What Was Built

### 1. HTS Token Creation ✅### 1. HTS Points Token

- **Token ID**: `0.0.7154427` (Hedera Testnet)- **Token ID:** `0.0.7154427` (testnet)

- **Token Name**: ReceiptoVerse Points- **Name:** ReceiptoVerse Points

- **Token Symbol**: RVP- **Symbol:** RVP

- **Token Type**: Fungible- **Type:** Fungible, Finite Supply

- **Decimals**: 2 (e.g., 100 = 1.00 RVP)- **Max Supply:** 1,000,000,000 tokens

- **Max Supply**: 1,000,000,000 (1 billion)- **Decimals:** 0 (whole number points)

- **Treasury Account**: `0.0.6913837` (Operator account)- **Treasury:** 0.0.6913837

- **Network**: Hedera Testnet

- **HashScan URL**: https://hashscan.io/testnet/token/0.0.7154427### 2. Core Services

### 2. HTSPointsService ✅**HTSPointsService** (`backend/src/services/blockchain/htsPointsService.js`)

Created a complete HTS service (`backend/src/services/blockchain/htsPointsService.js`) with:- Token creation and management

- Mint tokens when users earn points

- **Token Creation**: `createToken()` - One-time setup of RVP token- Burn tokens when points are redeemed

- **Token Minting**: `mintPoints()` - Mint tokens and transfer to users (with association check)- Transfer tokens between users

- **Token Burning**: `burnPoints()` - Burn tokens when points are redeemed- Query on-chain balances

- **Token Transfer**: `transferPoints()` - Transfer tokens between accounts- Reuses DLT Gateway for authentication

- **Balance Query**: `getBalance()` - Check token balance for any account

- **Association Check**: `isAssociated()` - Verify if account is associated with RVP token### 3. Database Schema

**Key Feature**: Association safety! The service checks if an account is associated with the RVP token before attempting to mint/transfer. If not associated, points are still awarded in the database, but on-chain minting is skipped with a clear log message.**New Tables:**

### 3. Database Schema Updates ✅- `hts_transactions` - Log of all HTS operations

- `hts_config` - System configuration for token settings

Added HTS support to both SQLite and PostgreSQL:

**New User Fields:**

**Users Table**:

- `hts_account_id` - User's Hedera account ID (from wallet)- `hts_token_associated` - Whether user's wallet is associated with token

- `hts_token_associated` - Boolean flag for association status- `hts_account_id` - User's Hedera account ID

- `hts_balance` - On-chain RVP token balance- `hts_balance` - Cached on-chain token balance

- `hts_last_sync` - Timestamp of last sync- `hts_last_sync` - Last sync timestamp

**Points Transactions Table**:**Enhanced Points Transactions:**

- `hts_tx_id` - Hedera transaction ID for on-chain mints

- `hts_synced` - Boolean flag indicating if synced to HTS- `hts_tx_id` - Hedera transaction ID

- `hts_synced` - Sync status flag

**HTS Transactions Table** (new):

- Audit trail of all HTS operations (mint, burn, transfer)### 4. Points System Integration

- Tracks transaction IDs, amounts, accounts, and timestamps

**Enhanced `pointsService.js`:**

### 4. Points Service Integration ✅

- Automatically mints HTS tokens when users earn points

Updated `backend/src/pointsService.js` to automatically mint HTS tokens when users earn points:- Graceful fallback if HTS is unavailable

- Updates both database and on-chain balance

- **Opt-in Design**: Only users with `hts_account_id` set receive on-chain tokens- Logs HTS transaction IDs for auditability

- **Graceful Fallback**: If HTS fails (not associated, network issues), points are still awarded in database

- **Association-Aware**: Checks if user is associated before minting; logs warning if not### 5. Setup & Testing Scripts

- **Dual Tracking**: Both database points and on-chain tokens are maintained

- **Audit Trail**: All HTS transactions are logged with transaction IDs**setup-hts-token.js**

### 5. Token API Endpoints ✅- One-time token creation

- Auto-updates .env with token ID

Created comprehensive REST API (`backend/src/routes/tokenRoutes.js`):- Clear success/error messages

#### GET `/api/token/info`**test-hts-points.js**

Get RVP token information (ID, symbol, decimals, HashScan link, etc.)

- Validates token creation

**Example Response**:- Queries balances

````json- Shows HashScan links

{

  "tokenId": "0.0.7154427",## 🚀 How It Works

  "name": "ReceiptoVerse Points",

  "symbol": "RVP",1. **User makes purchase** → Merchant POS creates receipt

  "decimals": 2,2. **Points awarded** → `pointsService.awardPoints()` calculates points

  "totalSupply": "1000000000",3. **Database updated** → User balance and transaction recorded

  "treasury": "0.0.6913837",4. **HTS minting** → If user has `hts_account_id`, mint tokens on Hedera

  "network": "testnet",5. **On-chain proof** → Transaction recorded on Hedera ledger

  "hashscanUrl": "https://hashscan.io/testnet/token/0.0.7154427"6. **User sees** → Points in app + tokens in wallet

}

```## 📊 Current Status



#### GET `/api/token/balance/:accountId`### Working Features

Get RVP balance for a Hedera account

✅ Token creation and management

**Example Response**:✅ Auto-minting when points are awarded

```json✅ Database schema with HTS support

{✅ Balance queries (on-chain and cached)

  "accountId": "0.0.1234567",✅ HashScan integration for transparency

  "tokenId": "0.0.7154427",✅ Graceful degradation if HTS unavailable

  "balance": "50000",

  "decimals": 2,### Pending (Phase 3)

  "displayBalance": "500.00"

}⏳ API endpoints for token operations

```⏳ Frontend wallet connection

⏳ User token balance display

#### GET `/api/token/association-status/:accountId`⏳ Token redemption flow

Check if account is associated with RVP token⏳ Wallet association UI



**Example Response**:## 🔗 Key Links

```json

{- **HashScan (Token):** https://hashscan.io/testnet/token/0.0.7154427

  "accountId": "0.0.1234567",- **Mirror Node API:** https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.7154427

  "tokenId": "0.0.7154427",

  "isAssociated": true,## 💡 Design Decisions

  "message": "Account is associated and can receive RVP tokens",

  "hashscanUrl": "https://hashscan.io/testnet/account/0.0.1234567"1. **Opt-in HTS**: Users need `hts_account_id` set to receive tokens

}   - Allows gradual rollout

```   - Works with existing users without Hedera wallets

2. **Graceful Fallback**: If HTS fails, points still awarded in database

### 6. Testing & Documentation ✅

   - Ensures loyalty program always works

- **Test Script**: `backend/test-token-api.ps1` - PowerShell script to test all token endpoints   - HTS is enhancement, not requirement

- **Setup Script**: `backend/setup-hts-token.js` - One-time token creation

- **HTS Test**: `backend/test-hts-points.js` - Test HTS service operations3. **Dual Balance Tracking**:

- **API Documentation**: Updated `API_REFERENCE.md` with complete Token (HTS) endpoints section

   - `points_balance` (database) - Always accurate

---   - `hts_balance` (cached) - For quick display, synced on operations



## How It Works4. **Reuse DLT Gateway**: Same client as HCS for consistency

   - Single point of configuration

### Flow for New Points   - Proven key handling



1. **User makes a purchase** → Merchant POS creates receipt## 🧪 Testing

2. **Points Service calculates reward** → Based on amount and loyalty tier

3. **Database points awarded** → Always happens (guaranteed)```powershell

4. **HTS check**: If user has `hts_account_id` set:# Run migrations

   - Check if associated with RVP tokennode run-migrations.js

   - If associated: Mint tokens on-chain and transfer to user

   - If not associated: Log warning, skip on-chain (database points still valid)# Create token (one-time)

5. **Audit trail created** → Transaction logged with HTS tx ID if successfulnode setup-hts-token.js



### Association Flow# Test token operations

node test-hts-points.js

Users must associate with the RVP token before they can receive it:

# Create a purchase to test auto-minting

1. **Frontend wallet connection** → User connects HashPack/Blade wallet# (requires user with hts_account_id set)

2. **Frontend association UI** → "Associate RVP" button (coming in frontend phase)```

3. **Wallet transaction** → User approves token association (costs ~$0.05 USD in HBAR)

4. **Backend receives accountId** → User's `hts_account_id` is set in database## 📝 Environment Variables

5. **Auto-minting enabled** → Future points automatically mint on-chain

Add to `.env`:

---

```bash

## Testing GuideHTS_POINTS_TOKEN_ID=0.0.7154427

````

### Quick Test (PowerShell)

## 🎯 Next Steps (Phase 3)

````powershell

cd backend1. **API Endpoints:**

.\test-token-api.ps1

```   - `GET /api/token/info` - Token details

   - `GET /api/token/balance/:userId` - User balance

This will test:   - `POST /api/token/associate` - Associate user wallet

- Token info retrieval   - `GET /api/token/transactions/:userId` - Transaction history

- Balance queries (treasury + random account)

- Association status checks2. **Frontend Integration:**

- Error handling (invalid account IDs)

   - Wallet connection (HashPack/Blade)

### Manual API Testing   - Display on-chain balance

   - Show HashScan links

```powershell   - Token transaction history

# Get token info

Invoke-RestMethod -Uri "http://localhost:3000/api/token/info"3. **User Experience:**



# Get balance for your Hedera account   - Onboarding flow for wallet association

$accountId = "0.0.YOUR_ACCOUNT_ID"   - "Connect Hedera Wallet" button

Invoke-RestMethod -Uri "http://localhost:3000/api/token/balance/$accountId"   - Visual indicator: "🪙 On-chain" vs "💾 Database"

   - QR codes for token transfers

# Check association status

Invoke-RestMethod -Uri "http://localhost:3000/api/token/association-status/$accountId"4. **Advanced Features:**

```   - Token redemption for rewards

   - P2P token transfers

### Test Points Minting   - Merchant token acceptance

   - Staking/multipliers

1. **Set up a test user with Hedera account**:

```sql## 📐 Architecture

UPDATE users

SET hts_account_id = '0.0.YOUR_ACCOUNT_ID', ```

    hts_token_associated = 1 Purchase Flow:

WHERE email = 'test@example.com';┌─────────────┐

```│   Merchant  │

│     POS     │

2. **Award points** (via POS or API):└──────┬──────┘

```powershell       │ Create Receipt

# Create a test receipt/purchase - points will auto-mint on-chain       ▼

```┌─────────────┐

│   Receipt   │

3. **Verify on HashScan**:│   Service   │

   - Visit https://hashscan.io/testnet/account/0.0.YOUR_ACCOUNT_ID└──────┬──────┘

   - Check "Tokens" tab - should see RVP balance       │ Award Points

       ▼

---┌─────────────┐        ┌─────────────┐

│   Points    │───────▶│     HTS     │

## Environment Variables Required│   Service   │  Mint  │   Service   │

└──────┬──────┘        └──────┬──────┘

Make sure these are set in your `.env` or Railway environment:       │                      │

       │ Update DB            │ Mint Tokens

```bash       ▼                      ▼

# Hedera Operator (Treasury)┌─────────────┐        ┌─────────────┐

HEDERA_OPERATOR_ID=0.0.6913837│  Database   │        │   Hedera    │

HEDERA_OPERATOR_KEY=your-private-key│  (SQLite)   │        │  Testnet    │

HEDERA_NETWORK=testnet└─────────────┘        └─────────────┘

````

# HTS Token

HTS_POINTS_TOKEN_ID=0.0.7154427## 🔐 Security Notes

```

- Treasury account (0.0.6913837) holds supply keys

---- Only backend can mint/burn tokens

- Users receive tokens via transfer (not mint to their account)

## Phase 2 Completion Checklist- All transactions logged in `hts_transactions` table



- ✅ HTS token created on Hedera testnet (0.0.7154427)## ✨ Impact

- ✅ HTSPointsService with full operations (mint, burn, transfer, balance, association check)

- ✅ Database migrations for SQLite and PostgreSQLThis implementation provides:

- ✅ Points service integration with auto-minting (opt-in)

- ✅ Association safety check before minting- **Transparency**: All points on public ledger

- ✅ Token API endpoints (info, balance, association status)- **Verifiability**: Users can verify balances on HashScan

- ✅ Error handling and graceful fallbacks- **Portability**: Tokens can be held in any Hedera wallet

- ✅ Audit trail for HTS transactions- **Composability**: Tokens can interact with other Hedera apps

- ✅ Test scripts (PowerShell for Windows)- **Trust**: Immutable record of all point awards

- ✅ API documentation updated

- ✅ Server.js routes mounted and initialized---



---**Status:** ✅ Phase 2 Core Complete

**Token Created:** 2025-10-28

## What's Next?**Ready For:** API endpoints & frontend integration (Phase 3)


### Frontend Integration (Optional for Phase 2, Recommended)

1. **Display on-chain RVP balance**
   - Show both database points and HTS balance
   - Add "Sync with Hedera" button to update balance

2. **Association UI**
   - "Associate RVP Token" button if not associated
   - Uses HashConnect/wallet to submit association transaction
   - Updates `hts_token_associated` flag in database

3. **HashScan Links**
   - Add links to view RVP token on HashScan
   - Add links to view user's account on HashScan

### Phase 3: Smart Contracts (Next Major Phase)

- NFT Benefits Manager contract
- NFT Upgrade Manager contract
- Multi-sig admin controls
- Automated benefit distribution

### Phase 4: Event Indexers

- Real-time monitoring of HCS topics
- HTS token transfer tracking
- Smart contract event indexing

---

## Key Files Modified/Created

### New Files
- `backend/src/services/blockchain/htsPointsService.js` - HTS service implementation
- `backend/src/routes/tokenRoutes.js` - Token API endpoints
- `backend/setup-hts-token.js` - One-time token creation script
- `backend/test-hts-points.js` - HTS service test script
- `backend/test-token-api.ps1` - Token API test script (PowerShell)
- `backend/migrations/006_add_hts_support.sql` - SQLite schema
- `backend/migrations/006_add_hts_support_pg.sql` - PostgreSQL schema

### Modified Files
- `backend/src/server.js` - Added token routes
- `backend/src/pointsService.js` - Integrated HTS minting with association check
- `backend/run-migrations.js` - Added migration 006 for HTS support
- `API_REFERENCE.md` - Added Token (HTS) Endpoints section
- `HTS_PHASE2_COMPLETE.md` - This document

---

## Success Metrics

- ✅ Token created and live on Hedera testnet
- ✅ Association check prevents transfer failures
- ✅ Graceful fallback if HTS unavailable
- ✅ Dual tracking (database + on-chain) working
- ✅ API endpoints returning correct data
- ✅ Test scripts passing
- ✅ Documentation comprehensive and accurate

---

## Questions?

**Q: What happens if a user isn't associated with RVP?**
A: Points are still awarded in the database. The on-chain mint is skipped with a log warning. User can associate later and sync their balance.

**Q: Can users associate after earning points?**
A: Yes! They can associate anytime via wallet. We can add a "sync" feature to retroactively mint their accumulated points.

**Q: What if HTS service fails?**
A: Points are always awarded in the database first. HTS is "best effort" - failures are logged but don't block the core points system.

**Q: How do I verify tokens on-chain?**
A: Visit HashScan (https://hashscan.io/testnet/token/0.0.7154427) or use the `/api/token/balance/:accountId` endpoint.

**Q: Can I test without a Hedera wallet?**
A: Yes! The API endpoints work for any valid account ID. You can check the treasury balance without a wallet.

---

## Congratulations! 🎉

Phase 2 is complete. The ReceiptoVerse points system is now fully integrated with Hedera Token Service, providing users with real on-chain assets that can be used across the Hedera ecosystem!
```
