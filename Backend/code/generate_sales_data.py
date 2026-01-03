import pandas as pd
import numpy as np
import random

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

# Product categories with different sales patterns
categories = {
    'Electronics': {'base_daily': (15, 30), 'volatility': 0.3},
    'Clothing': {'base_daily': (20, 50), 'volatility': 0.4},
    'Food': {'base_daily': (40, 80), 'volatility': 0.2},
    'Furniture': {'base_daily': (5, 15), 'volatility': 0.5},
    'Books': {'base_daily': (10, 25), 'volatility': 0.35},
    'Toys': {'base_daily': (12, 28), 'volatility': 0.4},
    'Sports': {'base_daily': (8, 20), 'volatility': 0.35},
    'Beauty': {'base_daily': (25, 45), 'volatility': 0.3}
}

products_data = []

for i in range(1, 51):
    category = random.choice(list(categories.keys()))
    cat_params = categories[category]
    
    sku = f"SKU-{i:03d}"
    product_name = f"{category} Item {i}"
    
    base_daily = random.uniform(*cat_params['base_daily'])
    daily_sales = max(1, int(base_daily + np.random.normal(0, base_daily * cat_params['volatility'])))
    
    weekly_multiplier = random.uniform(6.5, 7.5)
    weekly_sales = int(daily_sales * weekly_multiplier)
    
    # Ensure stock is never 0 - minimum 1 week, maximum 12 weeks
    stock_weeks = random.choice([1, 2, 3, 4, 6, 8, 12])
    stock = int(weekly_sales * stock_weeks)
    
    reorder_level = int(weekly_sales * random.uniform(1, 2))
    lead_time = random.choice([3, 5, 7, 10, 14])
    location = random.choice(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'])
    supplier = f"Supplier-{random.randint(1, 10)}"
    price = round(random.uniform(100, 5000), 2)
    
    products_data.append({
        'sku': sku,
        'name': product_name,
        'category': category,
        'stock': stock,
        'dailySales': daily_sales,
        'weeklySales': weekly_sales,
        'reorderPoint': reorder_level,
        'leadTime': lead_time,
        'location': location,
        'supplier': supplier,
        'price': price
    })

df = pd.DataFrame(products_data)

output_path = 'd:/Major Project/Sangrahak/Dataset/real_sales_data.csv'
df.to_csv(output_path, index=False)

print(f"✅ Created {output_path}")
print(f"📊 Generated {len(df)} products with realistic sales data\n")
print(f"📈 Statistics:")
print(f"   Stock: {df['stock'].min()}-{df['stock'].max()} units (avg: {df['stock'].mean():.0f})")
print(f"   Daily Sales: {df['dailySales'].min()}-{df['dailySales'].max()} units (avg: {df['dailySales'].mean():.1f})")
print(f"   Weekly Sales: {df['weeklySales'].min()}-{df['weeklySales'].max()} units (avg: {df['weeklySales'].mean():.0f})\n")

# Calculate risk
df['eta'] = df['stock'] / df['dailySales']
df['risk'] = df.apply(lambda x: 
    'High' if x['eta'] < x['leadTime'] else
    'Medium' if x['eta'] < 15 else
    'Low', axis=1)

print(f"🎯 Risk Distribution:")
for risk, count in df['risk'].value_counts().items():
    print(f"   {risk}: {count} products")

print(f"\n📄 Sample (first 5):")
print(df[['sku', 'name', 'stock', 'dailySales', 'risk']].head().to_string(index=False))
