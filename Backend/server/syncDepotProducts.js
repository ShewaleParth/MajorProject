// Enhanced migration script to sync depot products arrays with product depot distributions
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ Fatal Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        syncDepotProductArrays();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

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
    status: String,
    image: String,
    lastSoldDate: Date,
    createdAt: Date,
    updatedAt: Date
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
    status: String,
    createdAt: Date,
    updatedAt: Date
});

const Product = mongoose.model('Product', productSchema);
const Depot = mongoose.model('Depot', depotSchema);

async function syncDepotProductArrays() {
    try {
        console.log('\n🔄 Starting depot-product synchronization...\n');

        // Get all depots
        const depots = await Depot.find({});
        console.log(`Found ${depots.length} depots`);

        // Clear all depot product arrays first
        for (const depot of depots) {
            depot.products = [];
            depot.currentUtilization = 0;
            depot.itemsStored = 0;
        }

        // Get all products with depot distribution
        const products = await Product.find({
            depotDistribution: { $exists: true, $ne: [] }
        });

        console.log(`Found ${products.length} products with depot assignments\n`);

        let synced = 0;
        let errors = 0;

        // Rebuild depot product arrays from product depot distributions
        for (const product of products) {
            try {
                for (const distribution of product.depotDistribution) {
                    const depot = depots.find(d => d._id.toString() === distribution.depotId.toString());

                    if (!depot) {
                        console.log(`⚠️  Depot ${distribution.depotId} not found for product ${product.sku}`);
                        continue;
                    }

                    // Add product to depot's products array
                    depot.products.push({
                        productId: product._id,
                        productName: product.name,
                        productSku: product.sku,
                        quantity: distribution.quantity || 0,
                        lastUpdated: distribution.lastUpdated || new Date()
                    });

                    synced++;
                }
            } catch (err) {
                console.error(`❌ Error processing ${product.sku}:`, err.message);
                errors++;
            }
        }

        // Save all depots with updated product arrays
        console.log('\n💾 Saving depot updates...\n');
        for (const depot of depots) {
            // Recalculate metrics
            depot.itemsStored = depot.products.length;
            depot.currentUtilization = depot.products.reduce((sum, p) => sum + (p.quantity || 0), 0);

            // Update status based on utilization
            const utilizationPercent = depot.capacity > 0 ? (depot.currentUtilization / depot.capacity) * 100 : 0;
            if (utilizationPercent >= 95) {
                depot.status = 'critical';
            } else if (utilizationPercent >= 85) {
                depot.status = 'warning';
            } else {
                depot.status = 'normal';
            }

            depot.updatedAt = new Date();
            await depot.save();

            console.log(`✅ ${depot.name}: ${depot.products.length} products, ${depot.currentUtilization} units`);
        }

        console.log('\n📊 Synchronization Summary:');
        console.log(`   ✅ Product-depot links synced: ${synced}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   🏢 Depots updated: ${depots.length}\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Synchronization error:', error);
        process.exit(1);
    }
}
