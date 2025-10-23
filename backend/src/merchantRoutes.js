const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { query } = require("./database");
const { authenticateToken } = require("./auth");
const notificationService = require("./notificationService");
const { NFTService } = require("./nftService");
const { shouldMintNft, getNftSettings } = require("./adminRoutes");
const { awardPoints, validatePointsTransaction } = require("./pointsService");

const router = express.Router();

// Middleware to authenticate merchant API key
const authenticateMerchant = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({
        error: "API key required",
        message: "Please provide your merchant API key",
      });
    }

    const result = await query(
      "SELECT id, business_name, status, terminal_id, receipt_limit, receipts_processed FROM merchants WHERE api_key = ?",
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "API key not found",
      });
    }

    const merchant = result.rows[0];

    if (merchant.status !== "approved") {
      return res.status(403).json({
        error: "Merchant not approved",
        message: `Your merchant account status is: ${merchant.status}`,
      });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    console.error("Merchant authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Generate unique terminal ID and API key
const generateMerchantCredentials = (businessName) => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex");
  const businessCode = businessName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 6)
    .toUpperCase();

  const terminalId = `${businessCode}-${timestamp}-${random}`.substring(0, 20);
  const apiKey = `rpto_${crypto.randomBytes(24).toString("hex")}`;

  return { terminalId, apiKey };
};

// Register new merchant
router.post("/register", async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country = "US",
      taxId,
      websiteUrl,
      contactPerson,
      subscriptionPlan = "basic",
    } = req.body;

    // Get user ID if authenticated
    const token = req.headers.authorization?.split(" ")[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        userId = decoded.userId;
      } catch (err) {
        console.log("Token verification failed, proceeding without user link");
      }
    }

    // Validate required fields
    if (!businessName || !businessType || !email || !contactPerson) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Business name, type, email, and contact person are required",
      });
    }

    // Check if merchant already exists for this user
    if (userId) {
      const existingUserMerchant = await query(
        "SELECT id FROM merchants WHERE user_id = ?",
        [userId]
      );

      if (existingUserMerchant.rows.length > 0) {
        return res.status(409).json({
          error: "Merchant already exists",
          message: "You already have a merchant application submitted",
        });
      }
    }

    // Check if merchant already exists with email
    const existingMerchant = await query(
      "SELECT id FROM merchants WHERE email = ?",
      [email]
    );

    if (existingMerchant.rows.length > 0) {
      return res.status(409).json({
        error: "Merchant already exists",
        message: "A merchant with this email is already registered",
      });
    }

    // Generate credentials
    const { terminalId, apiKey } = generateMerchantCredentials(businessName);

    // Insert new merchant with user_id
    const result = await query(
      `
      INSERT INTO merchants (
        business_name, business_type, email, phone, address, city, state, 
        postal_code, country, tax_id, website_url, contact_person, 
        api_key, terminal_id, subscription_plan, status, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      ${query.pool ? "RETURNING id, business_name, terminal_id, status" : ""}
    `,
      [
        businessName,
        businessType,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        taxId,
        websiteUrl,
        contactPerson,
        apiKey,
        terminalId,
        subscriptionPlan,
        userId,
      ]
    );

    let merchantData;
    if (query.pool) {
      merchantData = result.rows[0];
    } else {
      // SQLite - get the inserted merchant
      const insertedMerchant = await query(
        "SELECT id, business_name, terminal_id, status FROM merchants WHERE api_key = ?",
        [apiKey]
      );
      merchantData = insertedMerchant.rows[0];
    }

    res.status(201).json({
      message: "Merchant registration submitted successfully",
      merchant: {
        id: merchantData.id,
        businessName: merchantData.business_name,
        terminalId: merchantData.terminal_id,
        status: merchantData.status,
        apiKey: apiKey, // Only returned once during registration
      },
      instructions: [
        "Your merchant account is pending approval",
        "You will receive an email notification once approved",
        "Keep your API key secure - it will not be shown again",
        "Use your Terminal ID for POS integration",
      ],
    });
  } catch (error) {
    console.error("Merchant registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      message: "Unable to process merchant registration",
    });
  }
});

// Get merchant status for logged-in user
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      "SELECT status, business_name, created_at FROM merchants WHERE user_id = ?",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: null,
        message: "No merchant application found",
      });
    }

    const merchant = result.rows[0];
    res.json({
      status: merchant.status,
      businessName: merchant.business_name,
      appliedAt: merchant.created_at,
    });
  } catch (error) {
    console.error("Error fetching merchant status:", error);
    res.status(500).json({ error: "Failed to fetch merchant status" });
  }
});

