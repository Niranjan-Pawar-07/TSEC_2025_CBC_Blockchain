import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

// Mock WTO compliance rules
const WTO_RULES = {
  maxValue: ethers.utils.parseEther("100"), // Max 100 ETH per trade
  restrictedGoods: [
    'weapons',
    'drugs',
    'endangered species',
    'nuclear materials',
    'hazardous waste'
  ],
  minDescriptionLength: 50 // Minimum characters for goods description
};

function WTOCompliance({ amount, description, onValidation }) {
  const [validationResults, setValidationResults] = useState(null);
  const lastValidationCall = useRef(null);

  const validateTrade = () => {
    const results = {
      passed: true,
      issues: []
    };

    try {
      // Check trade value
      if (ethers.BigNumber.from(amount).gt(WTO_RULES.maxValue)) {
        results.passed = false;
        results.issues.push('Trade value exceeds WTO limit of 100 ETH');
      }

      // Check description length
      if (description.length < WTO_RULES.minDescriptionLength) {
        results.passed = false;
        results.issues.push('Goods description must be more detailed (min 50 characters)');
      }

      // Check for restricted goods
      const descriptionLower = description.toLowerCase();
      const foundRestrictedGoods = WTO_RULES.restrictedGoods.filter(good => 
        descriptionLower.includes(good)
      );

      if (foundRestrictedGoods.length > 0) {
        results.passed = false;
        results.issues.push(`Found restricted goods: ${foundRestrictedGoods.join(', ')}`);
      }
    } catch (err) {
      results.passed = false;
      results.issues.push('Invalid trade value');
    }

    setValidationResults(results);
    
    // Prevent duplicate onValidation calls with the same result
    if (onValidation && lastValidationCall.current !== results.passed) {
      lastValidationCall.current = results.passed;
      onValidation(results.passed);
    }
    return results.passed;
  };

  // Only validate when component mounts or when explicitly called
  useEffect(() => {
    if (amount && description) {
      validateTrade();
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-700">WTO Compliance Check</h4>
        <button
          type="button"
          onClick={validateTrade}
          className="btn btn-secondary text-sm"
        >
          Validate Trade
        </button>
      </div>
      
      <div className={`p-3 rounded-lg ${
        validationResults?.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        <div className="font-medium">
          {validationResults?.passed ? '✓ Trade complies with WTO rules' : '✗ Trade has compliance issues'}
        </div>
        {validationResults && !validationResults.passed && validationResults.issues.length > 0 && (
          <ul className="mt-2 text-sm list-disc list-inside">
            {validationResults.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium">WTO Compliance Rules:</p>
        <ul className="mt-1 list-disc list-inside">
          <li>Maximum trade value: 100 ETH</li>
          <li>Detailed goods description required (min 50 characters)</li>
          <li>No restricted goods allowed</li>
        </ul>
      </div>
    </div>
  );
}

export default WTOCompliance;