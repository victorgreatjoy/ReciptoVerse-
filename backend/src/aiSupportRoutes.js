/**
 * AI Support Routes
 * Endpoints for AI-powered customer support
 */

const express = require("express");
const router = express.Router();
const { generateAIResponse, getSuggestions } = require("./aiSupportService");
const { authenticateToken } = require("./auth");

// Rate limiting to prevent abuse
const rateLimit = require("express-rate-limit");

// Limit: 15 requests per minute per user (Gemini free tier limit)
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: {
    error:
      "Too many requests. Please wait a minute before asking another question.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/ai-support/chat
 * Send message to AI and get response
 */
router.post("/chat", authenticateToken, aiChatLimiter, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: "Message too long. Please keep it under 500 characters.",
      });
    }

    console.log(`🤖 AI Support request from user ${req.user.id}`);

    // Add user info to context
    const enrichedContext = {
      ...context,
      userId: req.user.id,
      userEmail: req.user.email,
    };

    const response = await generateAIResponse(message, enrichedContext);

    res.json({
      success: response.success,
      reply: response.reply,
      model: response.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({
      error: "Failed to process your message. Please try again.",
    });
  }
});

/**
 * GET /api/ai-support/suggestions
 * Get context-aware suggested questions
 */
router.get("/suggestions", authenticateToken, async (req, res) => {
  try {
    const { currentView, userType, hasWallet } = req.query;

    const suggestions = getSuggestions({
      currentView,
      userType,
      hasWallet: hasWallet === "true",
    });

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({
      error: "Failed to get suggestions",
    });
  }
});

/**
 * POST /api/ai-support/feedback
 * Submit feedback on AI response
 */
router.post("/feedback", authenticateToken, async (req, res) => {
  try {
    const { helpful, message } = req.body;

    // Log feedback for future improvements
    console.log(
      `📊 AI Feedback from user ${req.user.id}: ${
        helpful ? "👍 Helpful" : "👎 Not helpful"
      }${message ? ` - "${message}"` : ""}`
    );

    // In the future, store this in database for analytics

    res.json({
      success: true,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
    });
  }
});

/**
 * GET /api/ai-support/health
 * Check if AI service is configured and working
 */
router.get("/health", async (req, res) => {
  const isConfigured = !!process.env.GOOGLE_AI_API_KEY;

  res.json({
    success: true,
    configured: isConfigured,
    model: "gemini-1.5-pro",
    status: isConfigured ? "ready" : "not_configured",
  });
});

module.exports = router;
