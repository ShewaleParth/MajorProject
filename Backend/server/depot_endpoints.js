// Get depot products
app.get('/api/depots/:id/products', async (req, res) => {
  try {
    const depot = await Depot.findById(req.params.id).populate('products.productId');
    
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    const products = depot.products.map(p => ({
      productId: p.productId?._id || p.productId,
      productName: p.productName,
      productSku: p.productSku,
      quantity: p.quantity,
      lastUpdated: p.lastUpdated
    }));

    res.json({
      depotId: depot._id,
      depotName: depot.name,
      products,
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Error fetching depot products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed depot view
app.get('/api/depots/:id/details', async (req, res) => {
  try {
    const depot = await Depot.findById(req.params.id);
    
    if (!depot) {
      return res.status(404).json({ message: 'Depot not found' });
    }

    // Get all products in this depot with full details
    const productIds = depot.products.map(p => p.productId);
    const fullProducts = await Product.find({ _id: { $in: productIds } });
    
    const productsWithQuantity = depot.products.map(dp => {
      const fullProduct = fullProducts.find(fp => fp._id.toString() === dp.productId.toString());
      return {
        product: fullProduct ? {
          id: fullProduct._id,
          sku: fullProduct.sku,
          name: fullProduct.name,
          category: fullProduct.category,
          price: fullProduct.price,
          status: fullProduct.status
        } : null,
        quantity: dp.quantity,
        lastUpdated: dp.lastUpdated
      };
    }).filter(p => p.product !== null);

    // Get transactions for this depot
    const transactions = await Transaction.find({
      $or: [
        { toDepotId: depot._id },
        { fromDepotId: depot._id }
      ]
    }).sort({ timestamp: -1 }).limit(100);

    // Calculate transaction stats
    const transactionStats = {
      stockIn: 0,
      stockOut: 0,
      transfers: 0
    };

    transactions.forEach(t => {
      if (t.toDepotId && t.toDepotId.toString() === depot._id.toString()) {
        if (t.transactionType === 'stock-in') {
          transactionStats.stockIn += t.quantity;
        } else if (t.transactionType === 'transfer') {
          transactionStats.transfers += t.quantity;
        }
      }
      if (t.fromDepotId && t.fromDepotId.toString() === depot._id.toString()) {
        if (t.transactionType === 'stock-out') {
          transactionStats.stockOut += t.quantity;
        } else if (t.transactionType === 'transfer') {
          transactionStats.transfers += t.quantity;
        }
      }
    });

    // Calculate utilization history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions.filter(t => t.timestamp >= thirtyDaysAgo);
    const utilizationHistory = [];
    
    // Group by date
    const utilizationByDate = {};
    recentTransactions.forEach(t => {
      const date = t.timestamp.toISOString().split('T')[0];
      if (!utilizationByDate[date]) {
        utilizationByDate[date] = depot.currentUtilization;
      }
    });

    Object.keys(utilizationByDate).forEach(date => {
      utilizationHistory.push({
        date,
        utilization: utilizationByDate[date]
      });
    });

    // Calculate top products by quantity and value
    const topProducts = productsWithQuantity
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({
        name: p.product.name,
        quantity: p.quantity,
        value: p.quantity * p.product.price
      }));

    res.json({
      depot: {
        id: depot._id,
        name: depot.name,
        location: depot.location,
        capacity: depot.capacity,
        currentUtilization: depot.currentUtilization,
        itemsStored: depot.itemsStored,
        status: depot.status
      },
      products: productsWithQuantity,
      utilizationHistory,
      transactionStats,
      topProducts
    });
  } catch (error) {
    console.error('Error fetching depot details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
