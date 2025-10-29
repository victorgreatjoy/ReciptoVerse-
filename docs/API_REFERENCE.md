# ReceiptoVerse API Reference

**Complete REST API Documentation for ReceiptoVerse Platform**

This document provides comprehensive API documentation for all ReceiptoVerse endpoints, including:

- User authentication and wallet management
- Receipt CRUD operations with automatic HCS anchoring
- Hedera Consensus Service (HCS) verification endpoints
- Hedera Token Service (HTS) RVP token operations
- NFT reward system with HCS proof metadata
- Merchant POS integration
- Points and loyalty system

## 🔗 Base URLs

- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com` (update after deployment)

## 🔐 Authentication

| Auth Type | Header                          | Used For                      |
| --------- | ------------------------------- | ----------------------------- |
| JWT Token | `Authorization: Bearer <token>` | User endpoints                |
| API Key   | `X-API-Key: <merchant_key>`     | Merchant POS endpoints        |
| Public    | None                            | Public verification endpoints |

## 🌐 Response Format

All endpoints return JSON with this structure:

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* endpoint-specific data */
  },
  "message": "Optional success message"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    /* optional error details */
  }
}
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Wallet Integration](#wallet-integration)
4. [Receipts](#receipts)
5. [Hedera HCS Verification](#hedera-hcs-verification)
6. [Hedera HTS Token](#hedera-hts-token-rvp)
7. [NFT Rewards](#nft-rewards)
8. [Points System](#points-system)
9. [Merchant POS](#merchant-pos-endpoints)
10. [Admin Endpoints](#admin-endpoints)
11. [Common Errors](#common-error-responses)

---

## Authentication

### Login (Get JWT token)

**POST** `/api/users/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "b2f41ec5de863c3892b000d3950a4d11",
    "email": "user@example.com",
    "handle": "user123",
    "points": 150,
    "tier": "silver"
  }
}
```

**PowerShell Example:**

```powershell
$body = @{
  email = "user@example.com"
  password = "your_password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/users/login" -ContentType "application/json" -Body $body
$token = $response.token
Write-Host "Token: $token"
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing email or password

---

## Receipts

### Create a receipt (auto-anchors in background)

**POST** `/api/receipts`

**Auth:** Bearer token (user)

**Request Body:**

```json
{
  "storeName": "Acme Store",
  "amount": 10.0,
  "receiptDate": "2025-10-28",
  "category": "groceries",
  "items": [
    { "name": "Bread", "quantity": 1, "price": 3.5 },
    { "name": "Milk", "quantity": 1, "price": 6.5 }
  ],
  "merchantId": null,
  "barcodeData": null,
  "notes": ""
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "receipt": {
    "id": "0007f83876edc1c1fc600a36457a54d4",
    "userId": "b2f41ec5de863c3892b000d3950a4d11",
    "storeName": "Acme Store",
    "amount": 10.0,
    "receiptDate": "2025-10-28T00:00:00.000Z",
    "category": "groceries",
    "items": [
      { "name": "Bread", "quantity": 1, "price": 3.5 },
      { "name": "Milk", "quantity": 1, "price": 6.5 }
    ],
    "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
    "hcs_topic_id": "0.0.7153725",
    "hcs_sequence": 4,
    "hcs_consensus_timestamp": "1730136987.123456789",
    "createdAt": "2025-10-28T12:34:56.000Z"
  }
}
```

**Note:** The backend automatically anchors the receipt hash to HCS in the background. The response includes the HCS fields if anchoring completes quickly; otherwise use the verify/proof endpoints to check status.

**PowerShell Example:**

```powershell
$token = "<JWT>"
$body = @{
  storeName = "Acme Store"
  amount = 10.0
  receiptDate = "2025-10-28"
  category = "groceries"
  items = @(@{ name = "Bread"; quantity = 1; price = 3.5 }, @{ name = "Milk"; quantity = 1; price = 6.5 })
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/receipts" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
```

**Error Responses:**

- `400 Bad Request`: Missing required fields (storeName, amount, receiptDate, category)
- `401 Unauthorized`: Invalid or missing token

---

### List receipts

**GET** `/api/receipts`

**Auth:** Bearer token (user)

**Query Parameters (all optional):**

- `category` - Filter by category (e.g., groceries, dining, transport)
- `search` - Search by store name
- `startDate` - Filter receipts from this date (YYYY-MM-DD)
- `endDate` - Filter receipts to this date (YYYY-MM-DD)
- `minAmount` - Minimum amount
- `maxAmount` - Maximum amount
- `verified` - Filter by HCS verification status (true/false)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 100)
- `sortBy` - Sort field: receipt_date, amount, created_at (default: receipt_date)
- `sortOrder` - ASC or DESC (default: DESC)

