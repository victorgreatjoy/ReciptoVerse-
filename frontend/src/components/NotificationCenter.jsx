import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import "./NotificationCenter.css";

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useWebSocket();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "receipt":
        return "📄";
      case "scanning":
        return "🔍";
      case "system":
        return "📢";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "receipt":
        return "#10b981";
      case "scanning":
        return "#f59e0b";
      case "system":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="notification-center">
      {/* Notification Bell Button */}
      <button
        className={`notification-bell ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Connection Status Indicator */}
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        <div className="status-dot"></div>
      </div>

      {/* Notification Panel */}
      {isOpen &&
        createPortal(
          <>
            <div
              className="notification-backdrop"
              onClick={() => setIsOpen(false)}
            ></div>
            <div className="notification-panel">
              <div className="notification-header">
                <h3>🔔 Notifications</h3>
                <div className="header-actions">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className="mark-all-read"
                        disabled={unreadCount === 0}
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="clear-all"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="close-panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        notification.read ? "read" : "unread"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <div className="notification-icon">
                          <span
                            style={{
                              color: getNotificationColor(notification.type),
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        <div className="notification-body">
                          <div className="notification-title">
                            {notification.title}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>

                          {notification.receipt && (
                            <div className="receipt-preview">
                              <div className="receipt-amount">
                                ${notification.receipt.totalAmount.toFixed(2)}
                              </div>
                              <div className="receipt-merchant">
                                from {notification.receipt.merchantName}
                              </div>
                              <div className="receipt-items">
                                {notification.receipt.itemCount} items
                              </div>
                            </div>
                          )}

                          <div className="notification-time">
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="remove-notification"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <div className="no-notifications-icon">🔕</div>
                    <div className="no-notifications-text">
                      <h4>No notifications yet</h4>
                      <p>
                        You'll see real-time updates here when merchants create
                        receipts for you.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <div
                  className={`connection-info ${
                    isConnected ? "connected" : "disconnected"
                  }`}
                >
                  <span className="connection-dot"></span>
                  {isConnected
                    ? "Connected to real-time notifications"
                    : "Connecting..."}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default NotificationCenter;
