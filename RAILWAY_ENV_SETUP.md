# Railway Environment Variables Setup 🚂

## Required Environment Variables

Add these to your Railway deployment:

### Hedera Configuration

```
OPERATOR_ID=0.0.6913837
OPERATOR_KEY=your_private_key_here
RECV_TOKEN_ID=0.0.6922722
RNFT_TOKEN_ID=0.0.6922732
```

### IPFS Configuration

```
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret
PINATA_JWT=your_pinata_jwt_token
```

### Optional

```
NODE_ENV=production
PORT=3000
```

## How to Add Variables to Railway:

1. **Go to your Railway project dashboard**
2. **Click on your backend service**
3. **Go to "Variables" tab**
4. **Add each variable one by one:**
   - Variable Name: `OPERATOR_ID`
   - Variable Value: `0.0.6913837`
   - Click "Add"
   - Repeat for all variables

## Important Notes:

⚠️ **OPERATOR_KEY Format**: Your private key should be the raw hex string, not wrapped in quotes or prefixed with "0x"

✅ **Correct**: `302e020100300506032b657004220420a1b2c3d4e5f6...`
❌ **Incorrect**: `"302e020100300506032b657004220420a1b2c3d4e5f6..."`
❌ **Incorrect**: `0x302e020100300506032b657004220420a1b2c3d4e5f6...`

## Quick Copy-Paste for Railway:

```
OPERATOR_ID=0.0.6913837
OPERATOR_KEY=YOUR_ACTUAL_PRIVATE_KEY_HERE
RECV_TOKEN_ID=0.0.6922722
RNFT_TOKEN_ID=0.0.6922732
PINATA_API_KEY=YOUR_PINATA_API_KEY
PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET
PINATA_JWT=YOUR_PINATA_JWT_TOKEN
NODE_ENV=production
```

## After Adding Variables:

1. **Redeploy your service** (Railway should auto-deploy)
2. **Check logs** for successful startup
3. **Test API** with your frontend

## Troubleshooting:

- **"Cannot read properties of undefined"** = Missing environment variable
- **"Invalid private key"** = Wrong OPERATOR_KEY format
- **"Account not found"** = Wrong OPERATOR_ID
- **IPFS upload fails** = Wrong Pinata credentials

Your server will now show exactly which variables are missing! 🎯
