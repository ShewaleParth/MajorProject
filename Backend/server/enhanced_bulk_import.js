// Enhanced Bulk Import with Transactions and Auto Depot Creation
app.post('/api/products/bulk-with-transactions', async (req, res) => {
  try {
    const productsData = req.body;

    if (!Array.isArray(productsData)) {
      return res.status(400).json({ message: 'Input must be an array of products' });
    }

    const results = {
      success: 0,
      failed: 0,
      productsCreated: 0,
      productsUpdated: 0,
      depotsCreated: 0,
      transactionsCreated: 0,
      errors: []
    };

    // Group transactions by SKU
    const productGroups = {};
    productsData.forEach(item => {
      if (!productGroups[item.sku]) {
        productGroups[item.sku] = [];
      }
      productGroups[item.sku].push(item);
    });

    // Process each product group
    for (const [sku, transactions] of Object.entries(productGroups)) {
      try {
        // Sort transactions by date to process chronologically
        transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

        const firstTransaction = transactions[0];
        
        // Validate required fields
        if (!firstTransaction.sku || !firstTransaction.name) {
          throw new Error(`Missing SKU or Name for product: ${sku}`);
        }

        // Find or create depot
        let depot = null;
        if (firstTransaction.depotName) {
          depot = await Depot.findOne({ name: firstTransaction.depotName });
          
          if (!depot) {
            // Auto-create depot
            depot = new Depot({
              name: firstTransaction.depotName,
              location: firstTransaction.depotLocation || 'Unknown',
              capacity: Number(firstTransaction.depotCapacity) || 10000,
              currentUtilization: 0,
              itemsStored: 0,
              products: [],
              status: 'normal'
            });
            await depot.save();
            results.depotsCreated++;
            console.log(`✅ Created depot: ${depot.name}`);
          }
        }

        // Check if product exists
        let product = await Product.findOne({ sku });
        let isNewProduct = false;

        if (!product) {
          // Create new product
          product = new Product({
            sku: firstTransaction.sku,
            name: firstTransaction.name,
            category: firstTransaction.category || 'Uncategorized',
            stock: 0, // Will be calculated from transactions
            reorderPoint: Number(firstTransaction.reorderPoint) || 10,
            supplier: firstTransaction.supplier || 'Unknown',
            price: Number(firstTransaction.price) || 0,
            depotId: depot ? depot._id : null,
            depotName: depot ? depot.name : null,
            depotQuantity: 0
          });
          isNewProduct = true;
          results.productsCreated++;
        } else {
          results.productsUpdated++;
        }

        // Process all transactions for this product
        let currentStock = 0;
        let depotStock = 0;

        for (const txn of transactions) {
          const quantity = Number(txn.transactionQuantity) || 0;
          const previousStock = currentStock;

          // Calculate new stock based on transaction type
          if (txn.transactionType === 'stock-in') {
            currentStock += quantity;
            depotStock += quantity;
          } else if (txn.transactionType === 'stock-out') {
            currentStock -= quantity;
            depotStock -= quantity;
          }

          // Create transaction record
          const transaction = new Transaction({
            productId: product._id,
            productName: product.name,
            productSku: product.sku,
            transactionType: txn.transactionType,
            quantity: quantity,
            toDepot: txn.transactionType === 'stock-in' && depot ? depot.name : undefined,
            toDepotId: txn.transactionType === 'stock-in' && depot ? depot._id : undefined,
            fromDepot: txn.transactionType === 'stock-out' && depot ? depot.name : undefined,
            fromDepotId: txn.transactionType === 'stock-out' && depot ? depot._id : undefined,
            previousStock: previousStock,
            newStock: currentStock,
            reason: txn.transactionReason || 'CSV Import',
            performedBy: 'System',
            timestamp: new Date(txn.transactionDate),
            createdAt: new Date(txn.transactionDate)
          });
          await transaction.save();
          results.transactionsCreated++;
        }

        // Update product with final stock
        product.stock = Math.max(0, currentStock);
        product.depotQuantity = Math.max(0, depotStock);
        product.updatedAt = new Date();
        await product.save();

        // Update depot with product
        if (depot && depotStock > 0) {
          const existingProductIndex = depot.products.findIndex(
            p => p.productId.toString() === product._id.toString()
          );

          if (existingProductIndex >= 0) {
            depot.products[existingProductIndex].quantity = depotStock;
            depot.products[existingProductIndex].lastUpdated = new Date();
          } else {
            depot.products.push({
              productId: product._id,
              productName: product.name,
              productSku: product.sku,
              quantity: depotStock,
              lastUpdated: new Date()
            });
          }

          depot.itemsStored = depot.products.length;
          depot.currentUtilization = depot.products.reduce((sum, p) => sum + p.quantity, 0);
          
          // Update depot status based on utilization
          const utilizationPercentage = (depot.currentUtilization / depot.capacity) * 100;
          if (utilizationPercentage >= 90) {
            depot.status = 'critical';
          } else if (utilizationPercentage >= 70) {
            depot.status = 'warning';
          } else {
            depot.status = 'normal';
          }
          
          depot.updatedAt = new Date();
          await depot.save();
        }

        // Create stock alerts if needed
        await createStockAlert(product);
        results.success++;

        console.log(`✅ Processed product: ${product.name} (${product.sku}) - Final stock: ${product.stock}`);

      } catch (err) {
        results.failed++;
        results.errors.push({ sku, error: err.message });
        console.error(`❌ Error processing product ${sku}:`, err.message);
      }
    }

    // Emit WebSocket events for real-time updates
    io.emit('products:bulk-imported', {
      productsCreated: results.productsCreated,
      productsUpdated: results.productsUpdated,
      depotsCreated: results.depotsCreated,
      transactionsCreated: results.transactionsCreated
    });

    res.json({
      message: `Bulk import completed`,
      results
    });

  } catch (error) {
    console.error('Error in bulk import with transactions:', error);
    res.status(500).json({ message: 'Server error during bulk import', error: error.message });
  }
});
