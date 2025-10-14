import { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user, getUserStats, isAuthenticated } = useUser();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (!isAuthenticated || !user) {
    return (
      <div className="dashboard-guest">
        <div className="guest-content">
          <h2>Welcome to ReciptoVerse! 🧾✨</h2>
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
        <div className="loading-spinner"></div>
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

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <span className="action-icon">📱</span>
            <div>
              <h4>Scan Receipt</h4>
              <p>Use your camera to capture receipts</p>
            </div>
          </button>

          <button className="action-btn secondary">
            <span className="action-icon">✏️</span>
            <div>
              <h4>Manual Entry</h4>
              <p>Add receipt details manually</p>
            </div>
          </button>

          <button className="action-btn success">
            <span className="action-icon">🎨</span>
            <div>
              <h4>Create NFT</h4>
              <p>Turn receipts into unique NFTs</p>
            </div>
          </button>

          <button className="action-btn info">
            <span className="action-icon">🏛️</span>
            <div>
              <h4>DAO Voting</h4>
              <p>Participate in community decisions</p>
            </div>
          </button>
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
    </div>
  );
};

export default UserDashboard;
