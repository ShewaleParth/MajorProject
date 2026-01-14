/**
 * Update products with realistic risk levels
 * Creates a mix of SAFE, MEDIUM, and HIGH RISK products
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function updateProductRiskLevels() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        console.log(`👤 User: ${user.email}\n`);

        const products = await Product.find({ userId: user._id });
        console.log(`📦 Total products: ${products.length}\n`);

        console.log('🔧 Updating risk levels...\n');

        let safeCount = 0;
        let mediumCount = 0;
        let highCount = 0;

        // Target distribution: 50% SAFE, 30% MEDIUM, 20% HIGH RISK
        const targetSafe = Math.floor(products.length * 0.5);
        const targetMedium = Math.floor(products.length * 0.3);
        const targetHigh = products.length - targetSafe - targetMedium;

        // Shuffle products for random distribution
        const shuffled = products.sort(() => Math.random() - 0.5);

        for (let i = 0; i < shuffled.length; i++) {
            const product = shuffled[i];
            let riskLevel;
            let stock;
            let reorderPoint;
            let stockoutIn;

            // Assign risk level based on targets
            if (safeCount < targetSafe) {
                riskLevel = 'SAFE';
                // SAFE: Stock well above reorder point
                reorderPoint = product.reorderPoint || Math.floor(Math.random() * 30) + 10;
                stock = Math.floor(reorderPoint * (2 + Math.random() * 3)); // 2-5x reorder point
                stockoutIn = Math.floor(stock / (product.dailySales || 5)); // Days until stockout
                safeCount++;
            } else if (mediumCount < targetMedium) {
                riskLevel = 'MEDIUM';
                // MEDIUM: Stock near reorder point
                reorderPoint = product.reorderPoint || Math.floor(Math.random() * 30) + 10;
                stock = Math.floor(reorderPoint * (0.8 + Math.random() * 0.7)); // 0.8-1.5x reorder point
                stockoutIn = Math.floor(stock / (product.dailySales || 5));
                mediumCount++;
            } else {
                riskLevel = 'HIGH RISK';
                // HIGH RISK: Stock below reorder point
                reorderPoint = product.reorderPoint || Math.floor(Math.random() * 30) + 10;
                stock = Math.floor(reorderPoint * (0.2 + Math.random() * 0.5)); // 0.2-0.7x reorder point
                stockoutIn = Math.floor(stock / (product.dailySales || 5));
                highCount++;
            }

            // Calculate reorder quantity based on risk
            const reorderQty = Math.floor(reorderPoint * 2);

            await Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        stock,
                        reorderPoint,
                        riskLevel,
                        stockoutIn,
                        reorderQty
                    }
                }
            );
        }

        console.log('═'.repeat(60));
        console.log('✅ Risk levels updated!');
        console.log('═'.repeat(60));

        console.log('\n📊 Risk Distribution:\n');
        console.log(`   🟢 SAFE: ${safeCount} products (${Math.round(safeCount / products.length * 100)}%)`);
        console.log(`      Stock well above reorder point`);
        console.log(`      Low urgency\n`);

        console.log(`   🟡 MEDIUM: ${mediumCount} products (${Math.round(mediumCount / products.length * 100)}%)`);
        console.log(`      Stock near reorder point`);
        console.log(`      Monitor closely\n`);

        console.log(`   🔴 HIGH RISK: ${highCount} products (${Math.round(highCount / products.length * 100)}%)`);
        console.log(`      Stock below reorder point`);
        console.log(`      Urgent action needed\n`);

        // Show samples
        console.log('📋 Sample Products by Risk Level:\n');

        const safeProducts = await Product.find({ userId: user._id, riskLevel: 'SAFE' }).limit(3);
        console.log('🟢 SAFE Products:');
        safeProducts.forEach(p => {
            console.log(`   ${p.sku}: ${p.name}`);
            console.log(`      Stock: ${p.stock} | Reorder: ${p.reorderPoint} | Stockout: ${p.stockoutIn} days\n`);
        });

        const mediumProducts = await Product.find({ userId: user._id, riskLevel: 'MEDIUM' }).limit(3);
        console.log('🟡 MEDIUM Risk Products:');
        mediumProducts.forEach(p => {
            console.log(`   ${p.sku}: ${p.name}`);
            console.log(`      Stock: ${p.stock} | Reorder: ${p.reorderPoint} | Stockout: ${p.stockoutIn} days\n`);
        });

        const highProducts = await Product.find({ userId: user._id, riskLevel: 'HIGH RISK' }).limit(3);
        console.log('🔴 HIGH RISK Products:');
        highProducts.forEach(p => {
            console.log(`   ${p.sku}: ${p.name}`);
            console.log(`      Stock: ${p.stock} | Reorder: ${p.reorderPoint} | Stockout: ${p.stockoutIn} days\n`);
        });

        console.log('✅ All done! Refresh your browser to see the updated risk levels!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
    }
}

updateProductRiskLevels();
