require("dotenv").config({ path: ".env.development" });
const { GoogleGenAI } = require("@google/genai");

// Make sure environment variable is loaded
if (!process.env.GOOGLE_AI_API_KEY) {
  console.error("❌ GOOGLE_AI_API_KEY not found in environment variables");
  process.exit(1);
}

console.log(
  "✅ API Key loaded:",
  process.env.GOOGLE_AI_API_KEY.substring(0, 10) + "..."
);

// API key will be automatically picked up from GOOGLE_AI_API_KEY env variable
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

async function listModels() {
  try {
    console.log("🔍 Fetching available models...\n");
    const models = await ai.models.list();

    console.log("✅ Available models:");
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error("❌ Error fetching models:", error.message);
    console.error("Full error:", error);
  }
}

listModels();
