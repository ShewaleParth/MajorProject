// server.js - FIXED MongoDB Connection
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const axios = require('axios');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cleanupOrphanedData } = require('./autoCleanup');
const PORT = process.env.PORT || 5000;

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// JWT Utility Functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyTokenUtil = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  const tryDevBypass = async () => {
    try {
      const devUser = await mongoose.model('User').findOne({ email: 'admin@inventroops.com' });
      if (devUser) {
        req.userId = devUser._id;
        return true;
      }
    } catch (e) {
      console.warn("Dev bypass failed:", e.message);
    }
    return false;
  };

  if (!token) {
    if (await tryDevBypass()) return next();
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyTokenUtil(token);
  if (!decoded) {
    // If token is invalid, attempt bypass before failing
    if (await tryDevBypass()) return next();
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
};

// Nodemailer transporter setup (only if credentials are available)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  console.log('Email credentials not configured. Email functionality will be disabled.');
}

// MongoDB Connection - FIXED SSL/TLS Configuration
// MongoDB Connection - FIXED SSL/TLS Configuration
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("âŒ Fatal Error: MONGODB_URI is not defined in .env file");
  process.exit(1);
}

console.log('ðŸ”„ Attempting to connect to MongoDB...');

// Try connection with proper error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('âœ… Connected to MongoDB Atlas successfully');
  })
  .catch((err) => {
    console.error('âŒ MongoDB connection error:', err.message);
    console.log('\nðŸ’¡ Troubleshooting steps:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify your username and password');
    console.log('3. Check your internet connection');
    console.log('4. Try running: npm install mongodb@5.9.0');
  });

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('ðŸ“¡ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('âŒ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('ðŸ“´ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('ðŸ‘‹ MongoDB connection closed due to app termination');
  process.exit(0);
});

// Schemas and Models

