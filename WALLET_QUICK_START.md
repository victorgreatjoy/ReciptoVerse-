# 🎯 Quick Command Reference - New Wallet Setup

## Current Status

✅ Old packages removed  
✅ New package installed (`@buidlerlabs/hashgraph-react-wallets`)  
✅ ConnectWalletButton simplified (90 lines vs 220)  
✅ WalletContext simplified (45 lines vs 90)  
✅ Ready to test!

---

## Start Testing Now

```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 and click "Connect Wallet"!

---

## What's Different?

### Old Approach (Removed)

```tsx
// Had to manually manage everything
import {
  DAppConnector,
  HederaSessionEvent,
} from "@hashgraph/hedera-wallet-connect";

const connector = new DAppConnector(/* 6 parameters */);
await connector.init();
connector.onSessionEvent((event) => {
  // 30+ lines of manual event handling
});
```

### New Approach (Current)

```tsx
// Simple hook does everything
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import { HashpackConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";

const { isConnected, connect, disconnect, data } = useWallet(HashpackConnector);
```

---

## Testing Checklist

- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Click "Connect Wallet" button (top-right)
- [ ] HashPack extension opens
- [ ] Approve connection
- [ ] See account ID (e.g., `🔗 0.0.12345`)
- [ ] Click "Disconnect"
- [ ] Account ID disappears

---

## Common Commands

### Start Dev Server

```bash
cd frontend
npm run dev
```

### Check Package Installed

```bash
npm list @buidlerlabs/hashgraph-react-wallets
```

### Reinstall if Needed

```bash
npm install @buidlerlabs/hashgraph-react-wallets --legacy-peer-deps
```

---

## Files Changed

```
✅ frontend/src/components/ConnectWalletButton.tsx  (simplified)
✅ frontend/src/contexts/WalletContext.tsx           (simplified)
✅ frontend/package.json                              (updated deps)
```

---

## No Changes Needed

```
✓ frontend/src/components/AppContent.jsx    (import still works)
✓ frontend/src/App.jsx                      (WalletProvider still works)
✓ frontend/.env.development                 (projectId still used)
```

---

## Quick Examples

### Use in Any Component

```tsx
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import { HashpackConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";

const MyComponent = () => {
  const { isConnected, data } = useWallet(HashpackConnector);

  return (
    <div>
      {isConnected ? <p>Connected: {data?.accountId}</p> : <p>Not connected</p>}
    </div>
  );
};
```

### Show Balance

```tsx
import { useBalance } from "@buidlerlabs/hashgraph-react-wallets";

const Balance = () => {
  const { data: balance } = useBalance();
  return <span>{balance?.formatted ?? "0 ℏ"}</span>;
};
```

---

## Troubleshooting

### HashPack Not Found?

Install from: https://www.hashpack.app/

### Connection Not Working?

1. Check console for errors
2. Make sure HashPack is unlocked
3. Restart dev server

### Module Not Found?

Run: `npm install @buidlerlabs/hashgraph-react-wallets --legacy-peer-deps`

---

## Documentation Files

- **`WALLET_MIGRATION_COMPLETE.md`** - Full migration details
- **`WALLET_SETUP_SIMPLE.md`** - Usage guide
- **This file** - Quick commands

---

## Key Advantage

**Before**: 220 lines of complex code  
**After**: 90 lines of simple hooks  
**Result**: 59% less code, much easier! 🎉

---

**Ready?** Run `npm run dev` and test the wallet connection!
