# ReceiptoVerse API Testing Commands

# Make sure your server is running on http://localhost:3000

## Test 1: Associate Tokens (PowerShell)

Invoke-RestMethod -Uri "http://localhost:3000/associate-tokens" -Method POST -ContentType "application/json" -Body '{"accountId": "0.0.6913837"}'

## Test 2: Mint Receipt NFT (PowerShell)

$receiptData = @{
merchant = "Test Coffee Shop"
items = @(
@{ name = "Coffee"; price = 3.50; quantity = 2 },
@{ name = "Sandwich"; price = 8.99; quantity = 1 }
)
total = 15.99
customerWallet = "0.0.6913837"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/mint-receipt" -Method POST -ContentType "application/json" -Body $receiptData

## Alternative: Using curl (if you have it installed)

# Test 1: Associate Tokens

curl -X POST http://localhost:3000/associate-tokens ^
-H "Content-Type: application/json" ^
-d "{\"accountId\": \"0.0.6913837\"}"

# Test 2: Mint Receipt NFT

curl -X POST http://localhost:3000/mint-receipt ^
-H "Content-Type: application/json" ^
-d "{\"merchant\": \"Test Restaurant\", \"items\": [{\"name\": \"Pizza\", \"price\": 12.99, \"quantity\": 1}], \"total\": 12.99, \"customerWallet\": \"0.0.6913837\"}"
