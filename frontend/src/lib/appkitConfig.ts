// /src/lib/appkitConfig.ts

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { hedera, hederaTestnet } from "@reown/appkit/networks";
import { QueryClient } from "@tanstack/react-query";

// 1. Your Project ID from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// 2. Application Metadata
const metadata = {
  name: "My Hedera dApp",
  description: "An example dApp for minting NFTs on Hedera.",
  url: "https://my-dapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// 3. Configure Hedera Networks
// Use the pre-configured network objects from Appkit to ensure CAIP-2 compliance.
const chains = [hedera, hederaTestnet] as const; // <-- FIX 1

// 4. Create WagmiAdapter
// This adapter connects Appkit to the wagmi hooks ecosystem.
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  chains,
  metadata,
  // Prioritize HashPack in the connection modal UI
  featuredWalletIds: ["c57ca95b47569778a828d191785f1e1b"], // <-- FIX 2
  // Optional: Enable analytics in your Reown Cloud dashboard
  features: {
    analytics: true,
  },
});

// 5. Create the Appkit instance (Singleton)
// This function is called only once, when this module is first imported.
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  chains,
  metadata,
});

// 6. Export QueryClient for the provider
export const queryClient = new QueryClient();
