const { getDLTGateway } = require("./src/services/blockchain/dltGateway");
const {
  getHCSReceiptService,
} = require("./src/services/blockchain/hcsReceiptService");
require("dotenv").config();

/**
 * Setup script for Phase 1: HCS Receipt Anchoring
 * Run this once to initialize your Hedera blockchain integration
 */

async function setup() {
  console.log("🚀 ReceiptoVerse Phase 1 Setup - HCS Receipt Anchoring\n");

  try {
    // Step 1: Initialize DLT Gateway
    console.log("📡 Step 1: Initializing DLT Gateway...");
    const dltGateway = getDLTGateway();
    await dltGateway.initialize();

    const networkInfo = dltGateway.getNetworkInfo();
    console.log("\n✅ DLT Gateway initialized:");
    console.log(`   Network: ${networkInfo.network}`);
    console.log(`   Operator: ${networkInfo.operatorId}`);
    console.log(`   Mirror Node: ${networkInfo.mirrorNodeUrl}\n`);

    // Step 2: Initialize HCS Receipt Service
    console.log("📋 Step 2: Initializing HCS Receipt Service...");
    const hcsService = getHCSReceiptService();
    await hcsService.initialize();

    console.log("\n✅ HCS Receipt Service initialized:");
    console.log(`   Receipt Topic ID: ${hcsService.receiptTopicId}\n`);

    // Step 3: Publish a test HCS message (connectivity check)
    console.log("🧪 Step 3: Publishing test message to HCS topic...");

    const testMessage = {
      type: "setup_test",
      message: "ReceiptoVerse HCS online",
      timestamp: Date.now(),
      version: "1.0.0",
    };

    const publishResult = await dltGateway.publishToHCS(
      hcsService.receiptTopicId,
      testMessage
    );

    console.log("\n✅ Test message published successfully:");
    console.log(`   Topic: ${publishResult.topicId}`);
    console.log(`   Sequence: ${publishResult.sequenceNumber || "(pending)"}`);
    console.log(
      `   Consensus: ${publishResult.consensusTimestamp || "(check mirror)"}`
    );
    console.log(`   Tx ID: ${publishResult.transactionId}\n`);

    // Final summary
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ SETUP COMPLETE!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("📝 Add this to your .env file:");
    console.log(`HCS_RECEIPT_TOPIC_ID=${hcsService.receiptTopicId}\n`);

    console.log("🎯 Next steps:");
    console.log("1. Add the HCS_RECEIPT_TOPIC_ID to your .env file");
    console.log("2. Restart your backend server");
    console.log("3. Test anchoring a real receipt via API:");
    console.log("   POST /api/receipts/:id/anchor");
    console.log("4. Verify receipt via API:");
    console.log("   GET /api/receipts/:id/verify\n");

    console.log("🔗 View your test receipt on HashScan:");
    console.log(
      `   https://hashscan.io/${networkInfo.network}/topic/${hcsService.receiptTopicId}\n`
    );

    await dltGateway.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    console.error("\n💡 Troubleshooting:");
    console.error(
      "1. Make sure you've set OPERATOR_ID and OPERATOR_KEY (or HEDERA_OPERATOR_ID/HEDERA_OPERATOR_KEY) in .env"
    );
    console.error("2. Get free testnet account at: https://portal.hedera.com/");
    console.error("3. Ensure you have enough HBAR balance for transactions");
    process.exit(1);
  }
}

// Run setup
setup();
