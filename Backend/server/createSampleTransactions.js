/**
 * Create sample transactions for Movement & Transactions page
 * Creates realistic transaction history with Stock In, Stock Out, and Transfers
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    productSku: String,
    transactionType: { type: String, enum: ['stock-in', 'stock-out', 'transfer'], required: true },
    quantity: { type: Number, required: true },
    fromDepot: String,
    fromDepotId: mongoose.Schema.Types.ObjectId,
    toDepot: String,
    toDepotId: mongoose.Schema.Types.ObjectId,
    reason: String,
    performedBy: String,
    previousStock: Number,
    newStock: Number,
    timestamp: { type: Date, default: Date.now }
});

async function createSampleTransactions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Transaction = mongoose.model('Transaction', transactionSchema);
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        console.log(`👤 User: ${user.email}\n`);

        // Get products and depots
        const products = await Product.find({ userId: user._id }).limit(20);
        const depots = await Depot.find({ userId: user._id });

        console.log(`📦 Found ${products.length} products`);
        console.log(`🏢 Found ${depots.length} depots\n`);

        if (products.length === 0 || depots.length === 0) {
            console.log('❌ Need products and depots to create transactions!');
            process.exit(1);
        }

        console.log('🔧 Creating sample transactions...\n');

        const reasons = {
            'stock-in': ['Restock from supplier', 'New shipment arrived', 'Inventory replenishment', 'Bulk order received', 'Seasonal stock'],
            'stock-out': ['Customer order', 'Retail sale', 'Online order fulfillment', 'Wholesale dispatch', 'Store transfer'],
            'transfer': ['Depot rebalancing', 'Stock redistribution', 'Demand-based transfer', 'Inventory optimization', 'Emergency stock move']
        };

        const transactions = [];
        const now = new Date();

        // Create 30 transactions over the last 30 days
        for (let i = 0; i < 30; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const daysAgo = Math.floor(Math.random() * 30);
            const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);

            // Determine transaction type (40% stock-in, 35% stock-out, 25% transfer)
            const rand = Math.random();
            let transactionType;
            if (rand < 0.4) transactionType = 'stock-in';
            else if (rand < 0.75) transactionType = 'stock-out';
            else transactionType = 'transfer';

            const quantity = Math.floor(Math.random() * 150) + 10; // 10-160 units
            const currentStock = product.stock || 0;

            let fromDepot = null;
            let fromDepotId = null;
            let toDepot = null;
            let toDepotId = null;
            let previousStock = currentStock;
            let newStock = currentStock;

            if (transactionType === 'stock-in') {
                const depot = depots[Math.floor(Math.random() * depots.length)];
                toDepot = depot.name;
                toDepotId = depot._id;
                newStock = currentStock + quantity;
            } else if (transactionType === 'stock-out') {
                const depot = depots[Math.floor(Math.random() * depots.length)];
                fromDepot = depot.name;
                fromDepotId = depot._id;
                newStock = Math.max(0, currentStock - quantity);
            } else { // transfer
                const fromDepotObj = depots[Math.floor(Math.random() * depots.length)];
                let toDepotObj = depots[Math.floor(Math.random() * depots.length)];
                // Ensure different depots
                while (toDepotObj._id.toString() === fromDepotObj._id.toString() && depots.length > 1) {
                    toDepotObj = depots[Math.floor(Math.random() * depots.length)];
                }
                fromDepot = fromDepotObj.name;
                fromDepotId = fromDepotObj._id;
                toDepot = toDepotObj.name;
                toDepotId = toDepotObj._id;
                newStock = currentStock; // Transfer doesn't change total stock
            }

            const reason = reasons[transactionType][Math.floor(Math.random() * reasons[transactionType].length)];

            transactions.push({
                userId: user._id,
                productId: product._id,
                productName: product.name,
                productSku: product.sku,
                transactionType,
                quantity,
                fromDepot,
                fromDepotId,
                toDepot,
                toDepotId,
                reason,
                performedBy: user.email || 'Admin',
                previousStock,
                newStock,
                timestamp
            });
        }

        // Sort by timestamp (oldest first)
        transactions.sort((a, b) => a.timestamp - b.timestamp);

        // Insert transactions
        await Transaction.insertMany(transactions);

        console.log('═'.repeat(60));
        console.log(`✅ Created ${transactions.length} sample transactions!`);
        console.log('═'.repeat(60));

        // Show summary
        const stockIn = transactions.filter(t => t.transactionType === 'stock-in').length;
        const stockOut = transactions.filter(t => t.transactionType === 'stock-out').length;
        const transfers = transactions.filter(t => t.transactionType === 'transfer').length;

        console.log('\n📊 Transaction Summary:\n');
        console.log(`   📥 Stock In: ${stockIn} transactions`);
        console.log(`   📤 Stock Out: ${stockOut} transactions`);
        console.log(`   🔄 Transfers: ${transfers} transactions`);
        console.log(`   📅 Date Range: Last 30 days`);
        console.log(`   🏢 Depots: ${depots.length} depots involved`);
        console.log(`   📦 Products: ${new Set(transactions.map(t => t.productSku)).size} unique products`);

        console.log('\n📋 Sample Transactions:\n');
        transactions.slice(0, 5).forEach(tx => {
            console.log(`   ${tx.transactionType.toUpperCase()}: ${tx.productName}`);
            console.log(`      Quantity: ${tx.quantity} units`);
            if (tx.fromDepot) console.log(`      From: ${tx.fromDepot}`);
            if (tx.toDepot) console.log(`      To: ${tx.toDepot}`);
            console.log(`      Reason: ${tx.reason}`);
            console.log(`      Date: ${tx.timestamp.toLocaleDateString()}\n`);
        });

        console.log('✅ All done! Refresh your Movement & Transactions page to see the data!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

createSampleTransactions();
