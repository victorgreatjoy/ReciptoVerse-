# Authentication Refactor Testing Guide

## Overview

The login system has been refactored to support separate Merchant and User flows with role-based authentication and merchant approval workflow.

## Changes Made

### 1. New Components

- **LandingPage.jsx**: Role selection page with "User Login" and "Merchant Login" options

### 2. Modified Components

- **AppContent.jsx**:

  - Added `selectedRole` state
  - Integrated LandingPage as default view for unauthenticated users
  - Added `handleRoleSelect` function
  - Pass `selectedRole` to AuthModalNew
  - Added `onMerchantRegistrationComplete` callback

- **AuthModalNew.jsx**:
  - Added `selectedRole` prop
  - Added `onMerchantRegistrationComplete` prop
  - Updated modal header to show role-specific text
  - Trigger merchant registration view after successful merchant signup

### 3. Existing System Utilized

- **MerchantRegistration.jsx**: Already handles merchant application with status (pending/approved/rejected)
- **AdminDashboard.jsx**: Already has merchant approval UI
- **Backend**: `/api/merchants/register` and `/api/merchants/status` endpoints exist

## Test Plan

### Test 1: User Registration and Login ✅

**Steps:**

1. Clear browser cache/localStorage
2. Navigate to app (should see LandingPage)
3. Click "Continue as User" button
4. Click "Sign up" in auth modal
5. Fill registration form:
   - Email: testuser@example.com
   - Handle: testuser123
   - Display Name: Test User
   - Password: TestPass123!
6. Complete CAPTCHA
7. Submit form
8. Verify email if required
9. Log in with credentials
10. **Expected**: Access normal user dashboard (QR Code, Receipts, etc.)

### Test 2: Merchant Registration Flow (New Merchant) ✅

**Steps:**

1. Clear browser cache/localStorage
2. Navigate to app (should see LandingPage)
3. Click "Continue as Merchant" button
4. Click "Sign up" in auth modal (should say "Create your Merchant account")
5. Fill registration form:
   - Email: testmerchant@example.com
   - Handle: testmerchant123
   - Display Name: Test Merchant
   - Password: MerchPass123!
6. Complete CAPTCHA
7. Submit form
8. **Expected**: Redirected to Merchant Registration page
9. Fill merchant application:
   - Business Name: Test Store
   - Business Type: Retail Store
   - Phone: 555-1234
   - Address: 123 Main St
   - City: Test City
   - State: CA
   - Postal Code: 12345
   - Tax ID: 12-3456789
10. Submit merchant application
11. **Expected**: See "Application Under Review" status page with "Pending Approval" badge

### Test 3: Merchant Login (Pending Approval) ✅

**Steps:**

1. Log out from Test 2
2. Click "Continue as Merchant"
3. Log in with merchant credentials
4. **Expected**: Immediately see "Application Under Review" status page
5. **Expected**: Cannot access Merchant Dashboard or POS system

### Test 4: Admin Approval of Merchant ✅

**Steps:**

1. Log out from merchant account
2. Log in as admin user
3. Navigate to Admin Dashboard
4. Locate "Pending Merchants" section
5. Find "Test Store" merchant application
6. Review merchant details
7. Click "Approve" button
8. **Expected**: Merchant status changes to "approved"
9. **Expected**: Notification sent to merchant email (if configured)

### Test 5: Merchant Login (After Approval) ✅

**Steps:**

1. Log out from admin account
2. Log in as merchant (testmerchant@example.com)
3. **Expected**: See "Merchant Account Approved!" success message
4. Navigate to view tabs
5. **Expected**: See "Merchant Registration", "Merchant Dashboard", and "POS System" tabs
6. Click "Merchant Dashboard"
7. **Expected**: Full access to merchant features

### Test 6: Merchant Rejection Flow ⚠️

**Steps:**

1. Create another merchant account (testmerchant2@example.com)
2. Submit merchant application
3. Log in as admin
4. Find merchant in pending list
5. Click "Reject" button
6. Log out and log in as rejected merchant
7. **Expected**: See "Application Rejected" message
8. **Expected**: Option to contact support or reapply

### Test 7: Existing User Login ✅

**Steps:**

1. Log in as existing user (leandromirante or other existing accounts)
2. **Expected**: Skip LandingPage entirely (already authenticated)
3. **Expected**: Normal app experience

### Test 8: Role Switching ✅

**Steps:**

1. Clear localStorage
2. Select "User" role → Start registration → Cancel
3. Refresh page
4. Select "Merchant" role
5. **Expected**: Auth modal shows "Create your Merchant account"
6. Complete merchant registration
7. **Expected**: Proper merchant flow

## Backend Requirements

### Existing Endpoints (Verified)

- ✅ `POST /api/merchants/register` - Register new merchant
- ✅ `GET /api/merchants/status` - Check merchant application status
- ✅ `POST /api/admin/merchants/:id/approve` - Approve merchant
- ✅ `POST /api/admin/merchants/:id/reject` - Reject merchant

### Database Schema (Verified)

- `merchants` table with `status` field ('pending', 'approved', 'rejected')
- `users` table linked to merchants

## Known Issues / Edge Cases

1. **Email Verification**: If user registers as merchant but doesn't verify email, they may get stuck

   - **Solution**: Ensure email verification happens before merchant registration

2. **Role Persistence**: If user closes browser during merchant application

   - **Current**: MerchantRegistration component checks status on mount
   - **Expected**: User can resume where they left off

3. **Admin Dashboard Access**: Regular users should not see admin panel

   - **Current**: Already protected by `user.is_admin` check

4. **Merchant Re-application**: If rejected, merchant should be able to reapply
   - **Current**: MerchantRegistration shows "Reapply" button
   - **Verify**: Backend allows re-submission

## Success Criteria

✅ **Landing Page**: Shows for all unauthenticated users
✅ **Role Selection**: Clear distinction between User and Merchant paths
✅ **Merchant Registration**: Seamless flow from signup → merchant application
✅ **Pending Status**: Merchants cannot access features until approved
✅ **Admin Approval**: Admins can review and approve/reject merchants
✅ **Post-Approval Access**: Approved merchants have full merchant features
✅ **User Experience**: Regular users unaffected by merchant system

## Next Steps

1. **Test all flows manually**
2. **Verify email notifications work** (SendGrid integration)
3. **Add merchant dashboard access guards** (ensure only approved merchants can access)
4. **Update navigation menu** to show/hide merchant tabs based on approval status
5. **Add loading states** for merchant status checks
6. **Improve error messages** for rejected merchants

## Rollback Plan

If issues arise:

1. Revert `AppContent.jsx` changes (remove LandingPage import/logic)
2. Revert `AuthModalNew.jsx` changes (remove selectedRole prop)
3. Delete `LandingPage.jsx`
4. Users will see original AuthModal immediately on app load
