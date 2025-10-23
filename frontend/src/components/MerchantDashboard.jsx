import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import MerchantQRScanner from "./MerchantQRScanner";
import { getMerchantRewardsStats } from "../services/pointsService";
import "./MerchantDashboard.css";

const MerchantDashboard = () => {
  const { user, API_BASE } = useUser();
  const [merchantData, setMerchantData] = useState(null);
  const [stats, setStats] = useState(null);
  const [rewardsStats, setRewardsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, scanner, rewards

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

        // Fetch rewards statistics
        try {
          const rewardsData = await getMerchantRewardsStats();
          setRewardsStats(rewardsData);
        } catch {
          console.log("Rewards stats not available yet");
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

  const loadRewardsStats = async () => {
    try {
      const data = await getMerchantRewardsStats();
      setRewardsStats(data);
    } catch (error) {
      console.error("Error loading rewards stats:", error);
    }
  };

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

      {merchantData.status === "approved" && (
        <>
          {/* Navigation Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </button>
            <button
              className={`tab-button ${
                activeTab === "scanner" ? "active" : ""
              }`}
              onClick={() => setActiveTab("scanner")}
            >
              📱 QR Scanner
            </button>
            <button
              className={`tab-button ${
                activeTab === "rewards" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("rewards");
                loadRewardsStats();
              }}
            >
              🏆 Rewards Stats
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && stats && (
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
                          style={{
                            width: `${merchantData.utilizationPercent}%`,
                          }}
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
                      <span className="value">
                        {merchantData.contact_person}
                      </span>
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
                          <div className="category-name">
                            {category.category}
                          </div>
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

          {/* QR Scanner Tab */}
          {activeTab === "scanner" && (
            <div style={{ marginTop: "2rem" }}>
              <MerchantQRScanner />
            </div>
          )}

          {/* Rewards Stats Tab */}
          {activeTab === "rewards" && rewardsStats && (
            <div style={{ marginTop: "2rem" }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {rewardsStats.totalPointsDistributed?.toLocaleString() ||
                        0}
                    </div>
                    <div className="stat-label">Total Points Distributed</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {rewardsStats.totalTransactions?.toLocaleString() || 0}
                    </div>
                    <div className="stat-label">Points Awards</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {rewardsStats.rewardRate || 1}x
                    </div>
                    <div className="stat-label">Reward Rate</div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              {rewardsStats.recentTransactions &&
                rewardsStats.recentTransactions.length > 0 && (
                  <div className="section" style={{ marginTop: "2rem" }}>
                    <h3>🕒 Recent Points Awards</h3>
                    <div className="category-list">
                      {rewardsStats.recentTransactions.map((tx, index) => (
                        <div key={index} className="category-item">
                          <div className="category-name">
                            @{tx.user_handle || "Unknown"}
                            <span
                              style={{
                                fontSize: "0.85em",
                                color: "#64748b",
                                marginLeft: "8px",
                              }}
                            >
                              {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="category-stats">
                            <span
                              className="category-count"
                              style={{ color: "#10b981", fontWeight: "bold" }}
                            >
                              +{tx.amount} pts
                            </span>
                            <span className="category-amount">
                              ${parseFloat(tx.purchase_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Top Customers */}
              {rewardsStats.topCustomers &&
                rewardsStats.topCustomers.length > 0 && (
                  <div className="section" style={{ marginTop: "2rem" }}>
                    <h3>🌟 Top Customers</h3>
                    <div className="category-list">
                      {rewardsStats.topCustomers.map((customer, index) => (
                        <div key={index} className="category-item">
                          <div className="category-name">
                            <span
                              style={{
                                marginRight: "8px",
                                fontWeight: "bold",
                                color: "#f59e0b",
                              }}
                            >
                              #{index + 1}
                            </span>
                            @{customer.user_handle || "Anonymous"}
                            <span
                              style={{
                                fontSize: "0.85em",
                                color: "#64748b",
                                marginLeft: "8px",
                              }}
                            >
                              {customer.transaction_count} purchases
                            </span>
                          </div>
                          <div className="category-stats">
                            <span
                              className="category-count"
                              style={{ color: "#f59e0b", fontWeight: "bold" }}
                            >
                              {customer.total_points} pts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
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
