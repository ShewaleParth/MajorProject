# Supplier Risk Radar - Development Guide

## 📋 Overview

The **Supplier Risk Radar** is an AI-powered supply chain intelligence module that monitors and predicts supplier performance risks in real-time. It uses machine learning models to analyze historical supplier data and provide actionable insights for procurement decisions.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPPLIER RISK RADAR                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Frontend   │ ←──→ │   Backend    │ ←──→ │    ML     │ │
│  │  (React UI)  │      │  (Flask API) │      │  Models   │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │       │
│         │                      │                     │       │
│    ┌────▼────┐          ┌─────▼──────┐       ┌──────▼────┐ │
│    │ Risk    │          │ Supplier   │       │ Risk Score│ │
│    │ Radar   │          │ Routes API │       │  Engine   │ │
│    │ Table   │          │            │       │           │ │
│    └────┬────┘          └─────┬──────┘       └──────┬────┘ │
│         │                      │                     │       │
│    ┌────▼────┐          ┌─────▼──────┐       ┌──────▼────┐ │
│    │Supplier │          │ Data       │       │ 3 ML      │ │
│    │ Detail  │          │ Processor  │       │ Models    │ │
│    │ Modal   │          │            │       │           │ │
│    └─────────┘          └────────────┘       └───────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React.js
- Recharts (for data visualization)
- Lucide React (icons)
- Custom CSS

**Backend:**
- Flask (Python web framework)
- Pandas (data processing)
- Scikit-learn (ML models)
- NumPy (numerical operations)

**Machine Learning:**
- Random Forest Regressors (3 models)
- LabelEncoder (categorical encoding)
- Pickle (model serialization)

---

## 📂 Project Structure

```
d:\Major\
├── Backend\
│   ├── code\
│   │   └── app.py                          # Main Flask app (registers supplier routes)
│   └── supplier_intelligence\
│       ├── __init__.py                     # Package initializer
│       ├── generate_supplier_data.py       # Synthetic data generator
│       ├── supplier_data_loader.py         # Data preprocessing pipeline
│       ├── supplier_routes.py              # Flask API endpoints
│       ├── risk_score_engine.py            # ML inference engine
│       ├── train_delay_risk.py             # Delay prediction model trainer
│       ├── train_quality_risk.py           # Quality prediction model trainer
│       ├── train_fulfilment_risk.py        # Fulfillment prediction model trainer
│       ├── supplier_transactions.csv       # Raw transaction data
│       ├── processed_supplier_data.csv     # Processed features
│       └── models\
│           ├── delay_risk_model.pkl        # Trained delay model
│           ├── quality_risk_model.pkl      # Trained quality model
│           └── fulfillment_risk_model.pkl  # Trained fulfillment model
│
└── Frontend\
    └── src\
        ├── components\
        │   └── SupplierRiskRadar\
        │       ├── SupplierRadar.jsx       # Main radar table component
        │       ├── SupplierDetail.jsx      # Supplier detail modal
        │       └── riskApi.js              # API client
        └── styles\
            └── SupplierIntelligence.css    # Component styles
```

---

## 🔄 Development Workflow

### Phase 1: Data Generation & Preprocessing

#### Step 1: Generate Synthetic Supplier Data

**File:** `generate_supplier_data.py`

This script creates realistic supplier transaction data with:
- **25 suppliers** across different risk profiles
- **8 product categories**
- **1000 transactions** spanning 1 year
- Risk-based behavior patterns (High/Medium/Low risk suppliers)

**Key Features Generated:**
- Order dates and delivery timelines
- Fulfillment rates (% of ordered quantity delivered)
- Quality metrics (rejection rates)
- Delay patterns (days late)
- Price variations
- Payment status

**Run Command:**
```bash
cd d:\Major\Backend\supplier_intelligence
python generate_supplier_data.py
```

**Output:** `supplier_transactions.csv`

---

#### Step 2: Process and Feature Engineering

**File:** `supplier_data_loader.py`

This script transforms raw transaction data into ML-ready features:

