import requests
import json

def test_supplier_api():
    base_url = "http://localhost:5001/api/supplier"
    
    print("Testing /risk-overview...")
    try:
        r = requests.get(f"{base_url}/risk-overview")
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"Suppliers count: {len(data.get('suppliers', []))}")
            if data['suppliers']:
                print(f"First supplier: {data['suppliers'][0]['supplier']} - Risk: {data['suppliers'][0]['risk_score']}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")

if __name__ == "__main__":
    test_supplier_api()
