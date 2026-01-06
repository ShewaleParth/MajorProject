const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Depot = require('../models/Depot');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const Forecast = require('../models/Forecast');

// GET dashboard stats - formatted for frontend
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.userId;

    const totalProducts = await Product.countDocuments({ userId });
    const lowStockProducts = await Product.countDocuments({ userId, status: 'low-stock' });
    const outOfStockProducts = await Product.countDocuments({ userId, status: 'out-of-stock' });
    const activeAlerts = await Alert.countDocuments({ userId, isResolved: false });

    // Calculate inventory value
    const products = await Product.find({ userId });
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

    // Calculate depot utilization
    const depots = await Depot.find({ userId });
    const totalCapacity = depots.reduce((sum, d) => sum + d.capacity, 0);
    const totalUtilization = depots.reduce((sum, d) => sum + d.currentUtilization, 0);
    const utilizationPercent = totalCapacity > 0 ? ((totalUtilization / totalCapacity) * 100).toFixed(1) : 0;

    // Format as KPIs for frontend
    res.json({
      kpis: [
        {
          title: 'Total Products',
          value: totalProducts,
          change: 0,
          changeType: 'neutral'
        },
        {
          title: 'Inventory Value',
          value: `₹${inventoryValue.toLocaleString('en-IN')}`,
          change: 0,
          changeType: 'neutral'
        },
        {
          title: 'Depot Utilization',
          value: `${utilizationPercent}%`,
          change: 0,
          changeType: 'neutral'
        },
        {
          title: 'Active Alerts',
          value: activeAlerts,
          change: 0,
          changeType: activeAlerts > 0 ? 'negative' : 'positive'
        }
      ],
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      activeAlerts,
      inventoryValue,
      depotUtilization: utilizationPercent
    });
  } catch (error) {
    next(error);
  }
});

// GET top SKUs - formatted for frontend
router.get('/top-skus', async (req, res, next) => {
  try {
    const userId = req.userId;

    const products = await Product.find({ userId })
      .sort({ stock: -1 })
      .limit(10)
      .select('sku name stock category dailySales weeklySales');

    const topSKUs = products.map(p => ({
      sku: p.sku,
      name: p.name,
      currentStock: p.stock,
      predictedDemand: Math.round((p.dailySales || 5) * 7), // 7 days prediction
      category: p.category
    }));

    res.json({ topSKUs });
  } catch (error) {
    next(error);
  }
});

// GET sales trend - formatted for frontend
router.get('/sales-trend', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const transactions = await Transaction.find({
      userId,
      timestamp: { $gte: startDate },
      transactionType: 'stock-out'
    }).sort({ timestamp: 1 });

    // Group by date
    const trendMap = {};
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trendMap[date]) {
        trendMap[date] = { sales: 0, predicted: 0 };
      }
      trendMap[date].sales += tx.quantity;
      trendMap[date].predicted += tx.quantity * 1.1; // Mock prediction
    });

    const trendData = Object.keys(trendMap).map(date => ({
      date,
      sales: trendMap[date].sales,
      predicted: Math.round(trendMap[date].predicted)
    }));

    res.json({ trendData, transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
