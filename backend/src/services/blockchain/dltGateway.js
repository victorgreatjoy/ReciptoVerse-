const {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  Hbar,
  TokenId,
  NftId,
} = require("@hashgraph/sdk");
const axios = require("axios");

/**
 * DLT Gateway - Central service for all Hedera DLT interactions
 * Provides unified interface for HCS, HTS, and HSCS operations
 */
class DLTGateway {
  constructor() {
    this.client = null;
    this.operatorId = null;
    this.operatorKey = null;
    this.network = process.env.HEDERA_NETWORK || "testnet";
    this.mirrorNodeUrl =
      this.network === "mainnet"
        ? "https://mainnet-public.mirrornode.hedera.com"
        : "https://testnet.mirrornode.hedera.com";
  }

  /**
   * Initialize Hedera client
   */
  async initialize() {
    try {
      // Setup operator account (supports OPERATOR_* and HEDERA_OPERATOR_*)
      const envOperatorId =
        process.env.OPERATOR_ID || process.env.HEDERA_OPERATOR_ID;
      const envOperatorKey =
        process.env.OPERATOR_KEY || process.env.HEDERA_OPERATOR_KEY;

      if (!envOperatorId || !envOperatorKey) {
        throw new Error(
          "Missing Hedera operator credentials: set OPERATOR_ID and OPERATOR_KEY (or HEDERA_OPERATOR_ID/HEDERA_OPERATOR_KEY) in .env"
        );
      }

      this.operatorId = AccountId.fromString(envOperatorId);

      // Parse private key with best-effort detection
      this.operatorKey = (() => {
        const key = envOperatorKey.trim();
        const isHex = /^0x?[0-9a-fA-F]+$/.test(key);
        // Try ECDSA for hex-looking keys first
        if (isHex) {
          try {
            return PrivateKey.fromStringECDSA(key);
          } catch (_) {
            // try ED25519 hex
            try {
              return PrivateKey.fromStringED25519(key);
            } catch (_) {
              // fallback
            }
          }
        }
        // Fallback to generic parser (DER or legacy string formats)
        return PrivateKey.fromString(key);
      })();

      // Create client for testnet or mainnet
      if (this.network === "mainnet") {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet();
      }

      this.client.setOperator(this.operatorId, this.operatorKey);

      console.log("✅ DLT Gateway initialized");
      console.log(`📡 Network: ${this.network}`);
      console.log(`👤 Operator: ${this.operatorId.toString()}`);
      console.log(`🪞 Mirror Node: ${this.mirrorNodeUrl}`);

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize DLT Gateway:", error);
      throw error;
    }
  }

  /**
   * Ensure client is initialized before operations
   */
  ensureInitialized() {
    if (!this.client) {
      throw new Error("DLT Gateway not initialized. Call initialize() first.");
    }
  }

  // ==================== HCS OPERATIONS ====================

