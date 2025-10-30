/**
 * Database Migration Script
 * Ensures all required columns exist in production database
 */

const { query, pool, initializeDatabase } = require("./src/database");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  // Ensure hts_account_id column exists in receipts table
  console.log("\n🔎 Checking hts_account_id in receipts table...");
  try {
    if (pool) {
      const checkColumn = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'receipts' AND column_name = 'hts_account_id'
        `);
      if (checkColumn.rows.length === 0) {
        console.log("⚠️ hts_account_id column missing, adding it...");
        await query(`ALTER TABLE receipts ADD COLUMN hts_account_id TEXT`);
        console.log("✅ Added hts_account_id column to receipts table");
      } else {
        console.log("✅ hts_account_id column already exists");
      }
    }
  } catch (error) {
    if (
      error.message.includes("already exists") ||
      error.message.includes("duplicate")
    ) {
      console.log("✅ hts_account_id column already exists");
    } else {
      console.error("❌ Error with hts_account_id column:", error.message);
    }
  }

  // Ensure hcs_topic_id column exists in receipts table
  console.log("\n🔎 Checking hcs_topic_id in receipts table...");
  try {
    if (pool) {
      const checkColumn = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'receipts' AND column_name = 'hcs_topic_id'
        `);
      if (checkColumn.rows.length === 0) {
        console.log("⚠️ hcs_topic_id column missing, adding it...");
        await query(`ALTER TABLE receipts ADD COLUMN hcs_topic_id TEXT`);
        console.log("✅ Added hcs_topic_id column to receipts table");
      } else {
        console.log("✅ hcs_topic_id column already exists");
      }
    }
  } catch (error) {
    if (
      error.message.includes("already exists") ||
      error.message.includes("duplicate")
    ) {
      console.log("✅ hcs_topic_id column already exists");
    } else {
      console.error("❌ Error with hcs_topic_id column:", error.message);
    }
  }
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

    // Phase 1 HCS schema migration (SQL file / SQLite fallback)
    console.log(
      "\n4️⃣ Applying HCS (Hedera Consensus Service) schema updates..."
    );
    try {
      if (pool) {
        const hcsSqlPath = path.join(
          __dirname,
          "migrations",
          "001_add_hcs_fields.sql"
        );
        if (fs.existsSync(hcsSqlPath)) {
          const sql = fs.readFileSync(hcsSqlPath, "utf8");
          await query(sql);
          console.log("✅ HCS schema updates applied");
        } else {
          console.log("⚠️ HCS migration file not found at", hcsSqlPath);
        }
      } else {
        // SQLite: add missing columns to receipts table
        console.log(
          "🗂️ SQLite detected - applying HCS schema updates for SQLite..."
        );

        // Check existing columns
        const tableInfo = await query("PRAGMA table_info(receipts)");
        const hasCol = (name) => tableInfo.rows.some((c) => c.name === name);

        const addCol = async (name, type) => {
          if (!hasCol(name)) {
            await query(`ALTER TABLE receipts ADD COLUMN ${name} ${type}`);
            console.log(`✅ Added column receipts.${name}`);
          } else {
            console.log(`ℹ️ Column receipts.${name} already exists`);
          }
        };

        await addCol("hcs_topic_id", "TEXT");
        await addCol("hcs_sequence", "INTEGER");
        await addCol("hcs_timestamp", "TEXT");
        await addCol("receipt_hash", "TEXT");
        await addCol("hcs_transaction_id", "TEXT");
        await addCol("hcs_anchored_at", "DATETIME");

        // Create indexes
        await query(
          "CREATE INDEX IF NOT EXISTS idx_receipts_hcs ON receipts(hcs_topic_id, hcs_sequence)"
        );
        await query(
          "CREATE INDEX IF NOT EXISTS idx_receipts_hash ON receipts(receipt_hash)"
        );
        await query(
          "CREATE INDEX IF NOT EXISTS idx_receipts_anchored ON receipts(hcs_anchored_at)"
        );
        console.log("✅ Created HCS-related indexes on receipts");

        // Create HCS events table (SQLite)
        await query(
          `CREATE TABLE IF NOT EXISTS hcs_events (
            id TEXT PRIMARY KEY,
            topic_id TEXT NOT NULL,
            sequence_number INTEGER NOT NULL,
            consensus_timestamp TEXT NOT NULL,
            message_type TEXT,
            message_data TEXT,
            processed INTEGER DEFAULT 0,
            processed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(topic_id, sequence_number)
          )`
        );
        await query(
          "CREATE INDEX IF NOT EXISTS idx_hcs_events_topic ON hcs_events(topic_id, sequence_number)"
        );
        await query(
          "CREATE INDEX IF NOT EXISTS idx_hcs_events_processed ON hcs_events(processed, created_at)"
        );
        await query(
          "CREATE INDEX IF NOT EXISTS idx_hcs_events_type ON hcs_events(message_type)"
        );
        console.log("✅ Created/verified hcs_events table and indexes");

        // Create HCS topics table (SQLite)
        await query(
          `CREATE TABLE IF NOT EXISTS hcs_topics (
            id TEXT PRIMARY KEY,
            topic_id TEXT UNIQUE NOT NULL,
            topic_memo TEXT,
            purpose TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
          )`
        );
        await query(
          "CREATE INDEX IF NOT EXISTS idx_hcs_topics_purpose ON hcs_topics(purpose)"
        );
        console.log("✅ Created/verified hcs_topics table and index");
      }
    } catch (error) {
      console.error("❌ Error applying HCS migration:", error.message);
    }

    // 6️⃣ Migration 006: Add HTS Support
    console.log("\n6️⃣ Adding HTS support...");
    try {
      if (pool) {
        // PostgreSQL - run the HTS migration
        const htsMigrationSQL = fs.readFileSync(
          path.join(__dirname, "migrations", "006_add_hts_support_pg.sql"),
          "utf8"
        );
        await query(htsMigrationSQL);
        console.log("✅ Applied HTS migration for PostgreSQL");
      } else {
        // SQLite - run the HTS migration
        const htsMigrationSQL = fs.readFileSync(
          path.join(__dirname, "migrations", "006_add_hts_support.sql"),
          "utf8"
        );

        // Split by semicolons and execute each statement
        const statements = htsMigrationSQL
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          try {
            await query(statement);
          } catch (err) {
            // Ignore duplicate column errors
            if (
              !err.message.includes("duplicate") &&
              !err.message.includes("already exists")
            ) {
              console.log("⚠️ HTS migration statement warning:", err.message);
            }
          }
        }
        console.log("✅ Applied HTS migration for SQLite");
      }
    } catch (error) {
      console.error("❌ Error applying HTS migration:", error.message);
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
    } else {
      const receiptColumns = await query("PRAGMA table_info(receipts)");
      console.log("\n📋 Receipts table columns (SQLite):");
      receiptColumns.rows.forEach((col) => {
        console.log(`  ✓ ${col.name} (${col.type})`);
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

// Only run migrations if called directly (not when imported as a module)
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
