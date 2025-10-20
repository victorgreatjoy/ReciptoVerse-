# 🔗 Wallet Setup - Hashgraph React Wallets

## Overview

We're using **Hashgraph React Wallets** - a minimalistic library that makes it easy to connect Hedera wallets.

### What's Implemented

✅ Simple `ConnectWalletButton` component  
✅ `WalletProvider` wrapping the app  
✅ HashPack connector configured for Hedera Testnet  
✅ Clean, minimal code (~90 lines total)

---

## Quick Start

### 1. Install Package (Already Done!)

```bash
npm install @buidlerlabs/hashgraph-react-wallets --legacy-peer-deps
```

### 2. Project ID (Already Configured!)

The WalletConnect project ID is already in `.env.development`:

```bash
VITE_WALLETCONNECT_PROJECT_ID=dbf33d8910b938fcce1ad87f2ae0982b
```

### 3. Start Testing

```bash
npm run dev
```

Open http://localhost:5173 and click "Connect Wallet" in the header!

---

## Usage

### Connect Button (Already in Header)

The button automatically handles all states:

- ❌ **Extension Not Found** - Shows install link
- ⏳ **Not Connected** - Shows "Connect Wallet" button
- ✅ **Connected** - Shows account ID and "Disconnect" button

### Use in Other Components

```tsx
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import { HashpackConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";

const MyComponent = () => {
  const { isConnected, data } = useWallet(HashpackConnector);

  if (!isConnected) {
    return <p>Please connect your wallet</p>;
  }

  return <p>Connected: {data?.accountId}</p>;
};
```

### Get Account Balance

```tsx
import { useBalance } from "@buidlerlabs/hashgraph-react-wallets";

const WalletBalance = () => {
  const { data: balance } = useBalance();

  return <span>{balance?.formatted ?? "0 ℏ"}</span>;
};
```

---

## How It Works

### Provider Setup (`WalletContext.tsx`)

```tsx
<HWBridgeProvider
  metadata={metadata} // App name, description, icons
  projectId={projectId} // WalletConnect project ID
  connectors={[HashpackConnector]} // HashPack wallet
  chains={[HederaTestnet]} // Hedera Testnet
>
  {children}
</HWBridgeProvider>
```

### Connect Button (`ConnectWalletButton.tsx`)

```tsx
const {
  isExtensionRequired,
  extensionReady,
  isConnected,
  connect,
  disconnect,
  data,
} = useWallet(HashpackConnector);
```

The hook provides:

- `isExtensionRequired` - Does HashPack need to be installed?
- `extensionReady` - Is HashPack extension available?
- `isConnected` - Is wallet currently connected?
- `connect()` - Function to connect wallet
- `disconnect()` - Function to disconnect wallet
- `data.accountId` - Connected Hedera account ID (e.g., "0.0.12345")

---

## Files Structure

```
frontend/src/
├── components/
│   ├── ConnectWalletButton.tsx    (~90 lines - simple!)
│   └── ConnectWalletButton.css    (styling)
├── contexts/
│   └── WalletContext.tsx          (~45 lines - wraps HWBridgeProvider)
└── App.jsx                        (WalletProvider in hierarchy)
```

---

## Advantages Over Previous Approach

✅ **Much Simpler** - 90 lines vs 220 lines  
✅ **No Manual Session Management** - Library handles it  
✅ **No Event Listeners** - Built-in reactivity  
✅ **Better TypeScript Support** - Full type safety  
✅ **Multi-Wallet Ready** - Easy to add Blade, Kabila, etc.

---

## Testing Checklist

- [ ] Click "Connect Wallet" button
- [ ] HashPack extension opens
- [ ] Approve connection
- [ ] Account ID appears (e.g., `🔗 0.0.12345`)
- [ ] Refresh page - connection persists
- [ ] Click "Disconnect" - account disappears

---

## Troubleshooting

### Extension Not Found

**Error**: "HashPack extension not found"  
**Solution**: Install from https://www.hashpack.app/

### Connection Not Working

1. Check console for errors
2. Verify `VITE_WALLETCONNECT_PROJECT_ID` in `.env.development`
3. Restart dev server: `npm run dev`

---

## Next Steps

### 1. Add More Wallets

```tsx
import { BladeConnector, KabilaConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";

<HWBridgeProvider
  connectors={[HashpackConnector, BladeConnector, KabilaConnector]}
  // ... rest of props
>
```

### 2. Show Account Balance

```tsx
import { useBalance } from "@buidlerlabs/hashgraph-react-wallets";

const Header = () => {
  const { data: balance } = useBalance();
  return <span>{balance?.formatted}</span>;
};
```

### 3. Backend Integration

Send connected `accountId` to your backend for:

- Wallet-based authentication
- NFT minting to user's wallet
- Token transfers

---

## Resources

- **Official Docs**: https://hashgraph-react-wallets.buidlerlabs.com/
- **GitHub**: https://github.com/buidler-labs/hashgraph-react-wallets
- **HashPack**: https://www.hashpack.app/

---

**Status**: ✅ Ready to use! Click "Connect Wallet" in the header to test.
