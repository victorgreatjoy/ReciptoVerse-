/**
 * Update NFT Types with IPFS Image URLs
 * Run this script to update production database with correct IPFS image URLs
 *
 * Usage: node update-nft-images.js
 */

const { query } = require("./src/database");

async function updateNFTImages() {
  try {
    console.log("🔧 Updating NFT images with IPFS URLs...\n");

    // Update Bronze Rabbit NFT
    console.log("📝 Updating Bronze Rabbit NFT...");
    await query(
      `
      UPDATE nft_types 
      SET 
        image_url = $1,
        image_ipfs_hash = $2
      WHERE animal_type = $3 AND tier = $4
    `,
      [
        "https://ipfs.io/ipfs/QmVLArcnX2ADR7KqAdkhzSfxuahRixJCU6LSghXPM4i72z",
        "QmVLArcnX2ADR7KqAdkhzSfxuahRixJCU6LSghXPM4i72z",
        "rabbit",
        1,
      ]
    );
    console.log("✅ Bronze Rabbit NFT updated");

    // Update Silver Fox NFT
    console.log("📝 Updating Silver Fox NFT...");
    await query(
      `
      UPDATE nft_types 
      SET 
        image_url = $1,
        image_ipfs_hash = $2
      WHERE animal_type = $3 AND tier = $4
    `,
      [
        "https://ipfs.io/ipfs/QmcLmQZzGjrA8jWjMNiMyLzCfTmedR5ujA15cLLLqacd9k",
        "QmcLmQZzGjrA8jWjMNiMyLzCfTmedR5ujA15cLLLqacd9k",
        "fox",
        2,
      ]
    );
    console.log("✅ Silver Fox NFT updated");

    // Update Gold Eagle NFT
    console.log("📝 Updating Gold Eagle NFT...");
    await query(
      `
      UPDATE nft_types 
      SET 
        image_url = $1,
        image_ipfs_hash = $2
      WHERE animal_type = $3 AND tier = $4
    `,
      [
        "https://ipfs.io/ipfs/QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP",
        "QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP",
        "eagle",
        3,
      ]
    );
    console.log("✅ Gold Eagle NFT updated");

    // Verify the updates
    console.log("\n📊 Verifying updates...");
    const result = await query(`
      SELECT id, name, animal_type, tier, image_url, image_ipfs_hash 
      FROM nft_types 
      ORDER BY tier
    `);

    console.log("\n✅ Current NFT Types:");
    result.rows.forEach((nft) => {
      console.log(`\n${nft.name} (Tier ${nft.tier})`);
      console.log(`  Animal: ${nft.animal_type}`);
      console.log(`  Image URL: ${nft.image_url}`);
      console.log(`  IPFS Hash: ${nft.image_ipfs_hash}`);
    });

    console.log("\n🎉 All NFT images updated successfully!");
    console.log("\n📝 Next steps:");
    console.log("  1. Push changes to production: git push");
    console.log("  2. Images should now load from IPFS");
    console.log("  3. Clear browser cache if needed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating NFT images:", error);
    process.exit(1);
  }
}

// Run the update
updateNFTImages();
