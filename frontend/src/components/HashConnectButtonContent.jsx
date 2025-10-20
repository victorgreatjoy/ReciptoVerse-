import React from "react";
import useHashConnect from "../hooks/useHashConnect";

const HashConnectButtonContent = () => {
  const { isConnected, accountId, isLoading, connect, disconnect } =
    useHashConnect();

  const formatAccountId = (id) => {
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Connected: {formatAccountId(accountId || "")}
          </span>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
};

export default HashConnectButtonContent;
