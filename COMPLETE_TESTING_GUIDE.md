# 🧪 ReceiptoVerse - Complete Testing Guide

## Overview

This guide will walk you through testing all functionalities of ReceiptoVerse, from user registration to NFT minting and real-time notifications.

---

## 🚀 Prerequisites

### 1. Start Both Servers

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Verify System Status

- Backend: `http://localhost:3000` (should show server logs)
- Frontend: `http://localhost:5173` (should load ReceiptoVerse)
- Health Check: `http://localhost:3000/api/health`

---

## 📋 Testing Checklist

### ✅ Phase 1: Basic User & Authentication System

#### Test 1.1: User Registration

1. **Navigate to**: `http://localhost:5173`
2. **Click**: "Get Started" button
3. **Fill out registration form**:
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Password: `password123`
   - Handle: `testuser`
4. **Submit** and verify success message
5. **Expected Result**: User registered, automatically logged in

#### Test 1.2: User Login/Logout

1. **Click**: "Sign Out" button
2. **Click**: "Sign In" button
3. **Enter credentials** from Test 1.1
4. **Submit** and verify login success
5. **Expected Result**: User logged in, welcome message shown

#### Test 1.3: QR Code Generation

1. **Navigate**: "📱 My QR Code" tab
2. **Verify**: QR code image displays
3. **Check**: User data shown below QR code
4. **Copy**: QR code data (will be used later)
5. **Expected Result**: Unique QR code with user information

---

### ✅ Phase 2: Merchant System

#### Test 2.1: Merchant Registration

1. **Navigate**: "🏪 Be a Merchant" tab
2. **Fill out merchant form**:
   - Business Name: `Test Coffee Shop`
   - Business Type: `Restaurant`
   - Address: `123 Main St, Test City`
   - Phone: `(555) 123-4567`
   - Description: `Testing merchant registration`
3. **Submit** and note the **Merchant ID** from response
4. **Expected Result**: Merchant registered with "pending" status

#### Test 2.2: Merchant Approval (Development)

1. **Open new browser tab**
2. **Visit**: `http://localhost:3000/api/merchants/dev/list`
3. **Find your merchant** and copy the ID
4. **Visit**: `http://localhost:3000/api/merchants/dev/approve/[MERCHANT_ID]`
5. **Expected Result**: JSON response showing merchant approved

#### Test 2.3: Merchant Dashboard Access

1. **Refresh** main application page
2. **Navigate**: "🏪 Merchant Dashboard" tab (should now be visible)
3. **Verify**: Dashboard loads with merchant information
4. **Check**: Business details and status show "approved"
5. **Expected Result**: Full merchant dashboard access

---

### ✅ Phase 3: POS System & Receipt Creation

#### Test 3.1: POS System Access

1. **Navigate**: "💳 POS System" tab
2. **Verify**: POS interface loads without errors
3. **Check**: Customer QR scanner section visible
4. **Expected Result**: Complete POS system interface

#### Test 3.2: Receipt Creation

1. **In POS System**, paste the QR code data from Test 1.3
2. **Click**: "Scan QR Code" or enter data manually
3. **Verify**: Customer information appears
4. **Add receipt items**:
   - Item 1: "Coffee" - Price: `$4.50`
   - Item 2: "Danish Pastry" - Price: `$3.25`
5. **Set total**: `$7.75`
6. **Click**: "Create Receipt"
7. **Expected Result**: Receipt created successfully, NFT minting process starts

---

### ✅ Phase 4: Real-Time Notifications

#### Test 4.1: WebSocket Connection

1. **Check**: Notification bell (🔔) in header
2. **Verify**: Green dot next to bell (connected status)
3. **Open browser console** and look for WebSocket connection logs
4. **Expected Result**: WebSocket connected, user authenticated

#### Test 4.2: Real-Time Receipt Notification

1. **Open two browser windows**:
   - Window 1: Customer view (logged in as test user)
   - Window 2: Merchant POS system
2. **In Window 2**: Create a receipt (repeat Test 3.2)
3. **In Window 1**: Watch for instant notification
4. **Check**: Bell icon shows unread count
5. **Click**: Bell icon to open notifications panel
6. **Expected Result**: Instant notification received, receipt details shown

