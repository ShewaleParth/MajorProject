const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/inventroops?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
    const User = mongoose.connection.collection('users');
    const Transaction = mongoose.connection.collection('transactions');

    const admin = await User.findOne({ email: 'admin@inventroops.com' });
    if (admin) {
        const tCount = await Transaction.countDocuments({ userId: admin._id });
        console.log(`Admin User ID: ${admin._id}`);
        console.log(`Transactions for Admin: ${tCount}`);
    } else {
        console.log('Admin user not found');
    }
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
