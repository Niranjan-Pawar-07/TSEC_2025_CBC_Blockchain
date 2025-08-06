import { useState } from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";
import { useContract, useContractRead, useAddress } from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './utils/contract';
import Dashboard from './components/Dashboard';
import CreateAgreement from './components/CreateAgreement';
import AgreementList from './components/AgreementList';
import TradeAnalytics from './components/TradeAnalytics';

function App() {
  const address = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const { data: agreementCount, isLoading: countLoading } = useContractRead(contract, "getAgreementCount");
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { id: 'create', name: 'Create Agreement', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { id: 'agreements', name: 'My Agreements', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'analytics', name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard contract={contract} address={address} />;
      case 'create':
        return <CreateAgreement contract={contract} address={address} />;
      case 'agreements':
        return <AgreementList contract={contract} address={address} />;
      case 'analytics':
        return <TradeAnalytics contract={contract} address={address} />;
      default:
        return <Dashboard contract={contract} address={address} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-800">
                  Indian Trade Hub
                </h1>
              </div>
              
              {address && (
                <div className="hidden md:flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {address && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connected to Sepolia</span>
                </div>
              )}
              <ConnectWallet />
            </div>
          </div>

          {/* Mobile Navigation */}
          {address && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!address ? (
          <div className="card text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Indian Trade Hub</h2>
            <p className="text-gray-600 mb-6">
              Streamline your cross-border trade operations with blockchain technology, 
              automated compliance, and ESG tracking for Indian businesses.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Smart Contracts</h3>
                  <p className="text-blue-700">Automated trade agreements with WTO compliance</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">ESG Tracking</h3>
                  <p className="text-green-700">Real-time environmental and social metrics</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">AI Agent</h3>
                  <p className="text-purple-700">Intelligent trade flow management</p>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-2 text-sm text-gray-500">
              <p>To get started, please:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Install MetaMask or any Web3 wallet</li>
                <li>Connect to Sepolia Testnet</li>
                <li>Add some test ETH to your wallet</li>
                <li>Connect your wallet to begin trading</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 capitalize">
                  {activeTab === 'dashboard' ? 'Dashboard' : 
                   activeTab === 'create' ? 'Create New Agreement' :
                   activeTab === 'agreements' ? 'My Trade Agreements' :
                   activeTab === 'analytics' ? 'Trade Analytics' : 'Dashboard'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'dashboard' ? 'Overview of your trade activities and system status' :
                   activeTab === 'create' ? 'Create a new cross-border trade agreement with compliance validation' :
                   activeTab === 'agreements' ? 'Manage and track your existing trade agreements' :
                   activeTab === 'analytics' ? 'Comprehensive analytics and insights for your trade operations' : ''}
                </p>
              </div>
              
              {activeTab === 'agreements' && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Agreements</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {!countLoading && (agreementCount?.toString() || '0')}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            {contract ? (
              renderContent()
            ) : (
              <div className="card text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading smart contract...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Indian Trade Hub</h3>
              <p className="text-gray-600 text-sm">
                Empowering Indian businesses with blockchain-powered trade solutions for 
                fast, compliant, and sustainable cross-border transactions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Smart Contract Automation</li>
                <li>WTO Compliance Validation</li>
                <li>ESG Metrics Tracking</li>
                <li>AI-Powered Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community Forum</li>
                <li>Contact Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Compliance</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Indian Trade Hub. Built with blockchain technology for secure and transparent trade.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;