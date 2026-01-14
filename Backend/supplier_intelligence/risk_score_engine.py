import pickle
import os
import numpy as np
import pandas as pd

class RiskScoreEngine:
    def __init__(self, models_dir="d:/Major/Backend/supplier_intelligence/models"):
        self.models_dir = models_dir
        self.delay_data = self._load_model("delay_risk_model.pkl")
        self.quality_data = self._load_model("quality_risk_model.pkl")
        self.fulfillment_data = self._load_model("fulfillment_risk_model.pkl")

    def _load_model(self, filename):
        path = os.path.join(self.models_dir, filename)
        if os.path.exists(path):
            with open(path, "rb") as f:
                return pickle.load(f)
        return None

    def predict_risk(self, supplier_name, category, ordered_qty, base_price, payment_risk=0):
        if not self.delay_data or not self.quality_data or not self.fulfillment_data:
            return {"error": "Models not loaded"}

        # Prepare inputs using encoders from ANY model (assuming they are consistent or we use specific ones)
        # To be safe, each model has its own encoder.
        
        try:
            # 1. Delay Risk
            delay_feat = self._prepare_features(self.delay_data, supplier_name, category, ordered_qty, base_price, payment_risk)
            delay_pred = self.delay_data['model'].predict(delay_feat)[0]
            # Normalize delay: 0 days = 0, 15+ days = 100
            delay_score = min(max(delay_pred * 6.6, 0), 100) 

            # 2. Quality Risk
            quality_feat = self._prepare_features(self.quality_data, supplier_name, category, ordered_qty, base_price, payment_risk)
            quality_pred = self.quality_data['model'].predict(quality_feat)[0]
            # Normalize rejection: 0% = 0, 10%+ = 100
            quality_score = min(max(quality_pred * 1000, 0), 100)

            # 3. Fulfillment Risk
            fulfillment_feat = self._prepare_features(self.fulfillment_data, supplier_name, category, ordered_qty, base_price, payment_risk)
            fulfillment_pred = self.fulfillment_data['model'].predict(fulfillment_feat)[0]
            # Normalize failure: 1.0 (100% full) = 0, 0.8 or less = 100
            failure_rate = 1.0 - fulfillment_pred
            fulfillment_score = min(max(failure_rate * 500, 0), 100)

            # Weighted final score
            final_score = (delay_score * 0.4) + (quality_score * 0.3) + (fulfillment_score * 0.3)
            
            label = "Low"
            if final_score > 70:
                label = "High"
            elif final_score > 40:
                label = "Medium"

            return {
                "risk_score": round(final_score, 2),
                "label": label,
                "breakdown": {
                    "delay": round(delay_score, 2),
                    "quality": round(quality_score, 2),
                    "fulfillment": round(fulfillment_score, 2)
                }
            }
        except Exception as e:
            return {"error": str(e)}

    def _prepare_features(self, model_data, supplier, category, qty, price, pay_risk):
        # We need to handle unseen labels gracefully if using LabelEncoder in production
        # For simplicity in this project, we'll try to transform or use a default if it fails
        try:
            s_id = model_data['le_supplier'].transform([supplier])[0]
        except:
            s_id = 0 # Default/Unknown
            
        try:
            c_id = model_data['le_category'].transform([category])[0]
        except:
            c_id = 0

        # Return DataFrame with proper feature names to avoid sklearn warnings
        feature_names = ['supplier_id', 'category_id', 'ordered_qty', 'base_price', 'payment_risk']
        return pd.DataFrame([[s_id, c_id, qty, price, pay_risk]], columns=feature_names)

if __name__ == "__main__":
    engine = RiskScoreEngine()
    result = engine.predict_risk("Apex Logistics", "Electronics", 500, 50)
    print(result)
