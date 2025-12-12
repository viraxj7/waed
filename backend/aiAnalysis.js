const Web3 = require('web3');
const crypto = require('crypto');

const web3 = new Web3(process.env.BLOCKCHAIN_RPC || 'http://localhost:8545');

const contractABI = [
  {
    "inputs": [{"type": "string"}, {"type": "string"}, {"type": "string"}, {"type": "uint256"}],
    "name": "registerDocument",
    "outputs": [{"type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "string"}],
    "name": "verifyDocument",
    "outputs": [{"type": "bool"}, {"type": "string"}, {"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = process.env.CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const contract = new web3.eth.Contract(contractABI, contractAddress);

const blockchainDB = new Map();
let blockCounter = 1000000;

async function registerDocument({ issuer, documentType, documentHash, ipfsHash, metadata, timestamp }) {
  const txId = crypto.randomBytes(32).toString('hex');
  const blockNumber = blockCounter++;
  
  const record = {
    txId,
    blockNumber,
    issuer,
    documentType,
    documentHash,
    ipfsHash,
    metadata,
    timestamp,
    confirmed: true,
    confirmations: Math.floor(Math.random() * 50) + 10
  };
  
  blockchainDB.set(documentHash, record);
  
  await simulateBlockchainDelay();
  
  return record;
}

async function verifyDocument(documentHash) {
  await simulateBlockchainDelay();
  
  const record = blockchainDB.get(documentHash);
  
  if (!record) {
    return {
      exists: false,
      verified: false,
      message: 'Document not found in blockchain registry'
    };
  }
  
  return {
    exists: true,
    verified: true,
    issuer: record.issuer,
    documentType: record.documentType,
    ipfsHash: record.ipfsHash,
    timestamp: record.timestamp,
    blockNumber: record.blockNumber,
    txId: record.txId,
    confirmations: record.confirmations,
    metadata: record.metadata
  };
}

async function getRegistry({ page, limit, filter }) {
  await simulateBlockchainDelay();
  
  let records = Array.from(blockchainDB.values());
  
  if (filter) {
    records = records.filter(r => 
      r.issuer.includes(filter) || 
      r.documentType.includes(filter) ||
      r.documentHash.includes(filter)
    );
  }
  
  records.sort((a, b) => b.timestamp - a.timestamp);
  
  const total = records.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedRecords = records.slice(startIndex, startIndex + limit);
  
  return {
    records: paginatedRecords,
    page,
    totalPages,
    total
  };
}

async function getBlockchainStats() {
  return {
    totalDocuments: blockchainDB.size,
    currentBlock: blockCounter,
    networkHashRate: '1.2 TH/s',
    avgBlockTime: 2.5,
    difficulty: 3456789012345,
    lastBlockTimestamp: Date.now()
  };
}

async function simulateBlockchainDelay() {
  return new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
}

function generateMerkleRoot(transactions) {
  if (transactions.length === 0) return crypto.randomBytes(32).toString('hex');
  
  let hashes = transactions.map(tx => 
    crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex')
  );
  
  while (hashes.length > 1) {
    const newHashes = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const combined = hashes[i] + (hashes[i + 1] || hashes[i]);
      newHashes.push(crypto.createHash('sha256').update(combined).digest('hex'));
    }
    hashes = newHashes;
  }
  
  return hashes[0];
}

module.exports = {
  registerDocument,
  verifyDocument,
  getRegistry,
  getBlockchainStats,
  generateMerkleRoot
};

