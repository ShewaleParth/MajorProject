// NOTE: This is a placeholder for product routes
// The full implementation should be extracted from server.js lines 662-1300+
// Due to the large size, this shows the structure

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Depot = require('../models/Depot');
const Transaction = require('../models/Transaction');
const { generateUniqueSKU, updateProductStatus, updateProductStockFromDepots } = require('../utils/productHelpers');
const { createStockAlert } = require('../utils/alertHelpers');
const { recalculateDepotMetrics } = require('../utils/depotHelpers');

// GET all products
router.get('/', async (req, res, next) => {
  try {
    const { search, category, status, location, page = 1, limit = 50 } = req.query;
    const query = { userId: req.userId };

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
    next(error);
  }
});

// POST - Create product
router.post('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    let { sku, name, category, stock, reorderPoint, supplier, price, depotId, depotQuantity, image } = req.body;

    if (!depotId) {
      return res.status(400).json({ message: 'Depot assignment is required for all products' });
    }

    if (!sku) {
      sku = await generateUniqueSKU(category);
    }

    const depot = await Depot.findOne({ _id: depotId, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    const assignedQuantity = depotQuantity || stock;

    let product = new Product({
      userId,
      sku,
      name,
      category,
      stock: assignedQuantity,
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

    await product.save();

    // Update depot's products array
    depot.products.push({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      quantity: assignedQuantity,
      lastUpdated: new Date()
    });
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
      reason: 'Initial stock',
      performedBy: 'System'
    });
    await transaction.save();

    await createStockAlert(product, userId);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// POST - Bulk upload products (CSV import)
router.post('/bulk', async (req, res, next) => {
  try {
    const productsData = req.body;
    const userId = req.userId;

    console.log('Bulk upload request received:', { 
      itemCount: Array.isArray(productsData) ? productsData.length : 'not an array',
      firstItem: Array.isArray(productsData) && productsData.length > 0 ? productsData[0] : null
    });

    if (!Array.isArray(productsData)) {
      return res.status(400).json({ 
        message: 'Input must be an array of products',
        received: typeof productsData
      });
    }

    if (productsData.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of productsData) {
      try {
        // Field mapping - handle both camelCase and lowercase
        const sku = item.sku || item.SKU;
        const name = item.name || item.Name || item.productname;
        const category = item.category || item.Category;
        const stock = item.stock || item.Stock || item.quantity;
        const price = item.price || item.Price;
        const supplier = item.supplier || item.Supplier;
        const reorderPoint = item.reorderpoint || item.reorderPoint || item.ReorderPoint;
        const dailySales = item.dailysales || item.dailySales || item.DailySales;
        const weeklySales = item.weeklysales || item.weeklySales || item.WeeklySales;
        const brand = item.brand || item.Brand;
        const leadTime = item.leadtime || item.leadTime || item.LeadTime;

        // Basic validation
        if (!sku || !name) {
          throw new Error(`Missing required fields: ${!sku ? 'sku' : ''} ${!name ? 'name' : ''}`.trim());
        }

        // Check if exists
        let product = await Product.findOne({ sku, userId });

        if (product) {
          // Update existing
          if (name) product.name = name;
          if (category) product.category = category;
          if (stock !== undefined) product.stock = Number(stock);
          if (reorderPoint !== undefined) product.reorderPoint = Number(reorderPoint);
          if (supplier) product.supplier = supplier;
          if (price !== undefined) product.price = Number(price);
          if (dailySales !== undefined) product.dailySales = Number(dailySales);
          if (weeklySales !== undefined) product.weeklySales = Number(weeklySales);
          if (brand) product.brand = brand;
          if (leadTime !== undefined) product.leadTime = Number(leadTime);
          product.updatedAt = new Date();
        } else {
          // Create new
          product = new Product({
            userId,
            sku,
            name,
            category: category || 'Uncategorized',
            stock: Number(stock) || 0,
            reorderPoint: Number(reorderPoint) || 10,
            supplier: supplier || 'Unknown',
            price: Number(price) || 0,
            dailySales: Number(dailySales) || 5,
            weeklySales: Number(weeklySales) || 35,
            brand: brand || 'Generic',
            leadTime: Number(leadTime) || 7,
            image: item.image || '',
            depotDistribution: []
          });
        }

        await product.save();
        await createStockAlert(product, userId);
        results.success++;
      } catch (err) {
        console.error(`Error processing item ${item.sku}:`, err.message);
        results.failed++;
        results.errors.push({ 
          sku: item.sku || 'unknown', 
          error: err.message,
          item: item // Include the problematic item for debugging
        });
      }
    }

    console.log('Bulk upload results:', results);

    res.json({
      message: `Processed ${productsData.length} items`,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    next(error);
  }
});

// GET - Get product details with full analytics
router.get('/:id/details', async (req, res, next) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;
    const Transaction = require('../models/Transaction');

    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get all transactions for this product
    const transactions = await Transaction.find({
      userId,
      productId: productId
    }).sort({ timestamp: -1 });

    // Calculate analytics
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const monthlyTransactions = transactions.filter(t => new Date(t.timestamp) >= oneMonthAgo);
    const weeklyTransactions = transactions.filter(t => new Date(t.timestamp) >= oneWeekAgo);
    const yearlyTransactions = transactions.filter(t => new Date(t.timestamp) >= oneYearAgo);

    const calculateStats = (txList) => {
      const stockIn = txList.filter(t => t.transactionType === 'stock-in').reduce((sum, t) => sum + t.quantity, 0);
      const stockOut = txList.filter(t => t.transactionType === 'stock-out').reduce((sum, t) => sum + t.quantity, 0);
      const transfers = txList.filter(t => t.transactionType === 'transfer').length;
      return { stockIn, stockOut, netChange: stockIn - stockOut, transfers, total: txList.length };
    };

    // Group transactions by month for chart data
    const monthlyData = {};
    yearlyTransactions.forEach(tx => {
      const month = new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { stockIn: 0, stockOut: 0, transfers: 0 };
      }
      if (tx.transactionType === 'stock-in') monthlyData[month].stockIn += tx.quantity;
      if (tx.transactionType === 'stock-out') monthlyData[month].stockOut += tx.quantity;
      if (tx.transactionType === 'transfer') monthlyData[month].transfers += 1;
    });

    const chartData = Object.keys(monthlyData).map(month => ({
      month,
      stockIn: monthlyData[month].stockIn,
      stockOut: monthlyData[month].stockOut,
      transfers: monthlyData[month].transfers
    }));

    res.json({
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        reorderPoint: product.reorderPoint,
        status: product.status,
        supplier: product.supplier,
        brand: product.brand,
        leadTime: product.leadTime,
        dailySales: product.dailySales,
        weeklySales: product.weeklySales,
        image: product.image,
        depotDistribution: product.depotDistribution || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      },
      transactions: transactions.map(tx => ({
        id: tx._id,
        type: tx.transactionType,
        quantity: tx.quantity,
        timestamp: tx.timestamp,
        fromDepot: tx.fromDepot,
        toDepot: tx.toDepot,
        fromDepotId: tx.fromDepotId,
        toDepotId: tx.toDepotId,
        reason: tx.reason,
        performedBy: tx.performedBy,
        previousStock: tx.previousStock,
        newStock: tx.newStock
      })),
      analytics: {
        totalTransactions: transactions.length,
        monthlyStats: calculateStats(monthlyTransactions),
        weeklyStats: calculateStats(weeklyTransactions),
        yearlyStats: calculateStats(yearlyTransactions),
        chartData: chartData.reverse() // Oldest to newest for chart
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET - Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const product = await Product.findOne({ _id: req.params.id, userId });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// PUT - Update product
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;

    const product = await Product.findOne({ _id: req.params.id, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent Mass Assignment - Explicitly update allowed fields
    const { sku, name, category, stock, reorderPoint, supplier, price, image, dailySales, weeklySales, brand, leadTime } = req.body;

    if (sku) product.sku = sku;
    if (name) product.name = name;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (reorderPoint !== undefined) product.reorderPoint = reorderPoint;
    if (supplier) product.supplier = supplier;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (dailySales !== undefined) product.dailySales = dailySales;
    if (weeklySales !== undefined) product.weeklySales = weeklySales;
    if (brand) product.brand = brand;
    if (leadTime !== undefined) product.leadTime = leadTime;

    product.updatedAt = new Date();
    await product.save();
    await createStockAlert(product, userId);

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// DELETE - Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const Alert = require('../models/Alert');
    
    const product = await Product.findOne({ _id: req.params.id, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    await Alert.deleteMany({ productId: req.params.id, userId });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET - Get all categories
router.get('/categories/list', async (req, res, next) => {
  try {
    const userId = req.userId;
    const categories = await Product.distinct('category', { userId });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
