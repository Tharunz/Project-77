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
 * loginUserCognito — Authenticate via Cognito USER_PASSWORD_AUTH flow.
 * Handles NEW_PASSWORD_REQUIRED (FORCE_CHANGE_PASSWORD) automatically.
 * Throws descriptive errors so the caller can choose to fall back to local auth.
 */
const loginUserCognito = async (email, password) => {
    const {
        RespondToAuthChallengeCommand
    } = require('@aws-sdk/client-cognito-identity-provider');
    const client = getCognitoClient();

    const response = await client.send(new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: { USERNAME: email, PASSWORD: password }
    }));

    // ── Happy path ───────────────────────────────────────────────────────────
    if (response.AuthenticationResult) {
        const t = response.AuthenticationResult;
        return { accessToken: t.AccessToken, idToken: t.IdToken, refreshToken: t.RefreshToken };
    }

    // ── Auto-resolve FORCE_CHANGE_PASSWORD / NEW_PASSWORD_REQUIRED ───────────
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('[Auth] Cognito: NEW_PASSWORD_REQUIRED — responding automatically');
        const challengeResp = await client.send(new RespondToAuthChallengeCommand({
            ClientId: process.env.COGNITO_CLIENT_ID,
            ChallengeName: 'NEW_PASSWORD_REQUIRED',
            Session: response.Session,
            ChallengeResponses: {
                USERNAME: email,
                NEW_PASSWORD: password,
                'userAttributes.name': email.split('@')[0]
            }
        }));
        if (challengeResp.AuthenticationResult) {
            const t = challengeResp.AuthenticationResult;
            return { accessToken: t.AccessToken, idToken: t.IdToken, refreshToken: t.RefreshToken };
        }
        throw new Error('CHALLENGE_FAILED');
    }

    throw new Error(`COGNITO_CHALLENGE_${response.ChallengeName || 'UNKNOWN'}`);
};

/**
 * loginUser — Unified login: tries Cognito first, falls back to local bcrypt.
 * Returns { token, user } on success. Throws on failure.
 */
