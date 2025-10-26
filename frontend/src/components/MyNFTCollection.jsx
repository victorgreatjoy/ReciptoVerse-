import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MyNFTCollection.css";

const API_BASE = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api`;

/**
 * My NFT Collection - View owned NFTs and claim benefits
 */
const MyNFTCollection = () => {
  const [collection, setCollection] = useState([]);
  const [benefits, setBenefits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCollection();
    loadBenefits();
  }, []);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("receiptoverse_token");

      if (!token) {
        setError("Please login to view your collection");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE}/nft/my-collection`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCollection(response.data.collection || []);
      setError(null);
    } catch (err) {
      console.error("Error loading collection:", err);
      setError("Failed to load your NFT collection");
    } finally {
      setLoading(false);
    }
  };

  const loadBenefits = async () => {
    try {
      const token = localStorage.getItem("receiptoverse_token");
      if (!token) return;

      const response = await axios.get(`${API_BASE}/nft/benefits`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBenefits(response.data);
    } catch (err) {
      console.error("Error loading benefits:", err);
    }
  };

  const handleClaimBonus = async (nftId, nftName, bonusPoints) => {
    try {
      setClaiming(nftId);
      const token = localStorage.getItem("receiptoverse_token");

      const response = await axios.post(
        `${API_BASE}/nft/claim-monthly-bonus`,
        { nftMintId: nftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(
        `🎉 Claimed ${bonusPoints} bonus points from ${nftName}!\n\nNew balance: ${
          response.data.new_balance
        } points\nNext claim: ${new Date(
          response.data.next_claim_date
        ).toLocaleDateString()}`
      );

      // Refresh data
      await loadCollection();
      await loadBenefits();
    } catch (err) {
      console.error("Claim error:", err);
      const errorMsg = err.response?.data?.message || "Failed to claim bonus";
      alert(`❌ ${errorMsg}`);
    } finally {
      setClaiming(null);
    }
  };

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
      <div className="nft-collection">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-collection">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadCollection}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-collection">
      <div className="collection-header">
        <h1>🎨 My NFT Collection</h1>
        <p className="subtitle">Your exclusive reward NFTs and benefits</p>
      </div>

      {benefits && benefits.benefits_count > 0 && (
        <div className="benefits-summary">
          <h2>🎁 Active Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <div className="benefit-info">
                <span className="benefit-label">Total Discount</span>
                <span className="benefit-value">
                  {benefits.total_discount}%
                </span>
                <span className="benefit-hint">
                  Applied automatically at checkout
                </span>
              </div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <div className="benefit-info">
                <span className="benefit-label">Monthly Bonus</span>
                <span className="benefit-value">
                  {benefits.total_monthly_bonus} pts
                </span>
                <span className="benefit-hint">Claim below every 30 days</span>
              </div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🏆</div>
              <div className="benefit-info">
                <span className="benefit-label">Active NFTs</span>
                <span className="benefit-value">{benefits.benefits_count}</span>
                <span className="benefit-hint">With active benefits</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {collection.length === 0 ? (
        <div className="empty-collection">
          <div className="empty-icon">🎨</div>
          <h2>No NFTs Yet</h2>
          <p>Visit the NFT Marketplace to mint your first reward NFT!</p>
          <button
            className="cta-button"
            onClick={() => (window.location.href = "/nft-marketplace")}
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="collection-grid">
          {collection.map((nft) => (
            <div key={nft.id} className="collection-nft-card">
              <div className="nft-image-container">
                <img src={nft.image_url} alt={nft.name} className="nft-image" />
                <div
                  className="nft-rarity-badge"
                  style={{ backgroundColor: getRarityBadge(nft.rarity) }}
                >
                  {nft.rarity.toUpperCase()}
                </div>
                {!nft.benefits_active && (
                  <div className="inactive-overlay">INACTIVE</div>
                )}
              </div>

              <div className="nft-details">
                <div className="nft-header">
                  <h3 style={{ color: getTierColor(nft.tier) }}>{nft.name}</h3>
                  <span className="nft-tier">Tier {nft.tier}</span>
                </div>

                <div className="nft-meta">
                  <div className="meta-item">
                    <span className="meta-icon">💎</span>
                    <span className="meta-label">Points Spent</span>
                    <span className="meta-value">{nft.points_spent}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span className="meta-label">Minted</span>
                    <span className="meta-value">
                      {new Date(nft.minted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="nft-benefits-list">
                  <h4>Benefits:</h4>
                  <ul>
                    <li>
                      <span className="benefit-icon-small">💰</span>
                      {nft.discount_percentage}% discount on purchases
                    </li>
                    <li>
                      <span className="benefit-icon-small">🎯</span>
                      {nft.monthly_bonus_points} bonus points monthly
                    </li>
                    {nft.benefits.slice(2, 4).map((benefit, idx) => (
                      <li key={idx}>
                        <span className="benefit-icon-small">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {nft.benefits_active && nft.monthly_bonus_points > 0 && (
                  <div className="claim-section">
                    {nft.can_claim_monthly ? (
                      <button
                        className="claim-btn"
                        onClick={() =>
                          handleClaimBonus(
                            nft.id,
                            nft.name,
                            nft.monthly_bonus_points
                          )
                        }
                        disabled={claiming === nft.id}
                      >
                        {claiming === nft.id
                          ? "Claiming..."
                          : `🎁 Claim ${nft.monthly_bonus_points} Points`}
                      </button>
                    ) : (
                      <div className="claim-cooldown">
                        <span className="cooldown-icon">⏰</span>
                        <span>
                          {nft.last_benefit_claim
                            ? `Next claim: ${new Date(
                                new Date(nft.last_benefit_claim).getTime() +
                                  30 * 24 * 60 * 60 * 1000
                              ).toLocaleDateString()}`
                            : "Claim available!"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {nft.benefits_expiry && (
                  <div className="expiry-info">
                    Benefits expire:{" "}
                    {new Date(nft.benefits_expiry).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="collection-stats">
        <h3>Collection Statistics</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-number">{collection.length}</span>
            <span className="stat-label">Total NFTs</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">
              {collection
                .reduce((sum, nft) => sum + nft.points_spent, 0)
                .toLocaleString()}
            </span>
            <span className="stat-label">Points Spent</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">
              {collection.filter((nft) => nft.benefits_active).length}
            </span>
            <span className="stat-label">Active Benefits</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">
              {collection.filter((nft) => nft.can_claim_monthly).length}
            </span>
            <span className="stat-label">Claimable Bonuses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNFTCollection;
