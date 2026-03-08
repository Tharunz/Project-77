// ============================================
// community.routes.js — Community Posts + Mass Petition Engine
//
// COMMUNITY POSTS (Feature 29):
//   GET    /api/community/posts               — list all posts (filter: state, category, type)
//   POST   /api/community/posts               — create new post
//   GET    /api/community/posts/:id           — single post detail
//   POST   /api/community/posts/:id/vote      — upvote a post
//   POST   /api/community/posts/:id/respond   — add response
//
// MASS PETITIONS (Feature 30):
//   GET    /api/community/petitions           — list all petitions
//   POST   /api/community/petitions           — create new petition
//   POST   /api/community/petitions/:id/sign  — sign a petition (no duplicates)
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth.middleware');
const db = require('../db/database');

// ─── GET /api/community/posts ───────────────────────────────────────────────────────
// List community posts with optional filters. Public endpoint.
router.get('/posts', (req, res, next) => {
    console.log(`[ROUTE HIT] GET /community/posts`);
    try {
        const db_instance = db.getDb();
        const { state, category, search, page = 1, limit = 20 } = req.query;

        let posts = db_instance.get('communityPosts')
            .filter(p => !p.isPetition)
            .value();

        // Filters
        if (state) posts = posts.filter(p => p.state?.toLowerCase() === state.toLowerCase());
        if (category) posts = posts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        if (search) {
            const lw = search.toLowerCase();
            posts = posts.filter(p =>
                p.title?.toLowerCase().includes(lw) ||
                p.content?.toLowerCase().includes(lw)
            );
        }

        // Sort by votes descending
        posts = posts.sort((a, b) => (b.votes || 0) - (a.votes || 0));

        // Pagination
        const total = posts.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const paginated = posts.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        return res.status(200).json({
            success: true,
            data: paginated,
            meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            message: `${total} community post(s) found.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/community/posts ────────────────────────────────────────────────
// Create a new community post
router.post('/posts', protect, (req, res, next) => {
    try {
        const { title, content, category, state } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false, data: null,
                message: 'title and content are required.',
                timestamp: new Date().toISOString()
            });
        }

        const db_instance = db.getDb();
        const author = db_instance.get('users').find({ id: req.user.id }).value();

        const post = {
            id: `POST-${uuidv4().slice(0, 8).toUpperCase()}`,
            userId: req.user.id,
            authorName: author?.name || 'Citizen',
            title: title.trim(),
            content: content.trim(),
            category: category || 'General',
            state: state || author?.state || 'All India',
            votes: 0,
            voters: [],          // track who voted (prevent duplicate votes)
            isPetition: false,
            responses: [],
            createdAt: new Date().toISOString()
        };

        db_instance.get('communityPosts').push(post).write();

        return res.status(201).json({
            success: true,
            data: post,
            message: 'Community post created successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/community/posts/:id ─────────────────────────────────────────────
// Single post detail
router.get('/posts/:id', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const post = db_instance.get('communityPosts').find({ id: req.params.id }).value();

        if (!post) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Post not found.',
                timestamp: new Date().toISOString()
            });
        }

        return res.status(200).json({
            success: true,
            data: post,
            message: 'Post fetched.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/community/posts/:id/vote ──────────────────────────────────────
// Upvote a community post (one vote per user, toggle support)
router.post('/posts/:id/vote', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const post = db_instance.get('communityPosts').find({ id: req.params.id }).value();

        if (!post) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Post not found.',
                timestamp: new Date().toISOString()
            });
        }

        const voters = post.voters || [];
        const userId = req.user.id || req.user.userId;
        const alreadyVoted = voters.includes(userId);

        let newVotes;
        let newVoters;
        let action;

        if (alreadyVoted) {
            // Remove vote (toggle off)
            newVoters = voters.filter(v => v !== userId);
            newVotes = Math.max(0, (post.votes || 0) - 1);
            action = 'removed';
        } else {
            // Add vote
            newVoters = [...voters, userId];
            newVotes = (post.votes || 0) + 1;
            action = 'added';
        }

        db_instance.get('communityPosts').find({ id: req.params.id })
            .assign({ votes: newVotes, voters: newVoters })
            .write();

        return res.status(200).json({
            success: true,
            data: { id: req.params.id, votes: newVotes, action },
            message: `Vote ${action} successfully.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/community/posts/:id/respond ────────────────────────────────────
// Add a response/reply to a post
router.post('/posts/:id/respond', protect, (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false, data: null,
                message: 'content is required.',
                timestamp: new Date().toISOString()
            });
        }

        const db_instance = db.getDb();
        const post = db_instance.get('communityPosts').find({ id: req.params.id }).value();

        if (!post) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Post not found.',
                timestamp: new Date().toISOString()
            });
        }

        const author = db_instance.get('users').find({ id: req.user.id }).value();
        const response = {
            id: `RESP-${uuidv4().slice(0, 8).toUpperCase()}`,
            userId: req.user.id,
            authorName: author?.name || 'Citizen',
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        const updatedResponses = [...(post.responses || []), response];
        db_instance.get('communityPosts').find({ id: req.params.id })
            .assign({ responses: updatedResponses })
            .write();

        return res.status(201).json({
            success: true,
            data: response,
            message: 'Response added to post.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/community/petitions ────────────────────────────────────────────
// List all mass petitions (isPetition: true)
router.get('/petitions', (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const { state, category, search, page = 1, limit = 20 } = req.query;

        let petitions = db_instance.get('communityPosts')
            .filter(p => p.isPetition === true)
            .value();

        if (state) petitions = petitions.filter(p => p.state?.toLowerCase() === state.toLowerCase());
        if (category) petitions = petitions.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        if (search) {
            const lw = search.toLowerCase();
            petitions = petitions.filter(p =>
                p.title?.toLowerCase().includes(lw) ||
                p.content?.toLowerCase().includes(lw)
            );
        }

        // Sort by signatories (petitionCount) desc
        petitions = petitions.sort((a, b) => (b.petitionCount || 0) - (a.petitionCount || 0));

        const total = petitions.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const paginated = petitions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        return res.status(200).json({
            success: true,
            data: paginated,
            meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            message: `${total} active petition(s) found.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/community/petitions ───────────────────────────────────────────
// Create a new mass petition
router.post('/petitions', protect, (req, res, next) => {
    try {
        const { title, content, category, state, targetSignatures } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false, data: null,
                message: 'title and content are required.',
                timestamp: new Date().toISOString()
            });
        }

        const db_instance = db.getDb();
        const author = db_instance.get('users').find({ id: req.user.id }).value();

        const petition = {
            id: `PET-${uuidv4().slice(0, 8).toUpperCase()}`,
            userId: req.user.id,
            authorName: author?.name || 'Citizen',
            title: title.trim(),
            content: content.trim(),
            category: category || 'General',
            state: state || author?.state || 'All India',
            votes: 1,               // creator automatically signs
            voters: [req.user.id],
            isPetition: true,
            petitionCount: 1,       // signature count
            signers: [req.user.id], // track unique signers
            targetSignatures: targetSignatures || 1000,
            status: 'active',
            responses: [],
            createdAt: new Date().toISOString()
        };

        db_instance.get('communityPosts').push(petition).write();

        return res.status(201).json({
            success: true,
            data: petition,
            message: 'Petition created. You have been added as the first signatory.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/community/petitions/:id/sign ───────────────────────────────────
// Sign a mass petition (prevents duplicate signatures)
router.post('/petitions/:id/sign', protect, (req, res, next) => {
    try {
        const db_instance = db.getDb();
        const petition = db_instance.get('communityPosts').find({ id: req.params.id }).value();

        if (!petition) {
            return res.status(404).json({
                success: false, data: null,
                message: 'Petition not found.',
                timestamp: new Date().toISOString()
            });
        }

        if (!petition.isPetition) {
            return res.status(400).json({
                success: false, data: null,
                message: 'This post is not a petition.',
                timestamp: new Date().toISOString()
            });
        }

        const signers = petition.signers || [];
        const userId = req.user.id || req.user.userId;

        if (signers.includes(userId)) {
            return res.status(409).json({
                success: false, data: null,
                message: 'You have already signed this petition.',
                timestamp: new Date().toISOString()
            });
        }

        const newSigners = [...signers, userId];
        const newCount = (petition.petitionCount || 0) + 1;
        const newVotes = (petition.votes || 0) + 1;
        const newVoters = [...(petition.voters || []), userId];

        // Check if petition reached target
        const targetReached = newCount >= (petition.targetSignatures || 1000);
        const newStatus = targetReached ? 'target_reached' : 'active';

        db_instance.get('communityPosts').find({ id: req.params.id })
            .assign({
                signers: newSigners,
                petitionCount: newCount,
                votes: newVotes,
                voters: newVoters,
                status: newStatus
            })
            .write();

        return res.status(200).json({
            success: true,
            data: {
                id: req.params.id,
                petitionCount: newCount,
                targetSignatures: petition.targetSignatures || 1000,
                targetReached,
                status: newStatus
            },
            message: targetReached
                ? `Petition target of ${petition.targetSignatures || 1000} signatures reached! 🎉`
                : `You signed the petition. ${newCount} signature(s) so far.`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