  /**
   * Create a new HCS topic
   */
  async createTopic(memo = "") {
    this.ensureInitialized();

    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(memo)
        .setAdminKey(this.operatorKey.publicKey)
        .setSubmitKey(this.operatorKey.publicKey);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const topicId = receipt.topicId;

      console.log(`✅ Created HCS topic: ${topicId.toString()}`);

      return {
        topicId: topicId.toString(),
        memo,
      };
    } catch (error) {
      console.error("❌ Failed to create HCS topic:", error);
      throw error;
    }
  }

  /**
   * Submit message to HCS topic
   */
  async publishToHCS(topicId, message) {
    this.ensureInitialized();

    try {
      const topicIdObj =
        typeof topicId === "string" ? TopicId.fromString(topicId) : topicId;

      // Convert message to string if it's an object
      const messageStr =
        typeof message === "string" ? message : JSON.stringify(message);

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicIdObj)
        .setMessage(messageStr);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      const txId = txResponse.transactionId.toString();

      // The receipt for TopicMessageSubmitTransaction includes sequence and running hash
      const sequenceNumber = receipt.topicSequenceNumber
        ? receipt.topicSequenceNumber.toString()
        : null;
      const consensusTimestamp = receipt.consensusTimestamp
        ? receipt.consensusTimestamp.toString()
        : null;

      console.log(`✅ Published to HCS topic ${topicIdObj.toString()}`);
      if (sequenceNumber) {
        console.log(`📝 Sequence: ${sequenceNumber}`);
      }

      return {
        topicId: topicIdObj.toString(),
        transactionId: txId,
        sequenceNumber,
        consensusTimestamp,
        message: messageStr,
      };
    } catch (error) {
      console.error("❌ Failed to publish to HCS:", error);
      throw error;
    }
  }

  /**
   * Subscribe to HCS topic messages
   */
  async subscribeToHCS(topicId, callback, startTime = null) {
    this.ensureInitialized();

    try {
      const topicIdObj =
        typeof topicId === "string" ? TopicId.fromString(topicId) : topicId;

      const query = new TopicMessageQuery().setTopicId(topicIdObj);

      if (startTime) {
        query.setStartTime(startTime);
      }

      query.subscribe(this.client, null, (message) => {
        const messageData = {
          topicId: topicId.toString(),
          consensusTimestamp: message.consensusTimestamp.toString(),
          sequenceNumber: message.sequenceNumber.toString(),
          contents: Buffer.from(message.contents).toString("utf8"),
          runningHash: Buffer.from(message.runningHash).toString("hex"),
        };

        callback(messageData);
      });

      console.log(`✅ Subscribed to HCS topic ${topicId}`);
    } catch (error) {
      console.error("❌ Failed to subscribe to HCS:", error);
      throw error;
    }
  }

  /**
   * Get HCS message details from Mirror Node
   */
  async getHCSMessageDetails(transactionId) {
    try {
      const url = `${this.mirrorNodeUrl}/api/v1/transactions/${transactionId}`;
      const response = await axios.get(url);

      if (response.data.transactions && response.data.transactions.length > 0) {
        const tx = response.data.transactions[0];
        return {
          sequenceNumber: tx.consensus_timestamp, // Will be refined with actual sequence
          consensusTimestamp: tx.consensus_timestamp,
        };
      }

      throw new Error("Transaction not found in mirror node");
    } catch (error) {
      console.error("❌ Failed to get HCS message details:", error);
      throw error;
    }
  }

  /**
   * Get HCS topic messages from Mirror Node
   */
  async getHCSMessages(topicId, limit = 10) {
    try {
      const url = `${this.mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`;
      const response = await axios.get(url);

      return response.data.messages || [];
    } catch (error) {
      console.error("❌ Failed to get HCS messages:", error);
      throw error;
    }
  }

  // ==================== HTS OPERATIONS ====================

  /**
   * Create fungible token (for reward points)
   */
  async createFungibleToken(config) {
    this.ensureInitialized();

    try {
      const {
        name,
        symbol,
        decimals = 2,
        initialSupply = 0,
        maxSupply = null,
        treasuryAccount = this.operatorId,
      } = config;

      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(treasuryAccount)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(
          maxSupply ? TokenSupplyType.Finite : TokenSupplyType.Infinite
        )
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey);

      if (maxSupply) {
        transaction.setMaxSupply(maxSupply);
      }

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const tokenId = receipt.tokenId;

      console.log(`✅ Created fungible token: ${tokenId.toString()}`);

      return {
        tokenId: tokenId.toString(),
        name,
        symbol,
        decimals,
      };
    } catch (error) {
      console.error("❌ Failed to create fungible token:", error);
      throw error;
    }
  }

  /**
   * Create NFT collection
   */
  async createNFTCollection(config) {
    this.ensureInitialized();

    try {
      const {
        name,
        symbol,
        maxSupply = null,
        treasuryAccount = this.operatorId,
      } = config;

      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(
          maxSupply ? TokenSupplyType.Finite : TokenSupplyType.Infinite
        )
        .setTreasuryAccountId(treasuryAccount)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey);

      if (maxSupply) {
        transaction.setMaxSupply(maxSupply);
      }

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const tokenId = receipt.tokenId;

      console.log(`✅ Created NFT collection: ${tokenId.toString()}`);

      return {
        tokenId: tokenId.toString(),
        name,
        symbol,
      };
    } catch (error) {
      console.error("❌ Failed to create NFT collection:", error);
      throw error;
    }
  }

  /**
   * Mint NFT
   */
  async mintNFT(tokenId, metadata) {
    this.ensureInitialized();

    try {
      const tokenIdObj =
        typeof tokenId === "string" ? TokenId.fromString(tokenId) : tokenId;

      // Convert metadata to bytes
      const metadataBytes = Buffer.from(
        typeof metadata === "string" ? metadata : JSON.stringify(metadata)
      );

      const transaction = new TokenMintTransaction()
        .setTokenId(tokenIdObj)
        .setMetadata([metadataBytes]);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      const serialNumber = receipt.serials[0].toString();

      console.log(`✅ Minted NFT ${tokenId.toString()} #${serialNumber}`);

      return {
        tokenId: tokenId.toString(),
        serialNumber,
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error) {
      console.error("❌ Failed to mint NFT:", error);
      throw error;
    }
  }

  /**
   * Transfer tokens (fungible or NFT)
   */
  async transferToken(config) {
    this.ensureInitialized();

    try {
      const { tokenId, from, to, amount, serialNumber, memo = "" } = config;

      const fromAccount =
        typeof from === "string" ? AccountId.fromString(from) : from;
      const toAccount = typeof to === "string" ? AccountId.fromString(to) : to;
      const tokenIdObj =
        typeof tokenId === "string" ? TokenId.fromString(tokenId) : tokenId;

      let transaction = new TransferTransaction();

      if (serialNumber !== undefined) {
        // NFT transfer
        const nftId = new NftId(tokenIdObj, serialNumber);
        transaction.addNftTransfer(nftId, fromAccount, toAccount);
      } else {
        // Fungible token transfer
        transaction
          .addTokenTransfer(tokenIdObj, fromAccount, -amount)
          .addTokenTransfer(tokenIdObj, toAccount, amount);
      }

      if (memo) {
        transaction.setTransactionMemo(memo);
      }

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(
        `✅ Transferred ${
          serialNumber !== undefined ? "NFT" : "tokens"
        } from ${fromAccount.toString()} to ${toAccount.toString()}`
      );

      return {
        transactionId: txResponse.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("❌ Failed to transfer token:", error);
      throw error;
    }
  }

  // ==================== MIRROR NODE QUERIES ====================

  /**
   * Get account balance from Mirror Node
   */
  async getAccountBalance(accountId) {
    try {
      const url = `${this.mirrorNodeUrl}/api/v1/accounts/${accountId}`;
      const response = await axios.get(url);

      return {
        hbarBalance: response.data.balance.balance,
        tokens: response.data.balance.tokens || [],
      };
    } catch (error) {
      console.error("❌ Failed to get account balance:", error);
      throw error;
    }
  }

  /**
   * Get token balance for specific token
   */
  async getTokenBalance(accountId, tokenId) {
    try {
      const balance = await this.getAccountBalance(accountId);
      const token = balance.tokens.find((t) => t.token_id === tokenId);

      return token ? parseInt(token.balance) : 0;
    } catch (error) {
      console.error("❌ Failed to get token balance:", error);
      return 0;
    }
  }

  /**
   * Get transaction receipt from Mirror Node
   */
  async getTransactionReceipt(transactionId) {
    try {
      const url = `${this.mirrorNodeUrl}/api/v1/transactions/${transactionId}`;
      const response = await axios.get(url);

      return response.data.transactions[0] || null;
    } catch (error) {
      console.error("❌ Failed to get transaction receipt:", error);
      throw error;
    }
  }

  /**
   * Check if account has associated token
   */
  async isTokenAssociated(accountId, tokenId) {
    try {
      const balance = await this.getAccountBalance(accountId);
      return balance.tokens.some((t) => t.token_id === tokenId);
    } catch (error) {
      console.error("❌ Failed to check token association:", error);
      return false;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current network status
   */
  getNetworkInfo() {
    return {
      network: this.network,
      operatorId: this.operatorId?.toString(),
      mirrorNodeUrl: this.mirrorNodeUrl,
      isInitialized: !!this.client,
    };
  }

  /**
   * Close client connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      console.log("✅ DLT Gateway connection closed");
    }
  }
}

// Singleton instance
let instance = null;

function getDLTGateway() {
  if (!instance) {
    instance = new DLTGateway();
  }
  return instance;
}

module.exports = {
  DLTGateway,
  getDLTGateway,
};
