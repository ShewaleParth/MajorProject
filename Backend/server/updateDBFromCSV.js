/**
 * Update the database with the latest 100-product CSV data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';
const CSV_PATH = path.join('d:', 'Major', 'Dataset', 'Item List.csv');

async function updateDB() {
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
        const headers = lines[0].split(',');

        console.log(`Updating ${lines.length - 1} products from CSV...`);

        for (let i = 1; i < lines.length; i++) {
            // Very simple CSV parser for this specific file structure (handling quoted names)
            const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            const item = {};
            headers.forEach((h, index) => {
                item[h] = parts[index]?.replace(/^"|"$/g, '');
            });

            await Product.updateOne(
                { sku: item.sku, userId: user._id },
                {
                    $set: {
                        stock: Number(item.stock),
                        reorderPoint: Number(item.reorderPoint),
                        riskLevel: item.riskLevel,
                        stockoutIn: Number(item.stockoutIn),
                        reorderQty: Number(item.reorderQty),
                        image: item.image,
                        category: item.category,
                        name: item.name
                    }
                },
                { upsert: true }
            );
        }

        console.log('✅ Database updated with Mixed Risk Levels from CSV!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateDB();
