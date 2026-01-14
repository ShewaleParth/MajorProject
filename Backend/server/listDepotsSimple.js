/**
 * List depots for user - VERSION 2
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function listDepots() {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({}));
    const user = await User.findOne({ email: 'sparth7972@gmail.com' });
    const Depot = mongoose.model('Depot', new mongoose.Schema({}, { strict: false }));
    const depots = await Depot.find({ userId: user._id });

    console.log('--- USER DEPOTS ---');
    depots.forEach(d => {
        console.log(`- ID: ${d._id}, Name: ${d.name}`);
    });
    console.log('--- END ---');
    await mongoose.connection.close();
}
listDepots();
