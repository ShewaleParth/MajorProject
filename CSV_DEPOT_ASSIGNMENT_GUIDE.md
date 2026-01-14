# ✅ CSV Depot Assignment - Complete Guide

**Date:** 2026-01-14 23:32  
**Feature:** Depot assignment from CSV  
**Status:** ✅ ENABLED

---

## 🎯 **YES! You can specify depots in your CSV!**

### **Answer: If you mention a depot in your CSV, the product will be assigned to that specific depot!**

---

## 📋 **How It Works:**

The system now supports **3 ways** to assign products to depots:

### **Method 1: Specify Depot Name in CSV** ✅ RECOMMENDED
```csv
sku,name,category,stock,depot
PRD-001,Product A,Sneakers,100,Parth's Depot
PRD-002,Product B,Electronics,50,Animesh's Depot
PRD-003,Product C,Accessories,75,Aayush's Depot
```

### **Method 2: Specify Depot Location in CSV** ✅ ALTERNATIVE
```csv
sku,name,category,stock,depotLocation
PRD-001,Product A,Sneakers,100,Thane
PRD-002,Product B,Electronics,50,Vitthalwadi
PRD-003,Product C,Accessories,75,Navi Mumbai
```

### **Method 3: Leave Empty (Random Assignment)** ✅ FALLBACK
```csv
sku,name,category,stock
PRD-001,Product A,Sneakers,100
PRD-002,Product B,Electronics,50
```
→ System randomly assigns to any depot

---

## 📊 **Supported CSV Column Names:**

The system recognizes multiple column name variations:

### **For Depot Name:**
- `depot`
- `Depot`
- `depotName`
- `DepotName`

### **For Depot Location:**
- `depotLocation`
- `DepotLocation`
- `location`

**You can use ANY of these column names!**

---

## 🏢 **Your Available Depots:**

| Depot Name | Location | Capacity |
|------------|----------|----------|
| **Parth's Depot** | Thane | 10,000 units |
| **Animesh's Depot** | Vitthalwadi | 10,000 units |
| **Aayush's Depot** | Navi Mumbai | 500 units |
| **Abhay's Depot** | Kalyan | 1,000 units |

---

## 🎯 **CSV Examples:**

### **Example 1: Using Depot Names**

```csv
sku,name,category,stock,price,depot
PRD-001,Nike Air Max,Sneakers,100,120,Parth's Depot
PRD-002,Adidas Shoes,Footwear,50,95,Animesh's Depot
PRD-003,Leather Wallet,Accessories,200,45,Aayush's Depot
PRD-004,Wireless Mouse,Electronics,150,30,Abhay's Depot
```

**Result:**
- PRD-001 → Parth's Depot (Thane)
- PRD-002 → Animesh's Depot (Vitthalwadi)
- PRD-003 → Aayush's Depot (Navi Mumbai)
- PRD-004 → Abhay's Depot (Kalyan)

---

### **Example 2: Using Locations**

```csv
sku,name,category,stock,depotLocation
PRD-005,Running Shoes,Sports,80,Thane
PRD-006,Headphones,Electronics,60,Kalyan
PRD-007,Sunglasses,Accessories,120,Navi Mumbai
```

**Result:**
- PRD-005 → Parth's Depot (matched by "Thane")
- PRD-006 → Abhay's Depot (matched by "Kalyan")
- PRD-007 → Aayush's Depot (matched by "Navi Mumbai")

---

### **Example 3: Mixed (Some Specified, Some Random)**

```csv
sku,name,category,stock,depot
PRD-008,Product A,Sneakers,100,Parth's Depot
PRD-009,Product B,Electronics,50,
PRD-010,Product C,Accessories,75,Aayush's Depot
```

**Result:**
- PRD-008 → Parth's Depot (CSV specified)
- PRD-009 → Random depot (not specified)
- PRD-010 → Aayush's Depot (CSV specified)

---

## 🔍 **Smart Matching:**

The system uses **smart matching** to find depots:

### **Case-Insensitive:**
```csv
depot
parth's depot    ✅ Matches "Parth's Depot"
ANIMESH'S DEPOT  ✅ Matches "Animesh's Depot"
aayush's depot   ✅ Matches "Aayush's Depot"
```

### **Partial Matching:**
```csv
depot
Parth      ✅ Matches "Parth's Depot"
Animesh    ✅ Matches "Animesh's Depot"
Aayush     ✅ Matches "Aayush's Depot"
Abhay      ✅ Matches "Abhay's Depot"
```

### **Location Matching:**
```csv
depotLocation
Thane          ✅ Matches "Parth's Depot"
Vitthalwadi    ✅ Matches "Animesh's Depot"
Navi Mumbai    ✅ Matches "Aayush's Depot"
Kalyan         ✅ Matches "Abhay's Depot"
```

