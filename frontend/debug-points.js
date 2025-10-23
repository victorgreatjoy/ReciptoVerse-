// Debug Points System
// Run this in your browser console (F12) when on the app

console.log("=== POINTS SYSTEM DEBUG ===");

// Check authentication
const token = localStorage.getItem("receiptoverse_token");
const user = JSON.parse(localStorage.getItem("user") || "null");
const merchantApiKey = localStorage.getItem("merchantApiKey");

console.log("1. Authentication:");
console.log("  - Token:", token ? "✅ Present" : "❌ Missing");
console.log(
  "  - User:",
  user ? `✅ ${user.handle} (ID: ${user.id})` : "❌ Not logged in"
);
console.log("  - Is Merchant:", user?.isMerchant ? "✅ Yes" : "❌ No");
console.log(
  "  - Merchant API Key:",
  merchantApiKey ? "✅ Present" : "❌ Missing"
);

// Test points API
console.log("\n2. Testing Points API...");

fetch("http://localhost:3001/api/points/balance", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((r) => r.json())
  .then((data) => {
    console.log("  Points Balance:", data);
    if (data.success) {
      console.log(`  ✅ Current Balance: ${data.data.balance} points`);
      console.log(`  ✅ Tier: ${data.data.tier}`);
    } else {
      console.log("  ❌ Failed to fetch balance:", data.error);
    }
  })
  .catch((err) => {
    console.error("  ❌ API Error:", err);
  });

// Test if merchant can award points
if (user?.isMerchant && merchantApiKey) {
  console.log("\n3. Merchant Functions:");
  console.log("  ✅ You can award points to users");
  console.log("\n  To test awarding points, run:");
  console.log(`  
  fetch('http://localhost:3001/api/merchant/scan-qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${merchantApiKey}'
    },
    body: JSON.stringify({
      qrData: '${user.id}', // Awarding to yourself for testing
      purchaseAmount: 50
    })
  })
  .then(r => r.json())
  .then(console.log)
  `);
} else {
  console.log("\n3. Merchant Functions:");
  console.log("  ❌ Not a merchant - cannot award points");
  console.log("  💡 Click 'Be a Merchant' to sign up");
}

console.log("\n=== END DEBUG ===");
