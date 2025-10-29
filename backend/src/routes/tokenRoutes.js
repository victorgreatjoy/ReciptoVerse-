const express = require("express");
const router = express.Router();
const htsPointsService = require("../services/blockchain/htsPointsService");

/**
 * GET /api/token/info
 * Get information about the ReceiptoVerse Points token
 */
router.get("/info", async (req, res) => {
  try {
    if (!htsPointsService.initialized) {
      return res.status(503).json({
        error: "HTS Points service not initialized",
      });
    }

    const tokenId = htsPointsService.tokenId;
    const tokenInfo = htsPointsService.tokenInfo;

    res.json({
      tokenId: tokenId,
      name: tokenInfo?.name || "ReceiptoVerse Points",
      symbol: tokenInfo?.symbol || "RVP",
      decimals: tokenInfo?.decimals || 2,
      totalSupply: tokenInfo?.totalSupply || "1000000000",
      treasury:
        tokenInfo?.treasury ||
        htsPointsService.operatorId?.toString() ||
        process.env.HEDERA_OPERATOR_ID,
      network: process.env.HEDERA_NETWORK || "testnet",
      hashscanUrl: `https://hashscan.io/${
        process.env.HEDERA_NETWORK || "testnet"
      }/token/${tokenId}`,
    });
  } catch (error) {
    console.error("❌ Error fetching token info:", error);
    res.status(500).json({
      error: "Failed to fetch token information",
      details: error.message,
    });
  }
});

/**
 * GET /api/token/balance/:accountId
 * Get the token balance for a specific Hedera account
 */
router.get("/balance/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId || !accountId.match(/^\d+\.\d+\.\d+$/)) {
      return res.status(400).json({
        error: "Invalid Hedera account ID format. Expected: 0.0.XXXXX",
      });
    }

    const balanceResult = await htsPointsService.getBalance(accountId);

    res.json({
      accountId,
      tokenId: htsPointsService.tokenId,
      balance: balanceResult.balance.toString(),
      decimals: htsPointsService.tokenInfo?.decimals || 2,
      displayBalance: (
        parseFloat(balanceResult.balance) /
        Math.pow(10, htsPointsService.tokenInfo?.decimals || 2)
      ).toFixed(2),
      hbarBalance: balanceResult.hbarBalance,
    });
  } catch (error) {
    console.error(
      `❌ Error fetching balance for ${req.params.accountId}:`,
      error
    );
    res.status(500).json({
      error: "Failed to fetch token balance",
      details: error.message,
    });
  }
});

/**
 * GET /api/token/association-status/:accountId
 * Check if an account is associated with the RVP token
 */
router.get("/association-status/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId || !accountId.match(/^\d+\.\d+\.\d+$/)) {
      return res.status(400).json({
        error: "Invalid Hedera account ID format. Expected: 0.0.XXXXX",
      });
    }

    const isAssociated = await htsPointsService.isAssociated(accountId);

    res.json({
      accountId,
      tokenId: htsPointsService.tokenId,
      isAssociated,
      message: isAssociated
        ? "Account is associated and can receive RVP tokens"
        : "Account needs to associate with RVP token before receiving tokens",
      hashscanUrl: `https://hashscan.io/${
        process.env.HEDERA_NETWORK || "testnet"
      }/account/${accountId}`,
    });
  } catch (error) {
    console.error(
      `❌ Error checking association for ${req.params.accountId}:`,
      error
    );
    res.status(500).json({
      error: "Failed to check token association",
      details: error.message,
    });
  }
});

module.exports = router;
