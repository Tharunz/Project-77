// ============================================
// database.js — lowdb singleton wrapper
// → AWS swap: Replace with DynamoDB DocumentClient
// ============================================

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'local.json');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

const getDb = () => {
    if (!db) {
        const adapter = new FileSync(DB_PATH);
        db = low(adapter);

        // Set default collections if they don't exist
        db.defaults({
            users: [],
            grievances: [],
            schemes: [],
            officers: [],
            preSevaAlerts: [],
            notifications: [],
            communityPosts: [],
            chatHistory: []
        }).write();
    }
    return db;
};

module.exports = { getDb };
