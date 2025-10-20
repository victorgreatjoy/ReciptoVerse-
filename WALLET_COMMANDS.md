# 🚀 Quick Command Reference - Wallet Setup

## Install Packages (REQUIRED FIRST!)

```powershell
cd frontend
npm install @hashgraph/hedera-wallet-connect @hashgraph/sdk @walletconnect/modal
```

## Get WalletConnect Project ID

1. Visit: https://cloud.walletconnect.com/
2. Sign up / Sign in
3. Create New Project → Name: "ReceiptoVerse"
4. Copy your Project ID

## Add Project ID to Environment

```powershell
# Edit frontend/.env.development
# Add this line (replace with your actual projectId):
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Start Development Server

```powershell
cd frontend
npm run dev
```

## Test the Connection

1. Open: http://localhost:5173
2. Click "Connect Wallet" button (top-right header)
3. Choose HashPack from modal
4. Approve connection
5. See your account ID appear (e.g., `🔗 0.0.12345`)

## Install HashPack (if needed)

- Chrome Extension: https://www.hashpack.app/
- Mobile App: Available on iOS & Android

## Troubleshooting Commands

### Check if packages installed correctly

```powershell
cd frontend
npm list @hashgraph/hedera-wallet-connect
npm list @hashgraph/sdk
npm list @walletconnect/modal
```

### Check environment variable

```powershell
# View .env.development file
cat frontend/.env.development
```

### Restart dev server (if env changes not detected)

```powershell
# Stop server (Ctrl+C), then restart:
cd frontend
npm run dev
```

## Useful Links

- **Full Setup Guide**: `WALLET_SETUP.md`
- **Implementation Summary**: `WALLET_IMPLEMENTATION_SUMMARY.md`
- **WalletConnect Cloud**: https://cloud.walletconnect.com/
- **HashPack Download**: https://www.hashpack.app/
- **Hedera Portal** (Testnet HBAR): https://portal.hedera.com/

## What Files Were Created?

```
frontend/
├── src/
│   ├── components/
│   │   ├── ConnectWalletButton.tsx     ✅ NEW
│   │   └── ConnectWalletButton.css     ✅ NEW
│   └── contexts/
│       └── WalletContext.tsx           ✅ NEW
├── .env.development                    ✅ UPDATED
└── .env.example                        ✅ UPDATED

Root:
├── WALLET_SETUP.md                     ✅ NEW (comprehensive guide)
├── WALLET_INSTALL.md                   ✅ NEW (quick start)
├── WALLET_IMPLEMENTATION_SUMMARY.md    ✅ NEW (what was built)
└── WALLET_COMMANDS.md                  ✅ NEW (this file)
```

## Next Steps After Testing

1. **Backend Auth** - Implement wallet-based authentication (nonce signing)
2. **NFT Minting** - Connect wallet to NFT minting on receipt scan
3. **Balance Display** - Show HBAR and RECV token balance in header
4. **Production Deploy** - Add projectId to Vercel environment variables

---

**Status**: ✅ Ready for testing after running `npm install`

**Need Help?** See `WALLET_SETUP.md` → Troubleshooting section
