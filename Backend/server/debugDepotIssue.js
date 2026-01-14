require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function debugDepotIssue() {
    try {
        await mongoose.connect(MONGODB_URI);

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        console.log(`User ID: ${user._id}\n`);

        // Check one product in detail
        const product = await Product.findOne({ userId: user._id });
        if (product) {
            console.log(`Sample Product: ${product.sku} - ${product.name}`);
            console.log(`Stock: ${product.stock}`);
            console.log(`Depot Distribution:`, JSON.stringify(product.depotDistribution, null, 2));
        }

        // Check one depot in detail
        const depot = await Depot.findOne({ userId: user._id });
        if (depot) {
            console.log(`\nSample Depot: ${depot.name}`);
            console.log(`Products array length: ${depot.products?.length || 0}`);
            console.log(`Products:`, JSON.stringify(depot.products, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

debugDepotIssue();
