# Simple Server Startup - Auto-cleanup version
Write-Host "🔄 Stopping any existing Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Milliseconds 500

Write-Host "🚀 Starting Node.js server on port 5000..." -ForegroundColor Green
node server.js
