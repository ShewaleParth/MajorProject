
import sys
import os

modules = [
    'flask', 'flask_cors', 'pandas', 'numpy', 'joblib', 'xgboost', 
    'pymongo', 'sklearn', 'statsmodels', 'dotenv', 'bson'
]

for m in modules:
    try:
        __import__(m)
        print(f"OK: {m}")
    except ImportError as e:
        print(f"MISSING: {m} ({e})")

# Check internal imports
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath('app.py')))))
try:
    from supplier_intelligence.supplier_routes import supplier_routes, init_db
    print("OK: supplier_intelligence.supplier_routes")
except ImportError as e:
    print(f"MISSING: supplier_intelligence.supplier_routes ({e})")
