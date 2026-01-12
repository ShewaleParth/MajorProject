// List all users and their depot counts
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const users = await User.find({});

        console.log(`\n👥 Total Users: ${users.length}\n`);
        console.log('='.repeat(80));

        for (const user of users) {
            const depots = await Depot.find({ userId: user._id });

            console.log(`\n📧 ${user.email}`);
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   User ID: ${user._id}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   🏢 Depots: ${depots.length}`);

            if (depots.length > 0) {
                depots.forEach(d => {
                    console.log(`      - ${d.name} (${d.products?.length || 0} products)`);
                });
            }
        }

        console.log('\n' + '='.repeat(80) + '\n');

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
