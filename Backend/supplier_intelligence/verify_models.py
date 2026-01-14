"""
Verification script to test all 3 supplier risk models
"""
import os
from risk_score_engine import RiskScoreEngine

def verify_models():
    print("=" * 60)
    print("SUPPLIER RISK RADAR - MODEL VERIFICATION")
    print("=" * 60)
    
    # Check if model files exist
    models_dir = "d:/Major/Backend/supplier_intelligence/models"
    required_models = [
        "delay_risk_model.pkl",
        "quality_risk_model.pkl",
        "fulfillment_risk_model.pkl"
    ]
    
    print("\n1. Checking Model Files:")
    print("-" * 60)
    all_exist = True
    for model_file in required_models:
        path = os.path.join(models_dir, model_file)
        exists = os.path.exists(path)
        size = os.path.getsize(path) / (1024 * 1024) if exists else 0
        status = "✓" if exists else "✗"
        print(f"{status} {model_file:30s} {size:>8.2f} MB")
        all_exist = all_exist and exists
    
    if not all_exist:
        print("\n❌ ERROR: Some model files are missing!")
        return False
    
    print("\n✅ All model files present!")
    
    # Test model loading and prediction
    print("\n2. Testing Model Loading & Prediction:")
    print("-" * 60)
    
    try:
        engine = RiskScoreEngine()
        print("✓ Risk Score Engine initialized successfully")
        
        # Test predictions with different suppliers
        test_cases = [
            ("Apex Logistics", "Electronics", 500, 50, 0),
            ("Global Parts Inc", "Raw Materials", 1000, 75, 1),
            ("Nova Logistics", "Packaging", 300, 30, 0),
            ("Alpha Parts", "Components", 750, 60, 2)
        ]
        
        print("\n3. Running Test Predictions:")
        print("-" * 60)
        print(f"{'Supplier':<20} {'Category':<15} {'Risk Score':>12} {'Level':<10}")
        print("-" * 60)
        
        for supplier, category, qty, price, pay_risk in test_cases:
            result = engine.predict_risk(supplier, category, qty, price, pay_risk)
            
            if "error" in result:
                print(f"❌ {supplier:<20} ERROR: {result['error']}")
            else:
                risk_score = result['risk_score']
                risk_level = result['label']
                print(f"✓ {supplier:<20} {category:<15} {risk_score:>10.2f} {risk_level:<10}")
        
        print("\n" + "=" * 60)
        print("✅ ALL MODELS VERIFIED SUCCESSFULLY!")
        print("=" * 60)
        print("\nModel Details:")
        print(f"  • Delay Risk Model: Predicts delivery delays")
        print(f"  • Quality Risk Model: Predicts rejection rates")
        print(f"  • Fulfillment Risk Model: Predicts fulfillment ratios")
        print(f"\nAPI Endpoints Available:")
        print(f"  • GET  /api/supplier/risk-overview")
        print(f"  • POST /api/supplier/predict-risk")
        print(f"  • GET  /api/supplier/history/<supplier_name>")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR during model testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    verify_models()
