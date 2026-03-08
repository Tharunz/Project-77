// Test Amazon Textract with dummy PDF
require('dotenv').config();
const { extractFromDocument, isTextract } = require('./services/ocr.service');

const pdfBuffer = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [ 3 0 R ] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [ 0 0 612 792 ] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello Textract OCR) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000289 00000 n \n0000000377 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n472\n%%EOF",
    "utf-8"
);

async function test() {
    console.log('ENABLE_TEXTRACT:', process.env.ENABLE_TEXTRACT);
    console.log('Textract mode:', isTextract());

    if (!isTextract()) {
        console.log('❌ Textract is disabled');
        return;
    }

    try {
        console.log('\n🔍 Running Textract AnalyzeDocument...');
        const result = await extractFromDocument(pdfBuffer);

        console.log('\n📄 Extracted Text:');
        console.log('---------------------');
        console.log(result.text || '(empty)');
        console.log('---------------------');
        console.log('Keys/Values:', Object.keys(result.formFields).length);

        if (result.text && result.text.includes('Hello')) {
            console.log('\n🎉 Textract ✅ working');
        } else {
            console.log('\n⚠️ Check output.', result);
        }

    } catch (err) {
        console.error('\n❌ Textract error:', err.name, '-', err.message);
    }
}

test();
