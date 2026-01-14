// Check all depots and their users
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const depots = await Depot.find({});

        console.log(`\n📊 Total Depots: ${depots.length}\n`);

        depots.forEach((d, idx) => {
            console.log(`${idx + 1}. ${d.name}`);
            console.log(`   User ID: ${d.userId}`);
            console.log(`   Location: ${d.location}`);
            console.log(`   Products: ${d.products?.length || 0}`);
            console.log(`   Created: ${d.createdAt}\n`);
        });

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
