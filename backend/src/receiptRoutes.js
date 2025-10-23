const express = require("express");
const router = express.Router();
const { query } = require("./database");
const { authenticateToken } = require("./auth");
const Joi = require("joi");

// Receipt validation schemas
const createReceiptSchema = Joi.object({
  storeName: Joi.string().required().max(100),
  amount: Joi.number().positive().required(),
  receiptDate: Joi.date().required(),
  category: Joi.string()
    .valid(
      "food",
      "shopping",
      "travel",
      "entertainment",
      "healthcare",
      "utilities",
      "gas",
      "groceries",
      "dining",
      "transportation",
      "services",
      "other"
    )
    .default("other"),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().positive().default(1),
        price: Joi.number().min(0).required(),
        category: Joi.string().optional(),
      })
    )
    .default([]),
  merchantId: Joi.string().optional(),
  barcodeData: Joi.string().optional(),
  notes: Joi.string().max(500).optional(),
});

const updateReceiptSchema = Joi.object({
  storeName: Joi.string().max(100).optional(),
  amount: Joi.number().positive().optional(),
  receiptDate: Joi.date().optional(),
  category: Joi.string()
    .valid(
      "food",
      "shopping",
      "travel",
      "entertainment",
      "healthcare",
      "utilities",
      "gas",
      "groceries",
      "dining",
      "transportation",
      "services",
      "other"
    )
    .optional(),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().positive().default(1),
        price: Joi.number().min(0).required(),
        category: Joi.string().optional(),
      })
    )
    .optional(),
  notes: Joi.string().max(500).optional(),
  isVerified: Joi.boolean().optional(),
});

