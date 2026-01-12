import pandas as pd
df = pd.read_csv("d:/Major/Backend/supplier_intelligence/processed_supplier_data.csv")
summary = df.groupby('supplier').agg({
    'delay_days': 'mean',
    'rejection_ratio': 'mean',
    'fulfillment_ratio': 'mean'
}).round(2)
print(summary.loc[["Alpha Parts", "Nova Logistics", "Apex Logistics", "Mega Corp"]])
