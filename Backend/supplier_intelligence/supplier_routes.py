from flask import Blueprint, request, jsonify
import pandas as pd
import os
from .risk_score_engine import RiskScoreEngine

supplier_routes = Blueprint('supplier_routes', __name__)
engine = RiskScoreEngine(models_dir=os.path.join(os.path.dirname(__file__), "models"))

DATA_PATH = os.path.join(os.path.dirname(__file__), "processed_supplier_data.csv")

@supplier_routes.route('/risk-overview', methods=['GET'])
def risk_overview():
    try:
        if not os.path.exists(DATA_PATH):
            return jsonify({"success": False, "error": "No supplier data available"}), 404
        
        df = pd.read_csv(DATA_PATH)
        
        # Aggregate latest metrics per supplier
        suppliers = df.groupby('supplier').agg({
            'delay_days': 'mean',
            'fulfillment_ratio': 'mean',
            'rejection_ratio': 'mean',
            'category': 'first',
            'base_price': 'mean',
            'payment_risk': 'max'
        }).reset_index()
        
        results = []
        for _, row in suppliers.iterrows():
            # Get real-time prediction from engine
            risk = engine.predict_risk(
                row['supplier'], 
                row['category'], 
                500, # default test qty
                row['base_price'],
                row['payment_risk']
            )
            
            results.append({
                "supplier": row['supplier'],
                "category": row['category'],
                "avg_delay": round(row['delay_days'], 1),
                "avg_fulfillment": round(row['fulfillment_ratio'] * 100, 1),
                "avg_rejection": round(row['rejection_ratio'] * 100, 1),
                "risk_score": risk.get('risk_score', 0),
                "risk_level": risk.get('label', 'Unknown')
            })
            
        return jsonify({"success": True, "suppliers": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@supplier_routes.route('/predict-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        supplier = data.get('supplier')
        category = data.get('category', 'Electronics')
        qty = float(data.get('qty', 100))
        price = float(data.get('price', 50))
        pay_risk = int(data.get('payment_risk', 0))
        
        risk = engine.predict_risk(supplier, category, qty, price, pay_risk)
        return jsonify({"success": True, "result": risk})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@supplier_routes.route('/history/<supplier_name>', methods=['GET'])
def supplier_history(supplier_name):
    try:
        if not os.path.exists(DATA_PATH):
            return jsonify({"success": False, "error": "No data available"}), 404
            
        df = pd.read_csv(DATA_PATH)
        history = df[df['supplier'] == supplier_name].sort_values('order_date').tail(10)
        
        if history.empty:
            return jsonify({"success": False, "error": "Supplier not found"}), 404
            
        trend = history.apply(lambda r: {
            "date": r['order_date'],
            "delay": r['delay_days'],
            "rejection": round(r['rejection_ratio'] * 100, 2),
            "fulfillment": round(r['fulfillment_ratio'] * 100, 2)
        }, axis=1).tolist()
        
        return jsonify({"success": True, "supplier": supplier_name, "trend": trend})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
