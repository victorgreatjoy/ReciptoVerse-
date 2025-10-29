# Frontend Points System Components - Integration Guide

## 🎉 Components Created

### 1. **PointsDashboard.jsx**

User-facing points dashboard with:

- Points balance card
- Loyalty tier display with gradient styling
- Total lifetime points earned
- Progress bar to next tier
- Transaction history table with pagination
- "Mint Tokens" button
- Detailed statistics view

### 2. **EnhancedUserQRCode.jsx**

Enhanced QR code component with:

- Current points balance display
- Loyalty tier badge with icon (🥉🥈🥇💎)
- Time-based QR expiration (2 minutes)
- Security features (signature, timestamp)
- Download QR code functionality
- Auto-refresh capability
- Tier multiplier information
- Usage instructions

### 3. **MerchantQRScanner.jsx**

Merchant QR scanning interface with:

- Camera-based QR scanning (html5-qrcode)
- Manual entry fallback
- Purchase amount input
- Optional receipt notes
- Points preview calculation
- Success modal with confetti animation
- Customer tier upgrade notifications
- Merchant statistics integration

### 4. **TokenMintModal.jsx**

Token minting modal with:

- Points to tokens conversion calculator
- Slider for amount selection
- Conversion rate display (100 points = 1 $RVT)
- Transaction status tracking (pending/success/error)
- HashConnect wallet integration (placeholder)
- Confetti animation on success
- Hedera transaction ID display

### 5. **services/pointsService.js**

API service with functions:

- `getLoyaltyTiers()` - Get tier configuration
- `getPointsBalance()` - Get user points
- `getPointsHistory(limit, offset)` - Transaction history
- `getPointsStats()` - Detailed statistics
- `awardPoints(userId, amount, description)` - Award points
- `scanQRAndAwardPoints(qrData, amount, receiptData)` - QR scan flow
- `getMerchantRewardsStats()` - Merchant statistics
- `calculateTokenConversion(points, rate)` - Conversion helper
- `calculatePointsToNextTier(currentPoints, tiers)` - Tier progress

---

## 📦 Required Dependencies

Install these packages:

