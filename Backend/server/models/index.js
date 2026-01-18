// Central export for all models
const User = require('./User');
const Product = require('./Product');
const Depot = require('./Depot');
const Transaction = require('./Transaction');
const Forecast = require('./Forecast');
const Alert = require('./Alert');
const Report = require('./Report');

module.exports = {
  User,
  Product,
  Depot,
  Transaction,
  Forecast,
  Alert,
  Report
};
