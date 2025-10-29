/**
 * Test script for HTS Points Token
 *
 * This script tests:
 * 1. Token info retrieval
 * 2. Balance queries
 * 3. Token minting (test mode)
 *
 * Run: node test-hts-points.js
 */

require("dotenv").config();
const htsPointsService = require("./src/services/blockchain/htsPointsService");

async function testHTSPoints() {
  console.log("=".repeat(60));
  console.log("🧪 Testing HTS Points Token");
  console.log("=".repeat(60));
  console.log();

  try {
    // Initialize service
    console.log("1️⃣ Initializing HTS Points Service...");
    const initialized = await htsPointsService.initialize();

    if (!initialized) {
      console.error("❌ Failed to initialize");
      process.exit(1);
    }

    console.log("✅ Service initialized");
    console.log();

    // Get token info
    console.log("2️⃣ Token Information:");
    const info = htsPointsService.getTokenInfo();

    if (!info.tokenId) {
      console.error("❌ No token ID found");
      console.log("\nℹ️ Run setup-hts-token.js first to create the token");
      process.exit(1);
    }

    console.log(`   Token ID: ${info.tokenId}`);
    console.log(`   Network: ${info.network}`);
    console.log(`   Operator: ${info.operatorId}`);
    console.log(`   HashScan: ${info.hashscanUrl}`);
    console.log();

    // Query treasury balance
    console.log("3️⃣ Querying Treasury Balance...");
    const treasuryBalance = await htsPointsService.getBalance(info.operatorId);

    console.log(`   Account: ${treasuryBalance.accountId}`);
    console.log(`   Points Balance: ${treasuryBalance.balance}`);
    console.log(`   HBAR Balance: ${treasuryBalance.hbarBalance}`);
    console.log();

    // Test minting (optional - uncomment if you want to test)
    /*
    console.log("4️⃣ Testing Token Minting...");
    console.log("   ⚠️ This will mint 100 test tokens to treasury");
    
    const mintResult = await htsPointsService.mintPoints(
      info.operatorId,
      100,
      "Test mint"
    );
    
    console.log(`   ✅ Minted: ${mintResult.amount} tokens`);
    console.log(`   Transaction: ${mintResult.mintTxId}`);
    console.log();
    
    // Query balance again
    const newBalance = await htsPointsService.getBalance(info.operatorId);
    console.log(`   New Balance: ${newBalance.balance}`);
    console.log();
    */

    console.log("=".repeat(60));
    console.log("✅ All tests passed!");
    console.log("=".repeat(60));
    console.log();
    console.log("Next steps:");
    console.log("  - Integrate with points service");
    console.log("  - Add API endpoints for token operations");
    console.log("  - Update frontend to display token balances");
    console.log();
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("\nError details:", error.message);
    if (error.status) {
      console.error("Status:", error.status.toString());
    }
    process.exit(1);
  }
}

// Run tests
testHTSPoints()
  .then(() => {
    console.log("✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
