import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NFTMarketplace.css";

const API_BASE = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api`;

console.log("🌐 NFTMarketplace API_BASE:", API_BASE);
console.log("🌐 VITE_API_URL:", import.meta.env.VITE_API_URL);

/**
 * NFT Marketplace - Browse and mint reward NFTs
 */
const NFTMarketplace = () => {
  const [nftTypes, setNftTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [minting, setMinting] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadNFTTypes();
    loadUserPoints();
  }, []);

  const loadNFTTypes = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/nft/types?availableOnly=true`;
      console.log("🔍 Fetching NFT types from:", url);
      const response = await axios.get(url);
      console.log("✅ NFT types loaded:", response.data);
      setNftTypes(response.data.nft_types || []);
      setError(null);
    } catch (err) {
      console.error("Error loading NFT types:", err);
      setError("Failed to load NFT marketplace");
    } finally {
      setLoading(false);
    }
  };

  const loadUserPoints = async () => {
    try {
      const token = localStorage.getItem("receiptoverse_token");
      console.log("🔑 Token for points:", token ? "exists" : "not found");
      if (!token) return;

      const url = `${API_BASE}/points/balance`;
      console.log("📊 Fetching points from:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Points response:", response.data);
      setUserPoints(response.data.data?.balance || 0);
    } catch (err) {
      console.error("❌ Error loading points:", err);
      console.error("Error details:", err.response?.data);
    }
  };

  const handleMintClick = (nft) => {
    setSelectedNFT(nft);
  };

  const handleConfirmMint = async () => {
    if (!selectedNFT) return;

    try {
      setMinting(true);
      const token = localStorage.getItem("receiptoverse_token");

      if (!token) {
        alert("Please login to mint NFTs");
        return;
      }

      const response = await axios.post(
        `${API_BASE}/nft/mint`,
        { nftTypeId: selectedNFT.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const hedera = response.data.hedera;
      const message = hedera
        ? `🎉 Successfully minted ${selectedNFT.name}!\n\n` +
          `Points spent: ${response.data.pointsSpent}\n` +
          `Remaining points: ${response.data.remainingPoints}\n\n` +
          `🔗 Hedera Details:\n` +
          `Token ID: ${hedera.tokenId}\n` +
          `Serial #: ${hedera.serialNumber}\n` +
          `Collection: ${hedera.collectionId}\n\n` +
          `${
            hedera.transferred
              ? "✅ NFT transferred to your wallet!"
              : "⚠️ Associate token in HashPack to receive NFT"
          }\n\n` +
          `View on HashScan:\n${hedera.hashscanUrl}`
        : `🎉 Successfully minted ${selectedNFT.name}!\n\n` +
          `Points spent: ${response.data.pointsSpent}\n` +
          `Remaining points: ${response.data.remainingPoints}`;

      alert(message);

      // Refresh data
      await loadNFTTypes();
      await loadUserPoints();
      setSelectedNFT(null);
    } catch (err) {
      console.error("Minting error:", err);
      const errorMsg = err.response?.data?.message || "Failed to mint NFT";
      alert(`❌ ${errorMsg}`);
    } finally {
      setMinting(false);
    }
  };

  const filteredNFTs = nftTypes.filter((nft) => {
    if (filter === "all") return true;
    if (filter === "affordable") return userPoints >= nft.point_cost;
    if (filter === "tier1") return nft.tier === 1;
    if (filter === "tier2") return nft.tier === 2;
    if (filter === "tier3") return nft.tier === 3;
    return true;
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case 1:
        return "#cd7f32"; // Bronze
      case 2:
        return "#c0c0c0"; // Silver
      case 3:
        return "#ffd700"; // Gold
      default:
        return "#666";
    }
  };

  const getRarityBadge = (rarity) => {
    const colors = {
      common: "#9ca3af",
      rare: "#3b82f6",
      epic: "#a855f7",
      legendary: "#f59e0b",
    };
    return colors[rarity.toLowerCase()] || "#666";
  };

  if (loading) {
    return (
      <div className="nft-marketplace">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading NFT Marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-marketplace">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadNFTTypes}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-marketplace">
      <div className="marketplace-header">
        <div className="header-content">
          <h1>🎨 NFT Rewards Marketplace</h1>
          <p className="subtitle">
            Mint exclusive NFTs with your reward points!
          </p>
        </div>

        <div className="user-points-card">
          <div className="points-icon">💎</div>
          <div className="points-info">
            <span className="points-label">Your Points</span>
            <span className="points-value">{userPoints.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="marketplace-filters">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All NFTs
        </button>
        <button
          className={
            filter === "affordable" ? "filter-btn active" : "filter-btn"
          }
          onClick={() => setFilter("affordable")}
        >
          Affordable
        </button>
        <button
          className={filter === "tier1" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("tier1")}
        >
          Bronze
        </button>
        <button
          className={filter === "tier2" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("tier2")}
        >
          Silver
        </button>
        <button
          className={filter === "tier3" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("tier3")}
        >
          Gold
        </button>
      </div>

      <div className="nft-grid">
        {filteredNFTs.map((nft) => {
          const canAfford = userPoints >= nft.point_cost;
          const isSoldOut =
            nft.max_supply !== -1 && nft.current_supply >= nft.max_supply;

          return (
            <div key={nft.id} className="nft-card">
              <div className="nft-image-container">
                <img
                  src={
                    nft.image_url ||
                    `https://ipfs.io/ipfs/${nft.image_ipfs_hash}`
                  }
                  alt={nft.name}
                  className="nft-image"
                  onError={(e) => {
                    // Fallback to alternative IPFS gateways if primary fails
                    if (e.target.src.includes("gateway.pinata.cloud")) {
                      e.target.src = `https://ipfs.io/ipfs/${nft.image_ipfs_hash}`;
                    } else if (e.target.src.includes("ipfs.io")) {
                      e.target.src = `https://cloudflare-ipfs.com/ipfs/${nft.image_ipfs_hash}`;
                    }
                  }}
                />
                <div
                  className="nft-rarity-badge"
                  style={{ backgroundColor: getRarityBadge(nft.rarity) }}
                >
                  {nft.rarity.toUpperCase()}
                </div>
                {isSoldOut && <div className="sold-out-overlay">SOLD OUT</div>}
              </div>

              <div className="nft-info">
                <div className="nft-header">
                  <h3 style={{ color: getTierColor(nft.tier) }}>{nft.name}</h3>
                  <span className="nft-tier">Tier {nft.tier}</span>
                </div>

                <p className="nft-description">{nft.description}</p>

                <div className="nft-benefits">
                  <h4>🎁 Benefits:</h4>
                  <ul>
                    {nft.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="nft-stats">
                  <div className="stat">
                    <span className="stat-icon">💰</span>
                    <span className="stat-label">Discount</span>
                    <span className="stat-value">
                      {nft.discount_percentage}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-label">Monthly Bonus</span>
                    <span className="stat-value">
                      {nft.monthly_bonus_points}
                    </span>
                  </div>
                </div>

                <div className="nft-supply">
                  <span>
                    Supply: {nft.current_supply}/
                    {nft.max_supply === -1 ? "∞" : nft.max_supply}
                  </span>
                </div>

                <div className="nft-footer">
                  <div className="nft-price">
                    <span className="price-label">Price</span>
                    <span className="price-value">
                      {nft.point_cost.toLocaleString()} pts
                    </span>
                  </div>
                  <button
                    className={`mint-btn ${
                      !canAfford || isSoldOut ? "disabled" : ""
                    }`}
                    onClick={() => handleMintClick(nft)}
                    disabled={!canAfford || isSoldOut}
                  >
                    {isSoldOut
                      ? "Sold Out"
                      : canAfford
                      ? "Mint NFT"
                      : "Not Enough Points"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNFTs.length === 0 && (
        <div className="no-nfts">
          <p>No NFTs match your filters</p>
        </div>
      )}

      {/* Mint Confirmation Modal */}
      {selectedNFT && (
        <div
          className="modal-overlay"
          onClick={() => !minting && setSelectedNFT(null)}
        >
          <div className="mint-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedNFT(null)}
              disabled={minting}
            >
              ✕
            </button>

            <h2>Confirm Mint</h2>

            <img
              src={selectedNFT.image_url}
              alt={selectedNFT.name}
              className="modal-nft-image"
            />

            <h3>{selectedNFT.name}</h3>
            <p className="modal-description">{selectedNFT.description}</p>

            <div className="modal-details">
              <div className="detail-row">
                <span>Cost:</span>
                <strong>
                  {selectedNFT.point_cost.toLocaleString()} points
                </strong>
              </div>
              <div className="detail-row">
                <span>Your Points:</span>
                <strong>{userPoints.toLocaleString()} points</strong>
              </div>
              <div className="detail-row">
                <span>After Mint:</span>
                <strong>
                  {(userPoints - selectedNFT.point_cost).toLocaleString()}{" "}
                  points
                </strong>
              </div>
            </div>

            <div className="modal-benefits">
              <h4>You will receive:</h4>
              <ul>
                {selectedNFT.benefits.map((benefit, idx) => (
                  <li key={idx}>✓ {benefit}</li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setSelectedNFT(null)}
                disabled={minting}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleConfirmMint}
                disabled={minting}
              >
                {minting
                  ? "Minting..."
                  : `Mint for ${selectedNFT.point_cost.toLocaleString()} pts`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;
