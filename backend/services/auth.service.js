// ============================================
// auth.service.js — Auth with Feature Flag
// ENABLE_COGNITO=false → JWT + bcrypt (existing)
// ENABLE_COGNITO=true  → Amazon Cognito
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'project77_super_secret_jwt_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

const isCognito = () => process.env.ENABLE_COGNITO === 'true';

// ─── Lazy Cognito client ───────────────────────────────────────────────────────
let _cognitoClient = null;
const getCognitoClient = () => {
    if (!_cognitoClient) {
        const { cognitoClient } = require('../config/aws.config');
        _cognitoClient = cognitoClient;
    }
    return _cognitoClient;
};

// ─── Lazy JWT verifier ─────────────────────────────────────────────────────────
let _jwtVerifier = null;
const getJwtVerifier = () => {
    if (!_jwtVerifier) {
        const { CognitoJwtVerifier } = require('aws-jwt-verify');
        _jwtVerifier = CognitoJwtVerifier.create({
            userPoolId: process.env.COGNITO_USER_POOL_ID,
            tokenUse: 'access',
            clientId: process.env.COGNITO_CLIENT_ID
        });
    }
    return _jwtVerifier;
};

// ─── Cognito commands ──────────────────────────────────────────────────────────
const {
    InitiateAuthCommand,
    SignUpCommand,
    AdminConfirmSignUpCommand,
    GlobalSignOutCommand
} = require('@aws-sdk/client-cognito-identity-provider');

// =============================================================================
// COGNITO IMPLEMENTATIONS
// =============================================================================

/**
 * loginUser — Authenticate via Cognito USER_PASSWORD_AUTH flow
 * Returns: { accessToken, refreshToken, idToken }
 */
const loginUserCognito = async (email, password) => {
    const client = getCognitoClient();
    const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    });
    const response = await client.send(command);
    const tokens = response.AuthenticationResult;
    return {
        accessToken: tokens.AccessToken,
        refreshToken: tokens.RefreshToken,
        idToken: tokens.IdToken,
        expiresIn: tokens.ExpiresIn
    };
};

/**
 * registerUser — Sign up via Cognito, auto-confirm, and store profile in DynamoDB
 */
const registerUserCognito = async (email, password, name, state, role = 'citizen') => {
    const client = getCognitoClient();
    const { v4: uuidv4 } = require('uuid');
    const db = require('./db.service');

    // Step 1: Sign up in Cognito
    const signUpCmd = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name }
        ]
    });
    const signUpResult = await client.send(signUpCmd);

    // Step 2: Auto-confirm the user (skip email verification for internal use)
    const confirmCmd = new AdminConfirmSignUpCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email
    });
    await client.send(confirmCmd);

    // Step 3: Store additional profile data in DynamoDB ncie-users
    const userId = `USR-${uuidv4().slice(0, 8).toUpperCase()}`;
    const userItem = {
        userId,
        email: email.toLowerCase(),
        name,
        state: state || null,
        role,
        janShaktiScore: 50,
        cognitoSub: signUpResult.UserSub,
        createdAt: new Date().toISOString()
    };

    if (process.env.ENABLE_DYNAMO === 'true') {
        await db.put(process.env.DYNAMO_USERS_TABLE || 'ncie-users', userItem);
    }

    return { userId, email, name, cognitoSub: signUpResult.UserSub };
};

/**
 * verifyToken — Verify a Cognito JWT access token
 * Returns decoded user payload or null
 */
const verifyTokenCognito = async (token) => {
    try {
        const verifier = getJwtVerifier();
        const payload = await verifier.verify(token);
        // Normalize to same shape as JWT payload used throughout the app
        return {
            id: payload.sub,
            email: payload.username || payload['cognito:username'],
            role: payload['custom:role'] || 'citizen'
        };
    } catch (err) {
        return null;
    }
};

/**
 * logoutUser — Global sign out via Cognito (invalidates all tokens)
 */
const logoutUserCognito = async (accessToken) => {
    const client = getCognitoClient();
    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await client.send(command);
    return true;
};

/**
 * getUserProfile — Fetch from ncie-users DynamoDB table
 */
const getUserProfileCognito = async (userId) => {
    const db = require('./db.service');
    return await db.get(process.env.DYNAMO_USERS_TABLE || 'ncie-users', { userId });
};

// =============================================================================
// LEGACY JWT + bcrypt IMPLEMENTATIONS (unchanged)
// =============================================================================

const hashPassword = async (plainPassword) => {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
    if (isCognito()) {
        // When Cognito is enabled, verifyToken returns a Promise
        return verifyTokenCognito(token);
    }
    // Legacy sync verifier
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

// =============================================================================
// EXPORTED API (compatible with all existing routes)
// =============================================================================

module.exports = {
    // Legacy methods — always available (used by existing auth.routes.js)
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,

    // Cognito-specific methods (used when ENABLE_COGNITO=true)
    loginUserCognito,
    registerUserCognito,
    verifyTokenCognito,
    logoutUserCognito,
    getUserProfileCognito,

    // Flag check
    isCognito
};
