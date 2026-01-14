/**
 * Update product images with more specific URLs
 * Directly map products to better images
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

// Specific image mappings for products
const IMAGE_MAPPINGS = {
    // Sneakers - specific models
    'SNK-001': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', // Nike Air Max
    'SNK-002': 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400', // Adidas Ultraboost
    'SNK-003': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', // Puma
    'SNK-004': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400', // New Balance
    'SNK-006': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400', // Jordan
    'SNK-007': 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400', // Converse
    'SNK-008': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', // Vans
    'SNK-015': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400', // Fila

    // Electronics - specific devices
    'ELC-001': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', // Sony Headphones
    'ELC-007': 'https://images.unsplash.com/photo-1606941369e88-8dfdd5b1e87e?w=400', // GoPro
    'ELC-008': 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400', // Kindle
    'ELC-012': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400', // Echo Dot
    'ELC-013': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400', // Google Nest
    'ELC-014': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', // Ring Doorbell

    // Accessories
    'ACC-001': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', // Ray-Ban
    'ACC-006': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', // Oakley
    'ACC-007': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', // Backpack
    'ACC-011': 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400', // Luggage

    // Apparel
    'APP-001': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', // Jeans
    'APP-003': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', // Shirt
    'APP-015': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', // Yoga Pants

    // Sports
    'SPT-006': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400', // Badminton
    'SPT-007': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400', // Golf
    'SPT-012': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', // Water Bottle
    'SPT-013': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', // YETI Cooler
    'SPT-015': 'https://images.unsplash.com/photo-1622260614927-9c2e4e0e8e0e?w=400', // Backpack
};

async function updateImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        console.log(`👤 User: ${user.email}\n`);
        console.log('🖼️  Updating product images with specific URLs...\n');

        let updated = 0;

        for (const [sku, imageUrl] of Object.entries(IMAGE_MAPPINGS)) {
            const result = await Product.updateOne(
                { sku, userId: user._id },
                { $set: { image: imageUrl } }
            );

            if (result.modifiedCount > 0) {
                updated++;
                const product = await Product.findOne({ sku, userId: user._id });
                console.log(`   ✅ ${sku}: ${product.name}`);
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✅ Updated ${updated} products with specific images`);
        console.log('═'.repeat(60));

        console.log('\n🎨 These products now have more specific, product-relevant images!');
        console.log('🔄 Refresh your browser to see the changes!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateImages();
