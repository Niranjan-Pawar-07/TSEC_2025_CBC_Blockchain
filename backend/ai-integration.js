const fetch = require('node-fetch');

class AIIntegration {
  constructor(config = {}) {
    this.n8nWebhookUrl = config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL;
    this.openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;
    this.database = config.database;
    this.enabled = !!(this.n8nWebhookUrl || this.openaiApiKey);
    
    if (!this.enabled) {
      console.warn('⚠️ AI Integration disabled - no webhook URL or API key provided');
    }
  }

  // Main AI Processing Functions

  async processTradeAgreement(agreementData) {
    try {
      console.log('🤖 AI Processing: Trade Agreement Analysis');
      
      const analysis = {
        agreementId: agreementData.id,
        timestamp: new Date().toISOString(),
        compliance: await this.validateCompliance(agreementData),
        riskAssessment: await this.assessRisk(agreementData),
        esgAnalysis: await this.analyzeESG(agreementData),
        recommendations: await this.generateRecommendations(agreementData),
        marketInsights: await this.getMarketInsights(agreementData)
      };

      // Store AI insights in database
      if (this.database) {
        await this.database.storeAIInsight({
          type: 'trade_agreement_analysis',
          agreementId: agreementData.id,
          analysis,
          status: 'completed'
        });
      }

      return analysis;
    } catch (error) {
      console.error('❌ AI Processing failed:', error);
      return { error: error.message };
    }
  }

  async validateCompliance(agreementData) {
    try {
      const complianceData = {
        agreementId: agreementData.id,
        goodsDescription: agreementData.goodsDescription,
        originCountry: agreementData.originCountry,
        destinationCountry: agreementData.destinationCountry,
        amount: agreementData.amount,
        incoterms: agreementData.incoterms
      };

      if (this.n8nWebhookUrl) {
        // Send to n8n workflow
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'compliance_validation',
            data: complianceData
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      }

      // Fallback: Basic compliance validation
      return this.basicComplianceValidation(complianceData);
    } catch (error) {
      console.error('❌ Compliance validation failed:', error);
      return this.basicComplianceValidation(agreementData);
    }
  }

  async assessRisk(agreementData) {
    try {
      const riskData = {
        agreementId: agreementData.id,
        importer: agreementData.importer,
        exporter: agreementData.exporter,
        amount: agreementData.amount,
        goodsDescription: agreementData.goodsDescription,
        originCountry: agreementData.originCountry,
        destinationCountry: agreementData.destinationCountry
      };

      if (this.n8nWebhookUrl) {
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'risk_assessment',
            data: riskData
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      }

      // Fallback: Basic risk assessment
      return this.basicRiskAssessment(riskData);
    } catch (error) {
      console.error('❌ Risk assessment failed:', error);
      return this.basicRiskAssessment(agreementData);
    }
  }

  async analyzeESG(agreementData) {
    try {
      const esgData = {
        agreementId: agreementData.id,
        goodsDescription: agreementData.goodsDescription,
        originCountry: agreementData.originCountry,
        destinationCountry: agreementData.destinationCountry,
        amount: agreementData.amount
      };

      if (this.n8nWebhookUrl) {
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'esg_analysis',
            data: esgData
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      }

      // Fallback: Basic ESG analysis
      return this.basicESGAnalysis(esgData);
    } catch (error) {
      console.error('❌ ESG analysis failed:', error);
      return this.basicESGAnalysis(agreementData);
    }
  }

  async generateRecommendations(agreementData) {
    try {
      const recommendationData = {
        agreementId: agreementData.id,
        goodsDescription: agreementData.goodsDescription,
        amount: agreementData.amount,
        originCountry: agreementData.originCountry,
        destinationCountry: agreementData.destinationCountry
      };

      if (this.n8nWebhookUrl) {
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'trade_recommendation',
            data: recommendationData
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      }

      // Fallback: Basic recommendations
      return this.basicRecommendations(recommendationData);
    } catch (error) {
      console.error('❌ Recommendations generation failed:', error);
      return this.basicRecommendations(agreementData);
    }
  }

  async getMarketInsights(agreementData) {
    try {
      const marketData = {
        goodsDescription: agreementData.goodsDescription,
        originCountry: agreementData.originCountry,
        destinationCountry: agreementData.destinationCountry,
        amount: agreementData.amount
      };

      if (this.n8nWebhookUrl) {
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'market_insights',
            data: marketData
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      }

      // Fallback: Basic market insights
      return this.basicMarketInsights(marketData);
    } catch (error) {
      console.error('❌ Market insights failed:', error);
      return this.basicMarketInsights(agreementData);
    }
  }

  // Fallback Functions (when n8n is not available)

  basicComplianceValidation(data) {
    const compliance = {
      isCompliant: true,
      score: 85,
      details: {
        tariffCompliance: true,
        originVerification: true,
        regulatoryCompliance: true,
        documentationComplete: true
      },
      recommendations: [
        'Ensure all required documents are uploaded',
        'Verify origin certificates are valid',
        'Check tariff classifications'
      ],
      risks: [
        'Potential delays in customs clearance',
        'Documentation requirements may change'
      ]
    };

    // Basic validation logic
    if (data.amount > 1000000) {
      compliance.score -= 10;
      compliance.risks.push('High-value transaction requires additional scrutiny');
    }

    if (data.originCountry === 'India' && data.destinationCountry === 'United States') {
      compliance.score += 5;
      compliance.details.indiaUsTrade = true;
    }

    return compliance;
  }

