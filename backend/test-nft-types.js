/**
 * Simple test to check NFT types without authentication
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

async function testNFTTypes() {
  try {
    console.log("🧪 Testing NFT Types Endpoint\n");
    console.log("=".repeat(60));

    // Test 1: Get all NFT types (no auth required)
    console.log("\n📝 Test 1: GET /api/nft/types");
    const response = await axios.get(`${API_BASE}/nft/types`);

    console.log("✅ Success!");
    console.log(`   Total NFT types: ${response.data.count}`);
    console.log("");

    response.data.nft_types.forEach((nft, index) => {
      console.log(`${index + 1}. ${nft.name}`);
      console.log(`   Animal: ${nft.animal_type}`);
      console.log(`   Tier: ${nft.tier} | Rarity: ${nft.rarity}`);
      console.log(`   Cost: ${nft.point_cost} points`);
      console.log(`   Discount: ${nft.discount_percentage}%`);
      console.log(`   Monthly Bonus: ${nft.monthly_bonus_points} points`);
      console.log(
        `   Supply: ${nft.current_supply}/${
          nft.max_supply === -1 ? "∞" : nft.max_supply
        }`
      );
      console.log(
        `   Available: ${nft.is_available ? "✅ Yes" : "❌ Sold Out"}`
      );
      console.log(`   Benefits: ${nft.benefits.join(", ")}`);
      console.log("");
    });

    // Test 2: Get specific NFT type
    if (response.data.nft_types.length > 0) {
      const firstNFT = response.data.nft_types[0];
      console.log(`📝 Test 2: GET /api/nft/types/${firstNFT.id}`);
      const detailResponse = await axios.get(
        `${API_BASE}/nft/types/${firstNFT.id}`
      );

      console.log("✅ Success!");
      console.log(`   Name: ${detailResponse.data.nft_type.name}`);
      console.log(
        `   Description: ${detailResponse.data.nft_type.description}`
      );
      console.log(
        `   Metadata:`,
        JSON.stringify(detailResponse.data.nft_type.metadata_template, null, 2)
      );
      console.log("");
    }

    // Test 3: Filter by animal type
    console.log("📝 Test 3: GET /api/nft/types?animalType=rabbit");
    const rabbitResponse = await axios.get(
      `${API_BASE}/nft/types?animalType=rabbit`
    );
    console.log(`✅ Found ${rabbitResponse.data.count} rabbit NFTs`);
    console.log("");

    // Test 4: Filter by tier
    console.log("📝 Test 4: GET /api/nft/types?tier=1");
    const tier1Response = await axios.get(`${API_BASE}/nft/types?tier=1`);
    console.log(`✅ Found ${tier1Response.data.count} tier 1 NFTs`);
    console.log("");

    // Test 5: Available only
    console.log("📝 Test 5: GET /api/nft/types?availableOnly=true");
    const availableResponse = await axios.get(
      `${API_BASE}/nft/types?availableOnly=true`
    );
    console.log(`✅ Found ${availableResponse.data.count} available NFTs`);
    console.log("");

    console.log("=".repeat(60));
    console.log("🎉 All tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

testNFTTypes();
