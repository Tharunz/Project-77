// ============================================
// auth.middleware.js — JWT Route Protection
// → AWS swap: Replace verifyToken with Amazon Cognito token validation
// ============================================

const { verifyToken } = require('../services/auth.service');

/**
 * protect — Verifies JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'No token provided. Please login first.',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.split(' ')[1];
    // verifyToken may return a Promise (Cognito) or a value (JWT)
    const decoded = await Promise.resolve(verifyToken(token));

    if (!decoded) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid or expired token. Please login again.',
        timestamp: new Date().toISOString()
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token verification failed: ' + err.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * adminOnly — Restricts route to admin role only.
 * Must be used AFTER protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Access denied. Admin privileges required.',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

/**
 * officerOrAdmin — Allows both officers and admins.
 * Must be used AFTER protect middleware.
 */
const officerOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Access denied. Officer or Admin privileges required.',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = { protect, adminOnly, officerOrAdmin };
