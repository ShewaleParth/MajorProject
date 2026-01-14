// Quick fix script - Run this in browser console to clear invalid localStorage
console.log("🧹 Clearing invalid localStorage data...");

// Remove potentially corrupted data
localStorage.removeItem('token');
localStorage.removeItem('user');

console.log("✅ localStorage cleared!");
console.log("🔄 Please refresh the page (Ctrl + R)");
