const express = require("express");
const bodyParser = require("body-parser");
const {
  Client,
  TokenMintTransaction,
  TransferTransaction,
  TokenAssociateTransaction,
  Hbar,
  PrivateKey,
} = require("@hashgraph/sdk");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Import smart configuration system
const config = require("./config");

// Import database and routes
const { initializeDatabase } = require("./database");
const userRoutes = require("./userRoutes");
const receiptRoutes = require("./receiptRoutes");
const merchantRoutes = require("./merchantRoutes");
const pointsRoutes = require("./pointsRoutes");
const aiSupportRoutes = require("./aiSupportRoutes");
const nftRoutes = require("./nftRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const {
  initializeBlockchainServices,
} = require("./services/blockchain/initBlockchain");
const hcsReceiptRoutes = require("./routes/hcsReceipts");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Add CORS middleware to allow frontend to connect
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Debug endpoint to check environment variables (REMOVE IN PRODUCTION)
app.get("/api/debug/env", (req, res) => {
  const emailVars = {
    EMAIL_HOST: process.env.EMAIL_HOST || "NOT SET",
    EMAIL_USER: process.env.EMAIL_USER || "NOT SET",
    EMAIL_PASS: process.env.EMAIL_PASS
      ? "***" + process.env.EMAIL_PASS.slice(-4)
      : "NOT SET",
    EMAIL_PORT: process.env.EMAIL_PORT || "NOT SET",
    EMAIL_FROM: process.env.EMAIL_FROM || "NOT SET",
    EMAIL_SECURE: process.env.EMAIL_SECURE || "NOT SET",
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
  };

  const allEmailVars = Object.keys(process.env).filter((key) =>
    key.startsWith("EMAIL_")
  );

  res.json({
    message: "Environment Variables Debug",
    emailVariables: emailVars,
    emailVarKeys: allEmailVars,
    totalEnvVars: Object.keys(process.env).length,
    timestamp: new Date().toISOString(),
  });
});

// Validate and display configuration
config.validateConfig();
config.displayConfig();

// Hedera client setup
const client = config.hedera.isMainnet
  ? Client.forMainnet()
  : Client.forTestnet();
const operatorKey = PrivateKey.fromStringECDSA(config.hedera.operatorKey);
client.setOperator(config.hedera.operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

// Configuration constants
const RECV_TOKEN_ID = config.hedera.recvTokenId;
const RNFT_TOKEN_ID = config.hedera.rnftTokenId;

// Pinata IPFS Configuration
const PINATA_API_KEY = config.ipfs.pinataApiKey;
const PINATA_SECRET_API_KEY = config.ipfs.pinataSecretKey;
const PINATA_JWT = config.ipfs.pinataJwt;

// Initialize database and user routes
async function startServer() {
  // Run migrations to ensure required columns exist
  try {
    const runMigrations = require("../run-migrations");
    if (typeof runMigrations === "function") {
      await runMigrations();
    }
  } catch (err) {
    console.error("❌ Migration script error:", err);
  }
  try {
    // Initialize database
    await initializeDatabase();

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "Phase 3 - NFT Integration",
        services: {
          database: "connected",
          websocket: "active",
          hedera: "configured",
          nft: "enabled",
        },
      });
    });

    // Add user routes
    app.use("/api/users", userRoutes);

    // Add receipt routes
    app.use("/api/receipts", receiptRoutes);

    // Initialize blockchain services (Hedera HCS/HTS)
    await initializeBlockchainServices();

    // Add HCS receipt routes (anchoring, verification, proof)
    app.use("/api/receipts", hcsReceiptRoutes);

    // Add merchant routes (both /merchant and /merchants for compatibility)
    app.use("/api/merchant", merchantRoutes);
    app.use("/api/merchants", merchantRoutes);

    // Add points routes
    app.use("/api/points", pointsRoutes);

    // Add AI support routes
    app.use("/api/ai-support", aiSupportRoutes);

    // Add NFT routes
    app.use("/api/nft", nftRoutes);

    // Add token (HTS) routes
    app.use("/api/token", tokenRoutes);

    // Add admin routes
    const { router: adminRoutes } = require("./adminRoutes");
    app.use("/api/admin", adminRoutes);

    console.log("✅ User management system initialized");
    console.log("✅ Receipt management system initialized");
    console.log("✅ Points reward system initialized");
    console.log("✅ AI Support system initialized");
    console.log("✅ NFT Rewards system initialized");
    console.log("✅ Token (HTS) API initialized");
    console.log("✅ Blockchain (Hedera) services initialized");
    console.log("✅ Merchant management system initialized");
    console.log("✅ Admin management system initialized");
  } catch (error) {
    console.error("❌ Failed to initialize user system:", error);
  }
}

