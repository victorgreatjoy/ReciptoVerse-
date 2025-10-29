# Testing Points System - Complete Guide

## Prerequisites

1. ✅ Backend running (Port 3001)
2. ✅ Frontend running (Port 5173)
3. ✅ User account created and logged in
4. ✅ Merchant account created (if testing as merchant)

## Test Scenario 1: User Receives Points

### Step 1: Become a Merchant (if not already)

1. Click **"🏪 Be a Merchant"** in the main navigation
2. Fill out the merchant application form
3. Wait for approval (or manually approve in database)

### Step 2: User Shows QR Code

**As User:**

1. Click **"📊 Analytics"** in main navigation
2. Click **"📱 QR Code"** tab
3. Your QR code should display with:
   - User ID
   - Current points balance
   - Tier badge (Bronze/Silver/Gold/Platinum)
   - 2-minute countdown timer

**QR Code Contains:**

```json
{
  "userId": "your-user-id",
  "accountId": "0.0.xxxxx",
  "timestamp": 1234567890,
  "signature": "signed-data"
}
```

### Step 3: Merchant Scans QR Code

**As Merchant:**

1. Open a new incognito/private window (or different browser)
2. Sign in as merchant account
3. Click **"🏪 Merchant Dashboard"**
4. Click **"📷 QR Scanner"** tab
5. Choose scanning mode:
   - **Camera Mode**: Use device camera to scan QR code from user's screen
   - **Manual Mode**: Click "Manual Entry" and paste the QR code data

### Step 4: Award Points

1. After scanning, enter **Purchase Amount** (e.g., $50.00)
2. Optionally add **Receipt Notes**
3. Click **"Award Points"** button
4. You should see:
   - Success confetti animation 🎉
   - Points awarded message
   - New balance displayed

### Step 5: Verify Points Received

**Back as User:**

1. Go to **"📊 Analytics"** → **"🏆 Rewards"** tab
2. Check:
   - ✅ Points balance increased
   - ✅ Transaction appears in history
   - ✅ Tier progress updated

## Troubleshooting

### Issue: "Not receiving points"

**Check 1: Are you logged in as a merchant?**

- Only approved merchants can award points
- Check merchant status: Database → `merchants` table → `status = 'approved'`

**Check 2: Is the merchant API key set?**
Open browser console and check:

```javascript
localStorage.getItem("merchantApiKey");
```

Should return a valid API key string.

**Check 3: Check backend logs**
In backend terminal, you should see:

```
QR scan request from merchant: <merchant-id>
Awarding points: user=<user-id>, amount=$50.00
Points awarded successfully: +50 points
```

**Check 4: Check database**

```sql
-- Check points balance
SELECT * FROM user_points WHERE user_id = 'your-user-id';

-- Check transaction history
SELECT * FROM points_transactions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 5;
```

**Check 5: Network errors**
Open browser DevTools (F12) → Network tab:

- Look for request to `/api/merchant/scan-qr`
- Status should be `200 OK`
- Response should show `{ success: true, ... }`

### Issue: "401 Unauthorized"

- Merchant not logged in
- Merchant API key expired or invalid
- Check: `localStorage.getItem('merchantApiKey')`

### Issue: "403 Forbidden"

- Merchant account not approved
- Update database: `UPDATE merchants SET status = 'approved' WHERE user_id = 'your-user-id';`

### Issue: "Invalid QR code"

- QR code expired (2-minute timeout)
- Generate new QR code (refresh the QR Code tab)

### Issue: "Transaction validation failed"

Possible reasons:

- Purchase amount too high (>$10,000)
- Purchase amount too low (<$0.01)
- Too many transactions in short period (rate limiting)
- Same merchant and user in last 5 minutes

## Manual Database Testing

If the UI isn't working, test directly in the database:

```sql
-- 1. Create user_points record if not exists
INSERT OR IGNORE INTO user_points (user_id, balance, total_earned, tier)
VALUES ('your-user-id', 0, 0, 'bronze');

-- 2. Award 100 points manually
UPDATE user_points
SET balance = balance + 100,
    total_earned = total_earned + 100,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 'your-user-id';

-- 3. Create transaction record
INSERT INTO points_transactions
(user_id, amount, type, description, merchant_id)
VALUES
('your-user-id', 100, 'purchase', 'Test purchase', 'merchant-user-id');

-- 4. Verify
SELECT * FROM user_points WHERE user_id = 'your-user-id';
SELECT * FROM points_transactions WHERE user_id = 'your-user-id';
```

## Expected Points Calculation

**Base Points:** $1 = 1 point

**Tier Multipliers:**

- Bronze (0-999 points): 1.0x
- Silver (1,000-4,999 points): 1.25x
- Gold (5,000-19,999 points): 1.5x
- Platinum (20,000+ points): 2.0x

**Example:**

- Purchase: $50.00
- Tier: Silver (1.25x)
- Points awarded: 50 × 1.25 = 62.5 → **63 points** (rounded)

## Quick Test Commands

**Check user ID (in browser console):**

```javascript
// Should show your user object
JSON.parse(localStorage.getItem("user"));
```

**Check if merchant (in browser console):**

```javascript
const user = JSON.parse(localStorage.getItem("user"));
console.log("Is Merchant:", user?.isMerchant);
console.log("Merchant API Key:", localStorage.getItem("merchantApiKey"));
```

**Award points via API (in browser console):**

```javascript
// Test awarding points directly
const apiKey = localStorage.getItem("merchantApiKey");
const userId = "target-user-id"; // Replace with actual user ID

fetch("http://localhost:3001/api/merchant/scan-qr", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  },
  body: JSON.stringify({
    qrData: userId,
    purchaseAmount: 50,
    receiptData: null,
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

## Success Criteria

✅ User can generate QR code  
✅ Merchant can scan QR code  
✅ Points are awarded after purchase  
✅ User sees updated balance in Rewards tab  
✅ Transaction appears in history  
✅ Email notification sent (if configured)  
✅ Tier updates when thresholds crossed

## Next Steps

After verifying points work:

1. Test token minting (100 points = 1 $RVT token)
2. Test tier progression (collect enough points to level up)
3. Test merchant rewards stats
4. Test email notifications
