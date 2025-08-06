import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import ESGMetrics from './ESGMetrics';

function AgreementList({ contract, address }) {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuditor, setIsAuditor] = useState(false);

  // Contract reads
  const { data: agreementCount } = useContractRead(contract, "getAgreementCount");
  const { data: authorizedAuditor } = useContractRead(contract, "authorizedAuditor");
  
  // Contract writes
  const { mutateAsync: acceptAgreement, isLoading: acceptLoading } = useContractWrite(contract, "acceptAgreement");
  const { mutateAsync: completeAgreement, isLoading: completeLoading } = useContractWrite(contract, "completeAgreement");

  // Status mapping for display
  const statusMap = {
    0: { text: 'Draft', class: 'bg-yellow-100 text-yellow-800' },
    1: { text: 'Accepted', class: 'bg-blue-100 text-blue-800' },
    2: { text: 'Completed', class: 'bg-green-100 text-green-800' }
  };

  // Check if current user is auditor
  useEffect(() => {
    if (authorizedAuditor && address) {
      setIsAuditor(authorizedAuditor.toLowerCase() === address.toLowerCase());
    }
  }, [authorizedAuditor, address]);

  // Load agreements
  useEffect(() => {
    const loadAgreements = async () => {
      try {
        setLoading(true);
        const count = agreementCount ? agreementCount.toNumber() : 0;
        const agreementPromises = [];

        // Get all agreements
        for (let i = 0; i < count; i++) {
          const agreement = await contract.call("getAgreement", [i]);
          if (agreement.importer.toLowerCase() === address.toLowerCase() ||
              agreement.exporter.toLowerCase() === address.toLowerCase() ||
              isAuditor) {
            agreementPromises.push(agreement);
          }
        }

        const results = await Promise.all(agreementPromises);
        setAgreements(results);
      } catch (err) {
        console.error('Failed to load agreements:', err);
      } finally {
        setLoading(false);
      }
    };

    if (contract && address) {
      loadAgreements();
    }
  }, [contract, address, agreementCount, isAuditor]);

  // Handle agreement actions
  const handleAccept = async (id) => {
    try {
      await acceptAgreement({ args: [id] });
      // Refresh agreements list
      window.location.reload();
    } catch (err) {
      console.error('Failed to accept agreement:', err);
      alert(err.message || 'Failed to accept agreement');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeAgreement({ args: [id] });
      // Refresh agreements list
      window.location.reload();
    } catch (err) {
      console.error('Failed to complete agreement:', err);
      alert(err.message || 'Failed to complete agreement');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!agreements.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No agreements found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agreements.map((agreement, index) => (
        <div key={agreement.id.toString()} className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">Agreement #{agreement.id.toString()}</h3>
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${statusMap[agreement.status].class}`}>
                {statusMap[agreement.status].text}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(agreement.createdAt.toNumber() * 1000).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Importer:</span> {agreement.importer}
            </div>
            <div>
              <span className="font-medium">Exporter:</span> {agreement.exporter}
            </div>
            <div>
              <span className="font-medium">Amount:</span> {ethers.utils.formatEther(agreement.amount)} ETH
            </div>
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-gray-600">{agreement.goodsDescription}</p>
            </div>
            
            {/* ESG Metrics Display */}
            {agreement.esgMetrics.lastUpdated.toNumber() > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">ESG Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Carbon Footprint:</span>
                    <div>{agreement.esgMetrics.carbonFootprint.toString()} MT</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Compliance Score:</span>
                    <div>{agreement.esgMetrics.complianceScore.toString()}/100</div>
                  </div>
                  <div className="col-span-2 text-xs text-gray-500">
                    Last updated: {new Date(agreement.esgMetrics.lastUpdated.toNumber() * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* ESG Metrics Update Form for Auditor */}
            {isAuditor && (
              <ESGMetrics
                contract={contract}
                agreementId={agreement.id}
                isAuditor={isAuditor}
              />
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex space-x-2">
              {agreement.status === 0 && 
               agreement.exporter.toLowerCase() === address.toLowerCase() && (
                <button
                  onClick={() => handleAccept(agreement.id)}
                  disabled={acceptLoading}
                  className="btn btn-primary"
                >
                  {acceptLoading ? 'Accepting...' : 'Accept Agreement'}
                </button>
              )}
              
              {agreement.status === 1 && 
               agreement.importer.toLowerCase() === address.toLowerCase() && (
                <button
                  onClick={() => handleComplete(agreement.id)}
                  disabled={completeLoading}
                  className="btn btn-primary"
                >
                  {completeLoading ? 'Completing...' : 'Complete Agreement'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AgreementList;