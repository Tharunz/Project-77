// ============================================
// notification.routes.js — In-App Notifications
// POST /api/notification/send
// GET  /api/notification/history/:userId
// PATCH /api/notification/:id/read
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { sendEmail, createNotification } = require('../services/notification.service');
const db = require('../db/database');

// ─── POST /api/notification/send (admin) ──────────────────────────────────────
router.post('/send', protect, adminOnly, async (req, res, next) => {
    console.log(`[ROUTE HIT] POST /notification/send - user: ${req.user?.id || 'none'}`);
    try {
        const { userId, message, type = 'info', grievanceId, sendEmail: doEmail = false, emailSubject, emailBody } = req.body;

        if (!userId || !message) {
            return res.status(400).json({
                success: false, data: null,
                message: 'userId and message are required.',
                timestamp: new Date().toISOString()
            });
        }

        const notification = createNotification(userId, message, type, grievanceId || null);

        // Optionally send email
        let emailResult = null;
        if (doEmail) {
            const db_instance = db.getDb();
            const user = db_instance.get('users').find({ id: userId }).value();
            if (user?.email) {
                emailResult = await sendEmail(user.email, emailSubject || 'Notification from Project NCIE', emailBody || `<p>${message}</p>`);
            }
        }

        return res.status(201).json({
            success: true,
            data: { notification, emailResult },
            message: 'Notification sent successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/notification ──────────────────────────────────────────────────────
router.get('/', protect, (req, res, next) => {
    console.log(`[ROUTE HIT] GET /notification - user: ${req.user?.id || 'none'}`);
    try {
        const db_instance = db.getDb();
        const notifications = db_instance.get('notifications')
            .filter({ userId: req.user.id })
            .value()
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

        const unread = notifications.filter(n => !n.isRead).length;

        return res.status(200).json({
            success: true,
            data: notifications,
            meta: { total: notifications.length, unread },
            message: `${notifications.length} notification(s) fetched.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/notification/history/:userId ────────────────────────────────────
router.get('/history/:userId', protect, (req, res, next) => {
    console.log(`[ROUTE HIT] GET /notification/history/${req.params.userId} - user: ${req.user?.id || 'none'}`);
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({
                success: false, data: null,
                message: 'Access denied.',
                timestamp: new Date().toISOString()
            });
        }

        const db_instance = db.getDb();
        const notifications = db_instance.get('notifications')
            .filter({ userId: req.params.userId })
            .value()
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

        const unread = notifications.filter(n => !n.isRead).length;

        return res.status(200).json({
            success: true,
            data: notifications,
            meta: { total: notifications.length, unread },
            message: `${notifications.length} notification(s) fetched.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── PATCH /api/notification/:id/read ────────────────────────────────────────
router.patch('/:id/read', protect, (req, res, next) => {
    console.log(`[ROUTE HIT] PATCH /notification/${req.params.id}/read - user: ${req.user?.id || 'none'}`);
    try {
        const db_instance = db.getDb();
        const notification = db_instance.get('notifications').find({ id: req.params.id }).value();

        if (!notification) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Notification not found.',
                timestamp: new Date().toISOString()
            });
        }

        if (req.user.role !== 'admin' && notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false, data: null,
                message: 'Access denied.',
                timestamp: new Date().toISOString()
            });
        }

        db_instance.get('notifications').find({ id: req.params.id }).assign({ isRead: true }).write();

        return res.status(200).json({
            success: true,
            data: db_instance.get('notifications').find({ id: req.params.id }).value(),
            message: 'Notification marked as read.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── PATCH /api/notification/mark-all-read ───────────────────────────────────
router.patch('/mark-all-read', protect, (req, res, next) => {
    console.log(`[ROUTE HIT] PATCH /notification/mark-all-read - user: ${req.user?.id || 'none'}`);
    try {
        const db_instance = db.getDb();
        const notifications = db_instance.get('notifications')
            .filter({ userId: req.user.id, isRead: false })
            .value();

        notifications.forEach(n => {
            db_instance.get('notifications').find({ id: n.id }).assign({ isRead: true }).write();
        });

        return res.status(200).json({
            success: true,
            data: { markedRead: notifications.length },
            message: `${notifications.length} notification(s) marked as read.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
