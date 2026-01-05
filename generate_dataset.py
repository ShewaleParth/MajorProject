
import csv
import random
import os

def generate_csv():
    output_dir = 'd:/Major/Dataset'
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, 'inventory_50_items.csv')

    categories = ['Sneakers', 'Electronics', 'Apparel', 'Accessories', 'Home Goods', 'Automotive', 'Sports']
    brands = {
        'Sneakers': ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'],
        'Electronics': ['Apple', 'Samsung', 'Sony', 'Dell', 'Logitech'],
        'Apparel': ['Zara', 'H&M', 'Levi\'s', 'Uniqlo', 'Gucci'],
        'Accessories': ['Ray-Ban', 'Casio', 'Fossil', 'Coach', 'Michael Kors'],
        'Home Goods': ['IKEA', 'Philips', 'Dyson', 'Cuisinart', 'KitchenAid'],
        'Automotive': ['Bosch', 'Michelin', 'Castrol', '3M', 'Mobil 1'],
        'Sports': ['Wilson', 'Spalding', 'Yonex', 'Under Armour', 'Decathlon']
    }

    suppliers = ['Global Logistics', 'Direct Supply Co.', 'Elite Distributors', 'Value Wholesale', 'Prime Importers']
    depots = [
        ('Mumbai Central', 'Mumbai, MH'),
        ('Delhi North', 'Delhi, DL'),
        ('Bangalore East', 'Bangalore, KA'),
        ('Kolkata West', 'Kolkata, WB')
    ]

    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        # Include depotName and depotLocation for the bulk-with-transactions route
        writer = csv.writer(f)
        writer.writerow(['sku', 'name', 'category', 'brand', 'price', 'stock', 'reorderPoint', 'supplier', 'leadTime', 'dailySales', 'weeklySales', 'depotName', 'depotLocation'])
        
        for i in range(1, 51):
            cat = random.choice(categories)
            brand = random.choice(brands[cat])
            sku = f"{cat[:3].upper()}-{random.randint(1000, 9999)}-{i:02d}"
            name_suffix = cat[:-1] if cat.endswith('s') else cat
            name = f"{brand} {name_suffix} Model-{i}"
            price = random.randint(500, 15000)
            
            # Metadata for demand
            dailySales = round(random.uniform(2.0, 20.0), 1)
            weeklySales = round(dailySales * 7 * random.uniform(0.9, 1.1), 1)
            leadTime = random.randint(5, 12)
            
            # Control stock levels for variety:
            # 1-5: Out of stock (0)
            # 6-20: Under stock / High Risk (stock < demand * leadTime)
            # 21-35: Moderate stock / Medium Risk (stock ~ demand * leadTime * 1.5)
            # 36-50: Healthy stock / Safe (stock > demand * leadTime * 3)
            
            if i <= 5:
                stock = 0
            elif i <= 20:
                stock = random.randint(1, int(dailySales * leadTime * 0.8) + 1)
            elif i <= 35:
                stock = random.randint(int(dailySales * leadTime * 1.2), int(dailySales * leadTime * 1.8))
            else:
                stock = random.randint(int(dailySales * leadTime * 3), int(dailySales * leadTime * 5))
            
            reorderPoint = int(dailySales * leadTime * 1.2)
            supplier = random.choice(suppliers)
            depot_name, depot_loc = random.choice(depots)
            
            writer.writerow([sku, name, cat, brand, price, stock, reorderPoint, supplier, leadTime, dailySales, weeklySales, depot_name, depot_loc])

    print(f'Enhanced CSV generated successfully at {file_path}')

if __name__ == "__main__":
    generate_csv()
