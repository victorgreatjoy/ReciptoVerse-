// Environment Variables Test for Railway Production
// This will help diagnose why email variables aren't being detected

console.log("🔍 ENVIRONMENT VARIABLES DIAGNOSTIC");
console.log("=".repeat(60));
console.log("Time:", new Date().toISOString());
console.log("Node Version:", process.version);
console.log("Platform:", process.platform);
console.log("=".repeat(60));

// Check NODE_ENV
console.log("NODE_ENV:", process.env.NODE_ENV);

// Check all EMAIL_ variables
console.log("\n📧 EMAIL VARIABLES:");
const emailVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_SECURE",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
];

let configuredCount = 0;
emailVars.forEach((varName) => {
  const value = process.env[varName];
  const isSet = !!value;
  if (isSet) configuredCount++;

  const displayValue =
    varName.includes("PASS") && value
      ? "***" + value.slice(-4)
      : value || "NOT SET";

  console.log(`${isSet ? "✅" : "❌"} ${varName}: ${displayValue}`);
});

console.log(
  `\n📊 Summary: ${configuredCount}/${emailVars.length} email variables configured`
);

// Check all environment variables starting with EMAIL_
const allEmailVars = Object.keys(process.env).filter((key) =>
  key.startsWith("EMAIL_")
);
console.log(
  `🔍 Found ${allEmailVars.length} EMAIL_ environment variables:`,
  allEmailVars
);

// Check if dotenv is loading anything
console.log("\n🔧 DOTENV CHECK:");
try {
  const dotenv = require("dotenv");
  const result = dotenv.config();
  console.log(
    "Dotenv result:",
    result.error ? result.error.message : "Success"
  );
} catch (error) {
  console.log("Dotenv error:", error.message);
}

// Show total environment variables
console.log(
  `\n📈 Total environment variables: ${Object.keys(process.env).length}`
);

// Check if we're in Railway environment
const railwayVars = Object.keys(process.env).filter(
  (key) =>
    key.startsWith("RAILWAY_") || key === "NIXPACKS_METADATA" || key === "PORT"
);
console.log(
  `🚂 Railway environment variables: ${railwayVars.length}`,
  railwayVars.slice(0, 5)
);

if (configuredCount === emailVars.length) {
  console.log("\n✅ ALL EMAIL VARIABLES ARE CONFIGURED!");
} else {
  console.log("\n❌ MISSING EMAIL VARIABLES - CHECK RAILWAY DASHBOARD");
  console.log("   Go to Railway → Your Project → Backend Service → Variables");
  console.log("   Add the missing variables listed above");
}

console.log("=".repeat(60));
