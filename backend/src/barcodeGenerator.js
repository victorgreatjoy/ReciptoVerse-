const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate QR Code for ReceiptoVerse User
 * Creates a unique barcode that merchants can scan to identify customers
 */
class UserBarcodeGenerator {
  /**
   * Generate barcode data for a user
   * @param {Object} user - User object with id and handle
   * @returns {Object} Barcode data object
   */
  static generateBarcodeData(user) {
    const barcodeData = {
      platform: "ReceiptoVerse",
      version: "1.0",
      userId: user.id,
      handle: user.handle,
      displayName: user.display_name || user.handle,
      generated: Date.now(),
      type: "customer_id",
    };

    return barcodeData;
  }

  /**
   * Generate QR code image from barcode data
   * @param {Object} barcodeData - Barcode data object
   * @returns {Promise<string>} Base64 encoded QR code image
   */
  static async generateQRCodeImage(barcodeData) {
    try {
      const qrOptions = {
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#1a1a2e", // ReceiptoVerse brand color
          light: "#FFFFFF",
        },
        width: 300,
        errorCorrectionLevel: "M",
      };

      const qrCodeDataURL = await QRCode.toDataURL(
        JSON.stringify(barcodeData),
        qrOptions
      );

      return qrCodeDataURL;
    } catch (error) {
      console.error("QR Code generation error:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate complete barcode system for user
   * @param {Object} user - User object
   * @returns {Promise<Object>} Complete barcode system
   */
  static async generateUserBarcode(user) {
    try {
      // Generate barcode data
      const barcodeData = this.generateBarcodeData(user);

      // Generate QR code image
      const qrCodeImage = await this.generateQRCodeImage(barcodeData);

      return {
        barcodeData: JSON.stringify(barcodeData),
        qrCodeImage,
        displayData: {
          handle: user.handle,
          displayName: user.display_name || user.handle,
          platform: "ReceiptoVerse",
          instructions:
            "Show this QR code at checkout to receive digital receipts",
        },
      };
    } catch (error) {
      console.error("User barcode generation error:", error);
      throw error;
    }
  }

  /**
   * Validate scanned barcode data
   * @param {string} scannedData - Raw scanned data
   * @returns {Object|null} Validated barcode data or null if invalid
   */
  static validateScannedBarcode(scannedData) {
    try {
      const barcodeData = JSON.parse(scannedData);

      // Validate required fields
      if (
        barcodeData.platform === "ReceiptoVerse" &&
        barcodeData.userId &&
        barcodeData.handle &&
        barcodeData.type === "customer_id"
      ) {
        return barcodeData;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate unique terminal ID for merchants
   * @param {string} businessName - Business name
   * @returns {string} Unique terminal ID
   */
  static generateTerminalId(businessName) {
    const cleanName = businessName
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 8)
      .toUpperCase();

    const timestamp = Date.now().toString().slice(-6);
    return `${cleanName}${timestamp}`;
  }

  /**
   * Generate API key for merchants
   * @returns {string} Secure API key
   */
  static generateAPIKey() {
    const prefix = "rv_";
    const key = uuidv4().replace(/-/g, "");
    return `${prefix}${key}`;
  }
}

module.exports = UserBarcodeGenerator;
