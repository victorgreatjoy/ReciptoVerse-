const { Pool } = require("pg");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database configuration - automatically choose SQLite for local development
const isProduction = process.env.NODE_ENV === "production";
const hasPostgreSQL =
  process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;

let db;
let pool;

if (isProduction || hasPostgreSQL) {
  // Use PostgreSQL for production or when DATABASE_URL is provided
  console.log("🐘 Using PostgreSQL database");
  pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });
} else {
  // Use SQLite for local development
  console.log("📁 Using SQLite database for local development");
  const dbPath = path.join(__dirname, "../../data/ReceiptoVerse.db");

  // Ensure data directory exists
  const fs = require("fs");
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("❌ SQLite connection error:", err);
    } else {
      console.log("✅ Connected to SQLite database");
    }
  });
}

// Database abstraction layer
const query = async (sql, params = []) => {
  if (pool) {
    // PostgreSQL - convert ? to $1, $2, etc.
    let pgSQL = sql;
    let pgParams = params;

    if (sql.includes("?")) {
      let paramIndex = 1;
      pgSQL = sql.replace(/\?/g, () => `$${paramIndex++}`);
    }

    const result = await pool.query(pgSQL, pgParams);
    return { rows: result.rows };
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      if (
        sql.toLowerCase().includes("select") ||
        sql.toLowerCase().includes("returning")
      ) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows: rows || [] });
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else
            resolve({ rows: [], changes: this.changes, lastID: this.lastID });
        });
      }
    });
  }
};

