# ReceiptoVerse Link Verification Script
# Verifies all HashScan links and Hedera service IDs

Write-Host "🔍 ReceiptoVerse Link & Service Verification" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Service IDs from .env
$HCS_TOPIC = "0.0.7153725"
$RVP_TOKEN = "0.0.7154427"
$NFT_COLLECTION = "0.0.6927730"
$TREASURY = "0.0.6913837"

Write-Host "📋 Configured Service IDs:" -ForegroundColor Yellow
Write-Host "  HCS Topic:       $HCS_TOPIC"
Write-Host "  RVP Token:       $RVP_TOKEN"
Write-Host "  NFT Collection:  $NFT_COLLECTION"
Write-Host "  Treasury:        $TREASURY`n"

# HashScan URLs
$urls = @{
    "HCS Topic" = "https://hashscan.io/testnet/topic/$HCS_TOPIC"
    "RVP Token" = "https://hashscan.io/testnet/token/$RVP_TOKEN"
    "NFT Collection" = "https://hashscan.io/testnet/token/$NFT_COLLECTION"
    "Treasury Account" = "https://hashscan.io/testnet/account/$TREASURY"
    "Mirror Node API" = "https://testnet.mirrornode.hedera.com/api/v1/topics/$HCS_TOPIC/messages"
}

Write-Host "🔗 Verifying HashScan Links..." -ForegroundColor Yellow

foreach ($name in $urls.Keys) {
    $url = $urls[$name]
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $name" -ForegroundColor Green
            Write-Host "     $url" -ForegroundColor DarkGray
        } else {
            Write-Host "  ⚠️  $name (Status: $($response.StatusCode))" -ForegroundColor Yellow
            Write-Host "     $url" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  ❌ $name (Error: $($_.Exception.Message))" -ForegroundColor Red
        Write-Host "     $url" -ForegroundColor DarkGray
    }
}

Write-Host "`n🧪 Testing Mirror Node API..." -ForegroundColor Yellow

try {
    $mirrorResponse = Invoke-RestMethod -Uri "https://testnet.mirrornode.hedera.com/api/v1/topics/$HCS_TOPIC/messages?limit=1" -TimeoutSec 10
    if ($mirrorResponse.messages) {
        Write-Host "  ✅ Mirror Node API responding" -ForegroundColor Green
        Write-Host "     Messages found: $($mirrorResponse.messages.Count)" -ForegroundColor DarkGray
        if ($mirrorResponse.messages.Count -gt 0) {
            $latestMsg = $mirrorResponse.messages[0]
            Write-Host "     Latest sequence: $($latestMsg.sequence_number)" -ForegroundColor DarkGray
            Write-Host "     Consensus time: $($latestMsg.consensus_timestamp)" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "  ⚠️  No messages found in topic" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Mirror Node API error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Checking Token Info via Mirror Node..." -ForegroundColor Yellow

try {
    $tokenInfo = Invoke-RestMethod -Uri "https://testnet.mirrornode.hedera.com/api/v1/tokens/$RVP_TOKEN" -TimeoutSec 10
    if ($tokenInfo.token_id) {
        Write-Host "  ✅ RVP Token Found" -ForegroundColor Green
        Write-Host "     Name: $($tokenInfo.name)" -ForegroundColor DarkGray
        Write-Host "     Symbol: $($tokenInfo.symbol)" -ForegroundColor DarkGray
        Write-Host "     Decimals: $($tokenInfo.decimals)" -ForegroundColor DarkGray
        Write-Host "     Max Supply: $($tokenInfo.max_supply)" -ForegroundColor DarkGray
        Write-Host "     Treasury: $($tokenInfo.treasury_account_id)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "  ❌ Token info error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Verification Complete!" -ForegroundColor Cyan
Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Visit HashScan links above to view live data"
Write-Host "  2. Test API endpoints: See docs/TESTING.md"
Write-Host "  3. Deploy to production: See docs/DEPLOYMENT.md"
Write-Host ""
