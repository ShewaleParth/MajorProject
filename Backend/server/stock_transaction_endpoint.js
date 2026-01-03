// Add this endpoint to server.js after the existing product endpoints

// Stock In/Out endpoint with transaction recording
app.post('/api/products/:id/stock-transaction', async (req, res) => {
  try {
    const { transactionType, quantity, reason, notes, performedBy } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Validate stock-out
    if (transactionType === 'stock-out' && quantity > product.stock) {
      return res.status(400).json({ 
        message: `Cannot remove ${quantity} units. Only ${product.stock} units available.` 
      });
    }

    const previousStock = product.stock;
    let newStock;

    // Calculate new stock based on transaction type
    if (transactionType === 'stock-in' || transactionType === 'adjustment') {
      newStock = previousStock + quantity;
    } else if (transactionType === 'stock-out') {
      newStock = previousStock - quantity;
    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update product stock
    product.stock = newStock;
    product.updatedAt = new Date();
    await product.save();

    // Create transaction record
    const transaction = new Transaction({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      transactionType,
      quantity,
      previousStock,
      newStock,
      reason: reason || `${transactionType} transaction`,
      notes: notes || '',
      performedBy: performedBy || 'User',
      timestamp: new Date()
    });
    await transaction.save();

    // Emit WebSocket event
    io.emit('transaction:created', {
      productId: product._id,
      productName: product.name,
      transactionType,
      quantity,
      previousStock,
      newStock
    });

    // Check and create alerts if needed
    await createStockAlert(product);

    res.json({
      message: 'Transaction completed successfully',
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        stock: product.stock,
        status: product.status
      },
      transaction: {
        id: transaction._id,
        transactionType: transaction.transactionType,
        quantity: transaction.quantity,
        previousStock: transaction.previousStock,
        newStock: transaction.newStock,
        timestamp: transaction.timestamp
      }
    });
  } catch (error) {
    console.error('Error processing stock transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
