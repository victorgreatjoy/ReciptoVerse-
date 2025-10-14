const jwt = require("jsonwebtoken");
const { query } = require("./database");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate unique handle
async function generateUniqueHandle(desiredHandle) {
  const baseHandle = desiredHandle.toLowerCase().replace(/[^a-z0-9]/g, "");
  let handle = baseHandle;
  let counter = 1;

  while (true) {
    const existing = await query("SELECT id FROM users WHERE handle = ?", [
      handle,
    ]);

    if (existing.rows.length === 0) {
      return handle;
    }

    handle = `${baseHandle}${counter}`;
    counter++;
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    try {
      // Get current user data
      const result = await query(
        "SELECT * FROM users WHERE id = ? AND account_status = ?",
        [decoded.userId, "active"]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
}

// Optional authentication (for public endpoints that enhance with user data)
function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    try {
      const result = await query(
        "SELECT * FROM users WHERE id = ? AND account_status = ?",
        [decoded.userId, "active"]
      );

      req.user = result.rows.length > 0 ? result.rows[0] : null;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  });
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  generateUniqueHandle,
  JWT_SECRET,
};
