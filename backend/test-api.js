/**
 * Test script for ReciptoVerse API endpoints
 * Run with: node test-api.js
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000";

// Test data for minting a receipt
const testReceiptData = {
  merchant: "Coffee Shop Downtown",
  items: [
    { name: "Latte", price: 4.5, quantity: 2 },
    { name: "Croissant", price: 3.25, quantity: 1 },
    { name: "Muffin", price: 2.75, quantity: 1 },
  ],
  total: 15.0,
  customerWallet: "0.0.6913837", // Using operator account for testing (will show test mode)
};

async function testTokenAssociation() {
  console.log("\n🔗 Testing Token Association...");
  try {
    const response = await axios.post(`${API_BASE}/associate-tokens`, {
      accountId: "0.0.6913837", // Your operator account
    });

    console.log("✅ Association Response:", response.data);
    return true;
  } catch (error) {
    console.log("⚠️ Association Error:", error.response?.data || error.message);
    return false;
  }
}

async function testReceiptMinting() {
  console.log("\n🧾 Testing Receipt NFT Minting...");
  try {
    const response = await axios.post(
      `${API_BASE}/mint-receipt`,
      testReceiptData
    );

    console.log("✅ Mint Response:");
    console.log("  - Status:", response.data.status);
    console.log("  - Receipt NFT:", response.data.receiptNFT);
    console.log("  - Reward:", response.data.reward);
    console.log("  - View NFT:", response.data.nftViewUrl);
    console.log("  - Metadata URL:", response.data.metadataUrl);

    return response.data;
  } catch (error) {
    console.log("❌ Mint Error:", error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log("🚀 Starting ReciptoVerse API Tests");
  console.log("Server:", API_BASE);

  // Test 1: Token Association
  await testTokenAssociation();

  // Wait a moment between tests
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Receipt Minting
  const mintResult = await testReceiptMinting();

  if (mintResult) {
    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`  - Created receipt NFT: ${mintResult.receiptNFT}`);
    console.log(`  - Rewarded: ${mintResult.reward}`);
    console.log(`  - Check on HashScan: ${mintResult.nftViewUrl}`);
  } else {
    console.log("\n❌ Some tests failed. Check the errors above.");
  }
}

// Run the tests
runTests().catch(console.error);
