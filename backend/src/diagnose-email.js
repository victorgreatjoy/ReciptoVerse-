// Email Configuration Diagnostic Tool
// Run this to check if email variables are properly configured

// Load environment variables
require("dotenv").config();

const requiredEmailVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_SECURE",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
];

console.log("🔍 EMAIL CONFIGURATION DIAGNOSTIC");
console.log("=".repeat(50));
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Time:", new Date().toISOString());
console.log("=".repeat(50));

let allConfigured = true;

requiredEmailVars.forEach((varName) => {
  const value = process.env[varName];
  const isSet = !!value;
  const maskedValue =
    varName.includes("PASS") || varName.includes("KEY")
      ? value
        ? "***" + value.slice(-4)
        : "NOT SET"
      : value || "NOT SET";

  console.log(`${isSet ? "✅" : "❌"} ${varName}: ${maskedValue}`);

  if (!isSet) allConfigured = false;
});

console.log("=".repeat(50));

if (allConfigured) {
  console.log("✅ All email variables are configured!");

  // Test SMTP connection
  console.log("\n📧 Testing SMTP connection...");

  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ SMTP Connection Failed:", error.message);
    } else {
      console.log("✅ SMTP Connection Successful!");
    }
    process.exit(0);
  });
} else {
  console.log("❌ MISSING EMAIL CONFIGURATION!");
  console.log("\n📋 TO FIX ON RAILWAY:");
  console.log("1. Go to Railway dashboard");
  console.log("2. Click your backend service");
  console.log("3. Go to Variables tab");
  console.log("4. Add these missing variables:");
  console.log("");

  requiredEmailVars.forEach((varName) => {
    if (!process.env[varName]) {
      console.log(`   ${varName}=<your_value_here>`);
    }
  });

  console.log("\n🔧 Copy from RAILWAY_ENV_SETUP.md file");
  process.exit(1);
}