**Derived Features:**
1. **delay_days** - Actual delivery date - Promised date
2. **fulfillment_ratio** - Delivered qty / Ordered qty
3. **rejection_ratio** - Rejected qty / Delivered qty
4. **price_deviation** - (Actual price - Base price) / Base price
5. **delay_trend** - Rolling 3-order average delay per supplier
6. **complaint_frequency** - Rolling 5-order complaint count
7. **payment_risk** - Encoded payment status (0=On-Time, 1=Under Review, 2=Delayed)

**Run Command:**
```bash
python supplier_data_loader.py
```

**Output:** `processed_supplier_data.csv`

---

### Phase 2: Machine Learning Model Training

The system uses **3 independent Random Forest models** to predict different risk dimensions:

#### Model 1: Delay Risk Prediction

**File:** `train_delay_risk.py`

**Purpose:** Predicts how many days late a supplier will deliver

**Features Used:**
- supplier_id (encoded)
- category_id (encoded)
- ordered_qty
- base_price
- payment_risk

**Target:** delay_days

**Algorithm:** Random Forest Regressor (100 estimators)

**Output:** `models/delay_risk_model.pkl`

**Run Command:**
```bash
python train_delay_risk.py
```

---

#### Model 2: Quality Risk Prediction

**File:** `train_quality_risk.py`

**Purpose:** Predicts rejection ratio (quality issues)

**Features Used:** Same as delay model

**Target:** rejection_ratio

**Output:** `models/quality_risk_model.pkl`

**Run Command:**
```bash
python train_quality_risk.py
```

---

#### Model 3: Fulfillment Risk Prediction

**File:** `train_fulfilment_risk.py`

**Purpose:** Predicts fulfillment ratio (delivery completeness)

**Features Used:** Same as delay model

**Target:** fulfillment_ratio

**Output:** `models/fulfillment_risk_model.pkl`

**Run Command:**
```bash
python train_fulfilment_risk.py
```

---

### Phase 3: Risk Score Engine

**File:** `risk_score_engine.py`

This is the **inference engine** that combines all 3 models to calculate a unified risk score.

#### How It Works:

1. **Load Models:** Loads all 3 trained models with their encoders
2. **Prepare Features:** Encodes supplier name and category using saved LabelEncoders
3. **Predict Individual Risks:**
   - **Delay Score:** Normalized (0 days = 0, 15+ days = 100)
   - **Quality Score:** Normalized (0% rejection = 0, 10%+ = 100)
   - **Fulfillment Score:** Normalized (100% fulfillment = 0, 80% or less = 100)

4. **Calculate Final Score:**
   ```python
   final_score = (delay_score * 0.4) + (quality_score * 0.3) + (fulfillment_score * 0.3)
   ```

5. **Risk Classification:**
   - **High Risk:** Score > 70
   - **Medium Risk:** Score 40-70
   - **Low Risk:** Score < 40

**API:**
```python
engine = RiskScoreEngine()
result = engine.predict_risk(
    supplier_name="Apex Logistics",
    category="Electronics",
    ordered_qty=500,
    base_price=50,
    payment_risk=0
)
# Returns: {
#   "risk_score": 45.23,
#   "label": "Medium",
#   "breakdown": {
#     "delay": 38.5,
#     "quality": 25.0,
#     "fulfillment": 15.2
#   }
# }
```

---

### Phase 4: Backend API Development

**File:** `supplier_routes.py`

Flask Blueprint with 3 main endpoints:

#### Endpoint 1: Risk Overview

**Route:** `GET /api/supplier/risk-overview`

**Purpose:** Get aggregated risk scores for all suppliers

**Process:**
1. Load processed supplier data
2. Group by supplier and calculate averages
3. Run each supplier through the Risk Score Engine
4. Return sorted list with risk scores

**Response:**
```json
{
  "success": true,
  "suppliers": [
    {
      "supplier": "Apex Logistics",
      "category": "Electronics",
      "avg_delay": 5.2,
      "avg_fulfillment": 92.5,
      "avg_rejection": 3.8,
      "risk_score": 45.23,
      "risk_level": "Medium"
    }
  ]
}
```

---

