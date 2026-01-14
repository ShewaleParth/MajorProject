/**
 * PURGE all old products and RELOAD with high-quality 100 products.
 * MAPS CSV depot names to EXISTING Depot IDs.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const CSV_PATH = path.join('d:', 'Major', 'Dataset', 'inventory_100_products_updated_images.csv');

async function purgeAndReload() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        // Fetch actual depots for this user
        const existingDepots = await Depot.find({ userId: user._id });
        const depotMap = {};
        existingDepots.forEach(d => {
            depotMap[d.name] = d._id;
        });

        console.log('Mapped Depots:', Object.keys(depotMap));

        // 1. DELETE ALL EXISTING PRODUCTS FOR THIS USER
        console.log(`Purging old products for ${user.email}...`);
        const delResult = await Product.deleteMany({ userId: user._id });
        console.log(`✅ Deleted ${delResult.deletedCount} products.`);

        // 2. READ THE NEW HIGH-QUALITY CSV
        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');

        console.log(`Reloading ${lines.length - 1} premium products...`);

        const newProducts = [];
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const item = {};
            headers.forEach((h, index) => {
                item[h] = parts[index]?.replace(/^"|"$/g, '');
            });

            // Map the depot name from CSV to actual ID
            const realDepotId = depotMap[item.depot];
            if (!realDepotId) {
                console.warn(`Warning: Depot "${item.depot}" not found for product ${item.sku}. Skipping...`);
                continue;
            }

            newProducts.push({
                userId: user._id,
                sku: item.sku,
                name: item.name,
                category: item.category,
                stock: Number(item.stock),
                price: Number(item.price),
                supplier: item.supplier,
                reorderPoint: Number(item.reorderPoint),
                dailySales: Number(item.dailySales),
                weeklySales: Number(item.weeklySales),
                brand: item.brand,
                leadTime: Number(item.leadTime),
                riskLevel: item.riskLevel,
                stockoutIn: Number(item.stockoutIn),
                reorderQty: Number(item.reorderQty),
                image: item.image,
                depotDistribution: [{
                    depotId: realDepotId,
                    depotName: item.depot,
                    quantity: Number(item.stock),
                    lastUpdated: new Date()
                }]
            });
        }

        if (newProducts.length > 0) {
            await Product.insertMany(newProducts);
            console.log(`✅ DATABASE RELOADED with ${newProducts.length} premium products across correct depots!`);
        } else {
            console.log('❌ No products to reload.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

purgeAndReload();
