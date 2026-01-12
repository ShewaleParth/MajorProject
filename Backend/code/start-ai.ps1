# Simple AI Server Startup - Auto-cleanup version
Write-Host "🔄 Stopping any existing Python processes..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2>$null | Out-Null
Start-Sleep -Milliseconds 500

Write-Host "🤖 Starting Python AI server on port 5001..." -ForegroundColor Green
python app.py
