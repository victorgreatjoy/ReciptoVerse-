const {
  Client,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  PrivateKey,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenId,
  AccountId,
} = require("@hashgraph/sdk");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

/**
 * Hedera NFT Service for Reward NFTs (Rabbit, Fox, Eagle)
 * Handles minting and transferring reward NFTs to user wallets
 */
class RewardNFTService {
  constructor() {
    this.client = null;
    this.operatorKey = null;
    this.operatorId = null;
    this.rewardsCollectionId = null;
    this.isInitialized = false;
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log("🎨 Initializing Reward NFT Service...");

      // 1. Create client for Hedera Testnet
      this.client = Client.forTestnet();

      // 2. Set operator account
      this.operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
      this.operatorId = process.env.OPERATOR_ID;
      this.client.setOperator(this.operatorId, this.operatorKey);

      // 3. Set default max transaction fee
      this.client.setDefaultMaxTransactionFee(new Hbar(100));

      // 4. Use existing rewards collection ID or will create new one
      this.rewardsCollectionId = process.env.REWARDS_NFT_COLLECTION_ID || null;

      console.log("✅ Reward NFT Service initialized");
      console.log("📝 Operator ID:", this.operatorId);
      console.log(
        "🎨 Rewards Collection ID:",
        this.rewardsCollectionId || "Will create new collection"
      );

      this.isInitialized = true;
    } catch (error) {
      console.error(
        "❌ Failed to initialize Reward NFT Service:",
        error.message
      );
      throw error;
    }
  }

  async createRewardsCollection() {
    if (!this.isInitialized) await this.initialize();

    if (this.rewardsCollectionId) {
      console.log(
        "✅ Using existing rewards collection:",
        this.rewardsCollectionId
      );
      return this.rewardsCollectionId;
    }

    try {
      console.log("🎨 Creating new Rewards NFT Collection...");

      const nftCreateTx = new TokenCreateTransaction()
        .setTokenName("ReceiptoVerse Rewards")
        .setTokenSymbol("RECV-REWARDS")
        .setTokenType(TokenType.NonFungibleUnique)
        .setTreasuryAccountId(this.operatorId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(this.operatorKey)
        .setMaxTransactionFee(new Hbar(50))
        .setTransactionValidDuration(180);

      const txResponse = await nftCreateTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      this.rewardsCollectionId = receipt.tokenId.toString();

      console.log("✅ Rewards NFT Collection created!");
      console.log("🎨 Collection ID:", this.rewardsCollectionId);
      console.log(
        "🔗 View on HashScan:",
        `https://hashscan.io/testnet/token/${this.rewardsCollectionId}`
      );

      // TODO: Save this to .env file for future use
      console.log("\n⚠️  IMPORTANT: Add this to your .env file:");
      console.log(`REWARDS_NFT_COLLECTION_ID=${this.rewardsCollectionId}\n`);

      return this.rewardsCollectionId;
    } catch (error) {
      console.error("❌ Error creating rewards collection:", error.message);
      throw error;
    }
  }

  /**
   * Generate metadata for reward NFT (simplified for Hedera's 100-byte limit)
   */
  generateRewardNFTMetadata(
    nftType,
    userAddress,
    serialNumber,
    hcsProof = null
  ) {
    // Hedera has a 100-byte metadata limit, so we keep it minimal
    // Full metadata will be stored on IPFS
    const metadata = {
      name: `${nftType.name} #${serialNumber}`,
      description: nftType.description,
      image:
        nftType.image_url || nftType.image_ipfs_hash
          ? `ipfs://${nftType.image_ipfs_hash}`
          : "",
      type: nftType.animal_type,
      tier: nftType.tier,
      attributes: [
        { trait_type: "Tier", value: nftType.tier },
        { trait_type: "Animal", value: nftType.animal_type },
        { trait_type: "Discount", value: `${nftType.discount_percentage}%` },
        {
          trait_type: "Monthly Bonus",
          value: `${nftType.monthly_bonus_points} RVP`,
        },
      ],
    };

    // Add HCS proof if available (proves NFT is backed by verified receipts)
    if (hcsProof && hcsProof.hcs_topic_id) {
      metadata.attributes.push(
        { trait_type: "Receipt Verified", value: "true" },
        { trait_type: "HCS Topic", value: hcsProof.hcs_topic_id },
        {
          trait_type: "HCS Sequence",
          value: hcsProof.hcs_sequence?.toString() || "pending",
        }
      );

      metadata.properties = {
        receiptHash: hcsProof.receipt_hash,
        hcsProof: {
          topicId: hcsProof.hcs_topic_id,
          sequence: hcsProof.hcs_sequence,
          timestamp: hcsProof.hcs_timestamp,
          consensusTimestamp: hcsProof.consensus_timestamp,
          hashscanUrl: hcsProof.hcs_sequence
            ? `https://hashscan.io/testnet/topic/${hcsProof.hcs_topic_id}/message/${hcsProof.hcs_sequence}`
            : null,
        },
        verified: true,
        verificationMethod: "Hedera Consensus Service (HCS)",
      };
    }

    return metadata;
  }

  /**
   * Upload metadata to IPFS via Pinata
   */
  async uploadMetadataToIPFS(metadata) {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      console.warn("⚠️  Pinata credentials not found, skipping IPFS upload");
      return null;
    }

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      console.log("📌 Metadata uploaded to IPFS:", ipfsUrl);
      return ipfsUrl;
    } catch (error) {
      console.error("❌ Error uploading to IPFS:", error.message);
      return null;
    }
  }

  /**
   * Mint a reward NFT and transfer to user's wallet
   */
  async mintRewardNFT(nftType, userAccountId, pointsSpent, userId = null) {
    if (!this.isInitialized) await this.initialize();

    try {
      // Ensure we have a collection
      if (!this.rewardsCollectionId) {
        await this.createRewardsCollection();
      }

      console.log("🪙 Minting Reward NFT...");
      console.log("🎨 NFT Type:", nftType.name);
      console.log("👤 User:", userAccountId);
      console.log("💰 Points Spent:", pointsSpent);

      // Fetch HCS proof from user's most recent verified receipt (if userId provided)
      let hcsProof = null;
      if (userId) {
        try {
          const { query } = require("./database");
          const receiptResult = await query(
            `SELECT hcs_topic_id, hcs_sequence, hcs_timestamp, receipt_hash, consensus_timestamp
             FROM receipts 
             WHERE user_id = $1 
               AND hcs_topic_id IS NOT NULL 
               AND hcs_sequence IS NOT NULL
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
          );

          if (receiptResult.rows.length > 0) {
            hcsProof = receiptResult.rows[0];
            console.log("✅ Found HCS proof from receipt:", {
              topicId: hcsProof.hcs_topic_id,
              sequence: hcsProof.hcs_sequence,
              hash: hcsProof.receipt_hash?.substring(0, 10) + "...",
            });
          } else {
            console.log("⚠️  No HCS-verified receipts found for user");
          }
        } catch (err) {
          console.warn("⚠️  Could not fetch HCS proof:", err.message);
          // Continue without HCS proof
        }
      }

      // Generate serial number (we'll use timestamp for uniqueness)
      const serialNumber = Date.now();

      // Generate metadata with HCS proof
      const metadata = this.generateRewardNFTMetadata(
        nftType,
        userAccountId,
        serialNumber,
        hcsProof
      );

      // Upload full metadata to IPFS
      const metadataUrl = await this.uploadMetadataToIPFS(metadata);

      // For Hedera, use just the IPFS CID (much smaller than full metadata)
      // Hedera has a 100-byte limit, IPFS CID is about 46 bytes
      const metadataString = metadataUrl
        ? metadataUrl.replace("https://gateway.pinata.cloud/ipfs/", "")
        : JSON.stringify({ type: nftType.animal_type, tier: nftType.tier });

      console.log(
        "📝 Metadata string:",
        metadataString,
        "Length:",
        metadataString.length
      );

      // Convert metadata to bytes
      const metadataBytes = Buffer.from(metadataString, "utf-8");

      // Create mint transaction
      const mintTx = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(this.rewardsCollectionId))
        .setMetadata([metadataBytes])
        .setMaxTransactionFee(new Hbar(20))
        .setTransactionValidDuration(180);

      // Execute mint transaction
      const mintResponse = await mintTx.execute(this.client);
      const mintReceipt = await mintResponse.getReceipt(this.client);

      const hederaSerialNumber = mintReceipt.serials[0];
      const tokenId = `${this.rewardsCollectionId}/${hederaSerialNumber}`;

      console.log("✅ Reward NFT minted successfully!");
      console.log("🎨 Token ID:", tokenId);
      console.log("🔢 Serial Number:", hederaSerialNumber.toString());

      // Transfer NFT to user's wallet (if different from operator)
      let transferSuccess = false;
      if (userAccountId && userAccountId !== this.operatorId) {
        transferSuccess = await this.transferNFTToUser(
          this.rewardsCollectionId,
          hederaSerialNumber.toString(),
          userAccountId
        );
      } else {
        transferSuccess = true; // Already in operator account
      }

      return {
        success: true,
        tokenId: tokenId,
        serialNumber: hederaSerialNumber.toString(),
        collectionId: this.rewardsCollectionId,
        metadata: metadata,
        metadataUrl: metadataUrl,
        transferred: transferSuccess,
        hashscanUrl: `https://hashscan.io/testnet/token/${this.rewardsCollectionId}/${hederaSerialNumber}`,
      };
    } catch (error) {
      console.error("❌ Error minting reward NFT:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transfer NFT to user's wallet
   */
  async transferNFTToUser(collectionId, serialNumber, userAccountId) {
    try {
      console.log("🔄 Transferring NFT to user wallet...");
      console.log("👤 User Account:", userAccountId);

      // First, associate the token with the user's account (if not already)
      // Note: In production, users should associate the token from their wallet
      // For now, we'll skip this step and assume the user has associated the token

      // Create transfer transaction
      const transferTx = await new TransferTransaction()
        .addNftTransfer(
          TokenId.fromString(collectionId),
          serialNumber,
          this.operatorId,
          AccountId.fromString(userAccountId)
        )
        .setMaxTransactionFee(new Hbar(10))
        .setTransactionValidDuration(180)
        .execute(this.client);

      const transferReceipt = await transferTx.getReceipt(this.client);

      console.log("✅ NFT transferred to user successfully!");
      return true;
    } catch (error) {
      console.error("❌ Error transferring NFT:", error.message);

      // If error is about token association, provide helpful message
      if (error.message.includes("TOKEN_NOT_ASSOCIATED")) {
        console.log(
          "⚠️  User needs to associate the token in their wallet first"
        );
        console.log(`   Token ID: ${collectionId}`);
      }

      return false;
    }
  }

  /**
   * Check if user has associated the rewards token
   */
  async isTokenAssociated(userAccountId) {
    try {
      // This would require querying the mirror node API
      // For now, we'll return true and handle errors during transfer
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
const rewardNFTService = new RewardNFTService();
module.exports = rewardNFTService;
