# Indian Trade Hub - Deployment Guide

This guide provides step-by-step instructions for deploying the Indian Trade Hub system to production.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or similar Web3 wallet
- Thirdweb account
- Sepolia testnet ETH for gas fees
- Domain name (optional but recommended)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Smart         │
│   (React)       │◄──►│   (Express)     │◄──►│   Contracts     │
│                 │    │                 │    │   (Solidity)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel/       │    │   Railway/      │    │   Sepolia       │
│   Netlify       │    │   Heroku        │    │   Testnet       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Step 1: Smart Contract Deployment

### 1.1 Prepare Thirdweb

1. **Install Thirdweb CLI**
   ```bash
   npm install -g @thirdweb-dev/cli
   ```

2. **Login to Thirdweb**
   ```bash
   thirdweb login
   ```

3. **Initialize Thirdweb project**
   ```bash
   thirdweb init
   ```

### 1.2 Deploy Smart Contract

1. **Navigate to contracts directory**
   ```bash
   cd contracts
   ```

2. **Deploy to Sepolia**
   ```bash
   thirdweb deploy --network sepolia
   ```

3. **Save the deployed contract address**
   ```bash
   # Copy the deployed contract address
   # Update frontend/src/utils/contract.js
   export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

### 1.3 Verify Contract

1. **Verify on Etherscan**
   - Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
   - Search for your contract address
   - Verify and publish the source code

2. **Test Contract Functions**
   ```bash
   # Test basic functions
   npx hardhat test
   ```

## Step 2: Backend Deployment

### 2.1 Local Development Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   PORT=3001
   NODE_ENV=production
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-agent
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```

### 2.2 Deploy to Railway

1. **Create Railway account**
   - Go to [Railway](https://railway.app/)
   - Sign up with GitHub

2. **Connect repository**
   - Connect your GitHub repository
   - Select the backend directory

3. **Configure environment variables**
   - Add all environment variables in Railway dashboard

4. **Deploy**
   - Railway will automatically deploy on push to main branch

### 2.3 Alternative: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Configure environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-agent
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## Step 3: Frontend Deployment

### 3.1 Build for Production

1. **Update environment variables**
   ```bash
   cd frontend
   # Update contract address in src/utils/contract.js
   # Update backend URL in API calls
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

### 3.2 Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure custom domain (optional)**
   - Go to Vercel dashboard
   - Add your custom domain
   - Configure DNS settings

### 3.3 Alternative: Deploy to Netlify

1. **Create Netlify account**
   - Go to [Netlify](https://netlify.com/)
   - Sign up with GitHub

2. **Connect repository**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Configure environment variables**
   - Add environment variables in Netlify dashboard

## Step 4: AI Agent Integration (n8n)

### 4.1 Set up n8n

1. **Install n8n**
   ```bash
   npm install -g n8n
   ```

2. **Start n8n**
   ```bash
   n8n start
   ```

3. **Create workflows**
   - Compliance validation workflow
   - ESG analysis workflow
   - Risk assessment workflow
   - Trade recommendation workflow

### 4.2 Deploy n8n

1. **Deploy to Railway**
   - Create new Railway project
   - Connect n8n repository
   - Configure environment variables

2. **Configure webhooks**
   - Set up webhook endpoints
   - Update backend with webhook URLs

## Step 5: Database Setup

### 5.1 PostgreSQL (Recommended)

1. **Create database**
   - Use Railway, Heroku, or AWS RDS
   - Get connection string

2. **Run migrations**
   ```bash
   npm run migrate
   ```

### 5.2 Alternative: MongoDB

1. **Create MongoDB Atlas cluster**
   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create free cluster

2. **Configure connection**
   - Get connection string
   - Update backend configuration

## Step 6: Environment Configuration

### 6.1 Frontend Environment

Create `.env.production` in frontend directory:
```env
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_BACKEND_URL=https://your-backend-url.com
VITE_NETWORK=sepolia
```

### 6.2 Backend Environment

Create `.env` in backend directory:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-agent
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
```

## Step 7: Security Configuration

### 7.1 SSL/HTTPS

1. **Vercel/Netlify**: Automatic SSL
2. **Railway/Heroku**: Automatic SSL
3. **Custom domain**: Configure SSL certificate

### 7.2 Environment Variables

1. **Never commit sensitive data**
2. **Use environment variables for all secrets**
3. **Rotate keys regularly**

### 7.3 CORS Configuration

Update backend CORS settings:
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## Step 8: Monitoring and Analytics

### 8.1 Application Monitoring

1. **Sentry for error tracking**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Logging service**
   - Use Railway/Heroku logs
   - Consider Papertrail or Loggly

### 8.2 Analytics

1. **Google Analytics**
   - Add tracking code to frontend
   - Configure events for trade activities

2. **Custom analytics**
   - Track trade volume
   - Monitor ESG scores
   - Analyze compliance rates

## Step 9: Testing

### 9.1 End-to-End Testing

1. **Test smart contract functions**
   ```bash
   npx hardhat test
   ```

2. **Test API endpoints**
   ```bash
   npm run test
   ```

3. **Test frontend functionality**
   - Create test agreements
   - Verify ESG metrics
   - Check compliance validation

### 9.2 Load Testing

1. **Test API performance**
   ```bash
   npm install -g artillery
   artillery quick --count 100 --num 10 https://your-backend-url.com/health
   ```

## Step 10: Go Live Checklist

- [ ] Smart contract deployed and verified
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and functional
- [ ] Database configured and populated
- [ ] AI agent workflows configured
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Monitoring tools active
- [ ] Error tracking configured
- [ ] Analytics tracking active
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Team trained on new system

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check gas fees
   - Verify network configuration
   - Check contract compilation

2. **Backend connection issues**
   - Verify environment variables
   - Check CORS configuration
   - Test database connection

3. **Frontend build fails**
   - Check for missing dependencies
   - Verify environment variables
   - Check for syntax errors

### Support

For deployment issues:
- Check logs in deployment platform
- Review error messages
- Contact platform support
- Check GitHub issues

## Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   npm update
   ```

2. **Monitor performance**
   - Check response times
   - Monitor error rates
   - Review analytics

3. **Backup data**
   - Regular database backups
   - Contract state backups
   - Configuration backups

### Updates

1. **Smart contract updates**
   - Deploy new version
   - Migrate data if needed
   - Update frontend references

2. **Frontend updates**
   - Deploy new version
   - Test functionality
   - Monitor for issues

3. **Backend updates**
   - Deploy new version
   - Test API endpoints
   - Monitor performance

---

**For additional support, contact the Indian Trade Hub team** 