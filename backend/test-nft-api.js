/**
 * Test script for NFT Rewards API endpoints
 * Tests all NFT operations: listing, minting, collection, benefits
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

// Test credentials - update with a real user
const TEST_USER = {
  email: "leandro.mirantexd@gmail.com", // Update with your email
  password: "leandro123", // Update if different
};

let authToken = null;
let testNFTTypeId = null;
let testMintId = null;

// Helper function to make authenticated requests
async function apiCall(method, endpoint, data = null, auth = true) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers:
        auth && authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

async function runTests() {
  console.log("🧪 NFT Rewards API Test Suite\n");
  console.log("=".repeat(60));

  // Test 1: Login
  console.log("\n📝 Test 1: Login");
  const loginResult = await apiCall("post", "/users/login", TEST_USER, false);

  if (!loginResult.success) {
    console.log("❌ Login failed:", loginResult.error);
    return;
  }

  authToken = loginResult.data.token;
  console.log("✅ Login successful");
  console.log(`   User: ${loginResult.data.user.username}`);
  console.log(`   Points: ${loginResult.data.user.points_balance}`);

  // Test 2: Get all NFT types
  console.log("\n📝 Test 2: Get all NFT types");
  const typesResult = await apiCall("get", "/nft/types", null, false);

  if (!typesResult.success) {
    console.log("❌ Failed:", typesResult.error);
    return;
  }

  console.log("✅ NFT types retrieved");
  console.log(`   Total types: ${typesResult.data.count}`);
  typesResult.data.nft_types.forEach((nft) => {
    console.log(`   - ${nft.name} (${nft.animal_type})`);
    console.log(
      `     Cost: ${nft.point_cost} pts | Discount: ${nft.discount_percentage}%`
    );
    console.log(
      `     Supply: ${nft.current_supply}/${
        nft.max_supply === -1 ? "∞" : nft.max_supply
      }`
    );
  });

  // Save first NFT type ID for testing
  testNFTTypeId = typesResult.data.nft_types[0]?.id;

  if (!testNFTTypeId) {
    console.log("❌ No NFT types available");
    return;
  }

  // Test 3: Get specific NFT type
  console.log("\n📝 Test 3: Get specific NFT type details");
  const typeDetailResult = await apiCall(
    "get",
    `/nft/types/${testNFTTypeId}`,
    null,
    false
  );

  if (!typeDetailResult.success) {
    console.log("❌ Failed:", typeDetailResult.error);
  } else {
    const nft = typeDetailResult.data.nft_type;
    console.log("✅ NFT type details retrieved");
    console.log(`   Name: ${nft.name}`);
    console.log(`   Description: ${nft.description}`);
    console.log(`   Benefits: ${nft.benefits.join(", ")}`);
    console.log(`   Metadata:`, JSON.stringify(nft.metadata_template, null, 2));
  }

  // Test 4: Check if user can mint
  console.log("\n📝 Test 4: Check if user can mint NFT");
  const canMintResult = await apiCall("get", `/nft/can-mint/${testNFTTypeId}`);

  if (!canMintResult.success) {
    console.log("❌ Failed:", canMintResult.error);
  } else {
    console.log("✅ Affordability check complete");
    console.log(`   Can mint: ${canMintResult.data.canMint}`);
    if (canMintResult.data.canMint) {
      console.log(`   User points: ${canMintResult.data.userPoints}`);
      console.log(`   NFT cost: ${canMintResult.data.nftCost}`);
      console.log(`   Remaining after: ${canMintResult.data.remainingPoints}`);
    } else {
      console.log(`   Reason: ${canMintResult.data.reason}`);
      if (canMintResult.data.shortfall) {
        console.log(`   Need ${canMintResult.data.shortfall} more points`);
      }
    }
  }

  // Test 5: Mint NFT (only if user can afford)
  if (canMintResult.success && canMintResult.data.canMint) {
    console.log("\n📝 Test 5: Mint NFT");
    const mintResult = await apiCall("post", "/nft/mint", {
      nftTypeId: testNFTTypeId,
    });

    if (!mintResult.success) {
      console.log("❌ Failed:", mintResult.error);
    } else {
      console.log("✅ NFT minted successfully!");
      console.log(`   Message: ${mintResult.data.message}`);
      console.log(`   Points spent: ${mintResult.data.pointsSpent}`);
      console.log(`   Remaining points: ${mintResult.data.remainingPoints}`);
      testMintId = mintResult.data.nft.id;
    }
  } else {
    console.log("\n⏭️  Test 5: Skipped (user cannot afford)");
  }

  // Test 6: Get user's NFT collection
  console.log("\n📝 Test 6: Get user's NFT collection");
  const collectionResult = await apiCall("get", "/nft/my-collection");

  if (!collectionResult.success) {
    console.log("❌ Failed:", collectionResult.error);
  } else {
    console.log("✅ Collection retrieved");
    console.log(`   Total NFTs: ${collectionResult.data.count}`);
    collectionResult.data.collection.forEach((nft) => {
      console.log(`   - ${nft.name}`);
      console.log(`     Tier: ${nft.tier} | Rarity: ${nft.rarity}`);
      console.log(`     Discount: ${nft.discount_percentage}%`);
      console.log(`     Monthly bonus: ${nft.monthly_bonus_points} pts`);
      console.log(`     Can claim: ${nft.can_claim_monthly ? "Yes" : "No"}`);
      console.log(
        `     Minted: ${new Date(nft.minted_at).toLocaleDateString()}`
      );
    });
  }

  // Test 7: Get active benefits
  console.log("\n📝 Test 7: Get active NFT benefits");
  const benefitsResult = await apiCall("get", "/nft/benefits");

  if (!benefitsResult.success) {
    console.log("❌ Failed:", benefitsResult.error);
  } else {
    console.log("✅ Benefits retrieved");
    console.log(`   Active NFTs: ${benefitsResult.data.benefits_count}`);
    console.log(`   Total discount: ${benefitsResult.data.total_discount}%`);
    console.log(
      `   Total monthly bonus: ${benefitsResult.data.total_monthly_bonus} pts`
    );
    benefitsResult.data.active_nfts.forEach((nft) => {
      console.log(
        `   - ${nft.name}: ${nft.discount_percentage}% discount, ${nft.monthly_bonus_points} pts/month`
      );
    });
  }

  // Test 8: Get user's discount
  console.log("\n📝 Test 8: Get user's discount percentage");
  const discountResult = await apiCall("get", "/nft/discount");

  if (!discountResult.success) {
    console.log("❌ Failed:", discountResult.error);
  } else {
    console.log("✅ Discount calculated");
    console.log(`   Discount: ${discountResult.data.discount_percentage}%`);
    console.log(`   Has discount: ${discountResult.data.has_discount}`);
  }

  // Test 9: Claim monthly bonus (if available)
  if (collectionResult.success && collectionResult.data.collection.length > 0) {
    const claimableNFT = collectionResult.data.collection.find(
      (nft) => nft.can_claim_monthly
    );

    if (claimableNFT) {
      console.log("\n📝 Test 9: Claim monthly bonus");
      const claimResult = await apiCall("post", "/nft/claim-monthly-bonus", {
        nftMintId: claimableNFT.id,
      });

      if (!claimResult.success) {
        console.log("❌ Failed:", claimResult.error);
      } else {
        console.log("✅ Monthly bonus claimed!");
        console.log(`   Points awarded: ${claimResult.data.points_awarded}`);
        console.log(`   New balance: ${claimResult.data.new_balance}`);
        console.log(
          `   Next claim: ${new Date(
            claimResult.data.next_claim_date
          ).toLocaleDateString()}`
        );
      }
    } else {
      console.log("\n⏭️  Test 9: Skipped (no claimable bonuses)");
    }
  } else {
    console.log("\n⏭️  Test 9: Skipped (no NFTs in collection)");
  }

  // Test 10: Filter NFT types
  console.log("\n📝 Test 10: Filter NFT types by animal");
  const filterResult = await apiCall(
    "get",
    "/nft/types?animalType=rabbit&availableOnly=true",
    null,
    false
  );

  if (!filterResult.success) {
    console.log("❌ Failed:", filterResult.error);
  } else {
    console.log("✅ Filtered NFTs retrieved");
    console.log(`   Found: ${filterResult.data.count} rabbit NFTs`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 NFT API Test Suite Complete!\n");
}

// Run the tests
runTests().catch((error) => {
  console.error("💥 Test suite error:", error);
  process.exit(1);
});
