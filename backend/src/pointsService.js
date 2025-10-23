const { query } = require("./database");

/**
 * Points Service - Handles all points-related operations
 * Implements loyalty tier system and point calculations
 */

// Loyalty tier configuration
const LOYALTY_TIERS = {
  bronze: {
    minPoints: 0,
    maxPoints: 999,
    multiplier: 1.0,
    name: "Bronze",
    perks: ["Basic rewards", "Standard support"],
  },
  silver: {
    minPoints: 1000,
    maxPoints: 4999,
    multiplier: 1.25,
    name: "Silver",
    perks: ["1.25x points", "Priority support", "5% mint bonus"],
  },
  gold: {
    minPoints: 5000,
    maxPoints: 19999,
    multiplier: 1.5,
    name: "Gold",
    perks: ["1.5x points", "VIP support", "10% mint bonus", "Early access"],
  },
  platinum: {
    minPoints: 20000,
    maxPoints: Infinity,
    multiplier: 2.0,
    name: "Platinum",
    perks: [
      "2x points",
      "Dedicated support",
      "20% mint bonus",
      "Exclusive NFTs",
    ],
  },
};

/**
 * Calculate user's loyalty tier based on lifetime points
 */
function calculateLoyaltyTier(totalPointsEarned) {
  if (totalPointsEarned >= LOYALTY_TIERS.platinum.minPoints) return "platinum";
  if (totalPointsEarned >= LOYALTY_TIERS.gold.minPoints) return "gold";
  if (totalPointsEarned >= LOYALTY_TIERS.silver.minPoints) return "silver";
  return "bronze";
}

/**
 * Get tier multiplier for points calculation
 */
function getTierMultiplier(tier) {
  return LOYALTY_TIERS[tier]?.multiplier || 1.0;
}

/**
 * Get tier information
 */
function getTierInfo(tier) {
  return LOYALTY_TIERS[tier] || LOYALTY_TIERS.bronze;
}

/**
 * Calculate points to award based on purchase amount and user tier
 */
function calculatePointsToAward(purchaseAmount, userTier = "bronze") {
  const basePoints = Math.floor(purchaseAmount); // $1 = 1 point base
  const multiplier = getTierMultiplier(userTier);
  return Math.floor(basePoints * multiplier);
}

/**
 * Award points to a user
 */
