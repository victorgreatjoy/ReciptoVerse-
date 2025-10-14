import React, { useState, useEffect } from "react";
import "./MerchantPOS.css";

const MerchantPOS = () => {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantData, setMerchantData] = useState(null);
  const [currentStep, setCurrentStep] = useState("scan"); // scan, items, payment, success
  const [scannedCustomer, setScannedCustomer] = useState(null);
  const [qrInput, setQrInput] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", quantity: 1 });
  const [category, setCategory] = useState("other");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentReceipt, setRecentReceipt] = useState(null);

  const categories = [
    "food_beverage",
    "grocery",
    "retail",
    "gas",
    "pharmacy",
    "clothing",
    "electronics",
    "entertainment",
    "services",
    "other",
  ];

  const paymentMethods = ["cash", "card", "digital_wallet", "other"];

  useEffect(() => {
    const savedApiKey = localStorage.getItem("merchantApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      authenticateWithApiKey(savedApiKey);
    }
  }, []);

  const authenticateWithApiKey = async (key) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/merchants/profile",
        {
          headers: { "X-API-Key": key },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMerchantData(data.merchant);
        setIsAuthenticated(true);
        setError("");
      } else {
        throw new Error("Invalid API key or merchant not approved");
      }
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("merchantApiKey", apiKey.trim());
      authenticateWithApiKey(apiKey.trim());
    }
  };

  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      setError("Please enter QR code data");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:3000/api/merchants/pos/scan-qr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({ qrCode: qrInput }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setScannedCustomer(data.customer);
        setCurrentStep("items");
        setQrInput("");
      } else {
        setError(data.message || "Failed to scan QR code");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newItem.name || !newItem.price) {
      setError("Item name and price are required");
      return;
    }

    const price = parseFloat(newItem.price);
    const quantity = parseInt(newItem.quantity);

    if (price <= 0 || quantity <= 0) {
      setError("Price and quantity must be greater than 0");
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name,
      price: price,
      quantity: quantity,
      total: price * quantity,
    };

    setItems([...items, item]);
    setNewItem({ name: "", price: "", quantity: 1 });
    setError("");
  };

  const removeItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateReceipt = async () => {
    if (items.length === 0) {
      setError("Please add at least one item");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:3000/api/merchants/pos/create-receipt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            customerId: scannedCustomer.id,
            items: items,
            totalAmount: getTotalAmount(),
            category: category,
            paymentMethod: paymentMethod,
            notes: notes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRecentReceipt(data.receipt);
        setCurrentStep("success");
        // Update merchant data receipt count
        setMerchantData((prev) => ({
          ...prev,
          receipts_processed: prev.receipts_processed + 1,
        }));
      } else {
        setError(data.message || "Failed to create receipt");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startNewTransaction = () => {
    setCurrentStep("scan");
    setScannedCustomer(null);
    setItems([]);
    setNewItem({ name: "", price: "", quantity: 1 });
    setCategory("other");
    setPaymentMethod("cash");
    setNotes("");
    setRecentReceipt(null);
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("merchantApiKey");
    setApiKey("");
    setIsAuthenticated(false);
    setMerchantData(null);
    startNewTransaction();
  };

  // API Key Input Screen
  if (!isAuthenticated) {
    return (
      <div className="merchant-pos">
        <div className="pos-login">
          <div className="login-header">
            <h1>🏪 Merchant POS System</h1>
            <p>Enter your API key to access the point of sale system</p>
          </div>

          <form onSubmit={handleApiKeySubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="apiKey">API Key</label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="rpto_xxxxxxxxxxxxxxxxxx"
                required
              />
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <button type="submit" disabled={loading} className="login-button">
              {loading ? "⏳ Authenticating..." : "🔑 Access POS"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-pos">
      <div className="pos-header">
        <div className="merchant-info">
          <h1>🏪 {merchantData.business_name}</h1>
          <div className="terminal-id">
            Terminal: {merchantData.terminal_id}
          </div>
        </div>
        <div className="usage-info">
          <div className="receipt-counter">
            {merchantData.receipts_processed} / {merchantData.receipt_limit}{" "}
            receipts
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="pos-content">
        {/* Step 1: Scan Customer QR Code */}
        {currentStep === "scan" && (
          <div className="pos-step scan-step">
            <div className="step-header">
              <h2>📱 Scan Customer QR Code</h2>
              <p>Ask the customer to show their ReciptoVerse QR code</p>
            </div>

            <div className="qr-input-section">
              <div className="input-group">
                <label htmlFor="qrInput">QR Code Data:</label>
                <textarea
                  id="qrInput"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder='Paste or type QR code data (JSON format)&#10;Example: {"userId":"xxx","handle":"customer123"}'
                  rows={4}
                />
              </div>

              {error && <div className="error-message">❌ {error}</div>}

              <button
                onClick={handleScanQR}
                disabled={loading || !qrInput.trim()}
                className="scan-button"
              >
                {loading ? "⏳ Scanning..." : "🔍 Scan QR Code"}
              </button>
            </div>

            <div className="help-text">
              <p>
                💡 The customer's QR code contains their unique ID and handle
                for receipt delivery.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Add Items */}
        {currentStep === "items" && scannedCustomer && (
          <div className="pos-step items-step">
            <div className="customer-info">
              <h3>
                👤 Customer:{" "}
                {scannedCustomer.displayName || scannedCustomer.handle}
              </h3>
              <p>@{scannedCustomer.handle}</p>
            </div>

            <div className="items-section">
              <h3>🛒 Add Items</h3>

              <div className="add-item-form">
                <div className="item-inputs">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                  />
                  <button onClick={addItem} className="add-item-btn">
                    ➕ Add
                  </button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="items-list">
                  <h4>Items ({items.length}):</h4>
                  {items.map((item) => (
                    <div key={item.id} className="item-row">
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <span className="item-calc">
                          ${item.price} x {item.quantity}
                        </span>
                      </div>
                      <div className="item-actions">
                        <span className="item-total">
                          ${item.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="remove-item"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="total-row">
                    <strong>Total: ${getTotalAmount().toFixed(2)}</strong>
                  </div>
                </div>
              )}

              <div className="transaction-details">
                <div className="detail-group">
                  <label htmlFor="category">Category:</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="detail-group">
                  <label htmlFor="paymentMethod">Payment Method:</label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="notes-section">
                <label htmlFor="notes">Notes (optional):</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this transaction..."
                  rows={3}
                />
              </div>

              {error && <div className="error-message">❌ {error}</div>}

              <div className="step-actions">
                <button onClick={startNewTransaction} className="back-button">
                  ⬅️ Back to Scan
                </button>
                <button
                  onClick={handleCreateReceipt}
                  disabled={loading || items.length === 0}
                  className="create-receipt-button"
                >
                  {loading
                    ? "⏳ Creating..."
                    : `💳 Create Receipt ($${getTotalAmount().toFixed(2)})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === "success" && recentReceipt && (
          <div className="pos-step success-step">
            <div className="success-header">
              <div className="success-icon">✅</div>
              <h2>Receipt Created Successfully!</h2>
              <p>Digital receipt has been sent to the customer</p>
            </div>

            <div className="receipt-summary">
              <h3>📄 Receipt Details</h3>
              <div className="summary-row">
                <span>Receipt ID:</span>
                <code>{recentReceipt.id}</code>
              </div>
              <div className="summary-row">
                <span>Customer:</span>
                <span>{recentReceipt.customerName}</span>
              </div>
              <div className="summary-row">
                <span>Total Amount:</span>
                <strong>${recentReceipt.totalAmount.toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Items:</span>
                <span>{recentReceipt.itemCount} items</span>
              </div>
              <div className="summary-row">
                <span>Payment:</span>
                <span>{recentReceipt.paymentMethod.replace("_", " ")}</span>
              </div>
              <div className="summary-row">
                <span>Time:</span>
                <span>
                  {new Date(recentReceipt.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="success-actions">
              <button
                onClick={startNewTransaction}
                className="new-transaction-button"
              >
                🔄 New Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantPOS;
