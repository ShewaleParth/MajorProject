# Supplier Risk Radar - Technical Specification

## Document Information

**Project:** Supply Chain Intelligence Platform  
**Module:** Supplier Risk Radar  
**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## 1. Executive Summary

The Supplier Risk Radar is an AI-powered module that provides real-time risk assessment and predictive analytics for supplier performance monitoring. It uses machine learning to analyze historical transaction data and generate actionable insights for procurement decisions.

### Key Capabilities
- Real-time risk scoring for 25+ suppliers
- Multi-dimensional risk assessment (Delay, Quality, Fulfillment)
- Historical trend analysis with visual charts
- Predictive analytics for future orders
- Search and filter functionality
- Detailed supplier drill-down views

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React.js | 18.x | UI Components |
| Charting | Recharts | 2.x | Data Visualization |
| Icons | Lucide React | Latest | UI Icons |
| Backend | Flask | 2.x | REST API Server |
| ML Framework | Scikit-learn | 1.3+ | Model Training |
| Data Processing | Pandas | 2.x | Data Manipulation |
| Numerical | NumPy | 1.24+ | Array Operations |
| Serialization | Pickle | Built-in | Model Persistence |

### 2.2 Architecture Pattern

**Pattern:** Three-Tier Architecture
- **Presentation Layer:** React components
- **Business Logic Layer:** Flask API + Risk Engine
- **Data Layer:** CSV files (can be replaced with database)

### 2.3 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
├─────────────────────────────────────────────────────────┤
│  SupplierRadar.jsx  │  SupplierDetail.jsx  │ riskApi.js │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP/REST
┌───────────────────▼─────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
├─────────────────────────────────────────────────────────┤
│  supplier_routes.py  │  risk_score_engine.py            │
│  (Flask Blueprint)   │  (ML Inference)                  │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                      DATA LAYER                          │
├─────────────────────────────────────────────────────────┤
│  processed_supplier_data.csv  │  3 x ML Models (.pkl)   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### 3.1 Raw Transaction Schema

**File:** `supplier_transactions.csv`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| order_id | String | Unique order identifier | ORD-1000 |
| supplier | String | Supplier company name | Apex Logistics |
| category | String | Product category | Electronics |
| order_date | Date | Order placement date | 2023-06-15 |
| promised_date | Date | Promised delivery date | 2023-06-25 |
| actual_date | Date | Actual delivery date | 2023-06-28 |
| ordered_qty | Integer | Quantity ordered | 500 |
| delivered_qty | Integer | Quantity delivered | 475 |
| rejected_qty | Integer | Quantity rejected | 12 |
| base_price | Float | Base unit price | 50.00 |
| actual_price | Float | Actual unit price | 52.50 |
| complaints | Integer | Number of complaints | 0 or 1 |
| payment_status | String | Payment status | On-Time, Delayed, Under Review |

**Data Volume:** 1000 rows (expandable)

### 3.2 Processed Features Schema

**File:** `processed_supplier_data.csv`

Includes all raw columns plus:

| Feature | Type | Calculation | Range |
|---------|------|-------------|-------|
| delay_days | Integer | actual_date - promised_date | 0-15 |
| fulfillment_ratio | Float | delivered_qty / ordered_qty | 0.0-1.0 |
| rejection_ratio | Float | rejected_qty / delivered_qty | 0.0-1.0 |
| price_deviation | Float | (actual_price - base_price) / base_price | -0.05 to 0.15 |
| delay_trend | Float | Rolling 3-order average delay | 0-15 |
| complaint_frequency | Integer | Rolling 5-order complaint sum | 0-5 |
| payment_risk | Integer | Encoded payment status | 0, 1, 2 |

### 3.3 ML Model Input Features

**Feature Vector:** `[supplier_id, category_id, ordered_qty, base_price, payment_risk]`

| Feature | Type | Encoding | Example |
|---------|------|----------|---------|
| supplier_id | Integer | LabelEncoder | 0-24 |
| category_id | Integer | LabelEncoder | 0-7 |
| ordered_qty | Integer | Raw value | 100-1000 |
| base_price | Float | Raw value | 10-100 |
| payment_risk | Integer | Mapped value | 0, 1, 2 |

---

## 4. Machine Learning Models

### 4.1 Model Architecture

