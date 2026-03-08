const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

/**
 * Gets a fresh Textract client with current credentials
 */
const getTextractClient = () => {
    return new TextractClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
};

/**
 * Extracts text from a document in S3
 * @param {string} bucketName - S3 bucket name
 * @param {string} objectKey - S3 object key
 * @returns {Promise<Object>} Extracted text and parsed fields with bulletproof error handling
 */
const extractDocumentText = async (bucketName, objectKey) => {
    // Guard: skip non-image/non-PDF files
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.tiff'];
    const ext = '.' + objectKey.toLowerCase().split('.').pop();
    if (!supportedExtensions.includes(ext)) {
        console.log(`[Textract] Skipping unsupported file type: ${ext}`);
        return { 
            extractedText: '', 
            blockCount: 0, 
            detectedFields: {}, 
            source: 'Skipped (unsupported file type)' 
        };
    }

    // Validate credentials before creating client
    if (!process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_SESSION_TOKEN) {
        console.log('[Textract] Credentials not available, using mock analysis');
        return { 
            extractedText: 'MOCK_TEXT: INCOME 120000, NAME: Citizen', 
            blockCount: 2, 
            detectedFields: { name: 'Citizen', income: '120000' },
            source: 'Mock (no credentials)' 
        };
    }

    if (!bucketName || !objectKey) {
        console.warn(`[Textract] Skipped analysis for ${objectKey} (Missing args)`);
        return { 
            extractedText: '', 
            blockCount: 0, 
            detectedFields: {}, 
            source: 'Skipped (missing arguments)' 
        };
    }

    try {
        console.log(`[Textract] Analyzing document: ${objectKey}`);

        const client = getTextractClient(); // Fresh client each time
        const command = new DetectDocumentTextCommand({
            Document: {
                S3Object: {
                    Bucket: bucketName,
                    Name: objectKey
                }
            }
        });

        const response = await client.send(command);

        const lines = response.Blocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text);

        console.log(`[Textract] Extracted ${lines.length} text blocks ✅`);

        // Simple parsing logic for income and name from text
        let extractedIncome = null;
        let extractedName = null;

        const textContent = lines.join(' ').toLowerCase();

        // Regex to find "income [Rs|₹] 1,50,000" or similar
        const incomeMatch = textContent.match(/income.*?(\d{1,3}(,\d{3})*(\.\d+)?|\d+)/i);
        if (incomeMatch && incomeMatch[1]) {
            extractedIncome = parseInt(incomeMatch[1].replace(/,/g, ''), 10);
        }

        // Basic mock name extraction
        const nameMatch = textContent.match(/name[:\s]+([a-z\s]+)(?:father|dob|address|$)/i);
        if (nameMatch && nameMatch[1]) {
            extractedName = nameMatch[1].trim();
        }

        const detectedFields = {};
        if (extractedName) detectedFields.name = extractedName;
        if (extractedIncome) detectedFields.income = extractedIncome;

        return {
            extractedText: lines.join('\n').slice(0, 1000), // First 1000 chars
            blockCount: lines.length,
            detectedFields,
            source: 'Amazon Textract'
        };
    } catch (error) {
        console.log(`[Textract] Could not extract from ${objectKey}:`, error.message);
        return { 
            extractedText: '', 
            blockCount: 0, 
            detectedFields: {},
            source: 'Extraction failed gracefully'
        };
    }
};

module.exports = {
    extractDocumentText
};
