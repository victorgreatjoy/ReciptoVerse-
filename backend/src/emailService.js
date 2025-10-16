// emailService.js
// Email service for user verification and notifications

const nodemailer = require("nodemailer");
const crypto = require("crypto");

/**
 * Email service configuration and utilities
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment
   */
  initializeTransporter() {
    try {
      // Check if we have real email credentials
      if (
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        console.log(
          "📧 Real email credentials found, setting up production email service..."
        );
        this.setupProductionEmail();
      } else if (process.env.NODE_ENV === "development") {
        console.log(
          "📧 No email credentials found, setting up development email service..."
        );
        this.setupDevelopmentEmail();
      } else {
        this.setupFallbackService();
      }
    } catch (error) {
      console.error("❌ Email service initialization failed:", error);
    }
  }

  /**
   * Setup development email using Ethereal Email
   */
  async setupDevelopmentEmail() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.isConfigured = true;
      console.log(
        "📧 Development email service configured with Ethereal Email"
      );
      console.log(`📧 Preview emails at: https://ethereal.email`);
    } catch (error) {
      console.error("❌ Development email setup failed:", error);
      this.setupFallbackService();
    }
  }

  /**
   * Setup production email service
   */
  setupProductionEmail() {
    try {
      console.log("📧 Setting up production email with configuration:");
      console.log(`   Host: ${process.env.EMAIL_HOST}`);
      console.log(`   Port: ${process.env.EMAIL_PORT}`);
      console.log(`   User: ${process.env.EMAIL_USER}`);
      console.log(`   Secure: ${process.env.EMAIL_SECURE}`);
      
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // Add timeout and connection settings for Railway
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000,    // 5 seconds
        socketTimeout: 15000,     // 15 seconds
        logger: true,             // Enable detailed logging
        debug: process.env.NODE_ENV === 'production', // Enable debug in production
        // Gmail specific settings
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        // Additional security settings
        requireTLS: true,
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });

      // Test the connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error("❌ SMTP connection verification failed:", error);
          this.setupFallbackService();
        } else {
          console.log("✅ SMTP connection verified successfully");
        }
      });

      this.isConfigured = true;
      console.log("📧 Production email service configured with enhanced settings");
    } catch (error) {
      console.error("❌ Production email setup failed:", error);
      this.setupFallbackService();
    }
  }

  /**
   * Fallback service when email isn't available
   */
  setupFallbackService() {
    this.isConfigured = false;
    console.log(
      "📧 Email service running in fallback mode (codes logged to console)"
    );
  }

  /**
   * Generate verification code
   */
  generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate verification token for email links
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Send email verification code with enhanced logging and timeout protection
   */
  async sendVerificationCode(email, code, userHandle) {
    const startTime = Date.now();
    console.log(`📧 [START] Sending verification email to ${email}`);
    console.log(`📧 [DEBUG] Code: ${code}, Handle: ${userHandle}`);
    
    try {
      if (!this.isConfigured) {
        console.log(`📧 [FALLBACK] Email service not configured - verification code for ${email}: ${code}`);
        return { success: true, messageId: "fallback", preview: null, code };
      }

      console.log(`📧 [CONFIG] Service is configured, preparing email...`);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || "ReceiptoVerse <noreply@receiptoverse.com>",
        to: email,
        subject: "🔐 Your ReceiptoVerse Verification Code",
        html: this.getVerificationEmailTemplate(code, userHandle),
        text: `Hi ${userHandle},\n\nYour ReceiptoVerse verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nThe ReceiptoVerse Team`,
      };

      console.log(`📧 [SENDING] Attempting to send email via SMTP...`);
      console.log(`📧 [TIMEOUT] Setting 20-second timeout for email send...`);
      
      // Create timeout promise to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Email send timeout after 20 seconds'));
        }, 20000);
      });

      const emailPromise = this.transporter.sendMail(mailOptions);
      
      // Race between email send and timeout
      const info = await Promise.race([emailPromise, timeoutPromise]);
      
      const duration = Date.now() - startTime;
      console.log(`📧 [SUCCESS] Email sent in ${duration}ms (ID: ${info.messageId})`);

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 [CODE] Verification code: ${code}`);
      if (previewUrl) {
        console.log(`📧 [PREVIEW] Email preview: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        preview: previewUrl,
        code, // Always include code for development
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [FAILED] Email send failed after ${duration}ms:`, error);
      console.error(`❌ [ERROR_TYPE] ${error.name}: ${error.message}`);
      console.error(`❌ [ERROR_CODE] ${error.code || 'NO_CODE'}`);
      
      // Check specific error types
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
        console.log(`📧 [NETWORK] Network/timeout error detected - this is common on Railway`);
      } else if (error.code === 'EAUTH') {
        console.log(`📧 [AUTH] Authentication error - check Gmail credentials`);
      } else if (error.message.includes('timeout')) {
        console.log(`📧 [TIMEOUT] Custom timeout triggered - SMTP took too long`);
      }

      // Fallback to console logging
      console.log(`📧 [FALLBACK] Verification code for ${email}: ${code}`);

      return {
        success: false,
        error: error.message,
        fallback: true,
        code, // Include code for fallback scenarios
        errorCode: error.code,
        duration
      };
    }
  }
      };
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email, userHandle) {
    try {
      if (!this.isConfigured) {
        console.log(`📧 [FALLBACK] Welcome email for ${email}`);
        return { success: true, messageId: "fallback" };
      }

      const mailOptions = {
        from:
          process.env.EMAIL_FROM || "ReceiptoVerse <noreply@receiptoverse.com>",
        to: email,
        subject: "🎉 Welcome to ReceiptoVerse!",
        html: this.getWelcomeEmailTemplate(userHandle),
        text: `Welcome to ReceiptoVerse, ${userHandle}!\n\nYour account has been successfully verified. You can now:\n\n• Create and manage digital receipts\n• Mint NFT receipts on Hedera\n• Connect with merchants\n• Track your purchases\n\nGet started: https://receiptoverse.com\n\nBest regards,\nThe ReceiptoVerse Team`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${email}`);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verification email HTML template
   */
  getVerificationEmailTemplate(code, userHandle) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ReceiptoVerse Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px solid #2563eb; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ReceiptoVerse Verification</h1>
          <p>Hi ${userHandle}, welcome to the future of digital receipts!</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>To complete your registration and start creating digital receipt NFTs, please enter this verification code:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>🧾 Create digital receipts as NFTs</li>
            <li>🔗 Connect with merchants on Hedera</li>
            <li>📱 Scan QR codes for instant receipts</li>
            <li>💎 Build your digital receipt collection</li>
          </ul>
          
          <p>If you didn't create a ReceiptoVerse account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 ReceiptoVerse - Powered by Hedera Hashgraph</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Welcome email HTML template
   */
  getWelcomeEmailTemplate(userHandle) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ReceiptoVerse</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f0fdfa; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ReceiptoVerse!</h1>
          <p>Hi ${userHandle}, your account is now verified and ready!</p>
        </div>
        <div class="content">
          <h2>You're All Set!</h2>
          <p>Congratulations! Your ReceiptoVerse account has been successfully verified. You can now enjoy all the features of our blockchain-powered receipt platform.</p>
          
          <div class="feature">
            <h3>🧾 Digital Receipt NFTs</h3>
            <p>Transform your receipts into unique NFTs on the Hedera network</p>
          </div>
          
          <div class="feature">
            <h3>🏪 Merchant Network</h3>
            <p>Connect with verified merchants for seamless transactions</p>
          </div>
          
          <div class="feature">
            <h3>📱 QR Code Integration</h3>
            <p>Instant receipt generation through QR code scanning</p>
          </div>
          
          <div class="feature">
            <h3>💎 NFT Collection</h3>
            <p>Build and showcase your digital receipt collection</p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://receiptoverse.com" class="button">Start Using ReceiptoVerse</a>
          </div>
          
          <p>Need help getting started? Check out our <a href="https://receiptoverse.com/guide">Quick Start Guide</a> or contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2025 ReceiptoVerse - Powered by Hedera Hashgraph</p>
          <p>Follow us: <a href="#">Twitter</a> | <a href="#">Discord</a> | <a href="#">Telegram</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return { success: false, error: "Email service not configured" };
      }

      await this.transporter.verify();
      console.log("📧 Email service connection test successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Email service connection test failed:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