// Start server initialization
startServer();

/**
 * Upload JSON data to IPFS via Pinata
 */
async function uploadToPinata(jsonData, fileName) {
  try {
    const formData = new FormData();
    formData.append("file", Buffer.from(JSON.stringify(jsonData, null, 2)), {
      filename: fileName,
      contentType: "application/json",
    });

    const pinataMetadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: "receipt_nft_metadata",
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error(
      "Pinata upload error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Associate tokens with an account (required before receiving tokens on Hedera)
 */
async function associateTokens(accountId, accountKey) {
  try {
    console.log(`🔗 Associating tokens with account ${accountId}...`);

    const associateTx = new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([RECV_TOKEN_ID, RNFT_TOKEN_ID])
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    // For this demo, we'll assume the customer has the same key as operator
    // In production, you'd need the customer's private key or use multi-sig
    const signTx = await associateTx.sign(accountKey);
    const submitTx = await signTx.execute(client);
    const receipt = await submitTx.getReceipt(client);

    console.log(`✅ Tokens associated successfully!`);
    return receipt;
  } catch (error) {
    // If already associated, that's fine
    if (error.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")) {
      console.log(`ℹ️ Tokens already associated with ${accountId}`);
      return null;
    }
    throw error;
  }
}

/**
 * Endpoint to mint receipt NFT + reward
 */
app.post("/mint-receipt", async (req, res) => {
  try {
    const { merchant, items, total, customerWallet } = req.body;

    console.log("🧾 Creating receipt for:", merchant, "Total:", total);

    // 1. Associate tokens with customer account (if needed)
    // For demo purposes, we'll use the operator key. In production, you'd need customer's key.
    try {
      await associateTokens(customerWallet, operatorKey);
    } catch (error) {
      console.log(
        "⚠️ Token association failed (might already be associated):",
        error.message
      );
    }

    // 2. Create receipt metadata
    const receiptData = {
      name: `Receipt from ${merchant}`,
      description: `Purchase receipt - Total: $${total}`,
      image: "https://via.placeholder.com/400x300/f8f9fa/333?text=Receipt", // Placeholder image
      attributes: [
        { trait_type: "Merchant", value: merchant },
        { trait_type: "Total", value: `$${total}` },
        { trait_type: "Date", value: new Date().toLocaleDateString() },
        { trait_type: "Items Count", value: items.length },
      ],
      properties: {
        receipt: {
          merchant,
          items,
          total,
          date: new Date().toISOString(),
        },
        type: "purchase_receipt",
      },
    };

    // 3. Upload metadata to IPFS via Pinata
    console.log("📤 Uploading to IPFS...");
    const metadataUrl = await uploadToPinata(
      receiptData,
      `receipt-${Date.now()}.json`
    );
    console.log("✅ IPFS URL:", metadataUrl);

    // 4. Mint NFT (with IPFS metadata URI)
    console.log("🎨 Minting NFT...");
    const mintTx = new TokenMintTransaction()
      .setTokenId(RNFT_TOKEN_ID)
      .setMetadata([Buffer.from(metadataUrl)]) // Store IPFS URL in NFT
      .setMaxTransactionFee(new Hbar(50))
      .setTransactionValidDuration(180);

    console.log("🎨 Minting NFT...");
    const mintSubmit = await mintTx.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);
    console.log("✅ Minted NFT Serial:", mintReceipt.serials[0].toString());

    // 3. Transfer NFT to customer
    console.log("🔄 Transferring NFT and reward tokens...");

    let transferTx;
    let rewardAmount = 0;

    // Check if customer is different from operator
    if (customerWallet !== process.env.OPERATOR_ID) {
      transferTx = new TransferTransaction()
        .addNftTransfer(
          RNFT_TOKEN_ID,
          mintReceipt.serials[0],
          process.env.OPERATOR_ID,
          customerWallet
        )
        .addTokenTransfer(RECV_TOKEN_ID, process.env.OPERATOR_ID, -10) // -10 RECV from treasury
        .addTokenTransfer(RECV_TOKEN_ID, customerWallet, 10) // +10 RECV to customer
        .setTransactionMemo("Receipt NFT + Reward")
        .setMaxTransactionFee(new Hbar(50))
        .setTransactionValidDuration(180);
      rewardAmount = 10;
    } else {
      // If testing with same account, just keep NFT with operator and show success
      console.log(
        "ℹ️ Testing with operator account - NFT remains with treasury"
      );
      transferTx = null;
      rewardAmount = 0;
    }

    let transferReceipt = null;
    if (transferTx) {
      const transferSubmit = await transferTx.execute(client);
      transferReceipt = await transferSubmit.getReceipt(client);
    }

    console.log("✅ Receipt processing completed successfully!");

    res.json({
      status: "success",
      receiptNFT: `${RNFT_TOKEN_ID}::${mintReceipt.serials[0]}`,
      metadataUrl: metadataUrl,
      metadata: receiptData,
      reward:
        rewardAmount > 0 ? `${rewardAmount} RECV` : "No reward (testing mode)",
      txStatus: transferReceipt
        ? transferReceipt.status.toString()
        : "NFT_MINTED_ONLY",
      nftViewUrl: `https://hashscan.io/testnet/token/${RNFT_TOKEN_ID}/${mintReceipt.serials[0]}`,
      testMode: customerWallet === process.env.OPERATOR_ID,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: error.message,
      details: error.status ? error.status.toString() : "Unknown error",
    });
  }
});

/**
 * Endpoint to associate tokens with an account
 */
app.post("/associate-tokens", async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required" });
    }

    // For demo, using operator key. In production, customer would sign this
    await associateTokens(accountId, operatorKey);

    res.json({
      status: "success",
      message: `Tokens associated with account ${accountId}`,
      tokens: [RECV_TOKEN_ID, RNFT_TOKEN_ID],
    });
  } catch (error) {
    console.error("❌ Association error:", error);
    res.status(500).json({
      error: error.message,
      details: error.status ? error.status.toString() : "Unknown error",
    });
  }
});

