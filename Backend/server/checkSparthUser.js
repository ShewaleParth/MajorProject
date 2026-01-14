// Check for sparth7972@gmail.com user
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });

        if (!user) {
            console.log('\n❌ User sparth7972@gmail.com NOT FOUND in database\n');
        } else {
            console.log('\n✅ Found user: sparth7972@gmail.com');
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   User ID: ${user._id}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Verified: ${user.isVerified}`);
            console.log(`   Created: ${user.createdAt}\n`);

            const depots = await Depot.find({ userId: user._id });
            const products = await Product.find({ userId: user._id });

            console.log(`🏢 Depots: ${depots.length}`);
            depots.forEach(d => {
                console.log(`   - ${d.name} (${d.products?.length || 0} products)`);
            });

            console.log(`\n📦 Products: ${products.length}\n`);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
