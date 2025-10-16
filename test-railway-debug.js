// Test the Railway debug endpoint
// Run this to check what environment variables are available in production

const https = require("https");

// Replace with your actual Railway backend URL
const RAILWAY_URL = "https://your-railway-backend-url.railway.app";

function testDebugEndpoint() {
  console.log("🔍 Testing Railway debug endpoint...");
  console.log(`URL: ${RAILWAY_URL}/api/debug/env`);

  const options = {
    hostname: RAILWAY_URL.replace("https://", ""),
    path: "/api/debug/env",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const result = JSON.parse(data);
        console.log("✅ Debug endpoint response:");
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.log("📄 Raw response:", data);
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Request failed:", error.message);
  });

  req.end();
}

// Update the URL and run
console.log(
  "⚠️  Please update RAILWAY_URL with your actual Railway backend URL"
);
console.log("Then run: node test-railway-debug.js");

// Uncomment the next line after updating the URL
// testDebugEndpoint();
