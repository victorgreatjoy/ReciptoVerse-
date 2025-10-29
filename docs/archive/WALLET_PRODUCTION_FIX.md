# 🔧 HashConnect Wallet Production Fix

## Problem

When trying to connect wallet in production, you get:

```
WebSocket connection closed abnormally with code: 3000 (Unauthorized: invalid key)
```

## Root Cause

The production `.env.production` file was missing the `VITE_WALLETCONNECT_PROJECT_ID` environment variable, which is required by HashConnect for wallet pairing.

## ✅ Fix Applied

### 1. Updated `.env.production`

Added the WalletConnect project ID to the production environment file:

```bash
# Production Environment
VITE_API_URL=ReceiptoVerse-production-f33a.up.railway.app
VITE_ENVIRONMENT=production
VITE_HEDERA_NETWORK=mainnet

# WalletConnect Project ID for HashConnect wallet integration
VITE_WALLETCONNECT_PROJECT_ID=dbf33d8910b938fcce1ad87f2ae0982b

# Google reCAPTCHA Site Key (production)
VITE_RECAPTCHA_SITE_KEY=6LfdyuorAAAAAEitmZgthpS91AtO7XldzLBOByMm
```

### 2. Improved HashConnect Initialization

Updated `frontend/src/services/hashconnect.js` to:

- ✅ Validate WalletConnect project ID exists
- ✅ Show clear error message if missing
- ✅ Auto-detect network (TESTNET vs MAINNET) from `VITE_HEDERA_NETWORK`
- ✅ Log project ID (first 8 chars) for debugging

## 🚀 Deployment Steps

### Step 1: Set Environment Variable on Railway

**Important:** Your production deployment platform (Railway) needs this environment variable set.

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Select your frontend project
3. Go to **Variables** tab
4. Add this variable:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=dbf33d8910b938fcce1ad87f2ae0982b
   ```
5. Save and redeploy

### Step 2: Rebuild Frontend for Production

```powershell
cd frontend
npm run build
```

### Step 3: Test Wallet Connection

1. Open your production URL
2. Click **"Connect Wallet"** button
3. You should see HashPack/Blade wallet pairing modal
4. Check browser console for:
   ```
   🔷 Initializing HashConnect on MAINNET...
   📡 Using WalletConnect Project ID: dbf33d89...
   ✅ HashConnect initialized successfully
   ```

## 📋 About WalletConnect Project ID

### What is it?

A unique identifier from WalletConnect Cloud that allows your dApp to establish secure WebSocket connections with wallets.

### Current Project ID

Using: `dbf33d8910b938fcce1ad87f2ae0982b`

This is your existing project ID from: https://cloud.reown.com/

### Same ID for All Environments

✅ The same WalletConnect project ID works for:

- **Development** (TESTNET)
- **Staging** (TESTNET)
- **Production** (MAINNET)

The network (TESTNET/MAINNET) is controlled by `VITE_HEDERA_NETWORK`, not the project ID.

## 🔍 Verification Checklist

After deploying:

- [ ] Production build includes `VITE_WALLETCONNECT_PROJECT_ID`
- [ ] Railway environment variables updated
- [ ] Wallet connection button works
- [ ] No "Unauthorized: invalid key" errors
- [ ] Console shows "HashConnect initialized successfully"
- [ ] HashPack/Blade wallet pairing modal appears
- [ ] Can successfully pair and connect wallet
- [ ] Account ID displays after connection

## 🐛 Troubleshooting

### Still Getting "Unauthorized: invalid key"?

**Check 1:** Verify environment variable in Railway

```
Go to Railway → Project → Variables → Confirm VITE_WALLETCONNECT_PROJECT_ID exists
```

**Check 2:** Rebuild and redeploy

```powershell
cd frontend
npm run build
# Deploy the new build
```

**Check 3:** Clear browser cache

- Hard refresh: `Ctrl + F5`
- Or clear browser cache completely

**Check 4:** Check browser console
Look for this error:

```
❌ VITE_WALLETCONNECT_PROJECT_ID not configured!
```

If you see this, the environment variable wasn't included in the build.

### Need a New Project ID?

If you want to create a new WalletConnect project:

1. Visit: https://cloud.reown.com/
2. Sign in (or create account)
3. Click **"Create Project"**
4. Name it: `ReceiptoVerse`
5. Copy the **Project ID**
6. Update `.env.production`:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your_new_project_id
   ```
7. Update Railway environment variables
8. Rebuild and redeploy

## 📚 Related Files

- `frontend/.env.production` - Production environment variables
- `frontend/.env.development` - Development environment variables
- `frontend/src/services/hashconnect.js` - HashConnect initialization
- `frontend/src/hooks/useHashConnect.js` - HashConnect React hook
- `frontend/src/components/HashConnectButton.jsx` - Wallet connection button

## 🎉 Expected Result

After fix, wallet connection should work smoothly:

1. User clicks "Connect Wallet"
2. HashConnect pairing modal appears
3. User scans QR code with HashPack/Blade wallet
4. Wallet confirms pairing
5. Account ID displays in UI
6. User can interact with Hedera blockchain

No more WebSocket errors! 🚀

## 📝 Notes

- **Network Auto-Detection**: Code now reads `VITE_HEDERA_NETWORK` to determine TESTNET vs MAINNET
- **Production = MAINNET**: Your `.env.production` uses `VITE_HEDERA_NETWORK=mainnet`
- **Development = TESTNET**: Your `.env.development` uses `VITE_HEDERA_NETWORK=testnet`
- **Error Handling**: Now throws clear error if project ID missing/invalid
- **Security**: Project ID is public-safe (not a secret key)
