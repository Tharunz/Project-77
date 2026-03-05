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
const bookmarksRoutes = require('./routes/bookmarks.routes');

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
app.use('/api/bookmarks', bookmarksRoutes);

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────
const startServer = async () => {
    // Auto-seed database if empty
    await seed();

    app.listen(PORT, () => {
        console.log(`\n[NCIE] Backend running on http://localhost:${PORT}`);
        console.log(`[NCIE] AWS Region: ${process.env.AWS_REGION || 'not set'}`);
        console.log(`[NCIE] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[NCIE] Health check: http://localhost:${PORT}/api/health\n`);
    });
};

startServer().catch(err => {
    console.error('[FATAL] Server startup failed:', err.message);
    process.exit(1);
});

module.exports = app;
