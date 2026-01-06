const Product = require('../models/Product');

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

// Update product status based on stock levels
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

// Calculate total stock across all depots for a product
const calculateProductTotalStock = async (productId, userId) => {
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
};

// Update product stock from depot distribution
const updateProductStockFromDepots = async (productId, userId) => {
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
};

module.exports = {
  generateUniqueSKU,
  updateProductStatus,
  calculateProductTotalStock,
  updateProductStockFromDepots
};
