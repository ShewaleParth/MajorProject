/**
 * Update product images with more specific, product-relevant images
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function updateProductImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        console.log(`👤 User: ${user.email}\n`);

        // Read CSV file with updated images
        const csvPath = path.join(__dirname, '..', 'Dataset', 'inventory_100_products_updated_images.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');

        console.log('📄 Reading CSV with updated images...\n');

        const skuIndex = headers.findIndex(h => h.toLowerCase() === 'sku');
        const imageIndex = headers.findIndex(h => h.toLowerCase() === 'image');

        let updated = 0;
        let notFound = 0;

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            const sku = row[skuIndex];
            const imageUrl = row[imageIndex];

            if (!sku || !imageUrl) continue;

            // Update product image
            const result = await Product.updateOne(
                { sku, userId: user._id },
                { $set: { image: imageUrl } }
            );

            if (result.modifiedCount > 0) {
                updated++;
                if (updated % 10 === 0) {
                    console.log(`   Updated ${updated} product images...`);
                }
            } else {
                notFound++;
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✅ Updated ${updated} product images`);
        console.log(`⏭️  Not found: ${notFound}`);
        console.log('═'.repeat(60));

        // Show sample of updated products
        console.log('\n📸 Sample Updated Products:\n');
        const samples = await Product.find({ userId: user._id }).limit(5);
        samples.forEach(p => {
            const shortImage = p.image ? p.image.substring(0, 60) + '...' : 'No image';
            console.log(`   ${p.sku}: ${p.name}`);
            console.log(`      Image: ${shortImage}\n`);
        });

        console.log('✅ All product images updated!\n');
        console.log('🔄 Refresh your browser to see more specific product images!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

updateProductImages();
