import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getHashConnectInstance } from "../services/hashconnect";
import { TokenAssociateTransaction } from "@hashgraph/sdk";
import "./RVPTokenCard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RVPTokenCard = () => {
  const { isConnected, accountId } = useSelector((state) => state.hashconnect);

  const [tokenInfo, setTokenInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isAssociated, setIsAssociated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log("🪙 RVPTokenCard State:", {
      isConnected,
      accountId,
      tokenInfo,
      isAssociated,
      isLoading,
      balance,
    });
  }, [isConnected, accountId, tokenInfo, isAssociated, isLoading, balance]);

  // Fetch token info on mount
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/token/info`);
        const data = await response.json();
        setTokenInfo(data);
      } catch (err) {
        console.error("Failed to fetch token info:", err);
      }
    };

    fetchTokenInfo();
  }, []);

  // Fetch balance and association status when wallet is connected
  useEffect(() => {
    if (!isConnected || !accountId || !tokenInfo) return;

    const fetchBalanceAndStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch association status
        const statusResponse = await fetch(
          `${API_BASE}/api/token/association-status/${accountId}`
        );
        const statusData = await statusResponse.json();
        setIsAssociated(statusData.isAssociated);

        // Fetch balance if associated
        if (statusData.isAssociated) {
          const balanceResponse = await fetch(
            `${API_BASE}/api/token/balance/${accountId}`
          );
          const balanceData = await balanceResponse.json();
          setBalance(balanceData);
        }
      } catch (err) {
        console.error("Failed to fetch RVP data:", err);
        setError("Failed to load token data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceAndStatus();
  }, [isConnected, accountId, tokenInfo]);

  const handleConnectWallet = () => {
    // Trigger wallet connection (user should already have this button elsewhere)
    alert("Please use the 'Connect Wallet' button in the header/navigation");
  };

  const handleAssociate = async () => {
    if (!isConnected || !accountId || !tokenInfo) return;

    setIsAssociating(true);
    setError(null);

    try {
      // Get HashConnect instance
      const hashconnect = getHashConnectInstance();

      // Create token association transaction
      const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenInfo.tokenId]);

      // Execute transaction via HashConnect
      const result = await hashconnect.sendTransaction(
        accountId,
        transaction,
        "testnet"
      );

      console.log("✅ Token association successful:", result);

      // Update backend
      const jwt = localStorage.getItem("receiptoverse_token");
      if (jwt) {
        await fetch(`${API_BASE}/api/users/associate-rvp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            accountId,
            tokenId: tokenInfo.tokenId,
          }),
        });
      }

      // Refresh status
      setIsAssociated(true);
      setTimeout(() => {
        // Fetch balance after association
        fetch(`${API_BASE}/api/token/balance/${accountId}`)
          .then((res) => res.json())
          .then((data) => setBalance(data));
      }, 2000);
    } catch (err) {
      console.error("❌ Association failed:", err);
      setError(err.message || "Failed to associate token. Please try again.");
    } finally {
      setIsAssociating(false);
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="stat-card rvp-token">
        <div className="stat-icon">🪙</div>
        <div className="stat-content">
          <h3>--</h3>
          <p>RVP Points (Hedera)</p>
          <button className="connect-wallet-btn" onClick={handleConnectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="stat-card rvp-token">
        <div className="stat-icon">🪙</div>
        <div className="stat-content">
          <h3>...</h3>
          <p>RVP Points (Hedera)</p>
          <span className="stat-badge">Loading...</span>
        </div>
      </div>
    );
  }

  // Not associated state
  if (!isAssociated) {
    return (
      <div className="stat-card rvp-token">
        <div className="stat-icon">🪙</div>
        <div className="stat-content">
          <h3>--</h3>
          <p>RVP Points (Hedera)</p>
          <button
            className="associate-btn"
            onClick={handleAssociate}
            disabled={isAssociating}
          >
            {isAssociating ? "Associating..." : "Associate RVP Token"}
          </button>
          {error && <div className="error-message">{error}</div>}
          <div className="info-text">
            Associate to earn on-chain points (~$0.05)
          </div>
        </div>
      </div>
    );
  }

  // Associated state - show balance
  return (
    <div className="stat-card rvp-token">
      <div className="stat-icon">🪙</div>
      <div className="stat-content">
        <h3>{balance ? balance.displayBalance : "0.00"}</h3>
        <p>RVP Points (Hedera)</p>
        <span className="stat-badge success">On-chain ✓</span>
        {tokenInfo && (
          <a
            href={`https://hashscan.io/${tokenInfo.network}/account/${accountId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hashscan-link"
          >
            View on HashScan →
          </a>
        )}
      </div>
    </div>
  );
};

export default RVPTokenCard;
