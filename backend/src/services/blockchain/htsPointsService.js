/**
 * Hedera Token Service (HTS) - Points Token Management
 *
 * This service manages a fungible token on Hedera that represents user points.
 * Features:
 * - Create a fungible token for the points system
 * - Mint tokens when users earn points
 * - Burn tokens when users redeem points
 * - Transfer tokens between users
 * - Query on-chain balances
 *
 * Phase 2 Implementation - Oct 28, 2025
 */

const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenAssociateTransaction,
  AccountBalanceQuery,
  TransferTransaction,
  Hbar,
  PrivateKey,
} = require("@hashgraph/sdk");
const { getDLTGateway } = require("./dltGateway");

class HTSPointsService {
  constructor() {
    this.dltGateway = getDLTGateway();
    this.client = null;
    this.tokenId = null;
    this.operatorId = null;
    this.operatorKey = null;
    this.network = null;
    this.initialized = false;
  }

  /**
   * Initialize the HTS client and load existing token ID if available
   */
  async initialize() {
    try {
      console.log("🔷 Initializing HTS Points Service...");

      // Use the DLT Gateway for client initialization
      await this.dltGateway.initialize();

      this.client = this.dltGateway.client;
      this.operatorId = this.dltGateway.operatorId;
      this.operatorKey = this.dltGateway.operatorKey;
      this.network = this.dltGateway.network;

      // Load existing token ID if available
      const existingTokenId = process.env.HTS_POINTS_TOKEN_ID;
      if (existingTokenId) {
        this.tokenId = existingTokenId;
        console.log(`✅ Using existing points token: ${this.tokenId}`);
      } else {
        console.log(
          "ℹ️ No existing points token ID found. Use createToken() to create one."
        );
      }

      this.initialized = true;
      console.log("✅ HTS Points Service initialized");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize HTS Points Service:", error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Create a new fungible token for the points system
   * Only needs to be done once per deployment
   */
  async createToken(options = {}) {
    if (!this.initialized) {
      throw new Error("HTS Points Service not initialized");
    }

    const {
      name = "ReceiptoVerse Points",
      symbol = "RVP",
      decimals = 0, // Points are whole numbers
      initialSupply = 0, // Mint on-demand
      maxSupply = 1000000000, // 1 billion max points
      memo = "ReceiptoVerse loyalty points token",
    } = options;

    try {
      console.log(`🔷 Creating HTS Points Token: ${name} (${symbol})...`);

      // Create the token
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(this.operatorId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(maxSupply)
        .setSupplyKey(this.operatorKey)
        .setAdminKey(this.operatorKey)
        .setFreezeDefault(false)
        .setTokenMemo(memo);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const tokenId = receipt.tokenId.toString();

      this.tokenId = tokenId;

      console.log(`✅ Points token created: ${tokenId}`);
      console.log(`ℹ️ Add to .env: HTS_POINTS_TOKEN_ID=${tokenId}`);

      return {
        tokenId,
        name,
        symbol,
        decimals,
        maxSupply,
        network: this.network,
        treasuryAccount: this.operatorId,
      };
    } catch (error) {
      console.error("❌ Failed to create points token:", error);
      throw error;
    }
  }

  /**
   * Associate a user's Hedera account with the points token
   * Required before they can receive tokens
   */
  async associateUserAccount(accountId, userPrivateKey) {
    if (!this.initialized || !this.tokenId) {
      throw new Error("HTS Points Service not fully initialized");
    }

    try {
      console.log(`🔷 Associating account ${accountId} with token...`);

      const privateKey = PrivateKey.fromString(userPrivateKey);

      const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([this.tokenId]);

      const txResponse = await transaction
        .freezeWith(this.client)
        .sign(privateKey);

      const signedTx = await txResponse.execute(this.client);
      const receipt = await signedTx.getReceipt(this.client);

      console.log(`✅ Account ${accountId} associated with token`);

      return {
        success: true,
        accountId,
        tokenId: this.tokenId,
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error(`❌ Failed to associate account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Check if an account is associated with the points token
   * Uses Mirror Node API to query token relationships
   */
  async isAssociated(accountId) {
    if (!this.initialized || !this.tokenId) {
      throw new Error("HTS Points Service not fully initialized");
    }

    try {
      const mirrorNodeUrl =
        this.dltGateway.mirrorNodeUrl ||
        "https://testnet.mirrornode.hedera.com";
      const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens?token.id=${this.tokenId}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mirror Node query failed (${response.status})`);
      }

      const data = await response.json();
      const tokens = data.tokens || [];

      // Check if our token is in the list
      return tokens.length > 0;
    } catch (error) {
      console.error(
        `❌ Association check failed for ${accountId}:`,
        error.message
      );
      // Conservative: assume not associated on error
      return false;
    }
  }

  /**
   * Mint points tokens and transfer to user
   * Called when users earn points
   */
  async mintPoints(accountId, amount, memo = "") {
    if (!this.initialized || !this.tokenId) {
      throw new Error("HTS Points Service not fully initialized");
    }

    // Check if account is associated before minting
    const associated = await this.isAssociated(accountId);
    if (!associated) {
      console.warn(
        `⚠️ Account ${accountId} is not associated to ${this.tokenId}. Skipping on-chain mint.`
      );
      return {
        success: false,
        accountId,
        amount,
        tokenId: this.tokenId,
        notAssociated: true,
        reason: "ACCOUNT_NOT_ASSOCIATED",
      };
    }

    try {
      console.log(`🔷 Minting ${amount} points for ${accountId}...`);

      // Token has 2 decimals, so multiply by 100
      // Example: 13 points = 1300 units on-chain = 13.00 RVP
      const decimals = this.tokenInfo?.decimals || 2;
      const mintAmount = amount * Math.pow(10, decimals);

      console.log(
        `   Amount in units: ${mintAmount} (${amount} × 10^${decimals})`
      );

      // Mint tokens to treasury
      const mintTx = new TokenMintTransaction()
        .setTokenId(this.tokenId)
        .setAmount(mintAmount)
        .freezeWith(this.client);

      const mintResponse = await mintTx.execute(this.client);
      const mintReceipt = await mintResponse.getReceipt(this.client);

      console.log(`✅ Minted ${mintAmount} token units (${amount} points)`);

      // Transfer to user account
      const transferTx = new TransferTransaction()
        .addTokenTransfer(this.tokenId, this.operatorId, -mintAmount)
        .addTokenTransfer(this.tokenId, accountId, mintAmount);

      if (memo) {
        transferTx.setTransactionMemo(memo);
      }

      const transferResponse = await transferTx.execute(this.client);
      const transferReceipt = await transferResponse.getReceipt(this.client);

      console.log(`✅ Transferred ${amount} points to ${accountId}`);

      return {
        success: true,
        accountId,
        amount,
        tokenId: this.tokenId,
        mintTxId: mintResponse.transactionId.toString(),
        transferTxId: transferResponse.transactionId.toString(),
        newSerialNumbers: mintReceipt.serials,
      };
    } catch (error) {
      console.error(`❌ Failed to mint points for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Burn points tokens from treasury
   * Called when users redeem points
   */
  async burnPoints(amount, memo = "") {
    if (!this.initialized || !this.tokenId) {
      throw new Error("HTS Points Service not fully initialized");
    }

    try {
      console.log(`🔷 Burning ${amount} points...`);

      // Token has 2 decimals, so multiply by 100
      const decimals = this.tokenInfo?.decimals || 2;
      const burnAmount = amount * Math.pow(10, decimals);

      const transaction = new TokenBurnTransaction()
        .setTokenId(this.tokenId)
        .setAmount(burnAmount);

      if (memo) {
        transaction.setTransactionMemo(memo);
      }

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`✅ Burned ${burnAmount} token units (${amount} points)`);

      return {
        success: true,
        amount,
        tokenId: this.tokenId,
        txId: txResponse.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error(`❌ Failed to burn points:`, error);
      throw error;
    }
  }

  /**
   * Transfer points between users
   */
  async transferPoints(fromAccountId, toAccountId, amount, memo = "") {
    if (!this.initialized || !this.tokenId) {
      throw new Error("HTS Points Service not fully initialized");
    }

    try {
      console.log(
        `🔷 Transferring ${amount} points: ${fromAccountId} → ${toAccountId}...`
      );

      // Token has 2 decimals, so multiply by 100
      const decimals = this.tokenInfo?.decimals || 2;
      const transferAmount = amount * Math.pow(10, decimals);

      const transaction = new TransferTransaction()
        .addTokenTransfer(this.tokenId, fromAccountId, -transferAmount)
        .addTokenTransfer(this.tokenId, toAccountId, transferAmount);

      if (memo) {
        transaction.setTransactionMemo(memo);
      }

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(
        `✅ Transferred ${transferAmount} token units (${amount} points)`
      );

      return {
        success: true,
        from: fromAccountId,
        to: toAccountId,
        amount,
        tokenId: this.tokenId,
        txId: txResponse.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error(
        `❌ Failed to transfer points ${fromAccountId} → ${toAccountId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Query on-chain balance for an account
   */
  async getBalance(accountId) {
    if (!this.initialized || !this.tokenId) {
      throw new Error("HTS Points Service not fully initialized");
    }

    try {
      const query = new AccountBalanceQuery().setAccountId(accountId);

      const balance = await query.execute(this.client);

      const tokenBalance = balance.tokens._map.get(this.tokenId) || 0;

      return {
        accountId,
        tokenId: this.tokenId,
        balance: parseInt(tokenBalance.toString()),
        hbarBalance: balance.hbars.toString(),
      };
    } catch (error) {
      console.error(`❌ Failed to get balance for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get token information
   */
  getTokenInfo() {
    return {
      tokenId: this.tokenId,
      network: this.network,
      operatorId: this.operatorId,
      initialized: this.initialized,
      hashscanUrl: this.tokenId
        ? `https://hashscan.io/${this.network}/token/${this.tokenId}`
        : null,
    };
  }
}

// Singleton instance
const htsPointsService = new HTSPointsService();

module.exports = htsPointsService;
