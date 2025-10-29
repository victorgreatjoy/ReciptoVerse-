// Fix user's HTS account ID
const { query } = require("./src/database");

async function fixUserHTS() {
  try {
    const userId = "b2f41ec5de863c3892b000d3950a4d11";

    console.log("🔧 Fixing HTS account for user...\n");

    // Copy hedera_account_id to hts_account_id and set associated to true
    await query(
      `UPDATE users 
       SET hts_account_id = hedera_account_id,
           hts_token_associated = 1
       WHERE id = ?`,
      [userId]
    );

    console.log("✅ Updated user's HTS account");

    // Verify
    const result = await query(
      `SELECT email, hedera_account_id, hts_account_id, hts_token_associated 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];
      console.log("\n👤 Updated User:");
      console.log("   Email:", user.email);
      console.log("   Hedera Account:", user.hedera_account_id);
      console.log("   HTS Account:", user.hts_account_id);
      console.log("   HTS Associated:", user.hts_token_associated);
    }

    console.log(
      "\n✅ Done! You should now receive on-chain RVP tokens when earning points."
    );
    console.log("💡 Make a new purchase to test the on-chain minting!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixUserHTS();
