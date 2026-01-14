/**
 * Generate 100-product CSV with HIGH-QUALITY, PRODUCT-SPECIFIC images.
 * Uses curated Unsplash collections for premium electronics, fashion, and sneakers.
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join('d:', 'Major', 'Dataset', 'inventory_100_products_updated_images.csv');

// Curated high-quality image mappings
const premiumImages = {
    'Sneakers': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', // Nike Red
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', // Nike Fashion
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80', // Nike Air
        'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400&q=80', // Adidas
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', // Puma
        'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80', // New Balance
        'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&q=80', // Jordan
        'https://images.unsplash.com/photo-1512374382149-43345ad1b48d?w=400&q=80'  // Lifestyle SNK
    ],
    'Electronics': [
        'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&q=80', // Apple Product
        'https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33?w=400&q=80', // Headphones
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', // Audio
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', // Watch
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80', // Bluetooth Speaker
        'https://images.unsplash.com/photo-1583394838336-acd97773cf1f?w=400&q=80', // Controller
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'  // Smartphone
    ],
    'Apparel': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', // T-Shirt
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', // Jeans
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', // Jacket
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', // Winter Wear
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', // Formal Shirt
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80'  // Hoodie
    ],
    'Accessories': [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', // Sunglasses
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80', // Watch
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80', // Wallet
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80'  // Bag
    ]
};

const defaultImage = 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&q=80'; // Package

const products = [];
const categories = ['Sneakers', 'Electronics', 'Apparel', 'Accessories'];
const depots = ["Parth's Depot", "Animesh's Depot", "Aayush's Depot", "Abhay's Depot"];

for (let i = 1; i <= 100; i++) {
    const cat = categories[i % categories.length];
    const imgList = premiumImages[cat] || [defaultImage];
    const img = imgList[i % imgList.length];

    const sku = `${cat.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`;
    const name = `${cat} Item ${i}`;

    let risk, stock, reorder, stockout;
    const rand = Math.random();
    if (rand < 0.25) {
        risk = 'HIGH RISK';
        reorder = 40;
        stock = 12;
        stockout = 3;
    } else if (rand < 0.60) {
        risk = 'MEDIUM';
        reorder = 40;
        stock = 45;
        stockout = 9;
    } else {
        risk = 'SAFE';
        reorder = 30;
        stock = 150;
        stockout = 30;
    }

    products.push({
        sku,
        name,
        category: cat,
        stock,
        price: Math.floor(Math.random() * 500) + 50,
        supplier: 'Curated Supplier',
        reorderPoint: reorder,
        dailySales: 5,
        weeklySales: 35,
        brand: 'Premium Brand',
        leadTime: 7,
        depot: depots[i % depots.length],
        image: img,
        riskLevel: risk,
        stockoutIn: stockout,
        reorderQty: reorder * 2
    });
}

const headers = 'sku,name,category,stock,price,supplier,reorderPoint,dailySales,weeklySales,brand,leadTime,depot,image,riskLevel,stockoutIn,reorderQty';
const rows = products.map(p => `${p.sku},"${p.name}",${p.category},${p.stock},${p.price},"${p.supplier}",${p.reorderPoint},${p.dailySales},${p.weeklySales},"${p.brand}",${p.leadTime},"${p.depot}",${p.image},${p.riskLevel},${p.stockoutIn},${p.reorderQty}`);
const content = headers + '\n' + rows.join('\n');

fs.writeFileSync(CSV_PATH, content);
console.log('✅ Generated High-Quality Product Specific Images CSV');
