// Final verification - show depot contents
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const depots = await Depot.find({}).sort({ name: 1 });

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║           DEPOT INVENTORY VERIFICATION                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        for (const depot of depots) {
            const productCount = depot.products?.length || 0;
            const utilization = depot.currentUtilization || 0;
            const capacity = depot.capacity || 0;
            const utilizationPercent = capacity > 0 ? ((utilization / capacity) * 100).toFixed(1) : 0;

            console.log(`\n🏢 ${depot.name.toUpperCase()}`);
            console.log(`   📍 Location: ${depot.location}`);
            console.log(`   📦 Products: ${productCount} unique items`);
            console.log(`   📊 Utilization: ${utilization} / ${capacity} units (${utilizationPercent}%)`);
            console.log(`   🚦 Status: ${depot.status || 'normal'}`);

            if (productCount > 0) {
                console.log(`\n   📋 Inventory (showing first 10):`);
                depot.products.slice(0, 10).forEach((p, idx) => {
                    console.log(`      ${idx + 1}. ${p.productSku} - ${p.productName}`);
                    console.log(`         Quantity: ${p.quantity} units`);
                });

                if (productCount > 10) {
                    console.log(`      ... and ${productCount - 10} more items`);
                }
            } else {
                console.log(`   ⚠️  No products assigned to this depot`);
            }

            console.log(`   ${'─'.repeat(60)}`);
        }

        const totalProducts = depots.reduce((sum, d) => sum + (d.products?.length || 0), 0);
        const totalUtilization = depots.reduce((sum, d) => sum + (d.currentUtilization || 0), 0);

        console.log(`\n╔════════════════════════════════════════════════════════════╗`);
        console.log(`║ SUMMARY                                                    ║`);
        console.log(`╠════════════════════════════════════════════════════════════╣`);
        console.log(`║ Total Depots: ${depots.length.toString().padEnd(47)}║`);
        console.log(`║ Total Product Entries: ${totalProducts.toString().padEnd(39)}║`);
        console.log(`║ Total Units Stored: ${totalUtilization.toString().padEnd(42)}║`);
        console.log(`╚════════════════════════════════════════════════════════════╝\n`);

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
