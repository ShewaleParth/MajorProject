const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const Alert = require('../models/Alert');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Sample notifications for testing
const sampleNotifications = [
    {
        type: 'low-stock',
        category: 'warning',
        title: 'Low Stock Alert',
        description: 'Wireless Mouse (SKU-1001) has only 15 units remaining',
        severity: 'medium'
    },
    {
        type: 'out-of-stock',
        category: 'critical',
        title: 'Out of Stock Alert',
        description: 'USB-C Cable (SKU-2045) is completely out of stock',
        severity: 'high'
    },
    {
        type: 'overstock',
        category: 'warning',
        title: 'Overstock Alert',
        description: 'HDMI Cable (SKU-3012) has 850 units, which is 340% above normal levels',
        severity: 'medium'
    },
    {
        type: 'reorder-point',
        category: 'warning',
        title: 'Reorder Point Reached',
        description: 'Laptop Stand (SKU-4567) has reached reorder point. Current stock: 25, Reorder point: 25',
        severity: 'medium'
    },
    {
        type: 'demand-spike',
        category: 'info',
        title: 'Unusual Demand Spike Detected',
        description: 'AI detected unusual demand spike for Bluetooth Speaker (SKU-5678). Consider increasing stock levels.',
        severity: 'medium'
    },
    {
        type: 'capacity-warning',
        category: 'critical',
        title: 'Depot Capacity Critical',
        description: 'Mumbai Warehouse is at 96% capacity (9600/10000 units)',
        severity: 'high'
    },
    {
        type: 'delayed-delivery',
        category: 'warning',
        title: 'Delayed Supplier Delivery',
        description: 'Shipment from TechSupply Co. is delayed by 3 days. Expected delivery: Jan 25',
        severity: 'medium'
    },
    {
        type: 'transfer-failed',
        category: 'critical',
        title: 'Stock Transfer Failed',
        description: 'Transfer of 100 units from Delhi to Bangalore depot failed due to system error',
        severity: 'high'
    },
    {
        type: 'expiry-warning',
        category: 'warning',
        title: 'Product Expiry Warning',
        description: 'Batteries Pack (SKU-7890) batch expires in 15 days',
        severity: 'medium'
    },
    {
        type: 'anomaly',
        category: 'info',
        title: 'System Anomaly Detected',
        description: 'Unusual pattern detected in inventory movements for Electronics category',
        severity: 'low'
    }
];

async function createTestNotifications(userId) {
    try {
        console.log(`\n📝 Creating test notifications for user: ${userId}\n`);

        // Delete existing test notifications for this user
        await Alert.deleteMany({ userId });
        console.log('🗑️  Cleared existing notifications\n');

        // Create new notifications
        for (const notif of sampleNotifications) {
            const alert = new Alert({
                userId,
                ...notif,
                createdAt: new Date(Date.now() - Math.random() * 86400000 * 3) // Random time within last 3 days
            });
            await alert.save();
            console.log(`✅ Created: ${notif.title}`);
        }

        console.log(`\n✨ Successfully created ${sampleNotifications.length} test notifications!\n`);

        // Show stats
        const stats = {
            total: await Alert.countDocuments({ userId }),
            unread: await Alert.countDocuments({ userId, isRead: false }),
            critical: await Alert.countDocuments({ userId, category: 'critical' })
        };

        console.log('📊 Notification Stats:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   Unread: ${stats.unread}`);
        console.log(`   Critical: ${stats.critical}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating notifications:', error);
        process.exit(1);
    }
}

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
    console.error('❌ Please provide a userId as argument');
    console.log('Usage: node createTestNotifications.js <userId>');
    process.exit(1);
}

createTestNotifications(userId);
