import { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import "./ReceiptForm.css";

const ReceiptForm = ({ onSuccess, onCancel, editReceipt = null }) => {
  const { API_BASE } = useUser();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    storeName: "",
    amount: "",
    receiptDate: new Date().toISOString().split("T")[0],
    category: "",
    notes: "",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    name: "",
    price: "",
    quantity: 1,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("ReceiptoVerse_token");
      const response = await fetch(`${API_BASE}/api/receipts/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        // Set default category if not editing
        if (!editReceipt && data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category: data.categories[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [API_BASE, editReceipt]);

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editReceipt) {
      setFormData({
        storeName: editReceipt.storeName || "",
        amount: editReceipt.amount || "",
        receiptDate: editReceipt.receiptDate
          ? new Date(editReceipt.receiptDate).toISOString().split("T")[0]
          : "",
        category: editReceipt.category || "",
        notes: editReceipt.notes || "",
        items: editReceipt.items || [],
      });
    }
    fetchCategories();
  }, [editReceipt, fetchCategories]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field, value) => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (currentItem.name && currentItem.price) {
      const newItem = {
        name: currentItem.name,
        price: parseFloat(currentItem.price),
        quantity: parseInt(currentItem.quantity) || 1,
        total:
          parseFloat(currentItem.price) * (parseInt(currentItem.quantity) || 1),
      };

      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));

      setCurrentItem({ name: "", price: "", quantity: 1 });
    }
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateItemsTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.storeName || !formData.amount || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("ReceiptoVerse_token");
      const url = editReceipt
        ? `${API_BASE}/api/receipts/${editReceipt.id}`
        : `${API_BASE}/api/receipts`;

      const method = editReceipt ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.receipt);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save receipt");
      }
    } catch (error) {
      console.error("Failed to save receipt:", error);
      alert("Failed to save receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const itemsTotal = calculateItemsTotal();
  const amountValue = parseFloat(formData.amount) || 0;
  const totalMismatch =
    formData.items.length > 0 && Math.abs(itemsTotal - amountValue) > 0.01;

  return (
    <div className="receipt-form">
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>📋 Receipt Information</h3>

          <div className="form-group">
            <label htmlFor="storeName">Store Name *</label>
            <input
              id="storeName"
              type="text"
              value={formData.storeName}
              onChange={(e) => handleInputChange("storeName", e.target.value)}
              placeholder="Enter store name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Total Amount *</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
                required
              />
              {totalMismatch && (
                <div className="amount-warning">
                  ⚠️ Amount doesn't match items total: ${itemsTotal.toFixed(2)}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="receiptDate">Receipt Date *</label>
              <input
                id="receiptDate"
                type="date"
                value={formData.receiptDate}
                onChange={(e) =>
                  handleInputChange("receiptDate", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <div className="category-selector">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-option ${
                    formData.category === category.id ? "selected" : ""
                  }`}
                  onClick={() => handleInputChange("category", category.id)}
                  style={{ "--category-color": category.color }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add any additional notes about this receipt..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>🛍️ Items (Optional)</h3>
          <p className="section-description">
            Add individual items to keep detailed records
          </p>

          <div className="item-input-row">
            <input
              type="text"
              placeholder="Item name"
              value={currentItem.name}
              onChange={(e) => handleItemChange("name", e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              value={currentItem.price}
              onChange={(e) => handleItemChange("price", e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={currentItem.quantity}
              onChange={(e) => handleItemChange("quantity", e.target.value)}
            />
            <button
              type="button"
              className="add-item-btn"
              onClick={addItem}
              disabled={!currentItem.name || !currentItem.price}
            >
              ➕
            </button>
          </div>

          {formData.items.length > 0 && (
            <div className="items-list">
              <div className="items-header">
                <span>Item</span>
                <span>Price</span>
                <span>Qty</span>
                <span>Total</span>
                <span></span>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${item.price.toFixed(2)}</span>
                  <span className="item-quantity">{item.quantity}</span>
                  <span className="item-total">${item.total.toFixed(2)}</span>
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <div className="items-total">
                <strong>Items Total: ${itemsTotal.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                {editReceipt ? "Updating..." : "Creating..."}
              </>
            ) : editReceipt ? (
              "💾 Update Receipt"
            ) : (
              "✅ Create Receipt"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReceiptForm;
