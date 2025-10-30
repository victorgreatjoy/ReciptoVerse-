/**
 * HTS Payment Service
 * Handles RVP token transfers for NFT purchases
 */

const {
  Client,
  TransferTransaction,
  AccountBalanceQuery,
  Hbar,
} = require("@hashgraph/sdk");
const config = require("../config");

// Initialize Hedera client
const client = config.hedera.isMainnet
  ? Client.forMainnet()
  : Client.forTestnet();

const { PrivateKey } = require("@hashgraph/sdk");
const operatorKey = PrivateKey.fromStringECDSA(config.hedera.operatorKey);
client.setOperator(config.hedera.operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

const RVP_TOKEN_ID = config.hedera.rvpTokenId;
const TREASURY_ACCOUNT = config.hedera.operatorId;

/**
 * Check user's RVP token balance on Hedera
 */
async function getUserRVPBalance(accountId) {
  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    const rvpBalance = balance.tokens.get(RVP_TOKEN_ID);

    console.log(
      `💰 RVP Balance for ${accountId}: ${
        rvpBalance ? rvpBalance.toString() : 0
      }`
    );

    return rvpBalance ? parseInt(rvpBalance.toString()) : 0;
  } catch (error) {
    console.error(`❌ Error getting RVP balance for ${accountId}:`, error);
    throw new Error(`Failed to check RVP balance: ${error.message}`);
  }
}

/**
 * Transfer RVP tokens from user to treasury (NFT purchase payment)
 * Note: This requires the user to sign the transaction in their wallet
 * For now, we'll just validate they have enough tokens
 */
async function processRVPPayment(
  userAccountId,
  amount,
  description = "NFT Purchase"
) {
  try {
    console.log(`💳 Processing RVP payment...`);
    console.log(`   From: ${userAccountId}`);
    console.log(`   To: ${TREASURY_ACCOUNT}`);
    console.log(`   Amount: ${amount} RVP`);
    console.log(`   Description: ${description}`);

    // Check if user has enough RVP tokens
    const userBalance = await getUserRVPBalance(userAccountId);

    if (userBalance < amount) {
      throw new Error(
        `Insufficient RVP tokens. You have ${userBalance} RVP but need ${amount} RVP. Earn more points to get RVP tokens!`
      );
    }

    // For MVP: We validate the balance but don't transfer yet
    // In production, user would sign this transaction in their wallet (HashPack, Blade, etc.)
    // The frontend would use HashConnect or similar to get user signature

    console.log(
      `✅ Payment validated: User has sufficient RVP balance (${userBalance} RVP)`
    );

    return {
      success: true,
      userBalance,
      amountPaid: amount,
      remainingBalance: userBalance - amount,
      message: `Payment of ${amount} RVP validated successfully`,
      // In production, this would include transaction ID from Hedera
      note: "User wallet signature required for actual transfer",
    };
  } catch (error) {
    console.error(`❌ RVP payment error:`, error);
    throw error;
  }
}

/**
 * Transfer RVP tokens from treasury to user (rewards/refunds)
 */
async function transferRVPToUser(userAccountId, amount, memo = "RVP Reward") {
  try {
    console.log(`💸 Transferring RVP to user...`);
    console.log(`   To: ${userAccountId}`);
    console.log(`   Amount: ${amount} RVP`);
    console.log(`   Memo: ${memo}`);

    const transferTx = await new TransferTransaction()
      .addTokenTransfer(RVP_TOKEN_ID, TREASURY_ACCOUNT, -amount)
      .addTokenTransfer(RVP_TOKEN_ID, userAccountId, amount)
      .setTransactionMemo(memo)
      .execute(client);

    const receipt = await transferTx.getReceipt(client);

    console.log(`✅ RVP transferred successfully!`);
    console.log(`   Transaction ID: ${transferTx.transactionId.toString()}`);
    console.log(`   Status: ${receipt.status.toString()}`);

    return {
      success: true,
      transactionId: transferTx.transactionId.toString(),
      status: receipt.status.toString(),
      amount,
      recipient: userAccountId,
    };
  } catch (error) {
    console.error(`❌ RVP transfer error:`, error);
    throw new Error(`Failed to transfer RVP: ${error.message}`);
  }
}

/**
 * Check if user has associated RVP token
 */
async function checkRVPAssociation(accountId) {
  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    const hasRVP = balance.tokens.has(RVP_TOKEN_ID);

    console.log(
      `🔍 RVP Association check for ${accountId}: ${
        hasRVP ? "Associated" : "Not Associated"
      }`
    );

    return hasRVP;
  } catch (error) {
    console.error(`❌ Error checking RVP association:`, error);
    return false;
  }
}

module.exports = {
  getUserRVPBalance,
  processRVPPayment,
  transferRVPToUser,
  checkRVPAssociation,
};
