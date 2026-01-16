const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');

const lines = content.split('\n');
const routes = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.match(/^app\.(get|post|put|delete|patch)\s*\(/)) {
    const match = trimmed.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (match) {
      routes.push({
        lineNumber: index + 1,
        method: match[1].toUpperCase(),
        path: match[2],
        line: trimmed.substring(0, 100)
      });
    }
  }
});

console.log('\n=== ALL ROUTES IN server.js ===\n');
console.log(`Total routes found: ${routes.length}\n`);

routes.forEach(route => {
  console.log(`${route.method.padEnd(7)} ${route.path.padEnd(50)} (Line ${route.lineNumber})`);
});

// Group by endpoint prefix
const grouped = {};
routes.forEach(route => {
  const prefix = route.path.split('/')[2] || 'root';
  if (!grouped[prefix]) grouped[prefix] = [];
  grouped[prefix].push(route);
});

console.log('\n\n=== GROUPED BY ENDPOINT ===\n');
Object.keys(grouped).sort().forEach(prefix => {
  console.log(`\n${prefix.toUpperCase()}:`);
  grouped[prefix].forEach(route => {
    console.log(`  ${route.method.padEnd(7)} ${route.path}`);
  });
});
