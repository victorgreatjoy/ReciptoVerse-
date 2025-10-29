const crypto = require("crypto");
const { getDLTGateway } = require("./dltGateway");
const { query } = require("../../database");
const { v4: uuidv4 } = require("uuid");

/**
 * HCS Receipt Service - Receipt anchoring and verification using Hedera Consensus Service
 * Provides immutable proof-of-receipt storage on Hedera blockchain
 */
class HCSReceiptService {
  constructor() {
    this.dltGateway = getDLTGateway();
    this.receiptTopicId = process.env.HCS_RECEIPT_TOPIC_ID || null;
  }

  /**
   * Initialize the service (create topic if needed)
   */
  async initialize() {
    try {
      await this.dltGateway.initialize();

      // Create receipt topic if not exists
      if (!this.receiptTopicId) {
        console.log("📋 No receipt topic found, creating new HCS topic...");
        const topic = await this.dltGateway.createTopic(
          "ReceiptoVerse - Receipt Anchoring Topic"
        );
        this.receiptTopicId = topic.topicId;

        console.log(`✅ Created receipt topic: ${this.receiptTopicId}`);
        console.log(
          `⚠️  Add to .env: HCS_RECEIPT_TOPIC_ID=${this.receiptTopicId}`
        );
      } else {
        console.log(`✅ Using existing receipt topic: ${this.receiptTopicId}`);
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize HCS Receipt Service:", error);
      throw error;
    }
  }

  /**
   * Generate receipt hash (SHA-256)
   */
  generateReceiptHash(receiptData) {
    // Normalize and create deterministic hash from key receipt fields
    let items = receiptData.items || [];
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (_) {
        items = [];
      }
    }

    const hashInput = {
      id: receiptData.id,
      merchantId: receiptData.merchant_id || null,
      total: parseFloat(receiptData.amount),
      currency: receiptData.currency || "USD",
      date: receiptData.receipt_date,
      items,
    };

    const hashString = JSON.stringify(hashInput);
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }

  /**
   * Hash sensitive data for privacy (one-way hash)
   */
  hashForPrivacy(data) {
    if (!data) return null;
    return crypto
      .createHash("sha256")
      .update(data.toString())
      .digest("hex")
      .substring(0, 16); // Shortened hash for privacy
  }

