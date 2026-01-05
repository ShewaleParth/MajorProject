// cleanupSampleData.js - Remove sample data without userId
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventroops';

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    cleanupSampleData();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Import schemas from server.js (simplified versions)
const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sku: String,
  name: String,
  category: String,
  stock: Number,
  reorderPoint: Number,
  supplier: String,
  price: Number,
  status: String,
  depotDistribution: Array,
  lastSoldDate: Date,
  createdAt: Date,
  updatedAt: Date
});

const depotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  location: String,
  capacity: Number,
  currentUtilization: Number,
  itemsStored: Number,
  products: Array,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  productSku: String,
  transactionType: String,
  quantity: Number,
  fromDepot: String,
  toDepot: String,
  fromDepotId: mongoose.Schema.Types.ObjectId,
  toDepotId: mongoose.Schema.Types.ObjectId,
  previousStock: Number,
  newStock: Number,
  reason: String,
  notes: String,
  performedBy: String,
  timestamp: Date,
  createdAt: Date
});

const alertSchema = new mongoose.Schema({
  type: String,
  title: String,
  description: String,
  severity: String,
  isRead: Boolean,
  isResolved: Boolean,
  resolvedAt: Date,
  resolvedBy: String,
  resolutionNotes: String,
  productId: mongoose.Schema.Types.ObjectId,
  depotId: mongoose.Schema.Types.ObjectId,
  createdAt: Date
});

const forecastSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemId: String,
  productName: String,
  sku: String,
  currentStock: Number,
  stockStatusPred: String,
  priorityPred: String,
  alert: String,
  forecastData: Array,
  inputParams: Object,
  createdAt: Date,
  updatedAt: Date
});

const Product = mongoose.model('Product', productSchema);
const Depot = mongoose.model('Depot', depotSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Alert = mongoose.model('Alert', alertSchema);
const Forecast = mongoose.model('Forecast', forecastSchema);

async function cleanupSampleData() {
  try {
    console.log('\n🧹 Starting cleanup of sample data without userId...\n');

    // Count documents without userId
    const productsWithoutUserId = await Product.countDocuments({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });
    const depotsWithoutUserId = await Depot.countDocuments({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });
    const transactionsWithoutUserId = await Transaction.countDocuments({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });
    const forecastsWithoutUserId = await Forecast.countDocuments({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });

    console.log('📊 Found orphaned data:');
    console.log(`   - Products without userId: ${productsWithoutUserId}`);
    console.log(`   - Depots without userId: ${depotsWithoutUserId}`);
    console.log(`   - Transactions without userId: ${transactionsWithoutUserId}`);
    console.log(`   - Forecasts without userId: ${forecastsWithoutUserId}`);

    if (productsWithoutUserId === 0 && depotsWithoutUserId === 0 && 
        transactionsWithoutUserId === 0 && forecastsWithoutUserId === 0) {
      console.log('\n✅ No orphaned data found. Database is clean!');
      process.exit(0);
      return;
    }

    console.log('\n🗑️  Removing orphaned data...\n');

    // Delete products without userId
    if (productsWithoutUserId > 0) {
      const productResult = await Product.deleteMany({ 
        $or: [{ userId: null }, { userId: { $exists: false } }] 
      });
      console.log(`✅ Deleted ${productResult.deletedCount} products without userId`);
    }

    // Delete depots without userId
    if (depotsWithoutUserId > 0) {
      const depotResult = await Depot.deleteMany({ 
        $or: [{ userId: null }, { userId: { $exists: false } }] 
      });
      console.log(`✅ Deleted ${depotResult.deletedCount} depots without userId`);
    }

    // Delete transactions without userId
    if (transactionsWithoutUserId > 0) {
      const transactionResult = await Transaction.deleteMany({ 
        $or: [{ userId: null }, { userId: { $exists: false } }] 
      });
      console.log(`✅ Deleted ${transactionResult.deletedCount} transactions without userId`);
    }

    // Delete forecasts without userId
    if (forecastsWithoutUserId > 0) {
      const forecastResult = await Forecast.deleteMany({ 
        $or: [{ userId: null }, { userId: { $exists: false } }] 
      });
      console.log(`✅ Deleted ${forecastResult.deletedCount} forecasts without userId`);
    }

    // Delete all alerts (they don't have userId, but are linked to products/depots)
    // Since we deleted products/depots without userId, these alerts are now orphaned
    const orphanedAlerts = await Alert.countDocuments();
    if (orphanedAlerts > 0) {
      // Get all valid product and depot IDs
      const validProductIds = await Product.find().distinct('_id');
      const validDepotIds = await Depot.find().distinct('_id');
      
      // Delete alerts that reference non-existent products or depots
      const alertResult = await Alert.deleteMany({
        $and: [
          {
            $or: [
              { productId: { $exists: true } },
              { depotId: { $exists: true } }
            ]
          },
          {
            $and: [
              { 
                $or: [
                  { productId: { $exists: false } },
                  { productId: { $nin: validProductIds } }
                ]
              },
              {
                $or: [
                  { depotId: { $exists: false } },
                  { depotId: { $nin: validDepotIds } }
                ]
              }
            ]
          }
        ]
      });
      console.log(`✅ Deleted ${alertResult.deletedCount} orphaned alerts`);
    }

    console.log('\n✅ Cleanup completed successfully!');
    console.log('📝 New users will now start with an empty database.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  }
}