**Response:** `200 OK`

```json
{
  "success": true,
  "receipts": [
    {
      "id": "0007f83876edc1c1fc600a36457a54d4",
      "storeName": "Acme Store",
      "amount": 10.0,
      "receiptDate": "2025-10-28T00:00:00.000Z",
      "category": "groceries",
      "items": [...],
      "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
      "hcs_topic_id": "0.0.7153725",
      "hcs_sequence": 4,
      "hcs_consensus_timestamp": "1730136987.123456789",
      "nftCreated": 0,
      "isVerified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 42
  }
}
```

**PowerShell Example:**

```powershell
$token = "<JWT>"
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/receipts?category=groceries&limit=10" -Headers @{ Authorization = "Bearer $token" }
```

---

### Get a single receipt

**GET** `/api/receipts/:id`

**Auth:** Bearer token (user)

**Response:** `200 OK`

```json
{
  "success": true,
  "receipt": {
    "id": "0007f83876edc1c1fc600a36457a54d4",
    "userId": "b2f41ec5de863c3892b000d3950a4d11",
    "storeName": "Acme Store",
    "amount": 10.0,
    "receiptDate": "2025-10-28T00:00:00.000Z",
    "category": "groceries",
    "items": [
      { "name": "Bread", "quantity": 1, "price": 3.5 },
      { "name": "Milk", "quantity": 1, "price": 6.5 }
    ],
    "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
    "hcs_topic_id": "0.0.7153725",
    "hcs_sequence": 4,
    "hcs_consensus_timestamp": "1730136987.123456789",
    "createdAt": "2025-10-28T12:34:56.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Receipt not found or doesn't belong to user
- `401 Unauthorized`: Invalid or missing token

---

## Blockchain (Hedera HCS) endpoints

Mounted under the same base path: `/api/receipts`

All receipts created through the API or Merchant POS are automatically anchored to Hedera's Consensus Service (HCS) in the background. The following endpoints let you manually anchor, verify, and retrieve proof of on-chain data.

### Understanding HCS Fields

When a receipt is anchored to Hedera HCS, the following fields are populated:

- **hcs_topic_id** - The Hedera topic ID where the receipt hash was published (e.g., "0.0.7153725")
- **hcs_sequence** - The sequence number of the message in that topic (e.g., 4)
- **hcs_consensus_timestamp** - The consensus timestamp from Hedera (format: "seconds.nanoseconds", e.g., "1730136987.123456789")
- **hash** - SHA-256 hash of the receipt data that was submitted to HCS

These fields prove that the receipt data existed at a specific point in time and hasn't been tampered with.

---

### Anchor a receipt now

**POST** `/api/receipts/:id/anchor`

**Auth:** Bearer token (user)

**Description:** Immediately anchors the specified receipt to the Hedera Consensus Service (if not already anchored). Normally receipts are auto-anchored on creation, but this endpoint is useful for:

- Re-anchoring receipts created before HCS was enabled
- Manual verification during testing
- Forcing immediate anchoring instead of background processing

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Receipt anchored successfully",
  "data": {
    "receiptId": "0007f83876edc1c1fc600a36457a54d4",
    "topicId": "0.0.7153725",
    "sequence": 4,
    "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
    "consensusTimestamp": "1730136987.123456789"
  }
}
```

**PowerShell Example:**

```powershell
$token = "<JWT>"
$receiptId = "0007f83876edc1c1fc600a36457a54d4"
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/receipts/$receiptId/anchor" -Headers @{ Authorization = "Bearer $token" }
```

**Error Responses:**

- `404 Not Found`: Receipt not found or doesn't belong to user
- `400 Bad Request`: Receipt already anchored
- `500 Internal Server Error`: HCS client not initialized or anchoring failed

---

### Verify a receipt (authenticated)

**GET** `/api/receipts/:id/verify`

**Auth:** Bearer token (user) _(or can be used without auth in current build)_

**Description:** Retrieves on-chain data from Hedera HCS and compares the stored receipt hash with the actual HCS message. This proves:

1. The receipt exists on Hedera's immutable ledger
2. The receipt data hasn't been tampered with
3. The receipt was created at the specified consensus timestamp

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Receipt verified successfully",
  "data": {
    "isValid": true,
    "receipt": {
      "id": "0007f83876edc1c1fc600a36457a54d4",
      "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
      "hcsTopicId": "0.0.7153725",
      "hcsSequence": 4,
      "hcsTimestamp": "1730136987.123456789",
      "storeName": "Acme Store",
      "amount": 10.0,
      "receiptDate": "2025-10-28T00:00:00.000Z"
    },
    "hcsData": {
      "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
      "timestamp": 1730136987123,
      "consensusTimestamp": "2025-10-28T12:36:27.123Z",
      "runningHash": "a1b2c3d4e5f6...",
      "sequenceNumber": 4
    },
    "match": {
      "hashMatch": true,
      "receiptIdMatch": true
    }
  }
}
```

**Invalid Receipt Example:**

```json
{
  "success": false,
  "message": "Receipt verification failed",
  "data": {
    "isValid": false,
    "receipt": { ... },
    "hcsData": { ... },
    "match": {
      "hashMatch": false,
      "receiptIdMatch": true
    }
  }
}
```

**Error Responses:**

- `404 Not Found`: Receipt not found
- `400 Bad Request`: Receipt not anchored to HCS yet

---

### Verify a receipt (public)

**GET** `/api/receipts/public/:id/verify`

**Auth:** None (public endpoint)

**Description:** Same verification as the authenticated endpoint, but accessible without any token. Share this URL with third parties (auditors, customers, regulators) to prove receipt authenticity.

**Use cases:**

- Customer wants to verify their receipt independently
- Third-party audit of transaction records
- Regulatory compliance verification
- Public transparency

**Examples:**

**curl (Windows PowerShell):**

```powershell
curl.exe "http://localhost:3000/api/receipts/public/0007f83876edc1c1fc600a36457a54d4/verify"
```

**PowerShell Invoke-RestMethod:**

```powershell
$receiptId = "0007f83876edc1c1fc600a36457a54d4"
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/receipts/public/$receiptId/verify"
```

**JavaScript/Fetch:**

```javascript
const receiptId = "0007f83876edc1c1fc600a36457a54d4";
const response = await fetch(
  `http://localhost:3000/api/receipts/public/${receiptId}/verify`
);
const data = await response.json();
console.log("Receipt is valid:", data.data.isValid);
```

**Response:** Same format as authenticated verify endpoint above.

---

### Get receipt proof bundle

**GET** `/api/receipts/:id/proof`

**Auth:** None (public use in current build)

**Description:** Returns a comprehensive proof bundle containing:

- Receipt metadata from database
- HCS anchoring information
- Ready-to-share verification links
- Mirror Node URL for on-chain data

This endpoint is perfect for generating proof documents or sharing verification information.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": "0007f83876edc1c1fc600a36457a54d4",
      "hash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
      "storeName": "Acme Store",
      "amount": 10.0,
      "receiptDate": "2025-10-28T00:00:00.000Z",
      "createdAt": "2025-10-28T12:34:56.000Z"
    },
    "hcs": {
      "topicId": "0.0.7153725",
      "sequence": 4,
      "consensusTimestamp": "1730136987.123456789",
      "network": "testnet"
    },
    "verification": {
      "apiUrl": "http://localhost:3000/api/receipts/public/0007f83876edc1c1fc600a36457a54d4/verify",
      "mirrorNodeUrl": "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7153725/messages/4",
      "hashScanUrl": "https://hashscan.io/testnet/topic/0.0.7153725?tid=4"
    },
    "proof": {
      "receiptHash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
      "hcsMessageHash": "12b88ce6f681f443e2bb7f5b119da4f88a724b36e2927cf38251f6a472d46ed4",
      "timestamp": "2025-10-28T12:36:27.123Z",
      "verified": true
    }
  }
}
```

