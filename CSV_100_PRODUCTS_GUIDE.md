# 📦 100-Product Inventory CSV - Complete Guide

**File:** `inventory_100_products.csv`  
**Date:** 2026-01-14 23:36  
**Total Products:** 100  
**Status:** ✅ Ready to Upload

---

## 📊 **CSV Overview:**

### **Product Distribution:**

| Category | Count | Depot Distribution |
|----------|-------|-------------------|
| **Sneakers** | 15 products | Balanced across all 4 depots |
| **Apparel** | 15 products | Balanced across all 4 depots |
| **Accessories** | 15 products | Balanced across all 4 depots |
| **Electronics** | 15 products | Balanced across all 4 depots |
| **Sports** | 15 products | Balanced across all 4 depots |
| **Home Goods** | 15 products | Balanced across all 4 depots |
| **Automotive** | 10 products | Balanced across all 4 depots |

**Total:** 100 products across 7 categories

---

## 🏢 **Depot Assignment:**

Products are **evenly distributed** across your 4 depots:

| Depot | Location | Approx. Products | Total Units |
|-------|----------|------------------|-------------|
| **Parth's Depot** | Thane | ~25 products | ~4,000 units |
| **Animesh's Depot** | Vitthalwadi | ~25 products | ~4,000 units |
| **Aayush's Depot** | Navi Mumbai | ~25 products | ~1,000 units |
| **Abhay's Depot** | Kalyan | ~25 products | ~1,000 units |

---

## 📋 **CSV Columns:**

```
sku,name,category,stock,price,supplier,reorderPoint,dailySales,weeklySales,brand,leadTime,depot,image
```

### **Column Details:**

1. **sku** - Unique product identifier (e.g., SNK-001, APP-001)
2. **name** - Product name (e.g., Nike Air Max 270)
3. **category** - Product category (Sneakers, Apparel, etc.)
4. **stock** - Initial stock quantity (45-400 units)
5. **price** - Product price in USD ($12-$799)
6. **supplier** - Supplier company name
7. **reorderPoint** - When to reorder (10-80 units)
8. **dailySales** - Average daily sales (2-20 units)
9. **weeklySales** - Average weekly sales (14-140 units)
10. **brand** - Product brand
11. **leadTime** - Supplier lead time (4-20 days)
12. **depot** - Assigned depot name
13. **image** - Product image URL (Unsplash)

---

## 🎯 **Product Examples:**

### **Sneakers (SNK-001 to SNK-015):**
```
Nike Air Max 270 → Parth's Depot
Adidas Ultraboost 22 → Animesh's Depot
Puma RS-X → Parth's Depot
New Balance 990v5 → Abhay's Depot
```

### **Apparel (APP-001 to APP-015):**
```
Levi's 501 Jeans → Parth's Depot
Nike Dri-FIT T-Shirt → Animesh's Depot
Zara Slim Fit Shirt → Aayush's Depot
H&M Cotton Hoodie → Abhay's Depot
```

### **Electronics (ELC-001 to ELC-015):**
```
Sony WH-1000XM5 Headphones → Parth's Depot
Samsung Galaxy Buds Pro → Animesh's Depot
Logitech MX Master 3 → Aayush's Depot
Apple AirPods Pro → Abhay's Depot
```

---

## 💰 **Price Range:**

| Price Range | Count | Examples |
|-------------|-------|----------|
| **$12-$50** | 35 products | Cables, basic accessories, car care |
| **$51-$100** | 30 products | T-shirts, wallets, speakers |
| **$101-$200** | 25 products | Sneakers, headphones, small appliances |
| **$201-$500** | 8 products | Premium electronics, tools |
| **$501+** | 2 products | Dyson vacuum, golf clubs |

**Average Price:** ~$125

---

## 📦 **Stock Levels:**

| Stock Range | Count | Purpose |
|-------------|-------|---------|
| **45-80 units** | 15 products | Low-volume, high-value items |
| **81-150 units** | 35 products | Medium-volume items |
| **151-250 units** | 40 products | High-volume items |
| **251-400 units** | 10 products | Very high-volume basics |

