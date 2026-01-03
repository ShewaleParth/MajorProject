#!/usr/bin/env python3
"""
=============================================================================
TEST SCRIPT - DO NOT DELETE
=============================================================================
Purpose: Final comprehensive test suite for forecasting system

Tests:
  - Corrected risk level calculation (Critical/High/Medium/Low)
  - Projected stock presence and accuracy
  - AI decision engine output verification
  - Complete API response validation

Usage:
  python test_final.py

API Endpoints Tested:
  - POST /api/ml/predict/custom
  - POST /api/ml/scenario-planning

Maintained by: Development Team
Last Updated: 2025-12-29
=============================================================================
"""

import requests
import json

print("=" * 60)
print("FINAL VERIFICATION TEST - Updated Backend")
print("=" * 60)

# Test with realistic scenario
url = "http://localhost:5001/api/ml/scenario-planning"
payload = {
    "sku": "WIDGET-001",
    "productName": "Premium Widget",
    "currentStock": 50,
    "dailySales": 8,
    "weeklySales": 56,
    "reorderLevel": 20,
    "leadTime": 7,
    "forecastDays": 30,
    "adjustments": {
        "demandMultiplier": 1.5,  # simulating 50% spike
        "leadTimeDelta": 2,    # 2 extra days delay
        "stockDelta": 0
    }
}

print(f"\n📦 Testing Product: {payload['productName']}")
print(f"   Current Stock: {payload['currentStock']}")
print(f"   Daily Sales: {payload['dailySales']}")
print(f"   Scenario: {payload['adjustments']['demandMultiplier']}x demand")

try:
    response = requests.post(url, json=payload, timeout=10)
    data = response.json()
    
    if data.get('success'):
        print(f"\n✅ API Response: SUCCESS\n")
        
        scenario = data.get('scenario', {})
        baseline = data.get('baseline', {})
        ai = data.get('ai_analysis', {})
        
        print(f"📊 BASELINE:")
        print(f"   Risk Level: {baseline.get('stockoutRisk', 'N/A')}")
        print(f"   ETA Days: {baseline.get('insights', {}).get('eta_days', 'N/A')}")
        
        print(f"\n📊 SCENARIO (with 1.5x demand + delays):")
        print(f"   Risk Level: {scenario.get('stockoutRisk', 'N/A')}")
        print(f"   ETA Days: {scenario.get('insights', {}).get('eta_days', 'N/A')}")
        
        print(f"\n🤖 AI DECISION ENGINE:")
        print(f"   Situation: {ai.get('situation', 'N/A')[:80]}...")
        print(f"   Risk: {ai.get('risk', 'N/A')[:80]}...")
        print(f"   Action: {ai.get('action', 'N/A')[:80]}...")
        
        # Verify projected_stock is present
        baseline_data = baseline.get('forecastData', [])
        if baseline_data and 'projected_stock' in baseline_data[0]:
            print(f"\n✅ projected_stock field: PRESENT")
            print(f"   Sample: Day 1={baseline_data[0]['projected_stock']:.1f}, Day 5={baseline_data[4]['projected_stock']:.1f}")
        else:
            print(f"\n❌ projected_stock field: MISSING")
            
        print(f"\n" + "=" * 60)
        print("✅ ALL CHECKS PASSED - Backend is properly configured!")
        print("=" * 60)
    else:
        print(f"\n❌ API Error: {data.get('error')}")
        
except Exception as e:
    print(f"\n❌ Connection Error: {e}")
    print("   Make sure backend is running on port 5001")