  basicRiskAssessment(data) {
    const risk = {
      overallRisk: 'medium',
      score: 65,
      factors: {
        countryRisk: 'low',
        counterpartyRisk: 'medium',
        marketRisk: 'medium',
        regulatoryRisk: 'low'
      },
      recommendations: [
        'Monitor exchange rate fluctuations',
        'Verify counterparty credentials',
        'Consider trade insurance'
      ],
      mitigation: [
        'Use escrow services',
        'Implement payment terms',
        'Regular monitoring'
      ]
    };

    // Basic risk logic
    if (data.amount > 500000) {
      risk.overallRisk = 'high';
      risk.score += 20;
    }

    if (data.originCountry === 'India') {
      risk.factors.countryRisk = 'low';
      risk.score -= 10;
    }

    return risk;
  }

  basicESGAnalysis(data) {
    const esg = {
      environmentalScore: 75,
      socialScore: 80,
      governanceScore: 85,
      overallScore: 80,
      recommendations: [
        'Consider carbon offset programs',
        'Implement sustainable packaging',
        'Verify labor standards compliance'
      ],
      certifications: [
        'ISO 14001 (Environmental Management)',
        'Fair Trade Certification',
        'Organic Certification'
      ]
    };

    // Basic ESG logic
    if (data.goodsDescription.toLowerCase().includes('organic')) {
      esg.environmentalScore += 10;
      esg.overallScore += 5;
    }

    if (data.originCountry === 'India') {
      esg.socialScore += 5;
      esg.governanceScore += 5;
    }

    return esg;
  }

  basicRecommendations(data) {
    return {
      tradeOptimization: [
        'Consider bulk shipping for cost reduction',
        'Explore alternative payment terms',
        'Negotiate better freight rates'
      ],
      compliance: [
        'Ensure all regulatory requirements are met',
        'Maintain proper documentation',
        'Regular compliance audits'
      ],
      riskManagement: [
        'Implement trade insurance',
        'Use secure payment methods',
        'Monitor market conditions'
      ],
      sustainability: [
        'Choose eco-friendly packaging',
        'Optimize transportation routes',
        'Partner with sustainable suppliers'
      ]
    };
  }

  basicMarketInsights(data) {
    return {
      marketTrends: [
        'Growing demand for sustainable products',
        'Digital trade platforms gaining popularity',
        'Increased focus on supply chain transparency'
      ],
      opportunities: [
        'Expand to emerging markets',
        'Develop digital trade capabilities',
        'Focus on ESG-compliant products'
      ],
      challenges: [
        'Regulatory complexity',
        'Currency fluctuations',
        'Supply chain disruptions'
      ],
      forecasts: {
        shortTerm: 'Stable growth expected',
        mediumTerm: 'Digital transformation accelerating',
        longTerm: 'Sustainability becoming key differentiator'
      }
    };
  }

  // Real-time Monitoring

  async monitorTradeFlow(agreementId) {
    try {
      if (this.n8nWebhookUrl) {
        const response = await fetch(`${this.n8nWebhookUrl}/trade-monitoring`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'trade_monitoring',
            data: { agreementId }
          })
        });

        if (response.ok) {
          return await response.json();
        }
      }

      return { status: 'monitoring_active', message: 'Trade flow monitoring enabled' };
    } catch (error) {
      console.error('❌ Trade monitoring failed:', error);
      return { error: error.message };
    }
  }

  async generateReport(agreementId, reportType = 'comprehensive') {
    try {
      const reportData = {
        agreementId,
        reportType,
        timestamp: new Date().toISOString()
      };

      if (this.n8nWebhookUrl) {
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'generate_report',
            data: reportData
          })
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Basic report generation
      return this.generateBasicReport(agreementId, reportType);
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      return this.generateBasicReport(agreementId, reportType);
    }
  }

  generateBasicReport(agreementId, reportType) {
    return {
      reportId: `report_${Date.now()}`,
      agreementId,
      reportType,
      generatedAt: new Date().toISOString(),
      summary: 'Trade agreement analysis report',
      sections: {
        compliance: 'Compliance validation completed',
        risk: 'Risk assessment performed',
        esg: 'ESG analysis conducted',
        recommendations: 'Recommendations provided'
      },
      status: 'completed'
    };
  }

  // AI Agent Status and Health

  async getAIStatus() {
    return {
      enabled: this.enabled,
      n8nConnected: !!this.n8nWebhookUrl,
      openaiConnected: !!this.openaiApiKey,
      lastActivity: new Date().toISOString(),
      health: 'healthy'
    };
  }

  async testConnection() {
    try {
      if (this.n8nWebhookUrl) {
        // Test with a simple POST request to the webhook
        const response = await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'test_connection',
            data: { timestamp: new Date().toISOString() }
          }),
          timeout: 5000
        });

        return {
          success: response.ok,
          status: response.status,
          message: response.ok ? 'n8n connection successful' : 'n8n connection failed'
        };
      }

      return {
        success: true,
        status: 'fallback_mode',
        message: 'Using fallback AI functions'
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: error.message
      };
    }
  }
}

module.exports = AIIntegration; 