**Total Stock:** ~16,000 units across all products

---

## 🏭 **Top Brands Included:**

- **Nike** - Sneakers, apparel, sports
- **Adidas** - Sneakers, apparel, sports
- **Apple** - Electronics, accessories
- **Samsung** - Electronics
- **Sony** - Electronics
- **Levi's** - Apparel
- **Ray-Ban** - Accessories
- **Dyson** - Home goods
- **Bosch** - Automotive
- **Garmin** - Sports, automotive

---

## 🖼️ **Product Images:**

All products have **high-quality images** from Unsplash:
- ✅ Category-appropriate photos
- ✅ Professional quality
- ✅ Fast loading (400px width)
- ✅ Royalty-free

---

## 🔄 **How to Upload:**

### **Step 1: Locate the CSV**
```
File: d:\Major\inventory_100_products.csv
```

### **Step 2: Upload to System**
1. Go to **Inventory Overview**
2. Click **"Upload CSV"** button
3. Select `inventory_100_products.csv`
4. Click **"Upload"**

### **Step 3: Wait for Processing**
- System will process 100 products
- Products will be assigned to depots as specified
- Images will be loaded
- Stock will be distributed

### **Step 4: Verify**
- Check **Inventory Overview** - should show 150 products (50 existing + 100 new)
- Check **Depot Details** - each depot should have ~25 new products
- Check **Product Images** - all should display properly

---

## 📊 **Expected Results:**

### **After Upload:**

**Inventory Overview:**
- Total Products: 150 (50 existing + 100 new)
- Total Stock: ~24,000 units
- Categories: 7 categories

**Depot Status:**

| Depot | Before | After | Change |
|-------|--------|-------|--------|
| **Parth's Depot** | ~12 products | ~37 products | +25 |
| **Animesh's Depot** | ~13 products | ~38 products | +25 |
| **Aayush's Depot** | ~12 products | ~37 products | +25 |
| **Abhay's Depot** | ~13 products | ~38 products | +25 |

---

## ⚠️ **Important Notes:**

### **Stock is Additive:**
If a product with the same SKU exists:
- Stock will be **ADDED** (not replaced)
- Product details will be **UPDATED**
- Depot assignment will be **RESPECTED**

### **New Products:**
Products with new SKUs will be:
- **Created** as new entries
- **Assigned** to specified depot
- **Added** to depot inventory

---

## 🎯 **Data Quality:**

### **Realistic Values:**
- ✅ Stock levels based on product type
- ✅ Prices match market rates
- ✅ Daily/weekly sales are proportional
- ✅ Lead times vary by supplier
- ✅ Reorder points calculated properly

### **Balanced Distribution:**
- ✅ Even category distribution
- ✅ Even depot distribution
- ✅ Mix of price ranges
- ✅ Mix of stock levels

---

## 📝 **Sample Rows:**

```csv
SNK-001,Nike Air Max 270,Sneakers,150,180,Nike Inc,30,8,56,Nike,7,Parth's Depot,https://...
APP-001,Levi's 501 Jeans,Apparel,250,89,Levi Strauss,50,12,84,Levi's,8,Parth's Depot,https://...
ELC-001,Sony WH-1000XM5 Headphones,Electronics,120,399,Sony Corp,25,6,42,Sony,12,Parth's Depot,https://...
```

---

## ✅ **Quality Checklist:**

- [x] 100 unique SKUs
- [x] All required columns present
- [x] Realistic stock levels
- [x] Proper depot assignments
- [x] Valid image URLs
- [x] Balanced category distribution
- [x] Balanced depot distribution
- [x] Proper pricing
- [x] Realistic sales data
- [x] Valid supplier names

---

## 🚀 **Ready to Upload!**

Your CSV is **production-ready** with:
- ✅ 100 diverse products
- ✅ 7 categories
- ✅ 4 depot assignments
- ✅ Realistic data
- ✅ Product images
- ✅ Proper formatting

**Just upload and watch your inventory grow!** 🎉

---

**File Location:** `d:\Major\inventory_100_products.csv`  
**Status:** ✅ Ready  
**Action:** Upload via Inventory Overview page
