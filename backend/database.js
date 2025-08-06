const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class TradeDatabase {
  constructor() {
    this.dataPath = path.join(__dirname, 'data');
    this.dataFile = path.join(this.dataPath, 'trade-data.json');
    this.backupPath = path.join(this.dataPath, 'backups');
    
    // Initialize data structure
    this.data = {
      agreements: [],
      esgMetrics: {},
      complianceReports: [],
      participants: {},
      documents: {},
      aiInsights: [],
      analytics: {},
      auditLog: [],
      lastUpdated: new Date().toISOString()
    };
    
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataPath, { recursive: true });
      await fs.mkdir(this.backupPath, { recursive: true });

      // Load existing data or create new
      try {
        const existingData = await fs.readFile(this.dataFile, 'utf8');
        this.data = { ...this.data, ...JSON.parse(existingData) };
        console.log('✅ Database loaded successfully');
      } catch (error) {
        console.log('📝 Creating new database...');
        await this.saveData();
      }
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  async saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
      
      // Create backup
      const backupFile = path.join(this.backupPath, `backup-${Date.now()}.json`);
      await fs.writeFile(backupFile, JSON.stringify(this.data, null, 2));
      
      // Keep only last 10 backups
      await this.cleanupBackups();
    } catch (error) {
      console.error('❌ Failed to save data:', error);
      throw error;
    }
  }

  async cleanupBackups() {
    try {
      const files = await fs.readdir(this.backupPath);
      const backupFiles = files
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupPath, file),
          time: parseInt(file.replace('backup-', '').replace('.json', ''))
        }))
        .sort((a, b) => b.time - a.time);

      // Remove old backups (keep only last 10)
      for (let i = 10; i < backupFiles.length; i++) {
        await fs.unlink(backupFiles[i].path);
      }
    } catch (error) {
      console.error('❌ Backup cleanup failed:', error);
    }
  }

  // Agreement Management
  async createAgreement(agreementData) {
    const agreement = {
      id: this.generateId(),
      ...agreementData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      blockchainTx: null,
      auditTrail: []
    };

    this.data.agreements.push(agreement);
    this.addAuditLog('agreement_created', agreement.id, agreementData);
    await this.saveData();
    
    return agreement;
  }

  async updateAgreement(id, updates) {
    const index = this.data.agreements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Agreement not found');

    this.data.agreements[index] = {
      ...this.data.agreements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addAuditLog('agreement_updated', id, updates);
    await this.saveData();
    
    return this.data.agreements[index];
  }

  async getAgreement(id) {
    return this.data.agreements.find(a => a.id === id);
  }

  async getAllAgreements() {
    return this.data.agreements;
  }

  async getAgreementsByStatus(status) {
    return this.data.agreements.filter(a => a.status === status);
  }

  async getAgreementsByParticipant(address) {
    return this.data.agreements.filter(a => 
      a.importer === address || a.exporter === address
    );
  }

  // ESG Metrics Management
  async updateESGMetrics(agreementId, metrics) {
    this.data.esgMetrics[agreementId] = {
      ...metrics,
      updatedAt: new Date().toISOString(),
      calculatedScore: this.calculateESGScore(metrics)
    };

    this.addAuditLog('esg_updated', agreementId, metrics);
    await this.saveData();
    
    return this.data.esgMetrics[agreementId];
  }

  async getESGMetrics(agreementId) {
    return this.data.esgMetrics[agreementId];
  }

  async getAllESGMetrics() {
    return this.data.esgMetrics;
  }

  // Compliance Management
  async createComplianceReport(reportData) {
    const report = {
      id: this.generateId(),
      ...reportData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.data.complianceReports.push(report);
    this.addAuditLog('compliance_report_created', report.id, reportData);
    await this.saveData();
    
    return report;
  }

  async updateComplianceReport(id, updates) {
    const index = this.data.complianceReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Compliance report not found');

    this.data.complianceReports[index] = {
      ...this.data.complianceReports[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addAuditLog('compliance_report_updated', id, updates);
    await this.saveData();
    
    return this.data.complianceReports[index];
  }

  async getComplianceReports() {
    return this.data.complianceReports;
  }

  // Participant Management
  async registerParticipant(address, participantData) {
    this.data.participants[address] = {
      address,
      ...participantData,
      registeredAt: new Date().toISOString(),
      reputationScore: 0,
      verificationStatus: 'pending'
    };

    this.addAuditLog('participant_registered', address, participantData);
    await this.saveData();
    
    return this.data.participants[address];
  }

  async updateParticipant(address, updates) {
    if (!this.data.participants[address]) {
      throw new Error('Participant not found');
    }

    this.data.participants[address] = {
      ...this.data.participants[address],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addAuditLog('participant_updated', address, updates);
    await this.saveData();
    
    return this.data.participants[address];
  }

  async getParticipant(address) {
    return this.data.participants[address];
  }

  async getAllParticipants() {
    return Object.values(this.data.participants);
  }

  // Document Management
  async storeDocument(agreementId, documentData) {
    const documentId = this.generateId();
    this.data.documents[documentId] = {
      id: documentId,
      agreementId,
      ...documentData,
      storedAt: new Date().toISOString(),
      hash: this.generateHash(documentData.content)
    };

    this.addAuditLog('document_stored', documentId, { agreementId, type: documentData.type });
    await this.saveData();
    
    return this.data.documents[documentId];
  }

  async getDocuments(agreementId) {
    return Object.values(this.data.documents).filter(d => d.agreementId === agreementId);
  }

  // AI Insights Management
  async storeAIInsight(insightData) {
    const insight = {
      id: this.generateId(),
      ...insightData,
      createdAt: new Date().toISOString()
    };

    this.data.aiInsights.push(insight);
    this.addAuditLog('ai_insight_created', insight.id, insightData);
    await this.saveData();
    
    return insight;
  }

  async getAIInsights(limit = 50) {
    return this.data.aiInsights
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Analytics
  async updateAnalytics(analyticsData) {
    this.data.analytics = {
      ...this.data.analytics,
      ...analyticsData,
      lastUpdated: new Date().toISOString()
    };

    await this.saveData();
    return this.data.analytics;
  }

  async getAnalytics() {
    return this.data.analytics;
  }

  // Audit Trail
  addAuditLog(action, entityId, data) {
    const logEntry = {
      id: this.generateId(),
      action,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      userId: data.userId || 'system'
    };

    this.data.auditLog.push(logEntry);
    
    // Keep only last 1000 audit entries
    if (this.data.auditLog.length > 1000) {
      this.data.auditLog = this.data.auditLog.slice(-1000);
    }
  }

  async getAuditLog(limit = 100) {
    return this.data.auditLog
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Utility Functions
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  calculateESGScore(metrics) {
    let score = 0;
    let totalFactors = 0;

    // Carbon Footprint (0-25 points)
    if (metrics.carbonFootprint) {
      const carbon = parseFloat(metrics.carbonFootprint);
      if (carbon <= 100) score += 25;
      else if (carbon <= 200) score += 20;
      else if (carbon <= 300) score += 15;
      else if (carbon <= 500) score += 10;
      else score += 5;
      totalFactors++;
    }

    // Water Usage (0-20 points)
    if (metrics.waterUsage) {
      const water = parseFloat(metrics.waterUsage);
      if (water <= 50) score += 20;
      else if (water <= 100) score += 15;
      else if (water <= 200) score += 10;
      else if (water <= 500) score += 5;
      else score += 2;
      totalFactors++;
    }

    // Waste Generated (0-15 points)
    if (metrics.wasteGenerated) {
      const waste = parseFloat(metrics.wasteGenerated);
      if (waste <= 10) score += 15;
      else if (waste <= 25) score += 12;
      else if (waste <= 50) score += 8;
      else if (waste <= 100) score += 4;
      else score += 1;
      totalFactors++;
    }

    // Renewable Energy (0-20 points)
    if (metrics.renewableEnergy) {
      const renewable = parseFloat(metrics.renewableEnergy);
      if (renewable >= 80) score += 20;
      else if (renewable >= 60) score += 15;
      else if (renewable >= 40) score += 10;
      else if (renewable >= 20) score += 5;
      else score += 2;
      totalFactors++;
    }

    // Labor Compliance (0-20 points)
    if (metrics.laborCompliance) {
      const labor = parseFloat(metrics.laborCompliance);
      if (labor >= 90) score += 20;
      else if (labor >= 80) score += 15;
      else if (labor >= 70) score += 10;
      else if (labor >= 60) score += 5;
      else score += 2;
      totalFactors++;
    }

    // Certifications bonus (0-10 points)
    if (metrics.certifications && metrics.certifications.trim()) {
      const certs = metrics.certifications.toLowerCase();
      let certScore = 0;
      if (certs.includes('iso 14001')) certScore += 3;
      if (certs.includes('iso 9001')) certScore += 2;
      if (certs.includes('fair trade')) certScore += 2;
      if (certs.includes('organic')) certScore += 2;
      if (certs.includes('fsc')) certScore += 1;
      score += Math.min(certScore, 10);
    }

    return totalFactors > 0 ? Math.round(score) : 0;
  }

  // Data Export/Import
  async exportData() {
    return {
      ...this.data,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async importData(data) {
    this.data = { ...this.data, ...data };
    await this.saveData();
    return { success: true, message: 'Data imported successfully' };
  }

  // Database Statistics
  async getDatabaseStats() {
    return {
      totalAgreements: this.data.agreements.length,
      totalParticipants: Object.keys(this.data.participants).length,
      totalDocuments: Object.keys(this.data.documents).length,
      totalAIInsights: this.data.aiInsights.length,
      totalAuditLogs: this.data.auditLog.length,
      lastUpdated: this.data.lastUpdated,
      databaseSize: JSON.stringify(this.data).length
    };
  }
}

module.exports = TradeDatabase; 