/**
 * WebSocket event emitters for real-time updates
 */

/**
 * Emit product depot assignment event
 * @param {Object} io - Socket.IO instance
 * @param {Object} data - Event data
 */
const emitProductDepotAssigned = (io, data) => {
  io.emit('product:depot-assigned', {
    productId: data.productId,
    productName: data.productName,
    depotId: data.depotId,
    depotName: data.depotName,
    quantity: data.quantity
  });
};

/**
 * Emit product transfer event
 * @param {Object} io - Socket.IO instance
 * @param {Object} data - Event data
 */
const emitProductTransferred = (io, data) => {
  io.emit('product:transferred', {
    productId: data.productId,
    productName: data.productName,
    fromDepotId: data.fromDepotId,
    fromDepotName: data.fromDepotName,
    toDepotId: data.toDepotId,
    toDepotName: data.toDepotName,
    quantity: data.quantity
  });
};

/**
 * Emit depot stock updated event
 * @param {Object} io - Socket.IO instance
 * @param {Object} data - Event data
 */
const emitDepotStockUpdated = (io, data) => {
  io.emit('depot:stock-updated', {
    depotId: data.depotId,
    depotName: data.depotName,
    currentUtilization: data.currentUtilization,
    itemsStored: data.itemsStored
  });
};

/**
 * Emit transaction created event
 * @param {Object} io - Socket.IO instance
 * @param {Object} data - Event data
 */
const emitTransactionCreated = (io, data) => {
  io.emit('transaction:created', {
    productId: data.productId,
    productName: data.productName,
    transactionType: data.transactionType,
    quantity: data.quantity,
    previousStock: data.previousStock,
    newStock: data.newStock,
    depotId: data.depotId,
    depotName: data.depotName
  });
};

module.exports = {
  emitProductDepotAssigned,
  emitProductTransferred,
  emitDepotStockUpdated,
  emitTransactionCreated
};