**Algorithm:** Random Forest Regressor  
**Implementation:** `sklearn.ensemble.RandomForestRegressor`  
**Number of Models:** 3 (independent)

#### Model 1: Delay Risk Predictor

| Parameter | Value | Justification |
|-----------|-------|---------------|
| n_estimators | 100 | Balance between accuracy and speed |
| random_state | 42 | Reproducibility |
| Target Variable | delay_days | Continuous (0-15 days) |
| Evaluation Metric | MSE | Regression task |

**Output:** Predicted delay in days

#### Model 2: Quality Risk Predictor

| Parameter | Value | Justification |
|-----------|-------|---------------|
| n_estimators | 100 | Consistent with other models |
| random_state | 42 | Reproducibility |
| Target Variable | rejection_ratio | Continuous (0.0-1.0) |
| Evaluation Metric | MSE | Regression task |

**Output:** Predicted rejection ratio

#### Model 3: Fulfillment Risk Predictor

| Parameter | Value | Justification |
|-----------|-------|---------------|
| n_estimators | 100 | Consistent with other models |
| random_state | 42 | Reproducibility |
| Target Variable | fulfillment_ratio | Continuous (0.0-1.0) |
| Evaluation Metric | MSE | Regression task |

**Output:** Predicted fulfillment ratio

### 4.2 Risk Score Calculation

**Formula:**
```
delay_score = min(max(predicted_delay * 6.6, 0), 100)
quality_score = min(max(predicted_rejection * 1000, 0), 100)
fulfillment_score = min(max((1 - predicted_fulfillment) * 500, 0), 100)

final_risk_score = (delay_score * 0.4) + (quality_score * 0.3) + (fulfillment_score * 0.3)
```

**Normalization Rationale:**
- Delay: 15 days → 100 score (6.6 multiplier)
- Quality: 10% rejection → 100 score (1000 multiplier)
- Fulfillment: 80% fulfillment → 100 score (500 multiplier)

**Weighting Rationale:**
- Delay (40%): Most critical for supply chain continuity
- Quality (30%): Impacts production and customer satisfaction
- Fulfillment (30%): Affects inventory planning

### 4.3 Risk Classification

