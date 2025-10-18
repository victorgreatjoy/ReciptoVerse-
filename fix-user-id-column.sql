-- Manual fix for user_id column in merchants table
-- Run this directly on your Railway PostgreSQL database

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'merchants' 
AND column_name = 'user_id';

-- If it doesn't exist (no rows returned above), run this:
ALTER TABLE merchants ADD COLUMN user_id UUID REFERENCES users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);

-- Verify the column was added
\d merchants

-- Optional: Link existing merchants to users by email
-- UPDATE merchants m
-- SET user_id = u.id
-- FROM users u
-- WHERE m.email = u.email
-- AND m.user_id IS NULL;
