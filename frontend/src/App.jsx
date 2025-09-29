import { useState } from "react";
import "./App.css";

function App() {
  // API Configuration for deployment
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL || "https://your-backend-url.railway.app"
    : "http://localhost:3000";

  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState({
    merchant: "",
    items: [{ name: "", price: "", quantity: 1 }],
    total: 0,
  });
  const [lastMintedNFT, setLastMintedNFT] = useState(null);

  // Simulate wallet connection for MVP testing
  const connectWallet = () => {
    setAccountId("0.0.6913837"); // Your operator account for testing
    alert("Mock wallet connected! Using operator account for testing.");
  };

  // Add new item to receipt
  const addItem = () => {
    setReceiptData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", price: "", quantity: 1 }],
    }));
  };

  // Update item in receipt
  const updateItem = (index, field, value) => {
    const newItems = [...receiptData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate total
    const total = newItems.reduce((sum, item) => {
      return (
        sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)
      );
    }, 0);

    setReceiptData((prev) => ({
      ...prev,
      items: newItems,
      total: total,
    }));
  };

  // Remove item from receipt
  const removeItem = (index) => {
    if (receiptData.items.length > 1) {
      const newItems = receiptData.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => {
        return (
          sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)
        );
      }, 0);

      setReceiptData((prev) => ({
        ...prev,
        items: newItems,
        total: total,
      }));
    }
  };

  // Create receipt NFT
  const createReceipt = async () => {
    if (!accountId) {
      alert("Please connect your wallet first!");
      return;
    }

    if (
      !receiptData.merchant ||
      receiptData.items.some((item) => !item.name || !item.price)
    ) {
      alert("Please fill in all receipt details!");
      return;
    }

    try {
      setLoading(true);

      // First associate tokens
      console.log("Associating tokens...");
      const associateResponse = await fetch(`${API_BASE}/associate-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!associateResponse.ok) {
        const error = await associateResponse.json();
        console.log("Association response:", error);
        // Continue anyway - tokens might already be associated
      }

      // Create receipt NFT
      console.log("Creating receipt NFT...");
      const response = await fetch(`${API_BASE}/mint-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant: receiptData.merchant,
          items: receiptData.items,
          total: receiptData.total,
          customerWallet: accountId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setLastMintedNFT(result);
        alert("Receipt NFT created successfully! 🎉");

        // Reset form
        setReceiptData({
          merchant: "",
          items: [{ name: "", price: "", quantity: 1 }],
          total: 0,
        });
      } else {
        throw new Error(result.error || "Failed to create receipt");
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
      alert("Failed to create receipt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🧾 ReciptoVerse MVP</h1>
        <p>Create receipt NFTs and earn RECV tokens</p>
      </header>

      <main className="main">
        {/* Wallet Connection */}
        <div className="wallet-section">
          {!accountId ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="connect-btn"
            >
              Connect Wallet (Mock)
            </button>
          ) : (
            <div className="wallet-connected">
              <span className="status">✅ Connected</span>
              <span className="account">{accountId}</span>
            </div>
          )}
        </div>

        {/* Receipt Form */}
        {accountId && (
          <div className="receipt-form">
            <h2>Create Receipt</h2>

            <div className="form-group">
              <label>Merchant Name:</label>
              <input
                type="text"
                value={receiptData.merchant}
                onChange={(e) =>
                  setReceiptData((prev) => ({
                    ...prev,
                    merchant: e.target.value,
                  }))
                }
                placeholder="e.g., Coffee Shop Downtown"
              />
            </div>

            <div className="items-section">
              <h3>Items:</h3>
              {receiptData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                  />
                  {receiptData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="remove-btn"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}

              <button onClick={addItem} className="add-item-btn">
                + Add Item
              </button>
            </div>

            <div className="total-section">
              <strong>Total: ${receiptData.total.toFixed(2)}</strong>
            </div>

            <button
              onClick={createReceipt}
              disabled={loading}
              className="create-btn"
            >
              {loading ? "Creating Receipt NFT..." : "Create Receipt NFT"}
            </button>
          </div>
        )}

        {/* Last Minted NFT */}
        {lastMintedNFT && (
          <div className="nft-result">
            <h3>🎉 Receipt NFT Created!</h3>
            <div className="nft-details">
              <p>
                <strong>NFT ID:</strong> {lastMintedNFT.receiptNFT}
              </p>
              <p>
                <strong>Reward:</strong> {lastMintedNFT.reward}
              </p>
              <p>
                <strong>Status:</strong> {lastMintedNFT.status}
              </p>
              <p>
                <strong>Test Mode:</strong>{" "}
                {lastMintedNFT.testMode ? "Yes" : "No"}
              </p>

              <div className="nft-links">
                <a
                  href={lastMintedNFT.nftViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-btn"
                >
                  View on HashScan
                </a>
                <a
                  href={lastMintedNFT.metadataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="metadata-btn"
                >
                  View Metadata
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
