@app.route('/api/ml/forecast/&lt;sku&gt;', methods=['GET'])
def get_forecast_by_sku(sku):
    """Get existing forecast for a specific SKU"""
    try:
        # Get userId from Authorization header (JWT token)
        auth_header = request.headers.get('Authorization', '')
        user_id_header = request.headers.get('X-User-Id', '')
        
        # Try to extract userId from header or use None for backward compatibility
        user_id = None
        if user_id_header:
            try:
                user_id = ObjectId(user_id_header)
            except Exception:
                print(f"Warning: Invalid X-User-Id header: {user_id_header}")
        
        # Build query
        query = {'sku': sku}
        if user_id:
            query['userId'] = user_id
        
        # Find forecast in MongoDB
        forecast = forecasts_collection.find_one(query, sort=[('updatedAt', -1)])
        
        if not forecast:
            return jsonify({
                "success": False,
                "error": f"No forecast found for SKU: {sku}. Please run prediction first from Inventory Overview."
            }), 404
        
        # Serialize MongoDB document
        forecast_data = {
            'sku': forecast.get('sku'),
            'productName': forecast.get('productName'),
            'currentStock': forecast.get('currentStock'),
            'stockStatusPred': forecast.get('stockStatusPred'),
            'priorityPred': forecast.get('priorityPred'),
            'alert': forecast.get('alert'),
            'aiInsights': forecast.get('aiInsights', {}),
            'forecastData': forecast.get('forecastData', []),
            'inputParams': forecast.get('inputParams', {}),
            'historicalData': forecast.get('modelDetails', {}).get('historical_sales', []) if forecast.get('modelDetails') else [],
            'createdAt': forecast.get('createdAt'),
            'updatedAt': forecast.get('updatedAt')
        }
        
        return jsonify({
            "success": True,
            "forecast": forecast_data
        })
        
    except Exception as e:
        print(f"Error fetching forecast for SKU {sku}: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
