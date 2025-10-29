/**
 * Setup script for HTS Points Token
 *
 * This script:
 * 1. Initializes the HTS Points Service
 * 2. Creates the points token (if not exists)
 * 3. Updates .env with the token ID
 *
 * Run once per deployment:
 * node setup-hts-token.js
 */

require("dotenv").config();
const htsPointsService = require("./src/services/blockchain/htsPointsService");
const fs = require("fs");
const path = require("path");

async function setupHTSToken() {
  console.log("=".repeat(60));
  console.log("🔷 HTS Points Token Setup");
  console.log("=".repeat(60));
  console.log();

  try {
    // Initialize service
    const initialized = await htsPointsService.initialize();

    if (!initialized) {
      console.error("❌ Failed to initialize HTS Points Service");
      console.log("\nℹ️ Make sure these env vars are set:");
      console.log("  - HEDERA_NETWORK (testnet or mainnet)");
      console.log("  - OPERATOR_ID (your Hedera account ID)");
      console.log("  - OPERATOR_KEY (your private key)");
      process.exit(1);
    }

    // Check if token already exists
    const info = htsPointsService.getTokenInfo();

    if (info.tokenId) {
      console.log("✅ Points token already exists!");
      console.log(`   Token ID: ${info.tokenId}`);
      console.log(`   Network: ${info.network}`);
      console.log(`   HashScan: ${info.hashscanUrl}`);
      console.log();
      console.log(
        "ℹ️ No action needed. Your .env already has HTS_POINTS_TOKEN_ID set."
      );
      return;
    }

    // Create new token
    console.log("📝 Creating new points token...");
    console.log();

    const tokenData = await htsPointsService.createToken({
      name: "ReceiptoVerse Points",
      symbol: "RVP",
      decimals: 0,
      initialSupply: 0,
      maxSupply: 1000000000, // 1 billion max
      memo: "ReceiptoVerse loyalty points - Phase 2",
    });

    console.log();
    console.log("✅ Token created successfully!");
    console.log("=".repeat(60));
    console.log("Token Details:");
    console.log(`  Token ID: ${tokenData.tokenId}`);
    console.log(`  Name: ${tokenData.name}`);
    console.log(`  Symbol: ${tokenData.symbol}`);
    console.log(`  Max Supply: ${tokenData.maxSupply.toLocaleString()}`);
    console.log(`  Network: ${tokenData.network}`);
    console.log(`  Treasury: ${tokenData.treasuryAccount}`);
    console.log("=".repeat(60));
    console.log();

    // Update .env file
    console.log("📝 Updating .env file...");

    const envPath = path.join(__dirname, ".env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Check if HTS_POINTS_TOKEN_ID already exists
    if (envContent.includes("HTS_POINTS_TOKEN_ID=")) {
      // Replace existing value
      envContent = envContent.replace(
        /HTS_POINTS_TOKEN_ID=.*/,
        `HTS_POINTS_TOKEN_ID=${tokenData.tokenId}`
      );
    } else {
      // Add new entry
      if (!envContent.endsWith("\n") && envContent.length > 0) {
        envContent += "\n";
      }
      envContent += `\n# HTS Points Token (created ${new Date().toISOString()})\n`;
      envContent += `HTS_POINTS_TOKEN_ID=${tokenData.tokenId}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log("✅ .env file updated");
    console.log();

    console.log("=".repeat(60));
    console.log("🎉 Setup Complete!");
    console.log("=".repeat(60));
    console.log();
    console.log("Next steps:");
    console.log("  1. Restart your backend server to load the new env var");
    console.log("  2. Test token minting with the test script:");
    console.log("     node test-hts-points.js");
    console.log("  3. View your token on HashScan:");
    console.log(
      `     https://hashscan.io/${tokenData.network}/token/${tokenData.tokenId}`
    );
    console.log();
  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.error("\nError details:", error.message);
    process.exit(1);
  }
}

// Run setup
setupHTSToken()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
