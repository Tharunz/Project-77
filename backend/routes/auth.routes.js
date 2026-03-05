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
                    return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists.', timestamp: new Date().toISOString() });
                }
                throw cogErr;
            }
        }

        // ── Local JWT path ────────────────────────────────────────────────────
        const db_instance = db.getDb();
        const existing = db_instance.get('users').find({ email: email.toLowerCase() }).value();
        if (existing) {
            return res.status(409).json({
                success: false,
                data: null,
                message: 'An account with this email already exists.',
                timestamp: new Date().toISOString()
            });
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
router.put('/profile', protect, (req, res, next) => {
    try {
        const { name, email, state, district, age, income, gender } = req.body;

        const db_instance = db.getDb();
        const user = db_instance.get('users').find({ id: req.user.id }).value();

        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'User not found.',
                timestamp: new Date().toISOString()
            });
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

        db_instance.get('users').find({ id: req.user.id }).assign(updates).write();

        const updatedUser = db_instance.get('users').find({ id: req.user.id }).value();
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
        const db_instance = db.getDb();

        // ── Cognito: delete user from Cognito user pool ─────────────────────
        if (process.env.ENABLE_COGNITO === 'true') {
            try {
                const { AdminDeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
                const { cognitoClient } = require('../config/aws.config');
                await cognitoClient.send(new AdminDeleteUserCommand({
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: req.user.email
                }));
                console.log(`[COGNITO] Deleted user: ${req.user.email}`);
            } catch (cogErr) {
                console.error('[COGNITO] Delete user error:', cogErr.message);
                // Continue to delete local data even if Cognito fails
            }
        }

        // ── Local DB cleanup ────────────────────────────────────────────────
        db_instance.get('grievances').remove(g => g.userId === userId || g.userId === req.user.email).write();
        db_instance.get('notifications').remove(n => n.userId === userId || n.userId === req.user.email).write();
        db_instance.get('users').remove(u => u.id === userId || u.email === req.user.email).write();

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

module.exports = router;
