# Quick Start: Install Wallet Packages

## Install Required Packages

Run this command in the `frontend` folder:

```bash
cd frontend
npm install @hashgraph/hedera-wallet-connect @hashgraph/sdk @walletconnect/modal
```

## Verify Installation

After installation completes, check your `package.json`:

```json
{
  "dependencies": {
    "@hashgraph/hedera-wallet-connect": "^1.x.x",
    "@hashgraph/sdk": "^2.x.x",
    "@walletconnect/modal": "^2.x.x"
  }
}
```

## Next Steps

1. **Get WalletConnect Project ID**

   - Sign up at: https://cloud.walletconnect.com/
   - Create a new project
   - Copy your Project ID

2. **Add to Environment Variables**

   - Open `frontend/.env.development`
   - Add: `VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here`

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Test Wallet Connection**
   - Open http://localhost:5173
   - Click "Connect Wallet" button in header
   - Connect with HashPack

## Full Documentation

See `WALLET_SETUP.md` for complete setup guide, troubleshooting, and next steps.
