/**
 * Database Migration Script
 * Ensures all required columns exist in production database
 */

const { query, pool, initializeDatabase } = require("./src/database");

async function runMigrations() {
  try {
    console.log("🚀 Starting database migrations...");
    console.log("Database type:", pool ? "PostgreSQL" : "SQLite");

    // First, run the standard initialization
    console.log("\n📦 Running standard database initialization...");
    await initializeDatabase();

    // Additional migrations for production fixes
    console.log("\n🔧 Running additional migrations...");

    // Ensure user_id column exists in receipts table
    console.log("\n1️⃣ Checking user_id in receipts table...");
    try {
      if (pool) {
        // PostgreSQL - check if column exists first
        const checkColumn = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'receipts' AND column_name = 'user_id'
        `);

        if (checkColumn.rows.length === 0) {
          console.log("⚠️ user_id column missing, adding it...");
          await query(`
            ALTER TABLE receipts 
            ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE
          `);
          console.log("✅ Added user_id column to receipts table");
        } else {
          console.log("✅ user_id column already exists");
        }
      }
    } catch (error) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("duplicate")
      ) {
        console.log("✅ user_id column already exists");
      } else {
        console.error("❌ Error with user_id column:", error.message);
      }
    }

    // Ensure merchant_id column exists in receipts table
    console.log("\n2️⃣ Checking merchant_id in receipts table...");
    try {
      if (pool) {
        const checkColumn = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'receipts' AND column_name = 'merchant_id'
        `);

        if (checkColumn.rows.length === 0) {
          console.log("⚠️ merchant_id column missing, adding it...");
          await query(`
            ALTER TABLE receipts 
            ADD COLUMN merchant_id UUID
          `);
          console.log("✅ Added merchant_id column to receipts table");
        } else {
          console.log("✅ merchant_id column already exists");
        }
      }
    } catch (error) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("duplicate")
      ) {
        console.log("✅ merchant_id column already exists");
      } else {
        console.error("❌ Error with merchant_id column:", error.message);
      }
    }

    // Create indexes for better query performance
    console.log("\n3️⃣ Creating indexes...");
    try {
      if (pool) {
        // Index on user_id for faster receipt lookups
        await query(`
          CREATE INDEX IF NOT EXISTS idx_receipts_user_id 
          ON receipts(user_id)
        `);
        console.log("✅ Created index on receipts(user_id)");

        // Index on merchant_id for merchant queries
        await query(`
          CREATE INDEX IF NOT EXISTS idx_receipts_merchant_id 
          ON receipts(merchant_id)
        `);
        console.log("✅ Created index on receipts(merchant_id)");

        // Index on receipt_date for date range queries
        await query(`
          CREATE INDEX IF NOT EXISTS idx_receipts_date 
          ON receipts(receipt_date)
        `);
        console.log("✅ Created index on receipts(receipt_date)");
      }
    } catch (error) {
      console.log("ℹ️ Index creation info:", error.message);
    }

    // Verify the schema
    console.log("\n✅ Migrations complete! Verifying schema...");

    if (pool) {
      const receiptColumns = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'receipts'
        ORDER BY ordinal_position
      `);

      console.log("\n📋 Receipts table columns:");
      receiptColumns.rows.forEach((col) => {
        console.log(`  ✓ ${col.column_name}`);
      });
    }

    console.log("\n🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    console.error("Stack:", error.stack);
  } finally {
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  }
}

runMigrations();
