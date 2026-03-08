// Test Cognito login via the live API
require('dotenv').config();
const http = require('http');

const data = JSON.stringify({ email: 'ramesh@gmail.com', password: 'Ramesh@12345' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(body);
        console.log('Status:', res.statusCode);
        if (parsed.success) {
            console.log('\n✅ Cognito login working!');
            console.log('Token:', parsed.data.token?.slice(0, 50) + '...');
            if (parsed.data.accessToken) {
                console.log('Cognito AccessToken:', parsed.data.accessToken.slice(0, 50) + '...');
                console.log('Cognito IdToken:', parsed.data.idToken?.slice(0, 50) + '...');
            }
        } else {
            console.log('\n❌ Login failed:', parsed.message);
        }
    });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(data);
req.end();
