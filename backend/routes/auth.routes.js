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
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const { protect } = require('../middleware/auth.middleware');
const db = require('../db/database');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, state, district, age, income, gender } = req.body;

        // Validation
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

        const db_instance = db.getDb();

        // Check for existing user
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
            message: 'Account created successfully. Welcome to Project-77!',
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
        const user = db_instance.get('users').find({ id: req.user.id }).value();

        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'User not found.',
                timestamp: new Date().toISOString()
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        // Get user's grievance stats
        const grievances = db_instance.get('grievances').filter({ userId: user.id }).value();
        const resolved = grievances.filter(g => g.status === 'Resolved').length;

        return res.status(200).json({
            success: true,
            data: {
                ...userWithoutPassword,
                stats: {
                    totalGrievances: grievances.length,
                    resolvedGrievances: resolved,
                    pendingGrievances: grievances.length - resolved
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
        const { name, state, district, age, income, gender } = req.body;

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

        const updates = {
            ...(name && { name: name.trim() }),
            ...(state && { state }),
            ...(district && { district }),
            ...(age && { age: parseInt(age) }),
            ...(income !== undefined && { income: parseInt(income) }),
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

module.exports = router;
