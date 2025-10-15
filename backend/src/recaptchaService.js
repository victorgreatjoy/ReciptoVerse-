// recaptchaService.js
// Google reCAPTCHA verification service for server-side token validation

const fetch = require("node-fetch").default || require("node-fetch");

/**
 * Verify reCAPTCHA token with Google's verification API
 * @param {string} token - The reCAPTCHA token from frontend
 * @param {string} remoteip - Client IP address (optional)
 * @returns {Promise<{success: boolean, score?: number, action?: string, challenge_ts?: string, hostname?: string, 'error-codes'?: string[]}>}
 */
async function verifyRecaptcha(token, remoteip = null) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      throw new Error("RECAPTCHA_SECRET_KEY environment variable is not set");
    }

    if (!token) {
      return {
        success: false,
        "error-codes": ["missing-input-response"],
      };
    }

    // Prepare request body
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);

    if (remoteip) {
      params.append("remoteip", remoteip);
    }

    // Send verification request to Google
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `reCAPTCHA verification request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    // Log verification attempt (for debugging - remove in production)
    console.log("reCAPTCHA verification result:", {
      success: result.success,
      timestamp: result.challenge_ts,
      hostname: result.hostname,
      score: result.score,
      action: result.action,
      errors: result["error-codes"],
    });

    return result;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      "error-codes": ["verification-failed"],
    };
  }
}

/**
 * Middleware function to verify reCAPTCHA for Express routes
 * @param {Object} options - Configuration options
 * @param {number} options.minScore - Minimum score for reCAPTCHA v3 (0.0 to 1.0)
 * @param {string[]} options.allowedActions - Allowed actions for reCAPTCHA v3
 * @returns {Function} Express middleware function
 */
function createRecaptchaMiddleware(options = {}) {
  const { minScore = 0.5, allowedActions = [] } = options;

  return async (req, res, next) => {
    try {
      const token = req.body.recaptchaToken || req.headers["x-recaptcha-token"];

      if (!token) {
        return res.status(400).json({
          success: false,
          error: "reCAPTCHA token is required",
          code: "RECAPTCHA_TOKEN_MISSING",
        });
      }

      // Get client IP
      const clientIP =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

      const verificationResult = await verifyRecaptcha(token, clientIP);

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          error: "reCAPTCHA verification failed",
          code: "RECAPTCHA_VERIFICATION_FAILED",
          details: verificationResult["error-codes"],
        });
      }

      // For reCAPTCHA v3, check score and action
      if (verificationResult.score !== undefined) {
        if (verificationResult.score < minScore) {
          return res.status(400).json({
            success: false,
            error: "reCAPTCHA score too low",
            code: "RECAPTCHA_SCORE_TOO_LOW",
            score: verificationResult.score,
          });
        }

        if (
          allowedActions.length > 0 &&
          !allowedActions.includes(verificationResult.action)
        ) {
          return res.status(400).json({
            success: false,
            error: "reCAPTCHA action not allowed",
            code: "RECAPTCHA_ACTION_NOT_ALLOWED",
            action: verificationResult.action,
          });
        }
      }

      // Add verification result to request object for further use
      req.recaptcha = verificationResult;
      next();
    } catch (error) {
      console.error("reCAPTCHA middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error during reCAPTCHA verification",
        code: "RECAPTCHA_INTERNAL_ERROR",
      });
    }
  };
}

/**
 * Simple verification function for manual use
 * @param {string} token - reCAPTCHA token
 * @returns {Promise<boolean>} True if verification successful
 */
async function isRecaptchaValid(token) {
  const result = await verifyRecaptcha(token);
  return result.success;
}

module.exports = {
  verifyRecaptcha,
  createRecaptchaMiddleware,
  isRecaptchaValid,
};
