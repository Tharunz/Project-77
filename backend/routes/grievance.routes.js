// ============================================
// grievance.routes.js — Grievance Endpoints
// POST   /api/grievance/file
// GET    /api/grievance/track/:id
// GET    /api/grievance/my-grievances
// GET    /api/grievance/all        (admin)
// PATCH  /api/grievance/update/:id (admin)
// DELETE /api/grievance/:id        (admin)
// GET    /api/grievance/search
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { analyze: analyzeSentiment } = require('../services/sentiment.service');
const { upload, getFileUrl } = require('../services/storage.service');
const { createNotification, sendGrievanceFiledEmail, sendStatusUpdateEmail } = require('../services/notification.service');
const db = require('../db/database');

// ─── POST /api/grievance/file ─────────────────────────────────────────────────
router.post('/file', protect, upload.array('documents', 5), async (req, res, next) => {
    try {
        const { title, description, category, state, district, priority } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false, data: null,
                message: 'Title, description, and category are required.',
                timestamp: new Date().toISOString()
            });
        }

        // Run sentiment analysis on description
        const sentimentResult = analyzeSentiment(description);

        // Handle uploaded documents
        const documents = (req.files || []).map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: getFileUrl(file.filename)
        }));

        const db_instance = db.getDb();

        // Basic duplicate detection (same userId + same title + similar category within 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const similarGrievances = db_instance.get('grievances')
            .filter(g =>
                g.userId === req.user.id &&
                g.category === category &&
                g.createdAt > thirtyDaysAgo
            )
            .value();

        const isDuplicate = similarGrievances.length > 0 &&
            similarGrievances.some(g => g.title.toLowerCase() === title.toLowerCase());

        const grievance = {
            id: `GRV-${uuidv4().slice(0, 8).toUpperCase()}`,
            userId: req.user.id,
            citizenName: req.user.name,
            title: title.trim(),
            description: description.trim(),
            category,
            state: state || 'Unknown',
            district: district || 'Unknown',
            status: 'Pending',
            sentiment: sentimentResult.label,
            sentimentScore: sentimentResult.score,
            priority: priority || sentimentResult.priority,
            assignedOfficer: null,
            documents,
            isDuplicate,
            fraudScore: isDuplicate ? 0.65 : 0.05,
            adminNote: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null
        };

        db_instance.get('grievances').push(grievance).write();

        // Create in-app notification
        createNotification(
            req.user.id,
            `Your grievance "${title}" has been filed. Tracking ID: ${grievance.id}`,
            'success',
            grievance.id
        );

        // Send email (non-blocking)
        const user = db_instance.get('users').find({ id: req.user.id }).value();
        if (user?.email) {
            sendGrievanceFiledEmail(user, grievance).catch(() => { });
        }

        return res.status(201).json({
            success: true,
            data: {
                ...grievance,
                trackingId: grievance.id,
                sentimentAnalysis: sentimentResult
            },
            message: `Grievance filed successfully! Your tracking ID is ${grievance.id}`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/grievance/track/:id ─────────────────────────────────────────────
router.get('/track/:id', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const grievance = db_instance.get('grievances')
            .find(g => g.id === req.params.id.toUpperCase())
            .value();

        if (!grievance) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Grievance not found. Please check your tracking ID.',
                timestamp: new Date().toISOString()
            });
        }

        // Get assigned officer details
        let assignedOfficerDetails = null;
        if (grievance.assignedOfficer) {
            const officer = db_instance.get('users').find({ id: grievance.assignedOfficer }).value();
            if (officer) {
                assignedOfficerDetails = {
                    id: officer.id,
                    name: officer.name,
                    department: officer.department
                };
            }
        }

        // Build timeline
        const timeline = [
            {
                status: 'Filed',
                date: grievance.createdAt,
                note: 'Grievance received and assigned a tracking ID. Under queue for review.'
            }
        ];

        if (grievance.status !== 'Pending') {
            timeline.push({
                status: 'Under Review',
                date: grievance.updatedAt,
                note: 'Your grievance is being reviewed by the concerned officer.'
            });
        }

        if (grievance.status === 'In Progress') {
            timeline.push({
                status: 'In Progress',
                date: grievance.updatedAt,
                note: 'Action is being taken to address your grievance.'
            });
        }

        if (grievance.status === 'Escalated') {
            timeline.push({
                status: 'Escalated',
                date: grievance.updatedAt,
                note: 'Your grievance has been escalated to a senior officer for urgent attention.'
            });
        }

        if (grievance.status === 'Resolved (Pending Verification)') {
            timeline.push({
                status: 'Awaiting Confirmation',
                date: grievance.updatedAt,
                note: 'The department has marked this as resolved. Please verify the work to release funds.'
            });
        }

        if (grievance.status === 'Resolved') {
            timeline.push({
                status: 'Resolved',
                date: grievance.resolvedAt || grievance.updatedAt,
                note: grievance.adminNote || 'Your grievance has been resolved by the concerned department.'
            });
        }

        if (grievance.status === 'Closed') {
            timeline.push({
                status: 'Closed',
                date: grievance.resolvedAt || grievance.updatedAt,
                note: grievance.adminNote || 'This grievance has been closed.'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                ...grievance,
                timeline,
                assignedOfficer: assignedOfficerDetails
            },
            message: 'Grievance details fetched successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/grievance/my-grievances ─────────────────────────────────────────
router.get('/my-grievances', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const { page = 1, limit = 10, status, category, sortBy = 'createdAt', order = 'desc' } = req.query;

        let grievances = db_instance.get('grievances')
            .filter({ userId: req.user.id })
            .value();

        if (status) grievances = grievances.filter(g => g.status === status);
        if (category) grievances = grievances.filter(g => g.category === category);

        // Sort
        grievances.sort((a, b) => {
            if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });

        // Paginate
        const total = grievances.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const data = grievances.slice(start, start + parseInt(limit));

        return res.status(200).json({
            success: true,
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
            message: `Found ${total} grievance(s).`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/grievance/critical ──────────────────────────────────────────────
router.get('/critical', protect, adminOnly, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const grievances = db_instance.get('grievances').value();

        const criticalData = grievances
            .filter(g => g.priority === 'Critical' || g.sentimentScore < 0.3)
            .sort((a, b) => a.sentimentScore - b.sentimentScore);

        return res.status(200).json({
            success: true,
            data: criticalData,
            message: `Found ${criticalData.length} critical grievance(s).`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/grievance/:id/verify ───────────────────────────────────────────
router.post('/:id/verify', protect, async (req, res, next) => {
    try {
        const { action, citizenNote } = req.body; // action: 'verify' | 'reopen'
        const db_instance = db.getDb();

        const grievance = db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).value();

        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found.' });
        }

        if (grievance.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to verify this grievance.' });
        }

        const updates = {
            status: action === 'verify' ? 'Resolved' : 'Reopened',
            updatedAt: new Date().toISOString(),
            citizenFeedback: citizenNote,
            ...(action === 'verify' && { verifiedAt: new Date().toISOString() })
        };

        db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).assign(updates).write();

        return res.status(200).json({
            success: true,
            data: { ...grievance, ...updates },
            message: action === 'verify' ? 'Grievance resolution verified.' : 'Grievance reopened.'
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/grievance/search ────────────────────────────────────────────────
router.get('/search', (req, res, next) => {
    try {
        const { q, state, category, status, priority, page = 1, limit = 20 } = req.query;
        const db_instance = db.getDb();

        let grievances = db_instance.get('grievances').value();

        if (state) grievances = grievances.filter(g => g.state === state);
        if (category) grievances = grievances.filter(g => g.category === category);
        if (status) grievances = grievances.filter(g => g.status === status);
        if (priority) grievances = grievances.filter(g => g.priority === priority);
        if (q) {
            const query = q.toLowerCase();
            grievances = grievances.filter(g =>
                g.title?.toLowerCase().includes(query) ||
                g.description?.toLowerCase().includes(query) ||
                g.id?.toLowerCase().includes(query) ||
                g.citizenName?.toLowerCase().includes(query)
            );
        }

        grievances.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const total = grievances.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const data = grievances.slice(start, start + parseInt(limit));

        return res.status(200).json({
            success: true,
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
            message: `Found ${total} matching grievance(s).`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/grievance/all (admin only) ──────────────────────────────────────
router.get('/all', protect, adminOnly, (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, category, state, priority, sentiment } = req.query;
        const db_instance = db.getDb();

        let grievances = db_instance.get('grievances').value();

        if (status) grievances = grievances.filter(g => g.status === status);
        if (category) grievances = grievances.filter(g => g.category === category);
        if (state) grievances = grievances.filter(g => g.state === state);
        if (priority) grievances = grievances.filter(g => g.priority === priority);
        if (sentiment) grievances = grievances.filter(g => g.sentiment === sentiment);

        grievances.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const total = grievances.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const data = grievances.slice(start, start + parseInt(limit));

        return res.status(200).json({
            success: true,
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
            message: `${total} total grievance(s) found.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── PATCH /api/grievance/update/:id (admin only) ─────────────────────────────
router.patch('/update/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const { status, assignedOfficer, adminNote, priority } = req.body;
        const db_instance = db.getDb();

        const grievance = db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).value();
        if (!grievance) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Grievance not found.',
                timestamp: new Date().toISOString()
            });
        }

        const updates = {
            ...(status && { status }),
            ...(assignedOfficer && { assignedOfficer }),
            ...(adminNote && { adminNote }),
            ...(priority && { priority }),
            updatedAt: new Date().toISOString(),
            ...(status === 'Resolved' && { resolvedAt: new Date().toISOString() })
        };

        db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).assign(updates).write();

        const updated = db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).value();

        // Notify citizen
        if (status) {
            createNotification(
                grievance.userId,
                `Your grievance ${grievance.id} status updated to: ${status}`,
                status === 'Resolved' ? 'success' : 'info',
                grievance.id
            );

            // Email notification (non-blocking)
            const user = db_instance.get('users').find({ id: grievance.userId }).value();
            if (user?.email) {
                sendStatusUpdateEmail(user, updated, status).catch(() => { });
            }
        }

        return res.status(200).json({
            success: true,
            data: updated,
            message: `Grievance ${req.params.id} updated successfully.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── DELETE /api/grievance/:id (admin only) ───────────────────────────────────
router.delete('/:id', protect, adminOnly, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const grievance = db_instance.get('grievances').find({ id: req.params.id.toUpperCase() }).value();

        if (!grievance) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Grievance not found.',
                timestamp: new Date().toISOString()
            });
        }

        db_instance.get('grievances').remove({ id: req.params.id.toUpperCase() }).write();

        return res.status(200).json({
            success: true,
            data: { id: req.params.id },
            message: `Grievance ${req.params.id} deleted successfully.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
