// Test S3 upload directly
require('dotenv').config();
const { uploadFile, getSignedUrl, S3_BUCKET } = require('./services/storage.service');

async function test() {
    console.log('ENABLE_S3:', process.env.ENABLE_S3);
    console.log('S3 Bucket:', S3_BUCKET);

    // Create a simple test file buffer
    const testContent = `Test document uploaded at ${new Date().toISOString()}\nBucket: ${S3_BUCKET}\nProject NCIE - AWS Integration Test`;
    const buffer = Buffer.from(testContent);

    try {
        // Upload test file
        console.log('\n📤 Uploading test file to S3...');
        const { url, key } = await uploadFile(buffer, 'test-document.txt', 'grievance-documents', 'text/plain');
        console.log('✅ Upload successful!');
        console.log('   S3 URL:', url);
        console.log('   S3 Key:', key);

        // Get pre-signed URL
        console.log('\n🔗 Generating pre-signed URL...');
        const signedUrl = await getSignedUrl(key, 3600);
        console.log('✅ Pre-signed URL generated!');
        console.log('   Expires in: 1 hour');
        console.log('   URL:', signedUrl.slice(0, 100) + '...');

        console.log('\n✅ S3 storage service working perfectly!');
        console.log('   → Check AWS Console: S3 → ncie-documents-tharun → grievance-documents/');
    } catch (err) {
        console.error('\n❌ S3 error:', err.name, '-', err.message);
        if (err.name === 'NoSuchBucket') console.log('   Bucket does not exist.');
        if (err.name === 'AccessDenied') console.log('   IAM permissions insufficient for S3.');
    }
}

test();
