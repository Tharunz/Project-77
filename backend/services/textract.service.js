const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

let textractClient;
try {
    textractClient = new TextractClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
} catch (error) {
    console.error('[Textract] Failed to initialize client:', error.message);
}

/**
 * Extracts text from a document in S3
 * @param {string} bucketName - S3 bucket name
 * @param {string} objectKey - S3 object key
 * @returns {Promise<Object>} Extracted text blocks and parsed fields (income, name)
 */
const extractDocumentText = async (bucketName, objectKey) => {
    if (!textractClient || !bucketName || !objectKey) {
        console.warn(`[Textract] Skipped analysis for ${objectKey} (Missing AWS config or args)`);
        // Fallback mock
        return {
            textBlocks: ['MOCK_TEXT: INCOME 120000', 'NAME: Citizen'],
            extractedIncome: 120000,
            extractedName: 'Citizen'
        };
    }

    try {
        console.log(`[Textract] Analyzing document: ${objectKey}`);

        const command = new DetectDocumentTextCommand({
            Document: {
                S3Object: {
                    Bucket: bucketName,
                    Name: objectKey
                }
            }
        });

        const response = await textractClient.send(command);

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

        return {
            textBlocks: lines.slice(0, 50), // Send first 50 lines
            extractedIncome,
            extractedName
        };
    } catch (error) {
        console.error(`[Textract] Extraction failed:`, error.message);
        // Graceful degradation
        return {
            textBlocks: ['Analysis Failed'],
            extractedIncome: null,
            extractedName: null,
            error: error.message
        };
    }
};

module.exports = {
    extractDocumentText
};
