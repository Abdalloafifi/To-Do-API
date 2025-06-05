const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Auth = require('../models/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;

const decryptToken = (encryptedToken) => {
  try {
    const [ivHex, saltHex, encryptedHex] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const salt = saltHex;
    const key = crypto.scryptSync(CRYPTO_SECRET, salt, 32);
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('❌ Failed to decrypt token:', err.message);
    return null;
  }
};

// ✅ للاستخدام مع REST
const verifyToken = async (req, res, next) => {
  const encryptedToken = req.headers['auth-token']|| req.cookies['auth-token'];
  if (!encryptedToken) {
    return res.status(403).json({ message: 'Token is required' });
  }

  const decryptedToken = decryptToken(encryptedToken);
  if (!decryptedToken) {
    return res.status(401).json({ message: 'Invalid or corrupted token' });
  }

  try {
    const decoded = jwt.verify(decryptedToken, JWT_SECRET);
    const user = await Auth.findById(decoded.id).select('-password');
    if (!user || (user.email !== decoded.email && user.username !== decoded.username)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (user.documentation === false) {
      return res.status(401).json({ message: 'Account not verified' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ للاستخدام مع Apollo GraphQL
const extractUserFromToken = async (req) => {
  const encryptedToken = req.headers['auth-token']|| req.cookies['auth-token'];
  if (!encryptedToken) return null;

  const decryptedToken = decryptToken(encryptedToken);
  if (!decryptedToken) return null;

  try {
    const decoded = jwt.verify(decryptedToken, JWT_SECRET);
    const user = await Auth.findById(decoded.id).select('-password');
    if (!user || (user.email !== decoded.email && user.username !== decoded.username)) {
      return null;
    }
    if (user.documentation === false) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};




const verifyTokenGrpc = async (metadata) => {
  const encryptedToken = metadata.get('auth-token')[0];
  if (!encryptedToken) {
    throw new Error('Token is required');
  }

  const decryptedToken = decryptToken(encryptedToken);
  if (!decryptedToken) {
    throw new Error('Invalid or corrupted token');
  }

  try {
    const decoded = jwt.verify(decryptedToken, JWT_SECRET);
    const user = await Auth.findById(decoded.id).select('-password');
    if (!user || (user.email !== decoded.email && user.username !== decoded.username)) {
      throw new Error('Unauthorized');
    }
    if (user.documentation === false) {
      throw new Error('Account not verified');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  verifyToken,          // REST API
  extractUserFromToken, // Apollo GraphQL
  verifyTokenGrpc       // gRPC
};