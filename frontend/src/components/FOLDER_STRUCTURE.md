# 📁 Components Folder Structure

## New Organization (Recommended)

```
components/
├── features/              # Feature-specific components
│   ├── ai-support/       # AI Support Chat
│   │   ├── AISupportChat.jsx
│   │   ├── AIChatButton.jsx
│   │   ├── AIChatMessage.jsx
│   │   ├── AIChatInput.jsx
│   │   ├── AIChatSuggestions.jsx
│   │   └── AIChatTypingIndicator.jsx
│   │
│   ├── auth/             # Authentication
│   │   ├── AuthModal.jsx
│   │   ├── AuthModal.css
│   │   ├── EmailVerification.jsx
│   │   └── (move AuthModalNew.jsx here)
│   │
│   ├── wallet/           # Wallet Connection
│   │   ├── HashConnectButton.jsx
│   │   ├── HashConnectButtonContent.jsx
│   │   ├── WalletConnection.jsx
│   │   ├── WalletConnection.css
│   │   └── ConnectWallet.tsx
│   │
│   ├── receipts/         # Receipt Management
│   │   ├── ReceiptDashboard.jsx
│   │   ├── ReceiptDashboard.css
│   │   ├── ReceiptCreator.jsx
│   │   ├── ReceiptCreator.css
│   │   ├── ReceiptForm.jsx
│   │   └── ReceiptForm.css
│   │
│   ├── points/           # Points & Rewards
│   │   ├── PointsDashboard.jsx
│   │   ├── EnhancedUserQRCode.jsx
│   │   ├── UserQRCode.jsx
│   │   ├── UserQRCode.css
│   │   └── TokenMintModal.jsx
│   │
│   ├── merchant/         # Merchant Features
│   │   ├── MerchantDashboard.jsx
│   │   ├── MerchantDashboard.css
│   │   ├── MerchantPOS.jsx
│   │   ├── MerchantPOS.css
│   │   ├── MerchantQRScanner.jsx
│   │   ├── MerchantRegistration.jsx
│   │   └── MerchantRegistration.css
│   │
│   ├── nft/              # NFT Features
│   │   ├── NFTGallery.jsx
│   │   └── NFTGallery.css
│   │
│   └── admin/            # Admin Features
│       ├── AdminDashboard.jsx
│       └── AdminDashboard.css
│
├── layout/               # Layout components
│   ├── AppContent.jsx
│   ├── LandingPage.jsx
│   ├── UserDashboard.jsx
│   ├── UserDashboard.css
│   ├── NotificationCenter.jsx
│   └── NotificationCenter.css
│
└── ui/                   # Reusable UI components
    ├── Button.jsx
    ├── Card.jsx
    ├── Input.jsx
    └── ... (existing UI components)
```

## Migration Guide

**To migrate existing components:**

1. Move files to their respective feature folders
2. Update import paths in files that use them
3. Keep old files temporarily for backward compatibility
4. Test thoroughly before deleting old files

**Example:**

```javascript
// Old import
import PointsDashboard from "./PointsDashboard";

// New import
import PointsDashboard from "./features/points/PointsDashboard";
```

## Benefits

- ✅ Better organization by feature
- ✅ Easier to find related components
- ✅ Cleaner imports
- ✅ Scalable structure
- ✅ Team collaboration friendly
