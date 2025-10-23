/**
 * Test script for Points System
 * Run after backend is started: node backend/test-points-system.js
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

async function testPointsSystem() {
  console.log("🧪 Testing Points System...\n");

  try {
    // Test 1: Get Tier Information (Public endpoint)
    console.log("📊 Test 1: Get Tier Information");
    const tiersResponse = await axios.get(`${API_BASE}/points/tiers`);
    console.log("✅ Tiers retrieved:");
    console.log(JSON.stringify(tiersResponse.data, null, 2));
    console.log("\n");

    // Test 2: Test user registration and login (to get JWT)
    console.log("👤 Test 2: Register Test User");
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: "Test123!@#",
      desiredHandle: `testuser_${Date.now()}`,
      displayName: "Test User",
    };

    let userToken, userId;

    try {
      const registerResponse = await axios.post(
        `${API_BASE}/users/register`,
        testUser
      );
      console.log("✅ User registered:", registerResponse.data.message);

      // If email verification is required, skip login
      if (registerResponse.data.requiresVerification) {
        console.log(
          "ℹ️  Email verification required. Skipping authenticated tests."
        );
        return;
      }

      // Login to get JWT
      const loginResponse = await axios.post(`${API_BASE}/users/login`, {
        email: testUser.email,
        password: testUser.password,
      });

      userToken = loginResponse.data.token;
      userId = loginResponse.data.user.id;
      console.log("✅ User logged in, JWT obtained");
      console.log("User ID:", userId);
    } catch (error) {
      console.error(
        "❌ Registration/Login failed:",
        error.response?.data?.error || error.message
      );
      return;
    }

    console.log("\n");

    // Test 3: Get Points Balance (should be 0 for new user)
    console.log("💰 Test 3: Get Points Balance");
    try {
      const balanceResponse = await axios.get(`${API_BASE}/points/balance`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      console.log("✅ Points balance retrieved:");
      console.log(JSON.stringify(balanceResponse.data, null, 2));
    } catch (error) {
      console.error(
        "❌ Get balance failed:",
        error.response?.data?.error || error.message
      );
    }

    console.log("\n");

    // Test 4: Get Points History (should be empty for new user)
    console.log("📜 Test 4: Get Points History");
    try {
      const historyResponse = await axios.get(`${API_BASE}/points/history`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      console.log("✅ Points history retrieved:");
      console.log(JSON.stringify(historyResponse.data, null, 2));
    } catch (error) {
      console.error(
        "❌ Get history failed:",
        error.response?.data?.error || error.message
      );
    }

    console.log("\n");

    // Test 5: Get Points Stats
    console.log("📈 Test 5: Get Points Statistics");
    try {
      const statsResponse = await axios.get(`${API_BASE}/points/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      console.log("✅ Points stats retrieved:");
      console.log(JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.error(
        "❌ Get stats failed:",
        error.response?.data?.error || error.message
      );
    }

    console.log("\n");

    // Test 6: Register a Test Merchant
    console.log("🏪 Test 6: Register Test Merchant");
    const testMerchant = {
      businessName: `Test Store ${Date.now()}`,
      businessType: "Retail Store",
      email: `merchant_${Date.now()}@example.com`,
      phone: "555-0123",
      address: "123 Test St",
      city: "Test City",
      state: "CA",
      postalCode: "12345",
      contactPerson: "Test Manager",
    };

    let merchantApiKey;

    try {
      const merchantResponse = await axios.post(
        `${API_BASE}/merchants/register`,
        testMerchant,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      console.log("✅ Merchant registered:", merchantResponse.data.message);
      merchantApiKey = merchantResponse.data.apiKey;
      console.log("API Key (save this):", merchantApiKey);

      // Note: In production, admin would need to approve the merchant
      // For testing, you may need to manually approve via database
    } catch (error) {
      console.error(
        "❌ Merchant registration failed:",
        error.response?.data?.error || error.message
      );
    }

    console.log("\n");
    console.log("🎉 Basic Points System Tests Complete!");
    console.log("\n");
    console.log("📝 Next Steps:");
    console.log("1. Check backend logs for database initialization messages");
    console.log(
      "2. Verify tables created: points_transactions, token_mint_requests, merchant_rewards"
    );
    console.log(
      "3. Check users table for new columns: points_balance, loyalty_tier"
    );
    console.log("4. Approve the test merchant via admin panel");
    console.log(
      "5. Test QR scanning: POST /api/merchant/scan-qr with merchant API key"
    );
    console.log("\n");
    console.log("🔑 Test Credentials:");
    console.log(`User ID: ${userId}`);
    console.log(`User Email: ${testUser.email}`);
    console.log(`User Password: ${testUser.password}`);
    if (merchantApiKey) {
      console.log(`Merchant API Key: ${merchantApiKey}`);
    }
  } catch (error) {
    console.error("❌ Test suite error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

// Run tests
testPointsSystem()
  .then(() => {
    console.log("\n✅ Test suite completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  });
