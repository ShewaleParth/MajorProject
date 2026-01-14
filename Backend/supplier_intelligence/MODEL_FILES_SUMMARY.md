# Supplier Risk Radar - Model Files Summary

## ✅ All Model Files Successfully Generated

**Location:** `d:\Major\Backend\supplier_intelligence\models\`

### Model Files (3/3)

| Model File | Size | Purpose | Status |
|------------|------|---------|--------|
| **delay_risk_model.pkl** | 2.85 MB | Predicts delivery delay days (0-15 days) | ✅ Generated |
| **quality_risk_model.pkl** | 2.80 MB | Predicts rejection ratio (0-10%) | ✅ Generated |
| **fulfillment_risk_model.pkl** | 2.47 MB | Predicts fulfillment ratio (0-100%) | ✅ Generated |

**Total Size:** ~8.12 MB

---

## Model Architecture

**Algorithm:** Random Forest Regressor  
**Framework:** Scikit-learn  
**Training Data:** 1000+ supplier transactions  
**Features Used:**
- Supplier ID (encoded)
- Category ID (encoded)
- Ordered Quantity
- Base Price
- Payment Risk Level

---

## Model Training Scripts

Each model was trained using its dedicated script:

1. **`train_delay_risk.py`** → Generates `delay_risk_model.pkl`
2. **`train_quality_risk.py`** → Generates `quality_risk_model.pkl`
3. **`train_fulfilment_risk.py`** → Generates `fulfillment_risk_model.pkl`

---

## Risk Score Calculation

The final risk score is a weighted combination:

```
Final Risk Score = (Delay Score × 0.4) + (Quality Score × 0.3) + (Fulfillment Score × 0.3)
```

**Risk Levels:**
- **Low:** 0-40 (Green)
- **Medium:** 41-70 (Yellow)
- **High:** 71-100 (Red)

---

## Integration Status

### Backend (Flask)
- ✅ Models loaded in `risk_score_engine.py`
- ✅ API routes defined in `supplier_routes.py`
- ✅ Blueprint registered in `app.py` (line 995)
- ✅ Endpoints available at `/api/supplier/*`

### API Endpoints
```
GET  /api/supplier/risk-overview
POST /api/supplier/predict-risk
GET  /api/supplier/history/<supplier_name>
```

### Frontend (React)
- ✅ Components in `Frontend/src/components/SupplierRiskRadar/`
- ✅ `SupplierRadar.jsx` - Main table view
- ✅ `SupplierDetail.jsx` - Detail modal with charts
- ✅ `riskApi.js` - API client

---

## Testing

Run the verification script to test all models:

```bash
cd d:\Major\Backend\supplier_intelligence
python verify_models.py
```

This will:
1. Check if all 3 model files exist
2. Load the Risk Score Engine
3. Run test predictions on sample suppliers
4. Display results with risk scores and levels

---

## Retraining Models

To retrain all models with fresh data:

```bash
cd d:\Major\Backend\supplier_intelligence

# Retrain all 3 models
python train_delay_risk.py
python train_quality_risk.py
python train_fulfilment_risk.py
```

**When to Retrain:**
- Monthly (recommended)
- When new supplier data is available
- When model accuracy degrades
- After significant business changes

---

## Data Files

**Training Data:**
- `supplier_transactions.csv` (110 KB) - Raw transaction data
- `processed_supplier_data.csv` (165 KB) - Processed features

**Data Generation:**
- Run `generate_supplier_data.py` to create synthetic data
- Run `supplier_data_loader.py` to process raw data

---

## Model Performance

Each model uses:
- **100 decision trees** (n_estimators=100)
- **Random state 42** for reproducibility
- **Train/Test split:** 80/20
- **Evaluation metric:** Mean Squared Error (MSE)

---

## Next Steps

1. ✅ All models are trained and ready
2. ✅ Models are integrated with Flask backend
3. ✅ API endpoints are available
4. 🔄 Test the frontend integration
5. 🔄 Verify API responses in browser

---

## Troubleshooting

**If models fail to load:**
```python
# Check model files exist
import os
models_dir = "d:/Major/Backend/supplier_intelligence/models"
print(os.listdir(models_dir))
```

**If predictions fail:**
- Ensure supplier name exists in training data
- Check category is valid
- Verify numeric inputs are positive

**If API returns errors:**
- Check Flask app is running on port 5001
- Verify CORS is enabled
- Check MongoDB connection

---

**Generated:** 2026-01-14  
**Status:** ✅ Production Ready  
**Version:** 1.0
