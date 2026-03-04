const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';
let citizenToken = '';
let adminToken = '';

async function loginCitizen() {
    console.log('\n--- Logging in as Citizen ---');
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ramesh@gmail.com', password: 'ramesh123' })
    });
    const data = await res.json();
    if (data.success) {
        citizenToken = data.data.token;
        console.log('✅ Citizen Login Successful');
    } else {
        console.error('❌ Citizen Login Failed:', data.message);
    }
}

async function loginAdmin() {
    console.log('\n--- Logging in as Admin ---');
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@gov.in', password: 'admin123' })
    });
    const data = await res.json();
    if (data.success) {
        adminToken = data.data.token;
        console.log('✅ Admin Login Successful');
    } else {
        console.error('❌ Admin Login Failed:', data.message);
    }
}

async function makeAuthedRequest(endpoint, token, method = 'GET', body = null) {
    console.log(`\nTesting: ${method} ${endpoint}`);
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await res.json();

        if (data.success) {
            console.log(`✅ Success | Message: ${data.message} | Data Length/Preview:`,
                Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length);
            if (Array.isArray(data.data) && data.data.length > 0) {
                console.log('Sample item:', data.data[0]);
            } else if (!Array.isArray(data.data)) {
                console.log('Data:', data.data);
            }
            return data.data;
        } else {
            console.error(`❌ Failed | Status: ${res.status} | Message: ${data.message}`);
            return null;
        }
    } catch (err) {
        console.error(`❌ Error fetching ${endpoint}:`, err.message);
        return null;
    }
}

async function runTests() {
    console.log('====================================');
    console.log('🚀 RUNNING GROUP 5 ENDPOINT TESTS 🚀');
    console.log('====================================');

    await loginCitizen();
    await loginAdmin();

    if (!citizenToken || !adminToken) {
        console.error('❌ Could not obtain tokens. Aborting tests.');
        return;
    }

    // 1. Citizen: Get Seva News
    await makeAuthedRequest('/citizen/news', citizenToken);

    // 2. Citizen: Get Escrow Projects
    const escrowProjects = await makeAuthedRequest('/citizen/escrow', citizenToken);

    // 3. Citizen: Verify Escrow Project
    if (escrowProjects && escrowProjects.length > 0) {
        const testProjectId = escrowProjects[0].id;
        console.log(`\nVerifying project: ${testProjectId}`);
        await makeAuthedRequest(`/citizen/escrow/${testProjectId}/verify`, citizenToken, 'POST', {
            rating: 4,
            photo: 'https://example.com/verified-photo.jpg'
        });
    }

    // 4. Admin: Get Escrow Projects (should see the verification change)
    await makeAuthedRequest('/admin/escrow', adminToken);

    // 5. Admin: Get Ghost Audit Alerts
    await makeAuthedRequest('/admin/ghost-audits', adminToken);

    console.log('\n====================================');
    console.log('🏁 ALL TESTS COMPLETED 🏁');
    console.log('====================================');
}

runTests();
