import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def train_fulfillment_model():
    data_path = "d:/Major/Backend/supplier_intelligence/processed_supplier_data.csv"
    if not os.path.exists(data_path):
        print("Processed data not found. Run loader first.")
        return

    df = pd.read_csv(data_path)
    
    le_supplier = LabelEncoder()
    le_category = LabelEncoder()
    
    df['supplier_id'] = le_supplier.fit_transform(df['supplier'])
    df['category_id'] = le_category.fit_transform(df['category'])
    
    features = ['supplier_id', 'category_id', 'ordered_qty', 'base_price', 'payment_risk']
    target = 'fulfillment_ratio'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    model_dir = "d:/Major/Backend/supplier_intelligence/models"
    os.makedirs(model_dir, exist_ok=True)
    
    with open(os.path.join(model_dir, "fulfillment_risk_model.pkl"), "wb") as f:
        pickle.dump({
            "model": model,
            "le_supplier": le_supplier,
            "le_category": le_category,
            "features": features
        }, f)
    
    print("Fulfillment Risk Model trained and saved.")

if __name__ == "__main__":
    train_fulfillment_model()