  /**
   * Anchor receipt to HCS (immutable storage)
   */
  async anchorReceipt(receiptData) {
    try {
      console.log(`📌 Anchoring receipt ${receiptData.id} to HCS...`);

      // 1. Generate receipt hash
      const receiptHash = this.generateReceiptHash(receiptData);

      // 2. Prepare minimal on-chain data (privacy-compliant, no PII)
      const chainData = {
        receiptId: receiptData.id,
        hash: receiptHash,
        timestamp: Date.now(),
        merchantId: receiptData.merchant_id
          ? this.hashForPrivacy(receiptData.merchant_id)
          : null,
        userId: receiptData.user_id
          ? this.hashForPrivacy(receiptData.user_id)
          : null,
        total: parseFloat(receiptData.amount),
        currency: receiptData.currency || "USD",
        itemCount: receiptData.items ? receiptData.items.length : 0,
        version: "1.0",
      };

      // 3. Publish to HCS topic
      const hcsReceipt = await this.dltGateway.publishToHCS(
        this.receiptTopicId,
        chainData
      );

      // 4. Store HCS metadata in database
      await query(
        `
        UPDATE receipts 
        SET hcs_topic_id = ?, 
            hcs_sequence = ?, 
            hcs_timestamp = ?,
            receipt_hash = ?,
            hcs_transaction_id = ?,
            hcs_anchored_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [
          this.receiptTopicId,
          hcsReceipt.sequenceNumber,
          hcsReceipt.consensusTimestamp,
          receiptHash,
          hcsReceipt.transactionId,
          receiptData.id,
        ]
      );

      console.log(`✅ Receipt ${receiptData.id} anchored to HCS`);
      console.log(`   Topic: ${this.receiptTopicId}`);
      console.log(`   Sequence: ${hcsReceipt.sequenceNumber}`);
      console.log(`   Hash: ${receiptHash}`);

      return {
        success: true,
        receiptId: receiptData.id,
        receiptHash,
        hcsTopicId: this.receiptTopicId,
        hcsSequence: hcsReceipt.sequenceNumber,
        hcsTimestamp: hcsReceipt.consensusTimestamp,
        hcsTransactionId: hcsReceipt.transactionId,
      };
    } catch (error) {
      console.error(`❌ Failed to anchor receipt ${receiptData.id}:`, error);
      throw error;
    }
  }

  /**
   * Verify receipt integrity (compare DB hash with HCS)
   */
  async verifyReceipt(receiptId) {
    try {
      console.log(`🔍 Verifying receipt ${receiptId}...`);

      // 1. Get receipt from database
      const dbResult = await query("SELECT * FROM receipts WHERE id = ?", [
        receiptId,
      ]);

      if (dbResult.rows.length === 0) {
        return {
          isValid: false,
          error: "Receipt not found in database",
        };
      }

      const dbReceipt = dbResult.rows[0];

      // Check if receipt has been anchored
      if (!dbReceipt.hcs_topic_id || !dbReceipt.hcs_sequence) {
        return {
          isValid: false,
          error: "Receipt not anchored to HCS yet",
          receipt: dbReceipt,
        };
      }

      // 2. Fetch HCS messages for this topic
      const hcsMessages = await this.dltGateway.getHCSMessages(
        dbReceipt.hcs_topic_id,
        100
      );

      // 3. Find the specific message by sequence number
      const hcsMessage = hcsMessages.find(
        (msg) => msg.sequence_number === parseInt(dbReceipt.hcs_sequence)
      );

      if (!hcsMessage) {
        return {
          isValid: false,
          error: "HCS message not found",
          dbData: {
            topicId: dbReceipt.hcs_topic_id,
            sequence: dbReceipt.hcs_sequence,
          },
        };
      }

      // 4. Decode and parse HCS message
      const hcsData = JSON.parse(
        Buffer.from(hcsMessage.message, "base64").toString("utf8")
      );

      // 5. Compare hashes
      const isValid = dbReceipt.receipt_hash === hcsData.hash;

      console.log(
        `${isValid ? "✅" : "❌"} Receipt ${receiptId} verification ${
          isValid ? "passed" : "failed"
        }`
      );

      return {
        isValid,
        receipt: {
          id: receiptId,
          hash: dbReceipt.receipt_hash,
          hcsTopicId: dbReceipt.hcs_topic_id,
          hcsSequence: dbReceipt.hcs_sequence,
          hcsTimestamp: dbReceipt.hcs_timestamp,
        },
        hcsData: {
          hash: hcsData.hash,
          timestamp: hcsData.timestamp,
          consensusTimestamp: hcsMessage.consensus_timestamp,
          runningHash: hcsMessage.running_hash,
        },
        match: {
          hashMatch: dbReceipt.receipt_hash === hcsData.hash,
          receiptIdMatch: dbReceipt.id === hcsData.receiptId,
        },
      };
    } catch (error) {
      console.error(`❌ Failed to verify receipt ${receiptId}:`, error);
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  /**
   * Get proof for third-party verification
   */
  async getReceiptProof(receiptId) {
    try {
      const dbResult = await query(
        `
        SELECT id, hcs_topic_id, hcs_sequence, hcs_timestamp, 
               receipt_hash, hcs_transaction_id, hcs_anchored_at,
               amount, receipt_date
        FROM receipts 
        WHERE id = ?
      `,
        [receiptId]
      );

      if (dbResult.rows.length === 0) {
        throw new Error("Receipt not found");
      }

      const receipt = dbResult.rows[0];

      if (!receipt.hcs_topic_id) {
        throw new Error("Receipt not anchored to HCS");
      }

      // Fetch HCS message for full proof
      const hcsMessages = await this.dltGateway.getHCSMessages(
        receipt.hcs_topic_id,
        100
      );

      const hcsMessage = hcsMessages.find(
        (msg) => msg.sequence_number === parseInt(receipt.hcs_sequence)
      );

      return {
        receiptId: receipt.id,
        receiptHash: receipt.receipt_hash,
        hcsProof: {
          topicId: receipt.hcs_topic_id,
          sequenceNumber: receipt.hcs_sequence,
          consensusTimestamp: receipt.hcs_timestamp,
          transactionId: receipt.hcs_transaction_id,
          anchoredAt: receipt.hcs_anchored_at,
          runningHash: hcsMessage?.running_hash,
        },
        receiptData: {
          total: receipt.amount,
          currency: receipt.currency || "USD",
          date: receipt.receipt_date,
        },
        verificationUrl: `${
          process.env.API_URL || "http://localhost:3000"
        }/api/receipts/${receiptId}/verify`,
        mirrorNodeUrl: `${this.dltGateway.mirrorNodeUrl}/api/v1/topics/${receipt.hcs_topic_id}/messages/${receipt.hcs_sequence}`,
      };
    } catch (error) {
      console.error(`❌ Failed to get receipt proof:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to receipt topic and process new messages
   */
  async startMessageListener(callback) {
    try {
      console.log(
        `👂 Starting HCS message listener for topic ${this.receiptTopicId}...`
      );

      await this.dltGateway.subscribeToHCS(
        this.receiptTopicId,
        async (message) => {
          try {
            const data = JSON.parse(message.contents);

            // Store in hcs_events table
            await query(
              `
            INSERT INTO hcs_events (id, topic_id, sequence_number, consensus_timestamp, message_type, message_data, processed)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
              [
                uuidv4(),
                message.topicId,
                message.sequenceNumber,
                message.consensusTimestamp,
                "receipt",
                data,
                false,
              ]
            );

            console.log(`📨 Received HCS message: ${data.receiptId}`);

            if (callback) {
              await callback(message, data);
            }
          } catch (error) {
            console.error("❌ Error processing HCS message:", error);
          }
        }
      );

      console.log("✅ HCS message listener started");
    } catch (error) {
      console.error("❌ Failed to start message listener:", error);
      throw error;
    }
  }

  /**
   * Bulk anchor multiple receipts (for migration)
   */
  async bulkAnchorReceipts(receiptIds) {
    console.log(`📦 Bulk anchoring ${receiptIds.length} receipts...`);

    const results = {
      success: [],
      failed: [],
    };

    for (const receiptId of receiptIds) {
      try {
        const receiptResult = await query(
          "SELECT * FROM receipts WHERE id = $1",
          [receiptId]
        );

        if (receiptResult.rows.length === 0) {
          results.failed.push({ receiptId, error: "Not found" });
          continue;
        }

        const result = await this.anchorReceipt(receiptResult.rows[0]);
        results.success.push(result);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.failed.push({ receiptId, error: error.message });
      }
    }

    console.log(`✅ Bulk anchoring complete:`);
    console.log(`   Success: ${results.success.length}`);
    console.log(`   Failed: ${results.failed.length}`);

    return results;
  }
}

// Singleton instance
let instance = null;

function getHCSReceiptService() {
  if (!instance) {
    instance = new HCSReceiptService();
  }
  return instance;
}

module.exports = {
  HCSReceiptService,
  getHCSReceiptService,
};
