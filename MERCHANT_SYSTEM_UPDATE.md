# Merchant System Update - User-Linked Merchant Accounts

## Overview

Updated the merchant registration system to link merchant accounts directly to user accounts, providing a seamless application and approval workflow.

## Changes Made

### 1. Frontend Updates

#### MerchantRegistration.jsx

- **Removed email field** - Now automatically uses logged-in user's email
- **Added merchant status tracking** - Shows application progress (pending/approved/rejected)
- **Removed API key display** - Simplified success screen to show only status
- **Added login requirement** - Users must be logged in to apply
- **Added status checking** - Automatically checks merchant application status on load

Status UI:

- **Pending**: ⏳ Shows "Application Under Review" message
- **Approved**: ✅ Shows "Merchant Account Approved!" with access to POS
- **Rejected**: ❌ Shows rejection message with option to reapply

#### MerchantRegistration.css

- Added `.status-box` styles for pending/approved/rejected states
- Color-coded status badges (yellow/green/red)
- Responsive design for mobile

#### AppContent.jsx

- **Conditional POS tab** - Only shows "💳 POS System" tab if `user.isMerchant === true`
- Hides merchant features until admin approval

#### Environment (.env.development)

- Added `VITE_RECAPTCHA_SITE_KEY` to enable reCAPTCHA in local development

### 2. Backend Updates

#### database.js

- **Added `user_id` column** to merchants table
- Links merchants to users table via foreign key
- Migration runs automatically on server start

#### merchantRoutes.js

- **Updated `/register` endpoint**:

  - Accepts optional authentication token
  - Extracts `user_id` from JWT if authenticated
  - Prevents duplicate applications per user
  - Stores `user_id` when creating merchant record

- **Added `/status` endpoint**:
  - `GET /api/merchants/status` (requires authentication)
  - Returns merchant application status for logged-in user
  - Used by frontend to show application progress

#### userRoutes.js

- **Updated `/profile` endpoint**:
  - Queries merchants table for user's merchant account
  - Returns `isMerchant: true` if status is 'approved'
  - Returns `merchantStatus`, `merchantId`, `merchantApiKey`
  - Frontend uses `isMerchant` to show/hide POS tab

### 3. Admin Approval Flow

1. User fills out merchant registration form
2. Application submitted with status='pending'
3. Admin sees application in Admin Dashboard
4. Admin clicks "Approve" button
5. Backend updates merchant status to 'approved'
6. User's profile automatically includes `isMerchant: true`
7. POS System tab appears in user's dashboard
8. User can now issue receipts as merchant

## API Endpoints

### `/api/merchants/register` (POST)

```json
{
  "businessName": "Coffee Shop",
  "businessType": "Restaurant & Food Service",
  "phone": "+1-555-1234",
  "address": "123 Main St",
  "contactPerson": "John Doe",
  "subscriptionPlan": "basic"
}
```

**Headers**: `Authorization: Bearer <token>` (optional)
**Response**: `{ status: "pending", message: "Application submitted" }`

### `/api/merchants/status` (GET)

**Headers**: `Authorization: Bearer <token>` (required)
**Response**:

```json
{
  "status": "pending|approved|rejected",
  "businessName": "Coffee Shop",
  "appliedAt": "2025-01-15T10:30:00Z"
}
```

### `/api/users/profile` (GET)

**Headers**: `Authorization: Bearer <token>` (required)
**Response includes**:

```json
{
  "user": {
    ...
    "isMerchant": true,
    "merchantStatus": "approved",
    "merchantId": "uuid",
    "merchantApiKey": "key"
  }
}
```

## Database Schema Update

### merchants table

```sql
ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id);
```

Links merchants to user accounts, enabling:

- One merchant account per user
- Automatic permission management
- Simplified status checking

## User Flow

### Before (Old Flow)

1. Fill form with email
2. Get API key immediately
3. No approval workflow
4. Manually enter API key to access features

### After (New Flow)

1. Login required
2. Fill form (email auto-filled)
3. See "Application Under Review" status
4. Wait for admin approval
5. Once approved, POS tab automatically appears
6. Start using merchant features

## Benefits

- ✅ Seamless user experience
- ✅ Automatic permission management
- ✅ No manual API key entry
- ✅ Clear application status tracking
- ✅ Admin can control merchant access
- ✅ One merchant account per user (no duplicates)
- ✅ Simplified onboarding

## Testing Checklist

- [ ] User can register as merchant while logged in
- [ ] Email field is removed (uses logged-in email)
- [ ] Application shows "pending" status after submission
- [ ] POS tab is hidden until approval
- [ ] Admin can see merchant application
- [ ] Admin can approve merchant
- [ ] After approval, POS tab appears for user
- [ ] User cannot submit multiple applications
- [ ] reCAPTCHA works in development environment

## Next Steps

1. Test merchant registration flow end-to-end
2. Test admin approval workflow
3. Verify POS tab appears after approval
4. Test merchant features with approved account
