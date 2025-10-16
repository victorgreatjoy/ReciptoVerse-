// Test email service functionality
require("dotenv").config();

const EmailService = require("./src/emailService");

async function testEmailService() {
  console.log("🧪 Testing Email Service...");
  console.log("=".repeat(50));

  const emailService = new EmailService();

  // Wait a moment for initialization
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(
    "Configuration Status:",
    emailService.isConfigured ? "✅ Configured" : "❌ Not Configured"
  );

  if (emailService.isConfigured) {
    console.log("\n📧 Testing email send...");

    try {
      const result = await emailService.sendVerificationCode(
        "test@example.com",
        "123456",
        "TestUser"
      );

      console.log("Email Result:", result);

      if (result.success) {
        console.log("✅ Email service is working!");
      } else {
        console.log("⚠️ Email service fell back to console logging");
      }
    } catch (error) {
      console.log("❌ Email service failed:", error.message);
    }
  } else {
    console.log("⚠️ Email service not configured - will use fallback mode");
  }
}

testEmailService().catch(console.error);
