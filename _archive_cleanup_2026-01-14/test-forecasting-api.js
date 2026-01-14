// Test script to verify forecasting API connections
// Run this in browser console (F12) when on http://localhost:5173

console.log("🧪 Starting Forecasting API Tests...\n");

// Test 1: Check if servers are running
async function testServerHealth() {
    console.log("1️⃣ Testing Server Health...");

    try {
        const nodeHealth = await fetch('/api/health');
        console.log("✅ Node.js Server:", await nodeHealth.json());
    } catch (e) {
        console.error("❌ Node.js Server Error:", e.message);
    }

    try {
        const mlHealth = await fetch('/ml-api/health');
        console.log("✅ ML Server:", await mlHealth.json());
    } catch (e) {
        console.error("❌ ML Server Error:", e.message);
    }
}

// Test 2: Check authentication
async function testAuth() {
    console.log("\n2️⃣ Testing Authentication...");
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log("Token exists:", !!token);
    console.log("User exists:", !!user);

    if (user) {
        console.log("Logged in as:", JSON.parse(user));
    }
}

// Test 3: Fetch forecasts
async function testForecasts() {
    console.log("\n3️⃣ Testing Forecast Endpoint...");

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/forecasts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("✅ Forecasts Response:", data);
        console.log(`Found ${data.forecasts?.length || 0} forecasts`);
    } catch (e) {
        console.error("❌ Forecast Error:", e.message);
    }
}

// Test 4: Check products
async function testProducts() {
    console.log("\n4️⃣ Testing Products Endpoint...");

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("✅ Products Response:", data);
        console.log(`Found ${data.products?.length || 0} products`);
    } catch (e) {
        console.error("❌ Products Error:", e.message);
    }
}

// Run all tests
async function runAllTests() {
    await testServerHealth();
    await testAuth();
    await testForecasts();
    await testProducts();
    console.log("\n✅ All tests completed!");
}

// Execute
runAllTests();