// Get all receipt categories with counts
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const categoryStats = await query(
      `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM receipts 
      WHERE user_id = ?
      GROUP BY category
      ORDER BY count DESC
    `,
      [userId]
    );

    // Define all available categories with icons and colors
    const allCategories = [
      { id: "food", name: "Food & Dining", icon: "🍽️", color: "#ef4444" },
      { id: "groceries", name: "Groceries", icon: "🛒", color: "#22c55e" },
      { id: "shopping", name: "Shopping", icon: "🛍️", color: "#f59e0b" },
      { id: "travel", name: "Travel", icon: "✈️", color: "#3b82f6" },
      {
        id: "transportation",
        name: "Transportation",
        icon: "🚗",
        color: "#8b5cf6",
      },
      { id: "gas", name: "Gas & Fuel", icon: "⛽", color: "#dc2626" },
      {
        id: "entertainment",
        name: "Entertainment",
        icon: "🎭",
        color: "#ec4899",
      },
      { id: "healthcare", name: "Healthcare", icon: "🏥", color: "#06b6d4" },
      { id: "utilities", name: "Utilities", icon: "💡", color: "#84cc16" },
      { id: "services", name: "Services", icon: "🔧", color: "#64748b" },
      { id: "other", name: "Other", icon: "📋", color: "#6b7280" },
    ];

    // Merge with user data
    const categoriesWithStats = allCategories.map((category) => {
      const userStats = (categoryStats.rows || categoryStats).find(
        (stat) => stat.category === category.id
      );
      return {
        ...category,
        count: userStats ? parseInt(userStats.count) : 0,
        totalAmount: userStats ? parseFloat(userStats.total_amount) : 0,
        avgAmount: userStats ? parseFloat(userStats.avg_amount) : 0,
      };
    });

    res.json({
      categories: categoriesWithStats,
      totalReceipts: categoriesWithStats.reduce(
        (sum, cat) => sum + cat.count,
        0
      ),
      totalAmount: categoriesWithStats.reduce(
        (sum, cat) => sum + cat.totalAmount,
        0
      ),
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Create new receipt
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { error, value } = createReceiptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const {
      storeName,
      amount,
      receiptDate,
      category,
      items,
      merchantId,
      barcodeData,
      notes,
    } = value;

    // Create receipt
    const receiptId = require("crypto").randomUUID();

    await query(
      `
      INSERT INTO receipts (
        id, user_id, store_name, amount, receipt_date, 
        category, items, merchant_id, barcode_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        receiptId,
        userId,
        storeName,
        amount,
        receiptDate,
        category,
        JSON.stringify(items),
        merchantId,
        barcodeData,
      ]
    );

    // Update user receipt count
    await query(
      `
      UPDATE users 
      SET receipt_count = receipt_count + 1,
          total_spent = total_spent + ?
      WHERE id = ?
    `,
      [amount, userId]
    );

    const newReceipt = await query(
      `
      SELECT * FROM receipts WHERE id = ?
    `,
      [receiptId]
    );

    const receipt = (newReceipt.rows || newReceipt)[0];

    console.log(`✅ Receipt created: ${storeName} - $${amount} (${category})`);

    res.status(201).json({
      message: "Receipt created successfully",
      receipt: {
        id: receipt.id,
        storeName: receipt.store_name,
        amount: parseFloat(receipt.amount),
        receiptDate: receipt.receipt_date,
        category: receipt.category,
        items: JSON.parse(receipt.items || "[]"),
        isVerified: receipt.is_verified,
        nftCreated: receipt.nft_created,
        createdAt: receipt.created_at,
      },
    });
  } catch (error) {
    console.error("Receipt creation error:", error);
    res.status(500).json({ error: "Failed to create receipt" });
  }
});

// Get receipts with filtering and pagination
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      category,
      search,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      verified,
      page = 1,
      limit = 20,
      sortBy = "receipt_date",
      sortOrder = "DESC",
    } = req.query;

    // Build dynamic query
    let whereConditions = ["user_id = ?"];
    let queryParams = [userId];

    if (category && category !== "all") {
      whereConditions.push("category = ?");
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push("(store_name LIKE ? OR items LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (startDate) {
      whereConditions.push("receipt_date >= ?");
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push("receipt_date <= ?");
      queryParams.push(endDate);
    }

    if (minAmount) {
      whereConditions.push("amount >= ?");
      queryParams.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      whereConditions.push("amount <= ?");
      queryParams.push(parseFloat(maxAmount));
    }

    if (verified !== undefined) {
      whereConditions.push("is_verified = ?");
      queryParams.push(verified === "true");
    }

    const offset = (page - 1) * limit;
    const whereClause = whereConditions.join(" AND ");

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as total FROM receipts WHERE ${whereClause}
    `,
      queryParams
    );

    const totalReceipts = (countResult.rows || countResult)[0].total;

    // Get receipts
    const receiptsResult = await query(
      `
      SELECT * FROM receipts 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `,
      [...queryParams, parseInt(limit), offset]
    );

    const receipts = (receiptsResult.rows || receiptsResult).map((receipt) => ({
      id: receipt.id,
      storeName: receipt.store_name,
      amount: parseFloat(receipt.amount),
      receiptDate: receipt.receipt_date,
      category: receipt.category,
      items: JSON.parse(receipt.items || "[]"),
      isVerified: receipt.is_verified,
      nftCreated: receipt.nft_created,
      nftTokenId: receipt.nft_token_id,
      createdAt: receipt.created_at,
    }));

    res.json({
      receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalReceipts),
        totalPages: Math.ceil(totalReceipts / limit),
      },
      filters: {
        category,
        search,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        verified,
      },
    });
  } catch (error) {
    console.error("Receipts fetch error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      query: req.query,
    });
    res.status(500).json({
      error: "Failed to fetch receipts",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get single receipt
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const receiptId = req.params.id;

    const result = await query(
      `
      SELECT * FROM receipts WHERE id = ? AND user_id = ?
    `,
      [receiptId, userId]
    );

    const receipt = (result.rows || result)[0];

    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    res.json({
      receipt: {
        id: receipt.id,
        storeName: receipt.store_name,
        amount: parseFloat(receipt.amount),
        receiptDate: receipt.receipt_date,
        category: receipt.category,
        items: JSON.parse(receipt.items || "[]"),
        merchantId: receipt.merchant_id,
        barcodeData: receipt.barcode_data,
        isVerified: receipt.is_verified,
        nftCreated: receipt.nft_created,
        nftTokenId: receipt.nft_token_id,
        nftSerialNumber: receipt.nft_serial,
        nftMetadataUrl: receipt.nft_metadata_url,
        createdAt: receipt.created_at,
        updatedAt: receipt.updated_at,
      },
    });
  } catch (error) {
    console.error("Receipt fetch error:", error);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

// Update receipt
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateReceiptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const receiptId = req.params.id;

    // Check if receipt exists and belongs to user
    const existingResult = await query(
      `
      SELECT * FROM receipts WHERE id = ? AND user_id = ?
    `,
      [receiptId, userId]
    );

    const existingReceipt = (existingResult.rows || existingResult)[0];
    if (!existingReceipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    // Build update query
    const updates = [];
    const queryParams = [];

    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        const dbKey =
          key === "storeName"
            ? "store_name"
            : key === "receiptDate"
            ? "receipt_date"
            : key === "isVerified"
            ? "is_verified"
            : key;

        updates.push(`${dbKey} = ?`);
        queryParams.push(key === "items" ? JSON.stringify(val) : val);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid updates provided" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    queryParams.push(receiptId, userId);

    await query(
      `
      UPDATE receipts 
      SET ${updates.join(", ")}
      WHERE id = ? AND user_id = ?
    `,
      queryParams
    );

    // Get updated receipt
    const updatedResult = await query(
      `
      SELECT * FROM receipts WHERE id = ? AND user_id = ?
    `,
      [receiptId, userId]
    );

    const updatedReceipt = (updatedResult.rows || updatedResult)[0];

    console.log(`✅ Receipt updated: ${updatedReceipt.store_name}`);

    res.json({
      message: "Receipt updated successfully",
      receipt: {
        id: updatedReceipt.id,
        storeName: updatedReceipt.store_name,
        amount: parseFloat(updatedReceipt.amount),
        receiptDate: updatedReceipt.receipt_date,
        category: updatedReceipt.category,
        items: JSON.parse(updatedReceipt.items || "[]"),
        isVerified: updatedReceipt.is_verified,
        nftCreated: updatedReceipt.nft_created,
        createdAt: updatedReceipt.created_at,
        updatedAt: updatedReceipt.updated_at,
      },
    });
  } catch (error) {
    console.error("Receipt update error:", error);
    res.status(500).json({ error: "Failed to update receipt" });
  }
});

