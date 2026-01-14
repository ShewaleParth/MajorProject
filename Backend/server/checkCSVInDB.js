/**
 * Check if CSV products exist in DB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const CSV_PATH = path.join('d:', 'Major', 'Dataset', 'inventory_100_products_updated_images.csv');

async function checkSync() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const firstSku = lines[1].split(',')[0];

        const product = await Product.findOne({ sku: firstSku });
        if (product) {
            console.log(`✅ Product ${firstSku} exists. Image: ${product.image}`);
        } else {
            console.log(`❌ Product ${firstSku} DOES NOT exist in DB.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkSync();
