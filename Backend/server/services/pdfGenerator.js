const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.reportsDir = process.env.REPORTS_DIR || path.join(__dirname, '../reports');
    this.ensureReportsDirectory();
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
      console.log('📁 Reports directory created:', this.reportsDir);
    }
  }

  /**
   * Generate comprehensive depot analysis PDF with AI insights
   */
  async generateDepotReport(depotData, aiAnalysis, products, transactions) {
    const filename = `depot-${depotData.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          info: {
            Title: `Depot Analysis: ${depotData.name}`,
            Author: 'AI-Powered Depot Manager',
            Subject: 'Depot Performance Report'
          }
        });
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // === PAGE 1: COVER & EXECUTIVE SUMMARY ===
        this.addCoverPage(doc, depotData);
        
        doc.addPage();
        this.addAIExecutiveSummary(doc, aiAnalysis);

        // === PAGE 2: DEPOT OVERVIEW ===
        doc.addPage();
        this.addDepotOverview(doc, depotData, products, transactions);

        // === PAGE 3: AI INSIGHTS & RECOMMENDATIONS ===
        doc.addPage();
        this.addAIInsights(doc, aiAnalysis);

        // === PAGE 4: STOCK ANALYSIS ===
        doc.addPage();
        this.addStockAnalysisTable(doc, products);

        // === PAGE 5: TRANSACTION TIMELINE ===
        if (transactions.length > 0) {
          doc.addPage();
          this.addTransactionTimeline(doc, transactions);
        }

        // Add page numbers to all pages
        this.addPageNumbers(doc);

        doc.end();

        stream.on('finish', () => {
          const stats = fs.statSync(filepath);
          resolve({ 
            filepath, 
            filename,
            fileSize: stats.size
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add cover page
   */
  addCoverPage(doc, depotData) {
    // Gradient background effect
    doc.rect(0, 0, doc.page.width, 300).fill('#667eea');
    
    // Title
    doc.fontSize(36)
       .fillColor('#ffffff')
       .text('DEPOT ANALYSIS REPORT', 50, 100, { align: 'center' });
    
    doc.fontSize(24)
       .fillColor('#e0e7ff')
       .text(depotData.name, 50, 160, { align: 'center' });
    
    // Location
    doc.fontSize(14)
       .fillColor('#c7d2fe')
       .text(`📍 ${depotData.location}`, 50, 200, { align: 'center' });
    
    // Generated date
    doc.fontSize(12)
       .fillColor('#a5b4fc')
       .text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 50, 240, { align: 'center' });
    
    // AI Badge
    doc.fontSize(10)
       .fillColor('#fef3c7')
       .text('🤖 AI-POWERED ANALYSIS', 50, 270, { align: 'center' });
  }

  /**
   * Add AI Executive Summary
   */
  addAIExecutiveSummary(doc, aiAnalysis) {
    doc.fontSize(22)
       .fillColor('#667eea')
       .text('🤖 AI Executive Summary', { underline: true });
    
    doc.moveDown(1);
    
    // Summary box
    const summaryY = doc.y;
    doc.roundedRect(50, summaryY, doc.page.width - 100, 120, 10)
       .fillAndStroke('#f0f4ff', '#667eea');
    
    doc.fontSize(12)
       .fillColor('#1e293b')
       .text(aiAnalysis.executiveSummary, 65, summaryY + 20, {
         width: doc.page.width - 130,
         align: 'justify',
         lineGap: 6
       });
    
    doc.moveDown(8);
    
    // Health metrics
    if (aiAnalysis.metrics) {
      doc.fontSize(16)
         .fillColor('#667eea')
         .text('📊 Performance Metrics');
      
      doc.moveDown(0.5);
      
      const metricsY = doc.y;
      const metrics = [
        { label: 'Efficiency Score', value: aiAnalysis.metrics.efficiencyScore + '/100', color: '#10b981' },
        { label: 'Health Status', value: aiAnalysis.metrics.healthStatus, color: '#3b82f6' },
        { label: 'Risk Level', value: aiAnalysis.metrics.riskLevel, color: this.getRiskColor(aiAnalysis.metrics.riskLevel) }
      ];
      
      metrics.forEach((metric, idx) => {
        const x = 50 + (idx * 170);
        doc.roundedRect(x, metricsY, 150, 60, 8)
           .fillAndStroke('#ffffff', '#e2e8f0');
        
        doc.fontSize(10)
           .fillColor('#64748b')
           .text(metric.label, x + 10, metricsY + 10);
        
        doc.fontSize(18)
           .fillColor(metric.color)
           .text(metric.value, x + 10, metricsY + 30);
      });
    }
  }

  /**
   * Add depot overview
   */
  addDepotOverview(doc, depotData, products, transactions) {
    doc.fontSize(20)
       .fillColor('#667eea')
       .text('📦 Depot Overview', { underline: true });
    
    doc.moveDown(1);
    
    const utilizationPercent = ((depotData.currentUtilization / depotData.capacity) * 100).toFixed(1);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * (p.price || 100)), 0);
    
    const info = [
      { label: 'Total Capacity', value: `${depotData.capacity.toLocaleString()} units` },
      { label: 'Current Utilization', value: `${depotData.currentUtilization.toLocaleString()} units (${utilizationPercent}%)` },
      { label: 'Available Space', value: `${(depotData.capacity - depotData.currentUtilization).toLocaleString()} units` },
      { label: 'Total SKUs', value: products.length.toString() },
      { label: 'Total Inventory Value', value: `₹${totalValue.toLocaleString()}` },
      { label: 'Recent Transactions (30d)', value: transactions.length.toString() }
    ];
    
    info.forEach(item => {
      doc.fontSize(11)
         .fillColor('#64748b')
         .text(item.label + ':', { continued: true })
         .fillColor('#1e293b')
         .text(' ' + item.value);
      doc.moveDown(0.3);
    });
    
    // Utilization bar
    doc.moveDown(1);
    doc.fontSize(12)
       .fillColor('#64748b')
       .text('Capacity Utilization:');
    
    const barY = doc.y + 10;
    const barWidth = doc.page.width - 100;
    const fillWidth = (barWidth * utilizationPercent) / 100;
    
    // Background bar
    doc.roundedRect(50, barY, barWidth, 20, 5)
       .fill('#e2e8f0');
    
    // Fill bar
    const barColor = utilizationPercent > 90 ? '#ef4444' : utilizationPercent > 75 ? '#f59e0b' : '#10b981';
    doc.roundedRect(50, barY, fillWidth, 20, 5)
       .fill(barColor);
    
    // Percentage text
    doc.fontSize(10)
       .fillColor('#ffffff')
       .text(`${utilizationPercent}%`, 50 + fillWidth / 2 - 15, barY + 5);
  }

  /**
   * Add AI insights and recommendations
   */
  addAIInsights(doc, aiAnalysis) {
    // Key Insights
    doc.fontSize(20)
       .fillColor('#667eea')
       .text('💡 Key Insights', { underline: true });
    
    doc.moveDown(0.5);
    
    aiAnalysis.keyInsights.forEach((insight, idx) => {
      doc.fontSize(11)
         .fillColor('#1e293b')
         .text(`${idx + 1}. ${insight}`, { 
           indent: 20, 
           lineGap: 4,
           width: doc.page.width - 100
         });
      doc.moveDown(0.5);
    });
    
    // Recommendations
    doc.moveDown(1);
    doc.fontSize(20)
       .fillColor('#10b981')
       .text('✅ Recommendations', { underline: true });
    
    doc.moveDown(0.5);
    
    aiAnalysis.recommendations.forEach((rec, idx) => {
      doc.fontSize(11)
         .fillColor('#1e293b')
         .text(`${idx + 1}. ${rec}`, { 
           indent: 20, 
           lineGap: 4,
           width: doc.page.width - 100
         });
      doc.moveDown(0.5);
    });
    
    // Alerts (if any)
    if (aiAnalysis.alerts && aiAnalysis.alerts.length > 0) {
      doc.moveDown(1);
      doc.fontSize(20)
         .fillColor('#ef4444')
         .text('⚠️ Critical Alerts', { underline: true });
      
      doc.moveDown(0.5);
      
      aiAnalysis.alerts.forEach((alert, idx) => {
        const alertY = doc.y;
        doc.roundedRect(50, alertY, doc.page.width - 100, 40, 8)
           .fillAndStroke('#fee2e2', '#ef4444');
        
        doc.fontSize(11)
           .fillColor('#991b1b')
           .text(`${idx + 1}. ${alert}`, 65, alertY + 12, {
             width: doc.page.width - 130
           });
        
        doc.moveDown(3);
      });
    }
  }

  /**
   * Add stock analysis table
   */
  addStockAnalysisTable(doc, products) {
    doc.fontSize(20)
       .fillColor('#667eea')
       .text('📊 Stock Analysis', { underline: true });
    
    doc.moveDown(1);
    
    const tableTop = doc.y;
    const headers = ['Product Name', 'SKU', 'Qty', 'Value', 'Status'];
    const colWidths = [180, 100, 60, 90, 70];
    
    // Table headers
    let x = 50;
    headers.forEach((header, i) => {
      doc.fontSize(10)
         .fillColor('#ffffff')
         .rect(x, tableTop, colWidths[i], 25)
         .fill('#667eea')
         .fillColor('#ffffff')
         .text(header, x + 5, tableTop + 7, { width: colWidths[i] - 10 });
      x += colWidths[i];
    });
    
    // Table rows
    let y = tableTop + 25;
    const displayProducts = products.slice(0, 15); // Top 15 products
    
    displayProducts.forEach((product) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      
      x = 50;
      const status = product.stock < 50 ? 'Low' : product.stock > 500 ? 'High' : 'OK';
      const statusColor = product.stock < 50 ? '#ef4444' : product.stock > 500 ? '#f59e0b' : '#10b981';
      
      const productName = product.productName || product.name || 'Unknown Product';
      const rowData = [
        { text: productName.substring(0, 25), color: '#1e293b' },
        { text: product.sku || 'N/A', color: '#64748b' },
        { text: product.stock.toString(), color: '#1e293b' },
        { text: `₹${(product.stock * (product.price || 100)).toLocaleString()}`, color: '#10b981' },
        { text: status, color: statusColor }
      ];
      
      rowData.forEach((data, i) => {
        doc.fontSize(9)
           .fillColor(data.color)
           .text(data.text, x + 5, y + 5, { width: colWidths[i] - 10 });
        x += colWidths[i];
      });
      
      y += 25;
    });
  }

  /**
   * Add transaction timeline
   */
  addTransactionTimeline(doc, transactions) {
    doc.fontSize(20)
       .fillColor('#667eea')
       .text('📈 Transaction Timeline', { underline: true });
    
    doc.moveDown(1);
    
    const recentTransactions = transactions.slice(0, 20);
    
    recentTransactions.forEach(txn => {
      const typeColor = txn.type === 'stock-in' ? '#10b981' : txn.type === 'stock-out' ? '#ef4444' : '#3b82f6';
      const productName = txn.productName || txn.product || 'Unknown';
      const quantity = txn.quantity || 0;
      
      doc.fontSize(10)
         .fillColor('#64748b')
         .text(new Date(txn.timestamp).toLocaleDateString('en-IN'), { continued: true })
         .fillColor(typeColor)
         .text(` • ${txn.type.toUpperCase()}`, { continued: true })
         .fillColor('#1e293b')
         .text(`: ${productName} (${quantity} units)`);
      
      doc.moveDown(0.3);
    });
  }

  /**
   * Add page numbers
   */
  addPageNumbers(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9)
         .fillColor('#94a3b8')
         .text(
           `Page ${i + 1} of ${pages.count} | Generated by AI-Powered Depot Manager | ${new Date().toLocaleDateString('en-IN')}`,
           50,
           doc.page.height - 40,
           { align: 'center', width: doc.page.width - 100 }
         );
    }
  }

  /**
   * Get risk level color
   */
  getRiskColor(riskLevel) {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444'
    };
    return colors[riskLevel] || '#64748b';
  }

  /**
   * UNIVERSAL REPORT GENERATOR - Professional Quality PDFs
   */
  async generateUniversalReport(reportType, data, aiAnalysis) {
    const reportTitles = {
      'inventory-summary': 'Inventory Summary Report',
      'stock-levels': 'Stock Levels Report',
      'low-stock': 'Low Stock Alert Report',
      'stock-movement': 'Stock Movement Report',
      'depot-analysis': 'Depot Analysis Report',
      'capacity-analysis': 'Capacity Analysis Report',
      'depot-comparison': 'Depot Comparison Report',
      'inventory-valuation': 'Inventory Valuation Report',
      'cost-analysis': 'Cost Analysis Report',
      'profit-loss': 'Profit & Loss Report',
      'trend-analysis': 'Trend Analysis Report',
      'forecast-accuracy': 'Forecast Accuracy Report',
      'turnover-rate': 'Turnover Rate Report'
    };

    const filename = `${reportType}-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          info: {
            Title: reportTitles[reportType],
            Author: 'Sangrahak Inventory Management',
            Subject: reportTitles[reportType]
          }
        });
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Page 1: Professional Cover
        this.addProfessionalCover(doc, reportTitles[reportType], reportType);
        
        // Page 2: Executive Summary
        doc.addPage();
        this.addProfessionalSummary(doc, aiAnalysis, data);

        // Page 3: Key Insights & Recommendations
        doc.addPage();
        this.addProfessionalInsights(doc, aiAnalysis);

        // Page 4: Data Tables
        if (data.products && data.products.length > 0) {
          doc.addPage();
          this.addProfessionalDataTable(doc, data.products.slice(0, 15), reportType);
        }

        doc.end();

        stream.on('finish', () => {
          const stats = fs.statSync(filepath);
          resolve({ filepath, filename, fileSize: stats.size });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Professional cover page - NO EMOJIS
   */
  addProfessionalCover(doc, title, reportType) {
    const colors = {
      'inventory': '#4F46E5',
      'stock': '#0891B2',
      'depot': '#0891B2',
      'capacity': '#0891B2',
      'valuation': '#059669',
      'cost': '#059669',
      'profit': '#059669',
      'trend': '#DC2626',
      'forecast': '#DC2626',
      'turnover': '#DC2626',
      'low': '#EA580C'
    };

    const colorKey = Object.keys(colors).find(key => reportType.includes(key)) || 'inventory';
    const color = colors[colorKey];

    // Header bar
    doc.rect(0, 0, doc.page.width, 200).fill(color);
    
    // Company name
    doc.fontSize(14)
       .fillColor('#FFFFFF')
       .text('SANGRAHAK', 50, 50);
    
    // Report title
    doc.fontSize(28)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text(title, 50, 90, { width: doc.page.width - 100 });
    
    // Date
    doc.fontSize(11)
       .fillColor('#E0E7FF')
       .font('Helvetica')
       .text(`Generated: ${new Date().toLocaleDateString('en-IN', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`, 50, 150);
    
    // AI Badge
    doc.fontSize(10)
       .fillColor('#FEF3C7')
       .text('AI-POWERED ANALYSIS', 50, 170);

    // Bottom section
    doc.fillColor('#1F2937')
       .fontSize(12)
       .text('Intelligent Inventory Management System', 50, 250);
    
    doc.fontSize(10)
       .fillColor('#6B7280')
       .text('This report contains AI-generated insights and recommendations', 50, 270);
  }

  /**
   * Professional executive summary
   */
  addProfessionalSummary(doc, aiAnalysis, data) {
    const { products = [], depots = [], transactions = [] } = data;
    
    // Calculate totals properly
    const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) < (p.reorderPoint || 50)).length;
    
    // Header
    doc.fontSize(18)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('Executive Summary', 50, 50);
    
    doc.moveDown(0.3);
    
    // Summary box - reduced height
    const summaryY = doc.y;
    doc.roundedRect(50, summaryY, doc.page.width - 100, 80, 5)
       .fillAndStroke('#F3F4F6', '#E5E7EB');
    
    doc.fontSize(10)
       .fillColor('#374151')
       .font('Helvetica')
       .text(aiAnalysis.executiveSummary || 'Analysis completed successfully.', 
             60, summaryY + 15, {
          width: doc.page.width - 120,
          align: 'left',
          lineGap: 3
        });
    
    doc.moveDown(5);
    
    // Key Metrics - reduced spacing
    doc.fontSize(14)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('Key Metrics');
    
    doc.moveDown(0.3);
    
    const metricsY = doc.y;
    const metrics = [
      { label: 'Total Products', value: products.length.toString(), color: '#4F46E5' },
      { label: 'Total Depots', value: depots.length.toString(), color: '#0891B2' },
      { label: 'Total Value', value: `Rs ${totalValue.toLocaleString('en-IN')}`, color: '#059669' },
      { label: 'Low Stock Items', value: lowStockCount.toString(), color: lowStockCount > 0 ? '#DC2626' : '#059669' }
    ];
    
    metrics.forEach((metric, idx) => {
      const x = 50 + (idx % 2) * 250;
      const y = metricsY + Math.floor(idx / 2) * 65;
      
      doc.roundedRect(x, y, 220, 55, 5)
         .fillAndStroke('#FFFFFF', '#E5E7EB');
      
      doc.fontSize(9)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text(metric.label, x + 12, y + 12);
      
      doc.fontSize(18)
         .fillColor(metric.color)
         .font('Helvetica-Bold')
         .text(metric.value, x + 12, y + 28);
    });
    
    // Performance Score - reduced spacing
    doc.moveDown(8);
    const scoreY = doc.y;
    
    doc.fontSize(14)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('Performance Score', 50, scoreY);
    
    const score = aiAnalysis.metrics?.efficiencyScore || '75';
    const scoreNum = parseInt(score) || 75;
    const scoreColor = scoreNum >= 80 ? '#059669' : scoreNum >= 60 ? '#F59E0B' : '#DC2626';
    
    doc.roundedRect(50, scoreY + 25, doc.page.width - 100, 50, 5)
       .fillAndStroke('#F3F4F6', '#E5E7EB');
    
    doc.fontSize(28)
       .fillColor(scoreColor)
       .font('Helvetica-Bold')
       .text(`${scoreNum}/100`, 60, scoreY + 35);
    
    doc.fontSize(11)
       .fillColor('#6B7280')
       .font('Helvetica')
       .text(aiAnalysis.metrics?.healthStatus || 'Good', 180, scoreY + 40);
  }

  /**
   * Professional insights section
   */
  addProfessionalInsights(doc, aiAnalysis) {
    let yPos = 50;
    
    // Key Insights
    doc.fontSize(18)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('Key Insights', 50, yPos);
    
    yPos += 30;
    
    const insights = aiAnalysis.keyInsights || [];
    insights.slice(0, 4).forEach((insight, idx) => {
      doc.fontSize(10)
         .fillColor('#4F46E5')
         .font('Helvetica-Bold')
         .text(`${idx + 1}.`, 50, yPos);
      
      doc.fillColor('#374151')
         .font('Helvetica')
         .text(insight, 70, yPos, { 
           width: doc.page.width - 120,
           lineGap: 3
         });
      
      yPos = doc.y + 10;
    });
    
    yPos += 15;
    
    // Recommendations
    doc.fontSize(18)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('Recommendations', 50, yPos);
    
    yPos += 30;
    
    const recommendations = aiAnalysis.recommendations || [];
    recommendations.slice(0, 4).forEach((rec, idx) => {
      doc.fontSize(10)
         .fillColor('#059669')
         .font('Helvetica-Bold')
         .text(`${idx + 1}.`, 50, yPos);
      
      doc.fillColor('#374151')
         .font('Helvetica')
         .text(rec, 70, yPos, { 
           width: doc.page.width - 120,
           lineGap: 3
         });
      
      yPos = doc.y + 10;
    });
    
    // Alerts (if any)
    const alerts = aiAnalysis.alerts || [];
    if (alerts.length > 0 && alerts[0] !== 'None') {
      yPos += 15;
      
      doc.fontSize(18)
         .fillColor('#DC2626')
         .font('Helvetica-Bold')
         .text('Alerts', 50, yPos);
      
      yPos += 30;
      
      alerts.forEach((alert, idx) => {
        const alertY = yPos;
        doc.roundedRect(50, alertY, doc.page.width - 100, 45, 5)
           .fillAndStroke('#FEE2E2', '#DC2626');
        
        doc.fontSize(9)
           .fillColor('#991B1B')
           .font('Helvetica')
           .text(alert, 60, alertY + 12, {
             width: doc.page.width - 120
           });
        
        yPos += 50;
      });
    }
  }

  /**
   * Professional data table
   */
  addProfessionalDataTable(doc, products, reportType) {
    doc.fontSize(20)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('Product Details', 50, 50);
    
    doc.moveDown(1);
    
    const tableTop = doc.y;
    const headers = ['Product Name', 'SKU', 'Stock', 'Value', 'Status'];
    const colWidths = [200, 100, 70, 100, 70];
    
    // Table headers
    let x = 50;
    headers.forEach((header, i) => {
      doc.rect(x, tableTop, colWidths[i], 30)
         .fill('#4F46E5');
      
      doc.fontSize(10)
         .fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .text(header, x + 10, tableTop + 10, { width: colWidths[i] - 20 });
      
      x += colWidths[i];
    });
    
    // Table rows
    let y = tableTop + 30;
    
    products.forEach((product, idx) => {
      if (y > doc.page.height - 100) return; // Stop if page is full
      
      x = 50;
      const rowColor = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
      
      // Row background
      doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), 30)
         .fill(rowColor);
      
      const stock = product.stock || 0;
      const price = product.price || 0;
      const value = stock * price;
      const status = stock < (product.reorderPoint || 50) ? 'Low' : stock > 500 ? 'High' : 'OK';
      const statusColor = stock < (product.reorderPoint || 50) ? '#DC2626' : stock > 500 ? '#F59E0B' : '#059669';
      
      const rowData = [
        { text: (product.name || 'Unknown').substring(0, 30), color: '#1F2937' },
        { text: product.sku || 'N/A', color: '#6B7280' },
        { text: stock.toString(), color: '#1F2937' },
        { text: `Rs ${value.toLocaleString('en-IN')}`, color: '#059669' },
        { text: status, color: statusColor }
      ];
      
      rowData.forEach((data, i) => {
        doc.fontSize(9)
           .fillColor(data.color)
           .font('Helvetica')
           .text(data.text, x + 10, y + 10, { width: colWidths[i] - 20 });
        x += colWidths[i];
      });
      
      y += 30;
    });
  }
}

module.exports = new PDFGenerator();
