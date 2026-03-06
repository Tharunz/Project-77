// ============================================
// auth.routes.js — Authentication Endpoints
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/profile
// PUT  /api/auth/profile
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {
    hashPassword,
    comparePassword,
    generateToken,
    loginUserCognito,
    registerUserCognito,
    logoutUserCognito,
    isCognito
} = require('../services/auth.service');
const { protect } = require('../middleware/auth.middleware');
const { getPredictions } = require('../services/preseva.service');
const db = require('../db/database');

// Admin emails — must match auth.middleware.js
const ADMIN_EMAILS = ['admin@gov.in'];

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, state, district, age, income, gender } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Name, email, and password are required.',
                timestamp: new Date().toISOString()
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false, data: null,
                message: 'Password must be at least 6 characters.',
                timestamp: new Date().toISOString()
            });
        }

        // ── Cognito path ──────────────────────────────────────────────────────
        if (isCognito()) {
            try {
                const result = await registerUserCognito(email, password, name, state);
                const token = generateToken({ id: result.userId, email, role: 'citizen', name });
                return res.status(201).json({
                    success: true,
                    data: { token, user: { id: result.userId, email, name, state, role: 'citizen' } },
                    message: 'Account created successfully. Welcome to Project NCIE!',
                    timestamp: new Date().toISOString()
                });
            } catch (cogErr) {
                if (cogErr.name === 'UsernameExistsException') {
                    // Check user status: CONFIRMED vs UNCONFIRMED
                    try {
                        const { AdminGetUserCommand, ResendConfirmationCodeCommand } = require('@aws-sdk/client-cognito-identity-provider');
                        const { cognitoClient } = require('../config/aws.config');
                        const userInfo = await cognitoClient.send(new AdminGetUserCommand({
                            UserPoolId: process.env.COGNITO_USER_POOL_ID,
                            Username: email
                        }));
                        if (userInfo.UserStatus === 'CONFIRMED') {
                            return res.status(409).json({ success: false, data: null, message: 'Account already exists. Please log in.', timestamp: new Date().toISOString() });
                        } else {
                            // UNCONFIRMED — resend OTP so they can complete verification
                            try {
                                await cognitoClient.send(new ResendConfirmationCodeCommand({
                                    ClientId: process.env.COGNITO_CLIENT_ID,
                                    Username: email
                                }));
                            } catch (_) { /* ignore resend failure */ }
                            return res.status(200).json({ success: true, data: null, message: 'OTP resent to your email. Please check your inbox.', timestamp: new Date().toISOString() });
                        }
                    } catch (lookupErr) {
                        // Fallback if AdminGetUser fails
                        return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists.', timestamp: new Date().toISOString() });
                    }
                }
                throw cogErr;
            }
        }

        // ── Local JWT path ────────────────────────────────────────────────────
        const db_instance = db.getDb();
        const existingLocal = db_instance.get('users').find({ email: email.toLowerCase() }).value();
        if (existingLocal) {
            // Cross-check Cognito: if Cognito has no user, local record is stale (account was deleted)
            if (isCognito()) {
                try {
                    const { AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
                    const { cognitoClient } = require('../config/aws.config');
                    await cognitoClient.send(new AdminGetUserCommand({
                        UserPoolId: process.env.COGNITO_USER_POOL_ID,
                        Username: email.toLowerCase()
                    }));
                    // Exists in Cognito — genuine duplicate
                    return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists.', timestamp: new Date().toISOString() });
                } catch (e) {
                    if (e.name === 'UserNotFoundException') {
                        // Deleted from Cognito but stale in local DB — clean up and allow re-register
                        db_instance.get('users').remove({ email: email.toLowerCase() }).write();
                        console.log(`[Auth] Cleaned stale local user ${email} (not found in Cognito)`);
                        // Falls through to registration below
                    } else {
                        // Cognito error — safe fallback: block duplicate
                        return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists.', timestamp: new Date().toISOString() });
                    }
                }
            } else {
                // Local-only mode — block duplicate
                return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists.', timestamp: new Date().toISOString() });
            }
        }

        const hashedPassword = await hashPassword(password);

        const newUser = {
            id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            state: state || null,
            district: district || null,
            age: age ? parseInt(age) : null,
            income: income ? parseInt(income) : null,
            gender: gender || null,
            role: 'citizen',
            janShaktiScore: 50,
            createdAt: new Date().toISOString()
        };

        db_instance.get('users').push(newUser).write();

        const token = generateToken({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return res.status(201).json({
            success: true,
            data: { token, user: userWithoutPassword },
            message: 'Account created successfully. Welcome to Project NCIE!',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Email and password are required.',
                timestamp: new Date().toISOString()
            });
        }

        // ── Cognito path ──────────────────────────────────────────────────────
        if (isCognito()) {
            try {
                const tokens = await loginUserCognito(email, password);

                // Determine role based on email (must match auth.middleware.js logic)
                const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'citizen';

                // CRITICAL: Store IdToken as `token` — middleware verifies IdToken (RS256)
                // IdToken contains: sub, email, name, cognito:groups, custom:role
                return res.status(200).json({
                    success: true,
                    data: {
                        token: tokens.idToken,         // ← IdToken for middleware verification
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        user: { email, role, name: email.split('@')[0] }
                    },
                    message: `Welcome back!`,
                    timestamp: new Date().toISOString()
                });
            } catch (cogErr) {
                if (cogErr.name === 'NotAuthorizedException' || cogErr.name === 'UserNotFoundException') {
                    return res.status(401).json({ success: false, data: null, message: 'Invalid email or password.', timestamp: new Date().toISOString() });
                }
                throw cogErr;
            }
        }

        // ── Local JWT path ────────────────────────────────────────────────────
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ email: email.toLowerCase() }).value();

        if (!user) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid email or password.',
                timestamp: new Date().toISOString()
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid email or password.',
                timestamp: new Date().toISOString()
            });
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            data: { token, user: userWithoutPassword },
            message: `Welcome back, ${user.name}!`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', protect, async (req, res, next) => {
    try {
        const db_instance = db.getDb();

        // Seed with fresh "Solved" alerts on logout for a rich demo state on next login
        console.log(`[AUTH] User ${req.user.email} logged out. Seeding default solved predictions...`);
        const solvedAlerts = [
            {
                id: `PRESEVA-TN-8821`,
                state: 'Tamil Nadu',
                category: 'Water Supply',
                title: 'THREAT MITIGATED: Predicted Water Shortage',
                district: 'Chennai',
                predictedDate: '2026-03-05',
                daysUntil: 0,
                urgency: 'critical',
                status: 'Action Taken',
                prevented: true,
                probability: 92,
                basisGrievances: 4200,
                departmentAlerted: 'Chennai Metrowater',
                suggestedAction: 'Increase desalination output by 20% and redirect supply.',
                historicalPattern: 'Drought pattern match from Summer 2021 detected 72h prior.',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 43200000).toISOString()
            },
            {
                id: `PRESEVA-KL-4412`,
                state: 'Kerala',
                category: 'Healthcare',
                title: 'THREAT MITIGATED: Medical Supply Anomaly',
                district: 'Wayanad',
                predictedDate: '2026-03-04',
                daysUntil: 0,
                urgency: 'high',
                status: 'Action Taken',
                prevented: true,
                probability: 88,
                basisGrievances: 1560,
                departmentAlerted: 'Kerala Health Services',
                suggestedAction: 'Deploy emergency buffer stock of anti-viral medications.',
                historicalPattern: 'Seasonal escalation pattern matching monsoon surge detected.',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        db_instance.set('preSevaAlerts', solvedAlerts).write();

        if (isCognito()) {
            try {
                // Prioritize X-Access-Token if provided by frontend
                const accessToken = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];
                if (accessToken) {
                    await logoutUserCognito(accessToken);
                }
            } catch (cogErr) {
                console.warn('[AUTH] Cognito global sign out failed, but local session is cleared:', cogErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully and predictions reset.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/auth/profile ────────────────────────────────────────────────────
router.get('/profile', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        // req.user.id works for both local JWT and Cognito (where id = sub)
        const userId = req.user.id || req.user.userId;
        const user = db_instance.get('users').find(u => u.id === userId || u.email === req.user.email).value();

        if (!user) {
            // Cognito mode: user may not exist in local DB — return token claims
            return res.status(200).json({
                success: true,
                data: {
                    id: req.user.id,
                    userId: req.user.userId,
                    email: req.user.email,
                    name: req.user.name || 'Citizen',
                    role: req.user.role,
                    janShaktiScore: 50,
                    stats: { totalGrievances: 0, resolvedGrievances: 0, pendingGrievances: 0, schemesMatched: 0 }
                },
                message: 'Profile fetched from token.',
                timestamp: new Date().toISOString()
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        // Get user's grievance stats
        const grievances = db_instance.get('grievances').filter(g => g.userId === userId || g.userId === req.user.email).value();
        const resolved = grievances.filter(g => g.status === 'Resolved').length;
        const schemes = db_instance.get('schemes').filter({ isActive: true }).value();
        const schemesMatched = schemes.filter(s => {
            const age = user.age || 30;
            const income = user.income || 0;
            if (s.eligibility && typeof s.eligibility === 'object') {
                return age >= (s.eligibility.minAge || 0) && age <= (s.eligibility.maxAge || 100)
                    && (s.eligibility.maxIncome === 0 || income <= s.eligibility.maxIncome);
            }
            return true;
        }).length;

        return res.status(200).json({
            success: true,
            data: {
                ...userWithoutPassword,
                stats: {
                    totalGrievances: grievances.length,
                    resolvedGrievances: resolved,
                    pendingGrievances: grievances.length - resolved,
                    schemesMatched
                }
            },
            message: 'Profile fetched successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res, next) => {
    try {
        const { name, email, state, district, age, income, gender } = req.body;

        const db_instance = db.getDb();
        let user = db_instance.get('users').find(u =>
            u.id === req.user.id || u.email === req.user.email
        ).value();

        // ── Cognito users may not exist in local DB yet — upsert them ────────
        if (!user) {
            const newLocalUser = {
                id: req.user.id || req.user.sub,
                name: name?.trim() || req.user.name || req.user.email?.split('@')[0] || 'Citizen',
                email: req.user.email,
                role: req.user.role || 'citizen',
                state: state || null,
                district: district || null,
                age: age ? parseInt(age) : null,
                income: income ? parseInt(income) : null,
                gender: gender || null,
                janShaktiScore: 50,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            db_instance.get('users').push(newLocalUser).write();
            console.log(`[Profile] Upserted Cognito user into local DB: ${req.user.email}`);
            const { password: _, ...withoutPwd } = newLocalUser;
            return res.status(200).json({ success: true, data: withoutPwd, message: 'Profile saved successfully.', timestamp: new Date().toISOString() });
        }

        // If email is changing, ensure it's not taken by another account
        if (email && email !== user.email) {
            const existing = db_instance.get('users').find({ email }).value();
            if (existing && existing.id !== req.user.id) {
                return res.status(409).json({ success: false, data: null, message: 'Email already in use by another account.', timestamp: new Date().toISOString() });
            }
        }

        const parsedAge = age !== undefined && age !== '' ? parseInt(age) : undefined;
        const parsedIncome = income !== undefined && income !== '' ? parseInt(income) : undefined;
        const updates = {
            ...(name && { name: name.trim() }),
            ...(email && { email: email.trim().toLowerCase() }),
            ...(state && { state }),
            ...(district && { district }),
            ...(parsedAge !== undefined && !isNaN(parsedAge) && { age: parsedAge }),
            ...(parsedIncome !== undefined && !isNaN(parsedIncome) && { income: parsedIncome }),
            ...(gender && { gender }),
            updatedAt: new Date().toISOString()
        };

        db_instance.get('users').find(u =>
            u.id === req.user.id || u.email === req.user.email
        ).assign(updates).write();

        const updatedUser = db_instance.get('users').find(u =>
            u.id === req.user.id || u.email === req.user.email
        ).value();
        const { password: _, ...userWithoutPassword } = updatedUser;

        return res.status(200).json({
            success: true,
            data: userWithoutPassword,
            message: 'Profile updated successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/auth/data-export ────────────────────────────────────────────────
// → AWS swap: Generate pre-signed S3 URL with KMS-encrypted user data archive
router.get('/data-export', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        if (!user) {
            return res.status(404).json({ success: false, data: null, message: 'User not found.', timestamp: new Date().toISOString() });
        }
        const { password: _, ...userWithoutPassword } = user;

        const grievances = db_instance.get('grievances').filter({ userId: req.user.id }).value();
        const notifications = db_instance.get('notifications').filter({ userId: req.user.id }).value() || [];

        const exportData = {
            exportedAt: new Date().toISOString(),
            profile: userWithoutPassword,
            grievances,
            notifications,
            meta: {
                totalGrievances: grievances.length,
                totalNotifications: notifications.length,
                dataProtectionAct: 'Digital Personal Data Protection Act, 2023'
            }
        };

        return res.status(200).json({
            success: true,
            data: exportData,
            message: 'Your complete data export is ready.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── DELETE /api/auth/account ─────────────────────────────────────────────────
router.delete('/account', protect, async (req, res, next) => {
    try {
        const userId = req.user.id || req.user.userId;
        const userEmail = req.user.email;
        const db_instance = db.getDb();

        // 1. Delete from Cognito
        if (process.env.ENABLE_COGNITO === 'true') {
            try {
                const { AdminDeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
                const { cognitoClient } = require('../config/aws.config');
                await cognitoClient.send(new AdminDeleteUserCommand({
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: userEmail
                }));
                console.log(`[Auth] Deleted from Cognito: ${userEmail}`);
            } catch (cogErr) {
                console.warn(`[Auth] Cognito delete failed (may already be deleted): ${cogErr.message}`);
            }
        }

        // 2. Delete from local DB — match by both id AND email to be thorough
        db_instance.get('grievances').remove(g => g.userId === userId || g.userId === userEmail).write();
        db_instance.get('notifications').remove(n => n.userId === userId || n.userId === userEmail).write();
        db_instance.get('bookmarks').remove(b => b.userId === userId || b.userId === userEmail).write();
        db_instance.get('users').remove(u => u.id === userId || u.email === userEmail).write();
        console.log(`[Auth] Deleted all local data for: ${userEmail}`);

        return res.status(200).json({
            success: true,
            data: null,
            message: 'Your account and all associated data have been permanently deleted.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── DELETE /api/auth/cleanup/:email (DEV ONLY) ────────────────────────────
// Force-wipe a user from both Cognito and local DB — useful for dev/testing
router.delete('/cleanup/:email', async (req, res, next) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ success: false, error: 'This endpoint is available in development mode only.' });
    }
    try {
        const { email } = req.params;
        const db_instance = db.getDb();

        // Remove from local DB
        db_instance.get('users').remove({ email }).write();
        console.log(`[Cleanup] Removed ${email} from local DB`);

        // Remove from Cognito
        if (isCognito()) {
            try {
                const { AdminDeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
                const { cognitoClient } = require('../config/aws.config');
                await cognitoClient.send(new AdminDeleteUserCommand({
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: email
                }));
                console.log(`[Cleanup] Removed ${email} from Cognito`);
            } catch (e) {
                console.log(`[Cleanup] Cognito delete skipped for ${email}: ${e.message}`);
            }
        }

        return res.status(200).json({ success: true, message: `Cleaned up ${email} from all systems.` });
    } catch (err) {
        next(err);
    }
});

// ─── PUT /api/auth/change-password ────────────────────────────────────────────
// → AWS swap: Cognito forgotPassword / changePassword
router.put('/change-password', protect, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, data: null, message: 'Both current and new password are required.', timestamp: new Date().toISOString() });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, data: null, message: 'New password must be at least 6 characters.', timestamp: new Date().toISOString() });
        }
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        if (!user) {
            return res.status(404).json({ success: false, data: null, message: 'User not found.', timestamp: new Date().toISOString() });
        }
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, data: null, message: 'Current password is incorrect.', timestamp: new Date().toISOString() });
        }
        const hashed = await hashPassword(newPassword);
        db_instance.get('users').find({ id: req.user.id }).assign({ password: hashed, updatedAt: new Date().toISOString() }).write();
        return res.status(200).json({ success: true, data: null, message: 'Password changed successfully.', timestamp: new Date().toISOString() });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/send-otp ───────────────────────────────────────────────────
// → AWS swap: Amazon SNS → Send OTP SMS
router.post('/send-otp', protect, async (req, res, next) => {
    try {
        const { phone } = req.body;
        if (!phone || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({ success: false, data: null, message: 'Valid 10-digit phone number is required.', timestamp: new Date().toISOString() });
        }
        // Mock OTP — AWS SNS swap placeholder
        const otp = '1234'; // In prod: Math.floor(100000 + Math.random() * 900000).toString()
        const db_instance = db.getDb();
        db_instance.get('users').find({ id: req.user.id }).assign({ pendingPhone: phone.replace(/\s/g, ''), pendingOtp: otp, otpExpiry: Date.now() + 5 * 60 * 1000 }).write();
        return res.status(200).json({ success: true, data: { message: 'OTP sent (demo: use 1234)', expiresIn: 300 }, message: 'OTP sent to your mobile.', timestamp: new Date().toISOString() });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/verify-otp ─────────────────────────────────────────────────
// → AWS swap: Amazon Cognito VerifyUserAttribute
router.post('/verify-otp', protect, async (req, res, next) => {
    try {
        const { otp } = req.body;
        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found.', timestamp: new Date().toISOString() });
        if (!user.pendingOtp || user.pendingOtp !== otp) {
            return res.status(400).json({ success: false, data: null, message: 'Invalid OTP. Demo OTP is 1234.', timestamp: new Date().toISOString() });
        }
        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ success: false, data: null, message: 'OTP has expired. Please request a new one.', timestamp: new Date().toISOString() });
        }
        db_instance.get('users').find({ id: req.user.id }).assign({ phone: user.pendingPhone, mobileVerified: true, pendingOtp: null, otpExpiry: null, updatedAt: new Date().toISOString() }).write();
        const updated = db_instance.get('users').find({ id: req.user.id }).value();
        const { password: _, ...userWithoutPassword } = updated;
        return res.status(200).json({ success: true, data: userWithoutPassword, message: 'Mobile number verified successfully!', timestamp: new Date().toISOString() });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/verify-email ──────────────────────────────────────────────
// Real Cognito OTP first, fallback to 123456 demo code
router.post('/verify-email', async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required.', timestamp: new Date().toISOString() });
        }

        if (!isCognito()) {
            // Local mode — just accept 123456
            if (otp === '123456') {
                return res.status(200).json({ success: true, method: 'fallback', message: 'Email verified (demo mode).', timestamp: new Date().toISOString() });
            }
            return res.status(400).json({ success: false, message: 'Invalid OTP. Use 123456 in demo mode.', timestamp: new Date().toISOString() });
        }

        const {
            CognitoIdentityProviderClient,
            ConfirmSignUpCommand,
            AdminConfirmSignUpCommand
        } = require('@aws-sdk/client-cognito-identity-provider');
        const { cognitoClient } = require('../config/aws.config');

        // ── Try real Cognito OTP first ──────────────────────────────────────
        try {
            await cognitoClient.send(new ConfirmSignUpCommand({
                ClientId: process.env.COGNITO_CLIENT_ID,
                Username: email,
                ConfirmationCode: otp
            }));
            console.log(`[Auth] Real OTP verified for ${email}`);
            return res.status(200).json({ success: true, method: 'cognito', message: 'Email verified successfully!', timestamp: new Date().toISOString() });
        } catch (cognitoError) {
            console.log(`[Auth] Real OTP attempt failed: ${cognitoError.name} — ${cognitoError.message}`);

            // ── Handle specific Cognito errors ──────────────────────────────
            if (cognitoError.name === 'ExpiredCodeException') {
                // OTP expired — only accept fallback 123456
                if (otp === '123456') {
                    try { await cognitoClient.send(new AdminConfirmSignUpCommand({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: email })); } catch (_) { /* already confirmed */ }
                    console.log(`[Auth] Fallback OTP used after expiry for ${email}`);
                    return res.status(200).json({ success: true, method: 'fallback', message: 'Email verified via fallback.', timestamp: new Date().toISOString() });
                }
                return res.status(400).json({
                    success: false,
                    errorType: 'EXPIRED',
                    message: 'OTP has expired. Use 123456 to continue or click Resend OTP.',
                    timestamp: new Date().toISOString()
                });
            }

            // ── Already confirmed — check BEFORE generic NotAuthorized ───
            if (
                cognitoError.name === 'NotAuthorizedException' &&
                cognitoError.message?.toLowerCase().includes('confirmed')
            ) {
                // User was auto-confirmed during registration (AdminConfirmSignUp)
                // This is a success, not an error
                console.log(`[Auth] User ${email} is already confirmed — treating as success`);
                return res.status(200).json({ success: true, method: 'already_confirmed', message: 'Email verified successfully.', timestamp: new Date().toISOString() });
            }

            if (cognitoError.name === 'NotAuthorizedException' || cognitoError.name === 'UserNotFoundException'
                || cognitoError.name === 'AliasExistsException') {
                // Other NotAuthorized cases — treat as success (already confirmed, wrong pool, etc.)
                console.log(`[Auth] User ${email} may already be confirmed: ${cognitoError.name}`);
                return res.status(200).json({ success: true, method: 'already_confirmed', message: 'Account already verified.', timestamp: new Date().toISOString() });
            }

            // ── Fallback: accept demo OTP 123456 ───────────────────────────
            if (otp === '123456') {
                try { await cognitoClient.send(new AdminConfirmSignUpCommand({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: email })); } catch (_) { /* already confirmed or not needed */ }
                console.log(`[Auth] Demo OTP fallback used for ${email}`);
                return res.status(200).json({ success: true, method: 'fallback', message: 'Email verified via fallback.', timestamp: new Date().toISOString() });
            }

            // ── Both real OTP and fallback failed ──────────────────────────
            return res.status(400).json({
                success: false,
                errorType: 'MISMATCH',
                message: 'Wrong OTP. Check your email or use 123456 as backup.',
                timestamp: new Date().toISOString()
            });
        }
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
router.post('/resend-otp', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.', timestamp: new Date().toISOString() });
        }

        if (!isCognito()) {
            return res.status(200).json({ success: true, message: 'Demo mode: OTP is always 123456.', timestamp: new Date().toISOString() });
        }

        const { ResendConfirmationCodeCommand } = require('@aws-sdk/client-cognito-identity-provider');
        const { cognitoClient } = require('../config/aws.config');

        await cognitoClient.send(new ResendConfirmationCodeCommand({
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: email
        }));

        console.log(`[Auth] OTP resent for ${email}`);
        return res.status(200).json({ success: true, message: 'New OTP sent to your email.', timestamp: new Date().toISOString() });
    } catch (err) {
        if (err.name === 'InvalidParameterException' || err.name === 'NotAuthorizedException') {
            // User already confirmed
            return res.status(200).json({ success: true, message: 'Account already verified. Please log in.', timestamp: new Date().toISOString() });
        }
        next(err);
    }
});

module.exports = router;
