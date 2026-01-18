const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low-stock', 'out-of-stock', 'demand-spike', 'capacity-warning', 'anomaly'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolutionNotes: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
