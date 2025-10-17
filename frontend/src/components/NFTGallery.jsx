import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { LoadingSpinner } from "./ui";

const NFTGallery = () => {
  const { user } = useUser();
  const [nftReceipts, setNftReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, totalValue: 0, thisMonth: 0 });

  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL ||
      "https://ReceiptoVerse-production.up.railway.app"
    : "http://localhost:3000";

  const loadNFTReceipts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/receipts/nft-gallery`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNftReceipts(data.nftReceipts || []);

        // Calculate stats
        const receipts = data.nftReceipts || [];
        const total = receipts.length;
        const totalValue = receipts.reduce(
          (sum, nft) => sum + parseFloat(nft.total),
          0
        );
        const thisMonth = receipts.filter((nft) => {
          const created = new Date(nft.created_at);
          const now = new Date();
          return (
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
          );
        }).length;

        setStats({ total, totalValue, thisMonth });
      } else {
        console.error("Failed to load NFT receipts");
        setNftReceipts([]);
      }
    } catch (error) {
      console.error("Error loading NFT receipts:", error);
      setNftReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, user]);

  useEffect(() => {
    loadNFTReceipts();
  }, [loadNFTReceipts]);

  const getFilteredNFTs = () => {
    let filtered = [...nftReceipts];

    switch (filter) {
      case "recent":
        filtered = filtered.filter((nft) => {
          const created = new Date(nft.created_at);
          const now = new Date();
          const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
        break;
      case "high-value":
        filtered = filtered.filter((nft) => parseFloat(nft.total) >= 50);
        break;
      case "nft-minted":
        filtered = filtered.filter((nft) => nft.nft_token_id);
        break;
      default:
        break;
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const openNFTDetails = (nft) => {
    setSelectedNFT(nft);
  };

  const closeNFTDetails = () => {
    setSelectedNFT(null);
  };

  const viewOnHashScan = (tokenId, serial) => {
    const url = `https://hashscan.io/testnet/token/${tokenId}/${serial}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="nft-gallery">
        <div className="gallery-header">
          <h2>🎨 Receipt NFT Gallery</h2>
          <p>Your digital receipt collectibles on Hedera blockchain</p>
        </div>
        <div className="loading-state">
          <LoadingSpinner size="xl" color="primary" />
          <p>Loading your NFT collection...</p>
        </div>
      </div>
    );
  }

  const filteredNFTs = getFilteredNFTs();

  return (
    <div className="nft-gallery">
      <div className="gallery-header">
        <h2>🎨 Receipt NFT Gallery</h2>
        <p>Your digital receipt collectibles on Hedera blockchain</p>

        {/* Stats Section */}
        <div className="nft-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Receipts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatAmount(stats.totalValue)}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.thisMonth}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {nftReceipts.filter((nft) => nft.nft_token_id).length}
            </div>
            <div className="stat-label">NFTs Minted</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({nftReceipts.length})
          </button>
          <button
            className={`filter-btn ${filter === "recent" ? "active" : ""}`}
            onClick={() => setFilter("recent")}
          >
            Recent (7 days)
          </button>
          <button
            className={`filter-btn ${filter === "high-value" ? "active" : ""}`}
            onClick={() => setFilter("high-value")}
          >
            High Value ($50+)
          </button>
          <button
            className={`filter-btn ${filter === "nft-minted" ? "active" : ""}`}
            onClick={() => setFilter("nft-minted")}
          >
            NFT Minted
          </button>
        </div>
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="empty-gallery">
          <div className="empty-icon">🎨</div>
          <h3>No Receipt NFTs Yet</h3>
          <p>
            Start collecting receipt NFTs by making purchases with merchants!
            <br />
            Each receipt becomes a unique digital collectible on Hedera
            blockchain.
          </p>
          <button className="refresh-btn" onClick={loadNFTReceipts}>
            🔄 Refresh Gallery
          </button>
        </div>
      ) : (
        <div className="nft-grid">
          {filteredNFTs.map((nft, index) => (
            <div
              key={`${nft.id}-${index}`}
              className={`nft-card ${
                nft.nft_token_id ? "nft-minted" : "pending-nft"
              }`}
              onClick={() => openNFTDetails(nft)}
            >
              <div className="nft-header">
                <div className="nft-badge">
                  {nft.nft_token_id ? "🎨 NFT" : "⏳ Processing"}
                </div>
                <div className="nft-date">{formatDate(nft.created_at)}</div>
              </div>

              <div className="nft-content">
                <h3 className="merchant-name">{nft.merchant_name}</h3>
                <div className="nft-details">
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">{formatAmount(nft.total)}</span>
                  </div>
                  {nft.nft_token_id && (
                    <>
                      <div className="detail-row">
                        <span className="label">Token ID:</span>
                        <span className="value nft-id">{nft.nft_token_id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Serial:</span>
                        <span className="value">{nft.nft_serial_number}</span>
                      </div>
                    </>
                  )}
                  <div className="detail-row">
                    <span className="label">Items:</span>
                    <span className="value">
                      {nft.items?.length || 0} items
                    </span>
                  </div>
                </div>
              </div>

              <div className="nft-actions">
                {nft.nft_token_id ? (
                  <button
                    className="action-btn view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewOnHashScan(nft.nft_token_id, nft.nft_serial_number);
                    }}
                  >
                    🔍 View on HashScan
                  </button>
                ) : (
                  <div className="pending-message">
                    NFT minting in progress...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFT Details Modal */}
      {selectedNFT && (
        <div className="nft-modal" onClick={closeNFTDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎨 Receipt NFT Details</h3>
              <button className="close-btn" onClick={closeNFTDetails}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="nft-info">
                <h4>{selectedNFT.merchant_name}</h4>
                <p className="nft-description">
                  {selectedNFT.nft_token_id
                    ? "Digital receipt collectible minted on Hedera blockchain"
                    : "Receipt NFT is being processed and will be minted shortly"}
                </p>

                <div className="nft-metadata">
                  <div className="metadata-row">
                    <span>Purchase Amount:</span>
                    <span>{formatAmount(selectedNFT.total)}</span>
                  </div>
                  <div className="metadata-row">
                    <span>Receipt Date:</span>
                    <span>{formatDate(selectedNFT.created_at)}</span>
                  </div>
                  <div className="metadata-row">
                    <span>Payment Method:</span>
                    <span>{selectedNFT.payment_method || "Not specified"}</span>
                  </div>
                  <div className="metadata-row">
                    <span>Category:</span>
                    <span>{selectedNFT.category || "General"}</span>
                  </div>
                  {selectedNFT.nft_token_id && (
                    <>
                      <div className="metadata-row">
                        <span>Token ID:</span>
                        <span className="nft-id">
                          {selectedNFT.nft_token_id}
                        </span>
                      </div>
                      <div className="metadata-row">
                        <span>Serial Number:</span>
                        <span>{selectedNFT.nft_serial_number}</span>
                      </div>
                    </>
                  )}

                  {/* Receipt Items */}
                  {selectedNFT.items && selectedNFT.items.length > 0 && (
                    <div className="receipt-items">
                      <h5>Items Purchased:</h5>
                      <div className="items-list">
                        {selectedNFT.items.map((item, index) => (
                          <div key={index} className="item-row">
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">
                              {formatAmount(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedNFT.nft_token_id ? (
                <button
                  className="primary-btn"
                  onClick={() =>
                    viewOnHashScan(
                      selectedNFT.nft_token_id,
                      selectedNFT.nft_serial_number
                    )
                  }
                >
                  🔍 View on HashScan
                </button>
              ) : (
                <div className="pending-nft-info">
                  <span>🔄 NFT minting in progress...</span>
                </div>
              )}
              <button className="secondary-btn" onClick={closeNFTDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
