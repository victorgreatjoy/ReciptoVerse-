const { getHCSReceiptService } = require("./hcsReceiptService");
const htsPointsService = require("./htsPointsService");

/**
 * Initialize blockchain services on server startup
 */
async function initializeBlockchainServices() {
  console.log("🚀 Initializing blockchain services...");

  try {
    // Initialize HCS Receipt Service
    const hcsService = getHCSReceiptService();
    await hcsService.initialize();

    // Initialize HTS Points Service (if token ID is configured)
    if (process.env.HTS_POINTS_TOKEN_ID) {
      await htsPointsService.initialize();
      console.log("✅ HTS Points Service initialized");
    } else {
      console.log(
        "⚠️  HTS_POINTS_TOKEN_ID not configured - token features disabled"
      );
    }

    console.log("✅ Blockchain services initialized successfully");

    // Optionally start HCS message listener
    if (process.env.HCS_MESSAGE_LISTENER_ENABLED === "true") {
      await hcsService.startMessageListener((message, data) => {
        console.log(`📨 HCS Message received:`, {
          receiptId: data.receiptId,
          sequence: message.sequenceNumber,
          timestamp: message.consensusTimestamp,
        });
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize blockchain services:", error);
    console.error(
      "⚠️  The application will continue but blockchain features may not work"
    );
    return false;
  }
}

module.exports = { initializeBlockchainServices };
