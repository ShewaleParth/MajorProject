const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetModel: { type: String, default: 'User' },
  targetName: { type: String, default: 'System Wide' },
  title: { type: String },
  format: { type: String, default: 'pdf' },
  dateRange: {
    start: Date,
    end: Date
  },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  progress: { type: Number, default: 0 },
  aiSummary: {
    executive: String,
    keyInsights: [String],
    recommendations: [String],
    alerts: [String],
    metrics: mongoose.Schema.Types.Mixed
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  error: String,
  data: mongoose.Schema.Types.Mixed,
  generatedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
