const Depot = require('../models/Depot');
const { checkDepotCapacity } = require('./alertHelpers');

// Recalculate depot metrics from actual inventory
const recalculateDepotMetrics = async (depotId, userId) => {
  try {
    const depot = await Depot.findOne({ _id: depotId, userId });
    if (!depot) return null;

    // The pre-save hook will automatically recalculate:
    // - currentUtilization (sum of all product quantities)
    // - itemsStored (count of products)
    // - status (based on utilization percentage)

    // Just save to trigger the hook
    await depot.save();

    // Check if depot capacity alert is needed
    await checkDepotCapacity(depotId, userId);

    return depot;
  } catch (error) {
    console.error('Error recalculating depot metrics:', error);
    return null;
  }
};

module.exports = {
  recalculateDepotMetrics
};
