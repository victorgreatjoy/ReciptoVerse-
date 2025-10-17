import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import "./MerchantDashboard.css";

const MerchantDashboard = () => {
  const { user, API_BASE } = useUser();
  const [merchantData, setMerchantData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMerchantData = async (key) => {
      try {
        setLoading(true);
        setError("");

        // Fetch merchant profile
        const profileResponse = await fetch(
          `${API_BASE}/api/merchants/profile`,
          {
            headers: {
              "X-API-Key": key,
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Invalid API key or merchant not approved");
        }

        const profileData = await profileResponse.json();
        setMerchantData(profileData.merchant);

        // Fetch merchant statistics
        const statsResponse = await fetch(`${API_BASE}/api/merchants/stats`, {
          headers: {
            "X-API-Key": key,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.merchantApiKey) {
      fetchMerchantData(user.merchantApiKey);
    } else {
      setLoading(false);
      setError(
        "No merchant API key found. Please register as a merchant first."
      );
    }
  }, [user, API_BASE]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="merchant-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading merchant dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="merchant-dashboard">
        <div className="error-state">
          <h2>❌ Access Error</h2>
          <p>{error}</p>
          <p className="help-text">
            Please register as a merchant from the "Be a Merchant" tab first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-dashboard">
      <div className="dashboard-header">
        <div className="merchant-info">
          <h1>🏪 {merchantData.business_name}</h1>
          <p className="business-type">{merchantData.business_type}</p>
          <div className="status-badge">
            <span className={`status ${merchantData.status}`}>
              {merchantData.status === "approved" ? "✅" : "⏳"}{" "}
              {merchantData.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="terminal-info">
            <label>Terminal ID:</label>
            <code>{merchantData.terminal_id}</code>
          </div>
        </div>
      </div>

      {merchantData.status === "pending" && (
        <div className="pending-notice">
          <h3>⏳ Account Pending Approval</h3>
          <p>
            Your merchant account is currently under review. You'll receive an
            email notification once approved.
          </p>
        </div>
      )}

      {merchantData.status === "approved" && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats.overview.totalReceipts}
                </div>
                <div className="stat-label">Total Receipts</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">
                  {formatCurrency(stats.overview.totalAmount)}
                </div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats.overview.uniqueCustomers}
                </div>
                <div className="stat-label">Unique Customers</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-number">
                  {formatCurrency(stats.overview.averageAmount)}
                </div>
                <div className="stat-label">Average Receipt</div>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="section">
              <h3>📈 Usage & Limits</h3>
              <div className="usage-info">
                <div className="usage-bar">
                  <div className="usage-label">
                    <span>
                      Receipts Used: {merchantData.receipts_processed} /{" "}
                      {merchantData.receipt_limit}
                    </span>
                    <span>{merchantData.utilizationPercent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${merchantData.utilizationPercent}%` }}
                    ></div>
                  </div>
                  <div className="remaining">
                    {merchantData.remainingReceipts} receipts remaining this
                    month
                  </div>
                </div>
              </div>
            </div>

            <div className="section">
              <h3>📋 Business Information</h3>
              <div className="business-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{merchantData.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">
                    {merchantData.phone || "Not provided"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">
                    {merchantData.address
                      ? `${merchantData.address}, ${merchantData.city}, ${merchantData.state} ${merchantData.postal_code}`
                      : "Not provided"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Contact Person:</span>
                  <span className="value">{merchantData.contact_person}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Member Since:</span>
                  <span className="value">
                    {formatDate(merchantData.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {stats.categoryBreakdown.length > 0 && (
              <div className="section">
                <h3>📊 Category Breakdown</h3>
                <div className="category-list">
                  {stats.categoryBreakdown.map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="category-name">{category.category}</div>
                      <div className="category-stats">
                        <span className="category-count">
                          {category.count} receipts
                        </span>
                        <span className="category-amount">
                          {formatCurrency(category.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="dashboard-footer">
        <p>
          Need help? Contact ReceiptoVerse support for assistance with your
          merchant account.
        </p>
      </div>
    </div>
  );
};

export default MerchantDashboard;
