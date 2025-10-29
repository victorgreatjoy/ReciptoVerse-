import { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { LoadingSpinner } from "./ui";
import "./ReceiptDashboard.css";

// Updated: Oct 17, 2025 - Enhanced UI/UX
const ReceiptDashboard = () => {
  const { API_BASE, token } = useUser();
  const [receipts, setReceipts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    startDate: "",
    endDate: "",
    sortBy: "receipt_date",
    sortOrder: "DESC",
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/receipts/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [API_BASE, token]);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        ...filters,
        limit: 50,
      });

      const url = `${API_BASE}/api/receipts?${queryParams}`;
      console.log("📄 Fetching receipts from:", url);
      console.log("🔑 Token:", token ? "Present" : "Missing");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Receipts data:", data);
        console.log("📝 Number of receipts:", data.receipts?.length || 0);

        // Normalize HCS fields and verification flag
        const normalizeReceipt = (r) => {
          const hcsTopicId =
            r.hcsTopicId || r.hcs_topic_id || r.topicId || r.hcs_topicid;
          const hcsSequence = r.hcsSequence || r.hcs_sequence || r.sequence;
          const hcsConsensusTimestamp =
            r.hcsConsensusTimestamp ||
            r.hcs_consensus_timestamp ||
            r.consensusTimestamp;
          const isVerified = r.isVerified ?? Boolean(hcsTopicId && hcsSequence);

          // Debug logging for HCS fields
          if (hcsTopicId || hcsSequence) {
            console.log(
              `🔍 Receipt ${r.id}: topic=${hcsTopicId}, seq=${hcsSequence}, verified=${isVerified}`
            );
          }

          return {
            ...r,
            hcsTopicId,
            hcsSequence,
            hcsConsensusTimestamp,
            isVerified,
          };
        };

        const normalized = Array.isArray(data.receipts)
          ? data.receipts.map(normalizeReceipt)
          : [];
        console.log(
          "✅ Normalized receipts:",
          normalized.map((r) => ({
            id: r.id,
            hcsTopicId: r.hcsTopicId,
            hcsSequence: r.hcsSequence,
            isVerified: r.isVerified,
          }))
        );
        setReceipts(normalized);
      } else {
        const errorData = await response.text();
        console.error(
          "❌ Failed to fetch receipts:",
          response.status,
          errorData
        );
      }
    } catch (error) {
      console.error("❌ Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, filters, token]);

  // Fetch categories and receipts
  useEffect(() => {
    fetchCategories();
    fetchReceipts();
  }, [fetchCategories, fetchReceipts]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Hedera helpers
  const formatHederaTimestamp = (ts) => {
    if (!ts) return null;
    if (typeof ts === "number") return new Date(ts * 1000).toLocaleString();
    if (typeof ts === "string") {
      const match = ts.match(/^(\d+)(?:\.(\d+))?$/);
      if (match) {
        const seconds = parseInt(match[1], 10);
        if (!isNaN(seconds)) return new Date(seconds * 1000).toLocaleString();
      }
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    return String(ts);
  };

  const getCategoryData = (categoryId) => {
    return (
      categories.find((cat) => cat.id === categoryId) || {
        name: categoryId,
        icon: "📋",
        color: "#6b7280",
      }
    );
  };

  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

  return (
    <div className="receipt-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>My Receipts</h2>
          <p>View receipts received from merchants</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{receipts.length}</h3>
            <p>Total Receipts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatAmount(totalSpent)}</h3>
            <p>Total Spent</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{categories.filter((cat) => cat.count > 0).length}</h3>
            <p>Categories Used</p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filters">
        <button
          className={`category-pill ${
            filters.category === "all" ? "active" : ""
          }`}
          onClick={() => handleFilterChange("category", "all")}
        >
          🔍 All ({receipts.length})
        </button>
        {categories
          .filter((cat) => cat.count > 0)
          .map((category) => (
            <button
              key={category.id}
              className={`category-pill ${
                filters.category === category.id ? "active" : ""
              }`}
              onClick={() => handleFilterChange("category", category.id)}
              style={{ "--category-color": category.color }}
            >
              {category.icon} {category.name} ({category.count})
            </button>
          ))}
      </div>

      {/* Search and Sort */}
      <div className="filters-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search receipts by store name or category..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="date-filters">
          <div className="date-filter-group">
            <label className="date-filter-label">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              title="Filter from date"
              aria-label="Start date filter"
            />
          </div>
          <div className="date-filter-group">
            <label className="date-filter-label">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              title="Filter to date"
              aria-label="End date filter"
            />
          </div>
        </div>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-");
            handleFilterChange("sortBy", sortBy);
            handleFilterChange("sortOrder", sortOrder);
          }}
          title="Sort receipts by"
          aria-label="Sort receipts"
        >
          <option value="receipt_date-DESC">📅 Newest First</option>
          <option value="receipt_date-ASC">📅 Oldest First</option>
          <option value="amount-DESC">💰 Highest Amount</option>
          <option value="amount-ASC">💰 Lowest Amount</option>
          <option value="store_name-ASC">🏪 Store A-Z</option>
        </select>
      </div>

      {/* Receipts Grid */}
      <div className="receipts-grid">
        {loading ? (
          <div className="loading-state">
            <LoadingSpinner size="xl" color="primary" />
            <p className="loading-text">Loading receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No receipts yet</h3>
            <p>
              Receipts from merchants will appear here when you make purchases!
            </p>
            <p className="empty-hint">
              💡 Show your QR code at checkout to receive digital receipts
            </p>
          </div>
        ) : (
          receipts.map((receipt) => {
            const categoryData = getCategoryData(receipt.category);
            const hasNft =
              Boolean(receipt.nftCreated) ||
              Boolean(receipt.nftId) ||
              Boolean(receipt.nft_token_id);
            const hederaAnchored = Boolean(
              receipt.hcsTopicId && receipt.hcsSequence
            );
            return (
              <div
                key={receipt.id}
                className="receipt-card"
                onClick={() => setSelectedReceipt(receipt)}
              >
                <div className="receipt-header">
                  <div
                    className="category-badge"
                    style={{ backgroundColor: categoryData.color }}
                  >
                    {categoryData.icon}
                  </div>
                  <div className="receipt-actions">
                    {hasNft ? (
                      <span className="nft-badge" title="NFT minted">
                        🎨 NFT Minted
                      </span>
                    ) : null}
                    {hederaAnchored ? (
                      <span
                        className="hedera-badge"
                        title={`Anchored on Hedera (seq ${receipt.hcsSequence})`}
                      >
                        ✅ Verified on Hedera · seq {receipt.hcsSequence}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="receipt-content">
                  <h3 className="store-name">{receipt.storeName}</h3>
                  <p className="receipt-amount">
                    {formatAmount(receipt.amount)}
                  </p>
                  <p className="receipt-date">
                    {formatDate(receipt.receiptDate)}
                  </p>
                  <p className="receipt-category">{categoryData.name}</p>

                  {receipt.items && receipt.items.length > 0 && (
                    <div className="receipt-items">
                      <p className="items-count">
                        {receipt.items.length} item
                        {receipt.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Receipt Detail Modal - Placeholder for now */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Receipt Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedReceipt(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="receipt-details">
                <h4>{selectedReceipt.storeName}</h4>
                <p>
                  <strong>Amount:</strong>{" "}
                  {formatAmount(selectedReceipt.amount)}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedReceipt.receiptDate)}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {getCategoryData(selectedReceipt.category).name}
                </p>
                {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                  <div>
                    <strong>Items:</strong>
                    <ul>
                      {selectedReceipt.items.map((item, index) => (
                        <li key={index}>
                          {item.name} - {formatAmount(item.price)} x{" "}
                          {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verified on Hedera badge and HashScan link */}
                {selectedReceipt.hcsTopicId && selectedReceipt.hcsSequence && (
                  <div className="hedera-verification">
                    <div className="hedera-verified-line">
                      ✅ Verified on Hedera
                    </div>
                    <div className="hedera-meta">
                      <div>
                        <strong>HCS Topic:</strong> {selectedReceipt.hcsTopicId}
                      </div>
                      <div>
                        <strong>Sequence:</strong> {selectedReceipt.hcsSequence}
                      </div>
                      {selectedReceipt.hcsConsensusTimestamp && (
                        <div>
                          <strong>Timestamp:</strong>{" "}
                          {formatHederaTimestamp(
                            selectedReceipt.hcsConsensusTimestamp
                          )}
                        </div>
                      )}
                      <div className="hashscan-links">
                        <a
                          href={`https://hashscan.io/testnet/topic/${selectedReceipt.hcsTopicId}?tid=${selectedReceipt.hcsSequence}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on HashScan (testnet)
                        </a>
                        <span className="dot-sep">•</span>
                        <a
                          href={`https://hashscan.io/mainnet/topic/${selectedReceipt.hcsTopicId}?tid=${selectedReceipt.hcsSequence}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on HashScan (mainnet)
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="btn-primary"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptDashboard;
