const { Pool } = require("pg");

// Migration script to add user_id column to merchants table
async function migrateUserIdColumn() {
  console.log(
    "🔄 Starting migration: Adding user_id column to merchants table"
  );

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND column_name = 'user_id'
    `;

    const columnExists = await pool.query(checkColumnQuery);

    if (columnExists.rows.length > 0) {
      console.log("✅ user_id column already exists in merchants table");
      await pool.end();
      return;
    }

    // Add the column
    console.log("📝 Adding user_id column to merchants table...");
    await pool.query(
      "ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id)"
    );
    console.log("✅ Successfully added user_id column to merchants table");

    // Create index for better performance
    console.log("📝 Creating index on user_id column...");
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id)"
    );
    console.log("✅ Successfully created index on user_id column");

    await pool.end();
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
}

// Run migration
migrateUserIdColumn();
