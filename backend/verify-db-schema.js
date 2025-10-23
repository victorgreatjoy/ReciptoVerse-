/**
 * Database Schema Verification Script
 * Run this to check if all required columns exist in production database
 */

const { query, pool } = require("./src/database");

async function verifySchema() {
  try {
    console.log("🔍 Verifying database schema...");
    console.log("Database type:", pool ? "PostgreSQL" : "SQLite");

    // Check receipts table columns
    console.log("\n📋 Checking receipts table...");
    if (pool) {
      // PostgreSQL
      const columns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'receipts'
        ORDER BY ordinal_position
      `);

      console.log("Receipts table columns:");
      columns.rows.forEach((col) => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });

      // Check if user_id exists
      const hasUserId = columns.rows.some(
        (col) => col.column_name === "user_id"
      );
      if (!hasUserId) {
        console.log("⚠️ user_id column missing!");
      } else {
        console.log("✅ user_id column exists");
      }

      // Check if merchant_id exists
      const hasMerchantId = columns.rows.some(
        (col) => col.column_name === "merchant_id"
      );
      if (!hasMerchantId) {
        console.log("⚠️ merchant_id column missing!");
      } else {
        console.log("✅ merchant_id column exists");
      }
    } else {
      // SQLite
      const tableInfo = await query("PRAGMA table_info(receipts)");
      console.log("Receipts table columns:");
      tableInfo.rows.forEach((col) => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    }

    // Check merchants table columns
    console.log("\n🏢 Checking merchants table...");
    if (pool) {
      const columns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'merchants'
        ORDER BY ordinal_position
      `);

      console.log("Merchants table columns:");
      columns.rows.forEach((col) => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    } else {
      const tableInfo = await query("PRAGMA table_info(merchants)");
      console.log("Merchants table columns:");
      tableInfo.rows.forEach((col) => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    }

    // Test receipt query
    console.log("\n🧪 Testing receipt query...");
    try {
      const testQuery = await query("SELECT COUNT(*) as count FROM receipts");
      console.log(`✅ Found ${testQuery.rows[0].count} receipts in database`);
    } catch (error) {
      console.error("❌ Error querying receipts:", error.message);
    }

    // Test merchant query
    console.log("\n🧪 Testing merchant query...");
    try {
      const testQuery = await query("SELECT COUNT(*) as count FROM merchants");
      console.log(`✅ Found ${testQuery.rows[0].count} merchants in database`);
    } catch (error) {
      console.error("❌ Error querying merchants:", error.message);
    }

    console.log("\n✅ Schema verification complete!");
  } catch (error) {
    console.error("❌ Schema verification error:", error);
    console.error("Stack:", error.stack);
  } finally {
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  }
}

verifySchema();
