# Supplier Risk Radar - Quick Start Guide

## 🚀 5-Minute Setup

This guide will get your Supplier Risk Radar up and running in 5 minutes.

---

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Backend and Frontend servers accessible

---

## Step 1: Generate & Process Data (2 minutes)

Open PowerShell and run:

```powershell
# Navigate to supplier intelligence directory
cd d:\Major\Backend\supplier_intelligence

# Generate synthetic supplier data
python generate_supplier_data.py

# Process data and create features
python supplier_data_loader.py
```

**Expected Output:**
- ✅ `supplier_transactions.csv` created (1000 rows)
- ✅ `processed_supplier_data.csv` created with 7 features

---

## Step 2: Train ML Models (2 minutes)

```powershell
# Still in d:\Major\Backend\supplier_intelligence

# Train all three models
python train_delay_risk.py
python train_quality_risk.py
python train_fulfilment_risk.py
```

**Expected Output:**
- ✅ `models/delay_risk_model.pkl` created
- ✅ `models/quality_risk_model.pkl` created
- ✅ `models/fulfillment_risk_model.pkl` created

---

## Step 3: Test the System (1 minute)

### Test the Risk Engine

```powershell
python risk_score_engine.py
```

**Expected Output:**
```json
{
  "risk_score": 45.23,
  "label": "Medium",
  "breakdown": {
    "delay": 38.5,
    "quality": 25.0,
    "fulfillment": 15.2
  }
}
```

### Test the API

Your backend should already be running. Test with:

```powershell
# Test risk overview endpoint
curl http://localhost:5000/api/supplier/risk-overview

# Test prediction endpoint
curl -X POST http://localhost:5000/api/supplier/predict-risk `
  -H "Content-Type: application/json" `
  -d '{\"supplier\":\"Apex Logistics\",\"category\":\"Electronics\",\"qty\":500,\"price\":50,\"payment_risk\":0}'
```

---

## Step 4: Access the UI

1. **Ensure Frontend is Running:**
   ```powershell
   cd d:\Major\Frontend
   npm run dev
   ```

2. **Open Browser:**
   - Navigate to `http://localhost:5173` (or your Vite dev server port)
   - Look for "Supplier Risk Radar" or "Supplier Intelligence" in the navigation

3. **Verify Functionality:**
   - ✅ Table shows 25 suppliers
   - ✅ Search bar filters results
   - ✅ Click a row to open detail modal
   - ✅ Modal shows trend chart and metrics

---

## 🎯 What You Should See

### Main Radar View
- **Header:** "Supplier Risk Radar" with search bar
- **Table Columns:**
  - Supplier Name
  - Category
  - Avg. Delay (days)
  - Fulfillment (%)
  - Quality (rejection %)
  - Risk Score (0-100 with color bar)
  - Action button

### Detail Modal (Click any row)
- **Left Panel:** Line chart showing last 10 orders
  - Red line: Rejection rate
  - Orange line: Delay days
  - Green line: Fulfillment rate
- **Right Panel:**
  - Current risk score (color-coded)
  - Average delay
  - Quality score
  - AI assessment text

---

## 🔧 Troubleshooting

### Issue: "No supplier data available"
**Solution:**
```powershell
cd d:\Major\Backend\supplier_intelligence
python supplier_data_loader.py
```

### Issue: "Models not loaded"
**Solution:**
```powershell
# Retrain all models
python train_delay_risk.py
python train_quality_risk.py
python train_fulfilment_risk.py
```

### Issue: Frontend shows empty table
**Solution:**
1. Check backend is running: `http://localhost:5000/api/supplier/risk-overview`
2. Check browser console for errors (F12)
3. Verify CORS is enabled in Flask app

### Issue: API returns 500 error
**Solution:**
```powershell
# Check if processed data exists
ls d:\Major\Backend\supplier_intelligence\processed_supplier_data.csv

# Check if models exist
ls d:\Major\Backend\supplier_intelligence\models\*.pkl
```

---

## 📊 Sample Data Overview

After setup, you'll have:

- **25 Suppliers** across 8 categories
- **1000 Historical Transactions** (1 year)
- **Risk Profiles:**
  - 🔴 High Risk: Alpha Parts, Nova Logistics, Omega Industries
  - 🟡 Medium Risk: Speedy Supply, Prime Suppliers, Swift Transport
  - 🟢 Low Risk: All others

---

## 🧪 Quick Test Scenarios

### Test 1: Search Functionality
1. Type "Apex" in search bar
2. Should filter to show only "Apex Logistics"

### Test 2: Risk Levels
1. Look for suppliers with red risk badges (High risk)
2. Click to open detail modal
3. Verify AI assessment says "multiple risk flags"

### Test 3: Trend Analysis
1. Click any supplier row
2. Modal opens with trend chart
3. Hover over chart lines to see values
4. Verify last 10 orders are shown

### Test 4: API Prediction
```powershell
# Test with a high-risk supplier
curl -X POST http://localhost:5000/api/supplier/predict-risk `
  -H "Content-Type: application/json" `
  -d '{\"supplier\":\"Alpha Parts\",\"category\":\"Electronics\",\"qty\":1000,\"price\":75,\"payment_risk\":2}'

# Should return high risk score (>70)
```

---

## 📁 File Checklist

After setup, verify these files exist:

```
d:\Major\Backend\supplier_intelligence\
├── ✅ supplier_transactions.csv          (110KB)
├── ✅ processed_supplier_data.csv        (165KB)
└── models\
    ├── ✅ delay_risk_model.pkl
    ├── ✅ quality_risk_model.pkl
    └── ✅ fulfillment_risk_model.pkl
```

---

## 🎓 Next Steps

Once everything is working:

1. **Explore the Code:**
   - Read `SUPPLIER_RISK_RADAR_DEVELOPMENT_GUIDE.md` for deep dive
   - Study `risk_score_engine.py` to understand scoring logic

2. **Customize:**
   - Modify risk weights in `risk_score_engine.py`
   - Add more suppliers in `generate_supplier_data.py`
   - Adjust UI colors in `SupplierIntelligence.css`

3. **Extend:**
   - Add new risk factors (e.g., geopolitical risk)
   - Implement real-time alerts
   - Connect to actual ERP data

---

## 📞 Need Help?

- **Full Documentation:** See `SUPPLIER_RISK_RADAR_DEVELOPMENT_GUIDE.md`
- **Check Logs:** `d:\Major\Backend\risk_check.log`
- **Test Results:** `d:\Major\Backend\risk_results.txt`

---

## ✅ Success Criteria

You're all set when:

- ✅ All 3 models trained without errors
- ✅ API returns supplier list with risk scores
- ✅ Frontend table displays 25 suppliers
- ✅ Search filters work
- ✅ Detail modal opens and shows chart
- ✅ Risk scores are color-coded (red/yellow/green)

---

**Estimated Setup Time:** 5 minutes  
**Last Updated:** January 2026
