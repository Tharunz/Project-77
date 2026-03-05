// ============================================
// index.js — Project NCIE Backend Entry Point
// Express server with all routes mounted
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const grievanceRoutes = require('./routes/grievance.routes');
const schemesRoutes = require('./routes/schemes.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const adminRoutes = require('./routes/admin.routes');
const ocrRoutes = require('./routes/ocr.routes');
const presevaRoutes = require('./routes/preseva.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');

// Group 3 Routes
const translateRoutes = require('./routes/translate.routes');
const heatmapRoutes = require('./routes/heatmap.routes');
const communityRoutes = require('./routes/community.routes');

// Group 4 & 5 Routes
const citizenRoutes = require('./routes/citizen.routes');
const pollyRoutes = require('./routes/polly.routes');
const escrowRoutes = require('./routes/escrow.routes');

// ─── Import Middleware ────────────────────────────────────────────────────────
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');

// ─── Import Seed ─────────────────────────────────────────────────────────────
const { seed } = require('./db/seed');

// ─── App Init ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ─── Static Files (uploaded documents) ───────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'healthy',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime()
        },
        message: 'Project NCIE Backend is running. Jai Hind! 🇮🇳',
        timestamp: new Date().toISOString()
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/grievance', grievanceRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/preseva', presevaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notification', notificationRoutes);

// Group 3 Routes
app.use('/api/translate', translateRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/community', communityRoutes);

// Group 4 & 5 Routes
app.use('/api/citizen', citizenRoutes);
app.use('/api/polly', pollyRoutes);
app.use('/api/escrow', escrowRoutes);

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────
const startServer = async () => {
    // Auto-seed database if empty
    await seed();

    app.listen(PORT, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║        🇮🇳  PROJECT NCIE BACKEND  🇮🇳                 ║');
        console.log('║   AI-Powered Citizen Services Super-Platform          ║');
        console.log('║   AI ASCEND 2026 — AWS & Kyndryl Hackathon            ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log(`║   Server:    http://localhost:${PORT}                    ║`);
        console.log(`║   Health:    http://localhost:${PORT}/api/health          ║`);
        console.log(`║   Env:       ${(process.env.NODE_ENV || 'development').padEnd(42)}║`);
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║   GROUP 1 & 2 Core Routes:                           ║');
        console.log(`║   POST /api/auth/register|login                      ║`);
        console.log(`║   GET  /api/schemes + /api/admin/dashboard            ║`);
        console.log(`║   GET  /api/schemes/recommend|eligibility-check       ║`);
        console.log(`║   GET  /api/admin/officers/leaderboard|sla-tracker    ║`);
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║   GROUP 3 Routes:                                     ║');
        console.log(`║   POST /api/chatbot/message              [#21]       ║`);
        console.log(`║   POST /api/translate                    [#22]       ║`);
        console.log(`║   GET  /api/translate/languages          [#22]       ║`);
        console.log(`║   POST /api/ocr/extract                  [#23]       ║`);
        console.log(`║   POST /api/notification/send            [#25]       ║`);
        console.log(`║   GET  /api/preseva/predictions          [#26]       ║`);
        console.log(`║   GET  /api/preseva/threat-corridors     [#27]       ║`);
        console.log(`║   GET  /api/heatmap                      [#28]       ║`);
        console.log(`║   GET  /api/heatmap/summary              [#28]       ║`);
        console.log(`║   GET  /api/community/posts              [#29]       ║`);
        console.log(`║   POST /api/community/posts/:id/vote     [#29]       ║`);
        console.log(`║   GET  /api/community/petitions          [#30]       ║`);
        console.log(`║   POST /api/community/petitions/:id/sign [#30]       ║`);
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║   GROUP 4 & 5 Routes:                                 ║');
        console.log(`║   GET   /api/citizen/score              [#31]         ║`);
        console.log(`║   GET   /api/citizen/footprint          [#32]         ║`);
        console.log(`║   GET   /api/citizen/predict-future     [#33]         ║`);
        console.log(`║   GET   /api/admin/officers/wall        [#34]         ║`);
        console.log(`║   GET   /api/citizen/news               [#35]         ║`);
        console.log(`║   GET   /api/citizen/escrow             [#36]         ║`);
        console.log(`║   POST  /api/citizen/escrow/:id/verify  [#37]         ║`);
        console.log(`║   GET   /api/admin/escrow               [#38]         ║`);
        console.log(`║   GET   /api/admin/ghost-audits         [#39]         ║`);
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log('');
    });
};

startServer().catch(err => {
    console.error('[FATAL] Server startup failed:', err.message);
    process.exit(1);
});

module.exports = app;