\`\`\`bash
cd frontend
npm install qrcode.react html5-qrcode canvas-confetti sonner
\`\`\`

- **qrcode.react**: QR code generation
- **html5-qrcode**: Camera QR scanning
- **canvas-confetti**: Celebration animations
- **sonner**: Toast notifications

---

## 🔌 Integration Instructions

### Step 1: Update UserDashboard

Add PointsDashboard as a new tab/section:

\`\`\`jsx
// frontend/src/pages/UserDashboard.jsx
import PointsDashboard from '@/components/PointsDashboard';

// Add to your tab/navigation structure
const tabs = [
{ id: 'overview', label: 'Overview', component: <Overview /> },
{ id: 'receipts', label: 'Receipts', component: <Receipts /> },
{ id: 'rewards', label: 'Rewards', component: <PointsDashboard /> }, // NEW
{ id: 'qr-code', label: 'QR Code', component: <EnhancedUserQRCode /> }, // UPDATED
// ... other tabs
];
\`\`\`

### Step 2: Update MerchantDashboard

Add MerchantQRScanner section:

\`\`\`jsx
// frontend/src/pages/MerchantDashboard.jsx
import MerchantQRScanner from '@/components/MerchantQRScanner';
import { getMerchantRewardsStats } from '@/services/pointsService';

// Add as a new section or tab

<div className="scanner-section">
  <MerchantQRScanner />
</div>

// Add merchant stats display
const [rewardsStats, setRewardsStats] = useState(null);

useEffect(() => {
loadRewardsStats();
}, []);

const loadRewardsStats = async () => {
const stats = await getMerchantRewardsStats();
setRewardsStats(stats);
};

// Display stats cards

<div className="stats-grid">
  <StatCard 
    title="Points Distributed" 
    value={rewardsStats?.totalPointsDistributed || 0} 
  />
  <StatCard 
    title="Total Transactions" 
    value={rewardsStats?.totalTransactions || 0} 
  />
  <StatCard 
    title="Reward Rate" 
    value={`${rewardsStats?.rewardRate || 1}x`} 
  />
</div>
\`\`\`

### Step 3: Add Toaster Provider

Wrap your app with Sonner's Toaster:

\`\`\`jsx
// frontend/src/main.jsx or App.jsx
import { Toaster } from 'sonner';

function App() {
return (
<>
<Toaster position="top-right" richColors />
{/_ Your app components _/}
</>
);
}
\`\`\`

### Step 4: Environment Variables

Ensure you have the API URL configured:

\`\`\`env

# frontend/.env

VITE_API_URL=http://localhost:3001
\`\`\`

---

## 🎨 UI Components Dependencies

These components use shadcn/ui components. Ensure you have:

- Card, CardContent, CardHeader, CardTitle
- Button
- Badge
- Input
- Label
- Textarea
- Progress
- Slider
- Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription

If missing, install them:

\`\`\`bash
npx shadcn-ui@latest add card button badge input label textarea progress slider table dialog
\`\`\`

---

## 🔐 Authentication Setup

The pointsService uses JWT tokens from localStorage. Ensure your auth flow stores the token:

\`\`\`javascript
// After successful login
localStorage.setItem('token', jwtToken);

// For merchants
localStorage.setItem('merchantApiKey', apiKey);
\`\`\`

---

## 🎯 Usage Examples

### User Flow - View Points

\`\`\`jsx
import PointsDashboard from '@/components/PointsDashboard';

// Simply render the component
<PointsDashboard />

// It will automatically:
// - Load user's points balance
// - Display loyalty tier
// - Show transaction history
// - Calculate progress to next tier
\`\`\`

### User Flow - Show QR Code

\`\`\`jsx
import EnhancedUserQRCode from '@/components/EnhancedUserQRCode';
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
const { user } = useUser();

return <EnhancedUserQRCode />;
}
\`\`\`

### Merchant Flow - Scan QR

\`\`\`jsx
import MerchantQRScanner from '@/components/MerchantQRScanner';

// Simply render the component
<MerchantQRScanner />

// Merchant workflow:
// 1. Customer shows QR code
// 2. Merchant scans with camera or enters manually
// 3. Merchant enters purchase amount
// 4. System validates and awards points
// 5. Success modal shows with confetti
\`\`\`

### Programmatic Points Award

\`\`\`javascript
import { awardPoints } from '@/services/pointsService';

// Award points to a user
const result = await awardPoints(
userId,
50.00, // Purchase amount
'Spring sale purchase'
);

console.log('Points awarded:', result.pointsAwarded);
console.log('New balance:', result.newBalance);
\`\`\`

---

## 🚀 Testing the Components

### Test User Dashboard

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login as a user
4. Navigate to Rewards tab
5. Should see: Points balance (0), Bronze tier, empty transaction history

### Test QR Code

1. Navigate to QR Code section
2. Should see: QR code, points balance, tier badge, 2-minute timer
3. Test refresh button
4. Test download button

### Test Merchant Scanner

1. Login as a merchant
2. Navigate to Scanner section
3. Allow camera access (or use manual entry)
4. Scan a user's QR code (or enter test user ID)
5. Enter purchase amount (e.g., $25.00)
6. Click "Award Points"
7. Should see success modal with confetti

### Test Token Minting

1. Award yourself some points (need at least 100)
2. Click "Mint Tokens" button
3. Adjust slider to select points to convert
4. Click "Mint Tokens"
5. See transaction processing (currently simulated)

---

## 🎨 Customization

### Tier Colors

Edit tierStyles in each component:

\`\`\`javascript
const tierStyles = {
bronze: {
color: 'bg-amber-700',
icon: '🥉',
gradient: 'from-amber-700 to-amber-900'
},
// ... customize other tiers
};
\`\`\`

### Conversion Rate

Edit TokenMintModal.jsx:

\`\`\`javascript
const CONVERSION_RATE = 100; // 100 points = 1 token
\`\`\`

### QR Expiration Time

Edit EnhancedUserQRCode.jsx:

\`\`\`javascript
const [timeLeft, setTimeLeft] = useState(120); // Seconds (default: 2 minutes)
\`\`\`

---

## 🐛 Troubleshooting

### QR Scanner Not Working

- **Issue**: Camera access denied
- **Solution**: Check browser permissions, use HTTPS in production

### Points Not Loading

- **Issue**: API errors
- **Solution**: Check backend is running, verify JWT token in localStorage

### Styles Not Applying

- **Issue**: Tailwind classes not working
- **Solution**: Ensure Tailwind is configured, check @/ path alias

### Camera Feed Black

- **Issue**: html5-qrcode initialization
- **Solution**: Ensure proper cleanup in useEffect, check browser compatibility

---

## 📱 Mobile Responsiveness

All components are responsive and work on mobile devices:

- PointsDashboard: Stacks cards vertically on small screens
- EnhancedUserQRCode: Full-width on mobile
- MerchantQRScanner: Touch-optimized inputs
- TokenMintModal: Mobile-friendly slider and buttons

---

## 🔮 Next Steps

### Backend Integration (TODO)

1. **Create $RVT Token via Hedera Token Service**

   - Token ID creation
   - Treasury account setup
   - Supply management

2. **Implement Token Minting Endpoint**
   \`\`\`javascript
   // backend/src/tokenRoutes.js
   POST /api/tokens/mint

   - Deduct points via pointsService.deductPoints()
   - Create HTS transaction
   - Return transaction ID
     \`\`\`

3. **HashConnect Integration**

   - Connect wallet to Redux store
   - Sign minting transactions
   - Query token balances

4. **Real-time Notifications**
   - WebSocket connection for instant updates
   - Push notifications for points earned
   - Email notifications (optional)

### Frontend Enhancements (Optional)

1. **Animation Polish**

   - Smooth transitions between tier upgrades
   - Loading skeletons
   - Micro-interactions

2. **Analytics Dashboard**

   - Charts for points over time
   - Spending patterns
   - Merchant comparisons

3. **Gamification**
   - Achievement badges
   - Streak bonuses
   - Leaderboards

---

## 📄 File Structure

\`\`\`
frontend/
├── src/
│ ├── components/
│ │ ├── PointsDashboard.jsx ✅ Created
│ │ ├── TokenMintModal.jsx ✅ Created
│ │ ├── EnhancedUserQRCode.jsx ✅ Created
│ │ ├── MerchantQRScanner.jsx ✅ Created
│ │ └── UserQRCode.jsx 📝 Existing (keep for backward compatibility)
│ ├── services/
│ │ └── pointsService.js ✅ Created
│ ├── pages/
│ │ ├── UserDashboard.jsx ⏳ TODO: Add PointsDashboard
│ │ └── MerchantDashboard.jsx ⏳ TODO: Add MerchantQRScanner
│ └── main.jsx ⏳ TODO: Add Toaster
\`\`\`

---

## ✅ Success Metrics

After integration, you should be able to:

- [x] View points balance and tier on user dashboard
- [x] See transaction history with merchant names
- [x] Display QR code with points/tier info
- [x] Scan QR codes with merchant account
- [x] Award points based on purchase amount and tier
- [x] See tier progression percentage
- [x] Open token mint modal
- [x] Calculate token conversion preview
- [ ] Actually mint tokens (requires backend integration)
- [ ] See real-time balance updates via WebSocket

---

## 🎓 Developer Notes

### Component Architecture

- **Presentational Components**: UI rendering only
- **Container Logic**: Data fetching and state management
- **Service Layer**: API calls abstraction
- **Shared Utilities**: Conversion calculations, formatters

### State Management

- Local component state via useState
- UserContext for user data
- Future: Consider Redux for global points state

### Error Handling

- Try-catch blocks on all API calls
- Toast notifications for errors
- Graceful degradation (show placeholders on error)

### Performance

- Pagination for transaction history
- Debounced search/filter (future)
- Lazy loading for images
- Memoization for expensive calculations

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify backend is running (`npm start` in backend folder)
3. Check network tab for API call failures
4. Verify JWT token exists in localStorage
5. Review backend logs for error messages

---

**Status**: ✅ Frontend components complete and ready for integration
**Next Phase**: Backend token minting + HashConnect wallet integration
