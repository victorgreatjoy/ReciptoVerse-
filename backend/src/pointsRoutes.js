const express = require("express");
const router = express.Router();
const {
  awardPoints,
  getUserPoints,
  getPointsHistory,
  validatePointsTransaction,
  getTierInfo,
  LOYALTY_TIERS,
} = require("./pointsService");
const { query } = require("./database");

/**
 * Middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const jwt = require("jsonwebtoken");
  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = user;
      next();
    }
  );
};

/**
 * GET /api/points/balance/:userId
 * Get user's points balance and tier information
 */
router.get("/balance/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own data or is admin
    if (req.user.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const pointsData = await getUserPoints(userId);

    res.json({
      success: true,
      data: pointsData,
    });
  } catch (error) {
    console.error("Error fetching points balance:", error);
    res.status(500).json({
      error: "Failed to fetch points balance",
      message: error.message,
    });
  }
});

/**
 * GET /api/points/balance
 * Get current authenticated user's points balance
 */
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pointsData = await getUserPoints(userId);

    res.json({
      success: true,
      data: pointsData,
    });
  } catch (error) {
    console.error("Error fetching points balance:", error);
    res.status(500).json({
      error: "Failed to fetch points balance",
      message: error.message,
    });
  }
});

/**
 * GET /api/points/history
 * Get authenticated user's points transaction history
 */
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await getPointsHistory(userId, limit, offset);

    // Get total count for pagination
    const countResult = await query(
      "SELECT COUNT(*) as total FROM points_transactions WHERE user_id = ?",
      [userId]
    );

    const total = countResult.rows[0]?.total || 0;

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching points history:", error);
    res.status(500).json({
      error: "Failed to fetch points history",
      message: error.message,
    });
  }
});

/**
 * POST /api/points/award
 * Award points to a user (merchant or admin only)
 */
router.post("/award", authenticateToken, async (req, res) => {
  try {
    const { userId, purchaseAmount, merchantId, receiptId, description } =
      req.body;

    // Validate required fields
    if (!userId || !purchaseAmount) {
      return res.status(400).json({
        error: "Missing required fields: userId, purchaseAmount",
      });
    }

    // Validate purchase amount
    if (purchaseAmount <= 0 || purchaseAmount > 10000) {
      return res.status(400).json({
        error: "Invalid purchase amount (must be between $0.01 and $10,000)",
      });
    }

    // Verify merchant exists and is approved
    if (merchantId) {
      const merchantResult = await query(
        "SELECT status FROM merchants WHERE id = ?",
        [merchantId]
      );

      if (!merchantResult.rows || merchantResult.rows.length === 0) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      if (merchantResult.rows[0].status !== "approved") {
        return res.status(403).json({
          error: "Merchant not approved to award points",
        });
      }
    }

    // Validate transaction (anti-fraud checks)
    const validation = await validatePointsTransaction(
      userId,
      merchantId,
      purchaseAmount
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: "Transaction validation failed",
        reason: validation.reason,
      });
    }

    // Award points
    const result = await awardPoints(
      userId,
      purchaseAmount,
      merchantId,
      receiptId,
      description
    );

    res.json({
      success: true,
      message: "Points awarded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error awarding points:", error);
    res.status(500).json({
      error: "Failed to award points",
      message: error.message,
    });
  }
});

/**
 * GET /api/points/tiers
 * Get information about all loyalty tiers
 */
router.get("/tiers", async (req, res) => {
  try {
    res.json({
      success: true,
      data: LOYALTY_TIERS,
    });
  } catch (error) {
    console.error("Error fetching tier info:", error);
    res.status(500).json({
      error: "Failed to fetch tier information",
      message: error.message,
    });
  }
});

/**
 * GET /api/points/stats
 * Get user's points statistics (authenticated user only)
 */
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user points data
    const pointsData = await getUserPoints(userId);

    // Get transaction statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
        MAX(created_at) as last_transaction
       FROM points_transactions
       WHERE user_id = ?`,
      [userId]
    );

    const stats = statsResult.rows[0];

    // Get current tier progress
    const currentTier = pointsData.tier;
    const tierInfo = getTierInfo(currentTier);
    const nextTierKey =
      currentTier === "bronze"
        ? "silver"
        : currentTier === "silver"
        ? "gold"
        : currentTier === "gold"
        ? "platinum"
        : null;

    let progressToNextTier = null;
    if (nextTierKey) {
      const nextTierInfo = getTierInfo(nextTierKey);
      const pointsNeeded = nextTierInfo.minPoints - pointsData.totalEarned;
      const progressPercentage =
        (pointsData.totalEarned / nextTierInfo.minPoints) * 100;

      progressToNextTier = {
        nextTier: nextTierKey,
        pointsNeeded,
        progressPercentage: Math.min(progressPercentage, 100),
      };
    }

    res.json({
      success: true,
      data: {
        ...pointsData,
        statistics: {
          totalTransactions: stats.total_transactions || 0,
          totalEarned: stats.total_earned || 0,
          totalSpent: stats.total_spent || 0,
          lastTransaction: stats.last_transaction,
        },
        progressToNextTier,
      },
    });
  } catch (error) {
    console.error("Error fetching points stats:", error);
    res.status(500).json({
      error: "Failed to fetch points statistics",
      message: error.message,
    });
  }
});

module.exports = router;
