/**
 * Check product images in the database - CLEAR LOGS
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const total = await Product.countDocuments({});
        const withImages = await Product.countDocuments({ image: { $exists: true, $ne: '', $ne: null } });

        const sample = await Product.find({}).limit(3);

        console.log('--- DB IMAGE STATUS ---');
        console.log('Total Products:', total);
        console.log('Products with Image field set:', withImages);
        console.log('Sample Data:');
        sample.forEach(s => console.log(`- SKU: ${s.sku}, Image: ${s.image}`));
        console.log('--- END STATUS ---');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkImages();
