import { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";
import "./WalletConnection.css";

const WalletConnection = () => {
  const {
    accountId,
    isConnected,
    isConnecting,
    selectedWallet,
    availableWallets,
    error,
    connectWallet,
    connectMockWallet,
    disconnectWallet,
  } = useWallet();

  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // Check if HashPack is installed
    const checkHashPack = () => {
      if (window.hashpack) {
        return true;
      }
      return false;
    };

    if (!checkHashPack() && availableWallets.length === 0) {
      setInstallPrompt("hashpack");
    }
  }, [availableWallets]);

  const handleConnect = async (wallet = null) => {
    const success = await connectWallet(wallet);
    if (success) {
      setShowWalletOptions(false);
    }
  };

  const formatAccountId = (accountId) => {
    if (!accountId) return "";
    return `${accountId.slice(0, 8)}...${accountId.slice(-6)}`;
  };

  if (isConnected && accountId) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-status">
            <div className="status-indicator connected"></div>
            <span className="status-text">Connected</span>
          </div>
          <div className="wallet-details">
            <div className="wallet-name">
              {selectedWallet?.name || "Hedera Wallet"}
            </div>
            <div className="account-id">{formatAccountId(accountId)}</div>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="disconnect-btn"
          title="Disconnect wallet"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      {!showWalletOptions ? (
        <div className="connect-prompt">
          <button
            onClick={() => setShowWalletOptions(true)}
            disabled={isConnecting}
            className="connect-wallet-btn"
          >
            {isConnecting ? (
              <>
                <div className="spinner"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
          <p className="connect-description">
            Connect your Hedera wallet to start creating receipt NFTs
          </p>
          {error && (
            <div className="wallet-error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-options">
          <div className="wallet-options-header">
            <h3>Choose Your Wallet</h3>
            <button
              onClick={() => setShowWalletOptions(false)}
              className="close-btn"
            >
              ×
            </button>
          </div>

          {installPrompt === "hashpack" && (
            <div className="install-prompt">
              <div className="install-card">
                <div className="install-header">
                  <img
                    src="https://www.hashpack.app/img/logo.svg"
                    alt="HashPack"
                    className="wallet-logo"
                  />
                  <div>
                    <h4>HashPack Wallet</h4>
                    <p>The most popular Hedera wallet</p>
                  </div>
                </div>
                <div className="install-actions">
                  <a
                    href="https://www.hashpack.app/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="install-btn"
                  >
                    Install HashPack
                  </a>
                  <button
                    onClick={() => setInstallPrompt(null)}
                    className="skip-btn"
                  >
                    I have it installed
                  </button>
                </div>
              </div>
            </div>
          )}

          {availableWallets.length > 0 ? (
            <div className="available-wallets">
              <h4>Available Wallets</h4>
              {availableWallets.map((wallet, index) => (
                <button
                  key={index}
                  onClick={() => handleConnect(wallet)}
                  className="wallet-option"
                  disabled={isConnecting}
                >
                  <div className="wallet-option-content">
                    <img
                      src={wallet.icon || "/default-wallet-icon.png"}
                      alt={wallet.name}
                      className="wallet-icon"
                    />
                    <div className="wallet-option-info">
                      <span className="wallet-option-name">{wallet.name}</span>
                      <span className="wallet-option-status">Detected</span>
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              ))}
            </div>
          ) : null}

          {/* Development Mock Wallet */}
          {import.meta.env.DEV && (
            <div className="mock-wallet-section">
              <h4>Development Mode</h4>
              <button
                onClick={connectMockWallet}
                className="wallet-option mock-wallet-option"
                disabled={isConnecting}
              >
                <div className="wallet-option-content">
                  <div className="mock-wallet-icon">🧪</div>
                  <div className="wallet-option-info">
                    <span className="wallet-option-name">Mock Wallet</span>
                    <span className="wallet-option-status">For Testing</span>
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>
              <p className="mock-wallet-note">
                ⚠️ Ledger accounts don't work with HashConnect. Use this mock wallet for development.
              </p>
            </div>
          )}

          {availableWallets.length === 0 && (
            <div className="no-wallets">
              <div className="no-wallets-content">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <h4>No Wallet Detected</h4>
                <p>Install a Hedera wallet to get started</p>
                <div className="wallet-recommendations">
                  <a
                    href="https://www.hashpack.app/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recommended-wallet"
                  >
                    <img
                      src="https://www.hashpack.app/img/logo.svg"
                      alt="HashPack"
                      className="wallet-logo"
                    />
                    <div>
                      <strong>HashPack</strong>
                      <span>Recommended</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="wallet-help">
            <details>
              <summary>Need help choosing a wallet?</summary>
              <div className="help-content">
                <p>
                  <strong>HashPack</strong> - The most popular and user-friendly
                  Hedera wallet
                </p>
                <p>
                  <strong>Kabila</strong> - Advanced features for power users
                </p>
                <p>
                  All wallets are free and secure. We recommend HashPack for
                  beginners.
                </p>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
