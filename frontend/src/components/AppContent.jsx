import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import ReceiptCreator from "./ReceiptCreator";
import NFTGallery from "./NFTGallery";
import UserDashboard from "./UserDashboard";
import ReceiptDashboard from "./ReceiptDashboard";
import UserQRCode from "./UserQRCode";
import MerchantRegistration from "./MerchantRegistration";
import MerchantDashboard from "./MerchantDashboard";
import MerchantPOS from "./MerchantPOS";
import AuthModal from "./AuthModal";
import NotificationCenter from "./NotificationCenter";
import AdminDashboard from "./AdminDashboard";

const AppContent = () => {
  console.log("📱 App component rendering...");

  const { isAuthenticated, isLoading, logout, user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [lastMintedNFT] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState("qrcode"); // qrcode, receipts, dashboard, gallery, merchant, merchant-dashboard, pos, test-helper

  // API Configuration for deployment
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL ||
      "https://ReceiptoVerse-production.up.railway.app"
    : "http://localhost:3000";

  console.log("🌐 API_BASE:", API_BASE);
  console.log("🔧 Environment:", import.meta.env.MODE);

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

  const openAuth = (mode = "login") => {
    console.log("🔍 Opening auth modal with mode:", mode);
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      addNotification("You have been signed out successfully", "info");
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="app-loading">
          <div className="loading-spinner"></div>
          <p>Loading ReciptoVerse...</p>
        </div>
      </div>
    );
  }

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

      {/* Auth Modal */}
      <AuthModal
        key={authMode} // Force re-render when mode changes
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="debug-info">
          <strong>Debug Info:</strong>
          <br />
          API_BASE: {API_BASE}
          <br />
          Mode: {import.meta.env.MODE}
          <br />
          Authenticated: {isAuthenticated ? "Yes" : "No"}
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
            <div className="header-actions">
              {isAuthenticated ? (
                <div className="authenticated-header">
                  <span className="user-greeting">
                    👋 Welcome, {user?.displayName || user?.handle || "User"}!
                  </span>
                  <NotificationCenter />
                  <button
                    onClick={handleLogout}
                    className="auth-btn logout-btn"
                    title="Sign out"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    onClick={() => openAuth("login")}
                    className="auth-btn login-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth("register")}
                    className="auth-btn register-btn"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main">
          {isAuthenticated ? (
            <>
              {/* Navigation Tabs */}
              <div className="nav-tabs">
                {localStorage.getItem("merchantApiKey") && (
                  <button
                    className={`nav-tab ${
                      currentView === "merchant-dashboard" ? "active" : ""
                    }`}
                    onClick={() => setCurrentView("merchant-dashboard")}
                  >
                    🏪 Merchant Dashboard
                  </button>
                )}
                <button
                  className={`nav-tab ${
                    currentView === "qrcode" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("qrcode")}
                >
                  📱 My QR Code
                </button>
                <button
                  className={`nav-tab ${
                    currentView === "receipts" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("receipts")}
                >
                  📄 My Receipts
                </button>
                <button
                  className={`nav-tab ${
                    currentView === "dashboard" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("dashboard")}
                >
                  📊 Analytics
                </button>
                <button
                  className={`nav-tab ${
                    currentView === "gallery" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("gallery")}
                >
                  🎨 NFT Gallery
                </button>
                <button
                  className={`nav-tab ${
                    currentView === "merchant" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("merchant")}
                >
                  🏪 Be a Merchant
                </button>
                <button
                  className={`nav-tab ${currentView === "pos" ? "active" : ""}`}
                  onClick={() => setCurrentView("pos")}
                >
                  💳 POS System
                </button>
                <button
                  className={`nav-tab ${
                    currentView === "admin" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("admin")}
                >
                  🛠️ Admin
                </button>
              </div>

              {/* Content based on current view */}
              {currentView === "qrcode" && <UserQRCode />}

              {currentView === "receipts" && <ReceiptDashboard />}

              {currentView === "dashboard" && <UserDashboard />}

              {currentView === "gallery" && (
                <NFTGallery apiBase={API_BASE} lastMintedNFT={lastMintedNFT} />
              )}

              {currentView === "merchant" && <MerchantRegistration />}

              {currentView === "merchant-dashboard" && <MerchantDashboard />}

              {currentView === "pos" && <MerchantPOS />}

              {currentView === "admin" && <AdminDashboard />}
            </>
          ) : (
            /* Welcome Section for Non-Authenticated Users */
            <div className="welcome-section">
              <div className="welcome-content">
                <div className="welcome-hero">
                  <h2>🌟 Welcome to the Future of Receipts</h2>
                  <p>
                    Join thousands of users who are already turning their
                    everyday receipts into valuable digital assets and earning
                    rewards.
                  </p>
                </div>

                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🧾</div>
                    <h3>Receipt to NFT</h3>
                    <p>
                      Transform any receipt into a unique, collectible NFT with
                      full blockchain verification.
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">💰</div>
                    <h3>Earn RECV Tokens</h3>
                    <p>
                      Get rewarded with RECV tokens for every receipt you add
                      and NFT you create.
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">🏛️</div>
                    <h3>Community Governance</h3>
                    <p>
                      Vote on platform decisions and help shape the future of
                      ReciptoVerse.
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">🎨</div>
                    <h3>Custom Designs</h3>
                    <p>
                      Design unique avatars and traits for your NFTs with our
                      built-in creator tools.
                    </p>
                  </div>
                </div>

                <div className="cta-section">
                  <h3>Ready to get started?</h3>
                  <p>
                    Create your account today and receive bonus RECV tokens!
                  </p>
                  <button
                    onClick={() => openAuth("register")}
                    className="cta-button"
                  >
                    Create Free Account
                  </button>
                  <p className="cta-note">
                    Already have an account?{" "}
                    <button
                      onClick={() => openAuth("login")}
                      className="text-link"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppContent;
