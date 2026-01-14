/**
 * Create depots for the currently logged-in user
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

const depotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentUtilization: { type: Number, default: 0 },
    itemsStored: { type: Number, default: 0 },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sku: String,
        productName: String,
        quantity: Number,
        lastUpdated: Date
    }],
    status: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Depot = mongoose.model('Depot', depotSchema);
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const DEFAULT_DEPOTS = [
    { name: "Parth's Depot", location: "Thane", capacity: 10000 },
    { name: "Animesh's Depot", location: "Vitthalwadi", capacity: 10000 },
    { name: "Aayush's Depot", location: "Navi Mumbai", capacity: 500 },
    { name: "Abhay's Depot", location: "Kalyan", capacity: 1000 }
];

async function createDepotsForCurrentUser() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        // Find the user with email sparth7972@gmail.com
        const user = await User.findOne({ email: 'sparth7972@gmail.com' });

        if (!user) {
            console.log('❌ User sparth7972@gmail.com not found');
            console.log('Looking for any users...');
            const allUsers = await User.find({});
            console.log(`Found ${allUsers.length} users:`);
            allUsers.forEach(u => console.log(`  - ${u.email || u.username || u._id}`));
            process.exit(1);
        }

        console.log(`👤 Found user: ${user.email} (ID: ${user._id})\n`);

        // Check existing depots
        const existing = await Depot.find({ userId: user._id });
        console.log(`📊 Current depots for this user: ${existing.length}`);

        if (existing.length >= 4) {
            console.log('✅ User already has 4+ depots. Listing them:\n');
            existing.forEach(d => {
                console.log(`   🏢 ${d.name} (${d.location}) - Capacity: ${d.capacity}`);
            });
            process.exit(0);
        }

        // Create the 4 default depots
        console.log('\n🏗️  Creating default depots...\n');
        let created = 0;

        for (const config of DEFAULT_DEPOTS) {
            // Check if depot with this name already exists
            const existingDepot = await Depot.findOne({
                userId: user._id,
                name: config.name
            });

            if (existingDepot) {
                console.log(`   ⏭️  ${config.name} already exists`);
                continue;
            }

            const depot = new Depot({
                userId: user._id,
                name: config.name,
                location: config.location,
                capacity: config.capacity,
                currentUtilization: 0,
                itemsStored: 0,
                products: [],
                status: 'normal'
            });

            await depot.save();
            console.log(`   ✅ Created: ${config.name} (${config.location}) - Capacity: ${config.capacity}`);
            created++;
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✅ Successfully created ${created} depots`);
        console.log('═'.repeat(60));

        // Verify
        const finalDepots = await Depot.find({ userId: user._id });
        console.log(`\n🏢 Total depots for ${user.email}: ${finalDepots.length}\n`);
        finalDepots.forEach(d => {
            console.log(`   📦 ${d.name} - ${d.location} (${d.capacity} units)`);
        });

        console.log('\n✅ Done! Refresh your depot page to see the depots.\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createDepotsForCurrentUser();
