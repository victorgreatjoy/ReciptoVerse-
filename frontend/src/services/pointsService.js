import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("receiptoverse_token");
};

// Configure axios instance with auth
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get loyalty tier information
 */
export const getLoyaltyTiers = async () => {
  try {
    const response = await axiosInstance.get("/points/tiers");
    return response.data;
  } catch (error) {
    console.error("Error fetching loyalty tiers:", error);
    throw error;
  }
};

/**
 * Get current user's points balance
 */
export const getPointsBalance = async () => {
  try {
    const response = await axiosInstance.get("/points/balance");
    return response.data;
  } catch (error) {
    console.error("Error fetching points balance:", error);
    throw error;
  }
};

/**
 * Get points transaction history
 * @param {number} limit - Number of records to fetch
 * @param {number} offset - Offset for pagination
 */
export const getPointsHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await axiosInstance.get(
      `/points/history?limit=${limit}&offset=${offset}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching points history:", error);
    throw error;
  }
};

/**
 * Get detailed points statistics
 */
export const getPointsStats = async () => {
  try {
    const response = await axiosInstance.get("/points/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching points stats:", error);
    throw error;
  }
};

/**
 * Award points to a user (merchant only)
 * @param {string} userId - User ID to award points to
 * @param {number} purchaseAmount - Purchase amount
 * @param {string} description - Optional description
 */
export const awardPoints = async (userId, purchaseAmount, description = "") => {
  try {
    const response = await axiosInstance.post("/points/award", {
      userId,
      purchaseAmount,
      description,
    });
    return response.data;
  } catch (error) {
    console.error("Error awarding points:", error);
    throw error;
  }
};

/**
 * Scan QR code and award points (merchant only)
 * @param {object} qrData - QR code data
 * @param {number} purchaseAmount - Purchase amount
 * @param {object} receiptData - Optional receipt data
 * @param {string} merchantApiKey - Merchant API key (optional, will try localStorage if not provided)
 */
export const scanQRAndAwardPoints = async (
  qrData,
  purchaseAmount,
  receiptData = null,
  merchantApiKey = null
) => {
  try {
    const apiKey = merchantApiKey || localStorage.getItem("merchantApiKey");

    if (!apiKey) {
      throw new Error("Merchant API key is required");
    }

    const response = await axios.post(
      `${API_URL}/merchant/scan-qr`,
      {
        qrData,
        purchaseAmount,
        receiptData,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error scanning QR and awarding points:", error);
    throw error;
  }
};

/**
 * Get merchant rewards statistics
 * @param {string} merchantApiKey - Merchant API key (optional, will try localStorage if not provided)
 */
export const getMerchantRewardsStats = async (merchantApiKey = null) => {
  try {
    const apiKey = merchantApiKey || localStorage.getItem("merchantApiKey");

    if (!apiKey) {
      throw new Error(
        "Merchant API key not found. Please ensure you're logged in as a merchant."
      );
    }

    const response = await axios.get(`${API_URL}/merchant/rewards-stats`, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching merchant rewards stats:", error);
    throw error;
  }
};

/**
 * Calculate conversion from points to tokens
 * @param {number} points - Points to convert
 * @param {number} conversionRate - Conversion rate (default: 100 points = 1 token)
 */
export const calculateTokenConversion = (points, conversionRate = 100) => {
  return points / conversionRate;
};

/**
 * Calculate points to next tier
 * @param {number} currentPoints - Current total points earned
 * @param {object} tiers - Loyalty tiers configuration
 */
export const calculatePointsToNextTier = (currentPoints, tiers) => {
  const tierOrder = ["bronze", "silver", "gold", "platinum"];

  for (let i = 0; i < tierOrder.length; i++) {
    const tier = tiers[tierOrder[i]];
    if (currentPoints < tier.minPoints) {
      return tier.minPoints - currentPoints;
    }
  }

  return 0; // Already at max tier
};

export default {
  getLoyaltyTiers,
  getPointsBalance,
  getPointsHistory,
  getPointsStats,
  awardPoints,
  scanQRAndAwardPoints,
  getMerchantRewardsStats,
  calculateTokenConversion,
  calculatePointsToNextTier,
};
