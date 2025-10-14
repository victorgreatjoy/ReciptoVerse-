import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import "./QRTestHelper.css";

const QRTestHelper = () => {
  const { user } = useUser();
  const [customerQR, setCustomerQR] = useState("");
  const [sampleItems, setSampleItems] = useState([
    { name: "Coffee", price: "4.50", quantity: 1 },
    { name: "Sandwich", price: "8.99", quantity: 1 },
    { name: "Chips", price: "2.25", quantity: 2 },
  ]);

  useEffect(() => {
    if (user) {
      const qrData = {
        userId: user.id,
        handle: user.handle,
        timestamp: Date.now(),
      };
      setCustomerQR(JSON.stringify(qrData));
    }
  }, [user]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const addSampleItem = () => {
    const newItem = { name: "", price: "", quantity: 1 };
    setSampleItems([...sampleItems, newItem]);
  };

  const updateSampleItem = (index, field, value) => {
    const updated = [...sampleItems];
    updated[index][field] = value;
    setSampleItems(updated);
  };

  const removeSampleItem = (index) => {
    setSampleItems(sampleItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return sampleItems.reduce((sum, item) => {
      return (
        sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)
      );
    }, 0);
  };

  if (!user) {
    return (
      <div className="qr-test-helper">
        <div className="auth-required">
          <h3>⚠️ Authentication Required</h3>
          <p>Please log in to access the QR Test Helper</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-test-helper">
      <div className="helper-header">
        <h2>🧪 POS Testing Helper</h2>
        <p>Use this tool to test the merchant POS system with sample data</p>
      </div>

      <div className="helper-sections">
        {/* Customer QR Code Section */}
        <div className="helper-section">
          <h3>👤 Customer QR Code</h3>
          <p>This is your QR code data that merchants will scan:</p>

          <div className="qr-data-box">
            <div className="customer-info">
              <strong>Customer:</strong> {user.display_name || user.handle} (@
              {user.handle})
            </div>

            <div className="qr-code-display">
              <label>QR Code Data:</label>
              <textarea
                value={customerQR}
                readOnly
                rows={3}
                className="qr-data-textarea"
              />
              <button
                onClick={() => copyToClipboard(customerQR)}
                className="copy-button"
              >
                📋 Copy QR Data
              </button>
            </div>
          </div>
        </div>

        {/* Sample Transaction Section */}
        <div className="helper-section">
          <h3>🛒 Sample Transaction Builder</h3>
          <p>Build a sample transaction to test receipt creation:</p>

          <div className="sample-items">
            <h4>Items:</h4>
            {sampleItems.map((item, index) => (
              <div key={index} className="sample-item-row">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) =>
                    updateSampleItem(index, "name", e.target.value)
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) =>
                    updateSampleItem(index, "price", e.target.value)
                  }
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateSampleItem(index, "quantity", e.target.value)
                  }
                />
                <button
                  onClick={() => removeSampleItem(index)}
                  className="remove-item-btn"
                >
                  ❌
                </button>
              </div>
            ))}

            <div className="sample-actions">
              <button onClick={addSampleItem} className="add-item-btn">
                ➕ Add Item
              </button>
            </div>

            <div className="sample-total">
              <strong>Total: ${getTotalAmount().toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Test Instructions Section */}
        <div className="helper-section">
          <h3>📝 Testing Instructions</h3>
          <div className="instructions">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Get Merchant Credentials:</strong>
                <p>
                  Go to "🏪 Be a Merchant" tab and register as a merchant. Save
                  your API key and Terminal ID.
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Access POS System:</strong>
                <p>
                  Go to "💳 POS System" tab and enter your merchant API key to
                  access the POS interface.
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Scan Customer QR:</strong>
                <p>
                  Copy the QR Code Data above and paste it into the POS system's
                  QR input field.
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <strong>Add Items:</strong>
                <p>
                  Add the sample items or create your own items in the POS
                  system.
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <strong>Complete Transaction:</strong>
                <p>
                  Create the receipt and verify it appears in your "📄 My
                  Receipts" section.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Test Data Section */}
        <div className="helper-section">
          <h3>⚡ Quick Test Data</h3>
          <div className="quick-data">
            <div className="data-item">
              <label>Sample Category:</label>
              <code>food_beverage</code>
            </div>
            <div className="data-item">
              <label>Sample Payment Method:</label>
              <code>card</code>
            </div>
            <div className="data-item">
              <label>Sample Notes:</label>
              <code>Test transaction from POS system</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRTestHelper;
