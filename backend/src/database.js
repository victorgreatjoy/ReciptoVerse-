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

module.exports = {
  pool,
  db,
  query,
  initializeDatabase,
};
