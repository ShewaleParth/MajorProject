const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'low-stock',           // Low stock threshold
      'out-of-stock',        // Out of stock
      'overstock',           // Overstock alert
      'reorder-point',       // Reorder point (AI-based)
      'expiry-warning',      // Expiry alert for perishable goods
      'demand-spike',        // Unusual demand spike (AI)
      'delayed-delivery',    // Delayed supplier delivery
      'transfer-failed',     // Failed stock transfer
      'capacity-warning',    // Depot capacity warning
      'anomaly'              // General anomaly
    ],
    required: true
  },
  category: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true,
    default: 'info'
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
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional context (supplier, transfer details, etc.)
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, isRead: 1 });
alertSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Alert', alertSchema);

