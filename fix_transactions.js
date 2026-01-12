const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/inventroops?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
    const Product = mongoose.connection.collection('products');
    const Transaction = mongoose.connection.collection('transactions');

    const products = await Product.find({}).toArray();
    console.log(`Found ${products.length} products total.`);

    let createdCount = 0;
    for (const product of products) {
        // Check if a transaction exists for this product
        const txExists = await Transaction.findOne({ productSku: product.sku });

        if (!txExists && product.stock > 0) {
            // Create a synthetic stock-in transaction
            await Transaction.insertOne({
                userId: product.userId,
                productId: product._id,
                productName: product.name,
                productSku: product.sku,
                transactionType: 'stock-in',
                quantity: product.stock,
                fromDepot: 'Supplier / External',
                toDepot: product.depotName || 'Main Depot',
                previousStock: 0,
                newStock: product.stock,
                reason: 'Initial system synchronization',
                performedBy: 'System Auto-Fix',
                timestamp: product.createdAt || new Date()
            });
            createdCount++;
        }
    }

    console.log(`Created ${createdCount} missing transactions.`);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
