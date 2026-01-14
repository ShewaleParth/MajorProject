/**
 * Fix existing products by assigning them to depots
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function fixProductDepotAssignments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        // Find user
        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log(`👤 User: ${user.email}\n`);

        // Get depots
        const depots = await Depot.find({ userId: user._id });
        console.log(`🏢 Found ${depots.length} depots`);

        if (depots.length === 0) {
            console.log('❌ No depots found! Run createDepotsForCurrentUser.js first.');
            process.exit(1);
        }

        depots.forEach(d => console.log(`   - ${d.name} (${d.location})`));

        // Get all products without depot assignments
        const products = await Product.find({ userId: user._id });
        console.log(`\n📦 Total products: ${products.length}`);

        const unassignedProducts = products.filter(p =>
            !p.depotDistribution || p.depotDistribution.length === 0
        );

        console.log(`❌ Unassigned products: ${unassignedProducts.length}`);

        if (unassignedProducts.length === 0) {
            console.log('\n✅ All products are already assigned to depots!');
            process.exit(0);
        }

        console.log(`\n🔧 Assigning products to depots...\n`);

        let fixed = 0;
        const depotAssignments = {};
        depots.forEach(d => depotAssignments[d._id.toString()] = []);

        for (const product of unassignedProducts) {
            // Randomly select a depot
            const randomDepot = depots[Math.floor(Math.random() * depots.length)];
            const stock = product.stock || 0;

            // Update product's depot distribution
            product.depotDistribution = [{
                depotId: randomDepot._id,
                depotName: randomDepot.name,
                quantity: stock,
                lastUpdated: new Date()
            }];

            await product.save();

            // Track for depot update
            depotAssignments[randomDepot._id.toString()].push({
                productId: product._id,
                productName: product.name,
                productSku: product.sku,
                quantity: stock,
                lastUpdated: new Date()
            });

            fixed++;
            console.log(`   ✅ ${product.sku} → ${randomDepot.name} (${stock} units)`);
        }

        // Update depot products arrays
        console.log(`\n🔄 Updating depot inventories...\n`);

        for (const depot of depots) {
            const depotId = depot._id.toString();
            const productsToAdd = depotAssignments[depotId];

            if (productsToAdd.length > 0) {
                // Add products to depot
                depot.products = depot.products || [];
                depot.products.push(...productsToAdd);

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

                console.log(`   ✅ ${depot.name}: ${productsToAdd.length} products added`);
                console.log(`      Utilization: ${depot.currentUtilization}/${depot.capacity} (${utilizationPercent.toFixed(1)}%)`);
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✅ Fixed ${fixed} products`);
        console.log('═'.repeat(60));

        // Final summary
        console.log(`\n📊 Final Depot Status:\n`);
        for (const depot of depots) {
            const freshDepot = await Depot.findById(depot._id);
            console.log(`   🏢 ${freshDepot.name}`);
            console.log(`      Products: ${freshDepot.products?.length || 0}`);
            console.log(`      Utilization: ${freshDepot.currentUtilization}/${freshDepot.capacity}`);
            console.log(`      Status: ${freshDepot.status}`);
            console.log('');
        }

        console.log('✅ All products are now assigned to depots!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

fixProductDepotAssignments();
