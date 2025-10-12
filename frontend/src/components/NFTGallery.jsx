import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../contexts/WalletContext";
import "./NFTGallery.css";

const NFTGallery = ({ apiBase, lastMintedNFT }) => {
  const { accountId, isConnected } = useWallet();
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [error, setError] = useState(null);

  // Load NFTs owned by the account
  const loadOwnedNFTs = useCallback(async (accountId) => {
    if (!accountId) return;

    setLoadingNFTs(true);
    setError(null);

    try {
      console.log("Loading NFTs for account:", accountId);
      console.log("API Base:", apiBase);
      console.log("Full URL:", `${apiBase}/get-nfts/${accountId}`);
      
      const response = await fetch(`${apiBase}/get-nfts/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("NFT API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("NFT API Response data:", data);
        setOwnedNFTs(data.nfts || []);
        console.log("Loaded NFTs:", data.nfts);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error("NFT API Error Response:", errorData);
        throw new Error(
          errorData.error || 
          errorData.details || 
          `Failed to load NFTs (${response.status})`
        );
      }
    } catch (error) {
      console.error("Error loading NFTs:", error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the backend API. The server may be starting up or temporarily unavailable.';
      } else if (error.message.includes('404')) {
        errorMessage = 'NFT service endpoint not found. This might be due to a deployment in progress.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error while loading NFTs. Please try again in a moment.';
      } else if (accountId.startsWith('0x')) {
        errorMessage = `${errorMessage} (Note: Using MetaMask address format - this requires backend support for Ethereum addresses)`;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingNFTs(false);
    }
  }, [apiBase]);

  // Load NFTs when wallet connects or account changes
  useEffect(() => {
    if (isConnected && accountId) {
      loadOwnedNFTs(accountId);
    } else {
      setOwnedNFTs([]);
    }
  }, [isConnected, accountId, loadOwnedNFTs]);

  // Reload NFTs when a new NFT is minted
  useEffect(() => {
    if (lastMintedNFT && isConnected && accountId) {
      // Wait a moment for the blockchain to update
      setTimeout(() => {
        loadOwnedNFTs(accountId);
      }, 2000);
    }
  }, [lastMintedNFT, isConnected, accountId, loadOwnedNFTs]);

  if (!isConnected) {
    return null; // Don't show gallery if wallet not connected
  }

  return (
    <div className="nft-gallery">
      {/* Last Minted NFT Highlight */}
      {lastMintedNFT && (
        <div className="latest-nft">
          <div className="latest-nft-header">
            <h3>🎉 Latest Receipt NFT</h3>
            <div className="success-badge">Just Created!</div>
          </div>

          <div className="nft-card latest">
            <div className="nft-card-header">
              <div className="nft-icon">🧾</div>
              <div className="nft-info">
                <h4>Receipt NFT</h4>
                <p className="nft-id">{lastMintedNFT.receiptNFT}</p>
              </div>
            </div>

            <div className="nft-details">
              <div className="detail-row">
                <span className="label">Reward:</span>
                <span className="value reward">{lastMintedNFT.reward}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value">{lastMintedNFT.status}</span>
              </div>
              {lastMintedNFT.testMode && (
                <div className="detail-row">
                  <span className="label">Mode:</span>
                  <span className="value test-mode">Test Mode</span>
                </div>
              )}
            </div>

            <div className="nft-actions">
              <a
                href={lastMintedNFT.nftViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn primary"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View on HashScan
              </a>
              {lastMintedNFT.metadataUrl && (
                <a
                  href={lastMintedNFT.metadataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn secondary"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  View Metadata
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Owned NFTs Section */}
      <div className="owned-nfts-section">
        <div className="section-header">
          <h3>📋 My Receipt NFTs</h3>
          <button
            onClick={() => loadOwnedNFTs(accountId)}
            disabled={loadingNFTs}
            className="refresh-btn"
            title="Refresh NFT collection"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loadingNFTs ? "spinning" : ""}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            {loadingNFTs ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Wallet compatibility notice */}
        {accountId && accountId.startsWith('0x') && (
          <div className="wallet-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Using MetaMask - NFT loading may take a moment as we fetch from Hedera network</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>Failed to load NFTs: {error}</span>
            <button
              onClick={() => loadOwnedNFTs(accountId)}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        )}

        {loadingNFTs ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your NFT collection...</p>
          </div>
        ) : ownedNFTs.length > 0 ? (
          <div className="nfts-grid">
            {ownedNFTs.map((nft) => (
              <div key={`${nft.tokenId}-${nft.serial}`} className="nft-card">
                <div className="nft-card-header">
                  <div className="nft-icon">🧾</div>
                  <div className="nft-info">
                    <h4>Receipt NFT #{nft.serial}</h4>
                    <p className="nft-id">{nft.tokenId}</p>
                  </div>
                </div>

                <div className="nft-details">
                  <div className="detail-row">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(nft.created * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  {nft.metadata && (
                    <>
                      {nft.metadata.merchant && (
                        <div className="detail-row">
                          <span className="label">Merchant:</span>
                          <span className="value">{nft.metadata.merchant}</span>
                        </div>
                      )}
                      {nft.metadata.total && (
                        <div className="detail-row">
                          <span className="label">Total:</span>
                          <span className="value amount">
                            ${nft.metadata.total}
                          </span>
                        </div>
                      )}
                      {nft.metadata.items?.length && (
                        <div className="detail-row">
                          <span className="label">Items:</span>
                          <span className="value">
                            {nft.metadata.items.length} item(s)
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="nft-actions">
                  <a
                    href={`https://hashscan.io/testnet/token/${nft.tokenId}/${nft.serial}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn primary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    HashScan
                  </a>
                  {nft.metadataUrl && (
                    <a
                      href={nft.metadataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn secondary"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                      Metadata
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="12" y1="9" x2="12" y2="15" />
              </svg>
            </div>
            <h3>No Receipt NFTs Yet</h3>
            <p>
              Create your first receipt NFT above to start building your
              collection!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;
