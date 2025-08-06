import { useState, useEffect } from 'react';
import { useContractRead, useAddress } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, formatAddress, getStatusText } from '../utils/contract';

function Dashboard({ contract, address }) {
  const [stats, setStats] = useState({
    totalAgreements: 0,
    activeAgreements: 0,
    completedAgreements: 0,
    totalValue: 0,
    averageESGScore: 0,
    complianceRate: 0
  });
  const [recentAgreements, setRecentAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contract reads
  const { data: agreementCount } = useContractRead(contract, "getAgreementCount");
  const { data: authorizedAuditor } = useContractRead(contract, "authorizedAuditor");

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!contract || !address) return;

      try {
        setLoading(true);
        const count = agreementCount ? agreementCount.toNumber() : 0;
        const agreements = [];
        let totalValue = 0;
        let activeCount = 0;
        let completedCount = 0;
        let totalESGScore = 0;
        let compliantCount = 0;

        // Load all agreements
        for (let i = 0; i < count; i++) {
          try {
            const agreement = await contract.call("agreements", [i]);
            const agreementData = {
              id: agreement.id.toString(),
              importer: agreement.importer,
              exporter: agreement.exporter,
              goodsDescription: agreement.goodsDescription,
              amount: ethers.utils.formatEther(agreement.amount),
              status: agreement.status,
              createdAt: new Date(agreement.createdAt.toNumber() * 1000),
              esgMetrics: agreement.esgMetrics,
              wtoCompliance: agreement.wtoCompliance
            };

            agreements.push(agreementData);
            totalValue += parseFloat(agreementData.amount);

            if (agreement.status === 1) activeCount++;
            if (agreement.status === 2) completedCount++;
            if (agreement.esgMetrics.complianceScore.toNumber() > 0) {
              totalESGScore += agreement.esgMetrics.complianceScore.toNumber();
            }
            if (agreement.wtoCompliance.isCompliant) compliantCount++;
          } catch (error) {
            console.error(`Error loading agreement ${i}:`, error);
          }
        }

        // Calculate statistics
        const totalAgreements = agreements.length;
        const averageESGScore = totalAgreements > 0 ? Math.round(totalESGScore / totalAgreements) : 0;
        const complianceRate = totalAgreements > 0 ? Math.round((compliantCount / totalAgreements) * 100) : 0;

        setStats({
          totalAgreements,
          activeAgreements: activeCount,
          completedAgreements: completedCount,
          totalValue: totalValue.toFixed(2),
          averageESGScore,
          complianceRate
        });

        // Get recent agreements (last 5)
        const recent = agreements
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5);
        setRecentAgreements(recent);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [contract, address, agreementCount]);

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      0: 'badge-warning',
      1: 'badge-info',
      2: 'badge-success',
      3: 'badge-success',
      4: 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const getESGScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Trade Management System
        </h1>
        <p className="text-white/80 text-lg">
          Streamlining cross-border transactions with blockchain technology
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>{stats.totalAgreements}</h3>
          <p>Total Agreements</p>
        </div>
        <div className="stats-card">
          <h3>{stats.activeAgreements}</h3>
          <p>Active Trades</p>
        </div>
        <div className="stats-card">
          <h3>₹{stats.totalValue}M</h3>
          <p>Total Trade Value</p>
        </div>
        <div className="stats-card">
          <h3>{stats.averageESGScore}%</h3>
          <p>Average ESG Score</p>
        </div>
        <div className="stats-card">
          <h3>{stats.complianceRate}%</h3>
          <p>WTO Compliance Rate</p>
        </div>
        <div className="stats-card">
          <h3>{stats.completedAgreements}</h3>
          <p>Completed Trades</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Agreement
          </button>
          <button className="btn btn-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Documents
          </button>
          <button className="btn btn-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            ESG Analytics
          </button>
        </div>
      </div>

      {/* Recent Agreements */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Trade Agreements</h2>
        {recentAgreements.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No agreements found</p>
            <p className="text-sm">Create your first trade agreement to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAgreements.map((agreement) => (
              <div key={agreement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Agreement #{agreement.id}</h3>
                    <p className="text-gray-600 text-sm">{agreement.goodsDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusBadgeClass(agreement.status)}`}>
                      {getStatusText(agreement.status)}
                    </span>
                    {agreement.esgMetrics.complianceScore.toNumber() > 0 && (
                      <div className={`esg-score ${getESGScoreClass(agreement.esgMetrics.complianceScore.toNumber())}`}>
                        {agreement.esgMetrics.complianceScore.toNumber()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Importer:</span>
                    <p className="text-gray-600">{formatAddress(agreement.importer)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Exporter:</span>
                    <p className="text-gray-600">{formatAddress(agreement.exporter)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Value:</span>
                    <p className="text-gray-600">₹{parseFloat(agreement.amount).toFixed(2)}M</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: {agreement.createdAt.toLocaleDateString()}</span>
                    <span>WTO Compliant: {agreement.wtoCompliance.isCompliant ? '✅' : '❌'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Features */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Smart Contracts</h3>
            <p className="text-sm text-gray-600">Automated trade agreements with WTO compliance</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">ESG Tracking</h3>
            <p className="text-sm text-gray-600">Real-time environmental and social metrics</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Secure Escrow</h3>
            <p className="text-sm text-gray-600">Multi-signature blockchain escrow system</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">AI Agent</h3>
            <p className="text-sm text-gray-600">Intelligent trade flow management</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 
