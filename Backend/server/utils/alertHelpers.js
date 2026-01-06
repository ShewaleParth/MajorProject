const Alert = require('../models/Alert');

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
      const alert = new Alert({
        userId,
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

module.exports = {
  createStockAlert
};