// Get NFTs owned by an account
app.get("/get-nfts/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log(`🔍 Fetching NFTs for account: ${accountId}`);

    // Fetch account NFTs from HashScan API
    const response = await axios.get(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts?token.id=${RNFT_TOKEN_ID}`,
      {
        timeout: 10000,
      }
    );

    const nfts = response.data.nfts || [];
    console.log(`📊 Found ${nfts.length} NFTs for account ${accountId}`);

    // Format NFT data and fetch metadata
    const formattedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        let metadata = null;

        // Try to fetch metadata if it exists
        if (nft.metadata) {
          try {
            // Decode base64 metadata
            const metadataStr = Buffer.from(nft.metadata, "base64").toString(
              "utf8"
            );

            // Check if it's a URL or JSON
            if (metadataStr.startsWith("http")) {
              // It's a URL, fetch the metadata
              const metadataResponse = await axios.get(metadataStr, {
                timeout: 5000,
              });
              metadata = metadataResponse.data;
            } else {
              // It's direct JSON
              metadata = JSON.parse(metadataStr);
            }
          } catch (error) {
            console.log(
              `⚠️ Could not parse metadata for NFT ${nft.token_id}/${nft.serial_number}:`,
              error.message
            );
          }
        }

        return {
          tokenId: nft.token_id,
          serial: nft.serial_number,
          created: nft.created_timestamp,
          metadata: metadata,
          metadataUrl:
            metadata && nft.metadata
              ? Buffer.from(nft.metadata, "base64")
                  .toString("utf8")
                  .startsWith("http")
                ? Buffer.from(nft.metadata, "base64").toString("utf8")
                : null
              : null,
        };
      })
    );

    res.json({
      status: "success",
      account: accountId,
      count: formattedNFTs.length,
      nfts: formattedNFTs,
    });
  } catch (error) {
    console.error("❌ Error fetching NFTs:", error);
    res.status(500).json({
      error: error.message,
      details: "Failed to fetch NFTs from Hedera network",
    });
  }
});

// Import notification service
const notificationService = require("./notificationService");

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ ReceiptoVerse API running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Initialize WebSocket server
notificationService.initialize(server);

// Broadcast connection stats every 30 seconds
setInterval(() => {
  notificationService.broadcastStats();
}, 30000);
