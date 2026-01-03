const fs = require('fs');
const path = require('path');

// Read the server.js file
const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// List of routes that need authentication
const protectedRoutes = [
  "app.post('/api/products'",
  "app.put('/api/products/:id'",
  "app.delete('/api/products/:id'",
  "app.get('/api/products/categories'",
  "app.post('/api/products/:id/assign-depot'",
  "app.post('/api/products/:id/transfer'",
  "app.get('/api/products/:id/details'",
  "app.post('/api/products/:id/stock-transaction'",
  "app.get('/api/depots'",
  "app.post('/api/depots'",
  "app.get('/api/depots/:id'",
  "app.put('/api/depots/:id'",
  "app.delete('/api/depots/:id'",
  "app.get('/api/depots/:id/details'",
  "app.get('/api/transactions'",
  "app.get('/api/forecasts'",
  "app.get('/api/forecasts/:identifier'",
  "app.get('/api/forecasts/analytics/insights'",
];

// Add authenticateToken middleware to routes that don't have it
protectedRoutes.forEach(route => {
  const regex = new RegExp(`(${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}), async`, 'g');
  content = content.replace(regex, `$1, authenticateToken, async`);
});

// Remove x-user-id header checks and replace with req.userId
content = content.replace(/const userId = req\.headers\['x-user-id'\];[\s\S]*?if \(!userId\) \{[\s\S]*?return res\.status\(400\)\.json\(\{ message: 'User ID is required' \}\);[\s\S]*?\}/g, '');

// Write back
fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ Updated all protected routes with authentication middleware');
