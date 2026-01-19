const Alert = require('../models/Alert');
const Product = require('../models/Product');
const Depot = require('../models/Depot');

class NotificationEngine {
    // Check and create low stock alerts for all products
    async checkLowStock(userId) {
        try {
            const products = await Product.find({ userId });
            const alerts = [];

            for (const product of products) {
                if (product.status === 'low-stock' || product.status === 'out-of-stock') {
                    // Check if alert already exists
                    const existingAlert = await Alert.findOne({
                        userId,
                        productId: product._id,
                        type: product.status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
                        isResolved: false
                    });

                    if (!existingAlert) {
                        const isOutOfStock = product.status === 'out-of-stock';
                        const alert = new Alert({
                            userId,
                            type: isOutOfStock ? 'out-of-stock' : 'low-stock',
                            category: isOutOfStock ? 'critical' : 'warning',
                            title: `${isOutOfStock ? 'Out of Stock' : 'Low Stock'} Alert`,
                            description: `${product.name} (${product.sku}) ${isOutOfStock ? 'is out of stock' : `has only ${product.stock} units remaining`}`,
                            severity: isOutOfStock ? 'high' : 'medium',
                            productId: product._id
                        });
                        await alert.save();
                        alerts.push(alert);
                    }
                }
            }

            return alerts;
        } catch (error) {
            console.error('Error checking low stock:', error);
            throw error;
        }
    }

    // Check and create overstock alerts
    async checkOverstock(userId) {
        try {
            const products = await Product.find({ userId, status: 'overstock' });
            const alerts = [];

            for (const product of products) {
                const existingAlert = await Alert.findOne({
                    userId,
                    productId: product._id,
                    type: 'overstock',
                    isResolved: false
                });

                if (!existingAlert) {
                    const alert = new Alert({
                        userId,
                        type: 'overstock',
                        category: 'warning',
                        title: 'Overstock Alert',
                        description: `${product.name} (${product.sku}) has ${product.stock} units, which is ${Math.round((product.stock / product.reorderPoint) * 100)}% above normal levels`,
                        severity: 'medium',
                        productId: product._id
                    });
                    await alert.save();
                    alerts.push(alert);
                }
            }

            return alerts;
        } catch (error) {
            console.error('Error checking overstock:', error);
            throw error;
        }
    }

    // Check and create reorder point alerts (AI-based)
    async checkReorderPoints(userId) {
        try {
            const products = await Product.find({ userId });
            const alerts = [];

            for (const product of products) {
                // Check if stock is at or below reorder point
                if (product.stock <= product.reorderPoint && product.stock > 0) {
                    const existingAlert = await Alert.findOne({
                        userId,
                        productId: product._id,
                        type: 'reorder-point',
                        isResolved: false
                    });

                    if (!existingAlert) {
                        const alert = new Alert({
                            userId,
                            type: 'reorder-point',
                            category: 'warning',
                            title: 'Reorder Point Reached',
                            description: `${product.name} (${product.sku}) has reached reorder point. Current stock: ${product.stock}, Reorder point: ${product.reorderPoint}`,
                            severity: 'medium',
                            productId: product._id,
                            metadata: {
                                currentStock: product.stock,
                                reorderPoint: product.reorderPoint,
                                suggestedOrderQty: product.reorderPoint * 2
                            }
                        });
                        await alert.save();
                        alerts.push(alert);
                    }
                }
            }

            return alerts;
        } catch (error) {
            console.error('Error checking reorder points:', error);
            throw error;
        }
    }

