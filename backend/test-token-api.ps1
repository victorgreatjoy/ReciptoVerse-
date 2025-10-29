# Test Token (HTS) API Endpoints
# This script tests the RVP token API endpoints

$baseUrl = "http://localhost:3000"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Testing Token API Endpoints" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Test 1: Get Token Info
Write-Host "1. Testing GET /api/token/info" -ForegroundColor Yellow
try {
    $tokenInfo = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/token/info"
    Write-Host "✅ Token Info Retrieved:" -ForegroundColor Green
    Write-Host "   Token ID: $($tokenInfo.tokenId)" -ForegroundColor White
    Write-Host "   Name: $($tokenInfo.name)" -ForegroundColor White
    Write-Host "   Symbol: $($tokenInfo.symbol)" -ForegroundColor White
    Write-Host "   Decimals: $($tokenInfo.decimals)" -ForegroundColor White
    Write-Host "   Total Supply: $($tokenInfo.totalSupply)" -ForegroundColor White
    Write-Host "   Treasury: $($tokenInfo.treasury)" -ForegroundColor White
    Write-Host "   Network: $($tokenInfo.network)" -ForegroundColor White
    Write-Host "   HashScan: $($tokenInfo.hashscanUrl)`n" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get token info" -ForegroundColor Red
    Write-Host "   Error: $_`n" -ForegroundColor Red
}

# Test 2: Get Balance for Treasury Account
Write-Host "2. Testing GET /api/token/balance/:accountId (Treasury)" -ForegroundColor Yellow
try {
    $treasuryId = $env:HEDERA_OPERATOR_ID
    if (-not $treasuryId) {
        $treasuryId = "0.0.6913837"  # Default from your setup
    }
    
    $balance = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/token/balance/$treasuryId"
    Write-Host "✅ Balance Retrieved for $treasuryId" -ForegroundColor Green
    Write-Host "   Balance (raw): $($balance.balance)" -ForegroundColor White
    Write-Host "   Display Balance: $($balance.displayBalance) RVP`n" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get balance" -ForegroundColor Red
    Write-Host "   Error: $_`n" -ForegroundColor Red
}

# Test 3: Check Association Status for Treasury
Write-Host "3. Testing GET /api/token/association-status/:accountId (Treasury)" -ForegroundColor Yellow
try {
    $treasuryId = $env:HEDERA_OPERATOR_ID
    if (-not $treasuryId) {
        $treasuryId = "0.0.6913837"
    }
    
    $status = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/token/association-status/$treasuryId"
    Write-Host "✅ Association Status Retrieved:" -ForegroundColor Green
    Write-Host "   Account: $($status.accountId)" -ForegroundColor White
    Write-Host "   Is Associated: $($status.isAssociated)" -ForegroundColor White
    Write-Host "   Message: $($status.message)" -ForegroundColor White
    Write-Host "   HashScan: $($status.hashscanUrl)`n" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to check association status" -ForegroundColor Red
    Write-Host "   Error: $_`n" -ForegroundColor Red
}

# Test 4: Check Association for Random Account (should not be associated)
Write-Host "4. Testing GET /api/token/association-status/:accountId (Random Account)" -ForegroundColor Yellow
try {
    $randomAccount = "0.0.1234567"  # Random account (likely not associated)
    
    $status = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/token/association-status/$randomAccount"
    Write-Host "✅ Association Status Retrieved:" -ForegroundColor Green
    Write-Host "   Account: $($status.accountId)" -ForegroundColor White
    Write-Host "   Is Associated: $($status.isAssociated)" -ForegroundColor White
    Write-Host "   Message: $($status.message)`n" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to check association status" -ForegroundColor Red
    Write-Host "   Error: $_`n" -ForegroundColor Red
}

# Test 5: Invalid Account ID Format
Write-Host "5. Testing GET /api/token/balance/:accountId (Invalid Format)" -ForegroundColor Yellow
try {
    $invalidId = "invalid-account-id"
    
    $response = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/token/balance/$invalidId"
    Write-Host "❌ Should have failed with 400 error" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Correctly rejected invalid account ID format`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $_`n" -ForegroundColor Red
    }
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Token API Tests Complete!" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify token info matches your HTS token (0.0.7154427)" -ForegroundColor White
Write-Host "2. Check that treasury account shows correct balance" -ForegroundColor White
Write-Host "3. Test with a real user account that has associated RVP" -ForegroundColor White
Write-Host "4. Integrate frontend to display token balance and association status`n" -ForegroundColor White
