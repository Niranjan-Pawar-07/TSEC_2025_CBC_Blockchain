const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const TradeDatabase = require('./database');
const AIIntegration = require('./ai-integration');
const { config, validateConfig } = require('./config');

const app = express();
const PORT = config.port;

// Validate configuration on startup
validateConfig();

// Initialize database and AI integration
const database = new TradeDatabase();
const aiIntegration = new AIIntegration({ 
  database,
  n8nWebhookUrl: config.ai.n8nWebhookUrl,
  openaiApiKey: config.ai.openaiApiKey
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbStats = await database.getDatabaseStats();
    const aiStatus = await aiIntegration.getAIStatus();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: dbStats,
      ai: aiStatus
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Database Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await database.getDatabaseStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agreement Management
app.get('/api/agreements', async (req, res) => {
  try {
    const agreements = await database.getAllAgreements();
    res.json(agreements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agreements', async (req, res) => {
  try {
    const agreement = await database.createAgreement(req.body);
    
    // Trigger AI processing
    const aiAnalysis = await aiIntegration.processTradeAgreement(agreement);
    
    // Update agreement with AI insights
    await database.updateAgreement(agreement.id, {
      aiAnalysis,
      status: 'ai_processed'
    });

    res.status(201).json(agreement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agreements/:id', async (req, res) => {
  try {
    const agreement = await database.getAgreement(req.params.id);
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    res.json(agreement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agreements/:id', async (req, res) => {
  try {
    const agreement = await database.updateAgreement(req.params.id, req.body);
    res.json(agreement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ESG Metrics
app.get('/api/esg-metrics', async (req, res) => {
  try {
    const metrics = await database.getAllESGMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/esg-metrics', async (req, res) => {
  try {
    const { agreementId, metrics } = req.body;
    const updatedMetrics = await database.updateESGMetrics(agreementId, metrics);
    
    // Trigger AI ESG analysis
    const agreement = await database.getAgreement(agreementId);
    if (agreement) {
      const esgAnalysis = await aiIntegration.analyzeESG(agreement);
      await database.storeAIInsight({
        type: 'esg_analysis',
        agreementId,
        analysis: esgAnalysis
      });
    }
    
    res.json(updatedMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/esg-metrics/:agreementId', async (req, res) => {
  try {
    const metrics = await database.getESGMetrics(req.params.agreementId);
    if (!metrics) {
      return res.status(404).json({ error: 'ESG metrics not found' });
    }
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compliance Reports
app.get('/api/compliance', async (req, res) => {
  try {
    const reports = await database.getComplianceReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/compliance', async (req, res) => {
  try {
    const report = await database.createComplianceReport(req.body);
    
    // Trigger AI compliance validation
    const agreement = await database.getAgreement(report.agreementId);
    if (agreement) {
      const complianceValidation = await aiIntegration.validateCompliance(agreement);
      await database.storeAIInsight({
        type: 'compliance_validation',
        agreementId: report.agreementId,
        analysis: complianceValidation
      });
    }
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Participant Management
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await database.getAllParticipants();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/participants', async (req, res) => {
  try {
    const { address, ...participantData } = req.body;
    const participant = await database.registerParticipant(address, participantData);
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/participants/:address', async (req, res) => {
  try {
    const participant = await database.getParticipant(req.params.address);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Document Management
app.post('/api/documents', async (req, res) => {
  try {
    const { agreementId, ...documentData } = req.body;
    const document = await database.storeDocument(agreementId, documentData);
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/:agreementId', async (req, res) => {
  try {
    const documents = await database.getDocuments(req.params.agreementId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Integration Endpoints

// AI Status
app.get('/api/ai/status', async (req, res) => {
  try {
    const status = await aiIntegration.getAIStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test AI Connection
app.get('/api/ai/test', async (req, res) => {
  try {
    const result = await aiIntegration.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Insights
app.get('/api/ai/insights', async (req, res) => {
  try {
    const insights = await database.getAIInsights(parseInt(req.query.limit) || 50);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process Agreement with AI
app.post('/api/ai/process-agreement/:id', async (req, res) => {
  try {
    const agreement = await database.getAgreement(req.params.id);
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const analysis = await aiIntegration.processTradeAgreement(agreement);
    
    // Update agreement with AI analysis
    await database.updateAgreement(agreement.id, {
      aiAnalysis: analysis,
      lastAIAnalysis: new Date().toISOString()
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate AI Report
app.post('/api/ai/report/:agreementId', async (req, res) => {
  try {
    const { reportType = 'comprehensive' } = req.body;
    const report = await aiIntegration.generateReport(req.params.agreementId, reportType);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for n8n AI agent
app.post('/api/ai-webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log(`🤖 AI Agent Event: ${event}`, data);

    switch (event) {
      case 'compliance_validation':
        await handleComplianceValidation(data);
        break;
      case 'esg_analysis':
        await handleESGAnalysis(data);
        break;
      case 'risk_assessment':
        await handleRiskAssessment(data);
        break;
      case 'trade_recommendation':
        await handleTradeRecommendation(data);
        break;
      case 'market_insights':
        await handleMarketInsights(data);
        break;
      default:
        console.log(`Unknown event: ${event}`);
    }

    res.json({ status: 'processed', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const analytics = await calculateAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Log
app.get('/api/audit-log', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const auditLog = await database.getAuditLog(limit);
    res.json(auditLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data Export/Import
app.get('/api/export', async (req, res) => {
  try {
    const data = await database.exportData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const result = await database.importData(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper Functions

async function handleComplianceValidation(data) {
  const { agreementId, complianceResult } = data;
  
  const agreement = await database.getAgreement(agreementId);
  if (agreement) {
    await database.updateAgreement(agreementId, {
      compliance: complianceResult,
      complianceStatus: complianceResult.isCompliant ? 'compliant' : 'non-compliant'
    });
  }
}

async function handleESGAnalysis(data) {
  const { agreementId, esgAnalysis } = data;
  
  await database.storeAIInsight({
    type: 'esg_analysis',
    agreementId,
    analysis: esgAnalysis
  });
}

async function handleRiskAssessment(data) {
  const { agreementId, riskAssessment } = data;
  
  const agreement = await database.getAgreement(agreementId);
  if (agreement) {
    await database.updateAgreement(agreementId, {
      riskAssessment
    });
  }
}

async function handleTradeRecommendation(data) {
  const { agreementId, recommendations } = data;
  
  await database.storeAIInsight({
    type: 'trade_recommendation',
    agreementId,
    recommendations
  });
}

async function handleMarketInsights(data) {
  const { agreementId, marketInsights } = data;
  
  await database.storeAIInsight({
    type: 'market_insights',
    agreementId,
    insights: marketInsights
  });
}

async function calculateAnalytics(timeRange) {
  const now = new Date();
  const timeRangeMs = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000
  };

  const agreements = await database.getAllAgreements();
  const filteredAgreements = agreements.filter(agreement => 
    now - new Date(agreement.createdAt) <= timeRangeMs[timeRange]
  );

  const analytics = {
    totalAgreements: filteredAgreements.length,
    totalValue: filteredAgreements.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0),
    complianceRate: 0,
    averageESGScore: 0,
    topProducts: [],
    countryStats: {}
  };

  // Calculate compliance rate
  const compliantCount = filteredAgreements.filter(a => a.complianceStatus === 'compliant').length;
  analytics.complianceRate = filteredAgreements.length > 0 ? (compliantCount / filteredAgreements.length) * 100 : 0;

  // Calculate average ESG score
  const esgMetrics = await database.getAllESGMetrics();
  const esgScores = Object.values(esgMetrics)
    .filter(metrics => metrics.calculatedScore)
    .map(metrics => metrics.calculatedScore);
  
  analytics.averageESGScore = esgScores.length > 0 ? 
    esgScores.reduce((sum, score) => sum + score, 0) / esgScores.length : 0;

  return analytics;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Indian Trade Hub Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Agent webhook: http://localhost:${PORT}/api/ai-webhook`);
  console.log(`🗄️ Database initialized successfully`);
});

module.exports = app;