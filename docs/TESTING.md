# ReceiptoVerse Testing Guide 🧪

**Comprehensive testing guide for HCS, HTS, NFT, and API integrations**

This guide covers all testing scenarios for ReceiptoVerse, including Hedera service integrations and end-to-end flows.

---

## 🎯 Testing Overview

### Test Categories

1. **HCS Integration Tests** - Receipt anchoring and verification
2. **HTS Integration Tests** - RVP token minting and transfers
3. **NFT Tests** - Reward NFT minting with HCS proof
4. **API Tests** - REST endpoint validation
5. **E2E Tests** - Complete user flows

---

## 🔷 HCS Integration Tests

### Test 1: Anchor Receipt to HCS

```powershell
cd backend

# Test receipt anchoring
node -e "
const { anchorReceipt } = require('./src/services/blockchain/hcsReceiptService');

(async () => {
  const receipt = {
    id: 'test-receipt-123',
    storeName: 'Test Store',
    amount: 10.50,
    merchantId: 'merchant-123',
    userId: 'user-456',
    timestamp: Date.now()
  };

  const result = await anchorReceipt(receipt);
  console.log('✅ Receipt anchored!');
  console.log('Topic:', result.hcs_topic_id);
  console.log('Sequence:', result.hcs_sequence);
  console.log('Consensus Time:', result.hcs_timestamp);
  console.log('HashScan:', 'https://hashscan.io/testnet/topic/' + result.hcs_topic_id + '/message/' + result.hcs_sequence);
})();
"
```

**Expected Output:**

```
✅ Receipt anchored!
Topic: 0.0.7153725
Sequence: 143
Consensus Time: 2025-10-29T15:32:45.123456789Z
HashScan: https://hashscan.io/testnet/topic/0.0.7153725/message/143
```

### Test 2: Verify Receipt on HCS

```powershell
# Test public verification
curl http://localhost:3000/api/receipts/public/test-receipt-123/verify
```

**Expected Response:**

```json
{
  "success": true,
  "isValid": true,
  "receipt": {
    "id": "test-receipt-123",
    "hash": "a3f5c8d2e9b1f4a7...",
    "hcsTopicId": "0.0.7153725",
    "hcsSequence": 143
  },
  "hcsData": {
    "hash": "a3f5c8d2e9b1f4a7...",
    "consensusTimestamp": "2025-10-29T15:32:45.123456789Z"
  },
  "hashMatch": true
}
```

---

## 💎 HTS Integration Tests

### Test 1: Check RVP Token Association

```powershell
# Test using test-hts-service.js
cd backend
node test-hts-service.js
```

**Expected Output:**

```
🧪 Testing HTS Points Service

✅ HTS Service initialized
💰 Token ID: 0.0.7154427
📝 Operator: 0.0.6913837

Testing association check...
✅ Account 0.0.6913837 is associated with RVP token

Testing balance query...
💰 Balance: 1000.00 RVP
```

### Test 2: Mint RVP Points

```powershell
# Test minting via API
$headers = @{
  "Authorization" = "Bearer YOUR_JWT_TOKEN"
  "Content-Type" = "application/json"
}

$body = @{
  accountId = "0.0.YOUR_ACCOUNT"
  amount = 100
  memo = "Test reward"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/points/award" `
  -Headers $headers `
  -Body $body
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "txId": "0.0.6913837@1730211765.123456789",
    "amount": 100,
    "newBalance": 1100.0
  }
}
```

**Verify on HashScan:**

```
https://hashscan.io/testnet/token/0.0.7154427
```

---

## 🎨 NFT Integration Tests

### Test 1: Mint NFT with HCS Proof

```powershell
cd backend
node test-nft-hcs-proof.js
```

**Expected Output:**

```
🧪 Testing NFT Metadata with HCS Proof

✅ Reward NFT Service initialized
📝 Operator ID: 0.0.6913837
🎨 Rewards Collection ID: 0.0.6927730

📋 NFT Type: Gold Eagle
🔷 HCS Proof Data:
   Topic ID: 0.0.7153725
   Sequence: 42
   Receipt Hash: a3f5c8d2e9b1f4a7...

✨ Generating Enhanced NFT Metadata...

📦 Complete Metadata (with HCS Proof):
{
  "name": "Gold Eagle #1",
  "attributes": [
    { "trait_type": "Receipt Verified", "value": "true" },
    { "trait_type": "HCS Topic", "value": "0.0.7153725" },
    { "trait_type": "HCS Sequence", "value": "42" }
  ],
  "properties": {
    "hcsProof": {
      "topicId": "0.0.7153725",
      "sequence": 42,
      "hashscanUrl": "https://hashscan.io/testnet/topic/0.0.7153725/message/42"
    }
  }
}

✅ Test Complete - NFT metadata includes HCS proof!
```

---

## 🌐 API Endpoint Tests

### Test 1: User Registration

