const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/inventroops?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
    const User = mongoose.connection.collection('users');
    const Product = mongoose.connection.collection('products');

    const users = await User.find({}).toArray();

    console.log('--- SYSTEM HEALTH CHECK ---');
    for (const u of users) {
        const pCount = await Product.countDocuments({ userId: u._id });
        const products = await Product.find({ userId: u._id }).toArray();
        const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
        console.log(`User: ${u.email} | ID: ${u._id} | Products: ${pCount} | Value: ₹${totalValue}`);
    }
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
