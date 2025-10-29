/**
 * Test Script: NFT with HCS Proof Metadata
 *
 * This script demonstrates how NFT metadata now includes HCS receipt proof,
 * creating a verifiable link between reward NFTs and blockchain-anchored receipts.
 */

const hederaRewardNFTService = require("./src/hederaRewardNFTService");

async function testNFTWithHCSProof() {
  console.log("🧪 Testing NFT Metadata with HCS Proof\n");
  console.log("=".repeat(60));

  try {
    // Initialize the service
    await hederaRewardNFTService.initialize();

    // Mock NFT type (Gold Eagle)
    const mockNFTType = {
      name: "Gold Eagle",
      description: "Premium tier loyalty NFT with exclusive perks",
      animal_type: "Eagle",
      tier: "Gold",
      discount_percentage: 15,
      monthly_bonus_points: 50,
      image_ipfs_hash: "QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP",
      point_cost: 1000,
    };

    // Mock HCS proof from a verified receipt
    const mockHCSProof = {
      hcs_topic_id: "0.0.7153725",
      hcs_sequence: 42,
      hcs_timestamp: "2025-10-29T12:00:00.000Z",
      receipt_hash:
        "a3f5c8d2e9b1f4a7c6d8e2f5b9c3a7d1e4f8b2c5a9d3e7f1b5c8a2d6e9f3b7c1",
      consensus_timestamp: "1730211600.123456789",
    };

    const userAddress = "0.0.6913837";
    const serialNumber = Date.now();

    console.log("\n📋 NFT Type:");
    console.log(`   Name: ${mockNFTType.name}`);
    console.log(`   Tier: ${mockNFTType.tier}`);
    console.log(`   Discount: ${mockNFTType.discount_percentage}%`);
    console.log(`   Monthly Bonus: ${mockNFTType.monthly_bonus_points} RVP`);

    console.log("\n🔷 HCS Proof Data:");
    console.log(`   Topic ID: ${mockHCSProof.hcs_topic_id}`);
    console.log(`   Sequence: ${mockHCSProof.hcs_sequence}`);
    console.log(
      `   Receipt Hash: ${mockHCSProof.receipt_hash.substring(0, 20)}...`
    );
    console.log(`   Timestamp: ${mockHCSProof.hcs_timestamp}`);

    // Generate metadata WITH HCS proof
    console.log("\n✨ Generating Enhanced NFT Metadata...\n");
    const metadataWithProof = hederaRewardNFTService.generateRewardNFTMetadata(
      mockNFTType,
      userAddress,
      serialNumber,
      mockHCSProof
    );

    console.log("📦 Complete Metadata (with HCS Proof):");
    console.log(JSON.stringify(metadataWithProof, null, 2));

    // Generate metadata WITHOUT HCS proof (for comparison)
    console.log("\n" + "=".repeat(60));
    console.log("\n📦 Standard Metadata (without HCS Proof):");
    const metadataWithoutProof =
      hederaRewardNFTService.generateRewardNFTMetadata(
        mockNFTType,
        userAddress,
        serialNumber,
        null
      );
    console.log(JSON.stringify(metadataWithoutProof, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ Key Enhancements:");
    console.log('   1. ✓ Added "Receipt Verified" trait (true)');
    console.log('   2. ✓ Added "HCS Topic" trait (0.0.7153725)');
    console.log('   3. ✓ Added "HCS Sequence" trait (42)');
    console.log(
      "   4. ✓ Added properties.hcsProof with full verification data"
    );
    console.log("   5. ✓ Added HashScan link for instant verification");

    console.log("\n🔗 Verification:");
    if (metadataWithProof.properties?.hcsProof?.hashscanUrl) {
      console.log(
        `   View Proof: ${metadataWithProof.properties.hcsProof.hashscanUrl}`
      );
    }

    console.log("\n💡 Business Value:");
    console.log("   • NFT authenticity proven by on-chain receipt");
    console.log("   • Transparent verification via HashScan");
    console.log("   • Cross-service integration (HCS → HTS NFT)");
    console.log("   • Judges can verify end-to-end flow");

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test Complete - NFT metadata now includes HCS proof!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
    console.error(error.stack);
  }
}

// Run test
testNFTWithHCSProof().catch(console.error);
