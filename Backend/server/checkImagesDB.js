/**
 * Check product images in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const products = await Product.find({}).limit(5);
        console.log('Sample Products Check:');
        products.forEach(p => {
            console.log(`SKU: ${p.sku}, Image: ${p.image ? p.image : 'NULL/EMPTY'}`);
        });

        const withImages = await Product.countDocuments({ image: { $exists: true, $ne: '', $ne: null } });
        const total = await Product.countDocuments({});
        console.log(`\nProducts with images: ${withImages} / ${total}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkImages();