#### Endpoint 2: Predict Risk (On-Demand)

**Route:** `POST /api/supplier/predict-risk`

**Purpose:** Calculate risk for a specific order scenario

**Request Body:**
```json
{
  "supplier": "Global Parts Inc",
  "category": "Raw Materials",
  "qty": 1000,
  "price": 75,
  "payment_risk": 1
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "risk_score": 32.5,
    "label": "Low",
    "breakdown": {
      "delay": 28.0,
      "quality": 15.5,
      "fulfillment": 10.2
    }
  }
}
```

---

#### Endpoint 3: Supplier History

**Route:** `GET /api/supplier/history/<supplier_name>`

**Purpose:** Get historical performance trend for a specific supplier

**Response:**
```json
{
  "success": true,
  "supplier": "Apex Logistics",
  "trend": [
    {
      "date": "2023-06-15",
      "delay": 3,
      "rejection": 2.5,
      "fulfillment": 95.0
    }
  ]
}
```

---

### Phase 5: Frontend Development

#### Component 1: SupplierRadar.jsx

**Main Features:**
- **Search & Filter:** Real-time search by supplier name or category
- **Risk Table:** Displays all suppliers with key metrics
- **Visual Indicators:**
  - Color-coded risk badges (Red/Yellow/Green)
  - Mini progress bars for risk scores
  - Icons for quality status
- **Interactive Rows:** Click to open detailed view

**State Management:**
```javascript
const [suppliers, setSuppliers] = useState([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [selectedSupplier, setSelectedSupplier] = useState(null);
```

**Data Flow:**
1. Component mounts → `loadData()` called
2. Fetches from `/api/supplier/risk-overview`
3. Updates `suppliers` state
4. Renders table with filtering

---

#### Component 2: SupplierDetail.jsx

**Purpose:** Modal showing detailed supplier analytics

**Features:**
- **Risk Trend Chart:** Line chart showing last 10 orders
  - Rejection rate (red line)
  - Delay days (orange line)
  - Fulfillment rate (green line)
- **Key Metrics Panel:**
  - Current risk score with color coding
  - Average delay
  - Quality score
- **AI Assessment:** Contextual recommendation based on risk level

**Data Flow:**
1. Receives `supplier` prop from parent
2. Fetches history from `/api/supplier/history/{name}`
3. Renders Recharts LineChart with trend data

---

#### API Client: riskApi.js

**Purpose:** Centralized API communication layer

```javascript
export const riskApi = {
  getRiskOverview: async () => {
    const response = await fetch('/api/supplier/risk-overview');
    return response.json();
  },
  
  getSupplierHistory: async (supplierName) => {
    const response = await fetch(`/api/supplier/history/${supplierName}`);
    return response.json();
  },
  
  predictRisk: async (data) => {
    const response = await fetch('/api/supplier/predict-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

---

### Phase 6: Integration

#### Backend Integration

**File:** `Backend/code/app.py`

```python
from supplier_intelligence.supplier_routes import supplier_routes

# Register blueprint
app.register_blueprint(supplier_routes, url_prefix='/api/supplier')
```

#### Frontend Integration

Add route in your main App.jsx:
```javascript
import SupplierRadar from './components/SupplierRiskRadar/SupplierRadar';

// In your router
<Route path="/supplier-risk" element={<SupplierRadar />} />
```

---

## 🚀 Complete Setup Guide

### Step-by-Step Implementation

#### 1. Generate Data
```bash
cd d:\Major\Backend\supplier_intelligence
python generate_supplier_data.py
```

#### 2. Process Data
```bash
python supplier_data_loader.py
```

#### 3. Train All Models
```bash
python train_delay_risk.py
python train_quality_risk.py
python train_fulfilment_risk.py
```

#### 4. Verify Models
```bash
python risk_score_engine.py
# Should output a sample prediction
```

#### 5. Start Backend
```bash
cd d:\Major\Backend\code
python app.py
```

#### 6. Start Frontend
```bash
cd d:\Major\Frontend
npm run dev
```

#### 7. Test API Endpoints

**Test Risk Overview:**
```bash
curl http://localhost:5000/api/supplier/risk-overview
```

**Test Prediction:**
```bash
curl -X POST http://localhost:5000/api/supplier/predict-risk \
  -H "Content-Type: application/json" \
  -d '{"supplier":"Apex Logistics","category":"Electronics","qty":500,"price":50,"payment_risk":0}'