// Get merchant profile
router.get("/profile", authenticateMerchant, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        id, business_name, business_type, email, phone, address, city, state,
        postal_code, country, tax_id, website_url, contact_person, terminal_id,
        status, subscription_plan, monthly_fee, transaction_fee_percent,
        receipt_limit, receipts_processed, last_activity, created_at
      FROM merchants WHERE id = ?
    `,
      [req.merchant.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const merchant = result.rows[0];

    res.json({
      merchant: {
        ...merchant,
        utilizationPercent: Math.round(
          (merchant.receipts_processed / merchant.receipt_limit) * 100
        ),
        remainingReceipts: merchant.receipt_limit - merchant.receipts_processed,
      },
    });
  } catch (error) {
    console.error("Get merchant profile error:", error);
    res.status(500).json({ error: "Failed to retrieve merchant profile" });
  }
});

// Update merchant profile
router.put("/profile", authenticateMerchant, async (req, res) => {
  try {
    const {
      businessName,
      phone,
      address,
      city,
      state,
      postalCode,
      websiteUrl,
      contactPerson,
    } = req.body;

    await query(
      `
      UPDATE merchants 
      SET 
        business_name = COALESCE(?, business_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        postal_code = COALESCE(?, postal_code),
        website_url = COALESCE(?, website_url),
        contact_person = COALESCE(?, contact_person),
        updated_at = ${query.pool ? "NOW()" : "CURRENT_TIMESTAMP"}
      WHERE id = ?
    `,
      [
        businessName,
        phone,
        address,
        city,
        state,
        postalCode,
        websiteUrl,
        contactPerson,
        req.merchant.id,
      ]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update merchant profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get merchant statistics
router.get("/stats", authenticateMerchant, async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    // Get receipt statistics
    const receiptStats = await query(
      `
      SELECT 
        COUNT(*) as total_receipts,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(DISTINCT user_id) as unique_customers
      FROM receipts 
      WHERE merchant_id = ?
    `,
      [merchantId]
    );

    // Get daily statistics for the last 30 days
    const dailyStats = await query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as receipts,
        SUM(amount) as amount
      FROM receipts 
      WHERE merchant_id = ? 
        AND created_at >= ${
          query.pool
            ? "NOW() - INTERVAL '30 days'"
            : "datetime('now', '-30 days')"
        }
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      [merchantId]
    );

    // Get category breakdown
    const categoryStats = await query(
      `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM receipts 
      WHERE merchant_id = ?
      GROUP BY category
      ORDER BY count DESC
    `,
      [merchantId]
    );

    const stats = (receiptStats.rows && receiptStats.rows[0]) || {
      total_receipts: 0,
      total_amount: 0,
      average_amount: 0,
      unique_customers: 0,
    };

    res.json({
      overview: {
        totalReceipts: parseInt(stats.total_receipts) || 0,
        totalAmount: parseFloat(stats.total_amount) || 0,
        averageAmount: parseFloat(stats.average_amount) || 0,
        uniqueCustomers: parseInt(stats.unique_customers) || 0,
        utilizationPercent: Math.round(
          (req.merchant.receipts_processed / req.merchant.receipt_limit) * 100
        ),
      },
      dailyStats: (dailyStats.rows && dailyStats.rows) || [],
      categoryBreakdown: (categoryStats.rows && categoryStats.rows) || [],
    });
  } catch (error) {
    console.error("Get merchant stats error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      merchantId: req.merchant?.id,
    });
    res.status(500).json({ error: "Failed to retrieve statistics" });
  }
});

// Admin routes for merchant approval (requires admin authentication)
router.get("/admin/pending", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you might want to add an admin role to users table)
    const adminResult = await query(
      "SELECT account_status FROM users WHERE id = ?",
      [req.user.id]
    );

    if (
      !adminResult.rows[0] ||
      adminResult.rows[0].account_status !== "admin"
    ) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const result = await query(`
      SELECT 
        id, business_name, business_type, email, contact_person, 
        terminal_id, created_at, status
      FROM merchants 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    res.json({ pendingMerchants: result.rows });
  } catch (error) {
    console.error("Get pending merchants error:", error);
    res.status(500).json({ error: "Failed to retrieve pending merchants" });
  }
});

