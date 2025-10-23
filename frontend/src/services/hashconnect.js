import { HashConnect } from "hashconnect";
import { AccountId, LedgerId } from "@hashgraph/sdk";

let hashconnect = null;
let initPromise = null;

const initHashConnect = async () => {
  if (typeof window === "undefined") return;

  if (!hashconnect) {
    // Get WalletConnect project ID
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

    if (
      !projectId ||
      projectId === "default-project-id" ||
      projectId === "your_walletconnect_project_id_here"
    ) {
      console.error("❌ VITE_WALLETCONNECT_PROJECT_ID not configured!");
      console.error(
        "Please get your project ID from: https://cloud.reown.com/"
      );
      throw new Error(
        "WalletConnect project ID is required for HashConnect. Please configure VITE_WALLETCONNECT_PROJECT_ID in your .env file."
      );
    }

    const appMetadata = {
      name: "ReceiptoVerse",
      description: "Receipt NFT Platform on Hedera",
      icons: [window.location.origin + "/favicon.ico"],
      url: window.location.origin,
    };

    // Determine network based on environment
    const network =
      import.meta.env.VITE_HEDERA_NETWORK === "mainnet"
        ? LedgerId.MAINNET
        : LedgerId.TESTNET;

    console.log(
      `🔷 Initializing HashConnect on ${
        network === LedgerId.MAINNET ? "MAINNET" : "TESTNET"
      }...`
    );
    console.log(
      `📡 Using WalletConnect Project ID: ${projectId.substring(0, 8)}...`
    );

    hashconnect = new HashConnect(network, projectId, appMetadata);

    await hashconnect.init();
    console.log("✅ HashConnect initialized successfully");
  }
};

export const getHashConnectInstance = () => {
  if (typeof window === "undefined") {
    throw new Error("HashConnect can only be used on the client side");
  }

  if (!hashconnect) {
    throw new Error(
      "HashConnect not initialized. Call getInitPromise() first."
    );
  }

  return hashconnect;
};

export const getInitPromise = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = initHashConnect();
  }

  return initPromise;
};

export const getConnectedAccountIds = () => {
  if (typeof window === "undefined") return null;

  try {
    const instance = getHashConnectInstance();
    return instance.connectedAccountIds;
  } catch {
    return null;
  }
};
