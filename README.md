# ReciptoVerse MVP 🧾

A blockchain-based receipt NFT platform built on Hedera Hashgraph that allows merchants to create receipt NFTs and reward customers with RECV tokens.

## 🎯 Overview

ReciptoVerse transforms traditional paper receipts into valuable NFTs while rewarding customers for their purchases. Built on Hedera's fast and eco-friendly blockchain, this platform demonstrates how everyday transactions can be enhanced with blockchain technology.

## ✨ Features

- **Receipt NFT Creation**: Convert purchase receipts into unique NFTs stored on IPFS
- **Token Rewards**: Customers receive RECV tokens for each purchase
- **Blockchain Storage**: All data immutably stored on Hedera testnet
- **IPFS Integration**: Metadata stored on distributed file system via Pinata
- **Real-time Viewing**: Direct links to view NFTs on HashScan explorer

## 🏗️ Architecture

### Backend (Node.js + Express)

- **Hedera SDK**: Blockchain interactions (token minting, transfers, associations)
- **Pinata IPFS**: Decentralized metadata storage
- **Express API**: RESTful endpoints for frontend communication

### Frontend (React + Vite)

- **React Interface**: Dynamic receipt form with real-time calculations
- **Mock Wallet**: Simplified connection for MVP testing
- **Responsive Design**: Custom CSS styling for modern UX

### Blockchain Components

- **RECV Token** (`0.0.6922722`): Fungible reward token
- **rNFT Token** (`0.0.6922732`): Non-fungible receipt collection
- **Hedera Testnet**: Fast, low-cost blockchain network

## 🚀 Quick Start

### Prerequisites

- Node.js v22.20.0 or higher
- Hedera testnet account with HBAR
- Pinata account for IPFS storage

### Environment Setup

Create `.env` file in the root directory:

```env
# Hedera Configuration
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here

# Token IDs (created during setup)
RECV_TOKEN_ID=0.0.6922722
RNFT_TOKEN_ID=0.0.6922732

# Pinata IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret
PINATA_JWT=your_pinata_jwt_token
```

### Installation & Running

1. **Clone and Install Dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Start Backend Server**

   ```bash
   cd backend/src
   node server.js
   ```

   You should see:

   ```
   🔧 Hedera client configured:
   Operator ID: 0.0.6913837
   RECV Token ID: 0.0.6922722
   rNFT Token ID: 0.0.6922732
   🔧 Pinata configured:
   API Key: ✅ Loaded
   ✅ API running on http://localhost:3000
   ```

3. **Start Frontend** (new terminal)

   ```bash
   cd frontend
   npm run dev
   ```

   Open: http://localhost:5173/

## 📋 How to Use

### Creating a Receipt NFT

1. **Connect Wallet**: Click "Connect Wallet (Mock)" button
2. **Fill Receipt Details**:
   - Merchant name (e.g., "Coffee Shop Downtown")
   - Add items with names, prices, and quantities
   - Total automatically calculated
3. **Create NFT**: Click "Create Receipt NFT"
4. **View Results**: Links to HashScan and IPFS metadata

### Example Receipt Data

```json
{
  "merchant": "Coffee Shop Downtown",
  "items": [
    { "name": "Latte", "price": 4.5, "quantity": 2 },
    { "name": "Croissant", "price": 3.25, "quantity": 1 }
  ],
  "total": 12.25
}
```

## 🔧 API Endpoints

### POST `/associate-tokens`

Associates RECV and rNFT tokens with a customer account.

**Request:**

```json
{
  "accountId": "0.0.123456"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Tokens associated with account 0.0.123456",
  "tokens": ["0.0.6922722", "0.0.6922732"]
}
```

### POST `/mint-receipt`

Creates a receipt NFT and rewards the customer.

**Request:**

```json
{
  "merchant": "Coffee Shop",
  "items": [{ "name": "Coffee", "price": 3.5, "quantity": 1 }],
  "total": 3.5,
  "customerWallet": "0.0.123456"
}
```

**Response:**

```json
{
  "status": "success",
  "receiptNFT": "0.0.6922732::5",
  "metadataUrl": "https://gateway.pinata.cloud/ipfs/Qm...",
  "reward": "10 RECV",
  "nftViewUrl": "https://hashscan.io/testnet/token/0.0.6922732/5"
}
```

## 🧪 Testing

### Backend API Testing

Run the automated test suite:

```bash
cd backend
node test-api.js
```

This tests:

- Token association
- Receipt NFT minting
- IPFS metadata upload
- Blockchain transactions

### Manual Testing with cURL

```bash
# Test token association
curl -X POST http://localhost:3000/associate-tokens \
  -H "Content-Type: application/json" \
  -d '{"accountId": "0.0.6913837"}'

# Test receipt creation
curl -X POST http://localhost:3000/mint-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Test Shop",
    "items": [{"name": "Item", "price": 10, "quantity": 1}],
    "total": 10,
    "customerWallet": "0.0.6913837"
  }'
```

## 📊 Project Structure