const loginUser = async (email, password) => {
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const lowdb = require('../db/database');

    // ── Step 1: Try Cognito (non-blocking — any failure falls through) ────────
    let cognitoOk = false;
    if (process.env.ENABLE_COGNITO === 'true') {
        try {
            await loginUserCognito(email, password);
            cognitoOk = true;
            console.log('[Auth] Cognito login success for:', email);
        } catch (err) {
            console.log('[Auth] Cognito failed, using local auth:', err.name || err.message);
        }
    }

    // ── Step 2: Look up user — local DB first, then DynamoDB ─────────────────
    let user = null;
    const fs = require('fs');
    const path = require('path');
    const normalizedEmail = email.toLowerCase().trim();

    // Try all possible local db paths
    const possiblePaths = [
        path.join(__dirname, '../db/local.json'),
        path.join(__dirname, '../db/db.json'),
        path.join(__dirname, '../db/database.json')
    ];

    for (const dbPath of possiblePaths) {
        try {
            if (fs.existsSync(dbPath)) {
                const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const found = (dbData.users || []).find(u => u.email?.toLowerCase().trim() === normalizedEmail);
                if (found) {
                    console.log('[Auth] User found in:', dbPath);
                    user = found;
                    break;
                }
            }
        } catch (e) { }
    }

    // Try lowdb instance if not found above
    if (!user) {
        try {
            const db_instance = lowdb.getDb();
            user = db_instance.get('users').find(u => u.email?.toLowerCase().trim() === normalizedEmail).value();
        } catch (_) { }
    }

    if (!user && process.env.ENABLE_DYNAMO === 'true') {
        try {
            const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({
                region: process.env.AWS_REGION || 'us-west-2',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    sessionToken: process.env.AWS_SESSION_TOKEN
                }
            }));
            const result = await dynamo.send(new ScanCommand({
                TableName: process.env.DYNAMO_USERS_TABLE || 'ncie-users',
                FilterExpression: 'email = :e',
                ExpressionAttributeValues: { ':e': normalizedEmail }
            }));
            if (result.Items?.length > 0) {
                console.log('[Auth] User found in DynamoDB:', normalizedEmail);
                user = result.Items[0];
            }
        } catch (e) {
            console.log('[Auth] DynamoDB user lookup failed:', e.message);
        }
    }

    // ── Step 2.5: Auto-create local user if Cognito succeeded but missing in DB ──
    if (cognitoOk && !user) {
        console.log('[Auth] Cognito user not in local DB — auto-creating:', normalizedEmail);
        const bcrypt = require('bcryptjs');
        const newUser = {
            id: `USR-${Date.now()}`,
            name: email.split('@')[0],
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10),
            role: normalizedEmail === 'admin@gov.in' ? 'admin' : 'citizen',
            state: 'Delhi',
            janShaktiScore: 50,
            isVerified: true,
            createdAt: new Date().toISOString()
        };

        try {
            const dbPath = path.join(__dirname, '../db/local.json');
            let dbData = { users: [], grievances: [], schemes: [], officers: [] };
            if (fs.existsSync(dbPath)) {
                dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }
            dbData.users = dbData.users || [];
            dbData.users.push(newUser);
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            console.log('[Auth] Auto-created user in local DB:', normalizedEmail);
        } catch (e) {
            console.error('[Auth] Failed to auto-create user in local DB:', e.message);
        }
        user = newUser;
    }

    if (!user) throw new Error('USER_NOT_FOUND');


    // ── Step 3: If Cognito failed, verify password locally ───────────────────
    if (!cognitoOk) {
        if (!user.password) throw new Error('INVALID_PASSWORD');
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('INVALID_PASSWORD');
    }

    // ── Step 4: Generate our own JWT (works for both Cognito and local users) ─
    const ADMIN_EMAILS = ['admin@gov.in'];
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : (user.role || 'citizen');
    const token = jwt.sign(
        { id: user.id || user.userId, email: user.email, role, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return {
        token,
        user: {
            id: user.id || user.userId,
            name: user.name,
            email: user.email,
            role,
            state: user.state || null,
            janShaktiScore: user.janShaktiScore || 50,
            phone: user.phone || ''
        }
    };
};

/**
 * registerUser — Sign up via Cognito, auto-confirm, and store profile in DynamoDB
 */
const registerUserCognito = async (email, password, name, state, role = 'citizen') => {
    const client = getCognitoClient();
    const { v4: uuidv4 } = require('uuid');
    const db = require('./db.service');

    // Step 1: Sign up in Cognito — sends email OTP
    const signUpCmd = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name }  // ← name stored in Cognito attributes
        ]
    });
    const signUpResult = await client.send(signUpCmd);

    // Step 2: Store profile in DynamoDB (idempotent — upsert by email)
    const userId = `USR-${uuidv4().slice(0, 8).toUpperCase()}`;
    const userItem = {
        id: userId,          // matches the id field used in auth.routes.js
        userId,              // also keep for backwards compat
        email: email.toLowerCase(),
        name,                // ← critical: name must be in the stored record
        state: state || null,
        role,
        janShaktiScore: 50,
        cognitoSub: signUpResult.UserSub,
        createdAt: new Date().toISOString()
    };

    if (process.env.ENABLE_DYNAMO === 'true') {
        // Clean up any stale record with the same email before inserting
        try {
            const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
            const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
            const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, sessionToken: process.env.AWS_SESSION_TOKEN } }));
            const stale = await dynamo.send(new ScanCommand({
                TableName: process.env.DYNAMO_USERS_TABLE || 'ncie-users',
                FilterExpression: 'email = :email',
                ExpressionAttributeValues: { ':email': email.toLowerCase() }
            }));
            await Promise.all((stale.Items || []).map(item =>
                dynamo.send(new DeleteCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE || 'ncie-users',
                    Key: { id: item.id }
                }))
            ));
        } catch (_) { /* ignore stale cleanup failure */ }
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
    loginUser,
    loginUserCognito,
    registerUserCognito,
    verifyTokenCognito,
    logoutUserCognito,
    getUserProfileCognito,

    // Flag check
    isCognito
};
