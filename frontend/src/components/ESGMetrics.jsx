import { useState, useEffect } from 'react';
import { useContractWrite } from "@thirdweb-dev/react";

function ESGMetrics({ contract, agreementId, isAuditor, initialData = null, onChange = null, isCreateMode = false }) {
  const [formData, setFormData] = useState({
    carbonFootprint: '',
    waterUsage: '',
    wasteGenerated: '',
    renewableEnergy: '',
    laborCompliance: '',
    certifications: ''
  });

  const [complianceScore, setComplianceScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutateAsync: updateESGMetrics, isLoading } = useContractWrite(contract, "updateESGMetrics");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Calculate score only when needed for display
  useEffect(() => {
    if (isCreateMode || isEditing) {
      const score = calculateComplianceScore();
      setComplianceScore(score);
    }
  }, [formData, isCreateMode, isEditing]);

  const calculateComplianceScore = () => {
    let score = 0;
    let totalFactors = 0;

    // Carbon Footprint (0-25 points)
    if (formData.carbonFootprint) {
      const carbon = parseFloat(formData.carbonFootprint);
      if (carbon <= 100) score += 25;
      else if (carbon <= 200) score += 20;
      else if (carbon <= 300) score += 15;
      else if (carbon <= 500) score += 10;
      else score += 5;
      totalFactors++;
    }

    // Water Usage (0-20 points)
    if (formData.waterUsage) {
      const water = parseFloat(formData.waterUsage);
      if (water <= 50) score += 20;
      else if (water <= 100) score += 15;
      else if (water <= 200) score += 10;
      else if (water <= 500) score += 5;
      else score += 2;
      totalFactors++;
    }

    // Waste Generated (0-15 points)
    if (formData.wasteGenerated) {
      const waste = parseFloat(formData.wasteGenerated);
      if (waste <= 10) score += 15;
      else if (waste <= 25) score += 12;
      else if (waste <= 50) score += 8;
      else if (waste <= 100) score += 4;
      else score += 1;
      totalFactors++;
    }

    // Renewable Energy (0-20 points)
    if (formData.renewableEnergy) {
      const renewable = parseFloat(formData.renewableEnergy);
      if (renewable >= 80) score += 20;
      else if (renewable >= 60) score += 15;
      else if (renewable >= 40) score += 10;
      else if (renewable >= 20) score += 5;
      else score += 2;
      totalFactors++;
    }

    // Labor Compliance (0-20 points)
    if (formData.laborCompliance) {
      const labor = parseFloat(formData.laborCompliance);
      if (labor >= 90) score += 20;
      else if (labor >= 80) score += 15;
      else if (labor >= 70) score += 10;
      else if (labor >= 60) score += 5;
      else score += 2;
      totalFactors++;
    }

    // Certifications bonus (0-10 points)
    if (formData.certifications && formData.certifications.trim()) {
      const certs = formData.certifications.toLowerCase();
      let certScore = 0;
      if (certs.includes('iso 14001')) certScore += 3;
      if (certs.includes('iso 9001')) certScore += 2;
      if (certs.includes('fair trade')) certScore += 2;
      if (certs.includes('organic')) certScore += 2;
      if (certs.includes('fsc')) certScore += 1;
      score += Math.min(certScore, 10);
    }

    const finalScore = totalFactors > 0 ? Math.round(score) : 0;
    setComplianceScore(finalScore);
    return finalScore;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Simply pass the updated data to parent without complex calculations
    if (isCreateMode && onChange) {
      onChange(newFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreementId) return;

    try {
      setLoading(true);
      await updateESGMetrics({
        args: [
          agreementId,
          formData.carbonFootprint || 0,
          formData.waterUsage || 0,
          formData.wasteGenerated || 0,
          formData.renewableEnergy || 0,
          formData.laborCompliance || 0,
          formData.certifications || ''
        ]
      });
      
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error('Failed to update ESG metrics:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="esg-metrics">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">ESG Metrics <span className="text-red-500">*</span></h3>
        {isAuditor && !isCreateMode && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      {/* Compliance Score Display */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-700">Overall ESG Score</h4>
            <p className="text-sm text-gray-500">Based on environmental, social, and governance factors</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${getScoreColor(complianceScore)}`}>
            <div className="text-2xl font-bold">{complianceScore}</div>
            <div className="text-sm font-medium">{getScoreLabel(complianceScore)}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>0</span>
            <span>100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                complianceScore >= 80 ? 'bg-green-500' : 
                complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${complianceScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="carbonFootprint" className="block text-sm font-medium text-gray-700 mb-1">
              Carbon Footprint (MT CO2)
            </label>
            <input
              type="number"
              id="carbonFootprint"
              name="carbonFootprint"
              value={formData.carbonFootprint}
              onChange={handleChange}
              className="input"
              placeholder="0"
              min="0"
              disabled={!isEditing && !isCreateMode}
            />
            <p className="text-xs text-gray-500 mt-1">Lower values are better</p>
          </div>

          <div>
            <label htmlFor="waterUsage" className="block text-sm font-medium text-gray-700 mb-1">
              Water Usage (m³)
            </label>
            <input
              type="number"
              id="waterUsage"
              name="waterUsage"
              value={formData.waterUsage}
              onChange={handleChange}
              className="input"
              placeholder="0"
              min="0"
              disabled={!isEditing && !isCreateMode}
            />
            <p className="text-xs text-gray-500 mt-1">Lower values are better</p>
          </div>

          <div>
            <label htmlFor="wasteGenerated" className="block text-sm font-medium text-gray-700 mb-1">
              Waste Generated (kg)
            </label>
            <input
              type="number"
              id="wasteGenerated"
              name="wasteGenerated"
              value={formData.wasteGenerated}
              onChange={handleChange}
              className="input"
              placeholder="0"
              min="0"
              disabled={!isEditing && !isCreateMode}
            />
            <p className="text-xs text-gray-500 mt-1">Lower values are better</p>
          </div>

          <div>
            <label htmlFor="renewableEnergy" className="block text-sm font-medium text-gray-700 mb-1">
              Renewable Energy (%)
            </label>
            <input
              type="number"
              id="renewableEnergy"
              name="renewableEnergy"
              value={formData.renewableEnergy}
              onChange={handleChange}
              className="input"
              placeholder="0"
              min="0"
              max="100"
              disabled={!isEditing && !isCreateMode}
            />
            <p className="text-xs text-gray-500 mt-1">Higher values are better</p>
          </div>

          <div>
            <label htmlFor="laborCompliance" className="block text-sm font-medium text-gray-700 mb-1">
              Labor Compliance Score (%)
            </label>
            <input
              type="number"
              id="laborCompliance"
              name="laborCompliance"
              value={formData.laborCompliance}
              onChange={handleChange}
              className="input"
              placeholder="0"
              min="0"
              max="100"
              disabled={!isEditing && !isCreateMode}
            />
            <p className="text-xs text-gray-500 mt-1">Higher values are better</p>
          </div>

          <div>
            <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
              Certifications
            </label>
            <input
              type="text"
              id="certifications"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              className="input"
              placeholder="ISO 14001, Fair Trade, etc."
              disabled={!isEditing && !isCreateMode}
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list</p>
          </div>
        </div>

        {/* ESG Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">ESG Guidelines for Indian Trade</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h5 className="font-medium">Environmental:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimize carbon footprint</li>
                <li>Reduce water consumption</li>
                <li>Implement waste reduction</li>
                <li>Use renewable energy sources</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium">Social:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Fair labor practices</li>
                <li>Safe working conditions</li>
                <li>Community development</li>
                <li>Diversity and inclusion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button for Auditors */}
        {isAuditor && isEditing && !isCreateMode && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update ESG Metrics
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ESGMetrics;