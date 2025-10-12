import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [accountId, setAccountId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);

  // Initialize wallet detection
  useEffect(() => {
    initializeWallets();
  }, []);

  const initializeWallets = async () => {
    try {
      setError(null);
      console.log("🚀 Initializing wallet system (Direct HashPack)...");

      // Wait a bit for HashPack to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Debug: Check what's available
      console.log("🔍 Debugging available objects:");
      console.log("window.hashpack:", window.hashpack);
      console.log("window.ethereum:", window.ethereum);
      console.log("window.hedera:", window.hedera);
      console.log("window.ethereum?.isHashPack:", window.ethereum?.isHashPack);
      console.log("window.ethereum?.isMetaMask:", window.ethereum?.isMetaMask);
      console.log("window.ethereum?._state:", window.ethereum?._state);
      console.log(
        "All window properties with 'hash':",
        Object.keys(window).filter((key) => key.toLowerCase().includes("hash"))
      );
      console.log(
        "All window properties with 'hedera':",
        Object.keys(window).filter((key) =>
          key.toLowerCase().includes("hedera")
        )
      );

      // Force show HashPack option - it should appear regardless of detection
      console.log("🔧 Force showing HashPack option...");
      setAvailableWallets([
        {
          name: "HashPack",
          icon: "https://wallet.hashpack.app/assets/favicon/favicon.ico",
          description: "HashPack Wallet",
        },
      ]);

      // Check for saved connection
      const savedAccount = localStorage.getItem("wallet_accountId");
      if (savedAccount) {
        console.log("� Found saved account:", savedAccount);
        setAccountId(savedAccount);
        setIsConnected(true);
        setSelectedWallet({
          name: "HashPack",
          description: "Restored connection",
        });
      }
    } catch (error) {
      console.error("❌ Wallet init failed:", error);
      setError("Failed to initialize wallet system");
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log("🔄 Attempting to connect to HashPack...");

      // Try multiple approaches to connect to HashPack
      let accounts = null;

      // Method 1: Direct window.hashpack
      if (window.hashpack && window.hashpack.requestAccounts) {
        console.log("📱 Method 1: Using window.hashpack.requestAccounts");
        try {
          accounts = await window.hashpack.requestAccounts();
        } catch (error) {
          console.warn("Method 1 failed:", error);
        }
      }

      // Method 2: Try window.ethereum if it's HashPack
      if (!accounts && window.ethereum?.isHashPack && window.ethereum.request) {
        console.log("📱 Method 2: Using window.ethereum.request");
        try {
          accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
        } catch (error) {
          console.warn("Method 2 failed:", error);
        }
      }

      // Method 3: Check if there's a hedera object
      if (!accounts && window.hedera && window.hedera.requestAccounts) {
        console.log("📱 Method 3: Using window.hedera.requestAccounts");
        try {
          accounts = await window.hedera.requestAccounts();
        } catch (error) {
          console.warn("Method 3 failed:", error);
        }
      }

      // Method 4: Manual HashPack trigger (sometimes works)
      if (!accounts) {
        console.log("📱 Method 4: Attempting manual HashPack trigger");
        try {
          // Try to manually trigger HashPack
          window.dispatchEvent(new CustomEvent("hashpack-connect"));
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (window.hashpack && window.hashpack.requestAccounts) {
            accounts = await window.hashpack.requestAccounts();
          }
        } catch (error) {
          console.warn("Method 4 failed:", error);
        }
      }

      // Method 5: Try to trigger extension directly
      if (!accounts) {
        console.log(
          "📱 Method 5: Trying to trigger HashPack extension directly"
        );
        try {
          // Try to open HashPack extension popup
          const connectButton = document.querySelector(
            '[data-extension="hashpack"]'
          );
          if (connectButton) {
            connectButton.click();
          }

          // Try different events
          window.dispatchEvent(new CustomEvent("hedera:connect"));
          window.dispatchEvent(new CustomEvent("hashpack:requestAccounts"));

          // Wait a bit longer for HashPack to respond
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Check again after events
          if (window.hashpack?.requestAccounts) {
            accounts = await window.hashpack.requestAccounts();
          } else if (window.ethereum?.request) {
            // Try Hedera-specific methods
            accounts = await window.ethereum.request({
              method: "hedera_requestAccounts",
            });
          }
        } catch (error) {
          console.warn("Method 5 failed:", error);
        }
      }

      // Method 6: Direct browser extension communication
      if (!accounts) {
        console.log("📱 Method 6: Attempting direct extension communication");
        try {
          // This tells the user they need to manually open HashPack
          const userWantsToTryManual = confirm(
            "HashPack extension not responding automatically.\n\n" +
              "Please try:\n" +
              "1. Click the HashPack extension icon in your browser\n" +
              "2. Make sure HashPack is unlocked\n" +
              "3. Then click OK to try connecting again"
          );

          if (userWantsToTryManual) {
            // Wait for user to interact with HashPack
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Try again after user interaction
            if (window.hashpack?.requestAccounts) {
              accounts = await window.hashpack.requestAccounts();
            } else if (window.ethereum?.request) {
              accounts = await window.ethereum.request({
                method: "hedera_requestAccounts",
              });
            }
          }
        } catch (error) {
          console.warn("Method 6 failed:", error);
        }
      }

      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        console.log("✅ Connected to account:", selectedAccount);

        setAccountId(selectedAccount);
        setIsConnected(true);
        setSelectedWallet({
          name: "HashPack",
          description: "Direct connection",
          accountId: selectedAccount,
        });

        // Save connection
        localStorage.setItem("wallet_accountId", selectedAccount);

        setIsConnecting(false);
        return true;
      } else {
        throw new Error(
          "HashPack extension not responding. Please:\n1. Make sure HashPack is installed\n2. Refresh the page\n3. Try clicking the HashPack extension directly"
        );
      }
    } catch (error) {
      console.error("❌ Connection failed:", error);
      setError(error.message || "Failed to connect to HashPack");
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectWallet = () => {
    console.log("🔌 Disconnecting wallet...");
    setAccountId(null);
    setIsConnected(false);
    setSelectedWallet(null);
    setError(null);
    localStorage.removeItem("wallet_accountId");
  };

  const refreshWallets = async () => {
    console.log("🔄 Refreshing wallet detection...");
    await initializeWallets();
  };

  const signTransaction = async () => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      console.log("📝 Signing transaction with HashPack...");
      // This would be implemented when we need actual transaction signing
      // For now, we'll just simulate it
      throw new Error("Transaction signing not yet implemented in direct mode");
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      throw error;
    }
  };

  const value = {
    // State
    accountId,
    isConnected,
    isConnecting,
    selectedWallet,
    availableWallets,
    error,

    // Methods
    connectWallet,
    disconnectWallet,
    refreshWallets,
    signTransaction,

    // Utility (for backward compatibility)
    hashConnect: null,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
