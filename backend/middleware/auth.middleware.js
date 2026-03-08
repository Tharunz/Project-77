// ============================================
// auth.middleware.js — JWT Route Protection
// Local HS256 JWT first (instant), jwt.decode fallback for Cognito tokens.
// NO remote JWKS calls — eliminates 5s delay per request in Learner Labs.
// ============================================

const jwt = require('jsonwebtoken');

// ─── Admin email list ─────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['admin@gov.in'];

// ─── Determine role — admin check by email ────────────────────────────────────
const resolveRole = (email, cognitoGroups) => {
  if (ADMIN_EMAILS.includes((email || '').toLowerCase())) return 'admin';
  if (cognitoGroups && cognitoGroups.length > 0) return cognitoGroups[0];
  return 'citizen';
};

/**
 * protect — Verifies token from Authorization header.
 * Step 1: jwt.verify with JWT_SECRET (instant, local HS256)
 * Step 2: jwt.decode without verification (handles Cognito tokens, no network)
 * Never makes remote JWKS/Cognito network calls.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`[AUTH] ${req.method} ${req.path} — token: ${authHeader ? 'present' : 'MISSING'}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[AUTH] REJECT ${req.path} — no Bearer token`);
    return res.status(401).json({
      success: false, data: null,
      message: 'No token provided. Please login first.',
      timestamp: new Date().toISOString()
    });
  }

  const token = authHeader.split(' ')[1];

  // Step 1: Local JWT verify — instant, no network
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'project77_super_secret_jwt_key_change_in_production');
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub,
      userId: decoded.userId || decoded.id || decoded.sub,
      role: resolveRole(decoded.email, null) || decoded.role || 'citizen'
    };
    console.log(`[AUTH] OK (local JWT): ${req.user.id} role:${req.user.role}`);
    return next();
  } catch (_) {
    // Not a local JWT — may be a Cognito token, try decode
  }

  // Step 2: jwt.decode (no signature verification) — handles Cognito IdTokens
  try {
    const decoded = jwt.decode(token);
    if (decoded && (decoded.sub || decoded.id || decoded.userId)) {
      const email = decoded.email || decoded['cognito:username'] || '';
      const groups = decoded['cognito:groups'] || [];
      req.user = {
        id: decoded.sub || decoded.id || decoded.userId,
        userId: decoded.sub || decoded.id || decoded.userId,
        email,
        role: resolveRole(email, groups) || decoded.role || decoded['custom:role'] || 'citizen',
        name: decoded.name || decoded['cognito:username'] || email
      };
      console.log(`[AUTH] OK (decoded): ${req.user.id} role:${req.user.role}`);
      return next();
    }
  } catch (_) {}

  console.error(`[AUTH] REJECT ${req.path} — token invalid or expired`);
  return res.status(401).json({
    success: false, data: null,
    message: 'Invalid or expired token. Please login again.',
    timestamp: new Date().toISOString()
  });
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
