# Verify Receipt Script
# Usage: .\verify-receipt.ps1 <receipt-id>

param(
    [string]$receiptId = "7269a823-7abe-47f5-b3e3-81e49358e6ee"
)

$baseUrl = "http://localhost:3000"

Write-Host "`nVerifying receipt: $receiptId" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Try verification multiple times with backoff
$maxAttempts = 5
$attempt = 1

while ($attempt -le $maxAttempts) {
    Write-Host "Attempt $attempt of $maxAttempts..." -ForegroundColor Yellow
    
    try {
        $verification = Invoke-RestMethod -Uri "$baseUrl/api/receipts/public/$receiptId/verify" -Method Get -ErrorAction Stop
        
        if ($verification.success -and $verification.data.isValid) {
            Write-Host "`nPASS - Receipt Successfully Verified!" -ForegroundColor Green
            Write-Host "=========================================`n" -ForegroundColor Green
            Write-Host "Receipt Details:" -ForegroundColor Cyan
            Write-Host "  Receipt ID: $($verification.data.receipt.id)" -ForegroundColor White
            Write-Host "  Hash: $($verification.data.receipt.hash)" -ForegroundColor White
            Write-Host ""
            Write-Host "HCS Proof:" -ForegroundColor Cyan
            Write-Host "  Topic ID: $($verification.data.receipt.hcsTopicId)" -ForegroundColor White
            Write-Host "  Sequence: $($verification.data.receipt.hcsSequence)" -ForegroundColor White
            Write-Host "  Timestamp: $($verification.data.receipt.hcsTimestamp)" -ForegroundColor White
            Write-Host ""
            Write-Host "Verification:" -ForegroundColor Cyan
            Write-Host "  Hash Match: $($verification.data.match.hashMatch)" -ForegroundColor White
            Write-Host "  Receipt ID Match: $($verification.data.match.receiptIdMatch)" -ForegroundColor White
            Write-Host ""
            Write-Host "View on HashScan:" -ForegroundColor Yellow
            Write-Host "  https://hashscan.io/testnet/topic/$($verification.data.receipt.hcsTopicId)" -ForegroundColor Cyan
            Write-Host ""
            
            # Get proof bundle
            Write-Host "Getting proof bundle..." -ForegroundColor Yellow
            $proof = Invoke-RestMethod -Uri "$baseUrl/api/receipts/$receiptId/proof" -Method Get -ErrorAction SilentlyContinue
            
            if ($proof -and $proof.success) {
                Write-Host "`nProof URLs:" -ForegroundColor Cyan
                Write-Host "  Mirror Node: $($proof.data.mirrorNodeUrl)" -ForegroundColor White
                Write-Host "  Public Verify: $($proof.data.verificationUrl)" -ForegroundColor White
                Write-Host ""
            }
            
            exit 0
        } else {
            Write-Host "  Not anchored yet..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($attempt -lt $maxAttempts) {
        $waitTime = $attempt * 2
        Write-Host "  Waiting $waitTime seconds before retry...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $waitTime
    }
    
    $attempt++
}

Write-Host "`nWARN - Receipt not verified after $maxAttempts attempts" -ForegroundColor Yellow
Write-Host "This could mean:" -ForegroundColor Yellow
Write-Host "  1. Anchoring is still in progress (check backend logs)" -ForegroundColor White
Write-Host "  2. Backend may have errors (check for error messages)" -ForegroundColor White
Write-Host "  3. HCS service may not be running" -ForegroundColor White
Write-Host ""
Write-Host "Check backend logs for:" -ForegroundColor Cyan
Write-Host '  "Anchoring receipt ... to HCS..."' -ForegroundColor White
Write-Host '  "Receipt ... anchored to HCS (auto)"' -ForegroundColor White
Write-Host ""
