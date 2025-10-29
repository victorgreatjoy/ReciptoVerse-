import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useWebSocket } from "../contexts/WebSocketContext";
import { LoadingSpinner } from "./ui";
import PointsDashboard from "./PointsDashboard";
import EnhancedUserQRCode from "./EnhancedUserQRCode";
import RVPTokenCard from "./RVPTokenCard";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user, getUserStats, isAuthenticated, refreshUser } = useUser();
  const { notifications } = useWebSocket();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, rewards, qr-code
  const lastNotificationIdRef = useRef(null);

  const loadUserStats = useCallback(async () => {
    setIsLoading(true);
    const result = await getUserStats();
    if (result.success) {
      setStats(result.stats);
    }
    setIsLoading(false);
  }, [getUserStats]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserStats();
    }
  }, [isAuthenticated, user, loadUserStats]);

  // Listen for new receipts and refresh data (only once per notification)
  useEffect(() => {
    if (notifications.length > 0) {
      const lastNotification = notifications[notifications.length - 1];

      // Only process if this is a new notification we haven't seen
      if (
        lastNotification.type === "receipt" &&
        lastNotification.timestamp !== lastNotificationIdRef.current
      ) {
        console.log(
          "📄 Receipt notification received, refreshing user data..."
        );
        lastNotificationIdRef.current = lastNotification.timestamp;

        // Refresh user data
        refreshUser();
        loadUserStats();
      }
    }
  }, [notifications, refreshUser, loadUserStats]);

  if (!isAuthenticated || !user) {
    return (
      <div className="dashboard-guest">
        <div className="guest-content">
          <h2>Welcome to ReceiptoVerse! 🧾✨</h2>
          <p>
            Sign in or create an account to start turning your receipts into
            valuable NFTs.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="xl" color="primary" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* User Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : "👤"}
              </div>
            )}
          </div>
          <div className="user-details">
            <h1>Welcome back, {user.displayName || user.handle}! 👋</h1>
            <p className="user-handle">@{user.handle}</p>
            {stats && (
              <p className="account-age">
                Member for {stats.accountAge} day
                {stats.accountAge !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="dashboard-tabs"
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
          background: "white",
          borderRadius: "12px",
          padding: "8px",
          border: "2px solid #3b82f6",
        }}
      >
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => {
            console.log("Overview tab clicked");
            setActiveTab("overview");
          }}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: activeTab === "overview" ? "#3b82f6" : "transparent",
            color: activeTab === "overview" ? "white" : "#64748b",
            fontWeight: "600",
          }}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === "rewards" ? "active" : ""}`}
          onClick={() => {
            console.log("Rewards tab clicked");
            setActiveTab("rewards");
          }}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: activeTab === "rewards" ? "#3b82f6" : "transparent",
            color: activeTab === "rewards" ? "white" : "#64748b",
            fontWeight: "600",
          }}
        >
          🏆 Rewards
        </button>
        <button
          className={`tab-button ${activeTab === "qr-code" ? "active" : ""}`}
          onClick={() => {
            console.log("QR Code tab clicked");
            setActiveTab("qr-code");
          }}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: activeTab === "qr-code" ? "#3b82f6" : "transparent",
            color: activeTab === "qr-code" ? "white" : "#64748b",
            fontWeight: "600",
          }}
        >
          📱 QR Code
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🧾</div>
              <div className="stat-content">
                <h3>{user.receiptCount || 0}</h3>
                <p>Receipts Collected</p>
                {stats && stats.receiptsThisWeek > 0 && (
                  <span className="stat-badge">
                    +{stats.receiptsThisWeek} this week
                  </span>
                )}
              </div>
            </div>

            {/* RVP Token Card - Hedera HTS Integration */}
            <RVPTokenCard />

            <div className="stat-card success">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{parseFloat(user.recvBalance || 0).toFixed(2)}</h3>
                <p>RECV Tokens</p>
                <span className="stat-badge">Ready to stake</span>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">🎨</div>
              <div className="stat-content">
                <h3>{user.nftCount || 0}</h3>
                <p>NFTs Created</p>
                {user.receiptCount > 0 && user.nftCount === 0 && (
                  <span className="stat-badge warning">Create your first!</span>
                )}
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">💳</div>
              <div className="stat-content">
                <h3>${parseFloat(user.totalSpent || 0).toFixed(2)}</h3>
                <p>Total Tracked</p>
                {stats && stats.averageReceiptAmount > 0 && (
                  <span className="stat-badge">
                    ${stats.averageReceiptAmount.toFixed(2)} avg
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {stats && stats.receiptsThisWeek > 0 ? (
                <>
                  <div className="activity-item">
                    <div className="activity-icon success">🧾</div>
                    <div className="activity-content">
                      <h4>Receipts Added</h4>
                      <p>
                        You've added {stats.receiptsThisWeek} receipts this week
                      </p>
                      <span className="activity-time">This week</span>
                    </div>
                  </div>

                  {stats.categoriesUsed > 0 && (
                    <div className="activity-item">
                      <div className="activity-icon info">📊</div>
                      <div className="activity-content">
                        <h4>Categories Explored</h4>
                        <p>
                          You've shopped in {stats.categoriesUsed} different
                          categories
                        </p>
                        <span className="activity-time">All time</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-activity">
                  <div className="empty-icon">🌟</div>
                  <h4>Ready to get started?</h4>
                  <p>Add your first receipt to see your activity here!</p>
                  <button className="start-btn">Add First Receipt</button>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          {stats && (
            <div className="achievements">
              <h3>Achievements</h3>
              <div className="achievement-grid">
                <div
                  className={`achievement ${
                    user.receiptCount >= 1 ? "unlocked" : "locked"
                  }`}
                >
                  <div className="achievement-icon">🥇</div>
                  <div className="achievement-info">
                    <h4>First Receipt</h4>
                    <p>Add your first receipt</p>
                  </div>
                </div>

                <div
                  className={`achievement ${
                    user.receiptCount >= 10 ? "unlocked" : "locked"
                  }`}
                >
                  <div className="achievement-icon">📋</div>
                  <div className="achievement-info">
                    <h4>Receipt Collector</h4>
                    <p>Collect 10 receipts</p>
                    <span className="progress">
                      {Math.min(user.receiptCount, 10)}/10
                    </span>
                  </div>
                </div>

                <div
                  className={`achievement ${
                    user.nftCount >= 1 ? "unlocked" : "locked"
                  }`}
                >
                  <div className="achievement-icon">🎨</div>
                  <div className="achievement-info">
                    <h4>NFT Creator</h4>
                    <p>Create your first NFT</p>
                  </div>
                </div>

                <div
                  className={`achievement ${
                    stats.daysActive >= 7 ? "unlocked" : "locked"
                  }`}
                >
                  <div className="achievement-icon">🔥</div>
                  <div className="achievement-info">
                    <h4>Week Warrior</h4>
                    <p>Active for 7 days</p>
                    <span className="progress">
                      {Math.min(stats.daysActive, 7)}/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div>
          {console.log("Rendering Rewards tab")}
          <PointsDashboard />
        </div>
      )}

      {/* QR Code Tab */}
      {activeTab === "qr-code" && (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          {console.log("Rendering QR Code tab")}
          <EnhancedUserQRCode />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
