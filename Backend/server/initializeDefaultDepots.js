/**
 * Initialize Default Depots
 * Creates 4 default depots for the system
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

// Depot Schema
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

// User Schema (minimal)
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Default depots configuration
const DEFAULT_DEPOTS = [
    {
        name: "Parth's Depot",
        location: "Thane",
        capacity: 10000
    },
    {
        name: "Animesh's Depot",
        location: "Vitthalwadi",
        capacity: 10000
    },
    {
        name: "Aayush's Depot",
        location: "Navi Mumbai",
        capacity: 500
    },
    {
        name: "Abhay's Depot",
        location: "Kalyan",
        capacity: 1000
    }
];

async function initializeDefaultDepots() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users in the system\n`);

        if (users.length === 0) {
            console.log('⚠️  No users found. Please create a user first.');
            process.exit(0);
        }

        let totalCreated = 0;
        let totalSkipped = 0;

        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.email || user.username || user._id}`);
            console.log('─'.repeat(60));

            // Check if user already has depots
            const existingDepots = await Depot.find({ userId: user._id });

            if (existingDepots.length >= 4) {
                console.log(`   ℹ️  User already has ${existingDepots.length} depots. Skipping...`);
                totalSkipped += existingDepots.length;
                continue;
            }

            // Create default depots for this user
            for (const depotConfig of DEFAULT_DEPOTS) {
                // Check if depot with this name already exists for this user
                const existing = await Depot.findOne({
                    userId: user._id,
                    name: depotConfig.name
                });

                if (existing) {
                    console.log(`   ⏭️  Depot "${depotConfig.name}" already exists`);
                    totalSkipped++;
                    continue;
                }

                // Create new depot
                const depot = new Depot({
                    userId: user._id,
                    name: depotConfig.name,
                    location: depotConfig.location,
                    capacity: depotConfig.capacity,
                    currentUtilization: 0,
                    itemsStored: 0,
                    products: [],
                    status: 'normal'
                });

                await depot.save();
                console.log(`   ✅ Created: ${depotConfig.name} (${depotConfig.location}) - Capacity: ${depotConfig.capacity}`);
                totalCreated++;
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log('📊 SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Depots Created: ${totalCreated}`);
        console.log(`⏭️  Depots Skipped: ${totalSkipped}`);
        console.log(`👥 Users Processed: ${users.length}`);
        console.log('═'.repeat(60));

        // Show final depot count
        const allDepots = await Depot.find({});
        console.log(`\n🏢 Total Depots in System: ${allDepots.length}`);

        // Group by user
        const depotsByUser = {};
        for (const depot of allDepots) {
            const userId = depot.userId.toString();
            if (!depotsByUser[userId]) {
                depotsByUser[userId] = [];
            }
            depotsByUser[userId].push(depot.name);
        }

        console.log('\n📋 Depots by User:');
        for (const [userId, depotNames] of Object.entries(depotsByUser)) {
            const user = users.find(u => u._id.toString() === userId);
            console.log(`   ${user?.email || user?.username || userId}: ${depotNames.join(', ')}`);
        }

        console.log('\n✅ Initialization complete!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the initialization
initializeDefaultDepots();