---

## ⚠️ **Fallback Behavior:**

### **If depot name/location is:**

| Scenario | Behavior |
|----------|----------|
| **Not specified** | Random assignment |
| **Misspelled** | Random assignment |
| **Doesn't exist** | Random assignment |
| **Empty string** | Random assignment |

**The system ALWAYS assigns to a depot** - it never fails!

---

## 📝 **Complete CSV Template:**

```csv
sku,name,category,stock,price,supplier,depot,image
PRD-001,Nike Air Max,Sneakers,100,120,Nike Inc,Parth's Depot,https://example.com/image.jpg
PRD-002,Adidas Ultraboost,Footwear,50,95,Adidas,Animesh's Depot,
PRD-003,Leather Wallet,Accessories,200,45,Generic,Aayush's Depot,
PRD-004,Wireless Mouse,Electronics,150,30,Logitech,Abhay's Depot,
PRD-005,Running Shoes,Sports,80,85,,
```

**Columns Explained:**
- `sku` - Product SKU (required)
- `name` - Product name (required)
- `category` - Product category
- `stock` - Quantity
- `price` - Price
- `supplier` - Supplier name
- `depot` - Depot name (optional - for specific assignment)
- `image` - Image URL (optional)

---

## 🔄 **How Assignment Works:**

```
1. System reads CSV row
2. Checks if 'depot' or 'depotLocation' column exists
3. If YES:
   a. Tries to find depot by exact name match
   b. If not found, tries partial name match
   c. If still not found, tries location match
   d. If still not found, assigns randomly
4. If NO:
   → Assigns randomly
5. Product assigned to depot
6. Depot inventory updated
```

---

## 📊 **Console Logs:**

When you upload, you'll see:

```
✅ Assigned new product PRD-001 to depot: Parth's Depot (CSV specified)
📦 Added 50 units of PRD-002 to depot: Animesh's Depot (CSV specified)
✅ Assigned new product PRD-003 to depot: Aayush's Depot (random)
```

**"(CSV specified)"** = Depot was in your CSV  
**"(random)"** = System chose randomly

---

## 🎯 **Best Practices:**

### **1. Use Exact Depot Names:**
```csv
✅ Parth's Depot
✅ Animesh's Depot
✅ Aayush's Depot
✅ Abhay's Depot
```

### **2. Or Use Locations:**
```csv
✅ Thane
✅ Vitthalwadi
✅ Navi Mumbai
✅ Kalyan
```

### **3. Or Use Partial Names:**
```csv
✅ Parth
✅ Animesh
✅ Aayush
✅ Abhay
```

**All work perfectly!**

---

## 💡 **Pro Tips:**

### **Tip 1: Balance Your Depots**
Distribute products evenly:
```csv
PRD-001,Product A,100,Parth's Depot
PRD-002,Product B,100,Animesh's Depot
PRD-003,Product C,100,Aayush's Depot
PRD-004,Product D,100,Abhay's Depot
PRD-005,Product E,100,Parth's Depot
```

### **Tip 2: Use Small Depot for High-Value Items**
```csv
PRD-GOLD,Gold Watch,10,Aayush's Depot  # 500 capacity - secure
```

### **Tip 3: Use Large Depots for Bulk Items**
```csv
PRD-BULK,Bulk Sneakers,5000,Parth's Depot  # 10,000 capacity
```

---

## 🔧 **Testing:**

### **Test CSV:**
```csv
sku,name,category,stock,depot
TEST-001,Test Product 1,Test,10,Parth's Depot
TEST-002,Test Product 2,Test,20,Animesh
TEST-003,Test Product 3,Test,30,Thane
TEST-004,Test Product 4,Test,40,
```

**Expected Results:**
- TEST-001 → Parth's Depot (exact name match)
- TEST-002 → Animesh's Depot (partial name match)
- TEST-003 → Parth's Depot (location match)
- TEST-004 → Random depot (not specified)

---

## ✅ **Summary:**

| Feature | Status |
|---------|--------|
| **Depot name in CSV** | ✅ Supported |
| **Depot location in CSV** | ✅ Supported |
| **Case-insensitive matching** | ✅ Yes |
| **Partial name matching** | ✅ Yes |
| **Fallback to random** | ✅ Yes |
| **Multiple column names** | ✅ Yes |
| **Smart matching** | ✅ Yes |

---

## 🚀 **Ready to Use!**

**Just add a `depot` or `depotLocation` column to your CSV and specify which depot you want!**

**Example:**
```csv
sku,name,stock,depot
PRD-001,Product A,100,Parth's Depot
```

**That's it!** The product will be assigned to Parth's Depot automatically! 🎉

---

**Your depot assignment system is now fully flexible and intelligent!**
