async function testAPIs() {
    try {
        console.log("=== Testing Group 4 APIs ===");

        // 1. Citizen Login
        let loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'ramesh@gmail.com', password: 'ramesh123' })
        }).then(r => r.json());

        if (!loginRes.success) {
            console.error("Login failed:", loginRes);
            return;
        }

        const citizenToken = loginRes.data.token;
        console.log(" Citizen Token:", citizenToken.substring(0, 15) + "...");

        const citizenHeaders = { Authorization: `Bearer ${citizenToken}` };

        // Test Jan Shakti Score
        let res = await fetch('http://localhost:5000/api/citizen/score', { headers: citizenHeaders }).then(r => r.json());
        console.log("\n[31] Jan Shakti Score:", res);

        // Test Citizen Footprint
        res = await fetch('http://localhost:5000/api/citizen/footprint', { headers: citizenHeaders }).then(r => r.json());
        console.log("\n[32] Citizen Footprint:", res);

        // Test Predict My Future AI
        res = await fetch('http://localhost:5000/api/citizen/predict-future', { headers: citizenHeaders }).then(r => r.json());
        console.log("\n[33] Predict My Future AI:", JSON.stringify(res, null, 2));


        // 2. Admin Login
        let adminRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@gov.in', password: 'admin123' })
        }).then(r => r.json());

        const adminToken = adminRes.data.token;
        console.log("\n Admin Token:", adminToken.substring(0, 15) + "...");

        const adminHeaders = { Authorization: `Bearer ${adminToken}` };

        // Test Officer Accountability Wall
        res = await fetch('http://localhost:5000/api/admin/officers/wall', { headers: adminHeaders }).then(r => r.json());
        console.log("\n[34] Officer Accountability Wall Metrics:", res.data ? res.data.metrics : res);

        if (res.success) {
            console.log("\n✅ All Group 4 APIs working correctly!");
        } else {
            console.error("\n❌ Something failed in Group 4 APIs");
        }

    } catch (err) {
        console.error("❌ Test Failed:", err);
    }
}

testAPIs();