```

**Test History:**
```bash
curl http://localhost:5000/api/supplier/history/Apex%20Logistics
```

---

## 🎯 Key Features & Capabilities

### 1. Real-Time Risk Monitoring
- Continuous tracking of 25+ suppliers
- Live risk score updates
- Multi-dimensional risk assessment

### 2. Predictive Analytics
- ML-powered delay prediction
- Quality issue forecasting
- Fulfillment reliability scoring

### 3. Historical Trend Analysis
- 10-order rolling history
- Visual trend identification
- Performance degradation detection

### 4. Intelligent Recommendations
- AI-generated risk assessments
- Actionable procurement guidance
- Alternative supplier suggestions

### 5. Search & Filter
- Real-time supplier search
- Category-based filtering
- Risk level sorting

---

## 🧪 Testing & Validation

### Model Performance Testing

Create `test_models.py`:
```python
from risk_score_engine import RiskScoreEngine
import pandas as pd

engine = RiskScoreEngine()
df = pd.read_csv("processed_supplier_data.csv")

# Test on sample suppliers
test_suppliers = ["Apex Logistics", "Global Parts Inc", "Speedy Supply"]

for supplier in test_suppliers:
    supplier_data = df[df['supplier'] == supplier].iloc[0]
    result = engine.predict_risk(
        supplier,
        supplier_data['category'],
        500,
        supplier_data['base_price'],
        supplier_data['payment_risk']
    )
    print(f"{supplier}: {result}")
```

### API Testing

Use the provided `test_supplier_api.py`:
```bash
python test_supplier_api.py
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│ Raw Transaction │
│      Data       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Data Processor  │ ← Feature Engineering
│  (Loader.py)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Processed CSV   │
│  with Features  │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Delay Model  │ │ Quality  │ │ Fulfillment  │
│   Trainer    │ │  Trainer │ │   Trainer    │
└──────┬───────┘ └─────┬────┘ └──────┬───────┘
       │               │              │
       ▼               ▼              ▼
┌──────────────────────────────────────────┐
│         Trained Models (.pkl)            │
└──────────────────┬───────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Risk Score      │
         │    Engine       │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Flask API      │
         │   Endpoints     │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  React Frontend │
         │   Components    │
         └─────────────────┘
```

---

## 🔧 Customization & Extension

### Adding New Risk Factors

1. **Update Data Generator:**
   Add new columns in `generate_supplier_data.py`

2. **Update Feature Engineering:**
   Add derived features in `supplier_data_loader.py`

3. **Create New Model:**
   Copy `train_delay_risk.py` and modify target variable

4. **Update Risk Engine:**
   Add new model to `risk_score_engine.py` and adjust weighting

### Modifying Risk Weights

In `risk_score_engine.py`, line 49:
```python
# Current weights
final_score = (delay_score * 0.4) + (quality_score * 0.3) + (fulfillment_score * 0.3)

# Example: Prioritize quality
final_score = (delay_score * 0.3) + (quality_score * 0.5) + (fulfillment_score * 0.2)
```

### Adding More Suppliers

In `generate_supplier_data.py`, expand the suppliers list:
```python
suppliers = [
    "Apex Logistics", "Global Parts Inc", ...,
    "Your New Supplier 1", "Your New Supplier 2"
]
```

Then regenerate data and retrain models.

---

## 🐛 Common Issues & Solutions

### Issue 1: Models Not Loading
**Error:** "Models not loaded"

**Solution:**
```bash
# Ensure models directory exists
mkdir -p d:\Major\Backend\supplier_intelligence\models

