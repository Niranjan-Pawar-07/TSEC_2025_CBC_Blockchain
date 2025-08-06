import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useContract, useContractRead } from "@thirdweb-dev/react";

// Your contract address
export const CONTRACT_ADDRESS = "0x2d37397282f75A51181234e84fa4E9120936DF3a";

// Contract ABI
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "AgreementAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "AgreementCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "importer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "exporter",
        "type": "address"
      }
    ],
    "name": "AgreementCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "docType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "hash",
        "type": "string"
      }
    ],
    "name": "DocumentAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "complianceScore",
        "type": "uint256"
      }
    ],
    "name": "ESGMetricsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "participant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "did",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "enum TradeAgreement.Role",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "ParticipantRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isCompliant",
        "type": "bool"
      }
    ],
    "name": "WTOComplianceUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "acceptAgreement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "agreements",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "importer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "exporter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "goodsDescription",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "enum TradeAgreement.Status",
        "name": "status",
        "type": "uint8"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "carbonFootprint",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "waterUsage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "wasteGenerated",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "renewableEnergy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "laborCompliance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "complianceScore",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "certifications",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "lastUpdated",
            "type": "uint256"
          }
        ],
        "internalType": "struct TradeAgreement.ESGMetrics",
        "name": "esgMetrics",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bool",
            "name": "isCompliant",
            "type": "bool"
          },
          {
            "internalType": "string[]",
            "name": "regulations",
            "type": "string[]"
          },
          {
            "internalType": "uint256",
            "name": "tariffCode",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "originCertificate",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "lastValidated",
            "type": "uint256"
          }
        ],
        "internalType": "struct TradeAgreement.WTOCompliance",
        "name": "wtoCompliance",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "disputeResolutionDeadline",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "authorizedAuditor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "completeAgreement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_exporter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_goodsDescription",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "_wtoRegulations",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "_tariffCode",
        "type": "uint256"
      }
    ],
    "name": "createAgreement",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAgreementCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_participant",
        "type": "address"
      }
    ],
    "name": "getParticipantDetails",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "did",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      },
      {
        "internalType": "enum TradeAgreement.Role",
        "name": "role",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "reputationScore",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "participants",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "did",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      },
      {
        "internalType": "enum TradeAgreement.Role",
        "name": "role",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "reputationScore",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_did",
        "type": "bytes32"
      },
      {
        "internalType": "enum TradeAgreement.Role",
        "name": "_role",
        "type": "uint8"
      }
    ],
    "name": "registerParticipant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_carbonFootprint",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_waterUsage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_wasteGenerated",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_renewableEnergy",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_laborCompliance",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_certifications",
        "type": "string"
      }
    ],
    "name": "updateESGMetrics",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_isCompliant",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "_originCertificate",
        "type": "string"
      }
    ],
    "name": "updateWTOCompliance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_participant",
        "type": "address"
      }
    ],
    "name": "verifyParticipant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Helper function to get contract instance
export const useTradeAgreement = () => {
  return useContract(CONTRACT_ADDRESS, CONTRACT_ABI);
};

// Helper function to format agreement status
export const getStatusText = (status) => {
  const statusMap = {
    0: 'Draft',
    1: 'Pending Approvals',
    2: 'Active',
    3: 'Completed',
    4: 'Disputed'
  };
  return statusMap[status] || 'Unknown';
};

// Helper function to format role
export const getRoleText = (role) => {
  const roleMap = {
    0: 'None',
    1: 'Importer',
    2: 'Exporter',
    3: 'Auditor',
    4: 'WTO Validator'
  };
  return roleMap[role] || 'Unknown';
};

// Helper function to format timestamp
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Helper function to format address
export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to calculate ESG score color
export const getESGScoreColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};

// Helper function to format document type
export const getDocumentTypeText = (docType) => {
  const typeMap = {
    'ORIGIN': 'Certificate of Origin',
    'INVOICE': 'Commercial Invoice',
    'PACKING': 'Packing List',
    'ESG': 'ESG Certificate',
    'WTO': 'WTO Compliance Document'
  };
  return typeMap[docType] || docType;
};

// Helper function to get IPFS gateway URL
export const getIPFSUrl = (hash) => {
  return `https://ipfs.io/ipfs/${hash}`;
};