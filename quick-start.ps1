# PRISM ML Extension - Quick Start Script
# Run this to start the ML API server and build the extension

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 PRISM ML Extension - Quick Start" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if ML API is already running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction Stop
    Write-Host "✅ ML API Server is already running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Model: $($health.model_loaded)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  ML API Server not running. Starting now..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start ML API server in new window
    Write-Host "📡 Starting ML API Server..." -ForegroundColor Cyan
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ml'; .\venv\Scripts\python.exe .\api_server.py"
    
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    # Verify server started
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction Stop
        Write-Host "✅ ML API Server started successfully!" -ForegroundColor Green
        Write-Host "   Running on: http://localhost:5000" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to start ML API Server" -ForegroundColor Red
        Write-Host "   Please start manually:" -ForegroundColor Yellow
        Write-Host "   cd ml" -ForegroundColor Gray
        Write-Host "   .\venv\Scripts\python.exe .\api_server.py" -ForegroundColor Gray
        exit 1
    }
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

# Build extension
Write-Host ""
Write-Host "🔨 Building extension..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Extension built successfully!" -ForegroundColor Green
    Write-Host "   Location: $PSScriptRoot\dist" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✨ Setup Complete!" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open Chrome/Edge" -ForegroundColor White
Write-Host "   2. Go to chrome://extensions/ or edge://extensions/" -ForegroundColor White
Write-Host "   3. Enable 'Developer mode'" -ForegroundColor White
Write-Host "   4. Click 'Load unpacked'" -ForegroundColor White
Write-Host "   5. Select: $PSScriptRoot\dist" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Test URLs:" -ForegroundColor Yellow
Write-Host "   Safe:     https://google.com" -ForegroundColor Green
Write-Host "   Phishing: https://paypa1.com" -ForegroundColor Red
Write-Host "   SSL Test: https://expired.badssl.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation: ML_INTEGRATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
