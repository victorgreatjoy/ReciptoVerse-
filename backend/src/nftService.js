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
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

class NFTService {
  constructor() {
    this.client = null;
    this.operatorKey = null;
    this.operatorId = null;
    this.receiptCollectionId = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // 1. Create client for Hedera Testnet
      this.client = Client.forTestnet();

      // 2. Set operator account
      this.operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
      this.operatorId = process.env.OPERATOR_ID;
      this.client.setOperator(this.operatorId, this.operatorKey);

      // 3. Set default max transaction fee
      this.client.setDefaultMaxTransactionFee(new Hbar(100));

      // 4. Use existing collection ID or create new one
      this.receiptCollectionId = process.env.RECEIPT_NFT_COLLECTION_ID || null;

      console.log("🔧 NFT Service initialized");
      console.log("📝 Operator ID:", this.operatorId);
      console.log(
        "🎨 Collection ID:",
        this.receiptCollectionId || "Will create new"
      );

      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize NFT Service:", error.message);
      throw error;
    }
  }

  async createReceiptCollection() {
    if (!this.isInitialized) await this.initialize();

    if (this.receiptCollectionId) {
      console.log(
        "✅ Using existing receipt collection:",
        this.receiptCollectionId
      );
      return this.receiptCollectionId;
    }

    try {
      console.log("🎨 Creating new Receipt NFT Collection...");

      const nftCreateTx = new TokenCreateTransaction()
        .setTokenName("ReceiptoVerse Receipts")
        .setTokenSymbol("RECV-NFT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setTreasuryAccountId(this.operatorId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(this.operatorKey)
        .setMaxTransactionFee(new Hbar(50))
        .setTransactionValidDuration(180);

      const txResponse = await nftCreateTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      this.receiptCollectionId = receipt.tokenId.toString();

      console.log("✅ Receipt NFT Collection created!");
      console.log("🎨 Collection ID:", this.receiptCollectionId);
      console.log(
        "🔗 View on HashScan:",
        `https://hashscan.io/testnet/token/${this.receiptCollectionId}`
      );

      return this.receiptCollectionId;
    } catch (error) {
      console.error("❌ Error creating receipt collection:", error.message);
      throw error;
    }
  }

  generateReceiptMetadata(receiptData, merchantData) {
    const metadata = {
      name: `Receipt #${receiptData.id}`,
      description: `Digital receipt from ${merchantData.business_name}`,
      image: "", // We'll add IPFS image URL later
      attributes: [
        {
          trait_type: "Merchant",
          value: merchantData.business_name,
        },
        {
          trait_type: "Total Amount",
          value: `$${receiptData.total_amount}`,
        },
        {
          trait_type: "Date",
          value: new Date(receiptData.created_at).toISOString().split("T")[0],
        },
        {
          trait_type: "Items Count",
          value: receiptData.items ? receiptData.items.length : 0,
        },
        {
          trait_type: "Receipt Type",
          value: "Digital Receipt NFT",
        },
      ],
      properties: {
        merchant_id: merchantData.id,
        receipt_id: receiptData.id,
        customer_id: receiptData.customer_id,
        transaction_hash: receiptData.transaction_hash || "",
        created_timestamp: receiptData.created_at,
      },
    };

    return metadata;
  }

  async mintReceiptNFT(receiptData, merchantData, customerAccountId) {
    if (!this.isInitialized) await this.initialize();

    try {
      // Ensure we have a collection
      if (!this.receiptCollectionId) {
        await this.createReceiptCollection();
      }

      console.log("🪙 Minting Receipt NFT...");
      console.log("📝 Receipt ID:", receiptData.id);
      console.log("👤 Customer:", customerAccountId);

      // Generate metadata
      const metadata = this.generateReceiptMetadata(receiptData, merchantData);
      const metadataString = JSON.stringify(metadata);

      // Convert metadata to bytes
      const metadataBytes = Buffer.from(metadataString, "utf-8");

      // Create mint transaction
      const mintTx = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(this.receiptCollectionId))
        .setMetadata([metadataBytes])
        .setMaxTransactionFee(new Hbar(20))
        .setTransactionValidDuration(180);

      // Execute mint transaction
      const mintResponse = await mintTx.execute(this.client);
      const mintReceipt = await mintResponse.getReceipt(this.client);

      const serialNumber = mintReceipt.serials[0];
      const tokenId = `${this.receiptCollectionId}/${serialNumber}`;

      console.log("✅ Receipt NFT minted successfully!");
      console.log("🎨 Token ID:", tokenId);
      console.log("🔢 Serial Number:", serialNumber.toString());

      // If customer account is different from operator, transfer the NFT
      if (customerAccountId && customerAccountId !== this.operatorId) {
        await this.transferNFTToCustomer(tokenId, customerAccountId);
      }

      return {
        success: true,
        tokenId: tokenId,
        serialNumber: serialNumber.toString(),
        collectionId: this.receiptCollectionId,
        metadata: metadata,
        hashscanUrl: `https://hashscan.io/testnet/token/${this.receiptCollectionId}/${serialNumber}`,
      };
    } catch (error) {
      console.error("❌ Error minting receipt NFT:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async transferNFTToCustomer(tokenId, customerAccountId) {
    try {
      console.log("🔄 Transferring NFT to customer...");

      const [collectionId, serialNumber] = tokenId.split("/");

      // First, customer needs to associate with the token
      // Note: In production, customer would need to do this themselves
      // For now, we'll just log that this step is needed
      console.log("ℹ️ Customer needs to associate with token:", collectionId);
      console.log("ℹ️ Customer account:", customerAccountId);

      // In a full implementation, we would:
      // 1. Create an association transaction for the customer
      // 2. Execute the transfer transaction
      // For now, we'll keep the NFT in the treasury and log the intended recipient

      console.log(
        "📝 NFT minted and held in treasury for customer:",
        customerAccountId
      );
      console.log(
        "🔗 Customer can claim at: https://hashscan.io/testnet/token/" + tokenId
      );

      return true;
    } catch (error) {
      console.error("❌ Error transferring NFT:", error.message);
      return false;
    }
  }

  async getReceiptNFTs(customerAccountId) {
    // This would query the Hedera mirror node for NFTs owned by the customer
    // For now, return placeholder data
    console.log("🔍 Querying NFTs for customer:", customerAccountId);
    return [];
  }

  close() {
    if (this.client) {
      this.client.close();
      this.isInitialized = false;
    }
  }
}

module.exports = { NFTService };
