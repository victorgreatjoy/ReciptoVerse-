# Database Migration Guide - Add user_id Column

## Problem

The production database is missing the `user_id` column in the `merchants` table, causing login to fail with:

```
Profile fetch error: error: column "user_id" does not exist
```

## Solution

We need to manually run a database migration to add the missing column.

## Steps to Fix on Railway

### Option 1: Using Railway CLI (Recommended)

1. **Install Railway CLI** (if not already installed):

   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:

   ```bash
   railway login
   ```

3. **Link to your project**:

   ```bash
   railway link
   ```

4. **Run the migration script**:
   ```bash
   railway run node backend/src/migrate-user-id.js
   ```

### Option 2: Using Railway Dashboard

1. **Go to your Railway project dashboard**
2. **Open the backend service**
3. **Go to the "Settings" tab**
4. **Scroll to "Deploy Triggers"**
5. **Click "New Deployment"** to trigger a redeploy
6. The fixed code will automatically run the migration on startup

### Option 3: Direct Database Access

1. **Go to your Railway project dashboard**
2. **Click on your PostgreSQL database**
3. **Click "Connect" tab**
4. **Copy the connection string**
5. **Run psql or use a database client**:

   ```bash
   psql "your-connection-string"
   ```

6. **Run the migration SQL directly**:

   ```sql
   -- Check if column exists
   SELECT column_name
   FROM information_schema.columns
   WHERE table_name = 'merchants'
   AND column_name = 'user_id';

   -- Add column if it doesn't exist
   ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id);

   -- Create index
   CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);

   -- Verify
   \d merchants
   ```

## What Was Fixed

### 1. Fixed `database.js` (Line 391)

**Before:**

```javascript
await query(
  isPostgreSQL // ❌ This variable doesn't exist
    ? "ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id)"
    : "ALTER TABLE merchants ADD COLUMN user_id TEXT REFERENCES users(id)"
);
```

**After:**

```javascript
await query(
  pool // ✅ Use 'pool' to check if PostgreSQL
    ? "ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id)"
    : "ALTER TABLE merchants ADD COLUMN user_id TEXT REFERENCES users(id)"
);
```

### 2. Added Safety Check in `userRoutes.js`

Added a try-catch block around the merchant query with email fallback:

- If `user_id` column doesn't exist, it falls back to querying by email
- This allows the app to continue working even if migration hasn't run yet
- Users can still log in and use basic features

### 3. Created Migration Script

- `backend/src/migrate-user-id.js` - Standalone migration script
- Can be run manually on production
- Checks if column exists before adding it
- Creates index for performance

## After Migration

Once the migration is complete:

1. ✅ Users will be able to log in successfully
2. ✅ Profile data will load correctly
3. ✅ Merchant accounts will be properly linked to users
4. ✅ The app will query merchants by `user_id` instead of email

## Verify Migration Success

After running the migration, check the logs for:

```
✅ Successfully added user_id column to merchants table
✅ Successfully created index on user_id column
🎉 Migration completed successfully!
```

Then try logging in - you should see:

```
✅ User logged in: [username]
✅ Connected to PostgreSQL database
```

Without the profile fetch error!

## Rollback (If Needed)

If something goes wrong, you can remove the column:

```sql
ALTER TABLE merchants DROP COLUMN user_id;
DROP INDEX IF EXISTS idx_merchants_user_id;
```

## Next Steps

After successful migration:

1. Test user login on production
2. Test merchant registration flow
3. Verify merchant profile loads correctly
4. Check that merchant API keys work
