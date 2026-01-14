/**
 * Fix the 100 products that were uploaded without depot assignments
 * Read the CSV and assign products to their specified depots
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function fixDepotAssignments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        const depots = await Depot.find({ userId: user._id });

        console.log(`👤 User: ${user.email}`);
        console.log(`🏢 Depots: ${depots.length}\n`);

        // Read CSV file
        const csvPath = path.join(__dirname, '..', 'Dataset', 'inventory_100_products.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');

        console.log('📄 CSV Headers:', headers.join(', '));
        console.log(`📊 CSV Rows: ${lines.length - 1}\n`);

        // Find depot column index
        const depotIndex = headers.findIndex(h => h.toLowerCase().includes('depot'));
        const skuIndex = headers.findIndex(h => h.toLowerCase() === 'sku');

        console.log(`Depot column index: ${depotIndex}`);
        console.log(`SKU column index: ${skuIndex}\n`);

        let fixed = 0;
        let skipped = 0;

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            const sku = row[skuIndex];
            const depotName = row[depotIndex];

            if (!sku || !depotName) continue;

            // Find product
            const product = await Product.findOne({ sku, userId: user._id });
            if (!product) {
                console.log(`⏭️  Product ${sku} not found`);
                continue;
            }

            // Check if already has depot
            if (product.depotDistribution && product.depotDistribution.length > 0) {
                skipped++;
                continue;
            }

            // Find depot
            const targetDepot = depots.find(d =>
                d.name.toLowerCase() === depotName.toLowerCase() ||
                d.name.toLowerCase().includes(depotName.toLowerCase())
            );

            if (!targetDepot) {
                console.log(`❌ Depot not found for: ${depotName}`);
                continue;
            }

            // Assign product to depot
            await Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        depotDistribution: [{
                            depotId: targetDepot._id,
                            depotName: targetDepot.name,
                            quantity: product.stock || 0,
                            lastUpdated: new Date()
                        }]
                    }
                }
            );

            // Add to depot
            const depotProductExists = targetDepot.products.some(
                p => p.productId && p.productId.toString() === product._id.toString()
            );

            if (!depotProductExists) {
                targetDepot.products.push({
                    productId: product._id,
                    productName: product.name,
                    productSku: product.sku,
                    quantity: product.stock || 0,
                    lastUpdated: new Date()
                });
            }

            fixed++;
            if (fixed % 10 === 0) {
                console.log(`   Fixed ${fixed} products...`);
            }
        }

        // Save all depots
        console.log('\n🔄 Saving depot updates...\n');
        for (const depot of depots) {
            depot.itemsStored = depot.products.length;
            depot.currentUtilization = depot.products.reduce((sum, p) => sum + (p.quantity || 0), 0);

            const utilizationPercent = (depot.currentUtilization / depot.capacity) * 100;
            if (utilizationPercent >= 90) depot.status = 'critical';
            else if (utilizationPercent >= 70) depot.status = 'warning';
            else depot.status = 'normal';

            await depot.save();
        }

        console.log('═'.repeat(60));
        console.log(`✅ Fixed: ${fixed} products`);
        console.log(`⏭️  Skipped: ${skipped} products (already had depot)`);
        console.log('═'.repeat(60));

        // Final status
        console.log('\n📊 Final Depot Status:\n');
        for (const depot of depots) {
            const fresh = await Depot.findById(depot._id);
            console.log(`   🏢 ${fresh.name}`);
            console.log(`      Products: ${fresh.products.length}`);
            console.log(`      Utilization: ${fresh.currentUtilization}/${fresh.capacity}`);
            console.log(`      Status: ${fresh.status}\n`);
        }

        console.log('✅ All done! Refresh your browser to see the changes.\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

fixDepotAssignments();
