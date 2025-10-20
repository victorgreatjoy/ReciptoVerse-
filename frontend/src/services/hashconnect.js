import { HashConnect } from "hashconnect";
import { AccountId, LedgerId } from "@hashgraph/sdk";

let hashconnect = null;
let initPromise = null;

const initHashConnect = async () => {
  if (typeof window === "undefined") return;

  if (!hashconnect) {
    const appMetadata = {
      name: "ReceiptoVerse",
      description: "Receipt NFT Platform on Hedera",
      icons: [window.location.origin + "/favicon.ico"],
      url: window.location.origin,
    };

    hashconnect = new HashConnect(
      LedgerId.TESTNET, // Change to LedgerId.MAINNET for production
      import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "default-project-id",
      appMetadata
    );

    console.log("🔷 Initializing HashConnect...");
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
