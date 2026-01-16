const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('SERVER.JS ANALYSIS');
console.log('='.repeat(80));

const serverPath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');
const lines = content.split('\n');

// Extract all routes
const routes = [];
const routePattern = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  const match = trimmed.match(routePattern);
  if (match) {
    routes.push({
      lineNumber: index + 1,
      method: match[1].toUpperCase(),
      path: match[2]
    });
  }
});

console.log(`\nTotal routes found: ${routes.length}\n`);

// Group by endpoint
const grouped = {};
routes.forEach(route => {
  const parts = route.path.split('/').filter(p => p);
  const prefix = parts.length >= 2 ? parts[1] : 'root';
  if (!grouped[prefix]) grouped[prefix] = [];
  grouped[prefix].push(route);
});

console.log('ROUTES GROUPED BY ENDPOINT:\n');
Object.keys(grouped).sort().forEach(prefix => {
  console.log(`\n${prefix.toUpperCase()} (${grouped[prefix].length} routes):`);
  grouped[prefix].forEach(route => {
    console.log(`  ${route.method.padEnd(7)} ${route.path.padEnd(60)} Line ${route.lineNumber}`);
  });
});

// Check existing modular routes
console.log('\n' + '='.repeat(80));
console.log('EXISTING MODULAR ROUTES:');
console.log('='.repeat(80) + '\n');

const routesDir = path.join(__dirname, 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const routerPattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  const matches = [...content.matchAll(routerPattern)];
  
  console.log(`${file} (${matches.length} routes):`);
  matches.forEach(match => {
    console.log(`  ${match[1].toUpperCase().padEnd(7)} ${match[2]}`);
  });
  console.log('');
});

// Find schemas and models
console.log('='.repeat(80));
console.log('SCHEMAS DEFINED IN SERVER.JS:');
console.log('='.repeat(80) + '\n');

const schemaPattern = /const\s+(\w+Schema)\s*=\s*new\s+mongoose\.Schema/g;
const modelPattern = /const\s+(\w+)\s*=\s*mongoose\.model\(['"`](\w+)['"`]/g;

const schemas = [...content.matchAll(schemaPattern)];
const models = [...content.matchAll(modelPattern)];

console.log('Schemas:');
schemas.forEach(match => console.log(`  - ${match[1]}`));

console.log('\nModels:');
models.forEach(match => console.log(`  - ${match[1]} (${match[2]})`));

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total routes in server.js: ${routes.length}`);
console.log(`Total modular route files: ${routeFiles.length}`);
console.log(`Total schemas: ${schemas.length}`);
console.log(`Total models: ${models.length}`);