**PowerShell Example:**

```powershell
$receiptId = "0007f83876edc1c1fc600a36457a54d4"
$proof = Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/receipts/$receiptId/proof"
Write-Host "HashScan URL: $($proof.data.verification.hashScanUrl)"
```

**Error Responses:**

- `404 Not Found`: Receipt not found
- `400 Bad Request`: Receipt not anchored to HCS

---

### Bulk anchor receipts

**POST** `/api/receipts/bulk-anchor`

**Auth:** Bearer token (user)

**Description:** Anchor multiple receipts to HCS in a single operation. Useful for:

- Batch processing historical receipts
- Migrating receipts after enabling HCS
- Periodic anchoring of pending receipts

**Request Body:**

```json
{
  "receiptIds": ["id1", "id2", "id3"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Bulk anchoring completed",
  "results": {
    "total": 3,
    "successful": 2,
    "failed": 1,
    "details": [
      {
        "receiptId": "id1",
        "success": true,
        "topicId": "0.0.7153725",
        "sequence": 5
      },
      {
        "receiptId": "id2",
        "success": true,
        "topicId": "0.0.7153725",
        "sequence": 6
      },
      {
        "receiptId": "id3",
        "success": false,
        "error": "Receipt already anchored"
      }
    ]
  }
}
```

**PowerShell Example:**

```powershell
$token = "<JWT>"
$body = @{
  receiptIds = @("id1", "id2", "id3")
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/receipts/bulk-anchor" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid receiptIds array
- `403 Forbidden`: One or more receipts don't belong to the authenticated user

---

### HCS service status

**GET** `/api/receipts/hcs/status`

**Auth:** None (public endpoint)

**Description:** Returns HCS client initialization state, network configuration, and the configured topic ID. Useful for:

- Health checks
- Debugging connection issues
- Verifying configuration

**Response:** `200 OK`

```json
{
  "success": true,
  "status": {
    "initialized": true,
    "network": "testnet",
    "topicId": "0.0.7153725",
    "operatorId": "0.0.1234567"
  }
}
```

**Not Initialized Example:**

```json
{
  "success": false,
  "status": {
    "initialized": false,
    "error": "HCS client not initialized - check OPERATOR_ID and OPERATOR_KEY env vars"
  }
}
```

**PowerShell Example:**

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/receipts/hcs/status"
```

---

## Merchant POS endpoints

Use your merchant API key in the `X-API-Key` header. These endpoints create receipts and award points; created receipts are auto-anchored to HCS in the background.

### Get Merchant API Key

Merchants can obtain their API key from their dashboard after registering as a merchant. The API key is a secure token that authenticates merchant POS systems.

**Security Note:** Keep your API key secure. Never expose it in client-side code or public repositories.

---

### Create receipt (POS)

**POST** `/api/merchant/pos/create-receipt`

**Auth:** X-API-Key header

**Description:** Create a receipt from a merchant POS system. This endpoint:

