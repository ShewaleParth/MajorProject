// NOTE: This is a placeholder for depot routes
// The full implementation should be extracted from server.js

const express = require('express');
const router = express.Router();
const Depot = require('../models/Depot');
const Product = require('../models/Product');

// GET all depots
router.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const depots = await Depot.find({ userId }).sort({ createdAt: -1 });

    res.json({
      depots: depots.map(depot => ({
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status,
        products: depot.products,
        createdAt: depot.createdAt
      })),
      total: depots.length
    });
  } catch (error) {
    next(error);
  }
});

// POST - Create depot
router.post('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, location, capacity } = req.body;

    const depot = new Depot({
      userId,
      name,
      location,
      capacity,
      currentUtilization: 0,
      itemsStored: 0,
      products: [],
      status: 'normal'
    });

    await depot.save();

    res.status(201).json({
      message: 'Depot created successfully',
      depot
    });
  } catch (error) {
    next(error);
  }
});

// GET depot details with products and transactions
router.get('/:depotId/details', async (req, res, next) => {
  try {
    const { depotId } = req.params;
    const userId = req.userId;
    const Transaction = require('../models/Transaction');

    const depot = await Depot.findOne({ _id: depotId, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Get products that have this depot in their depotDistribution
    const products = await Product.find({
      userId,
      'depotDistribution.depotId': depotId
    });

    // Format products with depot-specific quantity
    const inventoryItems = products.map(product => {
      const depotDist = product.depotDistribution.find(
        d => d.depotId.toString() === depotId
      );
      
      return {
        sku: product.sku,
        productName: product.name,
        category: product.category,
        quantity: depotDist ? depotDist.quantity : 0,
        lastUpdated: depotDist ? depotDist.lastUpdated : product.updatedAt,
        price: product.price,
        status: product.status,
        image: product.image
      };
    });

    // Get recent transactions for this depot (last 10)
    const recentTransactions = await Transaction.find({
      userId,
      $or: [
        { toDepotId: depotId },
        { fromDepotId: depotId }
      ]
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .select('productName productSku transactionType quantity timestamp toDepot fromDepot');

    res.json({
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored || depot.products.length,
        status: depot.status,
        inventory: inventoryItems,
        recentTransactions: recentTransactions.map(tx => ({
          id: tx._id,
          productName: tx.productName,
          productSku: tx.productSku,
          type: tx.transactionType,
          quantity: tx.quantity,
          timestamp: tx.timestamp,
          toDepot: tx.toDepot,
          fromDepot: tx.fromDepot
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE depot
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find and verify depot ownership
    const depot = await Depot.findOne({ _id: id, userId });
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Find all products that have this depot in their distribution
    const affectedProducts = await Product.find({
      userId,
      'depotDistribution.depotId': id
    });

    // Remove depot from each product's distribution array
    for (const product of affectedProducts) {
      product.depotDistribution = product.depotDistribution.filter(
        d => d.depotId.toString() !== id
      );
      await product.save(); // Triggers pre-save hook to recalculate stock
    }

    // Delete the depot
    await Depot.deleteOne({ _id: id });

    res.json({
      message: 'Depot deleted successfully',
      affectedProducts: affectedProducts.length
    });
  } catch (error) {
    next(error);
  }
});

// TODO: Add remaining routes:
// - GET /depots/network/metrics
// - PUT /depots/:id
// Extract from server.js

module.exports = router;
