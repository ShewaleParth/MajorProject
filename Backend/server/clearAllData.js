// clearAllData.js - Complete database wipe (use with caution!)
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventroops';

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    clearAllData();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Import schemas
const productSchema = new mongoose.Schema({}, { strict: false });
const depotSchema = new mongoose.Schema({}, { strict: false });
const transactionSchema = new mongoose.Schema({}, { strict: false });
const alertSchema = new mongoose.Schema({}, { strict: false });
const forecastSchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model('Product', productSchema);
const Depot = mongoose.model('Depot', depotSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Alert = mongoose.model('Alert', alertSchema);
const Forecast = mongoose.model('Forecast', forecastSchema);

async function clearAllData() {
  try {
    console.log('\n🗑️  Clearing ALL data from database...\n');

    // Count existing data
    const productCount = await Product.countDocuments();
    const depotCount = await Depot.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const alertCount = await Alert.countDocuments();
    const forecastCount = await Forecast.countDocuments();

    console.log('📊 Current database contents:');
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Depots: ${depotCount}`);
    console.log(`   - Transactions: ${transactionCount}`);
    console.log(`   - Alerts: ${alertCount}`);
    console.log(`   - Forecasts: ${forecastCount}`);

    if (productCount === 0 && depotCount === 0 && transactionCount === 0 && 
        alertCount === 0 && forecastCount === 0) {
      console.log('\n✅ Database is already empty!');
      process.exit(0);
      return;
    }

    console.log('\n🧹 Deleting all data...\n');

    // Delete ALL data
    await Product.deleteMany({});
    console.log(`✅ Deleted all ${productCount} products`);

    await Depot.deleteMany({});
    console.log(`✅ Deleted all ${depotCount} depots`);

    await Transaction.deleteMany({});
    console.log(`✅ Deleted all ${transactionCount} transactions`);

    await Alert.deleteMany({});
    console.log(`✅ Deleted all ${alertCount} alerts`);

    await Forecast.deleteMany({});
    console.log(`✅ Deleted all ${forecastCount} forecasts`);

    console.log('\n✅ Database completely cleared!');
    console.log('📝 All users will now start with an empty database.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error clearing database:', error);
    process.exit(1);
  }
}
