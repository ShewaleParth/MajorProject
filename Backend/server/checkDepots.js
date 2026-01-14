require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function checkDepots() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const users = await User.find({});
        console.log(`👥 Users in system: ${users.length}`);
        users.forEach(u => {
            console.log(`   - ${u.email || u.username || 'No email/username'} (ID: ${u._id})`);
        });

        const depots = await Depot.find({});
        console.log(`\n🏢 Total Depots: ${depots.length}`);

        if (depots.length > 0) {
            console.log('\nDepot Details:');
            depots.forEach(d => {
                console.log(`   - ${d.name} (${d.location})`);
                console.log(`     User ID: ${d.userId}`);
                console.log(`     Capacity: ${d.capacity}`);
            });
        }

        // Check if depots match user IDs
        console.log('\n🔍 Checking depot-user associations:');
        for (const user of users) {
            const userDepots = await Depot.find({ userId: user._id });
            console.log(`   ${user.email || user.username || user._id}: ${userDepots.length} depots`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkDepots();