router.post(
  "/admin/approve/:merchantId",
  authenticateToken,
  async (req, res) => {
    try {
      const { merchantId } = req.params;

      // Check if user is admin
      const adminResult = await query(
        "SELECT account_status FROM users WHERE id = ?",
        [req.user.id]
      );

      if (
        !adminResult.rows[0] ||
        adminResult.rows[0].account_status !== "admin"
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await query(
        `
      UPDATE merchants 
      SET 
        status = 'approved',
        approved_by = ?,
        approved_at = ${query.pool ? "NOW()" : "CURRENT_TIMESTAMP"}
      WHERE id = ?
    `,
        [req.user.id, merchantId]
      );

      res.json({ message: "Merchant approved successfully" });
    } catch (error) {
      console.error("Approve merchant error:", error);
      res.status(500).json({ error: "Failed to approve merchant" });
    }
  }
);

// POS System Routes

// Scan customer QR code and validate
router.post("/pos/scan-qr", authenticateMerchant, async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        error: "QR code required",
        message: "Please provide the scanned QR code data",
      });
    }

    // Parse the QR code data
    let customerData;
    try {
      customerData = JSON.parse(qrCode);
    } catch {
      return res.status(400).json({
        error: "Invalid QR code",
        message: "QR code format is not recognized",
      });
    }

    // Validate required fields
    if (!customerData.userId || !customerData.handle) {
      return res.status(400).json({
        error: "Invalid QR code",
        message: "QR code does not contain valid customer data",
      });
    }

    // Verify customer exists and QR code is valid
    const userResult = await query(
      "SELECT id, handle, display_name, email FROM users WHERE id = ? AND handle = ?",
      [customerData.userId, customerData.handle]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "Customer not found",
        message: "This QR code is not associated with a valid customer",
      });
    }

    const customer = userResult.rows[0];

    res.json({
      success: true,
      customer: {
        id: customer.id,
        handle: customer.handle,
        displayName: customer.display_name,
        email: customer.email,
      },
      message: "Customer verified successfully",
    });
  } catch (error) {
    console.error("QR scan error:", error);
    res.status(500).json({ error: "Failed to process QR code" });
  }
});

