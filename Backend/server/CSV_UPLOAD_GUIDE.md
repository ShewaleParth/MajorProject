# CSV Upload Format Guide

## Supported CSV Formats

The bulk upload endpoint supports flexible field naming. Use any of these column headers:

### Required Fields
- **SKU**: `sku`, `SKU`
- **Name**: `name`, `Name`, `productname`

### Optional Fields
- **Category**: `category`, `Category`
- **Stock**: `stock`, `Stock`, `quantity`
- **Price**: `price`, `Price`
- **Supplier**: `supplier`, `Supplier`
- **Reorder Point**: `reorderpoint`, `reorderPoint`, `ReorderPoint`
- **Daily Sales**: `dailysales`, `dailySales`, `DailySales`
- **Weekly Sales**: `weeklysales`, `weeklySales`, `WeeklySales`
- **Brand**: `brand`, `Brand`
- **Lead Time**: `leadtime`, `leadTime`, `LeadTime`
- **Image**: `image`

## Example CSV Format

### Minimal CSV:
```csv
sku,name,category,stock,price
PROD-001,Product Name,Electronics,100,1000
PROD-002,Another Product,Apparel,50,500
```

### Full CSV with all fields:
```csv
sku,name,category,stock,price,supplier,reorderpoint,dailysales,weeklysales,brand,leadtime
PROD-001,Laptop,Electronics,100,50000,Tech Supplier,20,5,35,Dell,7
PROD-002,T-Shirt,Apparel,200,500,Fashion Co,40,10,70,Nike,14
PROD-003,Coffee Maker,Home Goods,50,3000,Home Depot,10,3,21,Philips,10
```

## Default Values

If fields are not provided, these defaults are used:
- **Category**: "Uncategorized"
- **Stock**: 0
- **Reorder Point**: 10
- **Supplier**: "Unknown"
- **Price**: 0
- **Daily Sales**: 5
- **Weekly Sales**: 35
- **Brand**: "Generic"
- **Lead Time**: 7 days

## Response Format

```json
{
  "message": "Processed 10 items",
  "results": {
    "success": 8,
    "failed": 2,
    "errors": [
      {
        "sku": "PROD-005",
        "error": "Missing required fields: name",
        "item": { "sku": "PROD-005" }
      }
    ]
  }
}
```

## Common Errors

1. **Missing SKU or Name**: Both are required
2. **Invalid number format**: Stock, price, etc. must be numbers
3. **Duplicate SKU**: Will update existing product instead of creating new one

## Tips

- Headers are case-insensitive
- Empty rows are ignored
- Existing products (same SKU) will be updated
- New products will be created with provided data