#### Test 4.3: Notification Center

1. **Click**: 🔔 bell icon in header
2. **Verify**: Notification panel opens above all elements
3. **Check**: Receipt notification with merchant name and amount
4. **Click**: "Mark as Read" for a notification
5. **Verify**: Unread count decreases
6. **Expected Result**: Full notification management working

---

### ✅ Phase 5: NFT Integration & Gallery

#### Test 5.1: NFT Minting Process

1. **Create a receipt** following Test 3.2
2. **Watch backend console** for NFT minting logs
3. **Wait 10-15 seconds** for Hedera blockchain processing
4. **Check database** or API for NFT data
5. **Expected Result**: NFT minted on Hedera testnet, metadata stored

#### Test 5.2: NFT Gallery

1. **Navigate**: "🎨 NFT Gallery" tab
2. **Verify**: Gallery loads with statistics
3. **Check**: Receipt NFTs displayed (if any minted)
4. **Test filters**: All, Recent, High-value
5. **Expected Result**: NFT gallery showing minted receipt NFTs

#### Test 5.3: NFT Details & HashScan

1. **Click**: Any NFT card in gallery
2. **Verify**: NFT details modal opens
3. **Check**: Complete receipt and NFT information
4. **Click**: "View on HashScan" button
5. **Verify**: HashScan opens in new tab showing NFT on blockchain
6. **Expected Result**: Full NFT details with blockchain verification

---

### ✅ Phase 6: My Receipts Dashboard

#### Test 6.1: Receipt History

1. **Navigate**: "📄 My Receipts" tab
2. **Verify**: All created receipts display
3. **Check**: Receipt details, amounts, dates
4. **Test**: Sorting and filtering options
5. **Expected Result**: Complete receipt history

#### Test 6.2: Receipt Analytics

1. **Check**: Total receipts count
2. **Verify**: Total amount spent
3. **Check**: Monthly/weekly statistics
4. **Expected Result**: Accurate analytics and statistics

---

## 🎯 Expected Performance Benchmarks

### Timing Expectations:

- **User Registration**: < 2 seconds
- **Merchant Registration**: < 3 seconds
- **Receipt Creation**: < 2 seconds
- **Real-time Notification**: < 1 second
- **NFT Minting**: 10-15 seconds
- **Gallery Loading**: < 1 second
- **QR Code Generation**: Instant

### Error Handling:

- **Invalid login**: Proper error messages
- **Network issues**: Graceful degradation
- **NFT minting fails**: Retry mechanism
- **WebSocket disconnection**: Auto-reconnect

---

## 🐛 Troubleshooting

### Common Issues:

#### "Cannot access POS system"

- **Solution**: Ensure merchant is approved via dev endpoint

#### "Notifications not working"

- **Check**: WebSocket connection status (green dot)
- **Check**: Browser console for WebSocket errors

#### "NFT not minting"

- **Check**: Hedera credentials in backend .env
- **Check**: Backend console for error logs
- **Verify**: RECV and RNFT token IDs are correct

#### "Gallery not loading"

- **Check**: API endpoint `/api/receipts/nft-gallery`
- **Verify**: User authentication token valid

---

## ✅ Success Criteria

### All tests pass when:

1. **Users can register and login** ✅
2. **QR codes generate properly** ✅
3. **Merchants can register and get approved** ✅
4. **POS system creates receipts** ✅
5. **Real-time notifications work instantly** ✅
6. **NFTs mint on Hedera blockchain** ✅
7. **Gallery displays NFT collections** ✅
8. **HashScan integration works** ✅

---

## 🎉 Completion

When all tests pass, you have successfully verified:

- ✅ Complete user authentication system
- ✅ Merchant registration and approval workflow
- ✅ POS system with receipt creation
- ✅ Real-time WebSocket notifications
- ✅ Hedera blockchain NFT integration
- ✅ NFT gallery with HashScan links
- ✅ Complete receipt management system

**🚀 ReceiptoVerse is fully functional and ready for production!**
