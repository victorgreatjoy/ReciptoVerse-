// Quick diagnostic script to check user's HTS setup
const { query } = require("./src/database");

async function checkUserHTS() {
  try {
    console.log("🔍 Checking user HTS configuration...\n");

    // Get your user data
    const userId = "b2f41ec5de863c3892b000d3950a4d11"; // Your user ID from the error

    const result = await query(
      `SELECT 
        id, 
        email, 
        handle,
        points_balance,
        hedera_account_id,
        hts_account_id,
        hts_token_associated,
        hts_balance
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];
      console.log("👤 User Details:");
      console.log("   Email:", user.email);
      console.log("   Handle:", user.handle);
      console.log("   Database Points:", user.points_balance);
      console.log("   Hedera Account:", user.hedera_account_id);
      console.log("   HTS Account:", user.hts_account_id);
      console.log("   HTS Associated:", user.hts_token_associated);
      console.log("   HTS Balance:", user.hts_balance);
      console.log("");

      // Check recent points transactions
      const transactions = await query(
        `SELECT * FROM points_transactions 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [userId]
      );

      console.log("💳 Recent Points Transactions:");
      if (transactions.rows && transactions.rows.length > 0) {
        transactions.rows.forEach((tx, index) => {
          console.log(`\n   Transaction ${index + 1}:`);
          console.log("   Amount:", tx.amount);
          console.log("   Type:", tx.transaction_type);
          console.log("   Status:", tx.status);
          console.log("   Purchase Amount:", tx.purchase_amount);
          console.log("   HTS Synced:", tx.hts_synced);
          console.log("   HTS TX ID:", tx.hts_tx_id);
          console.log("   Created:", tx.created_at);
        });
      } else {
        console.log("   No transactions found");
      }

      console.log("\n");

      // Recommendations
      if (!user.hts_account_id) {
        console.log(
          "⚠️  hts_account_id is NULL - user needs to associate RVP token"
        );
      } else if (!user.hts_token_associated) {
        console.log(
          "⚠️  hts_token_associated is FALSE - association didn't complete"
        );
      } else {
        console.log("✅ User is properly set up for HTS token minting");
        console.log(
          "   Points should be automatically minted on-chain when earned"
        );
      }
    } else {
      console.log("❌ User not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUserHTS();
