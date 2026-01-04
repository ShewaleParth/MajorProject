const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventroops');

const fix = async () => {
    try {
        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const Product = mongoose.model('Product', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }));
        const Depot = mongoose.model('Depot', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }));
        const Transaction = mongoose.model('Transaction', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }));

        const user = await User.findOne({ email: 'admin@inventroops.com' });
        if (!user) {
            console.log('User not found. Run node dataSeed.js first.');
            process.exit(1);
        }

        console.log(`Updating all documents to belong to user: ${user._id}`);

        const pResult = await Product.updateMany({}, { $set: { userId: user._id } });
        const dResult = await Depot.updateMany({}, { $set: { userId: user._id } });
        const tResult = await Transaction.updateMany({}, { $set: { userId: user._id } });

        console.log(`✅ Fixed! Products: ${pResult.modifiedCount}, Depots: ${dResult.modifiedCount}, Transactions: ${tResult.modifiedCount}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

fix();
