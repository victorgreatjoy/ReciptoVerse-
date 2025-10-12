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
      console.log("🚀 Initializing multi-wallet system...");

      // Wait for wallet extensions to load
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const detectedWallets = [];

      // Debug: Check what's available
      console.log("🔍 Scanning for wallet extensions:");
      console.log("window.ethereum:", window.ethereum);
      console.log("window.ethereum?.isMetaMask:", window.ethereum?.isMetaMask);
      console.log("window.ethereum?.isHashPack:", window.ethereum?.isHashPack);
      console.log("window.blade:", window.blade);
      console.log("window.kabila:", window.kabila);

      // 1. MetaMask Detection
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log("✅ MetaMask detected");
        detectedWallets.push({
          id: "metamask",
          name: "MetaMask",
          icon: "https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png",
          description: "Connect using MetaMask (with Hedera network)",
          type: "ethereum"
        });
      }

      // 2. HashPack Detection (keep it as backup)
      if (window.hashpack || window.ethereum?.isHashPack) {
        console.log("✅ HashPack detected");
        detectedWallets.push({
          id: "hashpack",
          name: "HashPack",
          icon: "https://wallet.hashpack.app/assets/favicon/favicon.ico",
          description: "Native Hedera wallet",
          type: "hedera"
        });
      }

      // 3. Blade Wallet Detection
      if (window.blade) {
        console.log("✅ Blade Wallet detected");
        detectedWallets.push({
          id: "blade",
          name: "Blade Wallet",
          icon: "https://bladewallet.io/favicon.ico",
          description: "Multi-chain wallet with Hedera support",
          type: "hedera"
        });
      }

      // 4. Kabila Wallet Detection
      if (window.kabila) {
        console.log("✅ Kabila Wallet detected");
        detectedWallets.push({
          id: "kabila",
          name: "Kabila Wallet",
          icon: "https://kabila.app/favicon.ico",
          description: "Hedera-focused wallet",
          type: "hedera"
        });
      }

      // 5. Generic Ethereum Provider (could be other wallets)
      if (window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isHashPack) {
        console.log("✅ Generic Ethereum provider detected");
        detectedWallets.push({
          id: "ethereum",
          name: "Browser Wallet",
          icon: "https://ethereum.org/static/a110735dade3f354a46fc2446cd52476/81d9f/eth-home-icon.png",
          description: "Connect using browser wallet",
          type: "ethereum"
        });
      }

      // If no wallets detected, show installation options
      if (detectedWallets.length === 0) {
        console.log("⚠️ No wallets detected, showing installation options");
        detectedWallets.push(
          {
            id: "install-metamask",
            name: "Install MetaMask",
            icon: "https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png",
            description: "Most popular wallet - Click to install",
            type: "install",
            installUrl: "https://metamask.io/download/"
          },
          {
            id: "install-hashpack",
            name: "Install HashPack",
            icon: "https://wallet.hashpack.app/assets/favicon/favicon.ico",
            description: "Native Hedera wallet - Click to install",
            type: "install",
            installUrl: "https://www.hashpack.app/download"
          },
          {
            id: "install-blade",
            name: "Install Blade Wallet",
            icon: "https://bladewallet.io/favicon.ico",
            description: "Multi-chain support - Click to install",
            type: "install",
            installUrl: "https://bladewallet.io/"
          }
        );
      }

      setAvailableWallets(detectedWallets);
      console.log(`🎉 Found ${detectedWallets.length} wallet options`);

      // Check for saved connection
      const savedAccount = localStorage.getItem("wallet_accountId");
      const savedWalletType = localStorage.getItem("wallet_type");
      
      if (savedAccount && savedWalletType) {
        console.log("🔄 Found saved connection:", savedAccount, savedWalletType);
        setAccountId(savedAccount);
        setIsConnected(true);
        setSelectedWallet({
          name: savedWalletType,
          description: "Restored connection",
        });
      }

    } catch (error) {
      console.error("❌ Wallet init failed:", error);
      setError("Failed to initialize wallet system");
    }
  };

  const connectWallet = async (walletId) => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log(`🔄 Attempting to connect to ${walletId}...`);

      let accounts = null;
      let walletName = "";

      switch (walletId) {
        case "metamask":
          accounts = await connectMetaMask();
          walletName = "MetaMask";
          break;
          
        case "hashpack":
          accounts = await connectHashPack();
          walletName = "HashPack";
          break;
          
        case "blade":
          accounts = await connectBlade();
          walletName = "Blade Wallet";
          break;
          
        case "kabila":
          accounts = await connectKabila();
          walletName = "Kabila Wallet";
          break;
          
        case "ethereum":
          accounts = await connectGenericEthereum();
          walletName = "Browser Wallet";
          break;

        case "install-metamask":
        case "install-hashpack":
        case "install-blade": {
          const wallet = availableWallets.find(w => w.id === walletId);
          window.open(wallet.installUrl, '_blank');
          throw new Error("Please install the wallet and refresh the page");
        }

        default:
          throw new Error("Unknown wallet type");
      }

      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        console.log("✅ Connected to account:", selectedAccount);

        setAccountId(selectedAccount);
        setIsConnected(true);
        setSelectedWallet({ 
          name: walletName, 
          description: "Connected",
          id: walletId
        });

        // Save connection
        localStorage.setItem("wallet_accountId", selectedAccount);
        localStorage.setItem("wallet_type", walletName);
        
        setIsConnecting(false);
        return true;
      } else {
        throw new Error(`No accounts returned from ${walletName}`);
      }

    } catch (error) {
      console.error("❌ Connection failed:", error);
      setError(error.message || "Failed to connect wallet");
      setIsConnecting(false);
      return false;
    }
  };

  // Individual wallet connection methods
  const connectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      throw new Error("MetaMask not detected");
    }

    console.log("📱 Connecting to MetaMask...");
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // For Hedera, we might need to switch networks or use a different approach
      // For now, we'll use the Ethereum account format
      console.log("MetaMask accounts:", accounts);
      return accounts;
      
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("User rejected connection request");
      }
      throw new Error("Failed to connect to MetaMask: " + error.message);
    }
  };

  const connectHashPack = async () => {
    console.log("📱 Connecting to HashPack...");
    
    // Try multiple HashPack connection methods
    if (window.hashpack && window.hashpack.requestAccounts) {
      return await window.hashpack.requestAccounts();
    }
    
    if (window.ethereum && window.ethereum.isHashPack) {
      return await window.ethereum.request({ method: 'hedera_requestAccounts' });
    }
    
    throw new Error("HashPack not available");
  };

  const connectBlade = async () => {
    if (!window.blade) {
      throw new Error("Blade Wallet not detected");
    }

    console.log("📱 Connecting to Blade Wallet...");
    
    try {
      const result = await window.blade.createHederaAccount();
      return [result.accountId];
    } catch (error) {
      throw new Error("Failed to connect to Blade Wallet: " + error.message);
    }
  };

  const connectKabila = async () => {
    if (!window.kabila) {
      throw new Error("Kabila Wallet not detected");
    }

    console.log("📱 Connecting to Kabila Wallet...");
    
    try {
      const accounts = await window.kabila.requestAccounts();
      return accounts;
    } catch (error) {
      throw new Error("Failed to connect to Kabila Wallet: " + error.message);
    }
  };

  const connectGenericEthereum = async () => {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider detected");
    }

    console.log("📱 Connecting to generic Ethereum provider...");
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      return accounts;
    } catch (error) {
      throw new Error("Failed to connect to wallet: " + error.message);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccountId(null);
    setSelectedWallet(null);
    localStorage.removeItem("wallet_accountId");
    localStorage.removeItem("wallet_type");
    console.log("🔌 Wallet disconnected");
  };

  const value = {
    isConnected,
    accountId,
    isConnecting,
    error,
    availableWallets,
    selectedWallet,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};