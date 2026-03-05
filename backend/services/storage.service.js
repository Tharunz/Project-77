// ============================================
// storage.service.js — File Storage (local disk)
// → AWS swap: Replace with Amazon S3 SDK
// ============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
    }
});

// File type filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Audio types for Audio Grievance feature
        'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav',
        'audio/mp4', 'audio/x-m4a', 'audio/aac', 'video/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed.`), false);
    }
};

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 10;

/**
 * Multer upload instance for document uploads.
 * → AWS S3: Use @aws-sdk/client-s3 with presigned URLs or direct upload
 */
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }
});

/**
 * Get the public URL for a stored file.
 * → AWS S3: Return s3.getSignedUrl or CloudFront URL
 */
const getFileUrl = (filename) => {
    const PORT = process.env.PORT || 5000;
    return `http://localhost:${PORT}/uploads/${filename}`;
};

/**
 * Delete a file from storage.
 * → AWS S3: s3.deleteObject({ Bucket, Key })
 */
const deleteFile = (filename) => {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

module.exports = { upload, getFileUrl, deleteFile };
