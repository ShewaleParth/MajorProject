// Quick check script to verify depot assignments
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const depots = await Depot.find({});
        const products = await Product.find({});

        console.log(`📦 Total Products: ${products.length}`);
        console.log(`🏢 Total Depots: ${depots.length}\n`);

        console.log('=== DEPOT STATUS ===');
        for (const depot of depots) {
            console.log(`\n🏢 ${depot.name} (${depot.location})`);
            console.log(`   Products Array: ${depot.products?.length || 0} items`);
            console.log(`   Utilization: ${depot.currentUtilization || 0} units`);
            console.log(`   Capacity: ${depot.capacity || 0} units`);

            if (depot.products && depot.products.length > 0) {
                console.log('   Items:');
                depot.products.slice(0, 3).forEach(p => {
                    console.log(`     - ${p.productSku}: ${p.quantity} units`);
                });
                if (depot.products.length > 3) {
                    console.log(`     ... and ${depot.products.length - 3} more`);
                }
            }
        }

        console.log('\n=== PRODUCT DEPOT DISTRIBUTION ===');
        const productsWithDepots = products.filter(p => p.depotDistribution && p.depotDistribution.length > 0);
        const productsWithoutDepots = products.filter(p => !p.depotDistribution || p.depotDistribution.length === 0);

        console.log(`✅ Products WITH depot assignment: ${productsWithDepots.length}`);
        console.log(`❌ Products WITHOUT depot assignment: ${productsWithoutDepots.length}`);

        if (productsWithoutDepots.length > 0) {
            console.log('\nProducts without depots (first 5):');
            productsWithoutDepots.slice(0, 5).forEach(p => {
                console.log(`  - ${p.sku}: ${p.name} (${p.stock} units)`);
            });
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
