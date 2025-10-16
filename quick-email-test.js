// Quick email test
require("dotenv").config();

console.log("Testing email configuration...");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "***" + process.env.EMAIL_PASS.slice(-4) : "NOT SET"
);

if (!process.env.EMAIL_HOST) {
  console.log("❌ EMAIL variables not loaded from .env file");
} else {
  console.log("✅ EMAIL variables loaded successfully");
}