// Create receipt for customer
router.post("/pos/create-receipt", authenticateMerchant, async (req, res) => {
  try {
    const {
      customerId,
      items,
      totalAmount,
      category = "other",
      paymentMethod = "cash",
      notes = "",
    } = req.body;

    // Validate required fields
    if (!customerId || !items || !totalAmount) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Customer ID, items, and total amount are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Invalid items",
        message: "Items must be a non-empty array",
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Total amount must be greater than 0",
      });
    }

    // Check merchant receipt limit
    if (req.merchant.receipts_processed >= req.merchant.receipt_limit) {
      return res.status(403).json({
        error: "Receipt limit reached",
        message:
          "Your monthly receipt limit has been reached. Please upgrade your plan.",
      });
    }

    // Verify customer exists
    const customerResult = await query(
      "SELECT id, handle, display_name FROM users WHERE id = ?",
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        error: "Customer not found",
        message: "Invalid customer ID",
      });
    }

    const customer = customerResult.rows[0];

    // Create receipt
    const receiptResult = await query(
      `
      INSERT INTO receipts (
        user_id, merchant_id, store_name, amount, receipt_date, category, 
        items, is_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${
        query.pool ? "NOW()" : "CURRENT_TIMESTAMP"
      })
      ${query.pool ? "RETURNING id, created_at" : ""}
    `,
      [
        customerId,
        req.merchant.id,
        req.merchant.business_name,
        totalAmount,
        new Date().toISOString().split("T")[0], // Current date
        category,
        JSON.stringify(items),
        true, // Merchant-created receipts are automatically verified
      ]
    );

    let receiptData;
    if (query.pool) {
      receiptData = receiptResult.rows[0];
    } else {
      // SQLite - get the inserted receipt
      const insertedReceipt = await query(
        "SELECT id, created_at FROM receipts WHERE id = ?",
        [receiptResult.lastID]
      );
      receiptData = {
        id: receiptResult.lastID,
        created_at: insertedReceipt.rows[0]?.created_at,
      };
    }

    // Update merchant's receipt count
    await query(
      "UPDATE merchants SET receipts_processed = receipts_processed + 1, last_activity = ? WHERE id = ?",
      [new Date().toISOString(), req.merchant.id]
    );

    // Update user's receipt count and total spent
    await query(
      "UPDATE users SET receipt_count = receipt_count + 1, total_spent = total_spent + ? WHERE id = ?",
      [totalAmount, customerId]
    );

    // Award points to customer (Phase 3: Loyalty System)
    let pointsAwarded = null;
    try {
      const { awardPoints } = require("./pointsService");

      pointsAwarded = await awardPoints(
        customerId,
        parseFloat(totalAmount),
        req.merchant.id,
        receiptData.id,
        `Purchase at ${req.merchant.business_name}`
      );

      console.log(
        `💰 Points awarded: ${pointsAwarded.pointsAwarded} points for $${totalAmount} purchase`
      );
      console.log(`🎯 New balance: ${pointsAwarded.newBalance} points`);
      console.log(`🏆 Tier: ${pointsAwarded.newTier}`);

      // Send points notification
      try {
        await notificationService.sendPointsAwardedNotification(
          customer.email,
          customer.display_name || customer.handle,
          pointsAwarded.pointsAwarded,
          req.merchant.business_name,
          pointsAwarded.newBalance
        );
      } catch (notifError) {
        console.error("Failed to send points notification:", notifError);
      }
    } catch (pointsError) {
      console.error("❌ Error awarding points:", pointsError);
      // Continue without points - receipt still created successfully
    }

    // Prepare receipt notification data
    const receiptNotificationData = {
      id: receiptData.id,
      merchantName: req.merchant.business_name,
      merchantTerminalId: req.merchant.terminal_id,
      customerName: customer.display_name || customer.handle,
      totalAmount: totalAmount,
      itemCount: items.length,
      category: category,
      paymentMethod: paymentMethod,
      items: items,
      createdAt: receiptData.created_at,
      isVerified: true,
    };

    // Send real-time notification to customer
    await notificationService.sendReceiptNotification(
      customerId,
      receiptNotificationData
    );

    // Send confirmation to merchant
    await notificationService.sendMerchantNotification(req.merchant.id, {
      type: "receipt_created",
      receiptId: receiptData.id,
      customerName: customer.display_name || customer.handle,
      amount: totalAmount,
      itemCount: items.length,
    });

    // NFT Minting with Threshold Check (Phase 2.2)
    let nftData = null;
    const nftSettings = getNftSettings();

    console.log(
      `🎯 NFT Threshold Check: $${totalAmount} vs $${nftSettings.threshold}`
    );
    console.log(`🎨 NFT Settings:`, nftSettings);

    if (shouldMintNft(totalAmount)) {
      try {
        console.log(
          "🎨 Receipt meets threshold! Minting NFT for customer:",
          customer.handle
        );

        const nftService = new NFTService();
        const nftResult = await nftService.mintReceiptNFT(
          {
            id: receiptData.id,
            total_amount: totalAmount,
            created_at: receiptData.created_at,
            customer_id: customerId,
            items: items,
          },
          req.merchant,
          customer.hedera_account_id // Will be null for now, NFT stays in treasury
        );

        if (nftResult.success) {
          console.log("✅ Receipt NFT minted successfully:", nftResult.tokenId);

          // Update receipt with NFT information
          await query(
            "UPDATE receipts SET nft_token_id = ?, nft_serial_number = ? WHERE id = ?",
            [nftResult.tokenId, nftResult.serialNumber, receiptData.id]
          );

          nftData = {
            tokenId: nftResult.tokenId,
            serialNumber: nftResult.serialNumber,
            collectionId: nftResult.collectionId,
            hashscanUrl: nftResult.hashscanUrl,
            metadata: nftResult.metadata,
          };

          // Send enhanced NFT notification to customer
          await notificationService.sendReceiptNotification(customerId, {
            ...receiptNotificationData,
            nft: nftData,
            type: "receipt_with_nft",
            message: `🎨 Congratulations! Your $${totalAmount} receipt has been minted as an NFT collectible!`,
          });

          console.log("✅ Receipt NFT created and customer notified");
        } else {
          console.warn("⚠️ NFT minting failed:", nftResult.error);
          // Continue without NFT - receipt still created successfully
        }

        nftService.close();
      } catch (nftError) {
        console.error("❌ NFT minting error:", nftError.message);
        // Continue without NFT - receipt still created successfully
      }
    } else {
      console.log(
        `📝 Receipt below threshold ($${totalAmount} < $${nftSettings.threshold}) - no NFT minted`
      );
    }

    res.status(201).json({
      success: true,
      receipt: {
        id: receiptData.id,
        merchantName: req.merchant.business_name,
        customerName: customer.display_name || customer.handle,
        totalAmount: totalAmount,
        itemCount: items.length,
        category: category,
        paymentMethod: paymentMethod,
        createdAt: receiptData.created_at,
        isVerified: true,
        nft: nftData,
      },
      points: pointsAwarded
        ? {
            awarded: pointsAwarded.pointsAwarded,
            newBalance: pointsAwarded.newBalance,
            tier: pointsAwarded.newTier,
            tierChanged: pointsAwarded.tierChanged,
          }
        : null,
      message:
        nftData && pointsAwarded
          ? `Receipt created with NFT collectible! ${pointsAwarded.pointsAwarded} points awarded! 🎉`
          : pointsAwarded
          ? `Receipt created! ${pointsAwarded.pointsAwarded} points awarded! 💰`
          : nftData
          ? "Receipt created successfully with NFT collectible!"
          : "Receipt created successfully and sent to customer",
    });
  } catch (error) {
    console.error("Create receipt error:", error);
    res.status(500).json({ error: "Failed to create receipt" });
  }
});

