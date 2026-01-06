const mongoose = require('mongoose');

if (!process.env.MONGODB_URI) {
  console.error('❌ Fatal Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB Atlas successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify your username and password');
    console.log('3. Check your internet connection');
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔴 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
