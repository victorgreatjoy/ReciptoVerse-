-- Check if points are being awarded
-- Run this in your SQLite database to verify points system is working

-- 1. Check user_points table (should have records for users who made purchases)
SELECT 
    up.user_id,
    u.handle,
    up.balance as current_points,
    up.total_earned,
    up.tier,
    up.updated_at
FROM user_points up
JOIN users u ON up.user_id = u.id
ORDER BY up.updated_at DESC;

-- 2. Check points_transactions table (should show all point awards)
SELECT 
    pt.id,
    u.handle as customer,
    m.business_name as merchant,
    pt.amount as points,
    pt.type,
    pt.description,
    pt.created_at
FROM points_transactions pt
JOIN users u ON pt.user_id = u.id
LEFT JOIN merchants m ON pt.merchant_id = m.id
ORDER BY pt.created_at DESC
LIMIT 10;

-- 3. Check receipts created via POS
SELECT 
    r.id,
    r.user_id,
    u.handle as customer,
    r.store_name as merchant,
    r.amount,
    r.created_at,
    r.is_verified
FROM receipts r
JOIN users u ON r.user_id = u.id
WHERE r.is_verified = 1  -- POS receipts are auto-verified
ORDER BY r.created_at DESC
LIMIT 10;

-- 4. Check if points_transactions are linked to receipts
SELECT 
    r.id as receipt_id,
    r.amount as purchase_amount,
    r.store_name,
    pt.id as transaction_id,
    pt.amount as points_awarded,
    u.handle as customer
FROM receipts r
JOIN users u ON r.user_id = u.id
LEFT JOIN points_transactions pt ON pt.receipt_id = r.id
WHERE r.is_verified = 1
ORDER BY r.created_at DESC
LIMIT 10;

-- 5. Quick summary
SELECT 
    'Total Receipts' as metric,
    COUNT(*) as value
FROM receipts
WHERE is_verified = 1
UNION ALL
SELECT 
    'Total Points Transactions' as metric,
    COUNT(*) as value
FROM points_transactions
UNION ALL
SELECT 
    'Users with Points' as metric,
    COUNT(*) as value
FROM user_points
WHERE balance > 0;
