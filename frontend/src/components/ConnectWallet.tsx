"use client"; // Required for Next.js App Router

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect } from "wagmi";

export function ConnectWallet() {
  // Appkit hook to control the connection modal
  const { open } = useAppKit();

  // Appkit hook to get account status and address
  const { address, isConnected, status } = useAppKitAccount();

  // Wagmi hook for handling disconnection
  const { disconnect } = useDisconnect();

  // Function to format Hedera account ID for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    // Hedera addresses are typically not long hex strings like EVM,
    // so we can display them as is or apply custom formatting if needed.
    // Example: 0.0.123456
    return addr;
  };

  if (isConnected) {
    return (
      <div>
        <span>Connected: {formatAddress(address)}</span>
        <button onClick={() => disconnect()} style={{ marginLeft: "1rem" }}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => open()} disabled={status === "connecting"}>
      {status === "connecting" ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
