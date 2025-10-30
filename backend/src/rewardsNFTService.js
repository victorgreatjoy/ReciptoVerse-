const { query } = require("./database");
const htsPaymentService = require("./services/htsPaymentService");
const { v4: uuidv4 } = require("uuid");
const hederaRewardNFTService = require("./hederaRewardNFTService");

/**
 * Rewards NFT Service - Business logic for NFT rewards operations
 * This handles the point-based NFT system (Bronze Rabbit, Silver Fox, Gold Eagle)
 */

/**
 * Get all NFT types (optionally filtered)
 */
async function getAllNFTTypes(filters = {}) {
  try {
    let sql = `
      SELECT 
        id, merchant_id, name, description, animal_type, tier, 
        point_cost, rarity, image_url, image_ipfs_hash, 
        benefits, discount_percentage, monthly_bonus_points,
        max_supply, current_supply, metadata_template, is_active,
        created_at, updated_at
      FROM nft_types
      WHERE is_active = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by merchant
    if (filters.merchantId) {
      sql += ` AND (merchant_id = $${paramIndex} OR merchant_id IS NULL)`;
      params.push(filters.merchantId);
      paramIndex++;
    }

    // Filter by animal type
    if (filters.animalType) {
      sql += ` AND animal_type = $${paramIndex}`;
      params.push(filters.animalType);
      paramIndex++;
    }

    // Filter by tier
    if (filters.tier) {
      sql += ` AND tier = $${paramIndex}`;
      params.push(filters.tier);
      paramIndex++;
    }

    // Filter by rarity
    if (filters.rarity) {
      sql += ` AND rarity = $${paramIndex}`;
      params.push(filters.rarity);
      paramIndex++;
    }

    // Check availability (not sold out)
    if (filters.availableOnly) {
      sql += ` AND (max_supply = -1 OR current_supply < max_supply)`;
    }

    sql += ` ORDER BY tier ASC, point_cost ASC`;

    const result = await query(sql, params);

    // Parse JSON fields for SQLite
    return result.rows.map((nft) => ({
      ...nft,
      benefits:
        typeof nft.benefits === "string"
          ? JSON.parse(nft.benefits)
          : nft.benefits,
      metadata_template:
        typeof nft.metadata_template === "string"
          ? JSON.parse(nft.metadata_template)
          : nft.metadata_template,
      discount_percentage: parseFloat(nft.discount_percentage),
      current_supply: parseInt(nft.current_supply),
      max_supply: parseInt(nft.max_supply),
      monthly_bonus_points: parseInt(nft.monthly_bonus_points),
      is_available:
        nft.max_supply === -1 || nft.current_supply < nft.max_supply,
    }));
  } catch (error) {
    console.error("Error getting NFT types:", error);
    throw error;
  }
}

/**
 * Get specific NFT type by ID
 */
async function getNFTTypeById(nftTypeId) {
  try {
    const sql = `
      SELECT 
        id, merchant_id, name, description, animal_type, tier, 
        point_cost, rarity, image_url, image_ipfs_hash, 
        benefits, discount_percentage, monthly_bonus_points,
        max_supply, current_supply, metadata_template, is_active,
        created_at, updated_at
      FROM nft_types
      WHERE id = $1
    `;

    const result = await query(sql, [nftTypeId]);

    if (result.rows.length === 0) {
      return null;
    }

    const nft = result.rows[0];
    return {
      ...nft,
      benefits:
        typeof nft.benefits === "string"
          ? JSON.parse(nft.benefits)
          : nft.benefits,
      metadata_template:
        typeof nft.metadata_template === "string"
          ? JSON.parse(nft.metadata_template)
          : nft.metadata_template,
      discount_percentage: parseFloat(nft.discount_percentage),
      current_supply: parseInt(nft.current_supply),
      max_supply: parseInt(nft.max_supply),
      monthly_bonus_points: parseInt(nft.monthly_bonus_points),
      is_available:
        nft.max_supply === -1 || nft.current_supply < nft.max_supply,
    };
  } catch (error) {
    console.error("Error getting NFT type:", error);
    throw error;
  }
}

/**
 * Check if user can afford to mint an NFT
 */
async function checkUserCanMint(userId, nftTypeId) {
  try {
    // Get user's Hedera account and RVP token info
    const userResult = await query(
      "SELECT hedera_account_id, hts_account_id, hts_token_associated FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { canMint: false, reason: "User not found" };
    }

    const userAccountId =
      userResult.rows[0].hedera_account_id || userResult.rows[0].hts_account_id;
    const tokenAssociated = userResult.rows[0].hts_token_associated;

    // Check if user has connected wallet
    if (!userAccountId) {
      return {
        canMint: false,
        reason:
          "Please connect your Hedera wallet first. Click the wallet icon in the top navigation.",
      };
    }

    // Get NFT type details
    const nftType = await getNFTTypeById(nftTypeId);

    if (!nftType) {
      return { canMint: false, reason: "NFT type not found" };
    }

    if (!nftType.is_active) {
      return { canMint: false, reason: "NFT type is not active" };
    }

    if (!nftType.is_available) {
      return { canMint: false, reason: "NFT is sold out" };
    }

    // Check RVP token balance on Hedera (blockchain only - no database fallback)
    let rvpBalance = 0;
    
    try {
      rvpBalance = await htsPaymentService.getUserRVPBalance(userAccountId);
    } catch (error) {
      console.error("Error getting RVP balance:", error);
      return {
        canMint: false,
        reason:
          "Unable to check RVP token balance. Please ensure your wallet is connected and associated with the RVP token. Use the 'Sync Points' button to convert database points to RVP tokens.",
      };
    }

    if (rvpBalance < nftType.point_cost) {
      return {
        canMint: false,
        reason: "Insufficient RVP tokens",
        userRVP: rvpBalance,
        required: nftType.point_cost,
        shortfall: nftType.point_cost - rvpBalance,
        message: `You need ${
          nftType.point_cost
        } RVP but only have ${rvpBalance} RVP. Earn ${
          nftType.point_cost - rvpBalance
        } more RVP by making purchases!`,
      };
    }

    return {
      canMint: true,
      userRVP: rvpBalance,
      nftCost: nftType.point_cost,
      remainingRVP: rvpBalance - nftType.point_cost,
    };
  } catch (error) {
    console.error("Error checking if user can mint:", error);
    throw error;
  }
}

/**
 * Mint an NFT for a user
 */
async function mintNFTForUser(userId, nftTypeId) {
  try {
    // First check if user can mint
    const canMint = await checkUserCanMint(userId, nftTypeId);

    if (!canMint.canMint) {
      throw new Error(canMint.reason);
    }

    // Get user's Hedera account ID and HTS info
    const userResult = await query(
      "SELECT hedera_account_id, hts_account_id, hts_token_associated FROM users WHERE id = $1",
      [userId]
    );

    console.log("🔍 User query result:", {
      userId,
      rowsFound: userResult.rows.length,
      accountId: userResult.rows[0]?.hedera_account_id,
      htsAccountId: userResult.rows[0]?.hts_account_id,
      tokenAssociated: userResult.rows[0]?.hts_token_associated,
    });

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const userAccountId =
      userResult.rows[0].hedera_account_id || userResult.rows[0].hts_account_id;

    console.log("🔍 Hedera account ID:", userAccountId);

    if (!userAccountId) {
      throw new Error(
        "Please connect your Hedera wallet first to mint NFTs. Click the wallet icon in the top navigation to connect."
      );
    }

    // Get NFT type details
    const nftType = await getNFTTypeById(nftTypeId);

    console.log(`🎨 Starting NFT mint for user ${userId}...`);
    console.log(`   NFT: ${nftType.name}`);
    console.log(`   Cost: ${nftType.point_cost} RVP tokens`);
    console.log(`   User wallet: ${userAccountId}`);

    // Start transaction-like operations
    // 1. Process RVP token payment (validate balance on Hedera blockchain)
    console.log(`💳 Validating RVP token payment...`);
    
    const paymentResult = await htsPaymentService.processRVPPayment(
      userAccountId,
      nftType.point_cost,
      `NFT Purchase: ${nftType.name}`
    );
    
    console.log(`✅ RVP payment validated: ${paymentResult.message}`);
    console.log(`   User RVP balance: ${paymentResult.userBalance}`);
    console.log(
      `   Remaining after purchase: ${paymentResult.remainingBalance}`
    );

    // 2. Mint NFT on Hedera blockchain
    console.log("🔗 Minting NFT on Hedera...");
    const hederaMintResult = await hederaRewardNFTService.mintRewardNFT(
      nftType,
      userAccountId,
      nftType.point_cost,
      userId // Pass userId to fetch HCS proof
    );

    if (!hederaMintResult.success) {
      // No rollback needed for RVP tokens - payment was only validated, not transferred
      throw new Error(`Hedera mint failed: ${hederaMintResult.error}`);
    }

    console.log(`✅ NFT minted on Hedera: ${hederaMintResult.tokenId}`);

    // 3. Create NFT mint record in database
    const mintId = uuidv4();
    const benefitsExpiry = new Date();
    benefitsExpiry.setMonth(benefitsExpiry.getMonth() + 12); // Benefits active for 1 year

    const insertMintSQL = `
      INSERT INTO user_nft_mints (
        id, user_id, nft_type_id, merchant_id, points_spent,
        nft_token_id, serial_number, metadata_url,
        benefits_active, benefits_expiry, minted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await query(insertMintSQL, [
      mintId,
      userId,
      nftTypeId,
      nftType.merchant_id,
      nftType.point_cost,
      hederaMintResult.tokenId,
      hederaMintResult.serialNumber,
      hederaMintResult.metadataUrl,
      true,
      benefitsExpiry.toISOString(),
      new Date().toISOString(),
    ]);

    console.log(`✅ NFT mint record saved to database`);

    // 4. Increment current supply
    await query(
      "UPDATE nft_types SET current_supply = current_supply + 1 WHERE id = $1",
      [nftTypeId]
    );

    // 5. Record RVP token transaction
    const transactionId = uuidv4();
    const insertTransactionSQL = `
      INSERT INTO points_transactions (
        id, user_id, transaction_type, amount, description, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await query(insertTransactionSQL, [
      transactionId,
      userId,
      "nft_purchase_rvp",
      -nftType.point_cost,
      `Purchased ${nftType.name} with ${nftType.point_cost} RVP tokens`,
      new Date().toISOString(),
    ]);

    console.log(`✅ RVP transaction recorded`);

    // Get the newly minted NFT details
    const mintedNFT = await getUserNFTMintById(mintId);

    console.log(`🎉 NFT mint complete!`);
    console.log(`   Token ID: ${hederaMintResult.tokenId}`);
    console.log(`   HashScan: ${hederaMintResult.hashscanUrl}`);
    console.log(
      `   Transferred: ${
        hederaMintResult.transferred
          ? "Yes"
          : "No (user needs to associate token)"
      }`
    );

    return {
      success: true,
      nft: mintedNFT,
      pointsSpent: nftType.point_cost,
      remainingPoints: canMint.remainingPoints,
      hedera: {
        tokenId: hederaMintResult.tokenId,
        serialNumber: hederaMintResult.serialNumber,
        collectionId: hederaMintResult.collectionId,
        hashscanUrl: hederaMintResult.hashscanUrl,
        transferred: hederaMintResult.transferred,
        metadataUrl: hederaMintResult.metadataUrl,
      },
    };
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
}

/**
 * Get user's NFT collection
 */
async function getUserNFTCollection(userId) {
  try {
    const sql = `
      SELECT 
        m.id, m.user_id, m.nft_type_id, m.merchant_id,
        m.nft_token_id, m.serial_number, m.points_spent,
        m.metadata_url, m.benefits_active, m.benefits_expiry,
        m.last_benefit_claim, m.minted_at,
        t.name, t.description, t.animal_type, t.tier, t.rarity,
        t.image_url, t.image_ipfs_hash, t.benefits,
        t.discount_percentage, t.monthly_bonus_points,
        t.metadata_template
      FROM user_nft_mints m
      JOIN nft_types t ON m.nft_type_id = t.id
      WHERE m.user_id = $1
      ORDER BY m.minted_at DESC
    `;

    const result = await query(sql, [userId]);

    return result.rows.map((nft) => ({
      ...nft,
      hedera_token_id: nft.nft_token_id, // Add alias for frontend compatibility
      benefits:
        typeof nft.benefits === "string"
          ? JSON.parse(nft.benefits)
          : nft.benefits,
      metadata_template:
        typeof nft.metadata_template === "string"
          ? JSON.parse(nft.metadata_template)
          : nft.metadata_template,
      discount_percentage: parseFloat(nft.discount_percentage),
      monthly_bonus_points: parseInt(nft.monthly_bonus_points),
      benefits_active: Boolean(nft.benefits_active),
      can_claim_monthly:
        nft.monthly_bonus_points > 0 &&
        canClaimMonthlyBonus(nft.last_benefit_claim),
    }));
  } catch (error) {
    console.error("Error getting user NFT collection:", error);
    throw error;
  }
}

/**
 * Get single NFT mint by ID
 */
async function getUserNFTMintById(mintId) {
  try {
    const sql = `
      SELECT 
        m.id, m.user_id, m.nft_type_id, m.merchant_id,
        m.nft_token_id, m.serial_number, m.points_spent,
        m.metadata_url, m.benefits_active, m.benefits_expiry,
        m.last_benefit_claim, m.minted_at,
        t.name, t.description, t.animal_type, t.tier, t.rarity,
        t.image_url, t.image_ipfs_hash, t.benefits,
        t.discount_percentage, t.monthly_bonus_points,
        t.metadata_template
      FROM user_nft_mints m
      JOIN nft_types t ON m.nft_type_id = t.id
      WHERE m.id = $1
    `;

    const result = await query(sql, [mintId]);

    if (result.rows.length === 0) {
      return null;
    }

    const nft = result.rows[0];
    return {
      ...nft,
      benefits:
        typeof nft.benefits === "string"
          ? JSON.parse(nft.benefits)
          : nft.benefits,
      metadata_template:
        typeof nft.metadata_template === "string"
          ? JSON.parse(nft.metadata_template)
          : nft.metadata_template,
      discount_percentage: parseFloat(nft.discount_percentage),
      monthly_bonus_points: parseInt(nft.monthly_bonus_points),
      benefits_active: Boolean(nft.benefits_active),
    };
  } catch (error) {
    console.error("Error getting NFT mint:", error);
    throw error;
  }
}

/**
 * Get user's active NFT benefits
 */
async function getUserActiveNFTBenefits(userId) {
  try {
    const sql = `
      SELECT 
        m.id, m.nft_type_id, m.benefits_active, m.benefits_expiry,
        m.last_benefit_claim, m.minted_at,
        t.name, t.animal_type, t.tier, t.discount_percentage,
        t.monthly_bonus_points, t.benefits, t.image_url
      FROM user_nft_mints m
      JOIN nft_types t ON m.nft_type_id = t.id
      WHERE m.user_id = $1 
        AND m.benefits_active = TRUE
        AND (m.benefits_expiry IS NULL OR m.benefits_expiry > $2)
      ORDER BY t.tier DESC, t.discount_percentage DESC
    `;

    const result = await query(sql, [userId, new Date().toISOString()]);

    // Calculate total discount (take the highest)
    let maxDiscount = 0;
    let totalMonthlyBonus = 0;
    const activeNFTs = [];

    result.rows.forEach((nft) => {
      const discount = parseFloat(nft.discount_percentage) || 0;
      const monthlyBonus = parseInt(nft.monthly_bonus_points) || 0;

      if (discount > maxDiscount) {
        maxDiscount = discount;
      }

      totalMonthlyBonus += monthlyBonus;

      activeNFTs.push({
        id: nft.id,
        name: nft.name,
        animal_type: nft.animal_type,
        tier: nft.tier,
        discount_percentage: discount,
        monthly_bonus_points: monthlyBonus,
        benefits:
          typeof nft.benefits === "string"
            ? JSON.parse(nft.benefits)
            : nft.benefits,
        image_url: nft.image_url,
        can_claim_monthly:
          monthlyBonus > 0 && canClaimMonthlyBonus(nft.last_benefit_claim),
        last_claim: nft.last_benefit_claim,
      });
    });

    return {
      active_nfts: activeNFTs,
      total_discount: maxDiscount, // Only the highest discount applies
      total_monthly_bonus: totalMonthlyBonus,
      benefits_count: activeNFTs.length,
    };
  } catch (error) {
    console.error("Error getting active NFT benefits:", error);
    throw error;
  }
}

/**
 * Check if user can claim monthly bonus (30 days since last claim)
 */
function canClaimMonthlyBonus(lastClaimDate) {
  if (!lastClaimDate) return true;

  const lastClaim = new Date(lastClaimDate);
  const now = new Date();
  const daysSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60 * 24);

  return daysSinceLastClaim >= 30;
}

/**
 * Claim monthly bonus points from an NFT
 */
async function claimMonthlyBonus(userId, nftMintId) {
  try {
    // Get the NFT mint
    const nft = await getUserNFTMintById(nftMintId);

    if (!nft) {
      throw new Error("NFT not found");
    }

    if (nft.user_id !== userId) {
      throw new Error("You don't own this NFT");
    }

    if (!nft.benefits_active) {
      throw new Error("NFT benefits are not active");
    }

    if (nft.monthly_bonus_points <= 0) {
      throw new Error("This NFT has no monthly bonus");
    }

    if (!canClaimMonthlyBonus(nft.last_benefit_claim)) {
      const lastClaim = new Date(nft.last_benefit_claim);
      const nextClaim = new Date(lastClaim);
      nextClaim.setDate(nextClaim.getDate() + 30);

      throw new Error(
        `You can claim again on ${nextClaim.toLocaleDateString()}`
      );
    }

    // Award points to user
    await query(
      "UPDATE users SET points_balance = points_balance + $1 WHERE id = $2",
      [nft.monthly_bonus_points, userId]
    );

    // Update last claim timestamp
    await query(
      "UPDATE user_nft_mints SET last_benefit_claim = $1 WHERE id = $2",
      [new Date().toISOString(), nftMintId]
    );

    // Record the redemption
    const redemptionId = uuidv4();
    await query(
      `INSERT INTO nft_benefit_redemptions 
       (id, user_id, nft_mint_id, benefit_type, benefit_value, points_awarded, redeemed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        redemptionId,
        userId,
        nftMintId,
        "monthly_bonus",
        nft.monthly_bonus_points.toString(),
        nft.monthly_bonus_points,
        new Date().toISOString(),
      ]
    );

    // Record points transaction
    const transactionId = uuidv4();
    await query(
      `INSERT INTO points_transactions 
       (id, user_id, transaction_type, amount, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        transactionId,
        userId,
        "nft_monthly_bonus",
        nft.monthly_bonus_points,
        `Monthly bonus from ${nft.name}`,
        new Date().toISOString(),
      ]
    );

    // Get updated user points
    const userResult = await query(
      "SELECT points_balance FROM users WHERE id = $1",
      [userId]
    );

    return {
      success: true,
      points_awarded: nft.monthly_bonus_points,
      new_balance: parseInt(userResult.rows[0].points_balance),
      next_claim_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error("Error claiming monthly bonus:", error);
    throw error;
  }
}

/**
 * Calculate discount for user based on their NFTs (for checkout)
 */
async function calculateUserNFTDiscount(userId) {
  try {
    const benefits = await getUserActiveNFTBenefits(userId);
    return benefits.total_discount; // Returns the highest discount percentage
  } catch (error) {
    console.error("Error calculating NFT discount:", error);
    return 0;
  }
}

module.exports = {
  getAllNFTTypes,
  getNFTTypeById,
  checkUserCanMint,
  mintNFTForUser,
  getUserNFTCollection,
  getUserNFTMintById,
  getUserActiveNFTBenefits,
  claimMonthlyBonus,
  calculateUserNFTDiscount,
  canClaimMonthlyBonus,
};
