// ============================================
// auth.middleware.js — JWT Route Protection
// Supports BOTH local JWT (HS256) and Cognito IdToken (RS256)
// ============================================

const jwt = require('jsonwebtoken');

// ─── Admin email list (hardcoded for hackathon) ────────────────────────────────
const ADMIN_EMAILS = ['admin@gov.in'];

// ─── Lazy jwks client for Cognito IdToken verification ────────────────────────
let _jwksClient = null;
const getJwksClient = () => {
  if (!_jwksClient) {
    const jwksRsa = require('jwks-rsa');
    _jwksClient = jwksRsa({
      jwksUri: `https://cognito-idp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true
    });
  }
  return _jwksClient;
};

const getSigningKey = (header, callback) => {
  const client = getJwksClient();

  if (header.kid) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      callback(null, key.getPublicKey());
    });
  } else {
    // Fallback: If no kid is present in token, get all keys and use the first one
    client.getKeys((err, keys) => {
      if (err) return callback(err);
      if (!keys || keys.length === 0) return callback(new Error('No keys found in JWKS'));
      const signingKey = keys[0].publicKey || keys[0].rsaPublicKey;
      callback(null, signingKey);
    });
  }
};

// ─── Determine role — admin check by email ────────────────────────────────────
const resolveRole = (email, cognitoGroups) => {
  if (ADMIN_EMAILS.includes((email || '').toLowerCase())) return 'admin';
  if (cognitoGroups && cognitoGroups.length > 0) return cognitoGroups[0];
  return 'citizen';
};

/**
 * protect — Verifies token from Authorization header.
 * When ENABLE_COGNITO=true  → verifies Cognito IdToken (RS256) via jwks-rsa
 * When ENABLE_COGNITO=false → verifies local JWT (HS256) via JWT_SECRET
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

    // ── Cognito path: verify RS256 IdToken via AWS JWKS ─────────────────
    if (process.env.ENABLE_COGNITO === 'true') {
      return jwt.verify(
        token,
        getSigningKey,
        {
          algorithms: ['RS256'],
          issuer: `https://cognito-idp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
        },
        (err, decoded) => {
          if (err) {
            console.error('[AUTH] Cognito IdToken verify failed:', err.message);
            return res.status(401).json({
              success: false,
              data: null,
              message: 'Invalid or expired token. Please login again.',
              detail: err.message,
              timestamp: new Date().toISOString()
            });
          }

          const email = decoded.email || decoded['cognito:username'] || '';
          const groups = decoded['cognito:groups'] || [];
          const role = resolveRole(email, groups);

          req.user = {
            id: decoded.sub,          // legacy compat (req.user.id)
            userId: decoded.sub,      // new routes (req.user.userId)
            email,
            name: decoded.name || email || 'Citizen',
            role
          };
          next();
        }
      );
    }

    // ── Local JWT path: verify HS256 token via JWT_SECRET ────────────────
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'project77_super_secret_jwt_key_change_in_production'
    );

    if (!decoded) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid or expired token. Please login again.',
        timestamp: new Date().toISOString()
      });
    }

    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub,
      userId: decoded.userId || decoded.id || decoded.sub,
      role: resolveRole(decoded.email, null) || decoded.role || 'citizen'
    };
    next();

  } catch (err) {
    console.error('[AUTH] Token verification error:', err.message);
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
