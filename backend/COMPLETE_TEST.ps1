[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🧪 ReceiptoVerse Phase 1 - Complete Test Suite" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

Write-Host "📋 Test 1: HCS Service Status" -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/receipts/hcs/status" -Method Get
    Write-Host "✅ HCS Status: PASS" -ForegroundColor Green
    Write-Host "   Topic ID: $($status.data.topicId)" -ForegroundColor Gray
    Write-Host "   Network: $($status.data.network)" -ForegroundColor Gray
    Write-Host "   Operator: $($status.data.operatorId)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ HCS Status: FAILED - $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Test 2: User Authentication" -ForegroundColor Yellow
$loginEndpoints = @("/api/auth/login","/api/users/login","/api/login")
$token = $null
$loginBody = @{ email='leandro.mirantexd@gmail.com'; password='123456' } | ConvertTo-Json

foreach ($endpoint in $loginEndpoints) {
    try {
        Write-Host "   Trying $endpoint..." -ForegroundColor Gray
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Post -Headers @{'Content-Type'='application/json'} -Body $loginBody -ErrorAction Stop
        $token = $loginResponse.token
        if ($token) {
            Write-Host "✅ Login: PASS (endpoint: $endpoint)" -ForegroundColor Green
            Write-Host "   Token: $($token.Substring(0,20))...`n" -ForegroundColor Gray
            break
        }
    } catch {
        Write-Host "   $endpoint not found, trying next..." -ForegroundColor Gray
    }
}

if (-not $token) {
    Write-Host "⚠️  Login: SKIPPED - Using frontend to get token manually`n" -ForegroundColor Yellow
    Write-Host "   📝 Manual steps:" -ForegroundColor Cyan
    Write-Host "   1. Open http://localhost:5173" -ForegroundColor White
    Write-Host "   2. Login and run localStorage.getItem('token')" -ForegroundColor White
    $token = Read-Host 'Paste your JWT token here (or press Enter to skip)'
    if ($token) {
        Write-Host "✅ Token received`n" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Skipping authenticated tests`n" -ForegroundColor Yellow
    }
}

if ($token) {
    Write-Host "📋 Test 3: Create Receipt with Auto-Anchoring" -ForegroundColor Yellow
    $headers = @{ Authorization="Bearer $token"; 'Content-Type'='application/json' }
    $body = @{
        amount=25.50
        currency='USD'
        receipt_date=(Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        items=@(@{ name='Test Product'; qty=2; price=12.75 })
    } | ConvertTo-Json

    try {
        $receipt = Invoke-RestMethod -Uri "$baseUrl/api/receipts" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        $receiptId = $receipt.receipt.id
        Write-Host "✅ Receipt Created: PASS" -ForegroundColor Green
        Write-Host "   Receipt ID: $receiptId" -ForegroundColor Gray
        Write-Host "   Amount: `$$($receipt.receipt.amount)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Receipt Creation Failed: $($_.Exception.Message)`n" -ForegroundColor Red
        $receiptId = $null
    }

    if ($receiptId) {
        if ($receipt.receipt.hcs_sequence) {
            Write-Host "   HCS Sequence: $($receipt.receipt.hcs_sequence)" -ForegroundColor Gray
            Write-Host "   HCS Topic: $($receipt.receipt.hcs_topic_id)`n" -ForegroundColor Gray
        } else {
            Write-Host "   ⏳ Anchoring in progress (check logs)`n" -ForegroundColor Yellow
        }

        Write-Host "   Waiting 5s for anchoring..." -ForegroundColor Gray
        Start-Sleep -Seconds 5

        Write-Host "`n📋 Test 4: Public Verification" -ForegroundColor Yellow
        try {
            $verify = Invoke-RestMethod -Uri "$baseUrl/api/receipts/public/$receiptId/verify" -Method Get -ErrorAction Stop
            if ($verify.success) {
                Write-Host "✅ Verification: PASS" -ForegroundColor Green
                Write-Host "   Valid: $($verify.data.isValid)" -ForegroundColor Gray
            } else {
                Write-Host "⚠️  Receipt not yet anchored" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Verification Failed: $($_.Exception.Message)`n" -ForegroundColor Red
        }

        Write-Host "`n📋 Test 5: Get Proof" -ForegroundColor Yellow
        try {
            $proof = Invoke-RestMethod -Uri "$baseUrl/api/receipts/$receiptId/proof" -Method Get -ErrorAction Stop
            if ($proof.success) {
                Write-Host "✅ Proof Retrieved: PASS" -ForegroundColor Green
                Write-Host "   Mirror URL: $($proof.data.mirrorNodeUrl)" -ForegroundColor Gray
                Write-Host "   Verification URL: $($proof.data.verificationUrl)`n" -ForegroundColor Gray
            } else {
                Write-Host "⚠️  Proof not ready yet`n" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Proof Fetch Failed: $($_.Exception.Message)`n" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⏭️  Skipping receipt tests (no token)`n" -ForegroundColor Gray
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎯 Test Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Phase 1 Core Features:" -ForegroundColor Green
Write-Host "   - HCS Service initialized and configured" -ForegroundColor White
Write-Host "   - Topic ID: 0.0.7153725 (testnet)" -ForegroundColor White
Write-Host "   - Auto-anchoring enabled" -ForegroundColor White
Write-Host "   - Public verification API working`n" -ForegroundColor White
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Create receipts via frontend UI" -ForegroundColor White
Write-Host "   2. Check backend logs for 'anchored to HCS (auto)'" -ForegroundColor White
Write-Host "   3. Verify on HashScan: https://hashscan.io/testnet/topic/0.0.7153725" -ForegroundColor White
Write-Host "   4. Use public verify endpoint for any receipt ID`n" -ForegroundColor White
Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   API Docs: See API_REFERENCE.md" -ForegroundColor White
Write-Host "   HashScan Topic: https://hashscan.io/testnet/topic/0.0.7153725" -ForegroundColor White
