import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only connect if user is authenticated
    if (isAuthenticated && user) {
      const newSocket = io("http://localhost:3000", {
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("🔌 Connected to ReciptoVerse notifications");
        setIsConnected(true);

        // Authenticate as user
        newSocket.emit("authenticate_user", {
          userId: user.id,
          userHandle: user.handle,
        });
      });

      newSocket.on("authentication_success", (data) => {
        console.log("✅ WebSocket authentication successful:", data.message);
      });

      newSocket.on("disconnect", () => {
        console.log("🔌 Disconnected from ReciptoVerse notifications");
        setIsConnected(false);
      });

      // Handle new receipt notifications
      newSocket.on("new_receipt", (data) => {
        console.log("📄 New receipt notification:", data);

        const notification = {
          id: Date.now(),
          type: "receipt",
          title: "New Receipt Received!",
          message: data.message,
          receipt: data.receipt,
          timestamp: data.timestamp,
          read: false,
        };

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show browser notification if permitted
        if (Notification.permission === "granted") {
          new Notification("ReciptoVerse - New Receipt", {
            body: data.message,
            icon: "/vite.svg",
            badge: "/vite.svg",
          });
        }
      });

      // Handle merchant scanning notifications
      newSocket.on("merchant_scanning", (data) => {
        console.log("🔍 Merchant scanning notification:", data);

        const notification = {
          id: Date.now(),
          type: "scanning",
          title: "Processing Purchase",
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          autoRemove: true,
        };

        setNotifications((prev) => [notification, ...prev]);

        // Auto-remove scanning notifications after 5 seconds
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, 5000);
      });

      // Handle system notifications
      newSocket.on("system_notification", (data) => {
        console.log("📢 System notification:", data);

        const notification = {
          id: Date.now(),
          type: "system",
          title: "System Update",
          message: data.message,
          timestamp: data.timestamp,
          read: false,
        };

        setNotifications((prev) => [notification, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Cleanup socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  }, [isAuthenticated, user]);

  // Request notification permission when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
