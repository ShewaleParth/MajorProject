# Quick Start - All Servers
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  AI Revenue Protection - Quick Start  " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
taskkill /F /IM python.exe 2>$null | Out-Null
Start-Sleep -Seconds 1

Write-Host "Starting AI Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Major\Backend\code'; python app.py"

Start-Sleep -Seconds 2

Write-Host "Starting Node.js Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Major\Backend\server'; node server.js"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Major\Frontend'; npm run dev"

Write-Host ""
Write-Host "All servers started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
