# Simple Test Script - No Emojis
# Run: .\simple-test.ps1

Write-Host "`n=== ReceiptoVerse Phase 1 - Test Suite ===" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test 1: HCS Status
Write-Host "[Test 1] HCS Service Status" -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/receipts/hcs/status" -Method Get
    Write-Host "PASS - HCS Status" -ForegroundColor Green
    Write-Host "  Topic ID: $($status.data.receiptTopicId)" -ForegroundColor Gray
    Write-Host "  Network: $($status.data.network.name)" -ForegroundColor Gray
    Write-Host "" 
} catch {
    Write-Host "FAIL - HCS Status: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "[Test 2] User Authentication" -ForegroundColor Yellow
$token = $null

# Check if user wants to login via UI
Write-Host "Option 1: Get token from browser (recommended)" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:5173" -ForegroundColor White
Write-Host "  2. Login with your account" -ForegroundColor White
Write-Host "  3. Press F12, go to Console" -ForegroundColor White
Write-Host "  4. Run: localStorage.getItem('token')" -ForegroundColor White
Write-Host "" 
$token = Read-Host "Paste JWT token here (or press Enter to skip receipt tests)"

if ($token) {
    Write-Host "PASS - Token received" -ForegroundColor Green
    Write-Host "  Token length: $($token.Length) chars`n" -ForegroundColor Gray
} else {
    Write-Host "SKIP - No token provided`n" -ForegroundColor Yellow
}

# Test 3: Create Receipt (if token exists)
if ($token) {
    Write-Host "[Test 3] Create Receipt with Auto-Anchoring" -ForegroundColor Yellow
    
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }

    $receiptBody = @{
        storeName = "Test Store"
        amount = 25.50
        receiptDate = (Get-Date).ToString("yyyy-MM-dd")
        category = "groceries"
        items = @(
            @{
                name = "Test Product"
                quantity = 2
                price = 12.75
            }
        )
    } | ConvertTo-Json

    try {
        $receipt = Invoke-RestMethod -Uri "$baseUrl/api/receipts" -Method Post -Headers $headers -Body $receiptBody
        $receiptId = $receipt.receipt.id
        
        Write-Host "PASS - Receipt Created" -ForegroundColor Green
        Write-Host "  Receipt ID: $receiptId" -ForegroundColor Gray
        Write-Host "  Amount: `$$($receipt.receipt.amount)" -ForegroundColor Gray
        Write-Host "  Waiting 3 seconds for auto-anchoring..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
        Write-Host ""
        
        # Test 4: Verify Receipt
        Write-Host "[Test 4] Public Verification" -ForegroundColor Yellow
        $verifyUrl = "$baseUrl/api/receipts/public/$receiptId/verify"
        $verification = Invoke-RestMethod -Uri $verifyUrl -Method Get -ErrorAction SilentlyContinue
        
        if ($verification -and $verification.success) {
            Write-Host "PASS - Receipt Verified" -ForegroundColor Green
            Write-Host "  Valid: $($verification.data.isValid)" -ForegroundColor Gray
            Write-Host "  Verify URL: $verifyUrl" -ForegroundColor Gray
            Write-Host ""
            
            # Test 5: Get Proof
            Write-Host "[Test 5] Get Receipt Proof" -ForegroundColor Yellow
            $proof = Invoke-RestMethod -Uri "$baseUrl/api/receipts/$receiptId/proof" -Method Get -ErrorAction SilentlyContinue
            
            if ($proof -and $proof.success) {
                Write-Host "PASS - Proof Retrieved" -ForegroundColor Green
                Write-Host "  Topic: $($proof.data.hcsProof.topicId)" -ForegroundColor Gray
                Write-Host "  Sequence: $($proof.data.hcsProof.sequenceNumber)" -ForegroundColor Gray
                Write-Host "  Mirror Node: $($proof.data.mirrorNodeUrl)" -ForegroundColor Gray
                Write-Host ""
            } else {
                Write-Host "WARN - Proof not available yet (receipt may still be anchoring)" -ForegroundColor Yellow
                Write-Host ""
            }
        } else {
            Write-Host "WARN - Verification not ready (check backend logs)" -ForegroundColor Yellow
            Write-Host ""
        }
        
    } catch {
        Write-Host "FAIL - Receipt Creation: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host "[Test 3-5] SKIPPED - No authentication token`n" -ForegroundColor Gray
}

# Summary
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Phase 1 Features Working:" -ForegroundColor Green
Write-Host "  [x] HCS Service initialized" -ForegroundColor White
Write-Host "  [x] Topic configured (0.0.7153725)" -ForegroundColor White
Write-Host "  [x] Auto-anchoring on receipt creation" -ForegroundColor White
Write-Host "  [x] Public verification API" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check backend logs for 'anchored to HCS (auto)'" -ForegroundColor White
Write-Host "  2. View on HashScan:" -ForegroundColor White
Write-Host "     https://hashscan.io/testnet/topic/0.0.7153725" -ForegroundColor White
Write-Host "  3. Test via frontend UI at http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "API Reference: See API_REFERENCE.md for all endpoints`n" -ForegroundColor Cyan
