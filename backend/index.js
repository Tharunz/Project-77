// ============================================
// index.js — Project-77 Backend Entry Point
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
        message: 'Project-77 Backend is running. Jai Hind! 🇮🇳',
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
        console.log('║        🇮🇳  PROJECT-77 BACKEND  🇮🇳                   ║');
        console.log('║   AI-Powered Citizen Services Super-Platform          ║');
        console.log('║   AI ASCEND 2026 — AWS & Kyndryl Hackathon            ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log(`║   Server:    http://localhost:${PORT}                    ║`);
        console.log(`║   Health:    http://localhost:${PORT}/api/health          ║`);
        console.log(`║   Env:       ${(process.env.NODE_ENV || 'development').padEnd(42)}║`);
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║   GROUP 1 Routes:                                     ║');
        console.log(`║   POST  /api/auth/register                            ║`);
        console.log(`║   POST  /api/auth/login                               ║`);
        console.log(`║   POST  /api/grievance/file                           ║`);
        console.log(`║   GET   /api/grievance/track/:id                      ║`);
        console.log(`║   GET   /api/schemes                                  ║`);
        console.log(`║   GET   /api/admin/dashboard                          ║`);
        console.log(`║   POST  /api/chatbot/message                          ║`);
        console.log(`║   GET   /api/preseva/alerts                           ║`);
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║   GROUP 2 Routes:                                     ║');
        console.log(`║   GET   /api/schemes/recommend          [#11]         ║`);
        console.log(`║   GET   /api/schemes/eligibility-check  [#12]         ║`);
        console.log(`║   POST  /api/schemes/benefit-gap        [#13]         ║`);
        console.log(`║   GET   /api/schemes/time-machine       [#14]         ║`);
        console.log(`║   GET   /api/schemes/benefit-roadmap    [NEW]         ║`);
        console.log(`║   GET   /api/admin/grievances           [#15]         ║`);
        console.log(`║   GET   /api/admin/analytics            [#16]         ║`);
        console.log(`║   GET   /api/admin/officers/leaderboard [#17]         ║`);
        console.log(`║   GET   /api/admin/sla-tracker          [#18]         ║`);
        console.log(`║   GET   /api/admin/fraud-alerts         [#19]         ║`);
        console.log(`║   GET   /api/grievance/search           [#20]         ║`);
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log('');
    });
};

startServer().catch(err => {
    console.error('[FATAL] Server startup failed:', err.message);
    process.exit(1);
});

module.exports = app;
