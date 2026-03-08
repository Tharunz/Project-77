// ============================================
// ocr.service.js — Optical Character Recognition
// ENABLE_TEXTRACT=false → returns mock data
// ENABLE_TEXTRACT=true  → Amazon Textract (AnalyzeDocument)
// ============================================

const fs = require('fs');

const isTextract = () => process.env.ENABLE_TEXTRACT === 'true';

// ─── Lazy Textract client ──────────────────────────────────────────────────────
let _textractClient = null;
const getTextractClient = () => {
    if (!_textractClient) {
        const { TextractClient } = require('@aws-sdk/client-textract');
        const { awsConfig } = require('../config/aws.config');
        _textractClient = new TextractClient(awsConfig);
    }
    return _textractClient;
};

// ─── Mock response ─────────────────────────────────────────────────────────────
const MOCK_RESPONSE = {
    text: "Mock extracted text from document",
    formFields: { name: "Ramesh Kumar", id: "XXXX-XXXX-1234" }
};

// =============================================================================
// TEXTRACT IMPLEMENTATION
// =============================================================================

/**
 * findBlockById(blocks, id) — Helper to lookup blocks
 */
const findBlockById = (blocks, id) => blocks.find(b => b.Id === id);

/**
 * getBlockText(block, blocks) — Recursively extract text from WORD/SELECTION_ELEMENT blocks
 */
const getBlockText = (block, blocks) => {
    let text = '';
    if (block.Relationships) {
        block.Relationships.forEach(relationship => {
            if (relationship.Type === 'CHILD') {
                relationship.Ids.forEach(childId => {
                    const child = findBlockById(blocks, childId);
                    if (child) {
                        if (child.BlockType === 'WORD') text += child.Text + ' ';
                        if (child.BlockType === 'SELECTION_ELEMENT') {
                            text += child.SelectionStatus === 'SELECTED' ? 'X ' : ' ';
                        }
                    }
                });
            }
        });
    }
    return text.trim();
};

/**
 * parseKeyValues(blocks) — Extract KEY_VALUE_SET relationships into an object
 */
const parseKeyValues = (blocks) => {
    const keyMap = {};
    const valueMap = {};
    const keyValues = {};

    const kvBlocks = blocks.filter(b => b.BlockType === 'KEY_VALUE_SET');

    // Separate KEY and VALUE blocks
    kvBlocks.forEach(b => {
        if (b.EntityTypes.includes('KEY')) keyMap[b.Id] = b;
        else valueMap[b.Id] = b;
    });

    // Link keys to values
    Object.values(keyMap).forEach(keyBlock => {
        let valueBlock = null;
        if (keyBlock.Relationships) {
            keyBlock.Relationships.forEach(rel => {
                if (rel.Type === 'VALUE') {
                    rel.Ids.forEach(valId => {
                        valueBlock = valueMap[valId];
                    });
                }
            });
        }

        const keyText = getBlockText(keyBlock, blocks).toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/(^_|_$)/g, '');
        const valText = valueBlock ? getBlockText(valueBlock, blocks) : '';

        if (keyText) keyValues[keyText] = valText;
    });

    return keyValues;
};

const extractWithTextract = async (fileBuffer) => {
    try {
        const { AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
        const client = getTextractClient();

        const response = await client.send(new AnalyzeDocumentCommand({
            Document: { Bytes: fileBuffer },
            FeatureTypes: ['FORMS', 'TABLES']
        }));

        const blocks = response.Blocks || [];

        // Extract all LINE blocks as plain text
        const textLines = blocks
            .filter(b => b.BlockType === 'LINE')
            .map(b => b.Text)
            .join('\n');

        // Extract KEY_VALUE_SET blocks
        const formFields = parseKeyValues(blocks);

        return {
            text: textLines,
            formFields: formFields
        };
    } catch (err) {
        if (err.name === 'AccessDeniedException' || err.name === 'UnrecognizedClientException' || err.name === 'InvalidClientTokenId') {
            console.log('[Textract] Blocked in Learner Labs, returning empty text');
        } else {
            console.log('[Textract] Error:', err.message, '— returning empty text');
        }
        // Return empty result but don't crash grievance filing
        return {
            text: '',
            formFields: {}
        };
    }
};

// =============================================================================
// PUBLIC INTERFACE
// =============================================================================

/**
 * extractFromDocument(fileInput) — Main OCR endpoint.
 * Accepts buffer or filePath. If textract disabled, returns mock.
 * @param {Buffer|string} fileInput - file Buffer or absolute path
 */
const extractFromDocument = async (fileInput) => {
    if (!isTextract()) return MOCK_RESPONSE;

    let buffer = null;
    if (Buffer.isBuffer(fileInput)) {
        buffer = fileInput;
    } else if (typeof fileInput === 'string') {
        buffer = fs.readFileSync(fileInput);
    } else {
        throw new Error('extractFromDocument requires a Buffer or file path');
    }

    return extractWithTextract(buffer);
};

// For backward compatibility with existing usage in other places (if any)
const extractText = extractFromDocument;

module.exports = {
    extractFromDocument,
    extractText,
    isTextract
};
