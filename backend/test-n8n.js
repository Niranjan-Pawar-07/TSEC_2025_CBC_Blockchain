const { config } = require('./config');
const AIIntegration = require('./ai-integration');
const TradeDatabase = require('./database');

async function testN8nIntegration() {
  console.log('🧪 Testing n8n Integration for Indian Trade Hub\n');
  
  // Initialize components
  const database = new TradeDatabase();
  const aiIntegration = new AIIntegration({ 
    database,
    n8nWebhookUrl: config.ai.n8nWebhookUrl,
    openaiApiKey: config.ai.openaiApiKey
  });
  
  try {
    // Test 1: Check AI Status
    console.log('1️⃣ Checking AI Integration Status...');
    const status = await aiIntegration.getAIStatus();
    console.log('✅ AI Status:', JSON.stringify(status, null, 2));
    
    if (!status.enabled) {
      console.log('❌ AI integration is not enabled. Please run: npm run setup');
      return;
    }
    
    // Test 2: Test n8n Connection
    console.log('\n2️⃣ Testing n8n Connection...');
    const connectionTest = await aiIntegration.testConnection();
    console.log('✅ Connection Test:', JSON.stringify(connectionTest, null, 2));
    
    // Test 3: Create a test agreement
    console.log('\n3️⃣ Creating Test Agreement...');
    const testAgreement = {
      id: 'test-' + Date.now(),
      importer: '0x1234567890123456789012345678901234567890',
      exporter: '0x0987654321098765432109876543210987654321',
      goodsDescription: 'Test Electronics - Smartphones',
      originCountry: 'China',
      destinationCountry: 'India',
      amount: '50000',
      incoterms: 'CIF',
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    await database.createAgreement(testAgreement);
    console.log('✅ Test agreement created:', testAgreement.id);
    
    // Test 4: Trigger AI Processing
    console.log('\n4️⃣ Triggering AI Processing...');
    const aiAnalysis = await aiIntegration.processTradeAgreement(testAgreement);
    console.log('✅ AI Analysis Result:', JSON.stringify(aiAnalysis, null, 2));
    
    // Test 5: Check stored insights
    console.log('\n5️⃣ Checking Stored AI Insights...');
    const insights = await database.getAIInsights(5);
    console.log('✅ Recent AI Insights:', insights.length, 'found');
    
    if (insights.length > 0) {
      console.log('📊 Latest Insight:', JSON.stringify(insights[0], null, 2));
    }
    
    // Test 6: Test individual AI functions
    console.log('\n6️⃣ Testing Individual AI Functions...');
    
    const compliance = await aiIntegration.validateCompliance(testAgreement);
    console.log('✅ Compliance Validation:', compliance.isValid ? 'PASS' : 'FAIL');
    
    const risk = await aiIntegration.assessRisk(testAgreement);
    console.log('✅ Risk Assessment:', risk.riskLevel || 'N/A');
    
    const esg = await aiIntegration.analyzeESG(testAgreement);
    console.log('✅ ESG Analysis:', esg.score ? `${esg.score}/100` : 'N/A');
    
    const recommendations = await aiIntegration.generateRecommendations(testAgreement);
    console.log('✅ Recommendations:', recommendations.recommendations?.length || 0, 'items');
    
    const marketInsights = await aiIntegration.getMarketInsights(testAgreement);
    console.log('✅ Market Insights:', marketInsights.insights?.length || 0, 'items');
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- AI Integration: ${status.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`- n8n Webhook: ${status.n8nConfigured ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`- OpenAI Fallback: ${status.openaiConfigured ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`- Test Agreement: ✅ Created (${testAgreement.id})`);
    console.log(`- AI Processing: ✅ Completed`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run test if called directly
if (require.main === module) {
  testN8nIntegration();
}

module.exports = { testN8nIntegration }; 