require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  
  // Database Configuration
  database: {
    dataPath: process.env.DATA_PATH || './data',
    backupRetention: parseInt(process.env.BACKUP_RETENTION) || 7
  },
  
  // AI Integration Configuration
  ai: {
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    enabled: !!(process.env.N8N_WEBHOOK_URL || process.env.OPENAI_API_KEY)
  },
  
  // Blockchain Configuration
  blockchain: {
    network: process.env.NETWORK || 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS
  },
  
  // Security Configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};

// Validation
function validateConfig() {
  const errors = [];
  
  if (!config.ai.n8nWebhookUrl && !config.ai.openaiApiKey) {
    console.warn('⚠️ Warning: No AI integration configured. Set N8N_WEBHOOK_URL or OPENAI_API_KEY');
  }
  
  if (!config.blockchain.contractAddress) {
    console.warn('⚠️ Warning: No contract address configured. Set CONTRACT_ADDRESS');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:', errors);
    return false;
  }
  
  return true;
}

// Helper function to get AI status
function getAIStatus() {
  return {
    enabled: config.ai.enabled,
    n8nConfigured: !!config.ai.n8nWebhookUrl,
    openaiConfigured: !!config.ai.openaiApiKey,
    webhookUrl: config.ai.n8nWebhookUrl ? 'Configured' : 'Not configured',
    openaiKey: config.ai.openaiApiKey ? 'Configured' : 'Not configured'
  };
}

module.exports = {
  config,
  validateConfig,
  getAIStatus
}; 