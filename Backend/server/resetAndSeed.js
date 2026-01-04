const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventroops';

const User = mongoose.model('User', new mongoose.Schema({
    first_name: String, last_name: String, email: String, role: String, createdAt: Date
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    sku: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    reorderPoint: { type: Number, required: true, default: 10 },
    supplier: { type: String, required: true },
    price: { type: Number, required: true },
    status: String
}));

const Depot = mongoose.model('Depot', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentUtilization: { type: Number, default: 0 },
    itemsStored: { type: Number, default: 0 }
}));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    productSku: String,
    productName: String,
    transactionType: String,
    quantity: Number,
    fromDepot: String,
    toDepot: String,
    timestamp: { type: Date, default: Date.now },
}));

const Forecast = mongoose.model('Forecast', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    itemId: String,
    productName: String,
    sku: String,
    currentStock: Number,
    stockStatusPred: String,
    priorityPred: String,
    alert: String,
    forecastData: [{
        date: String,
        predicted: Number,
        actual: Number
    }]
}));

const main = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB...');

        // Clear everything
        await User.deleteMany({});
        await Product.deleteMany({});
        await Depot.deleteMany({});
        await Transaction.deleteMany({});
        await Forecast.deleteMany({});

        // Create Default User
        const user = new User({
            first_name: 'Parth',
            last_name: 'Admin',
            email: 'admin@inventroops.com',
            role: 'admin',
            createdAt: new Date()
        });
        await user.save();
        console.log('Created Admin User:', user.email);

        // Create Products
        const products = await Product.insertMany([
            { userId: user._id, sku: 'NIKE-001', name: 'Air Jordan 1 Retro "Chicago"', category: 'Sneakers', stock: 75, price: 1289, status: 'in-stock', reorderPoint: 20, supplier: 'Nike' },
            { userId: user._id, sku: 'NIKE-002', name: 'Nike Air Max 270', category: 'Sneakers', stock: 12, price: 999, status: 'low-stock', reorderPoint: 25, supplier: 'Nike' },
            { userId: user._id, sku: 'ADID-001', name: 'Ultraboost 22', category: 'Sneakers', stock: 45, price: 549, status: 'in-stock', reorderPoint: 15, supplier: 'Adidas' },
            { userId: user._id, sku: 'APPLE-15', name: 'iPhone 15 Case', category: 'Electronics', stock: 120, price: 29, status: 'in-stock', reorderPoint: 30, supplier: 'Apple' }
        ]);
        console.log('Created Products...');

        // Create Depots
        const depots = await Depot.insertMany([
            { userId: user._id, name: 'Mumbai Central Hub', location: 'Mumbai', capacity: 5000, currentUtilization: 1200, itemsStored: 100 },
            { userId: user._id, name: 'Delhi Distribution Hub', location: 'Delhi', capacity: 8000, currentUtilization: 4500, itemsStored: 250 }
        ]);
        console.log('Created Depots...');

        // Create Transactions
        const txs = [];
        for (let i = 0; i < 40; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(i / 5));
            const prod = products[i % products.length];
            txs.push({
                userId: user._id,
                productId: prod._id,
                productSku: prod.sku,
                productName: prod.name,
                transactionType: i % 3 === 0 ? 'stock-in' : 'stock-out',
                quantity: Math.floor(Math.random() * 15) + 1,
                fromDepot: i % 3 === 0 ? 'International Supplier' : depots[0].name,
                toDepot: i % 3 === 0 ? depots[0].name : 'End Customer',
                timestamp: date
            });
        }
        await Transaction.insertMany(txs);
        console.log('Created Transactions...');

        // Create Forecasts (AI Demand)
        const forecasts = [];
        for (const prod of products) {
            const fData = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i);
                fData.push({
                    date: d.toISOString().split('T')[0],
                    predicted: Math.floor(Math.random() * 20) + 10,
                    actual: i === 0 ? Math.floor(Math.random() * 15) + 5 : null
                });
            }
            forecasts.push({
                userId: user._id,
                itemId: prod._id,
                productName: prod.name,
                sku: prod.sku,
                currentStock: prod.stock,
                stockStatusPred: prod.stock < 30 ? 'Understock' : 'Healthy',
                priorityPred: prod.stock < 20 ? 'High' : 'Medium',
                alert: prod.stock < 20 ? 'Critical restock recommended' : 'Monitor stock levels',
                forecastData: fData
            });
        }
        await Forecast.insertMany(forecasts);
        console.log('Created AI Forecasts...');

        console.log('✅ RE-SEED COMPLETE! Parth, your dashboard should now show 100% real data act.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

main();