```powershell
$body = @{
  email = "test@example.com"
  password = "SecurePass123!"
  handle = "testuser"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/users/register" `
  -ContentType "application/json" `
  -Body $body
```

### Test 2: Create Receipt (Auto-Anchors)

```powershell
$headers = @{
  "Authorization" = "Bearer YOUR_JWT"
  "Content-Type" = "application/json"
}

$body = @{
  storeName = "Coffee Shop"
  amount = 15.50
  category = "food"
  items = @(
    @{ name = "Latte"; price = 4.50; quantity = 2 }
    @{ name = "Croissant"; price = 6.50; quantity = 1 }
  )
} | ConvertTo-Json -Depth 3

$receipt = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/receipts" `
  -Headers $headers `
  -Body $body

Write-Host "✅ Receipt created: $($receipt.data.id)"
Write-Host "🔷 HCS anchored: $($receipt.data.hcs_sequence)"
```

### Test 3: Wallet Connect

```powershell
$headers = @{
  "Authorization" = "Bearer YOUR_JWT"
  "Content-Type" = "application/json"
}

$body = @{
  accountId = "0.0.YOUR_ACCOUNT"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/users/wallet-connect" `
  -Headers $headers `
  -Body $body
```

---

## 🔄 End-to-End Test Flow

### Complete User Journey

```powershell
# Step 1: Register user
$register = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/users/register" `
  -ContentType "application/json" `
  -Body '{"email":"e2e@test.com","password":"Test123!","handle":"e2euser"}'

$token = $register.token
Write-Host "✅ User registered, Token: $token"

# Step 2: Connect wallet
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/users/wallet-connect" `
  -Headers $headers `
  -Body '{"accountId":"0.0.YOUR_ACCOUNT"}'

Write-Host "✅ Wallet connected"

# Step 3: Associate RVP token
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/users/associate-rvp" `
  -Headers $headers

Write-Host "✅ RVP token associated"

# Step 4: Create receipt (auto-anchors to HCS)
$receipt = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/receipts" `
  -Headers $headers `
  -Body '{"storeName":"Test Store","amount":50.00,"category":"shopping"}'

Write-Host "✅ Receipt created and anchored"
Write-Host "   HCS Topic: $($receipt.data.hcs_topic_id)"
Write-Host "   HCS Sequence: $($receipt.data.hcs_sequence)"

# Step 5: Verify receipt publicly
$verify = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/receipts/public/$($receipt.data.id)/verify"

Write-Host "✅ Receipt verified: $($verify.isValid)"

# Step 6: Check RVP balance
$balance = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/token/balance/0.0.YOUR_ACCOUNT"

Write-Host "✅ RVP Balance: $($balance.data.balance) RVP"

# Step 7: View on HashScan
$hashscanUrl = "https://hashscan.io/testnet/topic/$($receipt.data.hcs_topic_id)/message/$($receipt.data.hcs_sequence)"
Write-Host "🔗 View on HashScan: $hashscanUrl"
```

**Expected Complete Output:**

```
✅ User registered, Token: eyJhbGciOiJIUzI1NiIs...
✅ Wallet connected
✅ RVP token associated
✅ Receipt created and anchored
   HCS Topic: 0.0.7153725
   HCS Sequence: 145
✅ Receipt verified: True
✅ RVP Balance: 50.00 RVP
🔗 View on HashScan: https://hashscan.io/testnet/topic/0.0.7153725/message/145
```

---

## 🐛 Debugging Common Issues

### Issue 1: "HTS service not initialized"

**Solution:**

```powershell
# Check .env has token ID
echo $env:HTS_POINTS_TOKEN_ID

# Restart backend
cd backend
npm run dev
```

### Issue 2: "Account not associated"

**Solution:**

```powershell
# Associate via UI or API
curl -X POST http://localhost:3000/api/users/associate-rvp `
  -H "Authorization: Bearer YOUR_JWT"
```

### Issue 3: "Receipt hash mismatch"

**Solution:**

```powershell
# Verify HCS message on Mirror Node
curl "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7153725/messages/SEQUENCE"
```

---

## ✅ Test Checklist

Before deployment, ensure all tests pass:

- [ ] HCS receipt anchoring works
- [ ] Public receipt verification works
- [ ] HTS token minting works (for associated accounts)
- [ ] NFT metadata includes HCS proof
- [ ] User registration and login work
- [ ] Wallet connection works
- [ ] RVP association flow works
- [ ] Points are awarded on receipt creation
- [ ] HashScan links are valid
- [ ] Frontend displays RVP balance correctly

---

## 📊 Performance Benchmarks

**Expected Timings (Testnet):**

- Receipt anchor to HCS: ~3-5 seconds
- HTS token mint: ~3-5 seconds
- NFT mint: ~5-7 seconds
- Mirror Node query: ~1-2 seconds
- Database query: ~10-50ms

---

For more testing utilities, see:

- `backend/test-hts-service.js`
- `backend/test-nft-hcs-proof.js`
- `backend/test-email-service.js`
- `backend/verify-db-schema.js`
