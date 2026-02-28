// ============================================
// auth.service.js — JWT + bcrypt Authentication
// → AWS swap: Replace with Amazon Cognito SDK
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'project77_super_secret_jwt_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 * → AWS Cognito: Cognito handles hashing internally
 */
const hashPassword = async (plainPassword) => {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored hash.
 * → AWS Cognito: Use initiateAuth with USER_PASSWORD_AUTH flow
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a signed JWT for a user payload.
 * → AWS Cognito: Cognito returns id_token, access_token, refresh_token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token and return the decoded payload.
 * → AWS Cognito: Use Cognito JWKS to verify token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};