// Get recent transactions for merchant
router.get(
  "/pos/recent-transactions",
  authenticateMerchant,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const result = await query(
        `
      SELECT 
        r.id, r.amount, r.category, r.created_at, r.receipt_date,
        u.handle as customer_handle, u.display_name as customer_name,
        JSON_EXTRACT(r.items, '$') as items_count
      FROM receipts r
      JOIN users u ON r.user_id = u.id
      WHERE r.merchant_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `,
        [req.merchant.id, limit, offset]
      );

      const transactions = result.rows.map((row) => ({
        id: row.id,
        amount: row.amount,
        category: row.category,
        customer: {
          handle: row.customer_handle,
          name: row.customer_name,
        },
        itemsCount: Array.isArray(row.items_count) ? row.items_count.length : 0,
        createdAt: row.created_at,
        receiptDate: row.receipt_date,
      }));

      res.json({
        transactions,
        pagination: {
          limit,
          offset,
          hasMore: transactions.length === limit,
        },
      });
    } catch (error) {
      console.error("Get recent transactions error:", error);
      res.status(500).json({ error: "Failed to retrieve transactions" });
    }
  }
);

// Development/Testing endpoint to approve merchants (remove in production)
router.get("/dev/approve/:merchantId", async (req, res) => {
  try {
    const { merchantId } = req.params;

    await query(
      `
      UPDATE merchants 
      SET 
        status = 'approved',
        approved_at = ${query.pool ? "NOW()" : "CURRENT_TIMESTAMP"}
      WHERE id = ?
    `,
      [merchantId]
    );

    res.json({ message: "Merchant approved successfully" });
  } catch (error) {
    console.error("Approve merchant error:", error);
    res.status(500).json({ error: "Failed to approve merchant" });
  }
});

// Development endpoint to list all merchants (remove in production)
router.get("/dev/list", async (req, res) => {
  try {
    const result = await query(`
      SELECT id, business_name, email, status, api_key, created_at
      FROM merchants 
      ORDER BY created_at DESC
    `);

    res.json({ merchants: result.rows });
  } catch (error) {
    console.error("List merchants error:", error);
    res.status(500).json({ error: "Failed to list merchants" });
  }
});

/**
 * POST /api/merchant/scan-qr
 * Scan user QR code and award points
 */
