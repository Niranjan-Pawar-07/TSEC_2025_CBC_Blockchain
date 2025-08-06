import { useState, useEffect } from 'react';
import { useContractRead } from "@thirdweb-dev/react";
import { ethers } from 'ethers';

function TradeAnalytics({ contract, address }) {
  const [analytics, setAnalytics] = useState({
    tradeVolume: [],
    esgTrends: [],
    complianceRates: [],
    topProducts: [],
    countryStats: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const { data: agreementCount } = useContractRead(contract, "getAgreementCount");

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!contract || !address) return;

      try {
        setLoading(true);
        const count = agreementCount ? agreementCount.toNumber() : 0;
        const agreements = [];

        // Load all agreements
        for (let i = 0; i < count; i++) {
          try {
            const agreement = await contract.call("agreements", [i]);
            agreements.push({
              id: agreement.id.toString(),
              importer: agreement.importer,
              exporter: agreement.exporter,
              goodsDescription: agreement.goodsDescription,
              amount: ethers.utils.formatEther(agreement.amount),
              status: agreement.status,
              createdAt: new Date(agreement.createdAt.toNumber() * 1000),
              esgMetrics: agreement.esgMetrics,
              wtoCompliance: agreement.wtoCompliance
            });
          } catch (error) {
            console.error(`Error loading agreement ${i}:`, error);
          }
        }

        // Process analytics
        const processedData = processAnalyticsData(agreements);
        setAnalytics(processedData);

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [contract, address, agreementCount, timeRange]);

  const processAnalyticsData = (agreements) => {
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };

    const filteredAgreements = agreements.filter(agreement => 
      now - agreement.createdAt <= timeRangeMs[timeRange]
    );

    // Trade Volume by Date
    const tradeVolume = {};
    filteredAgreements.forEach(agreement => {
      const date = agreement.createdAt.toISOString().split('T')[0];
      tradeVolume[date] = (tradeVolume[date] || 0) + parseFloat(agreement.amount);
    });

    // ESG Trends
    const esgTrends = filteredAgreements
      .filter(agreement => agreement.esgMetrics.complianceScore.toNumber() > 0)
      .map(agreement => ({
        date: agreement.createdAt.toISOString().split('T')[0],
        score: agreement.esgMetrics.complianceScore.toNumber()
      }));

    // Compliance Rates
    const complianceRates = {
      compliant: filteredAgreements.filter(agreement => agreement.wtoCompliance.isCompliant).length,
      nonCompliant: filteredAgreements.filter(agreement => !agreement.wtoCompliance.isCompliant).length
    };

    // Top Products
    const productCounts = {};
    filteredAgreements.forEach(agreement => {
      const product = agreement.goodsDescription.split('|')[0].trim();
      productCounts[product] = (productCounts[product] || 0) + 1;
    });

    // Country Statistics
    const countryStats = {};
    filteredAgreements.forEach(agreement => {
      const description = agreement.goodsDescription;
      const originMatch = description.match(/Origin: ([^|]+)/);
      const destMatch = description.match(/Destination: ([^|]+)/);
      
      if (originMatch) {
        const origin = originMatch[1].trim();
        countryStats[origin] = countryStats[origin] || { imports: 0, exports: 0, value: 0 };
        countryStats[origin].exports += parseFloat(agreement.amount);
      }
      
      if (destMatch) {
        const dest = destMatch[1].trim();
        countryStats[dest] = countryStats[dest] || { imports: 0, exports: 0, value: 0 };
        countryStats[dest].imports += parseFloat(agreement.amount);
      }
    });

    return {
      tradeVolume: Object.entries(tradeVolume).map(([date, value]) => ({ date, value })),
      esgTrends,
      complianceRates,
      topProducts: Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([product, count]) => ({ product, count })),
      countryStats: Object.entries(countryStats)
        .map(([country, stats]) => ({
          country,
          totalValue: stats.imports + stats.exports,
          imports: stats.imports,
          exports: stats.exports
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10)
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value * 1000000); // Convert to millions
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Trade Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your trade activities</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input w-auto"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stats-card">
          <h3>{analytics.tradeVolume.length}</h3>
          <p>Active Trades</p>
        </div>
        <div className="stats-card">
          <h3>{formatCurrency(analytics.tradeVolume.reduce((sum, item) => sum + item.value, 0))}</h3>
          <p>Total Volume</p>
        </div>
        <div className="stats-card">
          <h3>{analytics.complianceRates.compliant}</h3>
          <p>Compliant Trades</p>
        </div>
        <div className="stats-card">
          <h3>{analytics.esgTrends.length > 0 ? 
            Math.round(analytics.esgTrends.reduce((sum, item) => sum + item.score, 0) / analytics.esgTrends.length) : 
            0}%</h3>
          <p>Avg ESG Score</p>
        </div>
      </div>

      {/* Trade Volume Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Trade Volume Over Time</h3>
        {analytics.tradeVolume.length > 0 ? (
          <div className="space-y-2">
            {analytics.tradeVolume.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-600">{item.date}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(item.value / Math.max(...analytics.tradeVolume.map(v => v.value))) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="w-20 text-sm font-medium text-right">
                  {formatCurrency(item.value)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No trade data available for the selected period</p>
          </div>
        )}
      </div>

      {/* ESG Trends */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">ESG Score Trends</h3>
        {analytics.esgTrends.length > 0 ? (
          <div className="space-y-2">
            {analytics.esgTrends.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-600">{item.date}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-300 ${
                      item.score >= 80 ? 'bg-green-500' : 
                      item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm font-medium text-right">{item.score}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No ESG data available</p>
          </div>
        )}
      </div>

      {/* Compliance Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">WTO Compliance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compliant</span>
              <span className="font-semibold text-green-600">
                {analytics.complianceRates.compliant}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Non-Compliant</span>
              <span className="font-semibold text-red-600">
                {analytics.complianceRates.nonCompliant}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${(analytics.complianceRates.compliant / 
                    (analytics.complianceRates.compliant + analytics.complianceRates.nonCompliant)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          {analytics.topProducts.length > 0 ? (
            <div className="space-y-3">
              {analytics.topProducts.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{item.product}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p>No product data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Country Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Trade by Country</h3>
        {analytics.countryStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Country</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Total Value</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Imports</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Exports</th>
                </tr>
              </thead>
              <tbody>
                {analytics.countryStats.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-sm font-medium">{item.country}</td>
                    <td className="py-2 text-sm text-right">{formatCurrency(item.totalValue)}</td>
                    <td className="py-2 text-sm text-right text-green-600">{formatCurrency(item.imports)}</td>
                    <td className="py-2 text-sm text-right text-blue-600">{formatCurrency(item.exports)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No country data available</p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Performance Summary</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {analytics.tradeVolume.length} active trades in the last {timeRange}</li>
              <li>• Average ESG score: {analytics.esgTrends.length > 0 ? 
                Math.round(analytics.esgTrends.reduce((sum, item) => sum + item.score, 0) / analytics.esgTrends.length) : 
                0}%</li>
              <li>• Compliance rate: {analytics.complianceRates.compliant + analytics.complianceRates.nonCompliant > 0 ? 
                Math.round((analytics.complianceRates.compliant / 
                  (analytics.complianceRates.compliant + analytics.complianceRates.nonCompliant)) * 100) : 
                0}%</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Recommendations</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Focus on ESG compliance for better trade opportunities</li>
              <li>• Consider expanding to high-compliance markets</li>
              <li>• Monitor WTO regulations for new trade agreements</li>
              <li>• Implement sustainable practices for competitive advantage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradeAnalytics; 