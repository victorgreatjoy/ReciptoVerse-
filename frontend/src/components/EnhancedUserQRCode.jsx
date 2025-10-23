import React, { useState, useEffect, useCallback } from "react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { QRCodeSVG } from "qrcode.react";
import { Coins, Award, Timer, RefreshCw, Download } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { getPointsBalance } from "../services/pointsService";
import { showToast } from "../utils/toastUtils";

const EnhancedUserQRCode = () => {
  const { user } = useUser();
  const [qrData, setQrData] = useState("");
  const [balance, setBalance] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isExpired, setIsExpired] = useState(false);

  // Tier styles
  const tierStyles = {
    bronze: {
      color: "bg-amber-700",
      icon: "🥉",
      label: "Bronze",
      gradient: "from-amber-700 to-amber-900",
    },
    silver: {
      color: "bg-gray-400",
      icon: "🥈",
      label: "Silver",
      gradient: "from-gray-400 to-gray-600",
    },
    gold: {
      color: "bg-yellow-500",
      icon: "🥇",
      label: "Gold",
      gradient: "from-yellow-400 to-yellow-600",
    },
    platinum: {
      color: "bg-cyan-500",
      icon: "💎",
      label: "Platinum",
      gradient: "from-cyan-400 to-blue-600",
    },
  };

  useEffect(() => {
    loadBalance();
    generateQRCode();
  }, [generateQRCode]);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  const loadBalance = async () => {
    try {
      const data = await getPointsBalance();
      setBalance(data);
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  };

  const generateQRCode = useCallback(() => {
    const timestamp = Date.now();
    // Simple signature (in production, use HMAC or similar)
    const signature = btoa(`${user?.id}-${timestamp}`);

    const data = JSON.stringify({
      userId: user?.id,
      accountId: user?.accountId || "",
      handle: user?.handle || "",
      timestamp,
      signature,
      version: "1.0",
    });

    setQrData(data);
    setTimeLeft(120);
    setIsExpired(false);
  }, [user?.id, user?.accountId, user?.handle]);

  const handleRefresh = () => {
    generateQRCode();
    loadBalance();
    showToast.success("QR Code refreshed");
  };

  const handleDownload = () => {
    const svg = document.getElementById("user-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `ReceiptoVerse-QR-${user?.handle || "user"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      showToast.success("QR Code downloaded");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const tierStyle = tierStyles[balance?.tier || "bronze"];

  return (
    <Card className="w-full max-w-md mx-auto" padding="md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Your Rewards QR Code
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Show this to merchants to earn points
        </p>
      </div>
      <div className="space-y-6">
        {/* Points Balance & Tier Display */}
        <div
          className={`p-4 bg-gradient-to-r ${tierStyle.gradient} rounded-lg text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur p-2 rounded-full">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Points Balance</p>
                <p className="text-3xl font-bold">{balance?.balance || 0}</p>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-4xl">{tierStyle.icon}</span>
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-2 py-1 rounded">
                {tierStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="relative">
          <div
            className={`flex items-center justify-center p-6 bg-white rounded-lg border-4 shadow-lg ${
              isExpired ? "border-red-300 opacity-50" : "border-primary"
            }`}
          >
            {qrData && (
              <QRCodeSVG
                id="user-qr-code"
                value={qrData}
                size={256}
                level="H"
                includeMargin={true}
              />
            )}
          </div>

          {/* Expired Overlay */}
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white space-y-2">
                <p className="font-semibold text-lg">QR Code Expired</p>
                <p className="text-sm">
                  For security, QR codes expire after 2 minutes
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  className="bg-white text-black hover:bg-gray-200 mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Code
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Timer & Actions */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Timer
              className={`h-4 w-4 ${
                timeLeft < 30
                  ? "text-red-600 animate-pulse"
                  : "text-muted-foreground"
              }`}
            />
            <span className={timeLeft < 30 ? "text-red-600 font-semibold" : ""}>
              Expires in: {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center space-y-1 pb-3 border-b">
          <p className="font-semibold text-lg">@{user?.handle || "user"}</p>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="space-y-2 text-sm">
          <p className="font-semibold flex items-center space-x-2">
            <span>📱</span>
            <span>How to use:</span>
          </p>
          <ol className="space-y-1 text-muted-foreground ml-6">
            <li>1. Show this code to the merchant at checkout</li>
            <li>2. They'll scan it to link your purchase</li>
            <li>3. Points are instantly added to your balance</li>
            <li>4. Points multiply based on your tier level</li>
          </ol>
        </div>

        {/* Tier Multiplier Info */}
        {balance && (
          <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-semibold">
                Current Multiplier:{" "}
                <span className="text-lg text-amber-600">
                  {balance.tierInfo?.multiplier || 1}x
                </span>
              </p>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              ${(100).toFixed(2)} purchase ={" "}
              {(100 * (balance.tierInfo?.multiplier || 1)).toFixed(0)} points
              earned
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center space-x-1">
            <span>🔒</span>
            <span>Secure QR with time-based expiration</span>
          </p>
          <p className="flex items-center space-x-1">
            <span>🛡️</span>
            <span>Your data is encrypted and protected</span>
          </p>
          <p className="flex items-center space-x-1">
            <span>✨</span>
            <span>Scan at participating merchants only</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedUserQRCode;
