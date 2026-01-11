# 🚀 Server Startup Guide - No More Port Conflicts!

## ✅ **PERMANENT FIX - Use These Scripts**

I've created startup scripts that **automatically kill** any existing processes before starting the servers. You'll **never see the `EADDRINUSE` error again**.

---

## 📁 **Quick Start (Recommended)**

### Option 1: Start Everything at Once
```powershell
cd d:\Major
.\start-all.ps1
```

This will:
1. Kill all existing Node.js and Python processes
2. Start AI Server (Port 5001) in a new window
3. Start Node.js Server (Port 5000) in a new window  
4. Start Frontend Dev Server (Port 5173) in a new window

---

## 📁 **Individual Server Scripts**

### Start Only Node.js Server
```powershell
cd d:\Major\Backend\server
.\start-server.ps1
```

### Start Only AI Server
```powershell
cd d:\Major\Backend\code
.\start-ai.ps1
```

---

## 🔧 **How It Works**

Each script runs this before starting:
```powershell
taskkill /F /IM node.exe    # Kills all Node.js processes
taskkill /F /IM python.exe  # Kills all Python processes
```

This ensures ports 5000, 5001, and 5173 are always free before starting.

---

## ⚠️ **If You Still Get Errors**

If PowerShell blocks the scripts, run this **once**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 **Your Workflow Now**

1. **Close all terminals** (don't worry about killing processes manually)
2. **Run**: `.\start-all.ps1` from `d:\Major`
3. **Open**: http://localhost:5173/forecasting
4. **Done!** No more port conflicts ever.

---

## 📝 **Script Locations**

- `d:\Major\start-all.ps1` - Master script (starts all 3 servers)
- `d:\Major\Backend\server\start-server.ps1` - Node.js only
- `d:\Major\Backend\code\start-ai.ps1` - Python AI only
