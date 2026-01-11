const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/inventroops?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
    const Product = mongoose.connection.collection('products');
    const counts = await Product.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]).toArray();
    const User = mongoose.connection.collection('users');

    console.log('--- USER INVENTORY SUMMARY ---');
    for (const c of counts) {
        const u = await User.findOne({ _id: c._id });
        console.log(`User: ${u ? u.email : c._id} | Products: ${c.count}`);
    }
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
