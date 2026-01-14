require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/sangrahak?retryWrites=true&w=majority&appName=Cluster0';

async function analyzeData() {
    try {
        await mongoose.connect(MONGODB_URI);

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'sparth7972@gmail.com' });
        const products = await Product.find({ userId: user._id }).limit(10);

        console.log('📊 Sample Products:\n');
        products.forEach(p => {
            console.log(`${p.sku} | ${p.name} | ${p.category} | Stock: ${p.stock} | Price: $${p.price}`);
        });

        const categories = await Product.distinct('category', { userId: user._id });
        console.log(`\n📁 Categories (${categories.length}):`);
        console.log(categories.join(', '));

        const totalProducts = await Product.countDocuments({ userId: user._id });
        console.log(`\n📦 Total Products: ${totalProducts}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

analyzeData();
