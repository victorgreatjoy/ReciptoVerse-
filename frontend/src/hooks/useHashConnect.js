import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setConnect,
  setDisconnect,
} from "../store/hashconnectSlice";
import {
  getHashConnectInstance,
  getInitPromise,
  getConnectedAccountIds,
} from "../services/hashconnect";

const useHashConnect = () => {
  const dispatch = useDispatch();
  const hashconnectState = useSelector((state) => state.hashconnect);
  const { isConnected, accountId, isLoading } = hashconnectState;

  useEffect(() => {
    const setupHashConnect = async () => {
      try {
        if (typeof window === "undefined") return;

        // Wait for HashConnect to initialize
        await getInitPromise();
        const instance = getHashConnectInstance();

        // Set up event listeners
        const handlePairing = async (pairingData) => {
          console.log("🔗 Pairing Event:", pairingData);
          dispatch(setLoading(false));
          const accountIds = getConnectedAccountIds();
          if (accountIds && accountIds.length > 0) {
            const accountId = accountIds[0].toString();
            dispatch(setConnect(accountId));

            // Sync with backend for NFT minting
            try {
              const jwt = localStorage.getItem("receiptoverse_token");
              if (jwt) {
                const API_BASE =
                  import.meta.env.VITE_API_URL || "http://localhost:3000";
                const url = `${API_BASE}/api/users/connect-wallet`;
                console.log("🔌 Syncing wallet to backend:", accountId);
                const res = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                  },
                  body: JSON.stringify({ accountId }),
                });
                const result = await res.json();
                if (!result.success) {
                  console.warn("❌ Backend wallet sync failed:", result.error);
                } else {
                  console.log("✅ Backend wallet synced:", result);
                }
              } else {
                console.warn("⚠️ No JWT found, cannot sync wallet to backend");
              }
            } catch (err) {
              console.error("❌ Error syncing wallet to backend:", err);
            }
          }
        };

        const handleDisconnection = (disconnectionData) => {
          console.log("🔌 Disconnection event:", disconnectionData);
          dispatch(setDisconnect());
        };

        const handleConnectionStatusChange = (connectionStatus) => {
          console.log("📡 Connection Status Changed:", connectionStatus);
        };

        // Add event listeners
        instance.pairingEvent.on(handlePairing);
        instance.disconnectionEvent.on(handleDisconnection);
        instance.connectionStatusChangeEvent.on(handleConnectionStatusChange);

        // Check if already connected
        const accountIds = getConnectedAccountIds();
        if (accountIds && accountIds.length > 0) {
          dispatch(setConnect(accountIds[0].toString()));
        }

        // Cleanup function
        return () => {
          try {
            instance.pairingEvent.off(handlePairing);
            instance.disconnectionEvent.off(handleDisconnection);
            instance.connectionStatusChangeEvent.off(
              handleConnectionStatusChange
            );
          } catch (error) {
            console.log("⚠️ Error cleaning up event listeners:", error);
          }
        };
      } catch (error) {
        console.error("❌ Error setting up HashConnect:", error);
        dispatch(setLoading(false));
      }
    };

    const cleanup = setupHashConnect();
    return () => {
      if (cleanup && typeof cleanup.then === "function") {
        cleanup.then((cleanupFn) => {
          if (typeof cleanupFn === "function") {
            cleanupFn();
          }
        });
      }
    };
  }, [dispatch]);

  const connect = async () => {
    dispatch(setLoading(true));
    try {
      if (typeof window === "undefined") return;

      console.log("🔄 Attempting to connect to wallet...");
      await getInitPromise();
      const instance = getHashConnectInstance();

      // Detect if user is on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        console.log("📱 Mobile detected - using deep link connection");

        // Get pairing string for deep linking
        const pairingString = instance.pairingString;

        if (pairingString) {
          // Create HashPack deep link (auto-opens the app!)
          const hashpackDeepLink = `hashpack://hcs/connect?pairingString=${encodeURIComponent(
            pairingString
          )}`;

          // Also support Blade wallet
          const bladeDeepLink = `blade://hcs/connect?pairingString=${encodeURIComponent(
            pairingString
          )}`;

          console.log("🔗 Opening wallet app via deep link...");
          console.log("   HashPack link:", hashpackDeepLink);

          // Try to open HashPack first (most common)
          window.location.href = hashpackDeepLink;

          // Show a helpful message
          setTimeout(() => {
            console.log(
              "💡 If HashPack didn't open, you can also use Blade wallet"
            );
          }, 1000);

          // Fallback to modal after 2 seconds if deep link failed
          setTimeout(() => {
            instance.openPairingModal();
          }, 2000);
        } else {
          // Fallback to standard modal
          await instance.openPairingModal();
        }
      } else {
        console.log("💻 Desktop detected - using pairing modal with QR code");
        // Desktop: show modal with QR code for mobile scanning
        await instance.openPairingModal();
      }

      // Set a timeout to handle stuck pairing
      setTimeout(() => {
        const accountIds = getConnectedAccountIds();
        if (!accountIds || accountIds.length === 0) {
          console.log("⏱️ Pairing timeout - stopping loading state");
          dispatch(setLoading(false));
        }
      }, 30000); // 30 second timeout
    } catch (error) {
      console.error("❌ Error connecting to wallet:", error);
      dispatch(setLoading(false));
    }
  };

  const disconnect = () => {
    try {
      if (typeof window === "undefined") return;

      const instance = getHashConnectInstance();
      instance.disconnect();
      dispatch(setDisconnect());
    } catch (error) {
      console.error("❌ Error disconnecting from wallet:", error);
      dispatch(setDisconnect());
    }
  };

  return {
    isConnected,
    accountId,
    isLoading,
    connect,
    disconnect,
  };
};

export default useHashConnect;
