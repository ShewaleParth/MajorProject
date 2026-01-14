/**
 * Assign default product images based on category
 * This script updates all products without images to have category-appropriate placeholder images
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

// Category-based image URLs (using Unsplash for high-quality product images)
const CATEGORY_IMAGES = {
    // Fashion & Apparel
    'Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    'Footwear': 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
    'Apparel': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
    'Clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
    'Accessories': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400',

    // Electronics
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    'Gadgets': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400',
    'Technology': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400',

    // Sports & Fitness
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
    'Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    'Athletic': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400',

    // Home & Living
    'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    'Home': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
    'Decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',

    // Food & Beverage
    'Food': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'Beverage': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    'Grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',

    // Beauty & Personal Care
    'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    'Cosmetics': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    'Personal Care': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',

    // Office & Stationery
    'Office': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
    'Stationery': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',

    // Toys & Games
    'Toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400',
    'Games': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',

    // Books & Media
    'Books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
    'Media': 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',

    // Automotive
    'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    'Auto Parts': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',

    // Default fallback
    'Default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'Uncategorized': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
};

function getCategoryImage(category) {
    // Try exact match first
    if (CATEGORY_IMAGES[category]) {
        return CATEGORY_IMAGES[category];
    }

    // Try case-insensitive match
    const categoryLower = category.toLowerCase();
    for (const [key, value] of Object.entries(CATEGORY_IMAGES)) {
        if (key.toLowerCase() === categoryLower) {
            return value;
        }
    }

    // Try partial match
    for (const [key, value] of Object.entries(CATEGORY_IMAGES)) {
        if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
            return value;
        }
    }

    // Default fallback
    return CATEGORY_IMAGES['Default'];
}

async function assignProductImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log(`👤 User: ${user.email}\n`);

        // Get all products
        const products = await Product.find({ userId: user._id });
        console.log(`📦 Total products: ${products.length}\n`);

        // Count products without images
        const productsWithoutImages = products.filter(p => !p.image || p.image.trim() === '');
        console.log(`🖼️  Products without images: ${productsWithoutImages.length}\n`);

        if (productsWithoutImages.length === 0) {
            console.log('✅ All products already have images!');
            process.exit(0);
        }

        console.log('🔄 Assigning category-based images...\n');

        const categoryStats = {};
        let updated = 0;

        for (const product of productsWithoutImages) {
            const category = product.category || 'Uncategorized';
            const imageUrl = getCategoryImage(category);

            await Product.updateOne(
                { _id: product._id },
                { $set: { image: imageUrl } }
            );

            // Track stats
            if (!categoryStats[category]) {
                categoryStats[category] = 0;
            }
            categoryStats[category]++;
            updated++;

            if (updated % 10 === 0) {
                console.log(`   Processed ${updated}/${productsWithoutImages.length}...`);
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✅ Updated ${updated} products with images`);
        console.log('═'.repeat(60));

        console.log('\n📊 Images assigned by category:\n');
        for (const [category, count] of Object.entries(categoryStats)) {
            console.log(`   ${category}: ${count} products`);
        }

        console.log('\n✅ All done! Refresh your browser to see product images.\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

assignProductImages();
