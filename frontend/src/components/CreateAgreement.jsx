import { useState } from 'react';
import { useContractWrite } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import WTOCompliance from './WTOCompliance';
import ESGMetrics from './ESGMetrics';

function CreateAgreement({ contract, address }) {
  const [formData, setFormData] = useState({
    exporter: '',
    goodsDescription: '',
    amount: '',
    quantity: '',
    unit: 'pieces',
    originCountry: 'India',
    destinationCountry: '',
    incoterms: 'FOB',
    currency: 'USD',
    deliveryDate: '',
    paymentTerms: '30 days',
    specialRequirements: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [wtoValidated, setWtoValidated] = useState(false);
  const [esgData, setEsgData] = useState({
    carbonFootprint: '',
    waterUsage: '',
    wasteGenerated: '',
    renewableEnergy: '',
    laborCompliance: '',
    certifications: ''
  });

  const { mutateAsync: createAgreement, isLoading } = useContractWrite(contract, "createAgreement");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate input
      if (!ethers.utils.isAddress(formData.exporter)) {
        throw new Error('Invalid exporter address');
      }
      if (!formData.goodsDescription.trim()) {
        throw new Error('Goods description is required');
      }
      if (isNaN(formData.amount) || formData.amount <= 0) {
        throw new Error('Invalid amount');
      }
      if (!wtoValidated) {
        throw new Error('WTO compliance validation is required');
      }

      // Validate ESG data is filled
      const hasESGData = esgData.carbonFootprint || esgData.waterUsage || esgData.wasteGenerated || 
                        esgData.renewableEnergy || esgData.laborCompliance || esgData.certifications;
      if (!hasESGData) {
        throw new Error('ESG metrics are required. Please fill in at least one ESG metric.');
      }

      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(formData.amount);

      // Create agreement with enhanced data
      const enhancedDescription = `${formData.goodsDescription} | Qty: ${formData.quantity} ${formData.unit} | Origin: ${formData.originCountry} | Incoterms: ${formData.incoterms} | Payment: ${formData.paymentTerms}`;

      const data = await createAgreement({ 
        args: [formData.exporter, enhancedDescription],
        overrides: {
          value: amountInWei
        }
      });
      console.info("Contract call success", data);

      // Reset form
      setFormData({
        exporter: '',
        goodsDescription: '',
        amount: '',
        quantity: '',
        unit: 'pieces',
        originCountry: 'India',
        destinationCountry: '',
        incoterms: 'FOB',
        currency: 'USD',
        deliveryDate: '',
        paymentTerms: '30 days',
        specialRequirements: ''
      });
      setDocuments([]);
      setEsgData({
        carbonFootprint: '',
        waterUsage: '',
        wasteGenerated: '',
        renewableEnergy: '',
        laborCompliance: '',
        certifications: ''
      });
      setWtoValidated(false);
      setActiveStep(1);
    } catch (err) {
      console.error("Contract call failure", err);
      alert(err.message || 'Failed to create agreement');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Don't automatically reset WTO validation - let user validate manually
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleWTOValidation = (passed) => {
    setWtoValidated(passed);
  };

  const handleESGChange = (data) => {
    setEsgData(data);
  };

  const hasValidESGData = () => {
    return esgData.carbonFootprint || esgData.waterUsage || esgData.wasteGenerated || 
           esgData.renewableEnergy || esgData.laborCompliance || esgData.certifications;
  };

  const nextStep = () => {
    if (activeStep < 3) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Details', description: 'Trade agreement information' },
    { number: 2, title: 'Compliance', description: 'WTO and ESG validation' },
    { number: 3, title: 'Documents', description: 'Upload supporting documents' }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              activeStep >= step.number 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              {activeStep > step.number ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                activeStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Details */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="exporter" className="block text-sm font-medium text-gray-700 mb-1">
                  Exporter Address *
                </label>
                <input
                  type="text"
                  id="exporter"
                  name="exporter"
                  value={formData.exporter}
                  onChange={handleChange}
                  className="input"
                  placeholder="0x..."
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (ETH) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.0"
                  step="0.000000000000000001"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="goodsDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Goods Description *
              </label>
              <textarea
                id="goodsDescription"
                name="goodsDescription"
                value={formData.goodsDescription}
                onChange={handleChange}
                rows="3"
                className="input"
                placeholder="Describe the goods being traded..."
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input"
                  placeholder="100"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="tons">Tons</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="originCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  Origin Country
                </label>
                <input
                  type="text"
                  id="originCountry"
                  name="originCountry"
                  value={formData.originCountry}
                  onChange={handleChange}
                  className="input"
                  placeholder="India"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="destinationCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Country
                </label>
                <input
                  type="text"
                  id="destinationCountry"
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  className="input"
                  placeholder="United States"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="incoterms" className="block text-sm font-medium text-gray-700 mb-1">
                  Incoterms
                </label>
                <select
                  id="incoterms"
                  name="incoterms"
                  value={formData.incoterms}
                  onChange={handleChange}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="FOB">FOB (Free On Board)</option>
                  <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                  <option value="LC">Letter of Credit</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              <textarea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                rows="2"
                className="input"
                placeholder="Any special requirements or conditions..."
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Step 2: Compliance */}
        {activeStep === 2 && (
          <div className="space-y-6">
            {/* WTO Compliance Check */}
            {formData.amount && formData.goodsDescription && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">WTO Compliance Validation</h3>
                <WTOCompliance
                  amount={ethers.utils.parseEther(formData.amount || "0")}
                  description={formData.goodsDescription}
                  onValidation={handleWTOValidation}
                />
              </div>
            )}

            {/* ESG Metrics */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">ESG Metrics (Required)</h3>
              <ESGMetrics
                contract={contract}
                agreementId={null}
                isAuditor={false}
                initialData={esgData}
                onChange={handleESGChange}
                isCreateMode={true}
              />
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents
              </label>
              <div className="document-upload">
                <input
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700">Upload Documents</p>
                  <p className="text-sm text-gray-500">Drag and drop or click to select files</p>
                </label>
              </div>
            </div>

            {/* Document List */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Uploaded Documents:</h4>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={activeStep === 1}
            className="btn btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!formData.exporter || !formData.goodsDescription || !formData.amount || (activeStep === 2 && !hasValidESGData())}
              className="btn btn-primary"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !wtoValidated || !hasValidESGData()}
              className={`btn ${wtoValidated && hasValidESGData() ? 'btn-success' : 'btn-secondary opacity-50'}`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Agreement...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Agreement
                </>
              )}
            </button>
          )}
        </div>

        {(!wtoValidated || !hasValidESGData()) && activeStep === 3 && (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Please complete WTO compliance validation and fill in ESG metrics before creating the agreement
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateAgreement;