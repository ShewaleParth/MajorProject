/**
 * Test bulk upload with depot assignment
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function testBulkUpload() {
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

        console.log(`👤 User: ${user.email} (${user._id})\n`);

        // Check depots
        const depots = await Depot.find({ userId: user._id });
        console.log(`🏢 Depots found: ${depots.length}`);
        depots.forEach(d => console.log(`   - ${d.name} (${d.location})`));

        if (depots.length === 0) {
            console.log('\n❌ No depots found! Run createDepotsForCurrentUser.js first.');
            process.exit(1);
        }

        // Check products
        const products = await Product.find({ userId: user._id });
        console.log(`\n📦 Products found: ${products.length}`);

        if (products.length > 0) {
            console.log('\n📊 Checking depot assignments:');

            let assigned = 0;
            let unassigned = 0;

            for (const product of products.slice(0, 10)) { // Check first 10
                const hasDepot = product.depotDistribution && product.depotDistribution.length > 0;
                if (hasDepot) {
                    assigned++;
                    console.log(`   ✅ ${product.sku}: Assigned to ${product.depotDistribution[0].depotName}`);
                } else {
                    unassigned++;
                    console.log(`   ❌ ${product.sku}: NOT assigned to any depot`);
                }
            }

            console.log(`\n📈 Summary (first 10 products):`);
            console.log(`   ✅ Assigned: ${assigned}`);
            console.log(`   ❌ Unassigned: ${unassigned}`);

            // Check depot products arrays
            console.log(`\n🔍 Checking depot inventory:`);
            for (const depot of depots) {
                const freshDepot = await Depot.findById(depot._id);
                console.log(`   ${freshDepot.name}: ${freshDepot.products?.length || 0} products`);
            }
        } else {
            console.log('   No products uploaded yet.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testBulkUpload();
