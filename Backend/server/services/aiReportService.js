const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AIReportService {
  /**
   * Analyze depot data and generate AI insights
   */
  async analyzeDepotData(depotData, transactions, products) {
    const utilizationPercent = ((depotData.currentUtilization / depotData.capacity) * 100).toFixed(1);
    const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.price || 100)), 0);
    
    const stockInCount = transactions.filter(t => t.type === 'stock-in').length;
    const stockOutCount = transactions.filter(t => t.type === 'stock-out').length;
    const transferCount = transactions.filter(t => t.type === 'transfer').length;
    
    const lowStockItems = products.filter(p => p.stock < 50);
    const overstockItems = products.filter(p => p.stock > 500);
    const outOfStockItems = products.filter(p => p.stock === 0);

    const prompt = `
You are an expert warehouse and inventory management analyst. Analyze the following depot data and provide comprehensive business intelligence insights.

DEPOT INFORMATION:
- Name: ${depotData.name}
- Location: ${depotData.location}
- Total Capacity: ${depotData.capacity.toLocaleString()} units
- Current Utilization: ${depotData.currentUtilization.toLocaleString()} units (${utilizationPercent}%)
- Available Space: ${(depotData.capacity - depotData.currentUtilization).toLocaleString()} units
- Total SKUs Stored: ${products.length}
- Total Inventory Value: ₹${totalValue.toLocaleString()}

OPERATIONAL METRICS (Last 30 Days):
- Total Transactions: ${transactions.length}
- Stock-In Operations: ${stockInCount}
- Stock-Out Operations: ${stockOutCount}
- Transfer Operations: ${transferCount}
- Net Flow: ${stockInCount - stockOutCount > 0 ? '+' : ''}${stockInCount - stockOutCount} units

STOCK HEALTH ANALYSIS:
- Low Stock Items: ${lowStockItems.length} (${((lowStockItems.length / products.length) * 100).toFixed(1)}%)
- Overstock Items: ${overstockItems.length} (${((overstockItems.length / products.length) * 100).toFixed(1)}%)
- Out of Stock: ${outOfStockItems.length}
- Optimal Stock: ${products.length - lowStockItems.length - overstockItems.length - outOfStockItems.length}

TOP 5 PRODUCTS BY QUANTITY:
${products.sort((a, b) => b.quantity - a.quantity).slice(0, 5).map((p, i) => 
  `${i + 1}. ${(p.name || p.productName)} - ${p.stock} units (₹${(p.stock * (p.price || 100)).toLocaleString()})`
).join('\n')}

CRITICAL ISSUES:
${utilizationPercent > 90 ? '- CRITICAL: Depot is near maximum capacity!' : ''}
${lowStockItems.length > products.length * 0.3 ? '- WARNING: High number of low-stock items' : ''}
${outOfStockItems.length > 0 ? `- ALERT: ${outOfStockItems.length} items are out of stock` : ''}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "executiveSummary": "2-3 sentence overview of depot performance and health",
  "keyInsights": [
    "Insight 1 about utilization and capacity",
    "Insight 2 about stock movement patterns",
    "Insight 3 about inventory health",
    "Insight 4 about operational efficiency"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3",
    "Actionable recommendation 4"
  ],
  "alerts": [
    "Critical alert 1 (if any)",
    "Critical alert 2 (if any)"
  ],
  "metrics": {
    "efficiencyScore": "0-100 score",
    "healthStatus": "Excellent/Good/Fair/Poor",
    "riskLevel": "Low/Medium/High"
  }
}

Be specific, data-driven, and actionable in your analysis.
`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a senior business intelligence analyst specializing in warehouse operations, inventory optimization, and supply chain management. Provide clear, actionable, data-driven insights based on the metrics provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // Ensure all required fields exist
      return {
        executiveSummary: analysis.executiveSummary || 'Analysis completed successfully.',
        keyInsights: analysis.keyInsights || [],
        recommendations: analysis.recommendations || [],
        alerts: analysis.alerts || [],
        metrics: analysis.metrics || {
          efficiencyScore: '75',
          healthStatus: 'Good',
          riskLevel: 'Low'
        }
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze inventory data across all depots
   */
  async analyzeInventoryData(products, transactions, depots) {
    const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.price || 100)), 0);
    const categoryBreakdown = this.groupByCategory(products);
    const totalCapacity = depots.reduce((sum, d) => sum + d.capacity, 0);
    const totalUtilization = depots.reduce((sum, d) => sum + d.currentUtilization, 0);

    const prompt = `
Analyze this comprehensive inventory management system data:

SYSTEM OVERVIEW:
- Total Products: ${products.length}
- Total Inventory Value: ₹${totalValue.toLocaleString()}
- Total Depots: ${depots.length}
- Total Storage Capacity: ${totalCapacity.toLocaleString()} units
- Current Utilization: ${totalUtilization.toLocaleString()} units (${((totalUtilization / totalCapacity) * 100).toFixed(1)}%)
- Recent Transactions (30 days): ${transactions.length}

CATEGORY BREAKDOWN:
${Object.entries(categoryBreakdown).map(([cat, items]) => {
  const catValue = items.reduce((s, i) => s + (i.stock * (i.price || 100)), 0);
  return `- ${cat}: ${items.length} items, ₹${catValue.toLocaleString()}`;
}).join('\n')}

STOCK HEALTH DISTRIBUTION:
- Low Stock: ${products.filter(p => p.stock < p.reorderPoint).length} items
- Optimal Stock: ${products.filter(p => p.stock >= p.reorderPoint && p.stock <= p.reorderPoint * 3).length} items
- Overstock: ${products.filter(p => p.stock > p.reorderPoint * 3).length} items
- Out of Stock: ${products.filter(p => p.stock === 0).length} items

DEPOT UTILIZATION:
${depots.map(d => `- ${d.name}: ${((d.currentUtilization / d.capacity) * 100).toFixed(1)}% utilized`).join('\n')}

Provide JSON analysis with: executiveSummary, keyInsights, recommendations, alerts, metrics
`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are an inventory optimization expert with deep knowledge of supply chain management, demand forecasting, and warehouse efficiency.' 
          },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }

  /**
   * Group products by category
   */
  groupByCategory(products) {
    return products.reduce((acc, product) => {
      const cat = product.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {});
  }

  /**
   * Generate trend analysis
   */
  async analyzeTrends(historicalData) {
    // TODO: Implement trend analysis
    return {
      executiveSummary: 'Trend analysis in progress',
      keyInsights: [],
      recommendations: [],
      alerts: []
    };
  }

  /**
   * INVENTORY REPORTS
   */
  
  // 1. Inventory Summary
  async analyzeInventorySummary(products, depots, transactions) {
    const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.price || 100)), 0);
    const lowStock = products.filter(p => p.stock < (p.reorderPoint || 50));
    const outOfStock = products.filter(p => p.stock === 0);
    
    const prompt = `Analyze this inventory summary:
- Total Products: ${products.length}
- Total Value: ₹${totalValue.toLocaleString()}
- Total Depots: ${depots.length}
- Low Stock Items: ${lowStock.length}
- Out of Stock: ${outOfStock.length}
- Recent Transactions: ${transactions.length}

Provide JSON with: executiveSummary, keyInsights (4), recommendations (4), alerts, metrics`;

    return await this.callGroqAPI(prompt, 'inventory optimization expert');
  }

  // 2. Stock Levels Report
  async analyzeStockLevels(products, depots) {
    const byDepot = {};
    products.forEach(p => {
      const depotId = p.depotId || 'unassigned';
      if (!byDepot[depotId]) byDepot[depotId] = [];
      byDepot[depotId].push(p);
    });

    const prompt = `Analyze stock levels across ${depots.length} depots:
${Object.entries(byDepot).map(([id, items]) => {
  const depot = depots.find(d => d._id.toString() === id);
  return `- ${depot?.name || 'Unassigned'}: ${items.length} SKUs, ${items.reduce((s, i) => s + i.stock, 0)} units`;
}).join('\n')}

Provide JSON with stock adequacy analysis, reorder suggestions, distribution insights`;

    return await this.callGroqAPI(prompt, 'warehouse stock management specialist');
  }

  // 3. Low Stock Alert
  async analyzeLowStock(products) {
    const critical = products.filter(p => p.stock === 0);
    const low = products.filter(p => p.stock > 0 && p.stock < (p.reorderPoint || 50));
    
    const prompt = `Urgent low stock analysis:
- Critical (Out of Stock): ${critical.length} items
- Low Stock: ${low.length} items
- Total at Risk: ${critical.length + low.length}

Top 5 Critical:
${critical.slice(0, 5).map((p, i) => `${i+1}. ${(p.name || p.productName)} - OUT OF STOCK`).join('\n')}

Provide JSON with urgency assessment, reorder priorities, impact analysis`;

    return await this.callGroqAPI(prompt, 'supply chain risk analyst');
  }

  // 4. Stock Movement
  async analyzeStockMovement(transactions, products) {
    const stockIn = transactions.filter(t => t.type === 'stock-in');
    const stockOut = transactions.filter(t => t.type === 'stock-out');
    const transfers = transactions.filter(t => t.type === 'transfer');

    const prompt = `Analyze stock movement patterns:
- Total Transactions: ${transactions.length}
- Stock In: ${stockIn.length} (${stockIn.reduce((s, t) => s + (t.quantity || 0), 0)} units)
- Stock Out: ${stockOut.length} (${stockOut.reduce((s, t) => s + (t.quantity || 0), 0)} units)
- Transfers: ${transfers.length}
- Net Flow: ${stockIn.length - stockOut.length}

Provide JSON with movement patterns, trends, efficiency insights`;

    return await this.callGroqAPI(prompt, 'logistics and movement analyst');
  }

  /**
   * DEPOT REPORTS
   */

  // 5. Capacity Analysis
  async analyzeCapacity(depots, products) {
    const analysis = depots.map(d => ({
      name: d.name,
      utilization: ((d.currentUtilization / d.capacity) * 100).toFixed(1),
      available: d.capacity - d.currentUtilization,
      products: products.filter(p => p.depotId?.toString() === d._id.toString()).length
    }));

    const prompt = `Analyze depot capacity utilization:
${analysis.map(a => `- ${a.name}: ${a.utilization}% used, ${a.available} units available, ${a.products} SKUs`).join('\n')}

Provide JSON with utilization efficiency, expansion needs, optimization suggestions`;

    return await this.callGroqAPI(prompt, 'warehouse capacity planning expert');
  }

  // 6. Depot Comparison
  async compareDepots(depots, products, transactions) {
    const comparison = depots.map(d => {
      const depotProducts = products.filter(p => p.depotId?.toString() === d._id.toString());
      const depotTrans = transactions.filter(t => 
        t.fromDepot?.toString() === d._id.toString() || t.toDepot?.toString() === d._id.toString()
      );
      return {
        name: d.name,
        products: depotProducts.length,
        value: depotProducts.reduce((s, p) => s + (p.stock * (p.price || 100)), 0),
        utilization: ((d.currentUtilization / d.capacity) * 100).toFixed(1),
        activity: depotTrans.length
      };
    });

    const prompt = `Compare depot performance:
${comparison.map(c => `${c.name}: ${c.products} SKUs, ₹${c.value.toLocaleString()}, ${c.utilization}% utilized, ${c.activity} transactions`).join('\n')}

Provide JSON with comparative analysis, rankings, best practices, improvement areas`;

    return await this.callGroqAPI(prompt, 'multi-site operations analyst');
  }

  /**
   * FINANCIAL REPORTS
   */

  // 7. Inventory Valuation
  async analyzeValuation(products, depots) {
    const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.price || 100)), 0);
    const byCategory = this.groupByCategory(products);
    const categoryValues = Object.entries(byCategory).map(([cat, items]) => ({
      category: cat,
      value: items.reduce((s, i) => s + (i.stock * (i.price || 100)), 0),
      items: items.length
    })).sort((a, b) => b.value - a.value);

    const prompt = `Analyze inventory valuation:
- Total Value: ₹${totalValue.toLocaleString()}
- Total Products: ${products.length}

Top Categories by Value:
${categoryValues.slice(0, 5).map((c, i) => `${i+1}. ${c.category}: ₹${c.value.toLocaleString()} (${c.items} items)`).join('\n')}

Provide JSON with value distribution, risk assessment, optimization opportunities`;

    return await this.callGroqAPI(prompt, 'financial inventory analyst');
  }

  // 8. Cost Analysis
  async analyzeCosts(products, transactions, depots) {
    const holdingCost = products.reduce((s, p) => s + (p.stock * (p.price || 100) * 0.02), 0); // 2% monthly
    const transactionCost = transactions.length * 50; // ₹50 per transaction
    const totalCost = holdingCost + transactionCost;

    const prompt = `Analyze operational costs:
- Holding Costs: ₹${holdingCost.toLocaleString()}
- Transaction Costs: ₹${transactionCost.toLocaleString()}
- Total Costs: ₹${totalCost.toLocaleString()}
- Depots: ${depots.length}
- Transactions: ${transactions.length}

Provide JSON with cost breakdown, reduction opportunities, efficiency improvements`;

    return await this.callGroqAPI(prompt, 'cost optimization specialist');
  }

  // 9. Profit & Loss
  async analyzeProfitLoss(products, transactions) {
    const revenue = transactions.filter(t => t.type === 'stock-out').reduce((s, t) => s + ((t.quantity || 0) * 150), 0);
    const costs = products.reduce((s, p) => s + (p.stock * (p.price || 100) * 0.02), 0);
    const profit = revenue - costs;

    const prompt = `Analyze profit & loss:
- Revenue: ₹${revenue.toLocaleString()}
- Costs: ₹${costs.toLocaleString()}
- Profit: ₹${profit.toLocaleString()}
- Margin: ${((profit / revenue) * 100).toFixed(1)}%

Provide JSON with profitability insights, margin analysis, improvement recommendations`;

    return await this.callGroqAPI(prompt, 'financial performance analyst');
  }

  /**
   * ANALYTICS REPORTS
   */

  // 10. Trend Analysis
  async analyzeTrendData(transactions, products) {
    const last7Days = transactions.filter(t => new Date(t.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const last30Days = transactions.filter(t => new Date(t.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const prompt = `Analyze trends:
- Last 7 Days: ${last7Days.length} transactions
- Last 30 Days: ${last30Days.length} transactions
- Daily Average: ${(last30Days.length / 30).toFixed(1)}
- Growth Rate: ${(((last7Days.length / 7) / (last30Days.length / 30) - 1) * 100).toFixed(1)}%

Provide JSON with pattern recognition, seasonality, future projections`;

    return await this.callGroqAPI(prompt, 'data analytics and forecasting expert');
  }

  // 11. Forecast Accuracy
  async analyzeForecastAccuracy(products) {
    const avgStock = products.reduce((s, p) => s + p.stock, 0) / products.length;
    const variance = products.reduce((s, p) => s + Math.pow(p.stock - avgStock, 2), 0) / products.length;

    const prompt = `Analyze forecast accuracy:
- Average Stock: ${avgStock.toFixed(0)} units
- Variance: ${variance.toFixed(0)}
- Products: ${products.length}

Provide JSON with accuracy metrics, error analysis, improvement areas`;

    return await this.callGroqAPI(prompt, 'demand forecasting specialist');
  }

  // 12. Turnover Rate
  async analyzeTurnover(products, transactions) {
    const totalSales = transactions.filter(t => t.type === 'stock-out').reduce((s, t) => s + (t.quantity || 0), 0);
    const avgInventory = products.reduce((s, p) => s + p.stock, 0) / products.length;
    const turnoverRate = totalSales / (avgInventory * products.length);

    const prompt = `Analyze inventory turnover:
- Turnover Rate: ${turnoverRate.toFixed(2)}x
- Total Sales: ${totalSales} units
- Average Inventory: ${avgInventory.toFixed(0)} units
- Products: ${products.length}

Provide JSON with turnover efficiency, fast/slow movers, optimization suggestions`;

    return await this.callGroqAPI(prompt, 'inventory turnover analyst');
  }

  /**
   * Helper: Call Groq API with standardized format
   */
  async callGroqAPI(prompt, expertRole) {
    try {
      const enhancedPrompt = `${prompt}

IMPORTANT: Return ONLY a JSON object with these exact fields:
- executiveSummary: A single string (2-3 sentences)
- keyInsights: Array of strings (NOT objects)
- recommendations: Array of strings (NOT objects)
- alerts: Array of strings (NOT objects)
- metrics: Object with string values

Example format:
{
  "executiveSummary": "This is a summary sentence.",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3", "Insight 4"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"],
  "alerts": ["Alert 1 if any"],
  "metrics": {"score": "85", "status": "Good", "risk": "Low"}
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are a ${expertRole}. Provide clear, actionable, data-driven insights. ALWAYS return arrays of strings, never objects.` },
          { role: 'user', content: enhancedPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // Ensure proper format with fallbacks
      return {
        executiveSummary: typeof analysis.executiveSummary === 'string' 
          ? analysis.executiveSummary 
          : 'Analysis completed successfully.',
        keyInsights: Array.isArray(analysis.keyInsights) ? analysis.keyInsights : [],
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        alerts: Array.isArray(analysis.alerts) ? analysis.alerts : [],
        metrics: analysis.metrics || {}
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      return {
        executiveSummary: 'AI analysis temporarily unavailable.',
        keyInsights: ['Data processed successfully'],
        recommendations: ['Review detailed metrics'],
        alerts: [],
        metrics: {}
      };
    }
  }
}

module.exports = new AIReportService();
