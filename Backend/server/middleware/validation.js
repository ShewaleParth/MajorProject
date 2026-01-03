// middleware/validation.js
const Joi = require('joi');

// Product validation schema
const productSchema = Joi.object({
  sku: Joi.string().trim().min(1).max(50).required(),
  name: Joi.string().trim().min(1).max(200).required(),
  category: Joi.string().trim().required(),
  stock: Joi.number().integer().min(0).required(),
  reorderPoint: Joi.number().integer().min(0).required(),
  supplier: Joi.string().trim().min(1).max(200).required(),
  price: Joi.number().min(0).required(),
  depotId: Joi.string().required(),
  depotQuantity: Joi.number().integer().min(0).optional(),
  // ML fields
  dailySales: Joi.number().min(0).optional(),
  weeklySales: Joi.number().min(0).optional(),
  brand: Joi.string().max(100).optional(),
  leadTime: Joi.number().integer().min(0).optional()
});

// Depot validation schema
const depotSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  location: Joi.string().trim().min(1).max(300).required(),
  capacity: Joi.number().integer().min(1).required(),
  type: Joi.string().valid('warehouse', 'store', 'distribution-center').optional()
});

// Transaction validation schema
const transactionSchema = Joi.object({
  transactionType: Joi.string().valid('stock-in', 'stock-out', 'adjustment', 'transfer').required(),
  quantity: Joi.number().integer().min(1).required(),
  depotId: Joi.string().when('transactionType', {
    is: Joi.string().valid('stock-in', 'stock-out'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  fromDepotId: Joi.string().when('transactionType', {
    is: 'transfer',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  toDepotId: Joi.string().when('transactionType', {
    is: 'transfer',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  reason: Joi.string().max(500).optional(),
  notes: Joi.string().max(1000).optional(),
  performedBy: Joi.string().max(100).optional()
});

// Auth validation schemas - SIMPLIFIED
const signupSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.any().optional(),
  organizationName: Joi.any().optional()
}).unknown(true); // Allow any other fields

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  productSchema,
  depotSchema,
  transactionSchema,
  signupSchema,
  loginSchema
};
