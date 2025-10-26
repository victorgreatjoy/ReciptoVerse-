const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./auth");
const rewardsNFTService = require("./rewardsNFTService");

/**
 * GET /api/nft/types
 * Get all available NFT types (marketplace)
 */
router.get("/types", async (req, res) => {
  try {
    const { merchantId, animalType, tier, rarity, availableOnly } = req.query;

    const filters = {
      merchantId,
      animalType,
      tier: tier ? parseInt(tier) : undefined,
      rarity,
      availableOnly: availableOnly === "true",
    };

    const nftTypes = await rewardsNFTService.getAllNFTTypes(filters);

    res.json({
      success: true,
      count: nftTypes.length,
      nft_types: nftTypes,
    });
  } catch (error) {
    console.error("Error getting NFT types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get NFT types",
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/types/:id
 * Get specific NFT type details
 */
router.get("/types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const nftType = await rewardsNFTService.getNFTTypeById(id);

    if (!nftType) {
      return res.status(404).json({
        success: false,
        error: "NFT type not found",
      });
    }

    res.json({
      success: true,
      nft_type: nftType,
    });
  } catch (error) {
    console.error("Error getting NFT type:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get NFT type",
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/can-mint/:typeId
 * Check if authenticated user can mint a specific NFT
 */
router.get("/can-mint/:typeId", authenticateToken, async (req, res) => {
  try {
    const { typeId } = req.params;
    const userId = req.user.id;

    const canMint = await rewardsNFTService.checkUserCanMint(userId, typeId);

    res.json({
      success: true,
      ...canMint,
    });
  } catch (error) {
    console.error("Error checking mint eligibility:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check mint eligibility",
      message: error.message,
    });
  }
});

/**
 * POST /api/nft/mint
 * Mint an NFT for authenticated user
 * Body: { nftTypeId: string }
 */
router.post("/mint", authenticateToken, async (req, res) => {
  try {
    const { nftTypeId } = req.body;
    const userId = req.user.id;

    if (!nftTypeId) {
      return res.status(400).json({
        success: false,
        error: "NFT type ID is required",
      });
    }

    const result = await rewardsNFTService.mintNFTForUser(userId, nftTypeId);

    res.json({
      success: true,
      message: `Successfully minted ${result.nft.name}!`,
      ...result,
    });
  } catch (error) {
    console.error("Error minting NFT:", error);
    res.status(400).json({
      success: false,
      error: "Failed to mint NFT",
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/my-collection
 * Get authenticated user's NFT collection
 */
router.get("/my-collection", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const collection = await rewardsNFTService.getUserNFTCollection(userId);

    res.json({
      success: true,
      count: collection.length,
      collection: collection,
    });
  } catch (error) {
    console.error("Error getting NFT collection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get NFT collection",
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/benefits
 * Get authenticated user's active NFT benefits
 */
router.get("/benefits", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const benefits = await rewardsNFTService.getUserActiveNFTBenefits(userId);

    res.json({
      success: true,
      ...benefits,
    });
  } catch (error) {
    console.error("Error getting NFT benefits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get NFT benefits",
      message: error.message,
    });
  }
});

/**
 * POST /api/nft/claim-monthly-bonus
 * Claim monthly bonus points from an NFT
 * Body: { nftMintId: string }
 */
router.post("/claim-monthly-bonus", authenticateToken, async (req, res) => {
  try {
    const { nftMintId } = req.body;
    const userId = req.user.id;

    if (!nftMintId) {
      return res.status(400).json({
        success: false,
        error: "NFT mint ID is required",
      });
    }

    const result = await rewardsNFTService.claimMonthlyBonus(userId, nftMintId);

    res.json({
      success: true,
      message: `Successfully claimed ${result.points_awarded} bonus points!`,
      ...result,
    });
  } catch (error) {
    console.error("Error claiming monthly bonus:", error);
    res.status(400).json({
      success: false,
      error: "Failed to claim monthly bonus",
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/discount
 * Get authenticated user's current NFT discount percentage
 */
router.get("/discount", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const discount = await rewardsNFTService.calculateUserNFTDiscount(userId);

    res.json({
      success: true,
      discount_percentage: discount,
      has_discount: discount > 0,
    });
  } catch (error) {
    console.error("Error calculating discount:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate discount",
      message: error.message,
    });
  }
});

module.exports = router;
