// List all users with complete details
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const users = await User.find({});

        console.log('\n' + '='.repeat(80));
        console.log(`                    ALL USERS IN DATABASE (${users.length} total)`);
        console.log('='.repeat(80) + '\n');

        if (users.length === 0) {
            console.log('❌ No users found in database!\n');
        } else {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const depots = await Depot.find({ userId: user._id });
                const products = await Product.find({ userId: user._id });

                console.log(`USER #${i + 1}`);
                console.log('─'.repeat(80));
                console.log(`📧 Email:        ${user.email}`);
                console.log(`👤 Name:         ${user.first_name} ${user.last_name}`);
                console.log(`🆔 User ID:      ${user._id}`);
                console.log(`🔑 Role:         ${user.role}`);
                console.log(`✅ Verified:     ${user.isVerified}`);
                console.log(`📅 Created:      ${user.createdAt}`);
                console.log(`🏢 Depots:       ${depots.length}`);
                console.log(`📦 Products:     ${products.length}`);

                if (depots.length > 0) {
                    console.log('\n   Depots:');
                    depots.forEach((d, idx) => {
                        console.log(`      ${idx + 1}. ${d.name}`);
                        console.log(`         Location: ${d.location}`);
                        console.log(`         Products: ${d.products?.length || 0}`);
                        console.log(`         Capacity: ${d.currentUtilization}/${d.capacity} units`);
                    });
                }

                console.log('\n' + '='.repeat(80) + '\n');
            }
        }

        console.log('SUMMARY:');
        console.log(`   Total Users:    ${users.length}`);
        console.log(`   Total Depots:   ${await Depot.countDocuments()}`);
        console.log(`   Total Products: ${await Product.countDocuments()}`);
        console.log('\n');

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
