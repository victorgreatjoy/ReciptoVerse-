const express = require("express");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { query } = require("./database");
const {
  generateToken,
  generateUniqueHandle,
  authenticateToken,
} = require("./auth");
const UserBarcodeGenerator = require("./barcodeGenerator");
const { verifyRecaptcha } = require("./recaptchaService");
const emailService = require("./emailService");

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  desiredHandle: Joi.string().alphanum().min(3).max(20).required(),
  displayName: Joi.string().max(100).optional(),
  recaptchaToken: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  displayName: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
  avatarUrl: Joi.string().uri().optional(),
  notificationPreferences: Joi.object().optional(),
  privacySettings: Joi.object().optional(),
});

const verificationSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const { email, password, desiredHandle, displayName, recaptchaToken } =
      value;

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, req.ip);

    if (!recaptchaResult.success) {
      console.warn(
        `❌ reCAPTCHA verification failed for ${email}:`,
        recaptchaResult["error-codes"]
      );
      return res.status(400).json({
        error: "reCAPTCHA verification failed",
        code: "RECAPTCHA_VERIFICATION_FAILED",
        details: recaptchaResult["error-codes"],
      });
    }

    console.log(`✅ reCAPTCHA verified for registration: ${email}`);

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Generate unique handle
    const uniqueHandle = await generateUniqueHandle(desiredHandle);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification code
    const verificationCode = emailService.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with verification code
    const result = await query(
      `
      INSERT INTO users (email, password_hash, handle, display_name, verification_code, verification_code_expires)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id, email, handle, display_name, created_at
    `,
      [
        email.toLowerCase(),
        passwordHash,
        uniqueHandle,
        displayName || uniqueHandle,
        verificationCode,
        verificationExpires.toISOString(),
      ]
    );

    const user = result.rows ? result.rows[0] : result;

    // Generate QR code for the new user
    try {
      const userBarcode = await UserBarcodeGenerator.generateUserBarcode(user);

      // Update user record with QR code data
      await query(
        "UPDATE users SET qr_code = ?, barcode_data = ? WHERE id = ?",
        [userBarcode.qrCodeImage, userBarcode.barcodeData, user.id]
      );

      console.log(`✅ QR code generated for user: ${user.handle}`);
    } catch (barcodeError) {
      console.error("QR code generation failed:", barcodeError);
      // Continue with registration even if QR code fails
    }

    // Send verification email
    try {
      const emailResult = await emailService.sendVerificationCode(
        email.toLowerCase(),
        verificationCode,
        user.handle
      );

      if (emailResult.success) {
        console.log(
          `📧 Verification email sent to ${user.handle} (${user.email})`
        );
      } else {
        console.log(
          `📧 Email fallback used for ${user.handle}: ${verificationCode}`
        );
      }
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    console.log(
      `✅ New user registered: ${user.handle} (${user.email}) - verification required`
    );

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification code.",
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.display_name,
        createdAt: user.created_at,
        hasQRCode: true,
        emailVerified: false,
        requiresVerification: true,
      },
      // Note: No token provided until email is verified
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify email with code
router.post("/verify-email", async (req, res) => {
  try {
    // Validate input
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const { email, code } = value;

    // Find user with verification code
    const result = await query(
      "SELECT * FROM users WHERE email = ? AND verification_code = ?",
      [email.toLowerCase(), code]
    );

    if ((result.rows || result).length === 0) {
      // Increment failed attempts
      await query(
        "UPDATE users SET verification_attempts = verification_attempts + 1 WHERE email = ?",
        [email.toLowerCase()]
      );

      return res.status(400).json({
        error: "Invalid verification code",
        code: "INVALID_CODE",
      });
    }

    const user = result.rows ? result.rows[0] : result[0];

    // Check if code expired
    const now = new Date();
    const expiresAt = new Date(user.verification_code_expires);

    if (now > expiresAt) {
      return res.status(400).json({
        error: "Verification code has expired",
        code: "CODE_EXPIRED",
      });
    }

    // Check attempts limit
    if (user.verification_attempts >= 5) {
      return res.status(429).json({
        error: "Too many failed attempts. Please request a new code.",
        code: "TOO_MANY_ATTEMPTS",
      });
    }

    // Verify user and clear verification data
    await query(
      `UPDATE users SET 
       email_verified = ?, 
       verification_code = NULL, 
       verification_code_expires = NULL, 
       verification_attempts = 0 
       WHERE id = ?`,
      [true, user.id]
    );

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.handle);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Generate token for verified user
    const token = generateToken(user.id);

    console.log(`✅ Email verified for user: ${user.handle} (${user.email})`);

    res.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.display_name,
        emailVerified: true,
        hasQRCode: !!user.qr_code,
      },
      token,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Resend verification code
router.post("/resend-verification", async (req, res) => {
  try {
    // Validate input
    const { error, value } = resendVerificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const { email } = value;

    // Find user
    const result = await query("SELECT * FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);

    if ((result.rows || result).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows ? result.rows[0] : result[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        error: "Email is already verified",
        code: "ALREADY_VERIFIED",
      });
    }

    // Generate new verification code
    const verificationCode = emailService.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    await query(
      `UPDATE users SET 
       verification_code = ?, 
       verification_code_expires = ?, 
       verification_attempts = 0 
       WHERE id = ?`,
      [verificationCode, verificationExpires.toISOString(), user.id]
    );

    // Send verification email
    try {
      console.log(
        `📧 Attempting to send verification email to ${email.toLowerCase()}`
      );

      const emailResult = await emailService.sendVerificationCode(
        email.toLowerCase(),
        verificationCode,
        user.handle
      );

      if (emailResult.success) {
        console.log(
          `📧 Verification email resent to ${user.handle} (${user.email})`
        );
      } else {
        console.log(
          `📧 Email fallback used for ${user.handle}: ${verificationCode}`
        );
      }

      // Always return success, even with fallback
      res.json({
        message: "Verification code sent successfully",
        email: email.toLowerCase(),
        fallback: emailResult.fallback || false,
      });
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError);

      // Still return the code for development/testing
      res.json({
        message: "Verification code generated (email service unavailable)",
        email: email.toLowerCase(),
        fallback: true,
        code: verificationCode, // Include code when email fails
      });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user
    const result = await query(
      "SELECT * FROM users WHERE email = ? AND account_status = ?",
      [email.toLowerCase(), "active"]
    );

    if ((result.rows || result).length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows ? result.rows[0] : result[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: "Please verify your email address before logging in",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
        requiresVerification: true,
      });
    }

    // Update last active
    await query(
      "UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    console.log(`✅ User logged in: ${user.handle}`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        receiptCount: user.receipt_count,
        nftCount: user.nft_count,
        recvBalance: parseFloat(user.recv_balance),
        totalSpent: parseFloat(user.total_spent),
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user has an approved merchant account
    const merchantResult = await query(
      "SELECT id, business_name, terminal_id, api_key, status FROM merchants WHERE user_id = ?",
      [user.id]
    );
    
    const merchantData = merchantResult.rows.length > 0 ? merchantResult.rows[0] : null;
    const isMerchant = merchantData && merchantData.status === 'approved';

    res.json({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.display_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        receiptCount: user.receipt_count,
        nftCount: user.nft_count,
        recvBalance: parseFloat(user.recv_balance),
        totalSpent: parseFloat(user.total_spent),
        notificationPreferences: user.notification_preferences,
        privacySettings: user.privacy_settings,
        createdAt: user.created_at,
        lastActive: user.last_active,
        emailVerified: user.email_verified,
        isMerchant: isMerchant,
        merchantStatus: merchantData?.status || null,
        merchantId: merchantData?.id || null,
        merchantApiKey: merchantData?.api_key || null,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const updates = [];
    const values = [];

    // Build dynamic update query
    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        const dbKey =
          key === "displayName"
            ? "display_name"
            : key === "avatarUrl"
            ? "avatar_url"
            : key === "notificationPreferences"
            ? "notification_preferences"
            : key === "privacySettings"
            ? "privacy_settings"
            : key;

        updates.push(`${dbKey} = ?`);
        values.push(
          key.includes("Preferences") || key.includes("Settings")
            ? JSON.stringify(val)
            : val
        );
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid updates provided" });
    }

    // Add updated timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const queryText = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = ?
      RETURNING id, email, handle, display_name, bio, avatar_url, 
                receipt_count, nft_count, recv_balance, total_spent,
                notification_preferences, privacy_settings, updated_at
    `;

    const result = await query(queryText, values);
    const updatedUser = result.rows ? result.rows[0] : result;

    console.log(`✅ Profile updated for user: ${updatedUser.handle}`);

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        handle: updatedUser.handle,
        displayName: updatedUser.display_name,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatar_url,
        receiptCount: updatedUser.receipt_count,
        nftCount: updatedUser.nft_count,
        recvBalance: parseFloat(updatedUser.recv_balance),
        totalSpent: parseFloat(updatedUser.total_spent),
        notificationPreferences: updatedUser.notification_preferences,
        privacySettings: updatedUser.privacy_settings,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get user statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get detailed statistics (simplified for SQLite compatibility)
    const statsQuery = await query(
      `
      SELECT 
        u.receipt_count,
        u.nft_count,
        u.recv_balance,
        u.total_spent,
        u.created_at
      FROM users u
      WHERE u.id = ?
    `,
      [userId]
    );

    const stats = statsQuery.rows ? statsQuery.rows[0] : statsQuery[0];

    // Calculate account age in days
    const accountAge = Math.floor(
      (new Date() - new Date(stats.created_at)) / (1000 * 60 * 60 * 24)
    );

    res.json({
      stats: {
        totalReceipts: stats.receipt_count || 0,
        totalNFTs: stats.nft_count || 0,
        recvBalance: parseFloat(stats.recv_balance || 0),
        totalSpent: parseFloat(stats.total_spent || 0),
        receiptsThisMonth: 0, // Simplified for now
        receiptsThisWeek: 0, // Simplified for now
        categoriesUsed: 0, // Simplified for now
        averageReceiptAmount: 0, // Simplified for now
        highestReceipt: 0, // Simplified for now
        daysActive: 0, // Simplified for now
        accountAge: accountAge,
      },
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});

// Get user QR code
router.get("/qr-code", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      "SELECT qr_code, barcode_data, handle, display_name FROM users WHERE id = ?",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows ? result.rows[0] : result;

    if (!user.qr_code) {
      return res.status(404).json({
        error: "QR code not found",
        message: "Please regenerate your QR code",
      });
    }

    res.json({
      qrCode: user.qr_code,
      barcodeData: user.barcode_data ? JSON.parse(user.barcode_data) : null,
      displayInfo: {
        handle: user.handle,
        displayName: user.display_name,
        instructions:
          "Show this QR code at checkout to receive digital receipts",
      },
    });
  } catch (error) {
    console.error("QR code retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve QR code" });
  }
});

// Regenerate user QR code
router.post("/regenerate-qr", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user data
    const result = await query(
      "SELECT id, handle, display_name FROM users WHERE id = ?",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows ? result.rows[0] : result;

    // Generate new QR code
    const userBarcode = await UserBarcodeGenerator.generateUserBarcode(user);

    // Update user record
    await query("UPDATE users SET qr_code = ?, barcode_data = ? WHERE id = ?", [
      userBarcode.qrCodeImage,
      userBarcode.barcodeData,
      userId,
    ]);

    console.log(`✅ QR code regenerated for user: ${user.handle}`);

    res.json({
      message: "QR code regenerated successfully",
      qrCode: userBarcode.qrCodeImage,
      displayInfo: userBarcode.displayData,
    });
  } catch (error) {
    console.error("QR code regeneration error:", error);
    res.status(500).json({ error: "Failed to regenerate QR code" });
  }
});

// Generate QR codes for existing users (admin/migration endpoint)
router.post("/generate-missing-qr", authenticateToken, async (req, res) => {
  try {
    // Get users without QR codes
    const result = await query(
      "SELECT id, handle, display_name FROM users WHERE qr_code IS NULL OR qr_code = ''"
    );

    const users = result.rows || [result].filter(Boolean);
    let generated = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const userBarcode = await UserBarcodeGenerator.generateUserBarcode(
          user
        );

        await query(
          "UPDATE users SET qr_code = ?, barcode_data = ? WHERE id = ?",
          [userBarcode.qrCodeImage, userBarcode.barcodeData, user.id]
        );

        generated++;
        console.log(`✅ QR code generated for existing user: ${user.handle}`);
      } catch (userError) {
        console.error(
          `❌ Failed to generate QR for ${user.handle}:`,
          userError
        );
        failed++;
      }
    }

    res.json({
      message: "QR code generation completed",
      generated,
      failed,
      total: users.length,
    });
  } catch (error) {
    console.error("Bulk QR generation error:", error);
    res.status(500).json({ error: "Failed to generate QR codes" });
  }
});

module.exports = router;
