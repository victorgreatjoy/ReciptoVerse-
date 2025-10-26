/**
 * Test NFT public endpoints (no authentication required)
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

async function testPublicEndpoints() {
  console.log("🧪 Testing NFT Public Endpoints\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Get all NFT types
    console.log("\n📝 Test 1: GET /api/nft/types");
    const typesResponse = await axios.get(`${API_BASE}/nft/types`);

    console.log("✅ Success!");
    console.log(`   Status: ${typesResponse.status}`);
    console.log(`   Total NFT types: ${typesResponse.data.count}`);
    console.log("\n   NFT Types:");

    typesResponse.data.nft_types.forEach((nft, index) => {
      console.log(`\n   ${index + 1}. ${nft.name}`);
      console.log(`      Animal: ${nft.animal_type}`);
      console.log(`      Tier: ${nft.tier} | Rarity: ${nft.rarity}`);
      console.log(`      Cost: ${nft.point_cost} points`);
      console.log(`      Discount: ${nft.discount_percentage}%`);
      console.log(`      Monthly Bonus: ${nft.monthly_bonus_points} points`);
      console.log(
        `      Supply: ${nft.current_supply}/${
          nft.max_supply === -1 ? "∞" : nft.max_supply
        }`
      );
      console.log(`      Available: ${nft.is_available ? "Yes" : "SOLD OUT"}`);
      console.log(`      Benefits: ${nft.benefits.join(", ")}`);
    });

    // Test 2: Get specific NFT type
    if (typesResponse.data.nft_types.length > 0) {
      const firstNFT = typesResponse.data.nft_types[0];
      console.log(`\n📝 Test 2: GET /api/nft/types/${firstNFT.id}`);

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
    }

    // Test 3: Filter by animal type
    console.log("\n📝 Test 3: GET /api/nft/types?animalType=rabbit");
    const rabbitResponse = await axios.get(
      `${API_BASE}/nft/types?animalType=rabbit`
    );

    console.log("✅ Success!");
    console.log(`   Found ${rabbitResponse.data.count} rabbit NFT(s)`);

    // Test 4: Filter by tier
    console.log("\n📝 Test 4: GET /api/nft/types?tier=1");
    const tier1Response = await axios.get(`${API_BASE}/nft/types?tier=1`);

    console.log("✅ Success!");
    console.log(`   Found ${tier1Response.data.count} tier 1 NFT(s)`);

    // Test 5: Filter available only
    console.log("\n📝 Test 5: GET /api/nft/types?availableOnly=true");
    const availableResponse = await axios.get(
      `${API_BASE}/nft/types?availableOnly=true`
    );

    console.log("✅ Success!");
    console.log(`   Found ${availableResponse.data.count} available NFT(s)`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ All public endpoint tests passed!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

testPublicEndpoints();
