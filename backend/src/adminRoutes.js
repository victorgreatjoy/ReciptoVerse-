const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("./database");
const router = express.Router();

const ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production";

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Admin token required" });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);

    // Handle hardcoded admin
    if (decoded.userId === "admin" && decoded.username === "admin") {
      req.admin = decoded;
      return next();
    }

    // Try to verify user in database (fallback for when DB is updated)
    try {
      const user = await query("SELECT * FROM users WHERE id = ?", [
        decoded.userId,
      ]);

      if (user.length === 0) {
        return res.status(403).json({ error: "Admin access revoked" });
      }

      req.admin = { ...decoded, user: user[0] };
      next();
    } catch (dbError) {
      // If database check fails, allow hardcoded admin
      if (decoded.role === "admin") {
        req.admin = decoded;
        next();
      } else {
        return res.status(403).json({ error: "Admin access denied" });
      }
    }
  } catch (error) {
    return res.status(401).json({ error: "Invalid admin token" });
  }
};

// Admin login with hardcoded credentials for now
router.post("/auth", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded admin credentials for testing
    if (username === "admin" && password === "admin") {
      const token = jwt.sign(
        {
          userId: "admin",
          username: "admin",
          role: "admin",
          isAdmin: true,
          timestamp: Date.now(),
        },
        ADMIN_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        token,
        message: "Admin authenticated successfully",
      });
    }

    // Try to find user in database (fallback for when DB is updated)
    try {
      const users = await query(
        "SELECT * FROM users WHERE (handle = ? OR email = ?)",
        [username, username]
      );

      if (users.length > 0) {
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (isValid && user.handle === "leandromirante") {
          const token = jwt.sign(
            {
              userId: user.id,
              username: user.handle,
              role: "admin",
              isAdmin: true,
              timestamp: Date.now(),
            },
            ADMIN_SECRET,
            { expiresIn: "24h" }
          );

          return res.json({
            success: true,
            token,
            message: "Admin authenticated successfully",
          });
        }
      }
    } catch (dbError) {
      console.log("Database admin check failed, using hardcoded only");
    }

    return res.status(401).json({ error: "Invalid admin credentials" });
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Get all users with stats
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id,
        u.display_name,
        u.email,
        u.handle,
        u.created_at,
        0 as is_admin,
        'none' as admin_status,
        COUNT(DISTINCT r.id) as receipt_count,
        COUNT(DISTINCT CASE WHEN r.nft_token_id IS NOT NULL THEN r.id END) as nft_count,
        COALESCE(SUM(r.amount), 0) as total_spent
      FROM users u
      LEFT JOIN receipts r ON u.id = r.user_id
      GROUP BY u.id, u.display_name, u.email, u.handle, u.created_at
      ORDER BY u.created_at DESC
    `);

    const users = result.rows || [];

    res.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    // Fallback query without admin columns for older databases
    try {
      const result = await query(`
        SELECT 
          u.id,
          u.display_name,
          u.email,
          u.handle,
          u.created_at,
          0 as is_admin,
          'none' as admin_status,
          COUNT(DISTINCT r.id) as receipt_count,
          COUNT(DISTINCT CASE WHEN r.nft_token_id IS NOT NULL THEN r.id END) as nft_count,
          COALESCE(SUM(r.amount), 0) as total_spent
        FROM users u
        LEFT JOIN receipts r ON u.id = r.user_id
        GROUP BY u.id, u.display_name, u.email, u.handle, u.created_at
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        users: result.rows || [],
        count: (result.rows || []).length,
      });
    } catch (fallbackError) {
      console.error("Fallback query failed:", fallbackError);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
});

// Get all merchants with stats
router.get("/merchants", authenticateAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        m.*,
        COUNT(DISTINCT r.id) as receipt_count,
        COALESCE(SUM(r.amount), 0) as total_revenue
      FROM merchants m
      LEFT JOIN receipts r ON m.id = r.merchant_id
      GROUP BY m.id, m.business_name, m.email, m.status, m.created_at
      ORDER BY m.created_at DESC
    `);

    const merchants = result.rows || [];

    res.json({
      success: true,
      merchants,
      count: merchants.length,
    });
  } catch (error) {
    console.error("Error fetching merchants:", error);
    res.status(500).json({ error: "Failed to fetch merchants" });
  }
});

// Update merchant status (legacy route - now using action-based routes)
router.put("/merchants/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await query(
      "UPDATE merchants SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    res.json({
      success: true,
      message: `Merchant ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating merchant status:", error);
    res.status(500).json({ error: "Failed to update merchant status" });
  }
});

