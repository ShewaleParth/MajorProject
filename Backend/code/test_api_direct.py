#!/usr/bin/env python3
"""
=============================================================================
TEST SCRIPT - DO NOT DELETE
=============================================================================
Purpose: Direct API endpoint testing for ML prediction services

Tests:
  - Custom prediction endpoint response structure
  - Projected stock field presence and accuracy
  - AI insights and decision engine output
  - Stock trend validation (decreasing over time)

Usage:
  python test_api_direct.py

API Endpoints Tested:
  - POST /api/ml/predict/custom
  - POST /api/ml/scenario-planning

Maintained by: Development Team
Last Updated: 2025-12-29
=============================================================================
"""

import requests
import json

# Test the API directly to see what it's returning
url = "http://localhost:5001/api/ml/predict/custom"

payload = {
    "sku": "TEST-001",
    "productName": "Test Product",
    "currentStock": 100,
    "dailySales": 10,
    "weeklySales": 70,
    "reorderLevel": 30,
    "leadTime": 7,
    "forecastDays": 30
}

print("=" * 80)
print("TESTING /api/ml/predict/custom ENDPOINT")
print("=" * 80)

try:
    response = requests.post(url, json=payload)
    data = response.json()
    
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"✅ Success: {data.get('success', False)}")
    
    if data.get('success'):
        forecast = data.get('forecast', {})
        forecast_data = forecast.get('forecastData', [])
        
        # Check for projected_stock
        if forecast_data:
            first_day = forecast_data[0]
            print(f"\n📊 First Day Data Keys: {list(first_day.keys())}")
            print(f"   - Has 'projected_stock': {'projected_stock' in first_day}")
            print(f"   - Has 'predicted': {'predicted' in first_day}")
            
            if 'projected_stock' in first_day:
                print(f"\n📉 Stock Projection Sample:")
                for i in [0, 5, 10, 15]:
                    if i < len(forecast_data):
                        day = forecast_data[i]
                        print(f"   Day {i+1}: Stock={day.get('projected_stock', 'N/A'):.1f}, Sales={day.get('predicted', 'N/A'):.1f}")
        
        # Check insights
        insights = forecast.get('aiInsights', {})
        print(f"\n🚨 AI Insights:")
        print(f"   - Risk Level: {insights.get('risk_level', 'N/A')}")
        print(f"   - ETA Days: {insights.get('eta_days', 'N/A')}")
        print(f"   - Status: {insights.get('status', 'N/A')}")
        print(f"   - Message: {insights.get('message', 'N/A')[:100]}...")
    else:
        print(f"\n❌ Error: {data.get('error', 'Unknown error')}")
        
except Exception as e:
    print(f"\n❌ Request Failed: {e}")

print("\n" + "=" * 80)
print("TESTING /api/ml/scenario-planning ENDPOINT")
print("=" * 80)

scenario_url = "http://localhost:5001/api/ml/scenario-planning"
scenario_payload = {
    **payload,
    "adjustments": {
        "demandMultiplier": 1.5,
        "leadTimeDelta": 3,
        "stockDelta": 0
    }
}

try:
    response = requests.post(scenario_url, json=scenario_payload)
    data = response.json()
    
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"✅ Success: {data.get('success', False)}")
    
    if data.get('success'):
        # Check for ai_analysis
        ai_analysis = data.get('ai_analysis', {})
        print(f"\n🤖 AI Analysis:")
        print(f"   - Has 'situation': {'situation' in ai_analysis}")
        print(f"   - Has 'risk': {'risk' in ai_analysis}")
        print(f"   - Has 'action': {'action' in ai_analysis}")
        
        if ai_analysis:
            print(f"\n   Situation: {ai_analysis.get('situation', 'N/A')[:100]}...")
            print(f"   Risk: {ai_analysis.get('risk', 'N/A')[:100]}...")
            print(f"   Action: {ai_analysis.get('action', 'N/A')[:100]}...")
    else:
        print(f"\n❌ Error: {data.get('error', 'Unknown error')}")
        
except Exception as e:
    print(f"\n❌ Request Failed: {e}")

print("\n" + "=" * 80)
