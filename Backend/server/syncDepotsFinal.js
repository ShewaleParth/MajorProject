/**
 * Sync Depots with the latest Product distribution.
 * Ensures the 'products' array in Depot model matches correctly.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function syncDepots() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });

        // Clear all products from depots first to avoid duplicates
        await Depot.updateMany({ userId: user._id }, { $set: { products: [] } });

        const products = await Product.find({ userId: user._id });

        for (const product of products) {
            for (const dist of product.depotDistribution) {
                await Depot.updateOne(
                    { _id: dist.depotId, userId: user._id },
                    {
                        $push: {
                            products: {
                                productId: product._id,
                                productName: product.name,
                                productSku: product.sku,
                                quantity: Number(dist.quantity),
                                lastUpdated: new Date()
                            }
                        }
                    }
                );
            }
        }

        // Recalculate metrics for all depots
        const depots = await Depot.find({ userId: user._id });
        for (const depot of depots) {
            let utilization = 0;
            if (depot.products) {
                utilization = depot.products.reduce((acc, p) => acc + (p.quantity || 0), 0);
            }
            await Depot.updateOne(
                { _id: depot._id },
                {
                    $set: {
                        currentUtilization: utilization,
                        itemsStored: depot.products ? depot.products.length : 0
                    }
                }
            );
        }

        console.log('✅ Depots synced with new product distribution!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

syncDepots();
