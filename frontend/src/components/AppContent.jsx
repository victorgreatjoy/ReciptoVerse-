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
import AuthModalNew from "./AuthModalNew";
import EmailVerification from "./EmailVerification";
import NotificationCenter from "./NotificationCenter";
import AdminDashboard from "./AdminDashboard";
import HashConnectButton from "./HashConnectButton";
import { LoadingSpinner, Button, Badge } from "./ui";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

const AppContent = () => {
  console.log("📱 App component rendering...");

  const {
    isAuthenticated,
    isLoading,
    logout,
    user,
    verifyEmail,
    resendVerificationCode,
  } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [lastMintedNFT] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState("qrcode"); // qrcode, receipts, dashboard, gallery, merchant, merchant-dashboard, pos, test-helper
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

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

  // Email verification handlers
  const handleVerificationRequired = (email) => {
    console.log("🔍 AppContent: Verification required for", email);
    setPendingEmail(email);
    setShowVerificationModal(true);
    setShowAuthModal(false); // Close auth modal
  };

  const handleVerificationComplete = async (verificationCode) => {
    console.log(
      "🔍 AppContent: Verification attempt with code:",
      verificationCode
    );
    console.log("🔍 AppContent: Pending email:", pendingEmail);

    try {
      const result = await verifyEmail(pendingEmail, verificationCode);
      console.log("🔍 AppContent: Verification result:", result);

      if (result.success) {
        setShowVerificationModal(false);
        setPendingEmail("");
        console.log("🔍 AppContent: Verification successful, closing modal");
        // User is now authenticated, UI will update automatically
        return { success: true };
      } else {
        console.log("🔍 AppContent: Verification failed:", result.error);
        // Return the full error details so the modal can handle expired codes
        return {
          success: false,
          error: result.error,
          code: result.code,
        };
      }
    } catch (error) {
      console.error("🔍 AppContent: Verification error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const handleResendCode = async () => {
    try {
      const result = await resendVerificationCode(pendingEmail);
      return result;
    } catch (error) {
      console.error("Resend error:", error);
      return { success: false, error: "Failed to resend code" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <LoadingSpinner
          size="xl"
          text="Loading ReceiptoVerse..."
          color="primary"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-40 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg transition-all duration-300 cursor-pointer max-w-sm
                ${
                  notification.type === "success"
                    ? "bg-accent-500 text-white"
                    : notification.type === "error"
                    ? "bg-sunset-500 text-white"
                    : "bg-primary-500 text-white"
                }`}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {notification.message}
                </span>
                <button className="ml-3 text-white hover:text-gray-200">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModalNew
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onVerificationRequired={handleVerificationRequired}
      />

      {/* Email Verification Modal */}
      <EmailVerification
        email={pendingEmail}
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setPendingEmail("");
        }}
        onVerificationComplete={handleVerificationComplete}
        onResendCode={handleResendCode}
      />

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-30 max-w-xs">
          <strong className="text-earth-900">Debug Info:</strong>
          <br />
          <div className="text-earth-600 mt-1 space-y-1">
            <div>API_BASE: {API_BASE}</div>
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-earth-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    🧾 ReceiptoVerse
                  </h1>
                </div>
                <div className="hidden md:block ml-4">
                  <p className="text-sm text-earth-600">
                    Transform receipts into valuable NFTs and earn RECV tokens
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <HashConnectButton />
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-earth-500" />
                      <span className="text-sm font-medium text-earth-700">
                        {user?.displayName || user?.handle || "User"}
                      </span>
                    </div>
                    <NotificationCenter />
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      leftIcon={ArrowRightOnRectangleIcon}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => openAuth("login")}
                      variant="outline"
                      size="sm"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => openAuth("register")}
                      variant="primary"
                      size="sm"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {isAuthenticated ? (
            <>
              {/* Navigation Tabs */}
              <div className="bg-white border-b border-earth-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex space-x-8 overflow-x-auto">
                    {user?.isMerchant && (
                      <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                          currentView === "merchant-dashboard"
                            ? "border-primary-500 text-primary-600"
                            : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                        }`}
                        onClick={() => setCurrentView("merchant-dashboard")}
                      >
                        🏪 Merchant Dashboard
                      </button>
                    )}
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        currentView === "qrcode"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                      }`}
                      onClick={() => setCurrentView("qrcode")}
                    >
                      📱 My QR Code
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        currentView === "receipts"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                      }`}
                      onClick={() => setCurrentView("receipts")}
                    >
                      📄 My Receipts
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        currentView === "dashboard"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                      }`}
                      onClick={() => setCurrentView("dashboard")}
                    >
                      📊 Analytics
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        currentView === "gallery"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                      }`}
                      onClick={() => setCurrentView("gallery")}
                    >
                      🎨 NFT Gallery
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        currentView === "merchant"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                      }`}
                      onClick={() => setCurrentView("merchant")}
                    >
                      🏪 Be a Merchant
                    </button>
                    {user?.isMerchant && (
                      <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                          currentView === "pos"
                            ? "border-primary-500 text-primary-600"
                            : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                        }`}
                        onClick={() => setCurrentView("pos")}
                      >
                        💳 POS System
                      </button>
                    )}
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        currentView === "admin"
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300"
                      }`}
                      onClick={() => setCurrentView("admin")}
                    >
                      🛠️ Admin
                    </button>
                  </div>
                </div>
              </div>

              {/* Content based on current view */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentView === "qrcode" && <UserQRCode />}
                {currentView === "receipts" && <ReceiptDashboard />}
                {currentView === "dashboard" && <UserDashboard />}
                {currentView === "gallery" && (
                  <NFTGallery
                    apiBase={API_BASE}
                    lastMintedNFT={lastMintedNFT}
                  />
                )}
                {currentView === "merchant" && <MerchantRegistration />}
                {currentView === "merchant-dashboard" && <MerchantDashboard />}
                {currentView === "pos" && <MerchantPOS />}
                {currentView === "admin" && <AdminDashboard />}
              </div>
            </>
          ) : (
            /* Welcome Section for Non-Authenticated Users */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-4xl font-bold text-earth-900 mb-6">
                    🌟 Welcome to the Future of Receipts
                  </h2>
                  <p className="text-xl text-earth-600 mb-12">
                    Join thousands of users who are already turning their
                    everyday receipts into valuable digital assets and earning
                    rewards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">
                      Receipt to NFT
                    </h3>
                    <p className="text-earth-600 text-sm">
                      Transform any receipt into a unique, collectible NFT with
                      full blockchain verification.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-indigo-700" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">
                      Earn RECV Tokens
                    </h3>
                    <p className="text-earth-600 text-sm">
                      Get rewarded with RECV tokens for every receipt you add
                      and NFT you create.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-cyan-700" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">
                      Community Governance
                    </h3>
                    <p className="text-earth-600 text-sm">
                      Vote on platform decisions and help shape the future of
                      ReceiptoVerse.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center">
                        <PaintBrushIcon className="h-6 w-6 text-sky-700" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">
                      Custom Designs
                    </h3>
                    <p className="text-earth-600 text-sm">
                      Design unique avatars and traits for your NFTs with our
                      built-in creator tools.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    Create your account today and receive bonus RECV tokens!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => openAuth("register")}
                      variant="secondary"
                      size="lg"
                    >
                      Create Free Account
                    </Button>
                    <button
                      onClick={() => openAuth("login")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 16px",
                        fontSize: "16px",
                        fontWeight: "500",
                        border: "2px solid white",
                        color: "white",
                        backgroundColor: "transparent",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "white";
                        e.target.style.color = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "white";
                      }}
                    >
                      Sign In
                    </button>
                  </div>
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
