const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'waeed-ultra-secure-secret-key-2024-ksa';
const JWT_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

const userDatabase = new Map();
const tokenBlacklist = new Set();
const refreshTokens = new Map();

function generateToken(payload, expiresIn = JWT_EXPIRY) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn,
    issuer: 'waeed-auth-service',
    audience: 'waeed-api'
  });
}

function generateRefreshToken(userId) {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
  
  refreshTokens.set(token, {
    userId,
    expiresAt,
    createdAt: Date.now()
  });
  
  return token;
}

function verifyToken(token) {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'waeed-auth-service',
      audience: 'waeed-api'
    });
    
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const verification = verifyToken(token);
  
  if (!verification.valid) {
    return res.status(403).json({ error: 'Invalid or expired token', details: verification.error });
  }
  
  req.user = verification.payload;
  next();
}

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

async function registerUser(userData) {
  const { username, password, email, role = 'user', organizationId } = userData;
  
  if (userDatabase.has(username)) {
    throw new Error('Username already exists');
  }
  
  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);
  
  const user = {
    id: userId,
    username,
    email,
    password: hashedPassword,
    role,
    organizationId,
    createdAt: Date.now(),
    lastLogin: null,
    active: true,
    permissions: getRolePermissions(role)
  };
  
  userDatabase.set(username, user);
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId
  };
}

async function loginUser(username, password) {
  const user = userDatabase.get(username);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.active) {
    throw new Error('Account is deactivated');
  }
  
  const isValidPassword = await verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
  
  user.lastLogin = Date.now();
  
  const accessToken = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    organizationId: user.organizationId,
    permissions: user.permissions
  });
  
  const refreshToken = generateRefreshToken(user.id);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRY,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    }
  };
}

function revokeToken(token) {
  tokenBlacklist.add(token);
  
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
  
  return { success: true, message: 'Token revoked successfully' };
}

function refreshAccessToken(refreshToken) {
  const tokenData = refreshTokens.get(refreshToken);
  
  if (!tokenData) {
    throw new Error('Invalid refresh token');
  }
  
  if (tokenData.expiresAt < Date.now()) {
    refreshTokens.delete(refreshToken);
    throw new Error('Refresh token expired');
  }
  
  const user = Array.from(userDatabase.values()).find(u => u.id === tokenData.userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const newAccessToken = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    organizationId: user.organizationId,
    permissions: user.permissions
  });
  
  return {
    accessToken: newAccessToken,
    expiresIn: JWT_EXPIRY
  };
}

function getRolePermissions(role) {
  const permissionSets = {
    admin: ['read', 'write', 'delete', 'manage_users', 'view_analytics', 'approve_documents'],
    issuer: ['read', 'write', 'register_documents', 'view_own_documents'],
    verifier: ['read', 'verify_documents', 'view_analytics'],
    user: ['read', 'verify_documents']
  };
  
  return permissionSets[role] || permissionSets.user;
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: `Permission '${requiredPermission}' required` });
    }
    
    next();
  };
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser,
  revokeToken,
  refreshAccessToken,
  requireRole,
  requirePermission,
  getRolePermissions
};

