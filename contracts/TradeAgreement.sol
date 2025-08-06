// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TradeAgreement
 * @dev Smart contract for managing cross-border trade agreements with WTO compliance and ESG standards
 */
contract TradeAgreement {
    // Enum to track agreement status
    enum Status { Draft, PendingApprovals, Active, Completed, Disputed }
    
    // Enum for participant roles
    enum Role { None, Importer, Exporter, Auditor, WTOValidator }

    // Struct for participant identity
    struct ParticipantIdentity {
        bytes32 did;              // Decentralized identifier
        bool isVerified;          // Verification status
        Role role;               // Participant role
        uint256 reputationScore; // Reputation score (0-100)
    }

    // Enhanced ESG metrics
    struct ESGMetrics {
        uint256 carbonFootprint;     // Carbon footprint in metric tons
        uint256 waterUsage;          // Water usage in cubic meters
        uint256 wasteGenerated;      // Waste in metric tons
        uint256 renewableEnergy;     // Percentage of renewable energy used
        uint256 laborCompliance;     // Labor compliance score (0-100)
        uint256 complianceScore;     // Overall compliance score (0-100)
        string certifications;       // Comma-separated list of certifications
        uint256 lastUpdated;         // Timestamp of last update
    }

    // WTO compliance struct
    struct WTOCompliance {
        bool isCompliant;           // Overall compliance status
        string[] regulations;       // Applicable WTO regulations
        uint256 tariffCode;        // Harmonized System (HS) code
        string originCertificate;   // Certificate of origin
        uint256 lastValidated;      // Last validation timestamp
    }

    // Document struct
    struct Document {
        string hash;               // IPFS hash of the document
        string docType;            // Type of document
        uint256 timestamp;         // Upload timestamp
        bool isVerified;           // Verification status
    }

    // Main agreement struct
    struct Agreement {
        uint256 id;                // Unique identifier
        address importer;          // Address of importer
        address exporter;          // Address of exporter
        string goodsDescription;   // Description of goods
        uint256 amount;           // Amount in ETH
        Status status;            // Current status
        ESGMetrics esgMetrics;    // ESG metrics
        WTOCompliance wtoCompliance; // WTO compliance data
        Document[] documents;      // Associated documents
        uint256 createdAt;        // Creation timestamp
        uint256 completedAt;      // Completion timestamp
        mapping(address => bool) approvals; // Multi-sig approvals
        uint256 disputeResolutionDeadline; // Deadline for dispute resolution
    }

    // State variables
    uint256 private agreementCounter;
    mapping(uint256 => Agreement) public agreements;
    mapping(address => ParticipantIdentity) public participants;
    address[] public validators;
    uint256 public constant APPROVAL_THRESHOLD = 2; // Minimum approvals needed
    uint256 public constant DISPUTE_PERIOD = 30 days;

    // Events
    event ParticipantRegistered(address indexed participant, bytes32 did, Role role);
    event AgreementCreated(uint256 indexed id, address indexed importer, address indexed exporter);
    event ApprovalSubmitted(uint256 indexed id, address indexed approver);
    event AgreementActivated(uint256 indexed id);
    event AgreementCompleted(uint256 indexed id);
    event DocumentAdded(uint256 indexed id, string docType, string hash);
    event ESGMetricsUpdated(uint256 indexed id, uint256 complianceScore);
    event WTOComplianceUpdated(uint256 indexed id, bool isCompliant);
    event DisputeRaised(uint256 indexed id, address indexed initiator);
    event DisputeResolved(uint256 indexed id);

    // Constructor
    constructor() {
        validators.push(msg.sender);
        participants[msg.sender] = ParticipantIdentity({
            did: keccak256(abi.encodePacked(msg.sender, block.timestamp)),
            isVerified: true,
            role: Role.WTOValidator,
            reputationScore: 100
        });
    }

    // Modifiers
    modifier onlyVerifiedParticipant() {
        require(participants[msg.sender].isVerified, "Only verified participants allowed");
        _;
    }

    modifier onlyRole(uint256 _id, Role _role) {
        require(participants[msg.sender].role == _role, "Unauthorized role");
        _;
    }

    modifier validAgreement(uint256 _id) {
        require(_id < agreementCounter, "Agreement does not exist");
        _;
    }

    // Main functions
    function registerParticipant(bytes32 _did, Role _role) external {
        require(_role != Role.None, "Invalid role");
        require(participants[msg.sender].role == Role.None, "Already registered");
        
        participants[msg.sender] = ParticipantIdentity({
            did: _did,
            isVerified: false,
            role: _role,
            reputationScore: 50
        });

        emit ParticipantRegistered(msg.sender, _did, _role);
    }

    function verifyParticipant(address _participant) external {
        require(participants[msg.sender].role == Role.WTOValidator, "Only validator can verify");
        participants[_participant].isVerified = true;
    }

    function createAgreement(
        address _exporter,
        string memory _goodsDescription,
        string[] memory _wtoRegulations,
        uint256 _tariffCode
    ) external payable onlyVerifiedParticipant returns (uint256) {
        require(_exporter != address(0), "Invalid exporter address");
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 newId = agreementCounter++;
        Agreement storage agreement = agreements[newId];
        
        agreement.id = newId;
        agreement.importer = msg.sender;
        agreement.exporter = _exporter;
        agreement.goodsDescription = _goodsDescription;
        agreement.amount = msg.value;
        agreement.status = Status.PendingApprovals;
        agreement.createdAt = block.timestamp;
        agreement.wtoCompliance.regulations = _wtoRegulations;
        agreement.wtoCompliance.tariffCode = _tariffCode;
        agreement.disputeResolutionDeadline = block.timestamp + DISPUTE_PERIOD;

        emit AgreementCreated(newId, msg.sender, _exporter);
        return newId;
    }

    function submitApproval(uint256 _id) external validAgreement(_id) onlyVerifiedParticipant {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == Status.PendingApprovals, "Invalid status for approval");
        require(!agreement.approvals[msg.sender], "Already approved");

        agreement.approvals[msg.sender] = true;
        emit ApprovalSubmitted(_id, msg.sender);

        // Check if threshold met
        uint256 approvalCount;
        for (uint i = 0; i < validators.length; i++) {
            if (agreement.approvals[validators[i]]) approvalCount++;
        }

        if (approvalCount >= APPROVAL_THRESHOLD) {
            agreement.status = Status.Active;
            emit AgreementActivated(_id);
        }
    }

    function addDocument(
        uint256 _id,
        string memory _hash,
        string memory _docType
    ) external validAgreement(_id) onlyVerifiedParticipant {
        Agreement storage agreement = agreements[_id];
        agreement.documents.push(Document({
            hash: _hash,
            docType: _docType,
            timestamp: block.timestamp,
            isVerified: false
        }));

        emit DocumentAdded(_id, _docType, _hash);
    }

    function updateESGMetrics(
        uint256 _id,
        uint256 _carbonFootprint,
        uint256 _waterUsage,
        uint256 _wasteGenerated,
        uint256 _renewableEnergy,
        uint256 _laborCompliance,
        string memory _certifications
    ) external validAgreement(_id) onlyRole(_id, Role.Auditor) {
        Agreement storage agreement = agreements[_id];
        
        agreement.esgMetrics.carbonFootprint = _carbonFootprint;
        agreement.esgMetrics.waterUsage = _waterUsage;
        agreement.esgMetrics.wasteGenerated = _wasteGenerated;
        agreement.esgMetrics.renewableEnergy = _renewableEnergy;
        agreement.esgMetrics.laborCompliance = _laborCompliance;
        agreement.esgMetrics.certifications = _certifications;
        agreement.esgMetrics.lastUpdated = block.timestamp;

        // Calculate overall compliance score
        uint256 score = (_renewableEnergy + _laborCompliance) / 2;
        agreement.esgMetrics.complianceScore = score;

        emit ESGMetricsUpdated(_id, score);
    }

    function updateWTOCompliance(
        uint256 _id,
        bool _isCompliant,
        string memory _originCertificate
    ) external validAgreement(_id) onlyRole(_id, Role.WTOValidator) {
        Agreement storage agreement = agreements[_id];
        
        agreement.wtoCompliance.isCompliant = _isCompliant;
        agreement.wtoCompliance.originCertificate = _originCertificate;
        agreement.wtoCompliance.lastValidated = block.timestamp;

        emit WTOComplianceUpdated(_id, _isCompliant);
    }

    function completeAgreement(uint256 _id) external validAgreement(_id) {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == Status.Active, "Agreement not active");
        require(agreement.wtoCompliance.isCompliant, "WTO compliance required");
        require(agreement.esgMetrics.complianceScore >= 70, "ESG compliance required");

        agreement.status = Status.Completed;
        agreement.completedAt = block.timestamp;

        // Transfer funds to exporter
        (bool sent, ) = agreement.exporter.call{value: agreement.amount}("");
        require(sent, "Failed to send ETH");

        emit AgreementCompleted(_id);
    }

    // View functions
    function getAgreementCount() external view returns (uint256) {
        return agreementCounter;
    }

    function getParticipantDetails(address _participant) external view returns (
        bytes32 did,
        bool isVerified,
        Role role,
        uint256 reputationScore
    ) {
        ParticipantIdentity memory identity = participants[_participant];
        return (identity.did, identity.isVerified, identity.role, identity.reputationScore);
    }
}