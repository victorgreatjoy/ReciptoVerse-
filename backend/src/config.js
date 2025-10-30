const path = require("path");
require("dotenv").config();

/**
 * Smart Environment Configuration for ReceiptoVerse
 * Automatically loads the right environment based on NODE_ENV
 */
class EnvironmentConfig {
  constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.loadEnvironmentConfig();
  }

  loadEnvironmentConfig() {
    // Load specific environment file
    const envFile = `.env.${this.environment}`;
    const envPath = path.resolve(process.cwd(), envFile);

    try {
      require("dotenv").config({ path: envPath });
      console.log(`🎯 Loaded environment: ${this.environment}`);
      console.log(`📄 Config file: ${envFile}`);

      // Debug email variables after loading
      console.log(`🔍 Email vars after config load:`);
      console.log(
        `   EMAIL_HOST: ${process.env.EMAIL_HOST ? "SET" : "NOT SET"}`
      );
      console.log(
        `   EMAIL_USER: ${process.env.EMAIL_USER ? "SET" : "NOT SET"}`
      );
      console.log(
        `   EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`
      );
    } catch (error) {
      console.log(`⚠️  Could not load ${envFile}, using default .env`);
      console.log(`🔍 Email vars after fallback:`);
      console.log(
        `   EMAIL_HOST: ${process.env.EMAIL_HOST ? "SET" : "NOT SET"}`
      );
      console.log(
        `   EMAIL_USER: ${process.env.EMAIL_USER ? "SET" : "NOT SET"}`
      );
      console.log(
        `   EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`
      );
    }
  }

  // Database Configuration
  get database() {
    return {
      url: process.env.DATABASE_URL,
      isProduction: this.environment === "production",
      isDevelopment: this.environment === "development",
      // Auto-detect database type
      type: process.env.DATABASE_URL ? "postgresql" : "sqlite",
    };
  }

  // Hedera Configuration
  get hedera() {
    return {
      network: process.env.HEDERA_NETWORK || "testnet",
      operatorId: process.env.OPERATOR_ID,
      operatorKey: process.env.OPERATOR_KEY,
      recvTokenId: process.env.HTS_POINTS_TOKEN_ID || process.env.RECV_TOKEN_ID, // Use HTS_POINTS_TOKEN_ID (new RVP token)
      rnftTokenId: process.env.RNFT_TOKEN_ID,
      isMainnet: process.env.HEDERA_NETWORK === "mainnet",
      isTestnet: process.env.HEDERA_NETWORK === "testnet",
    };
  }

  // Server Configuration
  get server() {
    return {
      port: process.env.PORT || 3000,
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
      jwtSecret: process.env.JWT_SECRET || "dev_secret",
      environment: this.environment,
    };
  }

  // IPFS Configuration
  get ipfs() {
    return {
      pinataApiKey: process.env.PINATA_API_KEY,
      pinataSecretKey: process.env.PINATA_SECRET_API_KEY,
      pinataJwt: process.env.PINATA_JWT,
    };
  }

  // Validation
  validateConfig() {
    const errors = [];

    // Check required Hedera config
    if (!this.hedera.operatorId) errors.push("OPERATOR_ID is required");
    if (!this.hedera.operatorKey) errors.push("OPERATOR_KEY is required");

    // Check production requirements
    if (this.environment === "production") {
      if (!this.database.url)
        errors.push("DATABASE_URL is required for production");
      if (this.server.jwtSecret === "dev_secret")
        errors.push("JWT_SECRET must be changed for production");
      if (this.hedera.network !== "mainnet")
        console.warn("⚠️  Using testnet in production environment");
    }

    if (errors.length > 0) {
      console.error("❌ Configuration Errors:");
      errors.forEach((error) => console.error(`   - ${error}`));
      process.exit(1);
    }

    console.log("✅ Configuration validated successfully");
    return true;
  }

  // Display current configuration (without sensitive data)
  displayConfig() {
    console.log("\n🚀 ReceiptoVerse Configuration:");
    console.log(`   Environment: ${this.environment}`);
    console.log(
      `   Database: ${this.database.type} ${
        this.database.url ? "(Connected)" : "(Local SQLite)"
      }`
    );
    console.log(`   Hedera Network: ${this.hedera.network}`);
    console.log(`   Server Port: ${this.server.port}`);
    console.log(`   Frontend URL: ${this.server.frontendUrl}`);
    console.log("");
  }
}

module.exports = new EnvironmentConfig();
