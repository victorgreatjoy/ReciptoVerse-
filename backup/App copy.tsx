import { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  Wallet,
  Upload,
  Receipt,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";

interface WalletData {
  accountId: string;
  network: string;
}

interface ReceiptData {
  businessName: string;
  customerName: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  date: string;
}

function App() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    businessName: "",
    customerName: "",
    items: [{ name: "", price: 0, quantity: 1 }],
    total: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const RECV_TOKEN_ID = "0.0.6922722";
  const RNFT_TOKEN_ID = "0.0.6922732";

  useEffect(() => {
    initHashConnect();
  }, []);

  const initHashConnect = async () => {
    try {
      // For now, let's implement a working mock version until we resolve the HashConnect API
      // This will allow the UI to work properly
      console.log('HashConnect initialization attempted');
      setMessage({
        type: "info",
        text: "HashConnect ready - click Connect to pair with HashPack wallet (Demo mode)",
      });
    } catch (error) {
      console.error("HashConnect initialization error:", error);
      setMessage({
        type: "error",
        text: "Failed to initialize wallet connection",
      });
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setMessage({ type: "info", text: "Connecting to HashPack wallet..." });

    try {
      // Simulate real wallet connection for now
      // In production, this would use: await hashConnect.openPairingModal();
      setTimeout(() => {
        // Simulate a successful connection with a more realistic account ID
        setWalletData({
          accountId: "0.0.1234567", // More realistic testnet account
          network: "testnet",
        });
        setMessage({
          type: "success",
          text: "HashPack wallet connected! (Demo - replace with real HashConnect)",
        });
        setIsConnecting(false);
      }, 2000);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setMessage({ type: "error", text: "Failed to connect wallet" });
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (hashConnect) {
      try {
        await hashConnect.disconnect();
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
    setWalletData(null);
    setMessage({ type: "info", text: "Wallet disconnected" });
  };

  const associateTokens = async () => {
    if (!walletData) return;

    try {
      setMessage({ type: "info", text: "Associating tokens..." });

      // Use HashConnect's simpler API for token association
      const tokenIds = [RECV_TOKEN_ID, RNFT_TOKEN_ID];

      // Note: Token association needs to be handled through the wallet
      // This is a placeholder - actual implementation would use HashConnect's transaction building
      console.log(
        "Token association would be handled through wallet for:",
        tokenIds
      );

      setMessage({
        type: "info",
        text: "Please use your HashPack wallet to associate tokens manually for now.",
      });
    } catch (error) {
      console.error("Error associating tokens:", error);
      setMessage({ type: "error", text: "Failed to associate tokens" });
    }
  };

  const addItem = () => {
    setReceiptData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", price: 0, quantity: 1 }],
    }));
  };

  const updateItem = (
    index: number,
    field: keyof (typeof receiptData.items)[0],
    value: string | number
  ) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    calculateTotal();
  };

  const removeItem = (index: number) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    calculateTotal();
  };

  const calculateTotal = useCallback(() => {
    const total = receiptData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setReceiptData((prev) => ({ ...prev, total }));
  }, [receiptData.items]);

  const submitReceipt = async () => {
    if (!walletData) {
      setMessage({ type: "error", text: "Please connect your wallet first" });
      return;
    }

    if (
      !receiptData.businessName ||
      !receiptData.customerName ||
      receiptData.items.some((item) => !item.name || item.price <= 0)
    ) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:3001/mint-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...receiptData,
          customerAccountId: walletData.accountId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Receipt NFT created! Transaction: ${result.transactionId}`,
        });
        // Reset form
        setReceiptData({
          businessName: "",
          customerName: "",
          items: [{ name: "", price: 0, quantity: 1 }],
          total: 0,
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to create receipt",
        });
      }
    } catch (error) {
      console.error("Error submitting receipt:", error);
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  return (
    <div className="container">
      <header className="header">
        <h1>
          <Receipt />
          ReciptoVerse
        </h1>
        <p>Create receipt NFTs and earn RECV tokens</p>
      </header>

      {/* Wallet Connection */}
      <div className="card">
        <h2>
          <Wallet />
          Wallet Connection
        </h2>

        {!walletData ? (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn btn-primary"
          >
            {isConnecting ? "Connecting..." : "Connect HashPack Wallet"}
          </button>
        ) : (
          <div>
            <div className="wallet-info">
              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Connected Account:
                </p>
                <p className="wallet-account">{walletData.accountId}</p>
              </div>
              <button onClick={disconnectWallet} className="btn btn-danger">
                Disconnect
              </button>
            </div>

            <button onClick={associateTokens} className="btn btn-success">
              <ShoppingCart size={16} />
              Associate RECV & rNFT Tokens
            </button>
          </div>
        )}
      </div>

      {/* Receipt Form */}
      <div className="card">
        <h2>
          <Upload />
          Create Receipt NFT
        </h2>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input
              type="text"
              value={receiptData.businessName}
              onChange={(e) =>
                setReceiptData((prev) => ({
                  ...prev,
                  businessName: e.target.value,
                }))
              }
              className="form-input"
              placeholder="Enter business name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              value={receiptData.customerName}
              onChange={(e) =>
                setReceiptData((prev) => ({
                  ...prev,
                  customerName: e.target.value,
                }))
              }
              className="form-input"
              placeholder="Enter customer name"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            value={receiptData.date}
            onChange={(e) =>
              setReceiptData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="form-input"
            style={{ width: "auto" }}
          />
        </div>

        {/* Items */}
        <div className="form-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: "500" }}>Items</h3>
            <button
              onClick={addItem}
              className="btn btn-primary"
              style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
            >
              Add Item
            </button>
          </div>

          <div>
            {receiptData.items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, "price", parseFloat(e.target.value) || 0)
                  }
                  className="form-input"
                  step="0.01"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseInt(e.target.value) || 1)
                  }
                  className="form-input"
                  min="1"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  {receiptData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-total">
            Total: ${receiptData.total.toFixed(2)}
          </div>
        </div>

        <button
          onClick={submitReceipt}
          disabled={!walletData || isSubmitting}
          className="btn btn-purple"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {isSubmitting
            ? "Creating Receipt..."
            : "Create Receipt NFT & Earn RECV"}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`message message-${message.type}`}>
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}
    </div>
  );
}

export default App;
