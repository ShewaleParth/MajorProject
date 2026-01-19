const Alert = require('../models/Alert');
const Depot = require('../models/Depot');

// Create stock alert if needed
const createStockAlert = async (product, userId) => {
  if (product.status === 'low-stock' || product.status === 'out-of-stock') {
    const existingAlert = await Alert.findOne({
      userId,
      productId: product._id,
      type: product.status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
      isResolved: false
    });

    if (!existingAlert) {
      const isOutOfStock = product.status === 'out-of-stock';
      const alert = new Alert({
        userId,
        type: isOutOfStock ? 'out-of-stock' : 'low-stock',
        category: isOutOfStock ? 'critical' : 'warning',
        title: `${isOutOfStock ? 'Out of Stock' : 'Low Stock'} Alert`,
        description: `${product.name} (${product.sku}) ${isOutOfStock ? 'is out of stock' : `has only ${product.stock} units remaining`}`,
        severity: isOutOfStock ? 'high' : 'medium',
        productId: product._id
      });
      await alert.save();
      console.log(`✅ Created ${isOutOfStock ? 'out-of-stock' : 'low-stock'} alert for ${product.name}`);
    }
  }

  // Check for overstock
  if (product.status === 'overstock') {
    const existingAlert = await Alert.findOne({
      userId,
      productId: product._id,
      type: 'overstock',
      isResolved: false
    });

    if (!existingAlert) {
      const alert = new Alert({
        userId,
        type: 'overstock',
        category: 'warning',
        title: 'Overstock Alert',
        description: `${product.name} (${product.sku}) has ${product.stock} units, which is ${Math.round((product.stock / product.reorderPoint) * 100)}% above normal levels`,
        severity: 'medium',
        productId: product._id
      });
      await alert.save();
      console.log(`✅ Created overstock alert for ${product.name}`);
    }
  }

  // Check for reorder point
  if (product.stock <= product.reorderPoint && product.stock > 0) {
    const existingAlert = await Alert.findOne({
      userId,
      productId: product._id,
      type: 'reorder-point',
      isResolved: false
    });

    if (!existingAlert) {
      const alert = new Alert({
        userId,
        type: 'reorder-point',
        category: 'warning',
        title: 'Reorder Point Reached',
        description: `${product.name} (${product.sku}) has reached reorder point. Current stock: ${product.stock}, Reorder point: ${product.reorderPoint}`,
        severity: 'medium',
        productId: product._id,
        metadata: {
          currentStock: product.stock,
          reorderPoint: product.reorderPoint,
          suggestedOrderQty: product.reorderPoint * 2
        }
      });
      await alert.save();
      console.log(`✅ Created reorder-point alert for ${product.name}`);
    }
  }
};

// Check depot capacity and create alert if needed
const checkDepotCapacity = async (depotId, userId) => {
  try {
    const depot = await Depot.findOne({ _id: depotId, userId });
    if (!depot) return;

    const utilizationPercent = (depot.currentUtilization / depot.capacity) * 100;

    // Create alert if utilization is above 85%
    if (utilizationPercent >= 85) {
      const existingAlert = await Alert.findOne({
        userId,
        depotId: depot._id,
        type: 'capacity-warning',
        isResolved: false
      });

      if (!existingAlert) {
        const alert = new Alert({
          userId,
          type: 'capacity-warning',
          category: utilizationPercent >= 95 ? 'critical' : 'warning',
          title: `Depot Capacity ${utilizationPercent >= 95 ? 'Critical' : 'Warning'}`,
          description: `${depot.name} is at ${Math.round(utilizationPercent)}% capacity (${depot.currentUtilization}/${depot.capacity} units)`,
          severity: utilizationPercent >= 95 ? 'high' : 'medium',
          depotId: depot._id,
          metadata: {
            utilizationPercent: Math.round(utilizationPercent),
            currentUtilization: depot.currentUtilization,
            capacity: depot.capacity
          }
        });
        await alert.save();
        console.log(`✅ Created capacity warning for depot ${depot.name} (${Math.round(utilizationPercent)}%)`);
      }
    }
  } catch (error) {
    console.error('Error checking depot capacity:', error);
  }
};

module.exports = {
  createStockAlert,
  checkDepotCapacity
};