// Test database connection
if (pool) {
  pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL database");
  });

  pool.on("error", (err) => {
    console.error("❌ Database connection error:", err);
  });
}

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log("🔧 Initializing database tables...");

    // Users table with enhanced profile fields
    const usersTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        handle VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100),
        avatar_url VARCHAR(500),
        bio TEXT,
        receipt_count INTEGER DEFAULT 0,
        nft_count INTEGER DEFAULT 0,
        recv_balance DECIMAL(18,8) DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        notification_preferences JSONB DEFAULT '{}',
        privacy_settings JSONB DEFAULT '{}',
        qr_code TEXT,
        barcode_data TEXT,
        display_qr BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP DEFAULT NOW(),
        email_verified BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(6),
        verification_code_expires TIMESTAMP,
        verification_attempts INTEGER DEFAULT 0,
        account_status VARCHAR(20) DEFAULT 'active',
        is_admin BOOLEAN DEFAULT FALSE,
        admin_status VARCHAR(20) DEFAULT 'none',
        admin_requested_at TIMESTAMP,
        admin_approved_at TIMESTAMP,
        admin_approved_by VARCHAR(255)
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        handle TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        receipt_count INTEGER DEFAULT 0,
        nft_count INTEGER DEFAULT 0,
        recv_balance REAL DEFAULT 0,
        total_spent REAL DEFAULT 0,
        notification_preferences TEXT DEFAULT '{}',
        qr_code TEXT,
        barcode_data TEXT,
        display_qr INTEGER DEFAULT 1,
        privacy_settings TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        email_verified BOOLEAN DEFAULT FALSE,
        verification_code TEXT,
        verification_code_expires DATETIME,
        verification_attempts INTEGER DEFAULT 0,
        account_status TEXT DEFAULT 'active',
        is_admin INTEGER DEFAULT 0,
        admin_status TEXT DEFAULT 'none',
        admin_requested_at DATETIME,
        admin_approved_at DATETIME,
        admin_approved_by TEXT
      )
    `;

    await query(usersTableSQL);

    // Add hedera_account_id column if it doesn't exist
    try {
      if (pool) {
        // PostgreSQL
        await query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS hedera_account_id VARCHAR(50)
        `);
      } else {
        // SQLite - check if column exists first
        const tableInfo = await query("PRAGMA table_info(users)");
        const hasColumn = tableInfo.rows.some(
          (col) => col.name === "hedera_account_id"
        );
        if (!hasColumn) {
          await query(`ALTER TABLE users ADD COLUMN hedera_account_id TEXT`);
        }
      }
      console.log("✅ hedera_account_id column added/verified");
    } catch (error) {
      console.log(
        "ℹ️  hedera_account_id column may already exist:",
        error.message
      );
    }

    // Receipts table with categories
    const receiptsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        store_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        receipt_date DATE NOT NULL,
        category VARCHAR(50) DEFAULT 'other',
        items JSONB DEFAULT '[]',
        merchant_id UUID,
        barcode_data TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        nft_token_id VARCHAR(100),
        nft_serial INTEGER,
        nft_created BOOLEAN DEFAULT FALSE,
        nft_metadata_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS receipts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        store_name TEXT NOT NULL,
        amount REAL NOT NULL,
        receipt_date DATE NOT NULL,
        category TEXT DEFAULT 'other',
        items TEXT DEFAULT '[]',
        merchant_id TEXT,
        barcode_data TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        nft_token_id TEXT,
        nft_serial INTEGER,
        nft_created BOOLEAN DEFAULT FALSE,
        nft_metadata_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(receiptsTableSQL);

    // Merchants table for business registration
    const merchantsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        country VARCHAR(50) DEFAULT 'US',
        tax_id VARCHAR(50),
        website_url VARCHAR(500),
        contact_person VARCHAR(255),
        api_key VARCHAR(255) UNIQUE,
        terminal_id VARCHAR(50) UNIQUE,
        status VARCHAR(20) DEFAULT 'pending',
        approved_by UUID,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        subscription_plan VARCHAR(50) DEFAULT 'basic',
        monthly_fee DECIMAL(10,2) DEFAULT 0,
        transaction_fee_percent DECIMAL(5,4) DEFAULT 0.0250,
        receipt_limit INTEGER DEFAULT 1000,
        receipts_processed INTEGER DEFAULT 0,
        last_activity TIMESTAMP,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS merchants (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        business_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'US',
        tax_id TEXT,
        website_url TEXT,
        contact_person TEXT,
        api_key TEXT UNIQUE,
        terminal_id TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        approved_by TEXT,
        approved_at DATETIME,
        rejection_reason TEXT,
        subscription_plan TEXT DEFAULT 'basic',
        monthly_fee REAL DEFAULT 0,
        transaction_fee_percent REAL DEFAULT 0.0250,
        receipt_limit INTEGER DEFAULT 1000,
        receipts_processed INTEGER DEFAULT 0,
        last_activity DATETIME,
        settings TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(merchantsTableSQL);

    // Points Transactions table - tracks all point awards
    const pointsTransactionsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS points_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
        receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
        amount INTEGER NOT NULL,
        purchase_amount DECIMAL(10,2),
        transaction_type VARCHAR(50) DEFAULT 'purchase',
        status VARCHAR(20) DEFAULT 'confirmed',
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS points_transactions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        merchant_id TEXT REFERENCES merchants(id) ON DELETE SET NULL,
        receipt_id TEXT REFERENCES receipts(id) ON DELETE SET NULL,
        amount INTEGER NOT NULL,
        purchase_amount REAL,
        transaction_type TEXT DEFAULT 'purchase',
        status TEXT DEFAULT 'confirmed',
        description TEXT,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(pointsTransactionsTableSQL);

    // Token Mint Requests table - tracks token minting
    const tokenMintRequestsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS token_mint_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        points_spent INTEGER NOT NULL,
        tokens_requested DECIMAL(18,8) NOT NULL,
        tokens_received DECIMAL(18,8),
        conversion_rate DECIMAL(10,4) NOT NULL,
        wallet_address VARCHAR(255),
        transaction_hash VARCHAR(255),
        hedera_transaction_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS token_mint_requests (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        points_spent INTEGER NOT NULL,
        tokens_requested REAL NOT NULL,
        tokens_received REAL,
        conversion_rate REAL NOT NULL,
        wallet_address TEXT,
        transaction_hash TEXT,
        hedera_transaction_id TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `;

    await query(tokenMintRequestsTableSQL);

    // Merchant Rewards Tracking table
    const merchantRewardsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS merchant_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        total_points_distributed INTEGER DEFAULT 0,
        total_transactions INTEGER DEFAULT 0,
        reward_rate DECIMAL(5,4) DEFAULT 1.0000,
        is_active BOOLEAN DEFAULT TRUE,
        last_award_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS merchant_rewards (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
        total_points_distributed INTEGER DEFAULT 0,
        total_transactions INTEGER DEFAULT 0,
        reward_rate REAL DEFAULT 1.0,
        is_active INTEGER DEFAULT 1,
        last_award_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(merchantRewardsTableSQL);

    // NFT Types Table - Merchant-created NFT templates
    const nftTypesTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS nft_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        animal_type VARCHAR(50) NOT NULL,
        tier INTEGER DEFAULT 1,
        point_cost INTEGER NOT NULL,
        rarity VARCHAR(50) DEFAULT 'common',
        image_url TEXT NOT NULL,
        image_ipfs_hash TEXT,
        benefits JSONB DEFAULT '[]',
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        monthly_bonus_points INTEGER DEFAULT 0,
        max_supply INTEGER DEFAULT -1,
        current_supply INTEGER DEFAULT 0,
        metadata_template JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS nft_types (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        animal_type TEXT NOT NULL,
        tier INTEGER DEFAULT 1,
        point_cost INTEGER NOT NULL,
        rarity TEXT DEFAULT 'common',
        image_url TEXT NOT NULL,
        image_ipfs_hash TEXT,
        benefits TEXT DEFAULT '[]',
        discount_percentage REAL DEFAULT 0,
        monthly_bonus_points INTEGER DEFAULT 0,
        max_supply INTEGER DEFAULT -1,
        current_supply INTEGER DEFAULT 0,
        metadata_template TEXT DEFAULT '{}',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(nftTypesTableSQL);

    // User NFT Mints Table - Track minted NFTs
    const userNftMintsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS user_nft_mints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        nft_type_id UUID REFERENCES nft_types(id) ON DELETE CASCADE,
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        nft_token_id VARCHAR(100),
        serial_number INTEGER,
        points_spent INTEGER NOT NULL,
        metadata_url TEXT,
        benefits_active BOOLEAN DEFAULT TRUE,
        benefits_expiry TIMESTAMP,
        last_benefit_claim TIMESTAMP,
        minted_at TIMESTAMP DEFAULT NOW(),
        transferred_at TIMESTAMP,
        transferred_to UUID
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS user_nft_mints (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        nft_type_id TEXT REFERENCES nft_types(id) ON DELETE CASCADE,
        merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
        nft_token_id TEXT,
        serial_number INTEGER,
        points_spent INTEGER NOT NULL,
        metadata_url TEXT,
        benefits_active INTEGER DEFAULT 1,
        benefits_expiry DATETIME,
        last_benefit_claim DATETIME,
        minted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        transferred_at DATETIME,
        transferred_to TEXT
      )
    `;

    await query(userNftMintsTableSQL);

    // NFT Benefits Redemptions Table - Track benefit usage
    const nftBenefitRedemptionsTableSQL = pool
      ? `
      CREATE TABLE IF NOT EXISTS nft_benefit_redemptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        nft_mint_id UUID REFERENCES user_nft_mints(id) ON DELETE CASCADE,
        benefit_type VARCHAR(50) NOT NULL,
        benefit_value VARCHAR(255),
        receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
        points_awarded INTEGER DEFAULT 0,
        discount_applied DECIMAL(10,2) DEFAULT 0,
        redeemed_at TIMESTAMP DEFAULT NOW()
      )
    `
      : `
      CREATE TABLE IF NOT EXISTS nft_benefit_redemptions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        nft_mint_id TEXT REFERENCES user_nft_mints(id) ON DELETE CASCADE,
        benefit_type TEXT NOT NULL,
        benefit_value TEXT,
        receipt_id TEXT REFERENCES receipts(id) ON DELETE SET NULL,
        points_awarded INTEGER DEFAULT 0,
        discount_applied REAL DEFAULT 0,
        redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(nftBenefitRedemptionsTableSQL);

    // Seed initial NFT types (3 animals with different tiers)
    await seedInitialNFTTypes();

    // Create indexes for better performance
    if (pool) {
      // PostgreSQL indexes
      await query(
        "CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle)"
      );
      await query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
      await query(
        "CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchants_terminal_id ON merchants(terminal_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_points_transactions_status ON points_transactions(status)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_token_mint_requests_user_id ON token_mint_requests(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_token_mint_requests_status ON token_mint_requests(status)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchant_rewards_merchant_id ON merchant_rewards(merchant_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_types_merchant_id ON nft_types(merchant_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_types_animal_type ON nft_types(animal_type)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_types_is_active ON nft_types(is_active)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_user_nft_mints_user_id ON user_nft_mints(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_user_nft_mints_nft_type_id ON user_nft_mints(nft_type_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_user_nft_mints_merchant_id ON user_nft_mints(merchant_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_benefit_redemptions_user_id ON nft_benefit_redemptions(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_benefit_redemptions_nft_mint_id ON nft_benefit_redemptions(nft_mint_id)"
      );
    } else {
      // SQLite indexes
      await query(
        "CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle)"
      );
      await query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
      await query(
        "CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchants_terminal_id ON merchants(terminal_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_points_transactions_status ON points_transactions(status)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_token_mint_requests_user_id ON token_mint_requests(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_token_mint_requests_status ON token_mint_requests(status)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_merchant_rewards_merchant_id ON merchant_rewards(merchant_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_types_merchant_id ON nft_types(merchant_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_types_animal_type ON nft_types(animal_type)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_types_is_active ON nft_types(is_active)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_user_nft_mints_user_id ON user_nft_mints(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_user_nft_mints_nft_type_id ON user_nft_mints(nft_type_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_user_nft_mints_merchant_id ON user_nft_mints(merchant_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_benefit_redemptions_user_id ON nft_benefit_redemptions(user_id)"
      );
      await query(
        "CREATE INDEX IF NOT EXISTS idx_nft_benefit_redemptions_nft_mint_id ON nft_benefit_redemptions(nft_mint_id)"
      );
    }

    // Add points-related columns to users table
    console.log("🔄 Adding points system columns to users table...");

    try {
      await query(
        "ALTER TABLE users ADD COLUMN points_balance INTEGER DEFAULT 0"
      );
      console.log("✅ Added points_balance column");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ points_balance column already exists");
      } else {
        console.error("❌ Error adding points_balance column:", error.message);
      }
    }

    try {
      await query(
        "ALTER TABLE users ADD COLUMN total_points_earned INTEGER DEFAULT 0"
      );
      console.log("✅ Added total_points_earned column");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ total_points_earned column already exists");
      } else {
        console.error(
          "❌ Error adding total_points_earned column:",
          error.message
        );
      }
    }

    try {
      const decimalType = pool ? "DECIMAL(18,8)" : "REAL";
      await query(
        `ALTER TABLE users ADD COLUMN total_tokens_minted ${decimalType} DEFAULT 0`
      );
      console.log("✅ Added total_tokens_minted column");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ total_tokens_minted column already exists");
      } else {
        console.error(
          "❌ Error adding total_tokens_minted column:",
          error.message
        );
      }
    }

    try {
      await query(
        "ALTER TABLE users ADD COLUMN loyalty_tier TEXT DEFAULT 'bronze'"
      );
      console.log("✅ Added loyalty_tier column");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ loyalty_tier column already exists");
      } else {
        console.error("❌ Error adding loyalty_tier column:", error.message);
      }
    }

    try {
      const timestampType = pool ? "TIMESTAMP" : "DATETIME";
      await query(
        `ALTER TABLE users ADD COLUMN last_purchase_date ${timestampType}`
      );
      console.log("✅ Added last_purchase_date column");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ last_purchase_date column already exists");
      } else {
        console.error(
          "❌ Error adding last_purchase_date column:",
          error.message
        );
      }
    }

    // Add email verification columns to existing users table if they don't exist
    console.log("🔄 Checking for email verification columns...");

    try {
      await query("ALTER TABLE users ADD COLUMN verification_code TEXT");
      console.log("✅ Added verification_code column to users table");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ verification_code column already exists");
      } else {
        console.error(
          "❌ Error adding verification_code column:",
          error.message
        );
      }
    }

    try {
      const timestampType = pool ? "TIMESTAMP" : "DATETIME";
      await query(
        `ALTER TABLE users ADD COLUMN verification_code_expires ${timestampType}`
      );
      console.log("✅ Added verification_code_expires column to users table");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ verification_code_expires column already exists");
      } else {
        console.error(
          "❌ Error adding verification_code_expires column:",
          error.message
        );
      }
    }

    try {
      await query(
        "ALTER TABLE users ADD COLUMN verification_attempts INTEGER DEFAULT 0"
      );
      console.log("✅ Added verification_attempts column to users table");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ verification_attempts column already exists");
      } else {
        console.error(
          "❌ Error adding verification_attempts column:",
          error.message
        );
      }
    }

    // Add user_id column to merchants table for linking merchants to users
    console.log("🔄 Checking for user_id column in merchants table...");
    try {
      await query(
        pool
          ? "ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id)"
          : "ALTER TABLE merchants ADD COLUMN user_id TEXT REFERENCES users(id)"
      );
      console.log("✅ Added user_id column to merchants table");
    } catch (error) {
      if (
        error.message.includes("duplicate column name") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️ user_id column already exists in merchants table");
      } else {
        console.error(
          "❌ Error adding user_id column to merchants:",
          error.message
        );
      }
    }

    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

/**
 * Seed initial NFT types - 3 animals with different tiers
 * This creates default NFT templates that can be used by merchants
 */
async function seedInitialNFTTypes() {
  try {
    console.log("🌱 Seeding initial NFT types...");

    // Check if we already have NFT types
    const existingTypes = await query(
      "SELECT COUNT(*) as count FROM nft_types"
    );

    // The database wrapper returns { rows: [...] } for both PostgreSQL and SQLite
    const count = parseInt(existingTypes.rows[0].count) || 0;

    if (count > 0) {
      console.log(
        `ℹ️ NFT types already seeded (${count} types found), skipping...`
      );
      return;
    }

    // Default NFT types - 3 animals with different characteristics
    const nftTypes = [
      {
        name: "Bronze Rabbit NFT",
        description:
          "A cute bronze rabbit that brings luck and small rewards. Perfect for beginners on their ReceiptoVerse journey!",
        animal_type: "rabbit",
        tier: 1,
        point_cost: 500,
        rarity: "common",
        image_url: "https://ipfs.io/ipfs/QmVLArcnX2ADR7KqAdkhzSfxuahRixJCU6LSghXPM4i72z",
        image_ipfs_hash: "QmVLArcnX2ADR7KqAdkhzSfxuahRixJCU6LSghXPM4i72z",
        benefits: JSON.stringify([
          "5% discount on purchases",
          "50 bonus points on first use",
          "Access to Bronze tier events",
        ]),
        discount_percentage: 5.0,
        monthly_bonus_points: 50,
        max_supply: -1, // unlimited
        metadata_template: JSON.stringify({
          category: "Starter",
          speed: 3,
          luck: 5,
          power: 2,
        }),
      },
      {
        name: "Silver Fox NFT",
        description:
          "A clever silver fox with enhanced rewards and exclusive perks. For savvy shoppers who want more!",
        animal_type: "fox",
        tier: 2,
        point_cost: 1500,
        rarity: "rare",
        image_url: "https://ipfs.io/ipfs/QmcLmQZzGjrA8jWjMNiMyLzCfTmedR5ujA15cLLLqacd9k",
        image_ipfs_hash: "QmcLmQZzGjrA8jWjMNiMyLzCfTmedR5ujA15cLLLqacd9k",
        benefits: JSON.stringify([
          "10% discount on purchases",
          "150 bonus points monthly",
          "Priority customer support",
          "Access to Silver tier events",
          "Free shipping once per month",
        ]),
        discount_percentage: 10.0,
        monthly_bonus_points: 150,
        max_supply: 1000,
        metadata_template: JSON.stringify({
          category: "Advanced",
          speed: 7,
          luck: 7,
          power: 6,
          cunning: 8,
        }),
      },
      {
        name: "Gold Eagle NFT",
        description:
          "A majestic gold eagle soaring above the rest. Premium benefits for true ReceiptoVerse champions!",
        animal_type: "eagle",
        tier: 3,
        point_cost: 3000,
        rarity: "epic",
        image_url: "https://ipfs.io/ipfs/QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP",
        image_ipfs_hash: "QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP",
        benefits: JSON.stringify([
          "20% discount on all purchases",
          "500 bonus points monthly",
          "VIP customer support",
          "Access to exclusive Gold events",
          "Free shipping unlimited",
          "Early access to new features",
          "Double points on purchases",
        ]),
        discount_percentage: 20.0,
        monthly_bonus_points: 500,
        max_supply: 100,
        metadata_template: JSON.stringify({
          category: "Elite",
          speed: 10,
          luck: 9,
          power: 10,
          cunning: 8,
          prestige: 10,
        }),
      },
    ];

    // Insert NFT types (without merchant_id for now - they're global defaults)
    for (const nftType of nftTypes) {
      const insertSQL = pool
        ? `
          INSERT INTO nft_types (
            name, description, animal_type, tier, point_cost, rarity,
            image_url, image_ipfs_hash, benefits, discount_percentage, monthly_bonus_points,
            max_supply, metadata_template, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `
        : `
          INSERT INTO nft_types (
            name, description, animal_type, tier, point_cost, rarity,
            image_url, image_ipfs_hash, benefits, discount_percentage, monthly_bonus_points,
            max_supply, metadata_template, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

      const params = [
        nftType.name,
        nftType.description,
        nftType.animal_type,
        nftType.tier,
        nftType.point_cost,
        nftType.rarity,
        nftType.image_url,
        nftType.image_ipfs_hash,
        nftType.benefits,
        nftType.discount_percentage,
        nftType.monthly_bonus_points,
        nftType.max_supply,
        nftType.metadata_template,
        pool ? true : 1,
      ];

      await query(insertSQL, params);
      console.log(`✅ Created NFT type: ${nftType.name}`);
    }

    console.log("🎉 Initial NFT types seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding NFT types:", error);
    // Don't throw - this is not critical for app startup
  }
}

module.exports = {
  pool,
  db,
  query,
  initializeDatabase,
};
