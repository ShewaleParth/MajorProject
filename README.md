# 🚀 AI-Powered Inventory Management System

> **Intelligent Stock Management with Real-Time Forecasting, Multi-Depot Tracking, and Supplier Risk Analysis**

A comprehensive full-stack inventory management platform that leverages Machine Learning and AI to optimize stock levels, predict demand, manage multiple warehouses, and assess supplier reliability in real-time.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [ML Models](#-ml-models)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 📊 Core Inventory Management
- **Multi-Depot Support**: Manage inventory across multiple warehouses/depots
- **Real-Time Stock Tracking**: Live updates on stock levels with WebSocket integration
- **Product Management**: Complete CRUD operations with SKU generation
- **Transaction History**: Track all stock movements (stock-in, stock-out, transfers)
- **Bulk CSV Upload**: Import products and assign to depots via CSV
- **Custom Product Images**: Upload and manage product images

### 🤖 AI & Machine Learning
- **Demand Forecasting**: ARIMA-based 30-day sales predictions
- **Stock Status Prediction**: XGBoost model for stock level classification
- **Priority Prediction**: AI-driven reorder priority recommendations
- **Supplier Risk Scoring**: ML-powered supplier reliability analysis
- **Scenario Planning**: What-if analysis for demand changes
- **AI Insights**: Automated recommendations for reorder points

### 📈 Analytics & Reporting
- **Interactive Dashboard**: Real-time KPIs and visualizations
- **Inventory Overview**: Stock distribution across depots
- **Transaction Analytics**: Daily trends and depot activity
- **Low Stock Alerts**: Automated notifications for reorder points
- **Custom Reports**: Generate PDF/Excel reports
- **Forecast Visualization**: Interactive charts for demand predictions

### 🔔 Alerts & Notifications
- **Email Notifications**: Automated alerts for critical stock levels
- **Real-Time Alerts**: WebSocket-based instant notifications
- **Custom Alert Rules**: Configure thresholds per product
- **Alert History**: Track all past notifications

### 🏢 Multi-User Support
- **User Authentication**: JWT-based secure login
- **Role-Based Access**: Admin and user roles
- **User-Specific Data**: Isolated inventory per user account
- **Session Management**: Secure token-based sessions

---

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **React Router v7** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend (Node.js)
- **Express 5** - Web framework
- **MongoDB** - NoSQL database (Mongoose ODM)
- **Socket.IO** - Real-time WebSocket communication
- **Redis (Upstash)** - Caching and session management
- **JWT** - Authentication
- **Nodemailer** - Email notifications
- **Bull** - Background job queue
- **ExcelJS & PDFKit** - Report generation

### AI/ML Services (Python)
- **Flask** - Python web framework
- **XGBoost** - Gradient boosting for classification
- **ARIMA (statsmodels)** - Time series forecasting
- **Scikit-learn** - ML preprocessing and utilities
- **Pandas & NumPy** - Data manipulation
- **PyMongo** - MongoDB integration
- **Groq API** - AI-powered insights

### DevOps & Tools
- **Git** - Version control
- **PowerShell** - Automation scripts
- **dotenv** - Environment management

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                    http://localhost:5173                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──────────────────────────────────────┐
                     │                                      │
┌────────────────────▼──────────────┐   ┌─────────────────▼──────────────┐
│   Node.js Backend (Express)       │   │  Python AI Service (Flask)     │
│   http://localhost:5000           │   │  http://localhost:5001         │
│                                   │   │                                │
│  • REST API                       │   │  • Demand Forecasting (ARIMA)  │
│  • Authentication (JWT)           │   │  • Stock Prediction (XGBoost)  │
│  • WebSocket (Socket.IO)          │   │  • Supplier Risk Scoring       │
│  • Email Notifications            │   │  • Scenario Planning           │
│  • Report Generation              │   │  • AI Insights (Groq)          │
└────────────────────┬──────────────┘   └─────────────────┬──────────────┘
                     │                                    │
                     ├────────────────────────────────────┤
                     │                                    │
         ┌───────────▼──────────┐           ┌────────────▼────────────┐
         │   MongoDB Atlas      │           │   Redis (Upstash)       │
         │   (Database)         │           │   (Cache & Queue)       │
         └──────────────────────┘           └─────────────────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **Redis (Upstash) Account** - [Sign Up](https://upstash.com/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/inventory-management-system.git
cd inventory-management-system
```

### 2. Install Backend Dependencies

```bash
cd Backend/server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../../Frontend
npm install
```

### 4. Install Python Dependencies

```bash
cd ../Backend/code
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Backend Environment Variables

Create a `.env` file in `Backend/server/`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Redis Configuration (Upstash)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
UPSTASH_REDIS_REST_URL=https://your-redis-host.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Groq API (for AI insights)
GROQ_API_KEY=your-groq-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Reports Directory
REPORTS_DIR=./reports
```

### 2. Python Environment Variables

The Python service uses the same `.env` file from `Backend/server/.env`.

### 3. Frontend Configuration

Update API endpoints in `Frontend/src/utils/api.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const AI_API_BASE_URL = 'http://localhost:5001/api';
```

---

## 🏃 Running the Application

### Option 1: Start All Services (Recommended)

Use the PowerShell script to start all services at once:

```powershell
# From the root directory
.\start-all.ps1
```

This will start:
- Python AI Service (Port 5001)
- Node.js Backend (Port 5000)
- React Frontend (Port 5173)

### Option 2: Start Services Individually

#### 1. Start Python AI Service

```bash
cd Backend/code
python app.py
```

**Expected Output:**
```
✓ Connected to MongoDB Database: your-db-name
✓ Loaded ML model from JSON
✓ Loaded label encoders
 * Running on http://127.0.0.1:5001
```

#### 2. Start Node.js Backend

```bash
cd Backend/server
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
🔍 Health check: http://localhost:5000/api/health
📡 API Base URL: http://localhost:5000/api
🌍 Environment: development
```

#### 3. Start React Frontend

```bash
cd Frontend
npm run dev
```

**Expected Output:**
```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **AI Service**: http://localhost:5001/api
- **Health Check**: http://localhost:5000/api/health

---

## 📁 Project Structure

```
inventory-management-system/
├── Backend/
│   ├── code/                          # Python AI Service
│   │   ├── app.py                     # Flask server (forecasting)
│   │   ├── Predicting.py              # Prediction logic
│   │   ├── ai_assistant.py            # AI insights
│   │   ├── requirements.txt           # Python dependencies
│   │   └── start-ai.ps1               # AI service startup
│   │
│   ├── server/                        # Node.js Backend
│   │   ├── config/                    # Configuration files
│   │   │   ├── database.js            # MongoDB connection
│   │   │   ├── redis.js               # Redis connection
│   │   │   └── env.js                 # Environment validation
│   │   ├── middleware/                # Express middleware
│   │   │   ├── auth.js                # JWT authentication
│   │   │   └── errorHandler.js        # Error handling
│   │   ├── models/                    # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Depot.js
│   │   │   ├── Transaction.js
│   │   │   ├── Forecast.js
│   │   │   ├── Alert.js
│   │   │   └── Report.js
│   │   ├── routes/                    # API routes
│   │   │   ├── auth.js                # Authentication
│   │   │   ├── products.js            # Product management
│   │   │   ├── depots.js              # Depot management
│   │   │   ├── transactions.js        # Stock movements
│   │   │   ├── forecasts.js           # Forecast data
│   │   │   ├── dashboard.js           # Dashboard metrics
│   │   │   ├── reports.js             # Report generation
│   │   │   └── alert.js               # Alert management
│   │   ├── services/                  # Business logic
│   │   │   └── emailService.js        # Email notifications
│   │   ├── utils/                     # Utility functions
│   │   │   ├── skuGenerator.js
│   │   │   ├── alertHelpers.js
│   │   │   └── websocket.js
│   │   ├── server.js                  # Main server file
│   │   ├── package.json
│   │   └── .env
│   │
│   └── supplier_intelligence/         # ML Models
│       ├── models/                    # Trained models
│       ├── risk_score_engine.py       # Risk scoring
│       ├── supplier_routes.py         # Supplier API
│       ├── train_delay_risk.py
│       ├── train_fulfilment_risk.py
│       └── train_quality_risk.py
│
├── Frontend/                          # React Application
│   ├── src/
│   │   ├── components/                # Reusable components
│   │   │   ├── AddTransactionModal.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── SupplierRiskRadar/
│   │   ├── pages/                     # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── MovementTransactions.jsx
│   │   │   ├── Forecasting.jsx
│   │   │   ├── SupplierRisk.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Depots.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useDashboardData.js
│   │   │   └── useInventoryData.js
│   │   ├── context/                   # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/                     # Utility functions
│   │   │   └── api.js                 # API client
│   │   ├── styles/                    # Component styles
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── Dataset/                           # Sample data
├── start-all.ps1                      # Start all services
└── README.md
```

---

## 📡 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Products

#### Get All Products
```http
GET /api/products
Authorization: Bearer <token>
```

#### Create Product
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "category": "Electronics",
  "stock": 100,
  "reorderPoint": 20,
  "supplier": "Supplier Name",
  "price": 99.99
}
```

#### Bulk Upload via CSV
```http
POST /api/products/bulk-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: products.csv
```

### Transactions

#### Stock In
```http
POST /api/transactions/stock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id",
  "depotId": "depot-id",
  "quantity": 50,
  "reason": "Purchase Order"
}
```

#### Stock Out
```http
POST /api/transactions/stock-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id",
  "depotId": "depot-id",
  "quantity": 20,
  "reason": "Sale"
}
```

#### Transfer Between Depots
```http
POST /api/transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id",
  "fromDepotId": "depot-1-id",
  "toDepotId": "depot-2-id",
  "quantity": 30,
  "reason": "Rebalancing"
}
```

### Forecasting (Python AI Service)

#### Generate Forecast
```http
POST /api/ml/predict/custom
Content-Type: application/json

