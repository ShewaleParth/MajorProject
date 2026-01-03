#!/usr/bin/env python3
"""
=============================================================================
TEST SCRIPT - DO NOT DELETE
=============================================================================
Purpose: Risk level threshold validation and diagnostic testing

Tests:
  - Critical risk (0 stock)
  - High risk (stock < lead time)
  - Medium risk (stock < 30 days)
  - Low risk (stock >= 30 days)
  - ETA calculation accuracy across scenarios

Usage:
  python test_risk_levels.py

API Endpoints Tested:
  - POST /api/ml/predict/custom

Maintained by: Development Team
Last Updated: 2025-12-29
=============================================================================
"""

import requests
import json

print("=" * 70)
print("RISK CALCULATION DIAGNOSTIC TEST")
print("=" * 70)

# Test with different stock scenarios
test_scenarios = [
    {
        "name": "Critical Stock (0 units)",
        "currentStock": 0,
        "dailySales": 10,
        "weeklySales": 70,
        "leadTime": 7
    },
    {
        "name": "High Risk (stock < lead time)",
        "currentStock": 30,
        "dailySales": 10,
        "weeklySales": 70,
        "leadTime": 7
    },
    {
        "name": "Medium Risk (stock for 12 days)",
        "currentStock": 120,
        "dailySales": 10,
        "weeklySales": 70,
        "leadTime": 7
    },
    {
        "name": "Low Risk (plenty of stock)",
        "currentStock": 500,
        "dailySales": 10,
        "weeklySales": 70,
        "leadTime": 7
    }
]

url = "http://localhost:5001/api/ml/predict/custom"

for scenario in test_scenarios:
    payload = {
        "sku": f"TEST-{scenario['name'][:4]}",
        "productName": scenario['name'],
        "currentStock": scenario['currentStock'],
        "dailySales": scenario['dailySales'],
        "weeklySales": scenario['weeklySales'],
        "reorderLevel": 20,
        "leadTime": scenario['leadTime'],
        "forecastDays": 30
    }
    
    print(f"\n{'='*70}")
    print(f"Testing: {scenario['name']}")
    print(f"  Stock: {scenario['currentStock']} | Daily Sales: {scenario['dailySales']} | Lead Time: {scenario['leadTime']}")
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        data = response.json()
        
        if data.get('success'):
            insights = data['forecast']['aiInsights']
            expected_eta = scenario['currentStock'] / scenario['dailySales'] if scenario['dailySales'] > 0 else 999
            
            print(f"\n  RESULTS:")
            print(f"    Risk Level: {insights.get('risk_level', 'N/A')}")
            print(f"    ETA Days: {insights.get('eta_days', 'N/A')}")
            print(f"    Expected ETA: {expected_eta:.1f} days")
            print(f"    Status: {insights.get('status', 'N/A')}")
            
            # Verify correctness
            if scenario['currentStock'] == 0:
                expected_risk = "Critical"
            elif expected_eta < scenario['leadTime']:
                expected_risk = "High"
            elif expected_eta < 15:
                expected_risk = "Medium"
            else:
                expected_risk = "Low"
            
            actual_risk = insights.get('risk_level', 'N/A')
            match = "✅" if actual_risk == expected_risk else "❌"
            print(f"\n  {match} Expected Risk: {expected_risk} | Actual: {actual_risk}")
        else:
            print(f"  ❌ API Error: {data.get('error')}")
    except Exception as e:
        print(f"  ❌ Request Error: {e}")

print(f"\n{'='*70}")
print("DIAGNOSTIC COMPLETE")
print("=" * 70)
