/**
 * Comprehensive fix - Sync products with depots
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function syncProductsWithDepots() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log(`👤 User: ${user.email}\n`);

        // Get depots
        const depots = await Depot.find({ userId: user._id });
        console.log(`🏢 Depots: ${depots.length}\n`);

        // Clear all depot products arrays first
        console.log('🧹 Clearing depot inventories...');
        for (const depot of depots) {
            depot.products = [];
            depot.currentUtilization = 0;
            depot.itemsStored = 0;
            depot.status = 'normal';
            await depot.save();
        }
        console.log('✅ Cleared\n');

        // Get all products
        const products = await Product.find({ userId: user._id });
        console.log(`📦 Products: ${products.length}\n`);

        console.log('🔄 Rebuilding depot assignments...\n');

        let assigned = 0;
        let skipped = 0;

        for (const product of products) {
            // Check if product has depot distribution
            if (!product.depotDistribution || product.depotDistribution.length === 0) {
                // Assign to random depot
                const randomDepot = depots[Math.floor(Math.random() * depots.length)];
                const stock = product.stock || 0;

                product.depotDistribution = [{
                    depotId: randomDepot._id,
                    depotName: randomDepot.name,
                    quantity: stock,
                    lastUpdated: new Date()
                }];

                await product.save();
                console.log(`   ✅ Assigned ${product.sku} → ${randomDepot.name}`);
            }

            // Now add product to depot's products array
            for (const depotDist of product.depotDistribution) {
                const depot = await Depot.findById(depotDist.depotId);
                if (depot) {
                    // Check if product already in depot
                    const existingIndex = depot.products.findIndex(
                        p => p.productId && p.productId.toString() === product._id.toString()
                    );

                    if (existingIndex >= 0) {
                        // Update existing
                        depot.products[existingIndex].quantity = depotDist.quantity;
                        depot.products[existingIndex].lastUpdated = new Date();
                    } else {
                        // Add new
                        depot.products.push({
                            productId: product._id,
                            productName: product.name,
                            productSku: product.sku,
                            quantity: depotDist.quantity,
                            lastUpdated: new Date()
                        });
                    }

                    // Update metrics
                    depot.itemsStored = depot.products.length;
                    depot.currentUtilization = depot.products.reduce((sum, p) => sum + (p.quantity || 0), 0);

                    // Update status
                    const utilizationPercent = (depot.currentUtilization / depot.capacity) * 100;
                    if (utilizationPercent >= 90) {
                        depot.status = 'critical';
                    } else if (utilizationPercent >= 70) {
                        depot.status = 'warning';
                    } else {
                        depot.status = 'normal';
                    }

                    depot.updatedAt = new Date();
                    await depot.save();
                    assigned++;
                }
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✅ Sync complete!`);
        console.log(`   Products processed: ${products.length}`);
        console.log(`   Depot assignments: ${assigned}`);
        console.log('═'.repeat(60));

        // Final verification
        console.log(`\n📊 Final Depot Status:\n`);
        for (const depot of depots) {
            const freshDepot = await Depot.findById(depot._id);
            const utilizationPercent = (freshDepot.currentUtilization / freshDepot.capacity) * 100;

            console.log(`   🏢 ${freshDepot.name} (${freshDepot.location})`);
            console.log(`      Products: ${freshDepot.products?.length || 0}`);
            console.log(`      Utilization: ${freshDepot.currentUtilization}/${freshDepot.capacity} (${utilizationPercent.toFixed(1)}%)`);
            console.log(`      Status: ${freshDepot.status}`);
            console.log('');
        }

        console.log('✅ All done! Refresh your browser to see the updated depots.\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

syncProductsWithDepots();
