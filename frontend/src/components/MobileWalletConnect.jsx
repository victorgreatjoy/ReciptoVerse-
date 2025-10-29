import React, { useState, useEffect } from "react";
import { getHashConnectInstance } from "../services/hashconnect";

/**
 * Mobile-optimized wallet connection component with deep linking
 * Automatically opens HashPack/Blade app on mobile devices
 */
const MobileWalletConnect = ({ onConnect, onCancel }) => {
  const [pairingString, setPairingString] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Get pairing string
    try {
      const instance = getHashConnectInstance();
      if (instance.pairingString) {
        setPairingString(instance.pairingString);

        // Auto-open wallet app on mobile
        if (mobile) {
          openWalletApp(instance.pairingString);
        }
      }
    } catch (error) {
      console.error("Error getting pairing string:", error);
    }
  }, []);

  const openWalletApp = (pairingStr) => {
    // HashPack deep link (primary)
    const hashpackLink = `hashpack://hcs/connect?pairingString=${encodeURIComponent(
      pairingStr
    )}`;

    // Try to open HashPack
    window.location.href = hashpackLink;

    console.log("📱 Attempting to open wallet app...");
    console.log("   If the app doesn't open, copy the pairing code below");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pairingString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openHashPack = () => {
    openWalletApp(pairingString);
  };

  const openBlade = () => {
    const bladeLink = `blade://hcs/connect?pairingString=${encodeURIComponent(
      pairingString
    )}`;
    window.location.href = bladeLink;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Connect Wallet</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Mobile Instructions */}
        {isMobile ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                📱 <strong>Mobile detected!</strong> Click a button below to
                open your wallet app:
              </p>

              <div className="space-y-2">
                <button
                  onClick={openHashPack}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <img
                    src="https://www.hashpack.app/img/logo.svg"
                    alt="HashPack"
                    className="w-5 h-5"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  Open HashPack
                </button>

                <button
                  onClick={openBlade}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                >
                  Open Blade Wallet
                </button>
              </div>
            </div>

            {/* Fallback: Manual Copy */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">
                <strong>App didn't open?</strong> Copy the code and paste it in
                your wallet app:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pairingString}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded font-mono"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Show QR Code and Pairing String */
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                💻 <strong>Desktop detected!</strong>
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open HashPack or Blade on your mobile device</li>
                <li>Tap "Connect to dApp"</li>
                <li>Scan the QR code or copy the pairing string below</li>
              </ol>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 text-sm">QR Code</p>
                {/* Note: You can add actual QR code generation here using qrcode.react */}
              </div>
            </div>

            {/* Pairing String */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or copy pairing string:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pairingString}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded font-mono"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Waiting for wallet connection... This may take a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletConnect;
