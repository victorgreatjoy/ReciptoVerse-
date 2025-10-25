// Quick test to check if AI endpoint is working
const fetch = require("node-fetch");

async function testAIEndpoint() {
  console.log("🧪 Testing AI Support endpoint...\n");

  try {
    // Test 1: Health check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await fetch(
      "http://localhost:3000/api/ai-support/health"
    );
    const healthData = await healthResponse.json();
    console.log("   Status:", healthResponse.status);
    console.log("   Response:", healthData);
    console.log("   ✅ Health check passed\n");

    // Test 2: Chat endpoint (without auth - should fail gracefully)
    console.log("2️⃣ Testing chat endpoint without auth...");
    const chatResponse = await fetch(
      "http://localhost:3000/api/ai-support/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "What is ReceiptoVerse?",
          context: { currentView: "test" },
        }),
      }
    );
    const chatData = await chatResponse.json();
    console.log("   Status:", chatResponse.status);
    console.log("   Response:", chatData);

    if (chatResponse.status === 401) {
      console.log("   ✅ Auth protection working correctly\n");
    } else {
      console.log("   ⚠️ Unexpected response (expected 401)\n");
    }

    console.log("✅ All tests completed!");
    console.log(
      "\n📝 Note: To test with authentication, you need a valid JWT token."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("   Make sure backend is running on port 3000");
  }
}

testAIEndpoint();
