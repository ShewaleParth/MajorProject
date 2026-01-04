const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventroops');

// Minimal Schemas for transaction generation
const productSchema = new mongoose.Schema({
    sku: String,
    name: String,
    price: Number,
    stock: Number
});

const depotSchema = new mongoose.Schema({
    name: String,
    location: String
});

const transactionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productSku: String,
    productName: String,
    transactionType: { type: String, enum: ['stock-in', 'stock-out', 'transfer'] },
    quantity: Number,
    fromDepot: String,
    toDepot: String,
    timestamp: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
const Depot = mongoose.model('Depot', depotSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

const addActivity = async () => {
    try {
        console.log('🚀 Starting live activity generation...');

        const products = await Product.find();
        const depots = await Depot.find();

        if (products.length === 0 || depots.length === 0) {
            console.log('❌ Error: No products or depots found. Please seed the database first.');
            process.exit(1);
        }

        const transactions = [];
        const now = new Date();

        // Generate activity for the last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);

            // 5-10 transactions per day
            const dailyCount = Math.floor(Math.random() * 5) + 5;

            for (let j = 0; j < dailyCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const type = ['stock-in', 'stock-out', 'transfer'][Math.floor(Math.random() * 3)];
                const quantity = Math.floor(Math.random() * 10) + 1;

                // Adjust time of day
                const txDate = new Date(date);
                txDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

                const tx = {
                    productId: product._id,
                    productSku: product.sku,
                    productName: product.name,
                    transactionType: type,
                    quantity: quantity,
                    timestamp: txDate
                };

                if (type === 'transfer') {
                    tx.fromDepot = depots[0].name;
                    tx.toDepot = depots[1].name;
                } else if (type === 'stock-in') {
                    tx.toDepot = depots[Math.floor(Math.random() * depots.length)].name;
                } else {
                    tx.fromDepot = depots[Math.floor(Math.random() * depots.length)].name;
                }

                transactions.push(tx);
            }
        }

        await Transaction.insertMany(transactions);
        console.log(`✅ Successfully added ${transactions.length} live transactions!`);
        console.log('📊 Your "Sales Trend" and "Logistics Ledger" will now be populated with real data.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding activity:', error);
        process.exit(1);
    }
};

addActivity();
