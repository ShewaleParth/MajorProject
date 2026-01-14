/**
 * Clean up old products and keep only the ones from the latest CSV
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const CSV_PATH = path.join('d:', 'Major', 'Dataset', 'inventory_100_products_updated_images.csv');

async function cleanupInventory() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const csvSkus = lines.slice(1).map(line => line.split(',')[0]);

        console.log(`CSV has ${csvSkus.length} products.`);

        // Delete products for this user that ARE NOT in our high-quality CSV
        const deleteResult = await Product.deleteMany({
            userId: user._id,
            sku: { $nin: csvSkus }
        });

        console.log(`✅ Deleted ${deleteResult.deletedCount} old products with missing data/images.`);

        const remaining = await Product.countDocuments({ userId: user._id });
        console.log(`Total high-quality products remaining: ${remaining}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

cleanupInventory();
