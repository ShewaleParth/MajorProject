const Product = require('../models/Product');

/**
 * Generate unique SKU based on category
 * @param {string} category - Product category
 * @returns {Promise<string>} Unique SKU
 */
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

module.exports = {
  generateUniqueSKU
};