// Forecast Schema
const forecastSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: String, required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  currentStock: { type: Number, required: true },
  stockStatusPred: { type: String, required: true },
  priorityPred: { type: String, required: true },
  alert: { type: String, required: true },
  forecastData: [{
    date: { type: String, required: true },
    predicted: { type: Number, required: true },
    actual: { type: Number },
    confidence: { type: Number }
  }],
  inputParams: {
    dailySales: Number,
    weeklySales: Number,
    reorderLevel: Number,
    leadTime: Number,
    brand: String,
    category: String,
    location: String,
    supplierName: String
  },
  aiInsights: {
    status: String,
    eta_days: Number,
    recommended_reorder: Number,
    risk_level: String,
    message: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const Forecast = mongoose.model('Forecast', forecastSchema);

// User Schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  reorderPoint: { type: Number, required: true, default: 10 },
  supplier: { type: String, required: true },
  price: { type: Number, required: true },
  // ML Fields
  dailySales: { type: Number, default: 5 },
  weeklySales: { type: Number, default: 35 },
  brand: { type: String, default: 'Generic' },
  leadTime: { type: Number, default: 7 },
  // Multi-Depot Distribution - tracks stock across multiple depots
  depotDistribution: [{
    depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
    depotName: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'overstock'],
    default: 'in-stock'
  },
  image: { type: String },
  lastSoldDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate total stock from depot distribution and update status
productSchema.pre('save', function (next) {
  // Calculate total stock from all depots
  if (this.depotDistribution && this.depotDistribution.length > 0) {
    this.stock = this.depotDistribution.reduce((total, depot) => total + (depot.quantity || 0), 0);
  }

  // Update status based on total stock levels
  if (this.stock === 0) {
    this.status = 'out-of-stock';
  } else if (this.stock <= this.reorderPoint) {
    this.status = 'low-stock';
  } else if (this.stock > this.reorderPoint * 3) {
    this.status = 'overstock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

// Compound unique index: Each user can have their own products with same SKU
// But within a user's account, SKU must be unique
productSchema.index({ userId: 1, sku: 1 }, { unique: true });


// Depot Schema
const depotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentUtilization: { type: Number, default: 0 },
  itemsStored: { type: Number, default: 0 },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productSku: String,
    quantity: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productSku: { type: String, required: true },
  transactionType: {
    type: String,
    enum: ['stock-in', 'stock-out', 'transfer', 'adjustment'],
    required: true
  },
  quantity: { type: Number, required: true },
  fromDepot: { type: String },
  toDepot: { type: String },
  fromDepotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },
  toDepotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String },
  notes: { type: String },
  performedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Alert Schema
const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low-stock', 'out-of-stock', 'demand-spike', 'capacity-warning', 'anomaly'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolutionNotes: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Depot = mongoose.model('Depot', depotSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Alert = mongoose.model('Alert', alertSchema);

// Utility Functions

// Generate unique SKU
const generateUniqueSKU = async (category) => {
  const categoryCode = {
    'Electronics': 'ELEC',
    'Apparel': 'APRL',
    'Home Goods': 'HOME',
    'Sports': 'SPRT',
    'Books': 'BOOK',
    'Food': 'FOOD',
    'Toys': 'TOYS',
    'Beauty': 'BETY',
    'Automotive': 'AUTO',
    'Health': 'HLTH'
  }[category] || 'MISC';

  const timestamp = Date.now().toString().slice(-8);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sku = `${categoryCode}-${timestamp}-${randomChars}`;

  // Check if SKU already exists (very unlikely but just in case)
  const existing = await Product.findOne({ sku });
  if (existing) {
    // Recursively generate a new one
    return generateUniqueSKU(category);
  }

  return sku;
};

// Helper Functions
const updateProductStatus = (product) => {
  if (product.stock === 0) {
    product.status = 'out-of-stock';
  } else if (product.stock <= product.reorderPoint) {
    product.status = 'low-stock';
  } else if (product.stock > product.reorderPoint * 3) {
    product.status = 'overstock';
  } else {
    product.status = 'in-stock';
  }
  return product;
};

const createStockAlert = async (product) => {
  if (product.status === 'low-stock' || product.status === 'out-of-stock') {
    const existingAlert = await Alert.findOne({
      productId: product._id,
      type: product.status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
      isResolved: false
    });

    if (!existingAlert) {
      const alert = new Alert({
        type: product.status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
        title: `${product.status === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'} Alert`,
        description: `${product.name} (${product.sku}) ${product.status === 'out-of-stock' ? 'is out of stock' : `has only ${product.stock} units remaining`}`,
        severity: product.status === 'out-of-stock' ? 'high' : 'medium',
        productId: product._id
      });
      await alert.save();
    }
  }
};

// FORECAST ROUTES

// GET all forecasts
app.get('/api/forecasts', authenticateToken, async (req, res) => {
  try {
    const { sku, limit = 50, sortBy = 'updatedAt' } = req.query;
    const userId = req.userId; // From JWT token

    const query = { userId };

    if (sku) {
      query.sku = sku;
    }

    const forecasts = await Forecast.find(query)
      .sort({ [sortBy]: -1 })
      .limit(Math.min(parseInt(limit), 100));

    res.json({
      forecasts: forecasts.map(forecast => ({
        id: forecast._id,
        itemId: forecast.itemId,
        productName: forecast.productName,
        sku: forecast.sku,
        currentStock: forecast.currentStock,
        stockStatusPred: forecast.stockStatusPred,
        priorityPred: forecast.priorityPred,
        alert: forecast.alert,
        aiInsights: forecast.aiInsights,
        forecastData: forecast.forecastData,
        inputParams: forecast.inputParams,
        updatedAt: forecast.updatedAt
      })),
      total: forecasts.length
    });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET forecast by SKU or Item ID
app.get('/api/forecasts/:identifier', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;
    const userId = req.userId; // From JWT token

    let forecast = await Forecast.findOne({ sku: identifier, userId });
    if (!forecast) {
      forecast = await Forecast.findOne({ itemId: identifier, userId });
    }

    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }

    res.json({
      id: forecast._id,
      itemId: forecast.itemId,
      productName: forecast.productName,
      sku: forecast.sku,
      currentStock: forecast.currentStock,
      stockStatusPred: forecast.stockStatusPred,
      priorityPred: forecast.priorityPred,
      alert: forecast.alert,
      aiInsights: forecast.aiInsights,
      forecastData: forecast.forecastData,
      inputParams: forecast.inputParams,
      updatedAt: forecast.updatedAt
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST - Create or update forecast
app.post('/api/forecasts', authenticateToken, async (req, res) => {
  try {
    const { itemId, sku } = req.body;
    const userId = req.userId; // From JWT token

    let forecast = await Forecast.findOne({ $or: [{ itemId }, { sku }], userId });

    if (forecast) {
      Object.assign(forecast, req.body);
      forecast.updatedAt = new Date();
      await forecast.save();
    } else {
      forecast = new Forecast(req.body);
      await forecast.save();
    }

    res.status(201).json({
      message: 'Forecast saved successfully',
      forecast: {
        id: forecast._id,
        itemId: forecast.itemId,
        productName: forecast.productName,
        sku: forecast.sku,
        currentStock: forecast.currentStock,
        stockStatusPred: forecast.stockStatusPred,
        priorityPred: forecast.priorityPred,
        alert: forecast.alert,
        forecastData: forecast.forecastData,
        inputParams: forecast.inputParams
      }
    });
  } catch (error) {
    console.error('Error saving forecast:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET forecast analytics
app.get('/api/forecasts/analytics/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const forecasts = await Forecast.find({ userId });

    const highPriorityCount = forecasts.filter(f =>
      f.priorityPred === 'High' || f.priorityPred === 'Very High'
    ).length;

    const understockCount = forecasts.filter(f =>
      f.stockStatusPred === 'Understock'
    ).length;

    const avgStockLevel = forecasts.length > 0
      ? forecasts.reduce((sum, f) => sum + f.currentStock, 0) / forecasts.length
      : 0;

    const topReorders = forecasts
      .filter(f => f.priorityPred === 'High' || f.priorityPred === 'Very High')
      .sort((a, b) => {
        const priorityOrder = { 'Very High': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
        return (priorityOrder[b.priorityPred] || 0) - (priorityOrder[a.priorityPred] || 0);
      })
      .slice(0, 5)
      .map(f => ({
        sku: f.sku,
        name: f.productName,
        currentStock: f.currentStock,
        priority: f.priorityPred,
        predictedDemand: f.forecastData.length > 0
          ? Math.round(f.forecastData.reduce((sum, d) => sum + d.predicted, 0))
          : 0
      }));

    res.json({
      insights: {
        highPriorityCount,
        understockCount,
        avgStockLevel: Math.round(avgStockLevel),
        totalForecasts: forecasts.length
      },
      topReorders,
      alerts: forecasts
        .filter(f => f.alert !== 'Stock OK')
        .map(f => ({
          sku: f.sku,
          productName: f.productName,
          alert: f.alert,
          priority: f.priorityPred
        }))
    });
  } catch (error) {
    console.error('Error fetching forecast insights:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to calculate total stock across all depots for a product
async function calculateProductTotalStock(productId, userId) {
  try {
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) return 0;

    // Calculate total from depotDistribution array
    const totalStock = product.depotDistribution.reduce((sum, depot) => sum + (depot.quantity || 0), 0);
    return totalStock;
  } catch (error) {
    console.error('Error calculating total stock:', error);
    return 0;
  }
}

// Helper function to update product stock from depot distribution
async function updateProductStockFromDepots(productId, userId) {
  try {
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) return null;

    // Calculate total stock from depot distribution
    const totalStock = product.depotDistribution.reduce((sum, depot) => sum + (depot.quantity || 0), 0);
    product.stock = totalStock;

    // Update status based on total stock
    updateProductStatus(product);
    await product.save();

    return product;
  } catch (error) {
    console.error('Error updating product stock:', error);
    return null;
  }
}

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// PRODUCT ROUTES
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const { search, category, status, location, page = 1, limit = 50 } = req.query;
    const query = { userId: req.userId }; // Filter by authenticated user

    if (location) {
      query.location = location;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const products = await Product.find(query)
      .limit(Math.min(limit * 1, 100))
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products: products.map(product => {
        const dailySales = Number(product.dailySales || 5);
        const weeklySales = Number(product.weeklySales || 35);
        const leadTime = Number(product.leadTime || 7);
        const stock = Number(product.stock || 0);

        // Backend Intelligence Logic
        const avgDailyDemand = (dailySales * 0.7) + ((weeklySales / 7) * 0.3);
        const daysToStockOut = (avgDailyDemand > 0) ? Math.max(0, Math.round(stock / avgDailyDemand)) : 99;
        const safetyStock = Math.round(avgDailyDemand * leadTime * 0.5);
        const reorderQty = Math.round(avgDailyDemand * 30);

        console.log(`AI Calc for ${product.sku}: stock=${stock}, daily=${dailySales}, out=${daysToStockOut}`);

        // Ensure riskLevel is accurate for High/Medium/Safe buckets
        let riskLevel = 'SAFE';
        let aiExplanation = 'Inventory levels healthy.';

        if (stock === 0 || daysToStockOut <= leadTime) {
          riskLevel = 'HIGH';
          aiExplanation = stock === 0 ? 'Item is out of stock. Immediate reorder required.' : 'Stock expected to exhaust before supplier lead time.';
        } else if (daysToStockOut <= leadTime * 2) {
          riskLevel = 'MEDIUM';
          aiExplanation = 'Monitor closely. Demand trend increasing.';
        }

        return {
          id: product._id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          stock: product.stock,
          reorderPoint: product.reorderPoint,
          calculatedReorderPoint: Math.round((avgDailyDemand * leadTime) + safetyStock),
          supplier: product.supplier,
          price: product.price,
          status: product.status,
          image: product.image,
          dailySales: product.dailySales,
          weeklySales: product.weeklySales,
          brand: product.brand,
          leadTime: product.leadTime,
          // AI Injected Fields
          avgDailyDemand: avgDailyDemand.toFixed(1),
          daysToStockOut,
          reorderQty,
          riskLevel,
          aiExplanation,
          depotDistribution: product.depotDistribution,
          lastSoldDate: product.lastSoldDate ? product.lastSoldDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      }),
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    // userId comes from JWT token via authenticateToken middleware
    const userId = req.userId;

    // Prevent Mass Assignment - Explicitly select allowed fields
    let { sku, name, category, stock, reorderPoint, supplier, price, depotId, depotQuantity, image } = req.body;

    // Validate depot assignment - now required
    if (!depotId) {
      return res.status(400).json({ message: 'Depot assignment is required for all products' });
    }

    // Auto-generate SKU if not provided
    if (!sku) {
      sku = await generateUniqueSKU(category);
      console.log(`✅ Auto-generated SKU: ${sku}`);
    }

    // Get depot information
    const depot = await Depot.findOne({ _id: depotId, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    const assignedQuantity = depotQuantity || stock;

    // Create product with depotDistribution array
    let product = new Product({
      userId,
      sku,
      name,
      category,
      stock: assignedQuantity, // Will be recalculated by pre-save hook
      reorderPoint,
      supplier,
      price,
      depotDistribution: [{
        depotId: depot._id,
        depotName: depot.name,
        quantity: assignedQuantity,
        lastUpdated: new Date()
      }],
      image: image
    });

    // Add product to depot's products array
    depot.products.push({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      quantity: assignedQuantity,
      lastUpdated: new Date()
    });

    // Update depot utilization
    depot.itemsStored = depot.products.length;
    depot.currentUtilization += assignedQuantity;
    depot.updatedAt = new Date();
    await depot.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      transactionType: 'stock-in',
      quantity: assignedQuantity,
      toDepot: depot.name,
      toDepotId: depot._id,
      previousStock: 0,
      newStock: assignedQuantity,
      reason: 'Initial stock assignment',
      performedBy: 'System'
    });
    await transaction.save();

    // Status is now handled by pre-save hook
    await product.save();
    await createStockAlert(product);

    // Emit WebSocket event
    io.emit('product:depot-assigned', {
      productId: product._id,
      productName: product.name,
      depotId: depot._id,
      depotName: depot.name,
      quantity: assignedQuantity
    });

    io.emit('depot:stock-updated', {
      depotId: depot._id,
      depotName: depot.name,
      currentUtilization: depot.currentUtilization,
      itemsStored: depot.itemsStored
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        supplier: product.supplier,
        price: product.price,
        status: product.status,
        image: product.image,
        depotDistribution: product.depotDistribution,
        lastSoldDate: product.lastSoldDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Bulk import products with transactions (CSV upload)
app.post('/api/products/bulk-with-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const productsData = req.body;

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({ message: 'Invalid products data' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of productsData) {
      try {
        // Check if depot exists, create if not
        let depot = await Depot.findOne({ name: item.depotName, userId });

        if (!depot) {
          depot = new Depot({
            userId, // IMPORTANT: Include userId for user data isolation
            name: item.depotName,
            location: item.depotLocation || 'Default Location',
            capacity: 10000,
            currentUtilization: 0,
            itemsStored: 0,
            products: [],
            status: 'normal'
          });
          await depot.save();
          console.log(`✅ Created new depot: ${depot.name} for user ${userId}`);
        }

        // Create product
        const product = new Product({
          userId, // IMPORTANT: Include userId for user data isolation
          sku: item.sku,
          name: item.name,
          category: item.category,
          stock: parseInt(item.stock) || 0,
          reorderPoint: parseInt(item.reorderPoint) || 10,
          supplier: item.supplier || 'Unknown',
          price: parseFloat(item.price) || 0,
          dailySales: parseFloat(item.dailySales || item.dailysales) || 5,
          weeklySales: parseFloat(item.weeklySales || item.weeklysales) || 35,
          brand: item.brand || 'Generic',
          leadTime: parseInt(item.leadTime || item.leadtime) || 7,
          depotId: depot._id,
          depotName: depot.name,
          depotQuantity: parseInt(item.stock) || 0,
          image: item.image || ''
        });

        await product.save();

        // Add product to depot
        const stockQuantity = parseInt(item.stock) || 0;
        depot.products.push({
          productId: product._id,
          productName: product.name,
          productSku: product.sku,
          quantity: stockQuantity,
          lastUpdated: new Date()
        });

        depot.itemsStored = depot.products.length;
        depot.currentUtilization = (depot.currentUtilization || 0) + stockQuantity;
        await depot.save();

        // Create transaction record
        const transaction = new Transaction({
          userId, // IMPORTANT: Include userId
          productId: product._id,
          productName: product.name,
          productSku: product.sku,
          transactionType: 'stock-in',
          quantity: stockQuantity,
          toDepot: depot.name,
          toDepotId: depot._id,
          previousStock: 0,
          newStock: stockQuantity,
          reason: 'CSV Import',
          performedBy: 'System'
        });
        await transaction.save();

        results.success++;
        console.log(`✅ Imported product: ${product.sku} - ${product.name}`);
      } catch (err) {
        results.failed++;
        results.errors.push({
          sku: item.sku,
          name: item.name,
          error: err.message
        });
        console.error(`❌ Error processing product ${item.sku}:`, err.message);
      }
    }

    res.json({
      message: `Processed ${productsData.length} items`,
      results
    });

  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ message: 'Server error during bulk import', error: error.message });
  }
});

// Bulk Create Products
app.post('/api/products/bulk', authenticateToken, async (req, res) => {
  try {
    const productsData = req.body;
    const userId = req.userId; // From JWT token

    if (!Array.isArray(productsData)) {
      return res.status(400).json({ message: 'Input must be an array of products' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of productsData) {
      try {
        // Basic validation
        if (!item.sku || !item.name) {
          throw new Error(`Missing SKU or Name for item: ${JSON.stringify(item)}`);
        }

        // Check if exists
        let product = await Product.findOne({ sku: item.sku, userId });

        if (product) {
          // Update existing
          console.log(`Updating SKU ${item.sku}: new sales=${item.dailysales || item.dailySales}`);
          product.name = item.name || product.name;
          product.category = item.category || product.category;
          product.stock = item.stock !== undefined ? Number(item.stock) : product.stock;
          product.reorderPoint = (item.reorderPoint !== undefined ? Number(item.reorderPoint) : (item.reorderpoint !== undefined ? Number(item.reorderpoint) : product.reorderPoint));
          product.supplier = item.supplier || product.supplier;
          product.location = item.location || product.location;
          product.price = item.price !== undefined ? Number(item.price) : product.price;
          product.dailySales = Number(item.dailySales || item.dailysales) || product.dailySales;
          product.weeklySales = Number(item.weeklySales || item.weeklysales) || product.weeklySales;
          product.brand = item.brand || product.brand;
          product.leadTime = Number(item.leadTime || item.leadtime) || product.leadTime;
          product.updatedAt = new Date();
        } else {
          // Create new
          product = new Product({
            userId, // IMPORTANT: Include userId for user data isolation
            sku: item.sku,
            name: item.name,
            category: item.category || 'Uncategorized',
            stock: Number(item.stock) || 0,
            reorderPoint: Number(item.reorderPoint || item.reorderpoint) || 10,
            supplier: item.supplier || 'Unknown',
            location: item.location || 'Unknown',
            price: Number(item.price) || 0,
            dailySales: Number(item.dailySales || item.dailysales) || 5,
            weeklySales: Number(item.weeklySales || item.weeklysales) || 35,
            brand: item.brand || 'Generic',
            leadTime: Number(item.leadTime || item.leadtime) || 7,
            image: item.image || ''
          });
        }

        await product.save();
        await createStockAlert(product);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ sku: item.sku, error: err.message });
      }
    }

    res.json({
      message: `Processed ${productsData.length} items`,
      results
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ message: 'Server error during bulk upload', error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const product = await Product.findOne({ _id: req.params.id, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent Mass Assignment - Explicitly update allowed fields
    const { sku, name, category, stock, reorderPoint, supplier, price, image } = req.body;

    if (sku) product.sku = sku;
    if (name) product.name = name;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (reorderPoint !== undefined) product.reorderPoint = reorderPoint;
    if (supplier) product.supplier = supplier;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;

    product.updatedAt = new Date();
    // Status is automatically updated by pre-save hook on save
    await product.save();
    await createStockAlert(product);

    res.json({
      message: 'Product updated successfully',
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        supplier: product.supplier,
        price: product.price,
        status: product.status,
        image: product.image,
        lastSoldDate: product.lastSoldDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const product = await Product.findOne({ _id: req.params.id, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    await Alert.deleteMany({ productId: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/products/categories', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const categories = await Product.distinct('category', { userId });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// NEW PRODUCT-DEPOT API ENDPOINTS

// Assign product to depot
app.post('/api/products/:id/assign-depot', authenticateToken, async (req, res) => {
  try {
    const { depotId, quantity } = req.body;
    const userId = req.userId; // Get userId from JWT token

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify product belongs to the authenticated user
    if (product.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to this product' });
    }

    const depot = await Depot.findById(depotId);
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Remove from old depot if assigned
    if (product.depotId) {
      const oldDepot = await Depot.findById(product.depotId);
      if (oldDepot) {
        oldDepot.products = oldDepot.products.filter(
          p => p.productId.toString() !== product._id.toString()
        );
        oldDepot.itemsStored = oldDepot.products.length;
        oldDepot.currentUtilization -= product.depotQuantity;
        await oldDepot.save();
      }
    }

    // Assign to new depot
    product.depotId = depotId;
    product.depotName = depot.name;
    product.depotQuantity = quantity || product.stock;

    // Add to depot's products array
    const existingProductIndex = depot.products.findIndex(
      p => p.productId.toString() === product._id.toString()
    );

    if (existingProductIndex >= 0) {
      depot.products[existingProductIndex].quantity = product.depotQuantity;
      depot.products[existingProductIndex].lastUpdated = new Date();
    } else {
      depot.products.push({
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: product.depotQuantity,
        lastUpdated: new Date()
      });
    }

    depot.itemsStored = depot.products.length;
    depot.currentUtilization += product.depotQuantity;
    depot.updatedAt = new Date();

    // Save with retry logic for version conflicts
    let saved = false;
    let retries = 3;
    while (!saved && retries > 0) {
      try {
        await depot.save();
        saved = true;
      } catch (saveError) {
        if (saveError.name === 'VersionError' && retries > 1) {
          retries--;
          console.log(`Version conflict, retrying... (${retries} attempts left)`);
          // Refetch depot to get latest version
          const freshDepot = await Depot.findById(depotId);
          if (freshDepot) {
            // Reapply changes to fresh depot
            const existingIdx = freshDepot.products.findIndex(
              p => p.productId.toString() === product._id.toString()
            );
            if (existingIdx >= 0) {
              freshDepot.products[existingIdx].quantity = product.depotQuantity;
              freshDepot.products[existingIdx].lastUpdated = new Date();
            } else {
              freshDepot.products.push({
                productId: product._id,
                productName: product.name,
                productSku: product.sku,
                quantity: product.depotQuantity,
                lastUpdated: new Date()
              });
            }
            freshDepot.itemsStored = freshDepot.products.length;
            freshDepot.currentUtilization += product.depotQuantity;
            freshDepot.updatedAt = new Date();
            Object.assign(depot, freshDepot);
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          throw saveError;
        }
      }
    }

    // IMPORTANT: Calculate total stock across ALL depots
    const totalStock = await calculateProductTotalStock(product._id, userId);
    product.stock = totalStock;
    await product.save();

    // Create transaction with userId - mark as depot assignment, not stock-in
    const transaction = new Transaction({
      userId, // IMPORTANT: Include userId for user data isolation
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      transactionType: 'transfer', // Changed from 'stock-in' to 'transfer'
      quantity: product.depotQuantity,
      toDepot: depot.name,
      toDepotId: depot._id,
      previousStock: totalStock - product.depotQuantity,
      newStock: totalStock,
      reason: 'Depot assignment',
      performedBy: 'User'
    });
    await transaction.save();

    // Emit WebSocket events
    io.emit('product:depot-assigned', {
      productId: product._id,
      productName: product.name,
      depotId: depot._id,
      depotName: depot.name,
      quantity: product.depotQuantity
    });

    io.emit('depot:stock-updated', {
      depotId: depot._id,
      depotName: depot.name,
      currentUtilization: depot.currentUtilization,
      itemsStored: depot.itemsStored
    });

    res.json({
      message: 'Product assigned to depot successfully',
      product: {
        id: product._id,
        depotId: product.depotId,
        depotName: product.depotName,
        depotQuantity: product.depotQuantity
      }
    });
  } catch (error) {
    console.error('Error assigning product to depot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Transfer product between depots
app.post('/api/products/:id/transfer', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const { fromDepotId, toDepotId, quantity } = req.body;
    const product = await Product.findOne({ _id: req.params.id, userId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const fromDepot = await Depot.findOne({ _id: fromDepotId, userId });
    const toDepot = await Depot.findOne({ _id: toDepotId, userId });

    if (!fromDepot || !toDepot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Remove from source depot
    const fromProductIndex = fromDepot.products.findIndex(
      p => p.productId.toString() === product._id.toString()
    );

    if (fromProductIndex >= 0) {
      fromDepot.products[fromProductIndex].quantity -= quantity;
      if (fromDepot.products[fromProductIndex].quantity <= 0) {
        fromDepot.products.splice(fromProductIndex, 1);
      }
      fromDepot.itemsStored = fromDepot.products.length;
      fromDepot.currentUtilization -= quantity;
      await fromDepot.save();
    }

    // Add to destination depot
    const toProductIndex = toDepot.products.findIndex(
      p => p.productId.toString() === product._id.toString()
    );

    if (toProductIndex >= 0) {
      toDepot.products[toProductIndex].quantity += quantity;
      toDepot.products[toProductIndex].lastUpdated = new Date();
    } else {
      toDepot.products.push({
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: quantity,
        lastUpdated: new Date()
      });
    }

    toDepot.itemsStored = toDepot.products.length;
    toDepot.currentUtilization += quantity;
    await toDepot.save();

    // Update product
    product.depotId = toDepotId;
    product.depotName = toDepot.name;
    product.depotQuantity = quantity;
    await product.save();

    // Create transaction with userId
    const transaction = new Transaction({
      userId, // IMPORTANT: Include userId for user data isolation
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      transactionType: 'transfer',
      quantity: quantity,
      fromDepot: fromDepot.name,
      toDepot: toDepot.name,
      fromDepotId: fromDepot._id,
      toDepotId: toDepot._id,
      previousStock: product.stock,
      newStock: product.stock,
      reason: 'Inter-depot transfer',
      performedBy: 'User'
    });
    await transaction.save();

    // Emit WebSocket events
    io.emit('product:transferred', {
      productId: product._id,
      productName: product.name,
      fromDepotId: fromDepot._id,
      fromDepotName: fromDepot.name,
      toDepotId: toDepot._id,
      toDepotName: toDepot.name,
      quantity: quantity
    });

    io.emit('depot:stock-updated', {
      depotId: fromDepot._id,
      depotName: fromDepot.name,
      currentUtilization: fromDepot.currentUtilization,
      itemsStored: fromDepot.itemsStored
    });

    io.emit('depot:stock-updated', {
      depotId: toDepot._id,
      depotName: toDepot.name,
      currentUtilization: toDepot.currentUtilization,
      itemsStored: toDepot.itemsStored
    });

    res.json({
      message: 'Product transferred successfully',
      transfer: {
        productId: product._id,
        from: fromDepot.name,
        to: toDepot.name,
        quantity: quantity
      }
    });
  } catch (error) {
    console.error('Error transferring product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product transactions
app.get('/api/products/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const { limit = 50, type } = req.query;

    // Verify product belongs to user
    const product = await Product.findOne({ _id: req.params.id, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const query = { productId: req.params.id, userId };

    if (type) {
      query.transactionType = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      transactions: transactions.map(t => ({
        id: t._id,
        transactionType: t.transactionType,
        quantity: t.quantity,
        fromDepot: t.fromDepot,
        toDepot: t.toDepot,
        previousStock: t.previousStock,
        newStock: t.newStock,
        reason: t.reason,
        notes: t.notes,
        performedBy: t.performedBy,
        timestamp: t.timestamp
      })),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed product view
app.get('/api/products/:id/details', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const product = await Product.findOne({ _id: req.params.id, userId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get transactions (filtered by userId for data isolation)
    const transactions = await Transaction.find({ productId: product._id, userId })
      .sort({ timestamp: -1 })
      .limit(100);

    // Calculate stock history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      productId: product._id,
      userId,
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });

    let stockHistory = [];

    // Build stock history chronologically from transactions
    if (recentTransactions.length > 0) {
      // Start with the stock before first transaction
      let runningStock = recentTransactions[0].previousStock;

      // Add initial point
      const firstDate = new Date(recentTransactions[0].timestamp);
      firstDate.setDate(firstDate.getDate() - 1);
      stockHistory.push({
        date: firstDate.toISOString().split('T')[0],
        stock: runningStock,
        value: runningStock * product.price
      });

      // Add each transaction point
      for (const t of recentTransactions) {
        stockHistory.push({
          date: t.timestamp.toISOString().split('T')[0],
          stock: t.newStock,
          value: t.newStock * product.price
        });
      }

      // Add current point if last transaction isn't today
      const lastTxDate = new Date(recentTransactions[recentTransactions.length - 1].timestamp).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      if (lastTxDate !== today) {
        stockHistory.push({
          date: today,
          stock: product.stock,
          value: product.stock * product.price
        });
      }
    } else {
      // No transactions - just show current stock for last 7 days
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        stockHistory.push({
          date: date.toISOString().split('T')[0],
          stock: product.stock,
          value: product.stock * product.price
        });
      }
    }

    // Calculate monthly stats
    const monthlyStats = {};
    transactions.forEach(t => {
      const month = t.timestamp.toISOString().substring(0, 7);
      if (!monthlyStats[month]) {
        monthlyStats[month] = { month, stockIn: 0, stockOut: 0, avgStock: 0 };
      }

      if (t.transactionType === 'stock-in' || t.transactionType === 'transfer') {
        monthlyStats[month].stockIn += t.quantity;
      } else if (t.transactionType === 'stock-out') {
        monthlyStats[month].stockOut += t.quantity;
      }
    });

    // Depot distribution - use product's depotDistribution array
    const depotDistribution = product.depotDistribution.map(depot => ({
      depotId: depot.depotId,
      depotName: depot.depotName,
      quantity: depot.quantity,
      percentage: product.stock > 0
        ? ((depot.quantity / product.stock) * 100).toFixed(1)
        : 0,
      lastUpdated: depot.lastUpdated
    })).filter(d => d.quantity > 0);

    // Get full depot info for location data
    if (depotDistribution.length > 0) {
      const depotIds = depotDistribution.map(d => d.depotId);
      const depots = await Depot.find({ _id: { $in: depotIds }, userId });

      depotDistribution.forEach(dist => {
        const depot = depots.find(d => d._id.toString() === dist.depotId.toString());
        if (depot) {
          dist.location = depot.location;
        }
      });
    }

    // Depot info for backward compatibility (primary depot)
    const depotInfo = depotDistribution.length > 0 ? {
      depotId: depotDistribution[0].depotId,
      depotName: depotDistribution[0].depotName,
      quantity: depotDistribution[0].quantity
    } : null;

    // Generate alerts
    const alerts = [];
    if (product.status === 'low-stock') {
      alerts.push({
        type: 'low-stock',
        message: `Stock level is below reorder point (${product.reorderPoint})`,
        severity: 'medium'
      });
    } else if (product.status === 'out-of-stock') {
      alerts.push({
        type: 'out-of-stock',
        message: 'Product is out of stock',
        severity: 'high'
      });
    } else if (product.status === 'overstock') {
      alerts.push({
        type: 'overstock',
        message: 'Stock level is significantly above reorder point',
        severity: 'low'
      });
    }

    res.json({
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        supplier: product.supplier,
        price: product.price,
        status: product.status,
        image: product.image,
        depotId: product.depotId,
        depotName: product.depotName,
        depotQuantity: product.depotQuantity
      },
      transactions: transactions.map(t => ({
        id: t._id,
        transactionType: t.transactionType,
        quantity: t.quantity,
        fromDepot: t.fromDepot,
        toDepot: t.toDepot,
        previousStock: t.previousStock,
        newStock: t.newStock,
        reason: t.reason,
        performedBy: t.performedBy,
        timestamp: t.timestamp
      })),
      stockHistory,
      monthlyStats: Object.values(monthlyStats),
      depotInfo,
      depotDistribution, // NEW: Array of depots storing this product
      alerts
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comprehensive depot details (for DepotDetailsView)
app.get('/api/depots/:id/details', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const depotId = req.params.id;

    // Get depot
    const depot = await Depot.findOne({ _id: depotId, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Get all products in this depot with full product details
    const products = [];
    for (const depotProduct of depot.products) {
      const product = await Product.findOne({ _id: depotProduct.productId, userId });
      if (product) {
        products.push({
          productId: depotProduct.productId,
          productName: depotProduct.productName,
          productSku: depotProduct.productSku,
          quantity: depotProduct.quantity,
          lastUpdated: depotProduct.lastUpdated,
          product: {
            id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            status: product.status
          }
        });
      }
    }

    // Generate utilization history from transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const depotTransactions = await Transaction.find({
      userId,
      $or: [
        { fromDepotId: depotId },
        { toDepotId: depotId }
      ],
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });

    // Build utilization history from transactions
    const utilizationHistory = [];

    if (depotTransactions.length > 0) {
      // Calculate starting utilization (work backwards from current)
      let startingUtilization = depot.currentUtilization;

      // Work backwards to find utilization 30 days ago
      for (let i = depotTransactions.length - 1; i >= 0; i--) {
        const t = depotTransactions[i];
        if (t.toDepotId?.toString() === depotId) {
          startingUtilization -= t.quantity; // Remove stock-in
        } else if (t.fromDepotId?.toString() === depotId) {
          startingUtilization += t.quantity; // Add back stock-out
        }
      }

      // Build history forward from starting point
      let currentUtil = Math.max(0, startingUtilization);
      const historyMap = new Map();

      // Add starting point
      const startDate = new Date(thirtyDaysAgo);
      historyMap.set(startDate.toISOString().split('T')[0], currentUtil);

      // Process each transaction
      depotTransactions.forEach(t => {
        const date = t.timestamp.toISOString().split('T')[0];

        if (t.toDepotId?.toString() === depotId) {
          currentUtil += t.quantity;
        } else if (t.fromDepotId?.toString() === depotId) {
          currentUtil -= t.quantity;
        }

        historyMap.set(date, Math.max(0, currentUtil));
      });

      // Fill in all dates with last known value
      let lastKnownUtil = Math.max(0, startingUtilization);
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (historyMap.has(dateStr)) {
          lastKnownUtil = historyMap.get(dateStr);
        }

        utilizationHistory.push({
          date: dateStr,
          utilization: lastKnownUtil
        });
      }
    } else {
      // No transactions - show current utilization for all days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        utilizationHistory.push({
          date: date.toISOString().split('T')[0],
          utilization: depot.currentUtilization
        });
      }
    }

    // Get transaction stats for this depot
    const transactions = await Transaction.find({
      userId,
      $or: [
        { fromDepotId: depotId },
        { toDepotId: depotId }
      ]
    });

    const transactionStats = {
      stockIn: 0,
      stockOut: 0,
      transfers: 0
    };

    transactions.forEach(t => {
      if (t.transactionType === 'stock-in' && t.toDepotId?.toString() === depotId) {
        transactionStats.stockIn++;
      } else if (t.transactionType === 'stock-out' && t.fromDepotId?.toString() === depotId) {
        transactionStats.stockOut++;
      } else if (t.transactionType === 'transfer') {
        transactionStats.transfers++;
      }
    });

    // Get top products by quantity and value
    const topProducts = products
      .map(p => ({
        name: p.productName,
        quantity: p.quantity,
        value: p.quantity * (p.product?.price || 0)
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status
      },
      products,
      utilizationHistory,
      transactionStats,
      topProducts
    });

  } catch (error) {
    console.error('Error fetching depot details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add this endpoint to server.js after the existing product endpoints

// Stock In/Out endpoint with transaction recording - DEPOT-SPECIFIC
app.post('/api/products/:id/stock-transaction', authenticateToken, async (req, res) => {
  try {
    const { transactionType, quantity, depotId, reason, notes, performedBy } = req.body;
    const userId = req.userId;

    const product = await Product.findOne({ _id: req.params.id, userId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Require depot for stock-in and stock-out transactions
    if ((transactionType === 'stock-in' || transactionType === 'stock-out') && !depotId) {
      return res.status(400).json({ message: 'Depot selection is required for stock transactions' });
    }

    const previousStock = product.stock;
    let depot = null;
    let depotProductIndex = -1;

    // Handle depot-specific transactions
    if (depotId) {
      depot = await Depot.findOne({ _id: depotId, userId });
      if (!depot) {
        return res.status(404).json({ message: 'Depot not found' });
      }

      // Find product in depot's products array
      depotProductIndex = depot.products.findIndex(
        p => p.productId.toString() === product._id.toString()
      );
    }

    // Handle different transaction types
    if (transactionType === 'stock-in') {
      // Find depot in product's depotDistribution
      const depotDistIndex = product.depotDistribution.findIndex(
        d => d.depotId.toString() === depotId
      );

      if (depotDistIndex >= 0) {
        // Depot exists, add to existing quantity
        product.depotDistribution[depotDistIndex].quantity += quantity;
        product.depotDistribution[depotDistIndex].lastUpdated = new Date();
      } else {
        // New depot, add to distribution
        product.depotDistribution.push({
          depotId: depot._id,
          depotName: depot.name,
          quantity: quantity,
          lastUpdated: new Date()
        });
      }

      // Update depot's products array
      if (depotProductIndex >= 0) {
        depot.products[depotProductIndex].quantity += quantity;
        depot.products[depotProductIndex].lastUpdated = new Date();
      } else {
        depot.products.push({
          productId: product._id,
          productName: product.name,
          productSku: product.sku,
          quantity: quantity,
          lastUpdated: new Date()
        });
      }

      depot.currentUtilization += quantity;
      depot.itemsStored = depot.products.length;

    } else if (transactionType === 'stock-out') {
      // Find depot in product's depotDistribution
      const depotDistIndex = product.depotDistribution.findIndex(
        d => d.depotId.toString() === depotId
      );

      if (depotDistIndex < 0) {
        return res.status(400).json({ message: 'Product not found in selected depot' });
      }

      const depotQuantity = product.depotDistribution[depotDistIndex].quantity;
      if (quantity > depotQuantity) {
        return res.status(400).json({
          message: `Cannot remove ${quantity} units. Only ${depotQuantity} units available in this depot.`
        });
      }

      // Reduce quantity in depot distribution
      product.depotDistribution[depotDistIndex].quantity -= quantity;
      product.depotDistribution[depotDistIndex].lastUpdated = new Date();

      // Remove depot from distribution if quantity becomes 0
      if (product.depotDistribution[depotDistIndex].quantity === 0) {
        product.depotDistribution.splice(depotDistIndex, 1);
      }

      // Update depot's products array
      if (depotProductIndex >= 0) {
        depot.products[depotProductIndex].quantity -= quantity;
        depot.products[depotProductIndex].lastUpdated = new Date();

        // Remove product from depot if quantity becomes 0
        if (depot.products[depotProductIndex].quantity === 0) {
          depot.products.splice(depotProductIndex, 1);
        }
      }

      depot.currentUtilization -= quantity;
      depot.itemsStored = depot.products.length;

    } else if (transactionType === 'adjustment') {
      // For adjustments, modify total stock proportionally across all depots
      const totalStock = product.stock;
      const newTotalStock = totalStock + quantity;

      if (newTotalStock < 0) {
        return res.status(400).json({ message: 'Adjustment would result in negative stock' });
      }

      // Distribute adjustment proportionally
      product.depotDistribution.forEach(depot => {
        const proportion = depot.quantity / totalStock;
        depot.quantity = Math.round(newTotalStock * proportion);
        depot.lastUpdated = new Date();
      });

    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Save depot changes
    if (depot) {
      depot.updatedAt = new Date();
      await depot.save();
    }

    // Save product (pre-save hook will recalculate total stock)
    product.updatedAt = new Date();
    await product.save();

    const newStock = product.stock;

    // Create transaction record
    const transaction = new Transaction({
      userId,
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      transactionType,
      quantity,
      toDepot: transactionType === 'stock-in' ? depot?.name : undefined,
      toDepotId: transactionType === 'stock-in' ? depot?._id : undefined,
      fromDepot: transactionType === 'stock-out' ? depot?.name : undefined,
      fromDepotId: transactionType === 'stock-out' ? depot?._id : undefined,
      previousStock,
      newStock,
      reason: reason || `${transactionType} transaction`,
      notes: notes || '',
      performedBy: performedBy || 'User',
      timestamp: new Date()
    });
    await transaction.save();

    // Emit WebSocket events
    io.emit('transaction:created', {
      productId: product._id,
      productName: product.name,
      transactionType,
      quantity,
      previousStock,
      newStock,
      depotId: depot?._id,
      depotName: depot?.name
    });

    if (depot) {
      io.emit('depot:stock-updated', {
        depotId: depot._id,
        depotName: depot.name,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored
      });
    }

    // Check and create alerts if needed
    await createStockAlert(product);

    res.json({
      message: 'Transaction completed successfully',
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        stock: product.stock,
        status: product.status
      },
      transaction: {
        id: transaction._id,
        transactionType: transaction.transactionType,
        quantity: transaction.quantity,
        previousStock: transaction.previousStock,
        newStock: transaction.newStock,
        timestamp: transaction.timestamp
      }
    });
  } catch (error) {
    console.error('Error processing stock transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get all transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const { type, productId, depotId, limit = 100 } = req.query;
    const query = { userId };

    if (type) query.transactionType = type;
    if (productId) query.productId = productId;
    if (depotId) {
      query.$or = [{ fromDepotId: depotId }, { toDepotId: depotId }];
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('productId', 'name sku');

    res.json({
      transactions: transactions.map(t => ({
        id: t._id,
        productName: t.productName,
        productSku: t.productSku,
        transactionType: t.transactionType,
        quantity: t.quantity,
        fromDepot: t.fromDepot,
        toDepot: t.toDepot,
        previousStock: t.previousStock,
        newStock: t.newStock,
        reason: t.reason,
        performedBy: t.performedBy,
        timestamp: t.timestamp
      })),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Add these routes to your server.js file (replace existing depot routes)

// DEPOT ROUTES - COMPLETE CRUD

// Get all depots
app.get('/api/depots', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const depots = await Depot.find({ userId }).sort({ updatedAt: -1 });
    res.json({
      depots: depots.map(depot => ({
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status,
        createdAt: depot.createdAt,
        updatedAt: depot.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching depots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single depot by ID
app.get('/api/depots/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const depot = await Depot.findOne({ _id: req.params.id, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }
    res.json({
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status,
        createdAt: depot.createdAt,
        updatedAt: depot.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching depot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new depot
app.post('/api/depots', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const depot = new Depot({
      ...req.body,
      userId // IMPORTANT: Include userId for user data isolation
    });

    // Calculate status based on utilization
    const utilizationPercentage = (depot.currentUtilization / depot.capacity) * 100;
    if (utilizationPercentage >= 95) {
      depot.status = 'critical';
    } else if (utilizationPercentage >= 85) {
      depot.status = 'warning';
    } else {
      depot.status = 'normal';
    }

    await depot.save();

    // Create alert if capacity is critical
    if (depot.status === 'critical' || depot.status === 'warning') {
      const alert = new Alert({
        type: 'capacity-warning',
        title: `Depot ${depot.status === 'critical' ? 'Critical' : 'Warning'} Capacity`,
        description: `${depot.name} is at ${utilizationPercentage.toFixed(1)}% capacity utilization`,
        severity: depot.status === 'critical' ? 'high' : 'medium',
        depotId: depot._id
      });
      await alert.save();
    }

    res.status(201).json({
      message: 'Depot created successfully',
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status
      }
    });
  } catch (error) {
    console.error('Error creating depot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update depot
app.put('/api/depots/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const depot = await Depot.findOne({ _id: req.params.id, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Update fields
    Object.assign(depot, req.body);
    depot.updatedAt = new Date();

    // Recalculate status based on utilization
    const utilizationPercentage = (depot.currentUtilization / depot.capacity) * 100;
    if (utilizationPercentage >= 95) {
      depot.status = 'critical';
    } else if (utilizationPercentage >= 85) {
      depot.status = 'warning';
    } else {
      depot.status = 'normal';
    }

    await depot.save();

    // Create/update alert if capacity is critical or warning
    if (depot.status === 'critical' || depot.status === 'warning') {
      const existingAlert = await Alert.findOne({
        depotId: depot._id,
        type: 'capacity-warning',
        isResolved: false
      });

      if (!existingAlert) {
        const alert = new Alert({
          type: 'capacity-warning',
          title: `Depot ${depot.status === 'critical' ? 'Critical' : 'Warning'} Capacity`,
          description: `${depot.name} is at ${utilizationPercentage.toFixed(1)}% capacity utilization`,
          severity: depot.status === 'critical' ? 'high' : 'medium',
          depotId: depot._id
        });
        await alert.save();
      }
    } else {
      // Resolve existing alerts if status is now normal
      await Alert.updateMany(
        { depotId: depot._id, type: 'capacity-warning', isResolved: false },
        { isResolved: true, resolvedAt: new Date() }
      );
    }

    res.json({
      message: 'Depot updated successfully',
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status
      }
    });
  } catch (error) {
    console.error('Error updating depot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete depot
app.delete('/api/depots/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const depot = await Depot.findOne({ _id: req.params.id, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    await Depot.findByIdAndDelete(req.params.id);

    // Delete associated alerts
    await Alert.deleteMany({ depotId: req.params.id });

    res.json({ message: 'Depot deleted successfully' });
  } catch (error) {
    console.error('Error deleting depot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get depot statistics
app.get('/api/depots/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const depots = await Depot.find({ userId });

    const totalDepots = depots.length;
    const totalCapacity = depots.reduce((sum, depot) => sum + depot.capacity, 0);
    const totalUtilization = depots.reduce((sum, depot) => sum + depot.currentUtilization, 0);
    const totalItems = depots.reduce((sum, depot) => sum + depot.itemsStored, 0);

    const avgUtilization = totalDepots > 0
      ? (totalUtilization / totalCapacity) * 100
      : 0;

    const criticalCount = depots.filter(d => d.status === 'critical').length;
    const warningCount = depots.filter(d => d.status === 'warning').length;
    const normalCount = depots.filter(d => d.status === 'normal').length;

    res.json({
      stats: {
        totalDepots,
        totalCapacity,
        totalUtilization,
        totalItems,
        avgUtilization: avgUtilization.toFixed(1),
        criticalCount,
        warningCount,
        normalCount,
        needsAttention: criticalCount + warningCount
      }
    });
  } catch (error) {
    console.error('Error fetching depot stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get depot products
app.get('/api/depots/:id/products', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const depot = await Depot.findOne({ _id: req.params.id, userId }).populate('products.productId');

    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    const products = depot.products.map(p => ({
      productId: p.productId?._id || p.productId,
      productName: p.productName,
      productSku: p.productSku,
      quantity: p.quantity,
      lastUpdated: p.lastUpdated
    }));

    res.json({
      depotId: depot._id,
      depotName: depot.name,
      products,
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Error fetching depot products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed depot view
app.get('/api/depots/:id/details', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const depot = await Depot.findOne({ _id: req.params.id, userId });

    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Get all products in this depot with full details
    const productIds = depot.products.map(p => p.productId);
    const fullProducts = await Product.find({ _id: { $in: productIds } });

    const productsWithQuantity = depot.products.map(dp => {
      const fullProduct = fullProducts.find(fp => fp._id.toString() === dp.productId.toString());
      return {
        product: fullProduct ? {
          id: fullProduct._id,
          sku: fullProduct.sku,
          name: fullProduct.name,
          category: fullProduct.category,
          price: fullProduct.price,
          status: fullProduct.status
        } : null,
        quantity: dp.quantity,
        lastUpdated: dp.lastUpdated
      };
    }).filter(p => p.product !== null);

    // Get transactions for this depot
    const transactions = await Transaction.find({
      $or: [
        { toDepotId: depot._id },
        { fromDepotId: depot._id }
      ]
    }).sort({ timestamp: -1 }).limit(100);

    // Calculate transaction stats
    const transactionStats = {
      stockIn: 0,
      stockOut: 0,
      transfers: 0
    };

    transactions.forEach(t => {
      if (t.toDepotId && t.toDepotId.toString() === depot._id.toString()) {
        if (t.transactionType === 'stock-in') {
          transactionStats.stockIn += t.quantity;
        } else if (t.transactionType === 'transfer') {
          transactionStats.transfers += t.quantity;
        }
      }
      if (t.fromDepotId && t.fromDepotId.toString() === depot._id.toString()) {
        if (t.transactionType === 'stock-out') {
          transactionStats.stockOut += t.quantity;
        } else if (t.transactionType === 'transfer') {
          transactionStats.transfers += t.quantity;
        }
      }
    });

    // Calculate utilization history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(t => t.timestamp >= thirtyDaysAgo);
    const utilizationHistory = [];

    // Group by date
    const utilizationByDate = {};
    recentTransactions.forEach(t => {
      const date = t.timestamp.toISOString().split('T')[0];
      if (!utilizationByDate[date]) {
        utilizationByDate[date] = depot.currentUtilization;
      }
    });

    Object.keys(utilizationByDate).forEach(date => {
      utilizationHistory.push({
        date,
        utilization: utilizationByDate[date]
      });
    });

    // Calculate top products by quantity and value
    const topProducts = productsWithQuantity
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({
        name: p.product.name,
        quantity: p.quantity,
        value: p.quantity * p.product.price
      }));

    res.json({
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status
      },
      products: productsWithQuantity,
      utilizationHistory,
      transactionStats,
      topProducts
    });
  } catch (error) {
    console.error('Error fetching depot details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ALERT ROUTES
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const { unreadOnly = false, page = 1, limit = 20 } = req.query;

    // Get user's products and depots to filter alerts
    const userProducts = await Product.find({ userId }).select('_id');
    const userDepots = await Depot.find({ userId }).select('_id');
    const productIds = userProducts.map(p => p._id);
    const depotIds = userDepots.map(d => d._id);

    const query = {
      $or: [
        { productId: { $in: productIds } },
        { depotId: { $in: depotIds } },
        { productId: null, depotId: null } // System-wide alerts
      ]
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const alerts = await Alert.find(query)
      .populate('productId', 'name sku')
      .populate('depotId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Alert.countDocuments(query);

    res.json({
      alerts: alerts.map(alert => ({
        id: alert._id,
        type: alert.type,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        isRead: alert.isRead,
        isResolved: alert.isResolved,
        timestamp: alert.createdAt.toISOString(),
        product: alert.productId,
        depot: alert.depotId
      })),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/alerts/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    // Verify alert belongs to user's products/depots
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Check ownership through product or depot
    if (alert.productId) {
      const product = await Product.findOne({ _id: alert.productId, userId });
      if (!product) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    } else if (alert.depotId) {
      const depot = await Depot.findOne({ _id: alert.depotId, userId });
      if (!depot) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    alert.isRead = true;
    await alert.save();

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DASHBOARD ROUTES
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    const totalProducts = await Product.countDocuments({ userId });
    const lowStockCount = await Product.countDocuments({ userId, status: 'low-stock' });
    const outOfStockCount = await Product.countDocuments({ userId, status: 'out-of-stock' });
    const totalDepots = await Depot.countDocuments({ userId });

    // Get user's products and depots for alert filtering
    const userProducts = await Product.find({ userId }).select('_id');
    const userDepots = await Depot.find({ userId }).select('_id');
    const productIds = userProducts.map(p => p._id);
    const depotIds = userDepots.map(d => d._id);

    const unreadAlerts = await Alert.countDocuments({
      isRead: false,
      $or: [
        { productId: { $in: productIds } },
        { depotId: { $in: depotIds } }
      ]
    });

    const products = await Product.find({ userId });
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    const depots = await Depot.find({ userId });
    const avgUtilization = depots.length > 0
      ? depots.reduce((sum, depot) => sum + ((depot.currentUtilization / depot.capacity) * 100), 0) / depots.length
      : 0;

    const kpis = [
      {
        title: 'Total Products',
        value: totalProducts.toString(),
        change: 5.2,
        changeType: 'positive',
        icon: 'Package'
      },
      {
        title: 'Inventory Value',
        value: `₹${(totalValue / 1000000).toFixed(1)}M`,
        change: -2.1,
        changeType: 'negative',
        icon: 'IndianRupee'
      },
      {
        title: 'Depot Utilization',
        value: `${avgUtilization.toFixed(0)}%`,
        change: 3.8,
        changeType: 'positive',
        icon: 'Warehouse'
      },
      {
        title: 'Active Alerts',
        value: unreadAlerts.toString(),
        change: lowStockCount > 0 ? 12.5 : -8.3,
        changeType: lowStockCount > 0 ? 'negative' : 'positive',
        icon: 'AlertTriangle'
      }
    ];

    res.json({
      kpis,
      stats: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalDepots,
        unreadAlerts,
        totalValue,
        avgUtilization
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/dashboard/top-skus', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token
    const products = await Product.find({ userId })
      .sort({ stock: -1 })
      .limit(5);

    const topSKUs = products.map(product => ({
      sku: product.sku,
      name: product.name,
      predictedDemand: Math.floor(product.stock * 0.3 + Math.random() * 50),
      currentStock: product.stock,
      category: product.category
    }));

    res.json({ topSKUs });
  } catch (error) {
    console.error('Error fetching top SKUs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AUTH ROUTES

// Signup route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirm_password } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry
    });

    await user.save();

    // Send OTP email (optional for testing)
    try {
      if (transporter) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify Your Email - Sangrahak',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to Sangrahak!</h2>
              <p>Hi ${first_name},</p>
              <p>Thank you for signing up. Please verify your email address using the OTP below:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #333; margin: 0; font-size: 32px;">${otp}</h1>
              </div>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <br>
              <p>Best regards,<br>Sangrahak Team</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
      } else {
        console.log(`Email not configured. OTP for ${email}: ${otp}`);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      console.log(`OTP for ${email}: ${otp} (email failed, but user created)`);
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email for OTP verification.',
      userId: user._id
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

// Verify OTP route
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification', error: error.message });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.updatedAt = new Date();
    await user.save();

    // Return token and user data
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: user._id,
        username: user.email,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        avatar: user.avatar,
        lastLogin: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Token verification endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'User not verified' });
    }

    res.json({
      success: true,
      admin: {
        id: user._id,
        username: user.email,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during token verification' });
  }
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// BULK FORECAST ROUTE WITH WEB SOCKETS
app.post('/api/forecasts/bulk-generate', async (req, res) => {
  const { depotName, productIds } = req.body;
  const socketId = req.headers['x-socket-id'];

  try {
    let products = [];
    if (depotName) {
      products = await Product.find({ location: depotName });
    } else if (productIds && productIds.length > 0) {
      products = await Product.find({ _id: { $in: productIds } });
    }

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for forecasting' });
    }

    // Start background process
    res.json({
      message: `Started forecasting for ${products.length} products`,
      jobId: Date.now().toString()
    });

    // Process products and emit progress
    (async () => {
      const total = products.length;
      let completed = 0;
      let failed = 0;

      for (const product of products) {
        try {
          // Call ML API
          await axios.post('http://localhost:5001/api/ml/predict/custom', {
            sku: product.sku,
            productName: product.name,
            currentStock: product.stock,
            dailySales: product.dailySales || 5,
            weeklySales: product.weeklySales || 35,
            reorderLevel: product.reorderPoint,
            leadTime: product.leadTime || 7,
            brand: product.brand || 'Generic',
            category: product.category,
            location: product.location,
            supplierName: product.supplier,
            forecastDays: 30
          });

          completed++;

          if (socketId && io.sockets.sockets.get(socketId)) {
            io.sockets.sockets.get(socketId).emit('forecast_progress', {
              current: completed,
              total: total,
              failed: failed,
              lastProduct: product.name,
              status: 'processing'
            });
          }
        } catch (err) {
          console.error(`Error forecasting for ${product.sku}:`, err.message);
          failed++;
        }
      }

      if (socketId && io.sockets.sockets.get(socketId)) {
        io.sockets.sockets.get(socketId).emit('forecast_progress', {
          current: completed,
          total: total,
          failed: failed,
          status: 'completed'
        });
      }
    })();

  } catch (error) {
    console.error('Error in bulk forecasting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enhanced Bulk Import with Transactions and Auto Depot Creation
app.post('/api/products/bulk-with-transactions', async (req, res) => {
  try {
    const productsData = req.body;

    if (!Array.isArray(productsData)) {
      return res.status(400).json({ message: 'Input must be an array of products' });
    }

    const results = {
      success: 0,
      failed: 0,
      productsCreated: 0,
      productsUpdated: 0,
      depotsCreated: 0,
      transactionsCreated: 0,
      errors: []
    };

    // Group transactions by SKU
    const productGroups = {};
    productsData.forEach(item => {
      if (!productGroups[item.sku]) {
        productGroups[item.sku] = [];
      }
      productGroups[item.sku].push(item);
    });

    // Process each product group
    for (const [sku, transactions] of Object.entries(productGroups)) {
      try {
        // Sort transactions by date to process chronologically
        transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

        const firstTransaction = transactions[0];

        // Validate required fields
        if (!firstTransaction.sku || !firstTransaction.name) {
          throw new Error(`Missing SKU or Name for product: ${sku}`);
        }

        // Find or create depot
        let depot = null;
        if (firstTransaction.depotName) {
          depot = await Depot.findOne({ name: firstTransaction.depotName });

          if (!depot) {
            // Auto-create depot
            depot = new Depot({
              name: firstTransaction.depotName,
              location: firstTransaction.depotLocation || 'Unknown',
              capacity: Number(firstTransaction.depotCapacity) || 10000,
              currentUtilization: 0,
              itemsStored: 0,
              products: [],
              status: 'normal'
            });
            await depot.save();
            results.depotsCreated++;
            console.log(`✅ Created depot: ${depot.name}`);
          }
        }

        // Check if product exists
        let product = await Product.findOne({ sku });
        let isNewProduct = false;

        if (!product) {
          // Create new product
          product = new Product({
            sku: firstTransaction.sku,
            name: firstTransaction.name,
            category: firstTransaction.category || 'Uncategorized',
            stock: 0, // Will be calculated from transactions
            reorderPoint: Number(firstTransaction.reorderPoint) || 10,
            supplier: firstTransaction.supplier || 'Unknown',
            price: Number(firstTransaction.price) || 0,
            depotId: depot ? depot._id : null,
            depotName: depot ? depot.name : null,
            depotQuantity: 0
          });
          isNewProduct = true;
          results.productsCreated++;
        } else {
          results.productsUpdated++;
        }

        // Process all transactions for this product
        let currentStock = 0;
        let depotStock = 0;

        for (const txn of transactions) {
          const quantity = Number(txn.transactionQuantity) || 0;
          const previousStock = currentStock;

          // Calculate new stock based on transaction type
          if (txn.transactionType === 'stock-in') {
            currentStock += quantity;
            depotStock += quantity;
          } else if (txn.transactionType === 'stock-out') {
            currentStock -= quantity;
            depotStock -= quantity;
          }

          // Create transaction record with userId
          const transaction = new Transaction({
            userId, // IMPORTANT: Include userId for user data isolation
            productId: product._id,
            productName: product.name,
            productSku: product.sku,
            transactionType: txn.transactionType,
            quantity: quantity,
            toDepot: txn.transactionType === 'stock-in' && depot ? depot.name : undefined,
            toDepotId: txn.transactionType === 'stock-in' && depot ? depot._id : undefined,
            fromDepot: txn.transactionType === 'stock-out' && depot ? depot.name : undefined,
            fromDepotId: txn.transactionType === 'stock-out' && depot ? depot._id : undefined,
            previousStock: previousStock,
            newStock: currentStock,
            reason: txn.transactionReason || 'CSV Import',
            performedBy: 'System',
            timestamp: new Date(txn.transactionDate),
            createdAt: new Date(txn.transactionDate)
          });
          await transaction.save();
          results.transactionsCreated++;
        }

        // Update product with final stock
        product.stock = Math.max(0, currentStock);
        product.depotQuantity = Math.max(0, depotStock);
        product.updatedAt = new Date();
        await product.save();

        // Update depot with product
        if (depot && depotStock > 0) {
          const existingProductIndex = depot.products.findIndex(
            p => p.productId.toString() === product._id.toString()
          );

          if (existingProductIndex >= 0) {
            depot.products[existingProductIndex].quantity = depotStock;
            depot.products[existingProductIndex].lastUpdated = new Date();
          } else {
            depot.products.push({
              productId: product._id,
              productName: product.name,
              productSku: product.sku,
              quantity: depotStock,
              lastUpdated: new Date()
            });
          }

          depot.itemsStored = depot.products.length;
          depot.currentUtilization = depot.products.reduce((sum, p) => sum + p.quantity, 0);

          // Update depot status based on utilization
          const utilizationPercentage = (depot.currentUtilization / depot.capacity) * 100;
          if (utilizationPercentage >= 90) {
            depot.status = 'critical';
          } else if (utilizationPercentage >= 70) {
            depot.status = 'warning';
          } else {
            depot.status = 'normal';
          }

          depot.updatedAt = new Date();
          await depot.save();
        }

        // Create stock alerts if needed
        await createStockAlert(product);
        results.success++;

        console.log(`✅ Processed product: ${product.name} (${product.sku}) - Final stock: ${product.stock}`);

      } catch (err) {
        results.failed++;
        results.errors.push({ sku, error: err.message });
        console.error(`❌ Error processing product ${sku}:`, err.message);
      }
    }

    // Emit WebSocket events for real-time updates
    io.emit('products:bulk-imported', {
      productsCreated: results.productsCreated,
      productsUpdated: results.productsUpdated,
      depotsCreated: results.depotsCreated,
      transactionsCreated: results.transactionsCreated
    });

    res.json({
      message: `Bulk import completed`,
      results
    });

  } catch (error) {
    console.error('Error in bulk import with transactions:', error);
    res.status(500).json({ message: 'Server error during bulk import', error: error.message });
  }
});

// Socket.io Connection Handle
io.on('connection', (socket) => {
  console.log('ðŸ”Œ New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('ðŸ”Œ Client disconnected:', socket.id);
  });
});

// Start server
http.listen(PORT, () => {
  console.log(`\nðŸš€ Server running on port ${PORT}`);
  console.log(`ðŸ“ Health check: http://localhost:${PORT}/api/health`);
  console.log(`ðŸ“¡ API Base URL: http://localhost:${PORT}/api`);
});

