import React, { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);

  const initializeWallets = async () => {
    console.log("🚀 Starting HashPack detection test...");

    // Clear any previous errors
    setError(null);

    try {
      // Wait for page to fully load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("🔍 Full window object scan for HashPack:");

      // Scan all window properties for anything HashPack related
      const allProps = Object.getOwnPropertyNames(window);
      const hashRelated = allProps.filter(
        (prop) =>
          prop.toLowerCase().includes("hash") ||
          prop.toLowerCase().includes("hedera") ||
          prop.toLowerCase().includes("pack")
      );

      console.log("Properties with 'hash', 'hedera', or 'pack':", hashRelated);

      // Check specific common locations
      console.log("🔍 Specific checks:");
      console.log("window.hashpack:", typeof window.hashpack, window.hashpack);
      console.log("window.ethereum:", typeof window.ethereum, window.ethereum);
      console.log("window.hedera:", typeof window.hedera, window.hedera);
      console.log("window.HashPack:", typeof window.HashPack, window.HashPack);
      console.log(
        "window.hashConnect:",
        typeof window.hashConnect,
        window.hashConnect
      );

      // Check ethereum provider details
      if (window.ethereum) {
        console.log("🔍 Ethereum provider details:");
        console.log("  isHashPack:", window.ethereum.isHashPack);
        console.log("  isMetaMask:", window.ethereum.isMetaMask);
        console.log("  providers:", window.ethereum.providers);
        console.log("  _state:", window.ethereum._state);
        console.log("  chainId:", window.ethereum.chainId);

        // Check available methods
        const methods = Object.getOwnPropertyNames(window.ethereum).filter(
          (prop) => typeof window.ethereum[prop] === "function"
        );
        console.log("  Available methods:", methods);
      }

      // Try different initialization approaches
      const testApproaches = [
        async () => {
          // Approach 1: Direct hashpack object
          if (window.hashpack) {
            console.log("✅ Found window.hashpack");
            return true;
          }
          return false;
        },

        async () => {
          // Approach 2: HashPack via ethereum provider
          if (window.ethereum && window.ethereum.isHashPack) {
            console.log("✅ Found HashPack via ethereum.isHashPack");
            return true;
          }
          return false;
        },

        async () => {
          // Approach 3: Check for HashPack in ethereum providers array
          if (window.ethereum && window.ethereum.providers) {
            const hashpackProvider = window.ethereum.providers.find(
              (p) => p.isHashPack
            );
            if (hashpackProvider) {
              console.log("✅ Found HashPack in providers array");
              return true;
            }
          }
          return false;
        },

        async () => {
          // Approach 4: Try to trigger HashPack event
          console.log("🔄 Triggering HashPack events...");
          window.dispatchEvent(new CustomEvent("hashpack:init"));
          window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));

          // Wait for response
          await new Promise((resolve) => setTimeout(resolve, 2000));

          if (window.hashpack) {
            console.log("✅ HashPack appeared after events");
            return true;
          }
          return false;
        },

        async () => {
          // Approach 5: Check document for HashPack indicators
          const hashpackScript = document.querySelector(
            'script[src*="hashpack"]'
          );
          const hashpackMeta = document.querySelector('meta[name*="hashpack"]');

          if (hashpackScript || hashpackMeta) {
            console.log("✅ Found HashPack in document");
            return true;
          }
          return false;
        },
      ];

      let detected = false;
      for (let i = 0; i < testApproaches.length; i++) {
        console.log(`🔄 Testing approach ${i + 1}...`);
        try {
          if (await testApproaches[i]()) {
            detected = true;
            break;
          }
        } catch (error) {
          console.log(`❌ Approach ${i + 1} failed:`, error.message);
        }
      }

      if (detected) {
        console.log("🎉 HashPack DETECTED!");
        setAvailableWallets([
          {
            name: "HashPack",
            icon: "https://wallet.hashpack.app/assets/favicon/favicon.ico",
            description: "HashPack Wallet",
          },
        ]);
      } else {
        console.log("❌ HashPack NOT DETECTED");
        setError(
          "HashPack not found. Please install the HashPack browser extension."
        );
      }
    } catch (error) {
      console.error("❌ Detection failed:", error);
      setError("Failed to detect wallets: " + error.message);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("🔄 Attempting to connect to HashPack...");

      // Test multiple connection methods
      const connectionMethods = [
        async () => {
          // Method 1: Direct hashpack
          if (window.hashpack && window.hashpack.connectToSite) {
            console.log("📱 Method 1: window.hashpack.connectToSite");
            return await window.hashpack.connectToSite();
          }
          throw new Error("window.hashpack.connectToSite not available");
        },

        async () => {
          // Method 2: Ethereum request
          if (window.ethereum && window.ethereum.request) {
            console.log("📱 Method 2: ethereum.request hedera_requestAccounts");
            return await window.ethereum.request({
              method: "hedera_requestAccounts",
            });
          }
          throw new Error("ethereum.request not available");
        },

        async () => {
          // Method 3: Standard ethereum
          if (window.ethereum && window.ethereum.request) {
            console.log("📱 Method 3: ethereum.request eth_requestAccounts");
            return await window.ethereum.request({
              method: "eth_requestAccounts",
            });
          }
          throw new Error("ethereum.request not available");
        },

        async () => {
          // Method 4: HashPack specific ethereum call
          if (window.ethereum && window.ethereum.isHashPack) {
            console.log("📱 Method 4: HashPack ethereum enable");
            return await window.ethereum.enable();
          }
          throw new Error("HashPack ethereum.enable not available");
        },
      ];

      let accounts = null;
      for (let i = 0; i < connectionMethods.length; i++) {
        try {
          console.log(`🔄 Trying connection method ${i + 1}...`);
          accounts = await connectionMethods[i]();
          console.log(`✅ Method ${i + 1} succeeded:`, accounts);
          break;
        } catch (error) {
          console.log(`❌ Method ${i + 1} failed:`, error.message);
        }
      }

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        console.log("🎉 Successfully connected to:", account);

        setAccountId(account);
        setIsConnected(true);
        localStorage.setItem("wallet_accountId", account);

        setIsConnecting(false);
        return true;
      } else {
        throw new Error("No accounts returned from HashPack");
      }
    } catch (error) {
      console.error("❌ Connection failed:", error);
      setError("Connection failed: " + error.message);
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccountId(null);
    localStorage.removeItem("wallet_accountId");
    console.log("🔌 Wallet disconnected");
  };

  useEffect(() => {
    initializeWallets();
  }, []);

  const value = {
    isConnected,
    accountId,
    isConnecting,
    error,
    availableWallets,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
