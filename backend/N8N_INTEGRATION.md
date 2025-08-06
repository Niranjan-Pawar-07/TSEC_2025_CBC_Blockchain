# n8n Integration Guide

This guide explains how to set up and use the n8n AI agent integration with the Indian Trade Hub backend.

## 🚀 Quick Setup

### 1. Run the Setup Script
```bash
npm run setup
```

This interactive script will:
- Ask for your n8n webhook URL
- Configure optional OpenAI API key for fallback
- Set up environment variables
- Test the connection

### 2. Test the Integration
```bash
npm run test-n8n
```

This will run comprehensive tests to verify:
- AI integration status
- n8n connection
- Agreement processing
- AI analysis functions

## 🔧 Manual Configuration

If you prefer to configure manually, create a `.env` file in the backend directory:

```env
# AI Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-workflow-id
OPENAI_API_KEY=your_openai_api_key_here

# Blockchain Configuration
CONTRACT_ADDRESS=your_deployed_contract_address
NETWORK=sepolia

# Server Configuration
PORT=3001

# Database Configuration
DATA_PATH=./data
BACKUP_RETENTION=7

# Security Configuration
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🤖 AI Functions

The system integrates with n8n for the following AI-powered functions:

### 1. Compliance Validation
- **Endpoint**: `/compliance-validation`
- **Purpose**: Validates trade agreements against WTO rules
- **Input**: Agreement data (goods, countries, amount, incoterms)
- **Output**: Compliance status, violations, recommendations

### 2. Risk Assessment
- **Endpoint**: `/risk-assessment`
- **Purpose**: Assesses trade risks based on parties and goods
- **Input**: Agreement data, participant information
- **Output**: Risk level, risk factors, mitigation strategies

### 3. ESG Analysis
- **Endpoint**: `/esg-analysis`
- **Purpose**: Analyzes environmental, social, and governance impact
- **Input**: Agreement data, ESG metrics
- **Output**: ESG score, sustainability assessment, improvement areas

### 4. Trade Recommendations
- **Endpoint**: `/trade-recommendations`
- **Purpose**: Provides optimization recommendations
- **Input**: Agreement data, market conditions
- **Output**: Recommendations list, priority actions, cost savings

### 5. Market Insights
- **Endpoint**: `/market-insights`
- **Purpose**: Provides market intelligence and trends
- **Input**: Agreement data, market parameters
- **Output**: Market trends, opportunities, competitive analysis

## 📊 API Endpoints

### AI Status
```bash
GET /api/ai/status
```

### Test Connection
```bash
GET /api/ai/test
```

### Get AI Insights
```bash
GET /api/ai/insights?limit=10
```

### Process Agreement with AI
```bash
POST /api/ai/process-agreement/:id
```

### Generate AI Report
```bash
GET /api/ai/report/:agreementId?type=comprehensive
```

## 🔄 Webhook Integration

The backend sends data to n8n via webhooks with this structure:

```json
{
  "event": "compliance_validation",
  "data": {
    "agreementId": "agreement-123",
    "goodsDescription": "Electronics",
    "originCountry": "China",
    "destinationCountry": "India",
    "amount": "50000",
    "incoterms": "CIF"
  }
}
```

## 🛡️ Fallback System

If n8n is unavailable, the system provides basic fallback functions:
- Basic compliance validation
- Simple risk assessment
- ESG score calculation
- Generic recommendations
- Market insights from static data

## 📈 Monitoring

### Health Check
```bash
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "agreements": 10,
    "aiInsights": 25,
    "lastBackup": "2024-01-01T00:00:00.000Z"
  },
  "ai": {
    "enabled": true,
    "n8nConfigured": true,
    "openaiConfigured": false,
    "lastTest": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **n8n Connection Failed**
   - Verify webhook URL is correct
   - Check n8n instance is running
   - Ensure webhook is publicly accessible

2. **AI Processing Timeout**
   - Check n8n workflow execution time
   - Verify webhook response format
   - Check network connectivity

3. **Fallback Functions Only**
   - n8n is not configured or unreachable
   - Check environment variables
   - Verify webhook URL format

### Debug Commands

```bash
# Check configuration
node -e "const {config} = require('./config'); console.log(config)"

# Test AI integration
npm run test-n8n

# Check server logs
npm run dev
```

## 📚 Next Steps

1. **Customize n8n Workflows**: Modify the provided workflow templates in `n8n-workflows.json`
2. **Add External APIs**: Configure API keys for WTO, ESG, and market data services
3. **Scale AI Processing**: Implement queuing for high-volume processing
4. **Monitor Performance**: Set up logging and monitoring for AI functions

## 🔗 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Webhook Integration Guide](https://docs.n8n.io/integrations/webhooks/)
- [Indian Trade Hub Documentation](./README.md)
- [Deployment Guide](../DEPLOYMENT.md) 