// Delete receipt
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const receiptId = req.params.id;

    // Get receipt details for amount calculation
    const existingResult = await query(
      `
      SELECT amount FROM receipts WHERE id = ? AND user_id = ?
    `,
      [receiptId, userId]
    );

    const existingReceipt = (existingResult.rows || existingResult)[0];
    if (!existingReceipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    // Delete receipt
    await query(
      `
      DELETE FROM receipts WHERE id = ? AND user_id = ?
    `,
      [receiptId, userId]
    );

    // Update user statistics
    await query(
      `
      UPDATE users 
      SET receipt_count = receipt_count - 1,
          total_spent = total_spent - ?
      WHERE id = ?
    `,
      [existingReceipt.amount, userId]
    );

    console.log(`✅ Receipt deleted: ${receiptId}`);

    res.json({
      message: "Receipt deleted successfully",
    });
  } catch (error) {
    console.error("Receipt deletion error:", error);
    res.status(500).json({ error: "Failed to delete receipt" });
  }
});

// Get NFT receipt gallery for authenticated user
router.get("/nft-gallery", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("📱 Loading NFT receipts for user:", userId);

    // Get receipts that have been minted as NFTs
    const nftReceiptsResult = await query(
      `
      SELECT 
        r.id, r.store_name, r.amount, r.receipt_date, r.category, 
        r.items, r.created_at, r.nft_token_id, r.nft_serial, 
        r.nft_created, r.nft_metadata_url, r.is_verified
      FROM receipts r 
      WHERE r.user_id = ? 
        AND (r.nft_token_id IS NOT NULL OR r.nft_created = true)
      ORDER BY r.created_at DESC
      `,
      [userId]
    );

    const nftReceipts = nftReceiptsResult.rows.map((receipt) => ({
      ...receipt,
      items: receipt.items ? JSON.parse(receipt.items) : [],
    }));

    console.log(`✅ Found ${nftReceipts.length} NFT receipts for user`);

    res.json({
      success: true,
      nftReceipts: nftReceipts,
      totalNFTs: nftReceipts.length,
      totalValue: nftReceipts.reduce(
        (sum, receipt) => sum + parseFloat(receipt.amount),
        0
      ),
    });
  } catch (error) {
    console.error("❌ Error loading NFT gallery:", error);
    res.status(500).json({
      error: "Failed to load NFT gallery",
      message: "Unable to retrieve your NFT receipt collection",
    });
  }
});

module.exports = router;
