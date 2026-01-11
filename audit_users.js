const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/inventroops?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
    const User = mongoose.connection.collection('users');
    const Transaction = mongoose.connection.collection('transactions');
    const Product = mongoose.connection.collection('products');

    const users = await User.find({}).toArray();

    console.log('--- DATA PER USER ---');
    for (const u of users) {
        const pCount = await Product.countDocuments({ userId: u._id });
        const tCount = await Transaction.countDocuments({ userId: u._id });
        console.log(`User: ${u.email} | ID: ${u._id} | Products: ${pCount} | Transactions: ${tCount}`);
    }
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
