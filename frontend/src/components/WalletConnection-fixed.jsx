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
    disconnectWallet,
  } = useWallet();

  const handleConnect = async (walletId) => {
    await connectWallet(walletId);
  };

  const formatAccountId = (accountId) => {
    if (!accountId) return "";
    if (accountId.length > 20) {
      return `${accountId.slice(0, 8)}...${accountId.slice(-6)}`;
    }
    return accountId;
  };

  if (isConnected && accountId) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-status">
            <div className="wallet-icon">
              <div className="status-indicator connected"></div>
              <span className="wallet-name">
                {selectedWallet?.name || "Wallet"}
              </span>
            </div>
            <div className="account-info">
              <span className="account-label">Connected Account:</span>
              <span className="account-id">{formatAccountId(accountId)}</span>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="disconnect-btn"
            aria-label="Disconnect wallet"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <div className="wallet-section">
        <h3 className="wallet-title">Connect Your Wallet</h3>
        <p className="wallet-subtitle">
          Choose your preferred wallet to connect to ReceiptoVerse
        </p>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <strong>Connection Error:</strong>
              <br />
              {error}
            </div>
          </div>
        )}

        <div className="wallet-options">
          {/* Always show MetaMask button */}
          <div className="wallet-option">
            <button
              onClick={() => handleConnect("metamask")}
              disabled={isConnecting}
              className="wallet-btn"
              aria-label="Connect to MetaMask"
            >
              <div className="wallet-btn-content">
                <div className="wallet-icon-container">
                  <img
                    src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"
                    alt="MetaMask icon"
                    className="wallet-icon"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="wallet-icon-fallback"
                    style={{ display: "none" }}
                  >
                    🦊
                  </div>
                </div>
                <div className="wallet-details">
                  <span className="wallet-name">MetaMask</span>
                  <span className="wallet-description">
                    Connect using MetaMask wallet
                  </span>
                </div>
                <div className="connect-indicator">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14l9-9"></path>
                    <path d="M21 3L9 15l-3-3-3-3"></path>
                  </svg>
                </div>
              </div>
              {isConnecting && (
                <div className="connecting-overlay">
                  <div className="spinner"></div>
                  <span>Connecting...</span>
                </div>
              )}
            </button>
          </div>

          {/* Show detected wallets if any */}
          {availableWallets.length > 0 &&
            availableWallets.map((wallet) => (
              <div key={wallet.id} className="wallet-option">
                <button
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                  className={`wallet-btn ${
                    wallet.type === "install" ? "install-btn" : ""
                  }`}
                  aria-label={`Connect to ${wallet.name}`}
                >
                  <div className="wallet-btn-content">
                    <div className="wallet-icon-container">
                      <img
                        src={wallet.icon}
                        alt={`${wallet.name} icon`}
                        className="wallet-icon"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="wallet-icon-fallback"
                        style={{ display: "none" }}
                      >
                        💳
                      </div>
                    </div>
                    <div className="wallet-details">
                      <span className="wallet-name">{wallet.name}</span>
                      <span className="wallet-description">
                        {wallet.description}
                      </span>
                    </div>
                    {wallet.type === "install" && (
                      <div className="install-indicator">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </div>
                    )}
                    {wallet.type !== "install" && (
                      <div className="connect-indicator">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M15 3h6v6"></path>
                          <path d="M10 14l9-9"></path>
                          <path d="M21 3L9 15l-3-3-3-3"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {isConnecting && (
                    <div className="connecting-overlay">
                      <div className="spinner"></div>
                      <span>Connecting...</span>
                    </div>
                  )}
                </button>
              </div>
            ))}
        </div>

        <div className="wallet-info-section">
          <h4>Wallet Compatibility</h4>
          <div className="compatibility-list">
            <div className="compatibility-item">
              <span className="compatibility-icon">🟢</span>
              <span>MetaMask - Works with Hedera network configuration</span>
            </div>
            <div className="compatibility-item">
              <span className="compatibility-icon">🟢</span>
              <span>HashPack - Native Hedera wallet (recommended)</span>
            </div>
            <div className="compatibility-item">
              <span className="compatibility-icon">🟢</span>
              <span>Blade Wallet - Multi-chain support including Hedera</span>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h4>Need Help?</h4>
          <div className="help-links">
            <a
              href="https://help.hashpack.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="help-link"
            >
              HashPack Support
            </a>
            <a
              href="https://metamask.io/faqs/"
              target="_blank"
              rel="noopener noreferrer"
              className="help-link"
            >
              MetaMask Support
            </a>
            <a
              href="https://docs.bladewallet.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="help-link"
            >
              Blade Wallet Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;