async function awardPoints(
  userId,
  purchaseAmount,
  merchantId = null,
  receiptId = null,
  description = null
) {
  try {
    // Get user's current tier
    const userResult = await query(
      "SELECT loyalty_tier, total_points_earned FROM users WHERE id = ?",
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];
    const currentTier = user.loyalty_tier || "bronze";

    // Calculate points to award with tier multiplier
    const pointsToAward = calculatePointsToAward(purchaseAmount, currentTier);

    // Create points transaction record
    const transactionResult = await query(
      `INSERT INTO points_transactions 
       (user_id, merchant_id, receipt_id, amount, purchase_amount, transaction_type, status, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        merchantId,
        receiptId,
        pointsToAward,
        purchaseAmount,
        "purchase",
        "confirmed",
        description ||
          `Points earned from $${purchaseAmount.toFixed(2)} purchase`,
      ]
    );

    // Update user's points balance and total earned
    const newTotalEarned = (user.total_points_earned || 0) + pointsToAward;
    const newTier = calculateLoyaltyTier(newTotalEarned);

    await query(
      `UPDATE users 
       SET points_balance = points_balance + ?, 
           total_points_earned = ?,
           loyalty_tier = ?,
           last_purchase_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [pointsToAward, newTotalEarned, newTier, userId]
    );

    // Update merchant rewards tracking if merchant exists
    if (merchantId) {
      await query(
        `UPDATE merchant_rewards 
         SET total_points_distributed = total_points_distributed + ?,
             total_transactions = total_transactions + 1,
             last_award_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE merchant_id = ?`,
        [pointsToAward, merchantId]
      );

      // Create merchant_rewards record if it doesn't exist
      const merchantRewardsCheck = await query(
        "SELECT id FROM merchant_rewards WHERE merchant_id = ?",
        [merchantId]
      );

      if (
        !merchantRewardsCheck.rows ||
        merchantRewardsCheck.rows.length === 0
      ) {
        await query(
          `INSERT INTO merchant_rewards 
           (merchant_id, total_points_distributed, total_transactions, last_award_at) 
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [merchantId, pointsToAward, 1]
        );
      }
    }

    // Check if tier changed
    const tierChanged = newTier !== currentTier;

    return {
      success: true,
      pointsAwarded: pointsToAward,
      newBalance: (user.points_balance || 0) + pointsToAward,
      newTotalEarned,
      previousTier: currentTier,
      newTier,
      tierChanged,
      transactionId: transactionResult.lastID || transactionResult.rows[0]?.id,
    };
  } catch (error) {
    console.error("❌ Error awarding points:", error);
    throw error;
  }
}

/**
 * Get user's points balance and history
 */
async function getUserPoints(userId) {
  try {
    const userResult = await query(
      `SELECT points_balance, total_points_earned, loyalty_tier, last_purchase_date 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];
    const tier = user.loyalty_tier || "bronze";
    const tierInfo = getTierInfo(tier);

    return {
      balance: user.points_balance || 0,
      totalEarned: user.total_points_earned || 0,
      tier,
      tierInfo,
      lastPurchaseDate: user.last_purchase_date,
    };
  } catch (error) {
    console.error("❌ Error getting user points:", error);
    throw error;
  }
}

/**
 * Get user's points transaction history
 */
async function getPointsHistory(userId, limit = 50, offset = 0) {
  try {
    const result = await query(
      `SELECT pt.*, m.business_name as merchant_name
       FROM points_transactions pt
       LEFT JOIN merchants m ON pt.merchant_id = m.id
       WHERE pt.user_id = ?
       ORDER BY pt.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return result.rows || [];
  } catch (error) {
    console.error("❌ Error getting points history:", error);
    throw error;
  }
}

/**
 * Deduct points from user (for token minting)
 */
async function deductPoints(userId, pointsAmount, reason = "Token minting") {
  try {
    // Check if user has enough points
    const userResult = await query(
      "SELECT points_balance FROM users WHERE id = ?",
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const currentBalance = userResult.rows[0].points_balance || 0;

    if (currentBalance < pointsAmount) {
      throw new Error("Insufficient points balance");
    }

    // Create negative transaction record
    await query(
      `INSERT INTO points_transactions 
       (user_id, amount, transaction_type, status, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, -pointsAmount, "redemption", "confirmed", reason]
    );

    // Update user's balance
    await query(
      "UPDATE users SET points_balance = points_balance - ? WHERE id = ?",
      [pointsAmount, userId]
    );

    return {
      success: true,
      pointsDeducted: pointsAmount,
      newBalance: currentBalance - pointsAmount,
    };
  } catch (error) {
    console.error("❌ Error deducting points:", error);
    throw error;
  }
}

/**
 * Get merchant rewards statistics
 */
async function getMerchantRewards(merchantId) {
  try {
    const result = await query(
      `SELECT * FROM merchant_rewards WHERE merchant_id = ?`,
      [merchantId]
    );

    if (!result.rows || result.rows.length === 0) {
      return {
        totalPointsDistributed: 0,
        totalTransactions: 0,
        rewardRate: 1.0,
        isActive: true,
      };
    }

    return result.rows[0];
  } catch (error) {
    console.error("❌ Error getting merchant rewards:", error);
    throw error;
  }
}

/**
 * Validate points transaction (anti-fraud checks)
 */
async function validatePointsTransaction(userId, merchantId, purchaseAmount) {
  try {
    // Check for duplicate transactions in the last minute
    const recentTransactions = await query(
      `SELECT COUNT(*) as count FROM points_transactions 
       WHERE user_id = ? AND merchant_id = ? 
       AND created_at > datetime('now', '-1 minute')`,
      [userId, merchantId]
    );

    if (recentTransactions.rows[0]?.count > 0) {
      return {
        valid: false,
        reason: "Duplicate transaction detected within 1 minute",
      };
    }

    // Check for suspicious large purchases
    if (purchaseAmount > 10000) {
      return {
        valid: false,
        reason: "Purchase amount exceeds maximum limit",
      };
    }

    // Check daily transaction limit (max 50 transactions per day per user)
    const dailyTransactions = await query(
      `SELECT COUNT(*) as count FROM points_transactions 
       WHERE user_id = ? AND created_at > datetime('now', '-1 day')`,
      [userId]
    );

    if (dailyTransactions.rows[0]?.count >= 50) {
      return {
        valid: false,
        reason: "Daily transaction limit reached",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("❌ Error validating transaction:", error);
    return { valid: false, reason: "Validation error" };
  }
}

module.exports = {
  LOYALTY_TIERS,
  calculateLoyaltyTier,
  getTierMultiplier,
  getTierInfo,
  calculatePointsToAward,
  awardPoints,
  getUserPoints,
  getPointsHistory,
  deductPoints,
  getMerchantRewards,
  validatePointsTransaction,
};