1. Validates the customer ID
2. Creates a receipt with the provided items
3. Awards points to the customer based on purchase amount
4. Auto-anchors the receipt to Hedera HCS in the background
5. Sends notifications to the customer

**Request Body:**

```json
{
  "customerId": "b2f41ec5de863c3892b000d3950a4d11",
  "items": [
    { "name": "Coffee", "quantity": 1, "price": 5.0 },
    { "name": "Croissant", "quantity": 2, "price": 3.5 }
  ],
  "totalAmount": 12.0,
  "category": "dining",
  "paymentMethod": "card",
  "notes": "Table 5"
}
```

**Request Fields:**

- `customerId` (required) - User ID or handle
- `items` (required) - Array of purchased items
- `totalAmount` (required) - Total purchase amount
- `category` (required) - Receipt category (dining, groceries, transport, etc.)
- `paymentMethod` (optional) - Payment method used
- `notes` (optional) - Additional notes

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Receipt created successfully",
  "receipt": {
    "id": "0007f83876edc1c1fc600a36457a54d4",
    "userId": "b2f41ec5de863c3892b000d3950a4d11",
    "merchantId": "72b79fe967b51d928d53a9fd61e69390",
    "storeName": "Coffee Shop",
    "amount": 12.0,
    "receiptDate": "2025-10-28T12:34:56.000Z",
    "category": "dining",
    "items": [
      { "name": "Coffee", "quantity": 1, "price": 5.0 },
      { "name": "Croissant", "quantity": 2, "price": 3.5 }
    ],
    "hash": "a1b2c3d4e5f6...",
    "hcs_topic_id": "0.0.7153725",
    "hcs_sequence": 7,
    "hcs_consensus_timestamp": "1730137896.987654321"
  },
  "points": {
    "awarded": 15,
    "newBalance": 165,
    "tier": "silver"
  },
  "user": {
    "id": "b2f41ec5de863c3892b000d3950a4d11",
    "handle": "user123",
    "email": "user@example.com"
  }
}
```

**PowerShell Example:**

```powershell
$apiKey = "<MERCHANT_API_KEY>"
$body = @{
  customerId = "b2f41ec5de863c3892b000d3950a4d11"
  items = @(
    @{ name = "Coffee"; quantity = 1; price = 5.0 }
    @{ name = "Croissant"; quantity = 2; price = 3.5 }
  )
  totalAmount = 12.0
  category = "dining"
  paymentMethod = "card"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/merchant/pos/create-receipt" -Headers @{ 'X-API-Key' = $apiKey } -ContentType "application/json" -Body $body
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/merchant/pos/create-receipt \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "b2f41ec5de863c3892b000d3950a4d11",
    "items": [{"name": "Coffee", "quantity": 1, "price": 5.0}],
    "totalAmount": 5.0,
    "category": "dining"
  }'
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Customer not found

---

### Scan QR and award points (optional receipt creation)

**POST** `/api/merchant/scan-qr`

**Auth:** X-API-Key header

**Description:** Scan a customer's QR code to identify them and optionally create a receipt. This endpoint:

1. Decodes the customer QR code
2. Awards points based on purchase amount
3. Optionally creates and anchors a receipt if `receiptData` is provided

**Request Body:**

```json
{
  "qrData": "b2f41ec5de863c3892b000d3950a4d11",
  "purchaseAmount": 10.0,
  "receiptData": {
    "category": "dining",
    "items": [{ "name": "Coffee", "price": 10.0, "quantity": 1 }],
    "paymentMethod": "card",
    "notes": "Quick scan purchase"
  }
}
```

**Request Fields:**