router.post("/scan-qr", authenticateMerchant, async (req, res) => {
  try {
    const { qrData, purchaseAmount, receiptData } = req.body;
    const merchant = req.merchant;

    // Validate required fields
    if (!qrData || !purchaseAmount) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "QR data and purchase amount are required",
      });
    }

    // Parse QR code data
    let userId, accountId, timestamp, signature;
    try {
      const qrPayload = JSON.parse(qrData);
      userId = qrPayload.userId;
      accountId = qrPayload.accountId;
      timestamp = qrPayload.timestamp;
      signature = qrPayload.signature;
    } catch (error) {
      // If QR data is just a plain user ID string
      userId = qrData;
    }

    if (!userId) {
      return res.status(400).json({
        error: "Invalid QR code",
        message: "Could not extract user ID from QR code",
      });
    }

    // Verify user exists
    const userResult = await query(
      "SELECT id, handle, display_name, email FROM users WHERE id = ?",
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "The scanned QR code is not associated with a valid user",
      });
    }

    const user = userResult.rows[0];

    // Validate purchase amount
    if (purchaseAmount <= 0 || purchaseAmount > 10000) {
      return res.status(400).json({
        error: "Invalid purchase amount",
        message: "Purchase amount must be between $0.01 and $10,000",
      });
    }

    // Validate transaction (anti-fraud checks)
    const validation = await validatePointsTransaction(
      userId,
      merchant.id,
      parseFloat(purchaseAmount)
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: "Transaction validation failed",
        reason: validation.reason,
      });
    }

    // Create receipt record if receipt data provided
    let receiptId = null;
    if (receiptData) {
      const receiptResult = await query(
        `INSERT INTO receipts 
         (user_id, merchant_id, store_name, amount, receipt_date, category, items) 
         VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)`,
        [
          userId,
          merchant.id,
          merchant.business_name,
          purchaseAmount,
          receiptData.category || "other",
          JSON.stringify(receiptData.items || []),
        ]
      );
      receiptId = receiptResult.lastID || receiptResult.rows[0]?.id;
    }

    // Award points
    const pointsResult = await awardPoints(
      userId,
      parseFloat(purchaseAmount),
      merchant.id,
      receiptId,
      `Purchase at ${merchant.business_name}`
    );

    // Update merchant's receipt count
    await query(
      `UPDATE merchants 
       SET receipts_processed = receipts_processed + 1,
           last_activity = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [merchant.id]
    );

    // Send notification to user
    try {
      await notificationService.sendPointsAwardedNotification(
        user.email,
        user.display_name || user.handle,
        pointsResult.pointsAwarded,
        merchant.business_name,
        pointsResult.newBalance
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: "Points awarded successfully",
      data: {
        user: {
          id: user.id,
          handle: user.handle,
          displayName: user.display_name,
        },
        points: {
          awarded: pointsResult.pointsAwarded,
          newBalance: pointsResult.newBalance,
          tier: pointsResult.newTier,
          tierChanged: pointsResult.tierChanged,
        },
        receipt: receiptId ? { id: receiptId } : null,
        purchaseAmount,
      },
    });
  } catch (error) {
    console.error("QR scan error:", error);
    res.status(500).json({
      error: "Failed to process QR scan",
      message: error.message,
    });
  }
});

/**
 * GET /api/merchant/rewards-stats
 * Get merchant's rewards distribution statistics
 */
router.get("/rewards-stats", authenticateMerchant, async (req, res) => {
  try {
    const merchant = req.merchant;

    // Get merchant rewards data
    const rewardsResult = await query(
      "SELECT * FROM merchant_rewards WHERE merchant_id = ?",
      [merchant.id]
    );

    const rewardsData =
      rewardsResult.rows.length > 0
        ? rewardsResult.rows[0]
        : {
            total_points_distributed: 0,
            total_transactions: 0,
            reward_rate: 1.0,
          };

    // Get recent transactions
    const recentTransactions = await query(
      `SELECT pt.*, u.handle as user_handle
       FROM points_transactions pt
       JOIN users u ON pt.user_id = u.id
       WHERE pt.merchant_id = ?
       ORDER BY pt.created_at DESC
       LIMIT 10`,
      [merchant.id]
    );

    // Get top customers (anonymized)
    const topCustomers = await query(
      `SELECT u.handle, COUNT(*) as visit_count, SUM(pt.amount) as total_points
       FROM points_transactions pt
       JOIN users u ON pt.user_id = u.id
       WHERE pt.merchant_id = ?
       GROUP BY pt.user_id, u.handle
       ORDER BY total_points DESC
       LIMIT 5`,
      [merchant.id]
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalPointsDistributed: rewardsData.total_points_distributed || 0,
          totalTransactions: rewardsData.total_transactions || 0,
          rewardRate: rewardsData.reward_rate || 1.0,
          lastAwardAt: rewardsData.last_award_at,
        },
        recentTransactions: recentTransactions.rows || [],
        topCustomers: topCustomers.rows || [],
      },
    });
  } catch (error) {
    console.error("Error fetching merchant rewards stats:", error);
    res.status(500).json({
      error: "Failed to fetch rewards statistics",
      message: error.message,
    });
  }
});

module.exports = router;
