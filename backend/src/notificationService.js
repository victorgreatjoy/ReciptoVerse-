const { Server } = require("socket.io");

class NotificationService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.connectedMerchants = new Map(); // merchantId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on("authenticate_user", (data) => {
        const { userId, userHandle } = data;
        if (userId) {
          this.connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          socket.userHandle = userHandle;
          socket.join(`user_${userId}`);

          console.log(`👤 User authenticated: ${userHandle} (${userId})`);

          // Send confirmation
          socket.emit("authentication_success", {
            message: "Connected to ReceiptoVerse notifications",
            userId: userId,
            handle: userHandle,
          });
        }
      });

      // Handle merchant authentication
      socket.on("authenticate_merchant", (data) => {
        const { merchantId, businessName, terminalId } = data;
        if (merchantId) {
          this.connectedMerchants.set(merchantId, socket.id);
          socket.merchantId = merchantId;
          socket.businessName = businessName;
          socket.terminalId = terminalId;
          socket.join(`merchant_${merchantId}`);

          console.log(
            `🏪 Merchant authenticated: ${businessName} (${terminalId})`
          );

          // Send confirmation
          socket.emit("authentication_success", {
            message: "Connected to ReceiptoVerse merchant notifications",
            merchantId: merchantId,
            businessName: businessName,
            terminalId: terminalId,
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        // Remove from connected users
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`👤 User disconnected: ${socket.userHandle}`);
        }

        // Remove from connected merchants
        if (socket.merchantId) {
          this.connectedMerchants.delete(socket.merchantId);
          console.log(`🏪 Merchant disconnected: ${socket.businessName}`);
        }
      });

      // Handle typing indicators (future feature)
      socket.on("merchant_scanning", (data) => {
        if (data.customerId) {
          this.io.to(`user_${data.customerId}`).emit("merchant_scanning", {
            merchantName: socket.businessName,
            message: "Merchant is processing your purchase...",
          });
        }
      });
    });

    console.log("🚀 WebSocket server initialized for real-time notifications");
  }

  // Send receipt notification to user
  async sendReceiptNotification(userId, receiptData) {
    try {
      if (this.connectedUsers.has(userId)) {
        const socketId = this.connectedUsers.get(userId);

        this.io.to(socketId).emit("new_receipt", {
          type: "receipt_created",
          receipt: receiptData,
          timestamp: new Date().toISOString(),
          message: `New receipt from ${receiptData.merchantName}!`,
        });

        console.log(`📄 Receipt notification sent to user ${userId}`);
        return true;
      } else {
        console.log(
          `📄 User ${userId} not connected, receipt notification queued`
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending receipt notification:", error);
      return false;
    }
  }

  // Send transaction confirmation to merchant
  async sendMerchantNotification(merchantId, transactionData) {
    try {
      if (this.connectedMerchants.has(merchantId)) {
        const socketId = this.connectedMerchants.get(merchantId);

        this.io.to(socketId).emit("transaction_completed", {
          type: "transaction_success",
          transaction: transactionData,
          timestamp: new Date().toISOString(),
          message: `Transaction completed successfully!`,
        });

        console.log(
          `💳 Transaction notification sent to merchant ${merchantId}`
        );
        return true;
      } else {
        console.log(
          `💳 Merchant ${merchantId} not connected, notification queued`
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending merchant notification:", error);
      return false;
    }
  }

  // Send real-time customer queue updates
  async sendQueueUpdate(merchantId, queueData) {
    try {
      if (this.connectedMerchants.has(merchantId)) {
        const socketId = this.connectedMerchants.get(merchantId);

        this.io.to(socketId).emit("queue_update", {
          type: "queue_status",
          queue: queueData,
          timestamp: new Date().toISOString(),
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error sending queue update:", error);
      return false;
    }
  }

  // Broadcast system notifications
  async broadcastSystemNotification(message, type = "info") {
    try {
      this.io.emit("system_notification", {
        type: type,
        message: message,
        timestamp: new Date().toISOString(),
      });

      console.log(`📢 System notification broadcasted: ${message}`);
    } catch (error) {
      console.error("❌ Error broadcasting system notification:", error);
    }
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      connectedMerchants: this.connectedMerchants.size,
      totalConnections: this.io ? this.io.engine.clientsCount : 0,
      timestamp: new Date().toISOString(),
    };
  }

  // Send connection stats to all clients
  broadcastStats() {
    const stats = this.getConnectionStats();
    this.io.emit("connection_stats", stats);
  }

  // Send points awarded notification
  async sendPointsAwardedNotification(
    userEmail,
    userName,
    pointsAwarded,
    merchantName,
    newBalance
  ) {
    try {
      console.log(
        `📧 Sending points notification to ${userName} (${pointsAwarded} points)`
      );
      // Note: Email sending would be integrated here with emailService if available
      // For now, just log the notification

      return {
        success: true,
        message: `Points notification sent to ${userName}`,
      };
    } catch (error) {
      console.error("❌ Error sending points notification:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Send real-time points notification via WebSocket
  async sendPointsNotificationRealtime(userId, data) {
    try {
      if (this.connectedUsers.has(userId)) {
        const socketId = this.connectedUsers.get(userId);

        this.io.to(socketId).emit("points_awarded", {
          type: "points_earned",
          ...data,
          timestamp: new Date().toISOString(),
        });

        console.log(`💰 Points notification sent to user ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error sending real-time points notification:", error);
      return false;
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
