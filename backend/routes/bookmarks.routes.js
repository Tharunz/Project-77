const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/local');
const dbService = require('../services/db.service');
const { protect } = require('../middleware/auth.middleware');

const BOOKMARKS_TABLE = process.env.DYNAMO_BOOKMARKS_TABLE || 'ncie-bookmarks';

// GET /api/bookmarks/my — Get bookmarked schemes for logged-in user
router.get('/my', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        let bookmarks = [];

        if (dbService.isDynamo()) {
            // Try GSI query with userId-index first, fall back to scan
            try {
                bookmarks = await dbService.query(
                    BOOKMARKS_TABLE,
                    {
                        expression: 'userId = :uid',
                        names: {},
                        values: { ':uid': userId }
                    },
                    { indexName: 'userId-index' }
                ) || [];
            } catch (gsiErr) {
                console.warn('[Bookmarks] GSI query failed, falling back to scan:', gsiErr.message);
                try {
                    const all = await dbService.scan(BOOKMARKS_TABLE) || [];
                    bookmarks = all.filter(b => b.userId === userId);
                } catch (scanErr) {
                    console.error('[Bookmarks] Scan also failed:', scanErr.message);
                    bookmarks = [];
                }
            }
        } else {
            // Fallback: lowdb
            try {
                const db_instance = db.getDb();
                bookmarks = db_instance.get('bookmarks').filter({ userId }).value() || [];
            } catch (_) { bookmarks = []; }
        }

        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.json({ success: true, data: bookmarks });
    } catch (err) {
        console.error('[Bookmarks] GET error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' });
    }
});

// POST /api/bookmarks/add — Add a bookmark
router.post('/add', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { schemeId, name, category, state, description, benefit } = req.body;

        if (!schemeId) {
            return res.status(400).json({ success: false, message: 'schemeId is required' });
        }

        const bookmark = {
            id: uuidv4(),
            userId,
            schemeId,
            name: name || '',
            category: category || '',
            state: state || '',
            description: description || '',
            benefit: benefit || '',
            bookmarkedAt: new Date().toISOString()
        };

        if (dbService.isDynamo()) {
            // Write to DynamoDB (PK: userId, SK: schemeId)
            await dbService.put(BOOKMARKS_TABLE, {
                ...bookmark,
                // DynamoDB table has PK=userId, SK=schemeId
            });
        }

        // Always write to lowdb as well (dual-write)
        try {
            const db_instance = db.getDb();
            const existing = db_instance.get('bookmarks', []).find({ userId, schemeId }).value();
            if (!existing) {
                db_instance.get('bookmarks').push(bookmark).write();
            }
        } catch (e) { /* lowdb may not have bookmarks table */ }

        res.json({ success: true, data: bookmark });
    } catch (err) {
        console.error('[Bookmarks] POST error:', err);
        res.status(500).json({ success: false, message: 'Failed to add bookmark' });
    }
});

// DELETE /api/bookmarks/:schemeId — Remove a bookmark
router.delete('/:schemeId', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { schemeId } = req.params;

        if (dbService.isDynamo()) {
            await dbService.delete(BOOKMARKS_TABLE, { userId, schemeId });
        }

        // Also remove from lowdb
        try {
            const db_instance = db.getDb();
            db_instance.get('bookmarks').remove({ userId, schemeId }).write();
        } catch (e) { /* ignore */ }

        res.json({ success: true, message: 'Bookmark removed' });
    } catch (err) {
        console.error('[Bookmarks] DELETE error:', err);
        res.status(500).json({ success: false, message: 'Failed to remove bookmark' });
    }
});

module.exports = router;
