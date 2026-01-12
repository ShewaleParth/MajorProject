// Migration script to assign existing products without depot distribution to random depots
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ Fatal Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        assignDepotsToProducts();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Import schemas
const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    reorderPoint: { type: Number, required: true, default: 10 },
    supplier: { type: String, required: true },
    price: { type: Number, required: true },
    dailySales: { type: Number, default: 5 },
    weeklySales: { type: Number, default: 35 },
    brand: { type: String, default: 'Generic' },
    leadTime: { type: Number, default: 7 },
    depotDistribution: [{
        depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
        depotName: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock', 'overstock'],
        default: 'in-stock'
    },
    image: { type: String },
    lastSoldDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const depotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentUtilization: { type: Number, default: 0 },
    itemsStored: { type: Number, default: 0 },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        productSku: String,
        quantity: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['normal', 'warning', 'critical'],
        default: 'normal'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Depot = mongoose.model('Depot', depotSchema);

async function assignDepotsToProducts() {
    try {
        console.log('\n🔍 Starting depot assignment migration...\n');

        // Find all products without depot distribution
        const productsWithoutDepots = await Product.find({
            $or: [
                { depotDistribution: { $exists: false } },
                { depotDistribution: { $size: 0 } }
            ]
        });

        console.log(`📦 Found ${productsWithoutDepots.length} products without depot assignments`);

        if (productsWithoutDepots.length === 0) {
            console.log('✅ All products already have depot assignments!');
            process.exit(0);
        }

        let assigned = 0;
        let failed = 0;

        for (const product of productsWithoutDepots) {
            try {
                // Get all depots for this user
                const userDepots = await Depot.find({ userId: product.userId });

                if (userDepots.length === 0) {
                    console.log(`⚠️  No depots found for user ${product.userId}, skipping product ${product.sku}`);
                    failed++;
                    continue;
                }

                // Randomly select a depot
                const randomDepot = userDepots[Math.floor(Math.random() * userDepots.length)];

                // Assign product to depot
                product.depotDistribution = [{
                    depotId: randomDepot._id,
                    depotName: randomDepot.name,
                    quantity: product.stock || 0,
                    lastUpdated: new Date()
                }];

                await product.save();

                // Update depot's products array
                const existingProductIndex = randomDepot.products.findIndex(
                    p => p.productId && p.productId.toString() === product._id.toString()
                );

                if (existingProductIndex >= 0) {
                    randomDepot.products[existingProductIndex].quantity = product.stock || 0;
                    randomDepot.products[existingProductIndex].lastUpdated = new Date();
                } else {
                    randomDepot.products.push({
                        productId: product._id,
                        productName: product.name,
                        productSku: product.sku,
                        quantity: product.stock || 0,
                        lastUpdated: new Date()
                    });
                }

                await randomDepot.save();

                console.log(`✅ Assigned ${product.sku} (${product.stock} units) to depot: ${randomDepot.name}`);
                assigned++;

            } catch (err) {
                console.error(`❌ Error assigning depot to ${product.sku}:`, err.message);
                failed++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Successfully assigned: ${assigned}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📦 Total processed: ${productsWithoutDepots.length}\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}
