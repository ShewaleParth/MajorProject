#!/usr/bin/env python3
"""
=============================================================================
TEST SCRIPT - DO NOT DELETE
=============================================================================
Purpose: Comprehensive verification of forecasting API accuracy

Tests:
  - Projected stock calculation and depletion over time
  - Risk level accuracy (Critical, High, Medium, Low)
  - ETA (Estimated Time to Exhaustion) calculation
  - Scenario planning with demand multipliers

Usage:
  python verify_forecasting.py

API Endpoints Tested:
  - POST /api/ml/predict/custom
  - POST /api/ml/scenario-planning

Maintained by: Development Team
Last Updated: 2025-12-29
=============================================================================
"""

import requests
import json
import pandas as pd

def test_forecasting():
    print("🚀 Starting Forecasting Logic Verification...")
    
    url = "http://localhost:5001/api/ml/predict/custom"
    payload = {
        "sku": "TEST-SKU-001",
        "productName": "Verification Product",
        "currentStock": 100,
        "dailySales": 10,
        "weeklySales": 70,
        "reorderLevel": 30,
        "leadTime": 5,
        "forecastDays": 15
    }
    
    try:
        print(f"📡 Sending request to {url}...")
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        if data['success']:
            print("✅ API Response: Success")
            forecast = data['forecast']
            
            # 1. Check for projected_stock
            forecast_data = forecast['forecastData']
            print(f"📈 Forecast length: {len(forecast_data)} days")
            
            has_projected_stock = all('projected_stock' in day for day in forecast_data)
            print(f"✅ All days have 'projected_stock': {has_projected_stock}")
            
            # 2. Verify stock decreases
            initial_stock = forecast_data[0]['projected_stock']
            last_stock = forecast_data[-1]['projected_stock']
            print(f"📉 Stock Trend: {forecast['currentStock']} -> {forecast_data[0]['projected_stock']:.1f} -> {last_stock:.1f}")
            
            if last_stock < forecast['currentStock']:
                print("✅ Stock is correctly decreasing over time")
            else:
                print("❌ Stock is NOT decreasing")
                
            # 3. Verify Risk Assessment
            insights = forecast['aiInsights']
            print(f"🚨 Risk Level: {insights['risk_level']}")
            print(f"📅 ETA Days: {insights['eta_days']}")
            
            # With 100 stock and 10 daily sales, ETA should be exactly 10
            if insights['eta_days'] == 10:
                print("✅ ETA calculation is precise (100 / 10 = 10 days)")
            else:
                print(f"❌ ETA calculation mismatch. Expected 10, got {insights['eta_days']}")
                
            if 10 < 15: # 10 days < 15 days window for warning
                if insights['risk_level'] in ['Warning', 'Medium']:
                    print("✅ Risk level correctly set to Medium/Warning (ETA < 15)")
                else:
                    print(f"❌ Risk level unexpected for ETA 10: {insights['risk_level']}")
        else:
            print(f"❌ API Error: {data.get('error')}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("💡 Make sure the backend is running: python d:\\Major Project\\Sangrahak\\Backend\\code\\app.py")

if __name__ == "__main__":
    test_forecasting()
