from supplier_intelligence.risk_score_engine import RiskScoreEngine
import os
import sys

os.chdir("d:/Major/Backend")
sys.path.append("d:/Major/Backend")

engine = RiskScoreEngine(models_dir="d:/Major/Backend/supplier_intelligence/models")
test_suppliers = ["Alpha Parts", "Nova Logistics", "Omega Industries", "Apex Logistics", "Prime Suppliers"]

with open("risk_results.txt", "w", encoding="utf-8") as f:
    f.write("-" * 50 + "\n")
    for s in test_suppliers:
        result = engine.predict_risk(s, "Machinery", 500, 50)
        line = f"Supplier: {s:<20} | Score: {result.get('risk_score'):>6} | Level: {result.get('label')}\n"
        f.write(line)
        print(line.strip())
    f.write("-" * 50 + "\n")
