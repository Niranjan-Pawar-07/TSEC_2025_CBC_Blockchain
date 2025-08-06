# Trade Hub - Blockchain-Powered Cross-Border Trade Platform

## Overview

Indian Trade Hub is a comprehensive blockchain-based solution designed to address the significant challenges faced by Indian businesses engaged in import-export activities. The platform streamlines global trade processes by enabling secure, transparent, and efficient cross-border transactions while ensuring compliance with global trade and ESG (Environmental, Social, and Governance) standards.

## Problem Statement

Indian businesses engaged in import-export activities face significant challenges in achieving fast, cost-effective, and compliant cross-border transactions that align with WTO regulations and ESG standards. Existing trade systems often lack the necessary transparency, traceability, and automation, leading to:

- Delays in trade processing
- Increased operational costs
- Compliance issues with international trade laws
- Lack of sustainability tracking
- Limited transparency in trade flows

## Solution

Indian Trade Hub provides a Consortium Blockchain-based solution that addresses these inefficiencies through:

### Key Functionalities

1. **Smart Contract Automation**
   - Automate and enforce trade agreements via smart contracts aligned with WTO rules
   - Reduce disputes and ensure compliance through automated validation
   - Multi-signature approval system for enhanced trust

2. **Decentralized Identity Management**
   - Verify participants and prevent fraud
   - Meet global standards for identity verification
   - Reputation scoring system for trade partners

3. **ESG Metric Tracking**
   - Monitor and improve sustainability of import-export operations
   - Real-time environmental impact assessment
   - Social compliance tracking
   - Governance standards enforcement

4. **Transparent Cross-Border Trade**
   - Real-time tracking of trade flows
   - Complete auditability through blockchain consensus
   - Transparent escrow system

5. **AI-Powered Trade Management**
   - Intelligent trade flow management
   - Automated compliance monitoring
   - Predictive analytics for trade optimization

## Features

### 🏠 Dashboard
- Comprehensive overview of trade activities
- Real-time statistics and metrics
- Quick access to all platform features
- System status monitoring

### 📝 Create Agreements
- Multi-step agreement creation process
- WTO compliance validation
- ESG metrics integration
- Document upload and management
- Advanced trade terms configuration

### 📊 Analytics
- Trade volume analysis
- ESG score trends
- Compliance rate tracking
- Country-wise trade statistics
- AI-powered insights and recommendations

### 📋 Agreement Management
- View and manage existing agreements
- Status tracking and updates
- ESG metrics monitoring
- Compliance validation

## Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Thirdweb** - Web3 integration and smart contract interaction
- **Tailwind CSS** - Utility-first CSS framework
- **Ethers.js** - Ethereum library for blockchain interaction

### Smart Contracts
- **Solidity** - Smart contract development
- **Hardhat** - Development environment
- **Thirdweb** - Contract deployment and management

### Blockchain
- **Sepolia Testnet** - Ethereum test network for development
- **IPFS** - Decentralized file storage for documents

## Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MetaMask** or any Web3 wallet
3. **Sepolia Testnet** configured in your wallet
4. **Test ETH** for gas fees

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cooking
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file in the root directory
   cp .env.example .env
   ```

4. **Deploy smart contracts**
   ```bash
   # Deploy to Sepolia testnet using Thirdweb
   npx thirdweb deploy
   ```

5. **Update contract address**
   ```bash
   # Update the contract address in frontend/src/utils/contract.js
   export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

6. **Start the development server**
   ```bash
   cd frontend
   npm run dev
   ```

### Usage

1. **Connect Wallet**
   - Open the application in your browser
   - Click "Connect Wallet" and authorize the connection
   - Ensure you're connected to Sepolia Testnet

2. **Create Trade Agreement**
   - Navigate to "Create Agreement"
   - Fill in the required trade details
   - Complete WTO compliance validation
   - Add ESG metrics (optional)
   - Upload supporting documents
   - Submit the agreement

3. **Monitor Agreements**
   - View all your agreements in the "My Agreements" section
   - Track status updates and compliance
   - Monitor ESG metrics

4. **Analytics**
   - Access comprehensive analytics in the "Analytics" section
   - View trade volume trends
   - Monitor ESG score improvements
   - Get AI-powered insights

## Smart Contract Features

### Trade Agreement Structure
```solidity
struct Agreement {
    uint256 id;
    address importer;
    address exporter;
    string goodsDescription;
    uint256 amount;
    Status status;
    ESGMetrics esgMetrics;
    WTOCompliance wtoCompliance;
    uint256 createdAt;
    uint256 completedAt;
    uint256 disputeResolutionDeadline;
}
```

### ESG Metrics
```solidity
struct ESGMetrics {
    uint256 carbonFootprint;
    uint256 waterUsage;
    uint256 wasteGenerated;
    uint256 renewableEnergy;
    uint256 laborCompliance;
    uint256 complianceScore;
    string certifications;
    uint256 lastUpdated;
}
```

### WTO Compliance
```solidity
struct WTOCompliance {
    bool isCompliant;
    string[] regulations;
    uint256 tariffCode;
    string originCertificate;
    uint256 lastValidated;
}
```

## ESG Guidelines for Indian Trade

### Environmental
- Minimize carbon footprint through efficient logistics
- Reduce water consumption in production processes
- Implement waste reduction and recycling programs
- Use renewable energy sources where possible

### Social
- Ensure fair labor practices and safe working conditions
- Support community development initiatives
- Promote diversity and inclusion in the workplace
- Maintain transparent supply chains

### Governance
- Adhere to international trade regulations
- Implement robust compliance monitoring
- Maintain transparent business practices
- Regular audit and reporting

## AI Agent Integration

The platform is designed to integrate with n8n workflows for AI-powered trade management:

- **Automated Compliance Monitoring**: Real-time validation of trade agreements
- **ESG Score Calculation**: Automated assessment of environmental and social metrics
- **Risk Assessment**: Predictive analysis of trade risks
- **Market Intelligence**: AI-powered insights for trade optimization

## Security Features

- **Multi-signature Escrow**: Secure fund management
- **Decentralized Identity**: Fraud prevention through verified identities
- **Immutable Records**: All trade data stored on blockchain
- **Audit Trail**: Complete transparency and traceability

## Compliance Standards

- **WTO Regulations**: Automated compliance validation
- **ESG Standards**: Comprehensive sustainability tracking
- **International Trade Laws**: Built-in regulatory compliance
- **Data Protection**: GDPR-compliant data handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Documentation: [Link to docs]
- Community Forum: [Link to forum]
- Email: support@indiantradehub.com

## Roadmap

### Phase 1 (Current)
- ✅ Basic trade agreement creation
- ✅ WTO compliance validation
- ✅ ESG metrics tracking
- ✅ Dashboard and analytics

### Phase 2 (Q2 2024)
- 🔄 AI agent integration with n8n
- 🔄 Advanced analytics and reporting
- 🔄 Mobile application
- 🔄 API for third-party integrations

### Phase 3 (Q3 2024)
- 📋 Multi-chain support
- 📋 Advanced ESG scoring algorithms
- 📋 Predictive analytics
- 📋 International market expansion

### Phase 4 (Q4 2024)
- 📋 AI-powered trade recommendations
- 📋 Automated dispute resolution
- 📋 Advanced compliance monitoring
- 📋 Enterprise features

## Acknowledgments

- Thirdweb for blockchain infrastructure
- Ethereum Foundation for blockchain technology
- WTO for trade compliance standards
- Indian government for trade facilitation initiatives

---

**Built with ❤️ for Indian businesses by the Indian Trade Hub team**