    // Check depot capacity warnings
    async checkDepotCapacity(userId) {
        try {
            const depots = await Depot.find({ userId });
            const alerts = [];

            for (const depot of depots) {
                const utilizationPercent = (depot.currentUtilization / depot.capacity) * 100;

                // Create alert if utilization is above 85%
                if (utilizationPercent >= 85) {
                    const existingAlert = await Alert.findOne({
                        userId,
                        depotId: depot._id,
                        type: 'capacity-warning',
                        isResolved: false
                    });

                    if (!existingAlert) {
                        const alert = new Alert({
                            userId,
                            type: 'capacity-warning',
                            category: utilizationPercent >= 95 ? 'critical' : 'warning',
                            title: `Depot Capacity ${utilizationPercent >= 95 ? 'Critical' : 'Warning'}`,
                            description: `${depot.name} is at ${Math.round(utilizationPercent)}% capacity (${depot.currentUtilization}/${depot.capacity} units)`,
                            severity: utilizationPercent >= 95 ? 'high' : 'medium',
                            depotId: depot._id,
                            metadata: {
                                utilizationPercent: Math.round(utilizationPercent),
                                currentUtilization: depot.currentUtilization,
                                capacity: depot.capacity
                            }
                        });
                        await alert.save();
                        alerts.push(alert);
                    }
                }
            }

            return alerts;
        } catch (error) {
            console.error('Error checking depot capacity:', error);
            throw error;
        }
    }

    // Create alert for demand spike (called by AI service or external trigger)
    async createDemandSpikeAlert(userId, productId, metadata = {}) {
        try {
            const product = await Product.findById(productId);
            if (!product) throw new Error('Product not found');

            const alert = new Alert({
                userId,
                type: 'demand-spike',
                category: 'info',
                title: 'Unusual Demand Spike Detected',
                description: `AI detected unusual demand spike for ${product.name} (${product.sku}). ${metadata.message || 'Consider increasing stock levels.'}`,
                severity: 'medium',
                productId: product._id,
                metadata: {
                    ...metadata,
                    detectedAt: new Date()
                }
            });

            await alert.save();
            return alert;
        } catch (error) {
            console.error('Error creating demand spike alert:', error);
            throw error;
        }
    }

    // Create alert for delayed delivery
    async createDelayedDeliveryAlert(userId, metadata = {}) {
        try {
            const alert = new Alert({
                userId,
                type: 'delayed-delivery',
                category: 'warning',
                title: 'Delayed Supplier Delivery',
                description: metadata.description || 'A supplier delivery is delayed',
                severity: 'medium',
                metadata: {
                    ...metadata,
                    reportedAt: new Date()
                }
            });

            await alert.save();
            return alert;
        } catch (error) {
            console.error('Error creating delayed delivery alert:', error);
            throw error;
        }
    }

    // Create alert for failed stock transfer
    async createTransferFailedAlert(userId, metadata = {}) {
        try {
            const alert = new Alert({
                userId,
                type: 'transfer-failed',
                category: 'critical',
                title: 'Stock Transfer Failed',
                description: metadata.description || 'A stock transfer between depots has failed',
                severity: 'high',
                metadata: {
                    ...metadata,
                    failedAt: new Date()
                }
            });

            await alert.save();
            return alert;
        } catch (error) {
            console.error('Error creating transfer failed alert:', error);
            throw error;
        }
    }

    // Create expiry warning alert
    async createExpiryWarningAlert(userId, productId, metadata = {}) {
        try {
            const product = await Product.findById(productId);
            if (!product) throw new Error('Product not found');

            const alert = new Alert({
                userId,
                type: 'expiry-warning',
                category: 'warning',
                title: 'Product Expiry Warning',
                description: `${product.name} (${product.sku}) ${metadata.message || 'is approaching expiry date'}`,
                severity: 'medium',
                productId: product._id,
                metadata: {
                    ...metadata,
                    checkedAt: new Date()
                }
            });

            await alert.save();
            return alert;
        } catch (error) {
            console.error('Error creating expiry warning alert:', error);
            throw error;
        }
    }

    // Run all automated checks
    async runAllChecks(userId) {
        try {
            const results = {
                lowStock: await this.checkLowStock(userId),
                overstock: await this.checkOverstock(userId),
                reorderPoints: await this.checkReorderPoints(userId),
                depotCapacity: await this.checkDepotCapacity(userId)
            };

            return results;
        } catch (error) {
            console.error('Error running all checks:', error);
            throw error;
        }
    }
}

module.exports = new NotificationEngine();
