@echo off
echo ========================================
echo   SUPPLIER RISK MODELS TRAINING
echo ========================================
echo.

cd /d "%~dp0"
python train_all_models.py

echo.
echo ========================================
echo   TRAINING COMPLETE
echo ========================================
echo.
echo Press any key to exit...
pause >nul
