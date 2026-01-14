// Check Parth Shewale user and their depots
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        // Find Parth Shewale user
        const parthUser = await User.findOne({
            $or: [
                { email: { $regex: /parth/i } },
                { first_name: { $regex: /parth/i } },
                { last_name: { $regex: /shewale/i } }
            ]
        });

        if (!parthUser) {
            console.log('❌ Parth Shewale user not found!\n');
            console.log('📋 All users in database:');
            const allUsers = await User.find({});
            allUsers.forEach(u => {
                console.log(`   - ${u.first_name} ${u.last_name} (${u.email})`);
            });
        } else {
            console.log('✅ Found Parth Shewale user!');
            console.log(`   Email: ${parthUser.email}`);
            console.log(`   User ID: ${parthUser._id}`);
            console.log(`   Role: ${parthUser.role}`);
            console.log(`   Created: ${parthUser.createdAt}\n`);

            // Get depots for this user
            const userDepots = await Depot.find({ userId: parthUser._id });
            console.log(`🏢 Depots for Parth Shewale: ${userDepots.length}\n`);

            if (userDepots.length > 0) {
                userDepots.forEach((d, idx) => {
                    console.log(`${idx + 1}. ${d.name}`);
                    console.log(`   Location: ${d.location}`);
                    console.log(`   Products: ${d.products?.length || 0}`);
                    console.log(`   Utilization: ${d.currentUtilization}/${d.capacity}`);
                    console.log('');
                });
            } else {
                console.log('⚠️  No depots found for this user\n');
            }

            // Get products for this user
            const userProducts = await Product.find({ userId: parthUser._id });
            console.log(`📦 Products for Parth Shewale: ${userProducts.length}`);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
