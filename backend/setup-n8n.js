const fs = require('fs').promises;
const path = require('path');
const { config, validateConfig } = require('./config');

async function setupN8n() {
  console.log('🚀 Setting up n8n Integration for Indian Trade Hub\n');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = await fs.readFile(envPath, 'utf8');
    console.log('✅ Found existing .env file');
  } catch (error) {
    console.log('📝 Creating new .env file');
  }
  
  // Get n8n URL from user
  console.log('\n📋 Please provide your n8n configuration:');
  console.log('(Press Enter to skip any optional settings)\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  try {
    // Get n8n webhook URL
    const n8nUrl = await question('🔗 Enter your n8n webhook URL (required): ');
    if (!n8nUrl.trim()) {
      console.log('❌ n8n webhook URL is required for AI integration');
      rl.close();
      return;
    }
    
    // Get optional OpenAI API key
    const openaiKey = await question('🤖 Enter OpenAI API key (optional, for fallback): ');
    
    // Get contract address
    const contractAddress = await question('📜 Enter your deployed contract address (optional): ');
    
    // Get port
    const port = await question('🌐 Enter server port (default: 3001): ') || '3001';
    
    rl.close();
    
    // Build .env content
    const newEnvContent = `# Indian Trade Hub Configuration
PORT=${port}

# AI Integration
N8N_WEBHOOK_URL=${n8nUrl.trim()}
${openaiKey.trim() ? `OPENAI_API_KEY=${openaiKey.trim()}` : '# OPENAI_API_KEY=your_openai_key_here'}

# Blockchain Configuration
${contractAddress.trim() ? `CONTRACT_ADDRESS=${contractAddress.trim()}` : '# CONTRACT_ADDRESS=your_contract_address_here'}
NETWORK=sepolia

# Database Configuration
DATA_PATH=./data
BACKUP_RETENTION=7

# Security Configuration
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Optional: External API Keys for n8n workflows
# WTO_API_KEY=your_wto_api_key
# DGFT_API_KEY=your_dgft_api_key
# EPA_API_KEY=your_epa_api_key
# ILO_API_KEY=your_ilo_api_key
# TRANSPARENCY_API_KEY=your_transparency_api_key
# WORLDBANK_API_KEY=your_worldbank_api_key
# CREDIT_RATING_API_KEY=your_credit_rating_api_key
# MARKET_DATA_API_KEY=your_market_data_api_key
# TRADE_INTELLIGENCE_API_KEY=your_trade_intelligence_api_key
# LOGISTICS_API_KEY=your_logistics_api_key
# MARKET_RESEARCH_API_KEY=your_market_research_api_key
# TRADE_OPPORTUNITIES_API_KEY=your_trade_opportunities_api_key
`;
    
    // Write .env file
    await fs.writeFile(envPath, newEnvContent);
    console.log('\n✅ Configuration saved to .env file');
    
    // Test the configuration
    console.log('\n🧪 Testing configuration...');
    const { validateConfig } = require('./config');
    validateConfig();
    
    // Test n8n connection
    console.log('\n🔗 Testing n8n connection...');
    const AIIntegration = require('./ai-integration');
    const aiIntegration = new AIIntegration({ 
      n8nWebhookUrl: n8nUrl.trim(),
      openaiApiKey: openaiKey.trim() || undefined
    });
    
    const status = await aiIntegration.getAIStatus();
    console.log('📊 AI Integration Status:', JSON.stringify(status, null, 2));
    
    if (status.enabled) {
      console.log('\n✅ n8n integration configured successfully!');
      console.log('\n🚀 Next steps:');
      console.log('1. Start the backend: npm start');
      console.log('2. Test the AI integration: curl http://localhost:3001/api/ai/status');
      console.log('3. Create a test agreement to trigger AI processing');
    } else {
      console.log('\n❌ n8n integration not properly configured');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupN8n();
}

module.exports = { setupN8n }; 