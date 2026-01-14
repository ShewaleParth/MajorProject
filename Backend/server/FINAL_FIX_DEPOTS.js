/**
 * FINAL FIX - Assign all products to depots properly
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function finalFix() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        const depots = await Depot.find({ userId: user._id });
        const products = await Product.find({ userId: user._id });

        console.log(`👤 User: ${user.email}`);
        console.log(`🏢 Depots: ${depots.length}`);
        console.log(`📦 Products: ${products.length}\n`);

        if (depots.length === 0) {
            console.log('❌ No depots! Run createDepotsForCurrentUser.js first.');
            process.exit(1);
        }

        // Clear depot products
        for (const depot of depots) {
            await Depot.updateOne(
                { _id: depot._id },
                {
                    $set: {
                        products: [],
                        currentUtilization: 0,
                        itemsStored: 0,
                        status: 'normal'
                    }
                }
            );
        }
        console.log('✅ Cleared depot inventories\n');

        console.log('🔄 Assigning products to depots...\n');

        const depotProductsMap = {};
        depots.forEach(d => depotProductsMap[d._id.toString()] = []);

        let count = 0;
        for (const product of products) {
            // Select random depot
            const randomDepot = depots[Math.floor(Math.random() * depots.length)];
            const stock = product.stock || 0;

            // Update product with depot distribution
            await Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        depotDistribution: [{
                            depotId: randomDepot._id,
                            depotName: randomDepot.name,
                            quantity: stock,
                            lastUpdated: new Date()
                        }]
                    }
                }
            );

            // Add to depot map
            depotProductsMap[randomDepot._id.toString()].push({
                productId: product._id,
                productName: product.name,
                productSku: product.sku,
                quantity: stock,
                lastUpdated: new Date()
            });

            count++;
            if (count % 10 === 0) {
                console.log(`   Processed ${count}/${products.length} products...`);
            }
        }

        console.log(`\n✅ Assigned all ${count} products\n`);

        // Update depots with products
        console.log('🔄 Updating depot inventories...\n');

        for (const depot of depots) {
            const depotProducts = depotProductsMap[depot._id.toString()];
            const totalUtilization = depotProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
            const utilizationPercent = (totalUtilization / depot.capacity) * 100;

            let status = 'normal';
            if (utilizationPercent >= 90) status = 'critical';
            else if (utilizationPercent >= 70) status = 'warning';

            await Depot.updateOne(
                { _id: depot._id },
                {
                    $set: {
                        products: depotProducts,
                        itemsStored: depotProducts.length,
                        currentUtilization: totalUtilization,
                        status: status,
                        updatedAt: new Date()
                    }
                }
            );

            console.log(`   ✅ ${depot.name}: ${depotProducts.length} products, ${totalUtilization} units (${utilizationPercent.toFixed(1)}%)`);
        }

        console.log('\n' + '═'.repeat(60));
        console.log('✅ ALL DONE!');
        console.log('═'.repeat(60));

        // Final verification
        console.log('\n📊 Final Status:\n');
        for (const depot of depots) {
            const updated = await Depot.findById(depot._id);
            console.log(`   🏢 ${updated.name}`);
            console.log(`      Products: ${updated.products.length}`);
            console.log(`      Utilization: ${updated.currentUtilization}/${updated.capacity}`);
            console.log(`      Status: ${updated.status}\n`);
        }

        console.log('✅ Refresh your browser to see the updated depots!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

finalFix();
