// Test script to check database data
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://animeking:Anime%40123@cluster0.nzlwj.mongodb.net/inventory_db?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Get models
    const Product = mongoose.model('Product');
    const Transaction = mongoose.model('Transaction');
    const Depot = mongoose.model('Depot');
    
    // Count documents
    const productCount = await Product.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const depotCount = await Depot.countDocuments();
    
    console.log('\n📊 Database Stats:');
    console.log(`Products: ${productCount}`);
    console.log(`Transactions: ${transactionCount}`);
    console.log(`Depots: ${depotCount}`);
    
    // Get sample product
    const sampleProduct = await Product.findOne({ sku: 'LAP-300' });
    if (sampleProduct) {
      console.log('\n📦 Sample Product (LAP-300):');
      console.log(JSON.stringify(sampleProduct, null, 2));
      
      // Get transactions for this product
      const transactions = await Transaction.find({ productId: sampleProduct._id })
        .sort({ timestamp: 1 })
        .limit(5);
      
      console.log(`\n📝 Transactions for LAP-300: ${transactions.length}`);
      transactions.forEach(t => {
        console.log(`  - ${t.transactionDate || t.timestamp}: ${t.transactionType} ${t.quantity} (Stock: ${t.previousStock} → ${t.newStock})`);
      });
    } else {
      console.log('\n❌ Product LAP-300 not found - CSV may not have been imported');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