- `qrData` (required) - QR code data (user ID or QR JSON)
- `purchaseAmount` (required) - Purchase amount for points calculation
- `receiptData` (optional) - If provided, creates a receipt with these details

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Points awarded successfully",
  "user": {
    "id": "b2f41ec5de863c3892b000d3950a4d11",
    "handle": "user123",
    "points": 175,
    "tier": "silver"
  },
  "points": {
    "awarded": 10,
    "previousBalance": 165,
    "newBalance": 175
  },
  "receipt": {
    "id": "abc123...",
    "amount": 10.0,
    "hcs_topic_id": "0.0.7153725",
    "hcs_sequence": 8
  }
}
```

**PowerShell Example:**

```powershell
$apiKey = "<MERCHANT_API_KEY>"
$body = @{
  qrData = "b2f41ec5de863c3892b000d3950a4d11"
  purchaseAmount = 10.0
  receiptData = @{
    category = "dining"
    items = @(@{ name = "Coffee"; price = 10.0; quantity = 1 })
  }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/merchant/scan-qr" -Headers @{ 'X-API-Key' = $apiKey } -ContentType "application/json" -Body $body
```

**Error Responses:**

- `400 Bad Request`: Invalid QR data or missing required fields
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Customer not found

---

### List recent POS transactions

**GET** `/api/merchant/pos/recent-transactions`

**Auth:** X-API-Key header

**Query Parameters:**

- `limit` (optional) - Number of transactions to return (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Description:** Retrieve recent receipts created by this merchant's POS system.

**Response:** `200 OK`

```json
{
  "success": true,
  "transactions": [
    {
      "id": "0007f83876edc1c1fc600a36457a54d4",
      "customerId": "b2f41ec5de863c3892b000d3950a4d11",
      "customerHandle": "user123",
      "amount": 12.0,
      "category": "dining",
      "items": [...],
      "pointsAwarded": 15,
      "hcs_topic_id": "0.0.7153725",
      "hcs_sequence": 7,
      "createdAt": "2025-10-28T12:34:56.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 156
  }
}
```

**PowerShell Example:**

```powershell
$apiKey = "<MERCHANT_API_KEY>"
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/merchant/pos/recent-transactions?limit=10" -Headers @{ 'X-API-Key' = $apiKey }
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing API key

---

## Token (HTS) Endpoints

These endpoints provide information about the ReceiptoVerse Points (RVP) token on Hedera Token Service (HTS).

### Get Token Information

**GET** `/api/token/info`

Get details about the RVP token, including token ID, symbol, and network information.

**Authentication:** None required

**Response:** `200 OK`

```json
{
  "tokenId": "0.0.7154427",
  "name": "ReceiptoVerse Points",
  "symbol": "RVP",
  "decimals": 2,
  "totalSupply": "1000000000",
  "treasury": "0.0.6913837",
  "network": "testnet",
  "hashscanUrl": "https://hashscan.io/testnet/token/0.0.7154427"
}
```

**PowerShell Example:**

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/token/info"
```

**curl Example:**

```bash
curl http://localhost:3000/api/token/info
```

---

### Get Token Balance

**GET** `/api/token/balance/:accountId`

Get the RVP token balance for a specific Hedera account.

**Authentication:** None required

**URL Parameters:**

- `accountId` (string, required): Hedera account ID in format `0.0.XXXXX`

**Response:** `200 OK`

```json
{
  "accountId": "0.0.1234567",
  "tokenId": "0.0.7154427",
  "balance": "50000",
  "decimals": 2,
  "displayBalance": "500.00"
}
```

**PowerShell Example:**

```powershell
$accountId = "0.0.1234567"
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/token/balance/$accountId"
```

**curl Example:**

```bash
curl http://localhost:3000/api/token/balance/0.0.1234567
```

**Error Responses:**

- `400 Bad Request`: Invalid account ID format
- `500 Internal Server Error`: Failed to query balance (account may not exist)

---

### Check Token Association Status

**GET** `/api/token/association-status/:accountId`

Check if a Hedera account is associated with the RVP token. Accounts must associate with a token before they can receive it.

**Authentication:** None required

**URL Parameters:**

- `accountId` (string, required): Hedera account ID in format `0.0.XXXXX`

**Response:** `200 OK` (Associated)

```json
{
  "accountId": "0.0.1234567",
  "tokenId": "0.0.7154427",
  "isAssociated": true,
  "message": "Account is associated and can receive RVP tokens",
  "hashscanUrl": "https://hashscan.io/testnet/account/0.0.1234567"
}
```

**Response:** `200 OK` (Not Associated)

```json
{
  "accountId": "0.0.1234567",
  "tokenId": "0.0.7154427",
  "isAssociated": false,
  "message": "Account needs to associate with RVP token before receiving tokens",
  "hashscanUrl": "https://hashscan.io/testnet/account/0.0.1234567"
}
```

**PowerShell Example:**

```powershell
$accountId = "0.0.1234567"
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/token/association-status/$accountId"
```

**curl Example:**

```bash
curl http://localhost:3000/api/token/association-status/0.0.1234567
```

**Error Responses:**

- `400 Bad Request`: Invalid account ID format
- `500 Internal Server Error`: Failed to check association (Mirror Node query failed)

**Notes:**

- When users earn points, the backend automatically checks association before minting tokens
- If not associated, points are tracked in the database only (not on-chain)
- Users can associate via wallet apps (HashPack, Blade, etc.) or frontend "Associate RVP" button

---

## Common Error Responses

All endpoints follow a consistent error response format:

**400 Bad Request** - Invalid request data

```json
{
  "success": false,
  "error": "Missing required field: storeName"
}
```

**401 Unauthorized** - Authentication failed

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**403 Forbidden** - Insufficient permissions

```json
{
  "success": false,
  "error": "You don't have permission to access this resource"
}
```

**404 Not Found** - Resource not found

```json
{
  "success": false,
  "error": "Receipt not found"
}
```

**500 Internal Server Error** - Server error

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "HCS client initialization failed"
}
```

---

## Tips and Troubleshooting

### Environment Setup

Ensure your `.env` file includes:

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=YOUR_PRIVATE_KEY
HCS_RECEIPT_TOPIC_ID=0.0.YOUR_TOPIC_ID

# API Configuration
PORT=3000
JWT_SECRET=your_jwt_secret
```

### Common Issues

**Receipts not showing HCS fields:**

- Check that `HCS_RECEIPT_TOPIC_ID` is set in `.env`
- Verify HCS client is initialized: `GET /api/receipts/hcs/status`
- For old receipts, manually anchor: `POST /api/receipts/:id/anchor`

**Verification fails:**

- Ensure the receipt has been anchored (check `hcs_topic_id` is not null)
- Wait a few seconds after creation for consensus timestamp to be available
- Check network matches (testnet vs mainnet)

**Migration from pre-HCS database:**

1. Run database migrations: `node run-migrations.js`
2. Bulk anchor existing receipts: `POST /api/receipts/bulk-anchor`
3. Verify anchoring: `GET /api/receipts/:id/verify`

### Testing Workflow

1. **Create a receipt:**

   ```powershell
   $response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/receipts" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
   $receiptId = $response.receipt.id
   ```

2. **Verify it was anchored:**

   ```powershell
   Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/receipts/public/$receiptId/verify"
   ```

3. **Get proof bundle:**
   ```powershell
   $proof = Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/receipts/$receiptId/proof"
   Write-Host "HashScan: $($proof.data.verification.hashScanUrl)"
   ```

### Viewing on HashScan

After anchoring, view your receipt on Hedera's explorer:

- **Testnet:** https://hashscan.io/testnet/topic/0.0.7153725?tid=4
- **Mainnet:** https://hashscan.io/mainnet/topic/0.0.7153725?tid=4

Replace the topic ID and sequence number (`tid`) with your values.

---

## Changelog

- **2025-10-28:**
  - Auto-anchoring enabled on receipt creation (users and merchant POS)
  - Public verify endpoint available at `/api/receipts/public/:id/verify`
  - NFT threshold gating removed from POS flow
  - Added HCS fields to all receipt responses
  - Improved error handling and response consistency
  - Added proof bundle endpoint for comprehensive verification
