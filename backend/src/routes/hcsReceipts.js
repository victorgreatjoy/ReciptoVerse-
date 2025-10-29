const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../auth");
const {
  getHCSReceiptService,
} = require("../services/blockchain/hcsReceiptService");
const { query } = require("../database");

/**
 * HCS Receipt Routes - Blockchain anchoring and verification endpoints
 */

/**
 * POST /api/receipts/:id/anchor
 * Anchor a receipt to Hedera Consensus Service
 */
router.post("/:id/anchor", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify receipt belongs to user
    const receiptResult = await query(
      "SELECT * FROM receipts WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Receipt not found or access denied",
      });
    }

    const receipt = receiptResult.rows[0];

    // Check if already anchored
    if (receipt.hcs_topic_id && receipt.hcs_sequence) {
      return res.status(400).json({
        success: false,
        error: "Receipt already anchored to HCS",
        data: {
          hcsTopicId: receipt.hcs_topic_id,
          hcsSequence: receipt.hcs_sequence,
          hcsTimestamp: receipt.hcs_timestamp,
        },
      });
    }

    // Anchor to HCS
    const hcsService = getHCSReceiptService();
    const result = await hcsService.anchorReceipt(receipt);

    res.json({
      success: true,
      message: "Receipt successfully anchored to Hedera blockchain",
      data: result,
    });
  } catch (error) {
    console.error("Error anchoring receipt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to anchor receipt to blockchain",
      details: error.message,
    });
  }
});

/**
 * GET /api/receipts/:id/verify
 * Verify receipt integrity against HCS
 */
router.get("/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;

    const hcsService = getHCSReceiptService();
    const verification = await hcsService.verifyReceipt(id);

    res.json({
      success: verification.isValid,
      message: verification.isValid
        ? "Receipt verified successfully"
        : "Receipt verification failed",
      data: verification,
    });
  } catch (error) {
    console.error("Error verifying receipt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify receipt",
      details: error.message,
    });
  }
});

/**
 * GET /api/receipts/public/:id/verify
 * Public verification endpoint (no auth required)
 */
router.get("/public/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;

    const hcsService = getHCSReceiptService();
    const verification = await hcsService.verifyReceipt(id);

    res.json({
      success: verification.isValid,
      message: verification.isValid
        ? "Receipt verified successfully"
        : "Receipt verification failed",
      data: verification,
    });
  } catch (error) {
    console.error("Error verifying receipt (public):", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify receipt",
      details: error.message,
    });
  }
});

/**
 * GET /api/receipts/:id/proof
 * Get blockchain proof for third-party verification
 */
router.get("/:id/proof", async (req, res) => {
  try {
    const { id } = req.params;

    const hcsService = getHCSReceiptService();
    const proof = await hcsService.getReceiptProof(id);

    res.json({
      success: true,
      message: "Receipt proof retrieved successfully",
      data: proof,
    });
  } catch (error) {
    console.error("Error getting receipt proof:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get receipt proof",
      details: error.message,
    });
  }
});

/**
 * POST /api/receipts/bulk-anchor
 * Bulk anchor multiple receipts (admin only)
 */
router.post("/bulk-anchor", authenticateToken, async (req, res) => {
  try {
    const { receiptIds } = req.body;

    if (!Array.isArray(receiptIds) || receiptIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "receiptIds must be a non-empty array",
      });
    }

    // For now, allow user to bulk anchor their own receipts
    const userId = req.user.id;

    // Verify all receipts belong to user
    // Build dynamic IN clause for SQLite/Postgres compatibility
    const placeholders = receiptIds.map(() => "?").join(",");
    const receiptsResult = await query(
      `SELECT id FROM receipts WHERE id IN (${placeholders}) AND user_id = ?`,
      [...receiptIds, userId]
    );

    if (receiptsResult.rows.length !== receiptIds.length) {
      return res.status(403).json({
        success: false,
        error: "Some receipts do not belong to you or do not exist",
      });
    }

    const hcsService = getHCSReceiptService();
    const results = await hcsService.bulkAnchorReceipts(receiptIds);

    res.json({
      success: true,
      message: "Bulk anchoring completed",
      data: results,
    });
  } catch (error) {
    console.error("Error bulk anchoring receipts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk anchor receipts",
      details: error.message,
    });
  }
});

/**
 * GET /api/receipts/hcs/status
 * Get HCS service status
 */
router.get("/hcs/status", async (req, res) => {
  try {
    const hcsService = getHCSReceiptService();
    const dltGateway = hcsService.dltGateway;

    const status = {
      initialized: !!dltGateway.client,
      receiptTopicId: hcsService.receiptTopicId,
      network: dltGateway.getNetworkInfo(),
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error getting HCS status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get HCS status",
      details: error.message,
    });
  }
});

module.exports = router;