{
  "sku": "PROD-001",
  "productName": "Product Name",
  "userId": "user-id",
  "currentStock": 100,
  "dailySales": 5,
  "weeklySales": 35,
  "reorderLevel": 20,
  "leadTime": 7,
  "forecastDays": 30
}
```

### Supplier Risk

#### Predict Supplier Risk
```http
POST /api/supplier/predict-risk
Content-Type: application/json

{
  "supplier": "Supplier Name",
  "category": "Electronics",
  "qty": 100,
  "price": 50
}
```

---

## 🤖 ML Models

### 1. Stock Status Prediction (XGBoost)
- **Purpose**: Classify stock levels (In Stock, Low Stock, Out of Stock, Overstock)
- **Features**: Current stock, daily sales, weekly sales, reorder level, lead time, brand, category, location
- **Model**: XGBoost Classifier
- **Location**: `Backend/code/Models/ml_stock_priority_model.json`

### 2. Demand Forecasting (ARIMA)
- **Purpose**: Predict future sales for next 30 days
- **Method**: ARIMA (AutoRegressive Integrated Moving Average)
- **Features**: Historical sales patterns, seasonality, trend
- **Fallback**: Exponential smoothing if ARIMA fails

### 3. Supplier Risk Scoring
- **Purpose**: Assess supplier reliability
- **Models**: 
  - Delay Risk Predictor
  - Fulfillment Risk Predictor
  - Quality Risk Predictor
- **Location**: `Backend/supplier_intelligence/models/`

---

## 🎯 Workflow

### 1. User Registration & Login
1. User registers with email and password
2. System creates user account and default depots
3. User logs in and receives JWT token
4. Token is stored in localStorage for subsequent requests

### 2. Product Management
1. Add products manually or via CSV upload
2. Products are automatically assigned to depots
3. SKUs are auto-generated if not provided
4. Product images can be uploaded

### 3. Stock Transactions
1. Select product from inventory
2. Choose transaction type (Stock In, Stock Out, Transfer)
3. Select depot(s) and enter quantity
4. System updates:
   - Product stock levels
   - Depot inventory
   - Transaction history
   - Alerts if stock is low

### 4. Demand Forecasting
1. Navigate to Forecasting page
2. Select product
3. System fetches product data
4. Python AI service generates 30-day forecast using ARIMA
5. Results displayed with:
   - Predicted daily demand
   - Stock-out date prediction
   - Reorder recommendations
   - Confidence intervals

### 5. Supplier Risk Analysis
1. Navigate to Supplier Risk page
2. View all suppliers with risk scores
3. Click on supplier for detailed analysis
4. System shows:
   - Risk score (0-100)
   - Historical performance
   - Delay trends
   - Quality metrics

### 6. Reports & Analytics
1. Navigate to Reports page
2. Select report type (Inventory, Transactions, Forecasts)
3. Choose date range and filters
4. Generate report in PDF or Excel format
5. Download or email report

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password encryption
- **CORS Protection**: Configured CORS policies
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Joi schema validation
- **Environment Variables**: Sensitive data in .env files
- **Helmet.js**: Security headers

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB URI in .env
# Ensure IP is whitelisted in MongoDB Atlas
# Verify network connectivity
```

### Python Service Not Starting
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --upgrade

# Check port 5001 is not in use
netstat -ano | findstr :5001
```

### Frontend Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or support, please contact:
- **Email**: sparth7972@gmail.com
- **GitHub**: [@ShewaleParth](https://github.com/ShewaleParth)

---

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Upstash for Redis services
- Groq for AI API
- All open-source contributors

---

**Made with ❤️ by Your Team**
