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
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const app = express();
app.use(bodyParser.json());

// Add CORS middleware to allow frontend to connect
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Environment variables validation
const requiredEnvVars = [
  "OPERATOR_ID",
  "OPERATOR_KEY",
  "RECV_TOKEN_ID",
  "RNFT_TOKEN_ID",
  "PINATA_JWT",
];

console.log("🔍 Checking environment variables...");
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars);
  console.error("💡 Please add these variables to your Railway deployment:");
  missingVars.forEach((varName) => {
    console.error(`   ${varName}=your_value_here`);
  });
  process.exit(1);
}

// Hedera client setup
const client = Client.forTestnet();
const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
client.setOperator(process.env.OPERATOR_ID, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

console.log("🔧 Hedera client configured:");
console.log("Operator ID:", process.env.OPERATOR_ID);
console.log("RECV Token ID:", process.env.RECV_TOKEN_ID);
console.log("rNFT Token ID:", process.env.RNFT_TOKEN_ID);

// Config
const RECV_TOKEN_ID = process.env.RECV_TOKEN_ID;
const RNFT_TOKEN_ID = process.env.RNFT_TOKEN_ID;

// Pinata IPFS Configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

console.log("🔧 Pinata configured:");
console.log("API Key:", PINATA_API_KEY ? "✅ Loaded" : "❌ Missing");

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

    // Handle both Hedera account IDs (0.0.xxxxx) and Ethereum addresses (0x...)
    let queryAccountId = accountId;
    
    // If it's an Ethereum address (starts with 0x), use it directly
    // The Hedera Mirror Node supports both formats
    if (accountId.startsWith("0x")) {
      console.log("📱 Detected Ethereum address, using EVM compatibility");
      queryAccountId = accountId.toLowerCase();
    }

    // Fetch account NFTs from HashScan API
    const response = await axios.get(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${queryAccountId}/nfts?token.id=${RNFT_TOKEN_ID}`,
      {
        timeout: 10000,
      }
    );

    const nfts = response.data.nfts || [];
    console.log(`📊 Found ${nfts.length} NFTs for account ${queryAccountId}`);

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
      account: queryAccountId,
      originalAccount: accountId,
      count: formattedNFTs.length,
      nfts: formattedNFTs,
    });
  } catch (error) {
    console.error("❌ Error fetching NFTs:", error);
    
    // More detailed error logging
    if (error.response) {
      console.error("🔍 API Response Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    res.status(500).json({
      error: error.message,
      details: error.response?.data?.message || "Failed to fetch NFTs from Hedera network",
      apiError: error.response?.status || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ReciptoVerse API running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});