// Get system statistics
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM merchants) as totalMerchants,
        (SELECT COUNT(*) FROM merchants WHERE status = 'approved') as activeMerchants,
        (SELECT COUNT(*) FROM receipts) as totalReceipts,
        (SELECT COUNT(*) FROM receipts WHERE nft_token_id IS NOT NULL) as totalNfts,
        (SELECT COALESCE(SUM(amount), 0) FROM receipts) as totalRevenue
    `);

    const stats = (result.rows && result.rows[0]) || {
      totalUsers: 0,
      totalMerchants: 0,
      activeMerchants: 0,
      totalReceipts: 0,
      totalNfts: 0,
      totalRevenue: 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// NFT Settings Management
let nftSettings = {
  threshold: 10.0,
  enabled: true,
  autoMint: false,
};

// Get NFT settings
router.get("/nft-settings", authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    settings: nftSettings,
  });
});

// Update NFT settings
router.put("/nft-settings", authenticateAdmin, (req, res) => {
  try {
    const { settings } = req.body;

    // Validate settings
    if (typeof settings.threshold !== "number" || settings.threshold < 0) {
      return res.status(400).json({ error: "Invalid threshold value" });
    }

    if (typeof settings.enabled !== "boolean") {
      return res.status(400).json({ error: "Invalid enabled value" });
    }

    if (typeof settings.autoMint !== "boolean") {
      return res.status(400).json({ error: "Invalid autoMint value" });
    }

    nftSettings = { ...settings };

    console.log("📝 NFT Settings updated:", nftSettings);

    res.json({
      success: true,
      settings: nftSettings,
      message: "NFT settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating NFT settings:", error);
    res.status(500).json({ error: "Failed to update NFT settings" });
  }
});

// ===== ADMIN PRIVILEGE MANAGEMENT =====

// Get all admin requests and current admins
router.get("/admin-requests", authenticateAdmin, async (req, res) => {
  try {
    let pendingRequests = [];
    let currentAdmins = [];

    // Try to get admin requests (gracefully handle missing columns)
    try {
      pendingRequests = await query(
        "SELECT id, handle, display_name, email, admin_requested_at FROM users WHERE admin_status = 'pending' ORDER BY admin_requested_at DESC"
      );
    } catch (dbError) {
      console.log("Admin columns not found, returning empty requests");
      pendingRequests = [];
    }

    // Try to get current admins (gracefully handle missing columns)
    try {
      currentAdmins = await query(
        "SELECT id, handle, display_name, email, admin_approved_at, admin_approved_by FROM users WHERE is_admin = 1 AND admin_status = 'approved' ORDER BY admin_approved_at DESC"
      );
    } catch (dbError) {
      console.log("Admin columns not found, showing hardcoded admin");
      currentAdmins = [
        {
          id: "admin",
          handle: "admin",
          display_name: "System Admin",
          email: "admin@reciptoverse.com",
          admin_approved_at: new Date().toISOString(),
          admin_approved_by: "system",
        },
      ];
    }

    res.json({
      success: true,
      pendingRequests,
      currentAdmins,
    });
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    res.status(500).json({ error: "Failed to fetch admin requests" });
  }
});

// Request admin privileges (for users) - DISABLED until database migration
router.post("/request-admin", async (req, res) => {
  res.status(501).json({
    error:
      "Admin privilege requests not available yet - database migration required",
  });
});

// Admin privilege management - DISABLED until database migration
router.post("/approve-admin/:userId", authenticateAdmin, async (req, res) => {
  res
    .status(501)
    .json({
      error:
        "Admin privilege management not available - database migration required",
    });
});

router.post("/reject-admin/:userId", authenticateAdmin, async (req, res) => {
  res
    .status(501)
    .json({
      error:
        "Admin privilege management not available - database migration required",
    });
});

router.post("/revoke-admin/:userId", authenticateAdmin, async (req, res) => {
  res
    .status(501)
    .json({
      error:
        "Admin privilege management not available - database migration required",
    });
});

// Get current NFT settings (for use by other modules)
const getNftSettings = () => nftSettings;

// Check if receipt meets NFT minting criteria
const shouldMintNft = (receiptAmount) => {
  return (
    nftSettings.enabled &&
    nftSettings.autoMint &&
    parseFloat(receiptAmount) >= nftSettings.threshold
  );
};

// Export functions for use in other modules
module.exports = {
  router,
  getNftSettings,
  shouldMintNft,
};