```
ReciptoVerse/
├── backend/
│   ├── src/
│   │   ├── server.js              # Main Express server
│   │   ├── create-receipt-nft.js  # NFT creation logic
│   │   ├── create-recv-token.js   # RECV token setup
│   │   └── hederaClient.js        # Hedera SDK configuration
│   ├── test-api.js                # Automated API tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main React component
│   │   ├── App.css                # Custom styling
│   │   ├── App-simple.jsx         # Mock wallet version
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   └── package.json
├── contracts/                     # Hardhat smart contracts (optional)
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🔗 Technology Stack

### Blockchain

- **Hedera Hashgraph**: Fast, secure, and eco-friendly DLT
- **Hedera SDK**: JavaScript SDK for blockchain interactions
- **HashScan**: Block explorer for viewing transactions

### Storage

- **IPFS**: Decentralized file storage via Pinata
- **Pinata**: IPFS pinning service with global CDN

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Axios**: HTTP client for IPFS uploads

### Frontend

- **React**: User interface library
- **Vite**: Fast build tool and dev server
- **Custom CSS**: Responsive styling without frameworks

## 🎨 NFT Metadata Structure

Each receipt NFT contains rich metadata stored on IPFS:

```json
{
  "name": "Receipt from Coffee Shop Downtown",
  "description": "Purchase receipt - Total: $12.25",
  "image": "https://via.placeholder.com/400x300/f8f9fa/333?text=Receipt",
  "attributes": [
    { "trait_type": "Merchant", "value": "Coffee Shop Downtown" },
    { "trait_type": "Total", "value": "$12.25" },
    { "trait_type": "Date", "value": "9/29/2025" },
    { "trait_type": "Items Count", "value": 2 }
  ],
  "properties": {
    "receipt": {
      "merchant": "Coffee Shop Downtown",
      "items": [...],
      "total": 12.25,
      "date": "2025-09-29T16:30:45.123Z"
    },
    "type": "purchase_receipt"
  }
}
```

## 🔄 Transaction Flow

1. **Customer makes purchase** → Merchant initiates receipt creation
2. **Token Association** → Ensure customer can receive tokens
3. **Metadata Creation** → Generate receipt data structure
4. **IPFS Upload** → Store metadata on distributed network
5. **NFT Minting** → Create unique receipt NFT on Hedera
6. **Token Transfer** → Send NFT and RECV rewards to customer
7. **Confirmation** → Provide HashScan links for verification

## 🛡️ Security Considerations

### For Production Deployment:

- **Private Key Management**: Use secure key storage (HSM, AWS KMS)
- **Environment Variables**: Never commit sensitive data to git
- **Rate Limiting**: Implement API rate limits
- **Input Validation**: Sanitize all user inputs
- **Customer Key Signing**: Require customer signatures for token association
- **Multi-signature**: Use multi-sig for treasury operations

### Current MVP Limitations:

- Uses operator key for all transactions (testing only)
- Mock wallet connection (no real wallet integration)
- No rate limiting or extensive input validation
- Simplified error handling

## 🔮 Future Enhancements

### Wallet Integration

- Real HashPack wallet connection
- WalletConnect integration
- Multi-wallet support (Blade, Hashpack, etc.)

### Business Features

- Merchant dashboard
- Customer loyalty programs
- Bulk receipt processing
- Receipt analytics and insights

### Technical Improvements

- Smart contract integration
- Advanced NFT utilities
- Mobile app development
- Mainnet deployment

## 📈 Performance & Costs

### Hedera Testnet Performance:

- **Transaction Speed**: ~3-5 seconds finality
- **Network Fees**: $0.0001 USD per transaction
- **Throughput**: 10,000+ TPS capability
- **Energy Efficient**: Carbon-negative network

### IPFS Storage:

- **Upload Speed**: ~1-2 seconds via Pinata
- **Global CDN**: Fast worldwide access
- **Redundancy**: Multiple pin locations

## 🐛 Troubleshooting

### Common Issues:

**"Failed to fetch" Error:**

- Ensure backend server is running on port 3000
- Check CORS configuration in server.js
- Verify frontend is connecting to correct URL

**Token Association Errors:**

- Confirm account has sufficient HBAR (~$5)
- Check if tokens are already associated
- Verify operator account permissions

**IPFS Upload Failures:**

- Validate Pinata API credentials
- Check network connectivity
- Ensure JSON data is properly formatted

**Hedera Transaction Errors:**

- Verify operator ID and private key
- Check account balance for transaction fees
- Ensure proper transaction structure

## 📄 License

This project is for educational and demonstration purposes. See individual package licenses for third-party dependencies.

## 🤝 Contributing

This is an MVP demonstration project. For production use, consider:

- Comprehensive testing suite
- Security audit
- Performance optimization
- Documentation updates

## 📞 Support

For questions about Hedera development:

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Discord](https://discord.gg/hedera)
- [HashScan Explorer](https://hashscan.io/testnet)

---

**Built with ❤️ on Hedera Hashgraph**

_Transforming everyday receipts into valuable digital assets_ 🧾→💎
