// Migration script to fix duplicate SKU issue
// This drops the old sku_1 index and creates a compound index on userId + sku

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Get existing indexes
    console.log('\n📋 Current indexes on products collection:');
    const indexes = await productsCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // Drop the old sku_1 unique index if it exists
    try {
      console.log('\n🗑️  Dropping old sku_1 index...');
      await productsCollection.dropIndex('sku_1');
      console.log('✅ Successfully dropped sku_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index sku_1 does not exist, skipping...');
      } else {
        throw error;
      }
    }

    // Create the new compound unique index
    console.log('\n🔨 Creating compound unique index on userId + sku...');
    await productsCollection.createIndex(
      { userId: 1, sku: 1 },
      { unique: true, name: 'userId_1_sku_1' }
    );
    console.log('✅ Successfully created compound index');

    // Verify new indexes
    console.log('\n📋 Updated indexes on products collection:');
    const newIndexes = await productsCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('ℹ️  Each user can now have products with the same SKU');
    console.log('ℹ️  Within a user account, SKU must still be unique');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

migrate();
