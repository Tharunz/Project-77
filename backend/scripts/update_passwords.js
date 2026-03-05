// Script: update demo user passwords in local.json to new credentials
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../db/local.json');

async function main() {
    const citizenHash = await bcrypt.hash('Ramesh@12345', 10);
    const adminHash = await bcrypt.hash('Admin@12345', 10);

    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const data = JSON.parse(raw);

    let citizenUpdated = false;
    let adminUpdated = false;

    (data.users || []).forEach(u => {
        if (u.email === 'ramesh@gmail.com') {
            u.password = citizenHash;
            u.role = 'citizen';
            citizenUpdated = true;
            console.log('[UPDATE] ramesh@gmail.com → Ramesh@12345 ✅');
        }
        if (u.email === 'admin@gov.in') {
            u.password = adminHash;
            u.role = 'admin';
            adminUpdated = true;
            console.log('[UPDATE] admin@gov.in → Admin@12345 ✅');
        }
    });

    if (!citizenUpdated) console.warn('[WARN] ramesh@gmail.com not found in DB — seed first');
    if (!adminUpdated) console.warn('[WARN] admin@gov.in not found in DB — seed first');

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    console.log('[DONE] local.json updated.');
}

main().catch(console.error);
