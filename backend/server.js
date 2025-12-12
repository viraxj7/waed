const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { authenticateToken, generateToken } = require('./auth');
const { analyzeDocument, detectForgery } = require('./documentAnalyzer');
const { registerDocument, verifyDocument, getRegistry } = require('./blockchain');
const { uploadToIPFS, retrieveFromIPFS } = require('./storage');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Invalid file type. Only PDF and images allowed.'));
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const token = generateToken({ username, role: 'issuer' });
  res.json({ token, user: { username, role: 'issuer' } });
});

app.post('/api/documents/register', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const { issuer, documentType, metadata } = req.body;
    const file = req.file;
    
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    
    const ipfsHash = await uploadToIPFS(file.path);
    const documentHash = require('crypto').createHash('sha256').update(file.buffer || file.path).digest('hex');
    
    const blockchainRecord = await registerDocument({
      issuer,
      documentType,
      documentHash,
      ipfsHash,
      metadata: JSON.parse(metadata || '{}'),
      timestamp: Date.now()
    });
    
    res.json({
      success: true,
      transactionId: blockchainRecord.txId,
      documentHash,
      ipfsHash,
      blockNumber: blockchainRecord.blockNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents/verify', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    
    const documentHash = require('crypto').createHash('sha256').update(file.buffer || file.path).digest('hex');
    const blockchainResult = await verifyDocument(documentHash);
    const forgeryAnalysis = await analyzeDocument(file.path);
    const aiDetection = await detectForgery(file.path);
    
    const isAuthentic = blockchainResult.exists && forgeryAnalysis.score > 85 && aiDetection.confidence > 0.9;
    
    res.json({
      authentic: isAuthentic,
      score: forgeryAnalysis.score,
      blockchain: blockchainResult,
      analysis: {
        metadata: forgeryAnalysis.metadata,
        anomalies: forgeryAnalysis.anomalies,
        aiConfidence: aiDetection.confidence,
        flags: aiDetection.flags
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/registry', async (req, res) => {
  try {
    const { page = 1, limit = 20, filter } = req.query;
    const registry = await getRegistry({ page: parseInt(page), limit: parseInt(limit), filter });
    res.json({
      data: registry.records,
      pagination: {
        page: registry.page,
        totalPages: registry.totalPages,
        totalRecords: registry.total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const document = await verifyDocument(hash);
    if (!document.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'operational', 
    timestamp: Date.now(),
    services: {
      blockchain: 'connected',
      ipfs: 'connected',
      ai: 'ready'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Waeed API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

