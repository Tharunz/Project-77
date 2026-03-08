// Test Amazon Rekognition
require('dotenv').config();
const fs = require('fs');
const { verifyWorkPhoto, isRekognition } = require('./services/verification.service');

async function test() {
    console.log('ENABLE_REKOGNITION:', process.env.ENABLE_REKOGNITION);
    console.log('Rekognition mode:', isRekognition());

    if (!isRekognition()) {
        console.log('❌ Rekognition is disabled');
        return;
    }

    try {
        console.log('\n📥 Reading local image (ncie_logo.png)...');
        const imageBuffer = fs.readFileSync('Z:\\projects\\Project-77\\frontend\\src\\assets\\ncie_logo.png');

        console.log('✅ Image loaded (' + imageBuffer.length + ' bytes)');
        console.log('\n🔍 Running Rekognition DetectLabels for "road-repair"...');

        const result = await verifyWorkPhoto(imageBuffer, 'road-repair');

        console.log('\n📄 Verification Result:');
        console.log('---------------------');
        console.log('Verified:', result.verified);
        console.log('Verification Score:', result.verificationScore + '%');
        console.log('Confidence:', result.confidence + '%');
        console.log('Detected Labels:');
        result.detectedLabels.slice(0, 10).forEach(l => console.log('  - ' + l));
        console.log('---------------------');

        if (result.detectedLabels.length > 0) {
            console.log('\n🎉 Rekognition ✅ working (API connected and returned labels)');
        } else {
            console.log('\n⚠️ No labels detected.');
        }

    } catch (err) {
        console.error('\n❌ Rekognition error:', err.name, '-', err.message);
    }
}

test();
