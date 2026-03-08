// ============================================
// storage.service.js — File Storage with Feature Flag
// ENABLE_S3=false → local multer disk storage (existing)
// ENABLE_S3=true  → AWS S3
// ============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'ncie-documents-tharun';

// Ensure local upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const isS3 = () => process.env.ENABLE_S3 === 'true';

// ─── Lazy S3 client ────────────────────────────────────────────────────────────
let _s3Client = null;
const getS3Client = () => {
    if (!_s3Client) {
        const { s3Client } = require('../config/aws.config');
        _s3Client = s3Client;
    }
    return _s3Client;
};

// ─── Lazy S3 presigner ─────────────────────────────────────────────────────────
let _getSignedUrlFn = null;
const getSignedUrlFn = async () => {
    if (!_getSignedUrlFn) {
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
        _getSignedUrlFn = getSignedUrl;
    }
    return _getSignedUrlFn;
};

// =============================================================================
// S3 IMPLEMENTATIONS
// =============================================================================

const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

/**
 * uploadFile — Upload a file buffer to S3
 * Returns: public S3 URL string
 */
const uploadFileToS3 = async (fileBuffer, fileName, folder = 'grievance-documents', mimeType = 'application/octet-stream') => {
    const client = getS3Client();
    const key = `${folder}/${Date.now()}-${fileName}`;

    await client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType
    }));

    // Return S3 URL (public-accessible or through pre-signed)
    const url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { url, key };
};

/**
 * getSignedUrl — Generate a temporary pre-signed download URL
 */
const getSignedUrlS3 = async (key, expiresIn = 3600) => {
    const client = getS3Client();
    const getUrl = await getSignedUrlFn();
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    return await getUrl(client, command, { expiresIn });
};

/**
 * deleteFile — Delete a file from S3
 */
const deleteFileFromS3 = async (key) => {
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
};

/**
 * uploadBase64 — Convert base64 string to buffer and upload to S3
 */
const uploadBase64ToS3 = async (base64String, fileName, folder = 'grievance-documents') => {
    // Strip data URI prefix if present (e.g. "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
    const mimeMatch = base64String.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const buffer = Buffer.from(base64Data, 'base64');
    return await uploadFileToS3(buffer, fileName, folder, mimeType);
};

// =============================================================================
// LOCAL STORAGE IMPLEMENTATIONS (unchanged)
// =============================================================================

// Multer disk storage config
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
    }
});

// ─── Multer memory storage for S3 uploads ─────────────────────────────────────
// When S3 is enabled, we buffer files in memory then push to S3
const memoryStorage = multer.memoryStorage();

// File type filter (shared)
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

// ─── The upload middleware — switches based on ENABLE_S3 flag at request time
// Using a wrapper so it reads the flag on each request, not at module load
const diskUpload = multer({ storage: diskStorage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 } });
const memoryUpload = multer({ storage: memoryStorage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 } });

// Proxy that delegates to either s3 (memory) or local (disk) upload dynamically
const upload = {
    array: (field, maxCount) => (req, res, next) => {
        const instance = isS3() ? memoryUpload : diskUpload;
        instance.array(field, maxCount)(req, res, next);
    },
    single: (field) => (req, res, next) => {
        const instance = isS3() ? memoryUpload : diskUpload;
        instance.single(field)(req, res, next);
    },
    fields: (fields) => (req, res, next) => {
        const instance = isS3() ? memoryUpload : diskUpload;
        instance.fields(fields)(req, res, next);
    },
    none: () => (req, res, next) => {
        const instance = isS3() ? memoryUpload : diskUpload;
        instance.none()(req, res, next);
    }
};

/**
 * getFileUrl — Get the URL for a stored file
 * Local: constructs localhost URL
 * S3: constructs S3 URL (or can be pre-signed)
 */
const getFileUrl = (filename) => {
    if (isS3()) {
        // filename is expected to be the S3 key when S3 is enabled
        return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
    }
    const PORT = process.env.PORT || 5000;
    return `http://localhost:${PORT}/uploads/${filename}`;
};

/**
 * deleteFile — Delete a file from storage
 * Local: deletes from disk
 * S3: deletes from S3 bucket
 */
const deleteFile = async (filename) => {
    if (isS3()) {
        return await deleteFileFromS3(filename);
    }
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

/**
 * processUploadedFiles — Called after multer middleware runs.
 * If S3 enabled, pushes buffered files to S3 and returns S3 URLs.
 * If local, converts disk files to URL objects as before.
 */
const processUploadedFiles = async (files = [], folder = 'grievance-documents') => {
    if (!files || files.length === 0) return [];

    if (isS3()) {
        const results = [];
        for (const file of files) {
            const { url, key } = await uploadFileToS3(
                file.buffer,
                file.originalname,
                folder,
                file.mimetype
            );
            results.push({
                filename: key,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                url
            });
        }
        return results;
    }

    // Local: files already have .filename set by diskStorage
    return files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: getFileUrl(file.filename)
    }));
};

module.exports = {
    upload,
    getFileUrl,
    deleteFile,
    // S3-specific exports
    uploadFile: uploadFileToS3,
    getSignedUrl: getSignedUrlS3,
    deleteFileFromS3,
    uploadBase64: uploadBase64ToS3,
    processUploadedFiles,
    isS3,
    S3_BUCKET
};
