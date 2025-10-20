import React, { Suspense, lazy } from "react";

// Lazy load the button content to avoid SSR issues
const HashConnectButtonContent = lazy(() =>
  import("./HashConnectButtonContent")
);

const HashConnectButton = () => {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded">
          Loading...
        </div>
      }
    >
      <HashConnectButtonContent />
    </Suspense>
  );
};

export default HashConnectButton;
