const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productSku: { type: String, required: true },
  transactionType: {
    type: String,
    enum: ['stock-in', 'stock-out', 'transfer', 'adjustment'],
    required: true
  },
  quantity: { type: Number, required: true },
  fromDepot: { type: String },
  toDepot: { type: String },
  fromDepotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },
  toDepotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String },
  notes: { type: String },
  performedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
