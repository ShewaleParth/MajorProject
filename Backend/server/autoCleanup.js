// autoCleanup.js - Automatically run on server startup to remove orphaned data
const mongoose = require('mongoose');

async function cleanupOrphanedData() {
  try {
    // Get all collections
    const Product = mongoose.model('Product');
    const Depot = mongoose.model('Depot');
    const Transaction = mongoose.model('Transaction');
    const Alert = mongoose.model('Alert');
    const Forecast = mongoose.model('Forecast');

    // Delete data without userId (orphaned sample data)
    const productResult = await Product.deleteMany({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });
    
    const depotResult = await Depot.deleteMany({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });
    
    const transactionResult = await Transaction.deleteMany({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });
    
    const forecastResult = await Forecast.deleteMany({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    });

    // Clean up orphaned alerts
    const validProductIds = await Product.find().distinct('_id');
    const validDepotIds = await Depot.find().distinct('_id');
    
    const alertResult = await Alert.deleteMany({
      $or: [
        { productId: { $exists: true, $nin: validProductIds } },
        { depotId: { $exists: true, $nin: validDepotIds } }
      ]
    });

    const totalDeleted = productResult.deletedCount + depotResult.deletedCount + 
                        transactionResult.deletedCount + forecastResult.deletedCount + 
                        alertResult.deletedCount;

    if (totalDeleted > 0) {
      console.log('🧹 Cleaned up orphaned sample data:');
      console.log(`   - Products: ${productResult.deletedCount}`);
      console.log(`   - Depots: ${depotResult.deletedCount}`);
      console.log(`   - Transactions: ${transactionResult.deletedCount}`);
      console.log(`   - Forecasts: ${forecastResult.deletedCount}`);
      console.log(`   - Alerts: ${alertResult.deletedCount}`);
    }
  } catch (error) {
    console.error('Error during auto-cleanup:', error.message);
  }
}

module.exports = { cleanupOrphanedData };
