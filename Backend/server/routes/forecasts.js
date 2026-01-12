const express = require('express');
const router = express.Router();
const Forecast = require('../models/Forecast');

// GET all forecasts
router.get('/', async (req, res, next) => {
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
    next(error);
  }
});

// GET forecast by SKU or Item ID
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const userId = req.userId;

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
    next(error);
  }
});

// POST - Create or update forecast
router.post('/', async (req, res, next) => {
  try {
    const { itemId, sku } = req.body;
    const userId = req.userId;

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
    next(error);
  }
});

// GET forecast analytics insights - Enhanced with product-based recommendations
router.get('/analytics/insights', async (req, res, next) => {
  try {
    const userId = req.userId;
    const Product = require('../models/Product');

    // Find products that are low on stock or out of stock
    const atRiskProducts = await Product.find({
      userId,
      $or: [
        { status: 'low-stock' },
        { status: 'out-of-stock' }
      ]
    }).limit(10);

    const topReorders = atRiskProducts.map(p => ({
      name: p.name,
      sku: p.sku,
      currentStock: p.stock,
      reorderPoint: p.reorderPoint,
      priority: p.status === 'out-of-stock' ? 'Very High' : 'High',
      predictedDemand: Math.round((p.dailySales || 5) * 7) // Simple 7-day projection
    }));

    res.json({
      topReorders,
      summary: {
        criticalCount: topReorders.filter(t => t.priority === 'Very High').length,
        warningCount: topReorders.filter(t => t.priority === 'High').length
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
