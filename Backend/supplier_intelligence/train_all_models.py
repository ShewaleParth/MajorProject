"""
Train all supplier risk models
This script trains all three ML models needed for the Risk Radar:
1. Delay Risk Model
2. Quality Risk Model  
3. Fulfillment Risk Model
"""

import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from train_delay_risk import train_delay_model
from train_quality_risk import train_quality_model
from train_fulfilment_risk import train_fulfillment_model

def train_all_models():
    print("=" * 60)
    print(" TRAINING ALL SUPPLIER RISK MODELS")
    print("=" * 60)
    
    print("\n Step 1/3: Training Delay Risk Model...")
    try:
        train_delay_model()
        print(" Delay Risk Model trained successfully!")
    except Exception as e:
        print(f" Error training Delay Risk Model: {e}")
        return False
    
    print("\n Step 2/3: Training Quality Risk Model...")
    try:
        train_quality_model()
        print(" Quality Risk Model trained successfully!")
    except Exception as e:
        print(f" Error training Quality Risk Model: {e}")
        return False
    
    print("\n Step 3/3: Training Fulfillment Risk Model...")
    try:
        train_fulfillment_model()
        print(" Fulfillment Risk Model trained successfully!")
    except Exception as e:
        print(f" Error training Fulfillment Risk Model: {e}")
        return False
    
    print("\n" + "=" * 60)
    print(" ALL MODELS TRAINED SUCCESSFULLY!")
    print("=" * 60)
    print("\n Model files saved in: ./models/")
    print("   - delay_risk_model.pkl")
    print("   - quality_risk_model.pkl")
    print("   - fulfillment_risk_model.pkl")
    print("\n You can now restart your Python backend to use the models!")
    
    return True

if __name__ == "__main__":
    success = train_all_models()
    sys.exit(0 if success else 1)
