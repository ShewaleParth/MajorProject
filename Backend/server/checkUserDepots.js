// Quick test to check depots API
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Get all users
        const users = await User.find({});
        console.log(`👥 Total Users: ${users.length}`);

        for (const user of users) {
            console.log(`\n📧 User: ${user.email} (ID: ${user._id})`);

            // Get depots for this user
            const userDepots = await Depot.find({ userId: user._id });
            console.log(`   🏢 Depots: ${userDepots.length}`);

            if (userDepots.length > 0) {
                userDepots.forEach(d => {
                    console.log(`      - ${d.name} (${d.products?.length || 0} products)`);
                });
            }
        }

        // Get all depots (regardless of user)
        const allDepots = await Depot.find({});
        console.log(`\n📊 Total Depots in DB: ${allDepots.length}`);

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
