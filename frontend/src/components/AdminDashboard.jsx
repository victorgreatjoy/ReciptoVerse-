import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [currentAdmins, setCurrentAdmins] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [nftSettings, setNftSettings] = useState({
    threshold: 10.0,
    enabled: true,
    autoMint: false,
  });
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL ||
      "https://reciptoverse-production.up.railway.app"
    : "http://localhost:3000";

  // Admin authentication
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        setAdminAuthenticated(true);
        loadDashboardData();
      } else {
        alert("Invalid admin credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Login failed");
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Load users
      const usersResponse = await fetch(`${API_BASE}/api/admin/users`, {
        headers,
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Load merchants
      const merchantsResponse = await fetch(`${API_BASE}/api/admin/merchants`, {
        headers,
      });
      if (merchantsResponse.ok) {
        const merchantsData = await merchantsResponse.json();
        setMerchants(merchantsData.merchants || []);
      }

      // Load system stats
      const statsResponse = await fetch(`${API_BASE}/api/admin/stats`, {
        headers,
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSystemStats(statsData.stats || {});
      }

      // Load NFT settings
      const nftResponse = await fetch(`${API_BASE}/api/admin/nft-settings`, {
        headers,
      });
      if (nftResponse.ok) {
        const nftData = await nftResponse.json();
        setNftSettings(nftData.settings || nftSettings);
      }

      // Load admin requests
      const adminResponse = await fetch(
        `${API_BASE}/api/admin/admin-requests`,
        {
          headers,
        }
      );
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setAdminRequests(adminData.pendingRequests || []);
        setCurrentAdmins(adminData.currentAdmins || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Merchant management functions
  const handleMerchantAction = async (merchantId, action) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE}/api/admin/${action}-merchant/${merchantId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert(`Merchant ${action}d successfully`);
        loadDashboardData();
      } else {
        alert(`Failed to ${action} merchant`);
      }
    } catch (error) {
      console.error(`Error ${action}ing merchant:`, error);
    }
  };

  // Admin privilege management functions
  const handleAdminAction = async (userId, action) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE}/api/admin/${action}-admin/${userId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert(`Admin ${action}d successfully`);
        loadDashboardData();
      } else {
        alert(`Failed to ${action} admin`);
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
    }
  };

  // NFT settings update
  const handleNftSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/admin/nft-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nftSettings),
      });

      if (response.ok) {
        alert("NFT settings updated successfully");
      } else {
        alert("Failed to update NFT settings");
      }
    } catch (error) {
      console.error("Error updating NFT settings:", error);
    }
  };

  // Check admin authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  // Admin login form
  if (!adminAuthenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h2>🔐 Admin Access</h2>
          <p>Enter admin credentials to access dashboard</p>
          <form onSubmit={handleAdminLogin}>
            <input
              type="text"
              placeholder="Username or Email"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <button type="submit">Login to Admin Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛠️ ReceiptoVerse Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            setAdminAuthenticated(false);
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button
          className={activeTab === "merchants" ? "active" : ""}
          onClick={() => setActiveTab("merchants")}
        >
          🏪 Merchants
        </button>
        <button
          className={activeTab === "admins" ? "active" : ""}
          onClick={() => setActiveTab("admins")}
        >
          👑 Admin Management
        </button>
        <button
          className={activeTab === "nft" ? "active" : ""}
          onClick={() => setActiveTab("nft")}
        >
          🎯 NFT Settings
        </button>
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading dashboard data...</div>}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>👥 Total Users</h3>
                <p className="stat-number">{systemStats.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>🏪 Active Merchants</h3>
                <p className="stat-number">
                  {systemStats.activeMerchants || 0}
                </p>
              </div>
              <div className="stat-card">
                <h3>🧾 Total Receipts</h3>
                <p className="stat-number">{systemStats.totalReceipts || 0}</p>
              </div>
              <div className="stat-card">
                <h3>🎨 NFTs Minted</h3>
                <p className="stat-number">{systemStats.totalNfts || 0}</p>
              </div>
              <div className="stat-card">
                <h3>💰 Total Revenue</h3>
                <p className="stat-number">${systemStats.totalRevenue || 0}</p>
              </div>
              <div className="stat-card">
                <h3>👑 Admin Users</h3>
                <p className="stat-number">{currentAdmins.length}</p>
              </div>
              <div className="stat-card">
                <h3>⏳ Pending Admin Requests</h3>
                <p className="stat-number">{adminRequests.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="users-tab">
            <h2>User Management ({users.length} users)</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Handle</th>
                    <th>Email</th>
                    <th>Display Name</th>
                    <th>Receipts</th>
                    <th>NFTs</th>
                    <th>Total Spent</th>
                    <th>Admin Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>@{user.handle}</td>
                      <td>{user.email}</td>
                      <td>{user.display_name || "N/A"}</td>
                      <td>{user.receipt_count || 0}</td>
                      <td>{user.nft_count || 0}</td>
                      <td>${user.total_spent || 0}</td>
                      <td>
                        {user.is_admin ? (
                          <span className="admin-badge">👑 Admin</span>
                        ) : user.admin_status === "pending" ? (
                          <span className="pending-badge">⏳ Pending</span>
                        ) : (
                          <span className="user-badge">👤 User</span>
                        )}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Merchants Tab */}
        {activeTab === "merchants" && (
          <div className="merchants-tab">
            <h2>Merchant Management ({merchants.length} merchants)</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants.map((merchant) => (
                    <tr key={merchant.id}>
                      <td>{merchant.business_name}</td>
                      <td>{merchant.email}</td>
                      <td>{merchant.business_address}</td>
                      <td>
                        <span className={`status-badge ${merchant.status}`}>
                          {merchant.status}
                        </span>
                      </td>
                      <td>
                        {new Date(merchant.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {merchant.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleMerchantAction(merchant.id, "approve")
                                }
                                className="approve-btn"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleMerchantAction(merchant.id, "reject")
                                }
                                className="reject-btn"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {merchant.status === "approved" && (
                            <button
                              onClick={() =>
                                handleMerchantAction(merchant.id, "suspend")
                              }
                              className="suspend-btn"
                            >
                              ⏸️ Suspend
                            </button>
                          )}
                          {merchant.status === "suspended" && (
                            <button
                              onClick={() =>
                                handleMerchantAction(merchant.id, "approve")
                              }
                              className="approve-btn"
                            >
                              ▶️ Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Management Tab */}
        {activeTab === "admins" && (
          <div className="admins-tab">
            <h2>👑 Admin Privilege Management</h2>

            {/* Pending Admin Requests */}
            <div className="section">
              <h3>⏳ Pending Admin Requests ({adminRequests.length})</h3>
              {adminRequests.length === 0 ? (
                <p>No pending admin requests</p>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Handle</th>
                        <th>Display Name</th>
                        <th>Email</th>
                        <th>Requested</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminRequests.map((request) => (
                        <tr key={request.id}>
                          <td>@{request.handle}</td>
                          <td>{request.display_name || "N/A"}</td>
                          <td>{request.email}</td>
                          <td>
                            {new Date(
                              request.admin_requested_at
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() =>
                                  handleAdminAction(request.id, "approve")
                                }
                                className="approve-btn"
                              >
                                ✅ Grant Admin
                              </button>
                              <button
                                onClick={() =>
                                  handleAdminAction(request.id, "reject")
                                }
                                className="reject-btn"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Current Admins */}
            <div className="section">
              <h3>👑 Current Administrators ({currentAdmins.length})</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Handle</th>
                      <th>Display Name</th>
                      <th>Email</th>
                      <th>Admin Since</th>
                      <th>Approved By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td>@{admin.handle}</td>
                        <td>{admin.display_name || "N/A"}</td>
                        <td>{admin.email}</td>
                        <td>
                          {new Date(
                            admin.admin_approved_at
                          ).toLocaleDateString()}
                        </td>
                        <td>{admin.admin_approved_by}</td>
                        <td>
                          {admin.handle !== "leandromirante" && (
                            <button
                              onClick={() =>
                                handleAdminAction(admin.id, "revoke")
                              }
                              className="revoke-btn"
                            >
                              🚫 Revoke Admin
                            </button>
                          )}
                          {admin.handle === "leandromirante" && (
                            <span className="system-admin">
                              🔒 System Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* NFT Settings Tab */}
        {activeTab === "nft" && (
          <div className="nft-tab">
            <h2>🎯 NFT Minting Settings</h2>
            <form onSubmit={handleNftSettingsUpdate} className="nft-form">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={nftSettings.enabled}
                    onChange={(e) =>
                      setNftSettings({
                        ...nftSettings,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  Enable NFT Minting
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={nftSettings.autoMint}
                    onChange={(e) =>
                      setNftSettings({
                        ...nftSettings,
                        autoMint: e.target.checked,
                      })
                    }
                  />
                  Auto-mint NFTs for qualifying receipts
                </label>
              </div>

              <div className="form-group">
                <label>Minimum Receipt Amount for NFT ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={nftSettings.threshold}
                  onChange={(e) =>
                    setNftSettings({
                      ...nftSettings,
                      threshold: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>

              <button type="submit" className="update-btn">
                Update NFT Settings
              </button>
            </form>

            <div className="nft-info">
              <h3>Current Settings:</h3>
              <ul>
                <li>
                  NFT Minting:{" "}
                  {nftSettings.enabled ? "✅ Enabled" : "❌ Disabled"}
                </li>
                <li>
                  Auto-mint:{" "}
                  {nftSettings.autoMint ? "✅ Enabled" : "❌ Disabled"}
                </li>
                <li>Minimum Amount: ${nftSettings.threshold}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
