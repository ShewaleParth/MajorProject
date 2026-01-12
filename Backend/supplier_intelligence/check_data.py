import pandas as pd

# Load and check the processed data
df = pd.read_csv("d:/Major/Backend/supplier_intelligence/processed_supplier_data.csv")

print(f"Total transactions: {len(df)}")
print(f"\nUnique suppliers: {df['supplier'].nunique()}")
print(f"\nSupplier list:")
print(df['supplier'].unique())

print(f"\n\nSupplier Risk Summary:")
summary = df.groupby('supplier').agg({
    'delay_days': 'mean',
    'rejection_ratio': 'mean',
    'fulfillment_ratio': 'mean'
}).round(2)
print(summary)
