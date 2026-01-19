const mongoose = require('mongoose');

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

module.exports = mongoose.model('Forecast', forecastSchema);
