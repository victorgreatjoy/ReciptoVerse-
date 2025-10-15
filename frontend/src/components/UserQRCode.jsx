import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import "./UserQRCode.css";

const UserQRCode = () => {
  const { API_BASE, user } = useUser();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchQRCode();
    }
  }, [user?.id]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("receiptoverse_token");
      const response = await fetch(`${API_BASE}/api/users/qr-code`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQrData(data);
      } else if (response.status === 404) {
        // QR code doesn't exist, try to generate it
        await generateQRCode();
      } else {
        throw new Error("Failed to fetch QR code");
      }
    } catch (error) {
      console.error("QR code fetch error:", error);
      setError("Failed to load QR code");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setRegenerating(true);

      const token = localStorage.getItem("receiptoverse_token");
      const response = await fetch(`${API_BASE}/api/users/regenerate-qr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQrData({
          qrCode: data.qrCode,
          displayInfo: data.displayInfo,
        });
        setError(null);
      } else {
        throw new Error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR code generation error:", error);
      setError("Failed to generate QR code");
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (qrData?.barcodeData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(qrData.barcodeData));
        // Show success toast
        if (window.showToast) {
          window.showToast("Barcode data copied to clipboard!", "success");
        }
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const downloadQRCode = () => {
    if (qrData?.qrCode) {
      const link = document.createElement("a");
      link.href = qrData.qrCode;
      link.download = `ReceiptoVerse-QR-${user.handle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="qr-section">
        <div className="qr-loading">
          <div className="loading-spinner"></div>
          <p>Loading your QR code...</p>
        </div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="qr-section">
        <div className="qr-error">
          <div className="error-icon">⚠️</div>
          <h3>QR Code Issue</h3>
          <p>{error}</p>
          <button
            onClick={generateQRCode}
            disabled={regenerating}
            className="btn-primary"
          >
            {regenerating ? "Generating..." : "Generate QR Code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-section">
      <div className="qr-header">
        <h2>🛒 Your Shopping Barcode</h2>
        <p>
          Show this QR code at checkout to receive digital receipts instantly
        </p>
      </div>

      <div className="qr-card">
        <div className="qr-code-container">
          {qrData?.qrCode ? (
            <img
              src={qrData.qrCode}
              alt="Your ReceiptoVerse QR Code"
              className="qr-code-image"
            />
          ) : (
            <div className="qr-placeholder">
              <span>📱</span>
              <p>QR Code not available</p>
            </div>
          )}
        </div>

        <div className="qr-info">
          <div className="user-info">
            <h3>@{user.handle}</h3>
            {user.displayName && user.displayName !== user.handle && (
              <p className="display-name">{user.displayName}</p>
            )}
          </div>

          <div className="qr-instructions">
            <h4>How to use:</h4>
            <ol>
              <li>🛍️ Shop at participating merchants</li>
              <li>📱 Show this QR code at checkout</li>
              <li>💫 Receive digital receipts instantly</li>
              <li>🎨 Convert receipts to NFTs</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="qr-actions">
        <button
          onClick={downloadQRCode}
          className="btn-secondary"
          disabled={!qrData?.qrCode}
        >
          📥 Download QR Code
        </button>

        <button
          onClick={copyToClipboard}
          className="btn-secondary"
          disabled={!qrData?.barcodeData}
        >
          📋 Copy Barcode Data
        </button>

        <button
          onClick={generateQRCode}
          disabled={regenerating}
          className="btn-outline"
        >
          {regenerating ? "🔄 Regenerating..." : "🔄 Regenerate"}
        </button>
      </div>

      {qrData?.barcodeData && (
        <div className="qr-details">
          <h4>Barcode Details:</h4>
          <div className="barcode-info">
            <div className="info-item">
              <span className="info-label">Platform:</span>
              <span className="info-value">{qrData.barcodeData.platform}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">{qrData.barcodeData.version}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Handle:</span>
              <span className="info-value">@{qrData.barcodeData.handle}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Generated:</span>
              <span className="info-value">
                {new Date(qrData.barcodeData.generated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="qr-security">
        <div className="security-info">
          <h4>🔒 Security & Privacy</h4>
          <ul>
            <li>Your QR code is unique and secure</li>
            <li>No sensitive information is stored in the code</li>
            <li>Only participating merchants can process receipts</li>
            <li>You can regenerate your code anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserQRCode;
