// Quick script to check database status
// Run this in browser console (F12) to see what data exists

console.log("🔍 Checking database status...\n");

// Check products
fetch('/api/products')
    .then(res => res.json())
    .then(data => {
        console.log("📦 Products:", data.products?.length || 0);
        if (data.products?.length > 0) {
            console.log("Sample product:", data.products[0]);
        }
    });

// Check forecasts
fetch('/api/forecasts')
    .then(res => res.json())
    .then(data => {
        console.log("📊 Forecasts:", data.forecasts?.length || 0);
        if (data.forecasts?.length > 0) {
            console.log("Sample forecast:", data.forecasts[0]);
        }
    });

// Check transactions
fetch('/api/transactions')
    .then(res => res.json())
    .then(data => {
        console.log("📝 Transactions:", data.transactions?.length || 0);
    });

// Check depots
fetch('/api/depots')
    .then(res => res.json())
    .then(data => {
        console.log("🏭 Depots:", data.depots?.length || 0);
    });

console.log("\n✅ Check complete! See results above.");
