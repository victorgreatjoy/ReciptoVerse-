import { useState } from "react";
import { WalletProvider } from "./contexts/WalletContext";
import WalletConnection from "./components/WalletConnection";
import ReceiptCreator from "./components/ReceiptCreator";
import NFTGallery from "./components/NFTGallery";
import "./App.css";

// Add error boundary logging
console.log("🚀 ReceiptoVerse App starting...");

function AppContent() {
  console.log("📱 App component rendering...");

  // API Configuration for deployment
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL ||
      "https://ReceiptoVerse-production.up.railway.app"
    : "http://localhost:3000";

  console.log("🌐 API_BASE:", API_BASE);
  console.log("🔧 Environment:", import.meta.env.MODE);

  const [lastMintedNFT, setLastMintedNFT] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Add notification system
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="app">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification ${notification.type}`}
              onClick={() => removeNotification(notification.id)}
            >
              <span>{notification.message}</span>
              <button className="notification-close">×</button>
            </div>
          ))}
        </div>
      )}

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="debug-info">
          <strong>Debug Info:</strong>
          <br />
          API_BASE: {API_BASE}
          <br />
          Mode: {import.meta.env.MODE}
        </div>
      )}

      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <div className="header-text">
              <h1>🧾 ReceiptoVerse</h1>
              <p>
                Transform your receipts into valuable NFTs and earn RECV tokens
              </p>
            </div>
            <div className="header-wallet">
              <WalletConnection />
            </div>
          </div>
        </header>

        <main className="main">
          <ReceiptCreator
            apiBase={API_BASE}
            onMintSuccess={(nftData) => {
              setLastMintedNFT(nftData);
              addNotification(
                "Receipt NFT created successfully! 🎉",
                "success"
              );
            }}
            onError={(error) => {
              addNotification(`Error: ${error}`, "error");
            }}
          />

          <NFTGallery apiBase={API_BASE} lastMintedNFT={lastMintedNFT} />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