# Retrain all models
python train_delay_risk.py
python train_quality_risk.py
python train_fulfilment_risk.py
```

### Issue 2: Unknown Supplier Error
**Error:** "Supplier not found in encoder"

**Solution:** The LabelEncoder only knows suppliers from training data. The engine handles this with try-except blocks, defaulting to ID 0 for unknown suppliers.

### Issue 3: API Returns 404
**Error:** "No supplier data available"

**Solution:**
```bash
# Ensure processed data exists
python supplier_data_loader.py
```

### Issue 4: Frontend Shows No Data
**Solution:**
1. Check backend is running on correct port
2. Verify API endpoint in `riskApi.js` matches backend URL
3. Check browser console for CORS errors

---

## 📈 Performance Optimization

### Backend Optimization
- **Caching:** Cache aggregated supplier data for 5 minutes
- **Lazy Loading:** Only load models when first prediction is requested
- **Batch Processing:** Process multiple suppliers in single API call

### Frontend Optimization
- **Pagination:** Show 20 suppliers per page for large datasets
- **Debounced Search:** Add 300ms delay to search input
- **Memoization:** Use React.memo for SupplierDetail component

---

## 🔐 Security Considerations

1. **Input Validation:** Validate all API inputs (supplier names, quantities, prices)
2. **SQL Injection Prevention:** Use parameterized queries if switching to database
3. **Rate Limiting:** Implement rate limiting on prediction endpoint
4. **Authentication:** Add JWT tokens for production deployment

---

## 📝 Future Enhancements

### Planned Features
1. **Real-Time Alerts:** WebSocket notifications for high-risk suppliers
2. **Comparative Analysis:** Side-by-side supplier comparison
3. **Automated Reordering:** Suggest alternative suppliers for high-risk orders
4. **Historical Forecasting:** Predict future risk trends
5. **Integration with ERP:** Connect to SAP/Oracle for live data
6. **Multi-Currency Support:** Handle international suppliers
7. **Geopolitical Risk:** Factor in country-level risks
8. **Sustainability Scores:** Add environmental compliance metrics

---

## 📚 Additional Resources

### Documentation
- [Scikit-learn Random Forest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html)
- [Flask Blueprints](https://flask.palletsprojects.com/en/2.3.x/blueprints/)
- [Recharts Documentation](https://recharts.org/en-US/)

### Related Files
- `d:\Major\test_supplier_api.py` - API testing script
- `d:\Major\Backend\check_risk_scores.py` - Risk score validation
- `d:\Major\Backend\risk_check.log` - Risk calculation logs

---

## 🎓 Learning Path

### For New Developers

1. **Understand the Data:**
   - Review `supplier_transactions.csv`
   - Study feature engineering in `supplier_data_loader.py`

2. **Learn ML Basics:**
   - Understand Random Forest algorithm
   - Study model training scripts

3. **Explore API Design:**
   - Review Flask Blueprint structure
   - Test endpoints with Postman/curl

4. **Master React Components:**
   - Study state management in SupplierRadar
   - Understand modal patterns in SupplierDetail

5. **End-to-End Testing:**
   - Run complete workflow from data generation to UI
   - Modify risk weights and observe changes

---

## 📞 Support & Contribution

### Getting Help
- Check `d:\Major\Backend\risk_check.log` for error logs
- Review `d:\Major\Backend\risk_results.txt` for validation results

### Contributing
1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request with detailed description

---

## ✅ Checklist for Deployment

- [ ] All 3 ML models trained and saved
- [ ] Processed data CSV exists
- [ ] Backend API endpoints tested
- [ ] Frontend components render correctly
- [ ] Search functionality works
- [ ] Modal opens and displays trends
- [ ] Risk scores calculate correctly
- [ ] Error handling implemented
- [ ] Loading states functional
- [ ] Responsive design verified
- [ ] Cross-browser compatibility checked

---

## 🎉 Conclusion

The Supplier Risk Radar is a comprehensive, production-ready module that demonstrates:
- **Machine Learning Integration** in supply chain management
- **Full-Stack Development** with React and Flask
- **Data-Driven Decision Making** for procurement
- **Scalable Architecture** for enterprise deployment

By following this guide, you can understand, modify, and extend the system to meet specific business requirements.

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Author:** MajorProject Team
