# 🚀 SANGRAHAK - AI-Powered Logistics & Inventory Management System

![System Architecture](https://img.shields.io/badge/Architecture-Full--Stack-blue)
![Status](https://img.shields.io/badge/Status-Production--Ready-success)
![License](https://img.shields.io/badge/License-MIT-green)

**SANGRAHAK** is an intelligent, enterprise-grade logistics and inventory management platform that leverages AI/ML for demand forecasting, supplier risk assessment, and real-time inventory optimization across multiple depot locations.

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Key Modules](#-key-modules)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Capabilities

- **📊 Real-Time Dashboard**: Live KPIs, sales trends, and network alerts
- **🏭 Multi-Depot Management**: Manage inventory across multiple warehouse locations
- **🤖 AI-Powered Forecasting**: ARIMA-based demand prediction with 30-day forecasts
- **⚠️ Intelligent Alerts**: Automated stock-out warnings and reorder recommendations
- **📦 Inventory Overview**: Comprehensive product tracking with AI risk indicators
- **🚚 Movement Transactions**: Complete audit trail of all stock movements
- **📈 Advanced Reports**: Exportable analytics in PDF, Excel, and CSV formats
- **🛡️ Supplier Risk Radar**: ML-based supplier performance and risk assessment
- **🔍 Stock Search & Tracking**: Real-time product location and availability

### 🧠 AI/ML Features

- **Demand Forecasting**: ARIMA time-series models for accurate sales predictions
- **Stock-Out Prediction**: Days-to-empty calculations with confidence intervals
- **Risk Scoring**: Multi-factor supplier risk assessment (delay, quality, fulfillment)
- **Reorder Optimization**: Intelligent reorder quantity recommendations
- **Anomaly Detection**: Automated identification of unusual inventory patterns

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Inventory   │  │  Risk Radar  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│              BACKEND LAYER (Node.js + Python)               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Express.js Server   │  │  Flask ML API        │        │
│  │  - Auth & Routes     │  │  - Forecasting       │        │
│  │  - Business Logic    │  │  - Risk Scoring      │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB)                     │
│  Products | Depots | Transactions | Forecasts | Alerts     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 + Vite 7.3
- **UI Components**: Lucide React (icons), Framer Motion (animations)
- **Charts**: Recharts 3.6
- **HTTP Client**: Axios 1.13
- **Routing**: React Router DOM 7.11

### Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js 5.2
- **Database**: MongoDB (Mongoose 8.20)
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Security**: Helmet, CORS, bcryptjs
- **Email**: Nodemailer 7.0
- **File Processing**: ExcelJS, PDFKit, CSV-Writer

### Backend (Python ML)
- **Framework**: Flask 3.1
- **ML Libraries**: 
  - XGBoost 3.0 (classification)
  - Scikit-learn 1.6 (preprocessing, models)
  - Statsmodels 0.14 (ARIMA forecasting)
- **Data Processing**: Pandas 2.2, NumPy 2.1
- **Database**: PyMongo 4.15

### Database
- **Primary**: MongoDB Atlas (Cloud)
- **Caching**: Redis (optional)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **Python** (v3.11 or higher)
- **MongoDB** (Atlas account or local instance)
- **Git**
- **npm** or **yarn**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ShewaleParth/MajorProject.git
cd MajorProject
```

### 2. Install Frontend Dependencies

```bash
cd Frontend
npm install
```

### 3. Install Backend (Node.js) Dependencies

```bash
cd ../Backend/server
npm install
```

### 4. Install Python Dependencies

```bash
cd ../..
pip install -r requirements.txt
```

### 5. Set Up Environment Variables

Create a `.env` file in the root directory and `Backend/server/` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sangrahak?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# API Ports
NODE_PORT=3000
PYTHON_PORT=5001
```

### 6. Train ML Models (Required for Risk Radar)

```bash
cd Backend/supplier_intelligence
python train_all_models.py
```

This will create three ML model files:
- `delay_risk_model.pkl`
- `quality_risk_model.pkl`
- `fulfillment_risk_model.pkl`

---

## ▶️ Running the Application

### Option 1: Run All Services (Recommended)

From the project root directory:

```bash
# Windows
.\start-all.ps1

# Linux/Mac
./start-all.sh
```

### Option 2: Run Services Individually

**Terminal 1 - Frontend:**
```bash
cd Frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

**Terminal 2 - Node.js Backend:**
```bash
cd Backend/server
node server.js
```
Backend will run on: `http://localhost:3000`

**Terminal 3 - Python ML API:**
```bash
cd Backend/code
python app.py
```
ML API will run on: `http://localhost:5001`

---

## 📁 Project Structure

```
MajorProject/
├── Frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (Dashboard, Inventory, etc.)
│   │   ├── context/            # React Context for state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── styles/             # CSS stylesheets
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   └── package.json
│
├── Backend/
│   ├── server/                 # Node.js Express backend
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API route handlers
│   │   ├── middleware/         # Authentication, validation
│   │   ├── services/           # Business logic
│   │   ├── config/             # Configuration files
│   │   └── server.js           # Main server file
│   │
│   ├── code/                   # Python ML backend
│   │   └── app.py              # Flask ML API
│   │
│   └── supplier_intelligence/  # Supplier risk assessment
│       ├── models/             # Trained ML models (.pkl files)
│       ├── train_*.py          # Model training scripts
│       └── risk_score_engine.py
│
├── Dataset/                    # CSV data files
├── Models/                     # Pre-trained ML models
├── requirements.txt            # Python dependencies
├── package.json                # Root package.json
└── README.md                   # This file
```

---

## 🔑 Key Modules

### 1. Dashboard
- Real-time KPI tracking
- Sales trend visualization
- Active network alerts
- Depot-wise performance metrics

### 2. Inventory Overview
- Complete product catalog
- AI-driven risk indicators
- Stock-out predictions
- Reorder recommendations
- Bulk CSV upload

### 3. Depot Management
- Multi-location inventory tracking
- Depot-specific stock levels
- Inter-depot transfers
- Capacity monitoring

### 4. Forecasting Analysis / Supplier Risk Radar
- ML-based supplier risk scoring
- Delay, quality, and fulfillment metrics
- Historical performance trends
- AI-generated corrective action plans

### 5. Movement Transactions
- Complete audit trail
- Stock-in/Stock-out tracking
- Transfer history
- User activity logs

### 6. Reports
- Customizable date ranges
- Export to PDF, Excel, CSV
- Inventory snapshots
- Performance analytics

---

## 🌐 API Documentation

### Node.js Backend Endpoints

#### Authentication
```
POST   /api/auth/signup          # User registration
POST   /api/auth/login           # User login
POST   /api/auth/forgot-password # Password reset
POST   /api/auth/verify-otp      # OTP verification
```

#### Products
```
GET    /api/products             # Get all products
GET    /api/products/:id         # Get product by ID
POST   /api/products             # Create new product
PUT    /api/products/:id         # Update product
DELETE /api/products/:id         # Delete product
POST   /api/products/bulk-upload # CSV bulk upload
```

#### Depots
```
GET    /api/depots               # Get all depots
GET    /api/depots/:id           # Get depot details
POST   /api/depots               # Create depot
PUT    /api/depots/:id           # Update depot
```

#### Transactions
```
GET    /api/transactions         # Get all transactions
POST   /api/transactions         # Create transaction
GET    /api/transactions/depot/:id # Get depot transactions
```

#### Alerts
```
GET    /api/alerts               # Get all alerts
POST   /api/alerts               # Create alert
PUT    /api/alerts/:id           # Mark as read
```

### Python ML API Endpoints

#### Forecasting
```
GET    /api/health               # Health check
GET    /api/ml/products          # Get available products
POST   /api/ml/predict/custom    # Generate forecast
POST   /api/ml/scenario-planning # What-if analysis
```

#### Supplier Risk
```
GET    /api/supplier/risk-overview      # Get all suppliers with risk scores
POST   /api/supplier/predict-risk       # Predict risk for new order
GET    /api/supplier/history/:name      # Get supplier history
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_here` |
| `NODE_PORT` | Node.js server port | `3000` |
| `PYTHON_PORT` | Python ML API port | `5001` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_USER` | SMTP email address | - |
| `EMAIL_PASS` | SMTP password | - |
| `REDIS_URL` | Redis connection URL | - |

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Solution**: Ensure both Node.js and Python backends are running. Check CORS settings in `app.py` and `server.js`.

### Issue: Risk Radar showing 0 scores

**Solution**: Train the ML models first:
```bash
cd Backend/supplier_intelligence
python train_all_models.py
```

### Issue: MongoDB connection error

**Solution**: 
1. Check your `MONGODB_URI` in `.env`
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify network connectivity

### Issue: Models not loading

**Solution**: Ensure the `models/` directory exists in `Backend/supplier_intelligence/` and contains the three `.pkl` files.

### Issue: Port already in use

**Solution**: 
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5001 | xargs kill -9
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Parth Shewale** - [@ShewaleParth](https://github.com/ShewaleParth)

For questions or support, please contact:
- **Email**: sparth7972@gmail.com
- **GitHub**: [@ShewaleParth](https://github.com/ShewaleParth)

---

## 🙏 Acknowledgments

- MongoDB Atlas for cloud database hosting
- React and Vite teams for excellent frontend tools
- Scikit-learn and XGBoost communities for ML libraries
- All open-source contributors

---

## 📞 Support

For support, email your_email@example.com or open an issue in the GitHub repository.

---

<div align="center">

**Made with ❤️ for efficient logistics management**

[⬆ Back to Top](#-sangrahak---ai-powered-logistics--inventory-management-system)

</div>
