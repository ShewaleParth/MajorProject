const Queue = require('bull');
const Report = require('../models/Report');
const aiReportService = require('../services/aiReportService');
const pdfGenerator = require('../services/pdfGenerator');
const Depot = require('../models/Depot');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Create report generation queue with error handling
let reportQueue;

try {
  reportQueue = new Queue('report-generation', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      enableOfflineQueue: false
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: false,
      removeOnFail: false
    }
  });

  console.log('✅ Bull queue initialized');
} catch (error) {
  console.log('⚠️  Bull queue not available (Redis not connected)');
  console.log('💡 Reports will be processed synchronously');
}


// Process report generation jobs only if queue is available
if (reportQueue) {
  reportQueue.process(async (job) => {
    const { reportId, userId, reportType, targetId } = job.data;
    
    console.log(`📊 Processing report: ${reportId} (${reportType})`);

    try {
      // Update status to processing
      await Report.findByIdAndUpdate(reportId, { 
        status: 'processing',
        progress: 10
      });

      let aiAnalysis, pdfResult, reportData;

      if (reportType === 'depot-analysis') {
        // Fetch depot data
        const depotData = await Depot.findOne({ _id: targetId, userId }).lean();
        if (!depotData) {
          throw new Error('Depot not found');
        }

        await Report.findByIdAndUpdate(reportId, { progress: 20 });

        // Fetch products in depot
        const products = await Product.find({ 
          depotId: targetId, 
          userId 
        }).lean();

        await Report.findByIdAndUpdate(reportId, { progress: 30 });

        // Fetch recent transactions
        const transactions = await Transaction.find({
          userId,
          $or: [{ fromDepot: targetId }, { toDepot: targetId }],
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ timestamp: -1 }).lean();

        await Report.findByIdAndUpdate(reportId, { progress: 40 });

        console.log(`🤖 Generating AI analysis for depot: ${depotData.name}`);
        
        // AI Analysis
        aiAnalysis = await aiReportService.analyzeDepotData(
          depotData,
          transactions,
          products
        );

        await Report.findByIdAndUpdate(reportId, { progress: 70 });

        console.log(`📄 Generating PDF report...`);
        
        // Generate PDF
        pdfResult = await pdfGenerator.generateDepotReport(
          depotData,
          aiAnalysis,
          products,
          transactions
        );

        reportData = {
          depotName: depotData.name,
          totalProducts: products.length,
          totalTransactions: transactions.length
        };

      } else if (reportType === 'inventory-summary') {
        // Fetch all products
        const products = await Product.find({ userId }).lean();
        const depots = await Depot.find({ userId }).lean();
        const transactions = await Transaction.find({
          userId,
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).lean();

        await Report.findByIdAndUpdate(reportId, { progress: 40 });

        // AI Analysis
        aiAnalysis = await aiReportService.analyzeInventoryData(
          products,
          transactions,
          depots
        );

        await Report.findByIdAndUpdate(reportId, { progress: 70 });

        // Generate PDF (TODO: Create inventory PDF template)
        pdfResult = {
          filepath: './reports/inventory-temp.pdf',
          filename: 'inventory-temp.pdf',
          fileSize: 0
        };

        reportData = {
          totalProducts: products.length,
          totalDepots: depots.length
        };
      }

      await Report.findByIdAndUpdate(reportId, { progress: 90 });

      // Update report with results
      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        {
          status: 'completed',
          aiSummary: {
            executive: aiAnalysis.executiveSummary,
            keyInsights: aiAnalysis.keyInsights,
            recommendations: aiAnalysis.recommendations,
            alerts: aiAnalysis.alerts || [],
            metrics: aiAnalysis.metrics || {}
          },
          fileUrl: pdfResult.filepath,
          fileName: pdfResult.filename,
          fileSize: pdfResult.fileSize,
          generatedAt: new Date(),
          progress: 100,
          data: {
            processed: reportData
          }
        },
        { new: true }
      );

      console.log(`✅ Report completed: ${reportId}`);

      return { 
        success: true, 
        reportId,
        filename: pdfResult.filename
      };

    } catch (error) {
      console.error(`❌ Report generation failed:`, error);
      
      await Report.findByIdAndUpdate(reportId, {
        status: 'failed',
        error: error.message,
        progress: 0
      });
      
      throw error;
    }
  });

  // Event listeners
  reportQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
  });

  reportQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
  });

  reportQueue.on('active', (job) => {
    console.log(`🔄 Job ${job.id} started processing`);
  });
}

module.exports = reportQueue;
