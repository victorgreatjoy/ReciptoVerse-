// Check if HTS service is initialized and working
require("dotenv").config();
const htsPointsService = require("./src/services/blockchain/htsPointsService");

async function testHTS() {
  try {
    console.log("🔍 Testing HTS Points Service...\n");

    // Check environment
    console.log("📋 Environment Variables:");
    console.log("   HEDERA_OPERATOR_ID:", process.env.HEDERA_OPERATOR_ID);
    console.log(
      "   HEDERA_OPERATOR_KEY:",
      process.env.HEDERA_OPERATOR_KEY ? "✓ Set" : "✗ Not set"
    );
    console.log("   HEDERA_NETWORK:", process.env.HEDERA_NETWORK);
    console.log("   HTS_POINTS_TOKEN_ID:", process.env.HTS_POINTS_TOKEN_ID);
    console.log("");

    // Check if initialized
    console.log("🔧 Service Status:");
    console.log("   Initialized:", htsPointsService.initialized);
    console.log("   Token ID:", htsPointsService.tokenId);
    console.log("");

    if (!htsPointsService.initialized) {
      console.log("⚠️  Service not initialized. Attempting to initialize...");
      await htsPointsService.initialize();
      console.log("✅ Service initialized successfully");
      console.log("   Token ID:", htsPointsService.tokenId);
    }

    // Test association check
    const testAccountId = "0.0.7040935";
    console.log(`\n🔍 Testing association for ${testAccountId}...`);
    const isAssociated = await htsPointsService.isAssociated(testAccountId);
    console.log("   Is Associated:", isAssociated);

    // Test balance query
    if (isAssociated) {
      console.log(`\n💰 Testing balance query for ${testAccountId}...`);
      const balance = await htsPointsService.getBalance(testAccountId);
      console.log("   Balance:", balance);
    }

    console.log("\n✅ HTS service is working correctly!");
    console.log("   Ready to mint tokens when users earn points.");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

testHTS();
