/**
 * Check transactions and create samples if needed
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function checkTransactions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        console.log(`👤 User: ${user.email}\n`);

        // Check existing transactions
        const transactions = await Transaction.find({ userId: user._id });
        console.log(`📊 Existing Transactions: ${transactions.length}\n`);

        if (transactions.length === 0) {
            console.log('❌ No transactions found!');
            console.log('🔧 The Movement & Transactions page is empty because there are no transactions.\n');

            console.log('💡 To populate transactions, you need to:');
            console.log('   1. Go to Inventory Overview');
            console.log('   2. Click on a product');
            console.log('   3. Use "Stock In", "Stock Out", or "Transfer" buttons\n');

            console.log('📝 Or I can create sample transactions for testing...\n');

            // Get some products and depots for sample data
            const products = await Product.find({ userId: user._id }).limit(5);
            const depots = await Depot.find({ userId: user._id });

            console.log(`Found ${products.length} products and ${depots.length} depots`);
            console.log('\nWould you like me to create sample transactions? (Y/N)');

        } else {
            console.log('✅ Transactions exist!');
            console.log('\nSample transactions:');
            transactions.slice(0, 5).forEach(tx => {
                console.log(`   - ${tx.transactionType}: ${tx.productName} (${tx.quantity} units)`);
                console.log(`     From: ${tx.fromDepot || 'External'} → To: ${tx.toDepot || 'External'}`);
                console.log(`     Date: ${new Date(tx.timestamp).toLocaleString()}\n`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkTransactions();