| Risk Level | Score Range | Color Code | Action |
|------------|-------------|------------|--------|
| Low | 0-40 | Green (#10b981) | Monitor normally |
| Medium | 41-70 | Yellow (#f59e0b) | Increase monitoring |
| High | 71-100 | Red (#ef4444) | Immediate action required |

---

## 5. API Specification

### 5.1 Base URL

```
http://localhost:5000/api/supplier
```

### 5.2 Endpoints

#### Endpoint 1: Get Risk Overview

**Route:** `GET /risk-overview`

**Description:** Retrieve aggregated risk scores for all suppliers

**Request:**
```http
GET /api/supplier/risk-overview HTTP/1.1
Host: localhost:5000
```

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

**Status Codes:**
- 200: Success
- 404: No data available
- 500: Server error

---

#### Endpoint 2: Predict Risk

**Route:** `POST /predict-risk`

**Description:** Calculate risk for a specific order scenario

**Request:**
```http
POST /api/supplier/predict-risk HTTP/1.1
Host: localhost:5000
Content-Type: application/json

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

**Validation Rules:**
- `supplier`: Required, string
- `category`: Optional, defaults to "Electronics"
- `qty`: Optional, defaults to 100, must be > 0
- `price`: Optional, defaults to 50, must be > 0
- `payment_risk`: Optional, defaults to 0, must be 0, 1, or 2

**Status Codes:**
- 200: Success
- 400: Invalid input
- 500: Server error

---

#### Endpoint 3: Get Supplier History

**Route:** `GET /history/<supplier_name>`

**Description:** Retrieve historical performance trend for a supplier

**Request:**
```http
GET /api/supplier/history/Apex%20Logistics HTTP/1.1
Host: localhost:5000
```

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
    },
    {
      "date": "2023-07-20",
      "delay": 5,
      "rejection": 4.2,
      "fulfillment": 92.0
    }
  ]
}
```

**Parameters:**
- `supplier_name`: URL-encoded supplier name

**Status Codes:**
- 200: Success
- 404: Supplier not found
- 500: Server error

---

## 6. Frontend Components

### 6.1 SupplierRadar Component

**File:** `SupplierRadar.jsx`

**Purpose:** Main table view displaying all suppliers

**Props:** None (root component)

**State:**
```javascript
{
  suppliers: Array<Supplier>,      // List of all suppliers
  loading: boolean,                 // Loading state
  searchTerm: string,               // Search filter
  selectedSupplier: Supplier | null // Selected for detail view
}
```

**Lifecycle:**
1. Mount → Fetch data from `/risk-overview`
2. User types in search → Filter suppliers
3. User clicks row → Open detail modal
4. User clicks refresh → Reload data

**Key Features:**
- Real-time search filtering
- Color-coded risk indicators
- Sortable columns (future enhancement)
- Responsive design

---

### 6.2 SupplierDetail Component

**File:** `SupplierDetail.jsx`

**Purpose:** Modal showing detailed supplier analytics

**Props:**
```javascript
{
  supplier: {
    supplier: string,
    category: string,
    avg_delay: number,
    avg_fulfillment: number,
    avg_rejection: number,
    risk_score: number,
    risk_level: string
  },
  onClose: () => void
}
```

**State:**
```javascript
{
  history: Array<{
    date: string,
    delay: number,
    rejection: number,
    fulfillment: number
  }>,
  loading: boolean
}
```

**Lifecycle:**
1. Mount → Fetch history from `/history/{name}`
2. Render chart with Recharts
3. User clicks close → Call onClose callback

**Chart Configuration:**
- Type: Line Chart
- X-Axis: Date (hidden for space)
- Y-Axis: Metric values
- Lines:
  - Rejection (red, #ef4444)
  - Delay (orange, #f59e0b)
  - Fulfillment (green, #10b981)

---

### 6.3 API Client

**File:** `riskApi.js`

**Purpose:** Centralized API communication

**Methods:**

```javascript
export const riskApi = {
  // Get all suppliers with risk scores
  getRiskOverview: async () => Promise<ApiResponse>,
  
  // Get historical trend for specific supplier
  getSupplierHistory: async (supplierName: string) => Promise<ApiResponse>,
  
  // Predict risk for custom scenario
  predictRisk: async (data: PredictionRequest) => Promise<ApiResponse>
};
```

**Error Handling:**
- Network errors: Caught and logged
- API errors: Returned in response object
- Timeout: 30 seconds (default fetch timeout)

---

## 7. Data Flow

### 7.1 Initial Load Sequence

```
User opens page
    ↓
SupplierRadar mounts
    ↓
loadData() called
    ↓
riskApi.getRiskOverview()
    ↓
GET /api/supplier/risk-overview
    ↓
Backend loads processed_supplier_data.csv
    ↓
For each supplier:
    - Calculate averages
    - Run through Risk Score Engine
    - Aggregate results
    ↓
Return JSON response
    ↓
Frontend updates suppliers state
    ↓
Table renders with data
```

### 7.2 Detail View Sequence

```
User clicks supplier row
    ↓
setSelectedSupplier(supplier)
    ↓
SupplierDetail modal opens
    ↓
Component mounts
    ↓
riskApi.getSupplierHistory(name)
    ↓
GET /api/supplier/history/{name}
    ↓
Backend filters CSV by supplier
    ↓
Returns last 10 orders
    ↓
Frontend updates history state
    ↓
Recharts renders line chart
```

### 7.3 Prediction Sequence

```
User submits prediction form
    ↓
riskApi.predictRisk(data)
    ↓
POST /api/supplier/predict-risk
    ↓
Backend receives request
    ↓
Risk Score Engine:
    - Encode supplier & category
    - Prepare feature vector
    - Run through 3 ML models
    - Calculate weighted score
    ↓
Return prediction result
    ↓
Frontend displays result
```

---

## 8. Performance Specifications

### 8.1 Response Time Requirements

| Operation | Target | Maximum |
|-----------|--------|---------|
| Risk Overview API | < 500ms | 1000ms |
| Supplier History API | < 300ms | 500ms |
| Risk Prediction API | < 200ms | 400ms |
| Frontend Initial Load | < 2s | 3s |
| Modal Open | < 100ms | 200ms |

### 8.2 Scalability

**Current Capacity:**
- Suppliers: 25 (demo)
- Transactions: 1000
- Concurrent Users: 10

**Production Capacity (with optimization):**
- Suppliers: 1000+
- Transactions: 100,000+
- Concurrent Users: 100+

**Optimization Strategies:**
- Database migration (PostgreSQL/MongoDB)
- Redis caching for aggregated data
- Pagination for large datasets
- WebSocket for real-time updates

### 8.3 Resource Usage

**Backend:**
- Memory: ~200MB (with models loaded)
- CPU: < 5% idle, < 30% under load
- Disk: ~5MB (models + data)

**Frontend:**
- Bundle Size: ~500KB (minified)
- Memory: ~50MB per session
- Initial Load: ~1MB transferred

---

## 9. Security Considerations

### 9.1 Current Implementation

- No authentication (development mode)
- No input sanitization
- No rate limiting
- CORS enabled for all origins

### 9.2 Production Requirements

**Authentication:**
- JWT token-based authentication
- Role-based access control (Admin, Analyst, Viewer)

**Input Validation:**
- Sanitize all user inputs
- Validate supplier names against whitelist
- Limit numeric inputs to reasonable ranges

**API Security:**
- Rate limiting: 100 requests/minute per IP
- HTTPS only
- CORS restricted to known origins
- API key for external integrations

**Data Security:**
- Encrypt sensitive data at rest
- Secure model files (prevent tampering)
- Audit logging for all predictions

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Backend:**
- Test each ML model prediction
- Test risk score calculation
- Test data preprocessing functions
- Test API endpoint responses

**Frontend:**
- Test component rendering
- Test search filtering logic
- Test API client methods
- Test modal open/close

### 10.2 Integration Tests

- End-to-end data flow (data generation → UI display)
- API endpoint integration
- Model loading and inference
- Error handling scenarios

### 10.3 Performance Tests

- Load testing with 100 concurrent users
- Stress testing with 10,000 suppliers
- Memory leak detection
- Response time monitoring

---

## 11. Deployment

### 11.1 Development Environment

```bash
# Backend
cd d:\Major\Backend\code
python app.py

# Frontend
cd d:\Major\Frontend
npm run dev
```

### 11.2 Production Deployment

**Backend (Flask):**
```bash
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Frontend (React):**
```bash
# Build production bundle
npm run build

# Serve with nginx or similar
```

**Environment Variables:**
```bash
FLASK_ENV=production
FLASK_DEBUG=0
MODEL_PATH=/path/to/models
DATA_PATH=/path/to/data
```

---

## 12. Maintenance

### 12.1 Model Retraining

**Frequency:** Monthly or when data drift detected

**Process:**
1. Collect new transaction data
2. Merge with existing data
3. Run `supplier_data_loader.py`
4. Retrain all 3 models
5. Validate predictions
6. Deploy new models

### 12.2 Data Updates

**Frequency:** Daily (in production)

**Process:**
1. Export new transactions from ERP
2. Append to `supplier_transactions.csv`
3. Run data processor
4. Restart backend to reload data

### 12.3 Monitoring

**Metrics to Track:**
- API response times
- Prediction accuracy
- Error rates
- User engagement
- Model drift

---

## 13. Future Enhancements

### Phase 2 Features
- Real-time alerts via WebSocket
- Email notifications for high-risk suppliers
- Comparative supplier analysis
- Export reports (PDF/Excel)

### Phase 3 Features
- Integration with SAP/Oracle ERP
- Multi-currency support
- Geopolitical risk factors
- Sustainability scoring
- Automated supplier recommendations

---

## 14. Glossary

| Term | Definition |
|------|------------|
| Risk Score | Composite score (0-100) indicating supplier reliability |
| Delay Risk | Likelihood of late delivery |
| Quality Risk | Likelihood of product rejection |
| Fulfillment Risk | Likelihood of incomplete delivery |
| LabelEncoder | Scikit-learn tool for encoding categorical variables |
| Random Forest | Ensemble ML algorithm using decision trees |
| Blueprint | Flask pattern for modular routing |

---

## 15. References

- Scikit-learn Documentation: https://scikit-learn.org
- Flask Documentation: https://flask.palletsprojects.com
- React Documentation: https://react.dev
- Recharts Documentation: https://recharts.org

---

**Document Version:** 1.0  
**Approved By:** Development Team  
**Next Review:** Q2 2026
