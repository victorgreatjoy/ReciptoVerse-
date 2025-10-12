import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import "./ReceiptCreator.css";

const ReceiptCreator = ({ apiBase, onMintSuccess, onError }) => {
  const { accountId, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState({
    merchant: "",
    items: [{ name: "", price: "", quantity: 1 }],
    total: 0,
  });

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
    if (!isConnected || !accountId) {
      onError("Please connect your wallet first!");
      return;
    }

    if (
      !receiptData.merchant ||
      receiptData.items.some((item) => !item.name || !item.price)
    ) {
      onError("Please fill in all receipt details!");
      return;
    }

    try {
      setLoading(true);

      // First associate tokens
      console.log("Associating tokens...");
      const associateResponse = await fetch(`${apiBase}/associate-tokens`, {
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
      const response = await fetch(`${apiBase}/mint-receipt`, {
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
        onMintSuccess(result);

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
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="receipt-creator-disabled">
        <div className="connect-prompt">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <h3>Connect Your Wallet</h3>
          <p>
            Connect your Hedera wallet above to start creating receipt NFTs and
            earning RECV tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-creator">
      <div className="receipt-form">
        <div className="form-header">
          <h2>📝 Create Receipt NFT</h2>
          <p>
            Transform your purchase receipt into a valuable NFT and earn RECV
            tokens
          </p>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label htmlFor="merchant">Merchant Name</label>
            <input
              id="merchant"
              type="text"
              value={receiptData.merchant}
              onChange={(e) =>
                setReceiptData((prev) => ({
                  ...prev,
                  merchant: e.target.value,
                }))
              }
              placeholder="e.g., Coffee Shop Downtown"
              className="merchant-input"
            />
          </div>

          <div className="items-section">
            <div className="items-header">
              <h3>Receipt Items</h3>
              <button onClick={addItem} className="add-item-btn" type="button">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="items-list">
              {receiptData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-number">{index + 1}</div>

                  <div className="item-inputs">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                      className="item-name"
                    />

                    <div className="price-quantity">
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", e.target.value)
                        }
                        className="item-price"
                      />
                      <span className="currency">$</span>

                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        className="item-quantity"
                      />
                    </div>
                  </div>

                  {receiptData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="remove-item-btn"
                      type="button"
                      title="Remove item"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="receipt-summary">
            <div className="total-section">
              <div className="total-label">Total Amount</div>
              <div className="total-amount">
                ${receiptData.total.toFixed(2)}
              </div>
            </div>

            <div className="reward-preview">
              <div className="reward-info">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26" />
                </svg>
                <span>You'll earn 10 RECV tokens for this receipt!</span>
              </div>
            </div>
          </div>

          <button
            onClick={createReceipt}
            disabled={loading || receiptData.total === 0}
            className="create-receipt-btn"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Receipt NFT...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="12" y1="9" x2="12" y2="15" />
                </svg>
                Create Receipt NFT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCreator;
