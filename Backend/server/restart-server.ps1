# Restart Backend Server Script
# This script kills any existing Node.js processes and restarts the server

Write-Host " Restarting Backend Server..." -ForegroundColor Cyan

# Kill all Node.js processes
Write-Host " Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host " All Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "  No Node.js processes found or already stopped" -ForegroundColor Yellow
}

# Start the server
Write-Host " Starting server..." -ForegroundColor Cyan
Set-Location -Path "d:\Major\Backend\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host " Server restart initiated!" -ForegroundColor Green
Write-Host " Check the new PowerShell window for server logs" -ForegroundColor Cyan
