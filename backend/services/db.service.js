// ============================================
// db.service.js — Unified Database Abstraction Layer
// Supports lowdb (local) and DynamoDB with feature flag.
// ENABLE_DYNAMO=false → lowdb (existing)
// ENABLE_DYNAMO=true  → AWS DynamoDB
// ============================================

const {
    PutCommand,
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
    BatchWriteCommand
} = require('@aws-sdk/lib-dynamodb');

// ─── Lazy loaders ─────────────────────────────────────────────────────────────

let _dynamoClient = null;
const getDynamoClient = () => {
    if (!_dynamoClient) {
        const { dynamoClient } = require('../config/aws.config');
        _dynamoClient = dynamoClient;
    }
    return _dynamoClient;
};

let _lowdb = null;
const getLowDb = () => {
    if (!_lowdb) {
        _lowdb = require('../db/database');
    }
    return _lowdb;
};

// ─── Helper: is DynamoDB enabled? ─────────────────────────────────────────────
const isDynamo = () => process.env.ENABLE_DYNAMO === 'true';

// ─── Build DynamoDB UpdateExpression from plain updates object ─────────────────
function buildUpdateExpression(updates) {
    const names = {};
    const values = {};
    const parts = [];

    for (const [k, v] of Object.entries(updates)) {
        const alias = `#attr_${k.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        const valKey = `:val_${k.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        names[alias] = k;
        values[valKey] = v;
        parts.push(`${alias} = ${valKey}`);
    }

    return {
        UpdateExpression: `SET ${parts.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    };
}

// ─── DynamoDB implementations ──────────────────────────────────────────────────

const dynamo = {
    /**
     * put(tableName, item) — create or replace an item
     */
    async put(tableName, item) {
        const client = getDynamoClient();
        await client.send(new PutCommand({ TableName: tableName, Item: item }));
        return item;
    },

    /**
     * get(tableName, key) — get a single item by primary key
     * key: { partitionKeyName: value } or { pk: value, sk: value }
     */
    async get(tableName, key) {
        const client = getDynamoClient();
        const result = await client.send(new GetCommand({ TableName: tableName, Key: key }));
        return result.Item || null;
    },

    /**
     * query(tableName, keyCondition, options)
     * keyCondition: { expression, names, values }
     * options: { filterExpression, filterNames, filterValues, indexName, limit, scanForward }
     */
    async query(tableName, keyCondition, options = {}) {
        const client = getDynamoClient();
        const params = {
            TableName: tableName,
            KeyConditionExpression: keyCondition.expression,
            ExpressionAttributeNames: {
                ...keyCondition.names,
                ...(options.filterNames || {})
            },
            ExpressionAttributeValues: {
                ...keyCondition.values,
                ...(options.filterValues || {})
            }
        };

        if (options.filterExpression) params.FilterExpression = options.filterExpression;
        if (options.indexName) params.IndexName = options.indexName;
        if (options.limit) params.Limit = options.limit;
        if (options.scanForward !== undefined) params.ScanIndexForward = options.scanForward;
        if (!Object.keys(params.ExpressionAttributeNames).length) delete params.ExpressionAttributeNames;
        if (!Object.keys(params.ExpressionAttributeValues).length) delete params.ExpressionAttributeValues;

        const result = await client.send(new QueryCommand(params));
        return result.Items || [];
    },

    /**
     * update(tableName, key, updates) — update specific fields
     */
    async update(tableName, key, updates) {
        const client = getDynamoClient();
        const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = buildUpdateExpression(updates);
        const params = {
            TableName: tableName,
            Key: key,
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };
        const result = await client.send(new UpdateCommand(params));
        return result.Attributes || null;
    },

    /**
     * delete(tableName, key) — delete an item
     */
    async delete(tableName, key) {
        const client = getDynamoClient();
        await client.send(new DeleteCommand({ TableName: tableName, Key: key }));
        return true;
    },

    /**
     * scan(tableName, filters) — scan with optional filter
     * filters: { filterExpression, names, values }
     */
    async scan(tableName, filters = {}) {
        const client = getDynamoClient();
        const params = { TableName: tableName };
        if (filters.filterExpression) {
            params.FilterExpression = filters.filterExpression;
            if (filters.names && Object.keys(filters.names).length) params.ExpressionAttributeNames = filters.names;
            if (filters.values && Object.keys(filters.values).length) params.ExpressionAttributeValues = filters.values;
        }

        // Auto-paginate to get all items
        let items = [];
        let lastKey = undefined;
        do {
            if (lastKey) params.ExclusiveStartKey = lastKey;
            const result = await client.send(new ScanCommand(params));
            items = items.concat(result.Items || []);
            lastKey = result.LastEvaluatedKey;
        } while (lastKey);

        return items;
    },

    /**
     * batchWrite(tableName, items) — write many items at once (max 25 per call)
     */
    async batchWrite(tableName, items) {
        const client = getDynamoClient();
        const BATCH_SIZE = 25;
        let written = 0;
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE);
            const requestItems = {
                [tableName]: batch.map(item => ({ PutRequest: { Item: item } }))
            };
            await client.send(new BatchWriteCommand({ RequestItems: requestItems }));
            written += batch.length;
        }
        return written;
    }
};

// ─── lowdb proxy implementations ───────────────────────────────────────────────

const lowdbProxy = {
    put(tableName, item) {
        // lowdb is not used via db.service directly — routes use db/database.js
        // This is a no-op proxy so the interface stays consistent
        return Promise.resolve(item);
    },
    get() { return Promise.resolve(null); },
    query() { return Promise.resolve([]); },
    update() { return Promise.resolve(null); },
    delete() { return Promise.resolve(true); },
    scan() { return Promise.resolve([]); },
    batchWrite() { return Promise.resolve(0); }
};

// ─── Exported db object ────────────────────────────────────────────────────────

const db = {
    put: (tableName, item) => isDynamo() ? dynamo.put(tableName, item) : lowdbProxy.put(tableName, item),
    get: (tableName, key) => isDynamo() ? dynamo.get(tableName, key) : lowdbProxy.get(tableName, key),
    query: (tableName, keyCondition, options) => isDynamo() ? dynamo.query(tableName, keyCondition, options) : lowdbProxy.query(tableName, keyCondition, options),
    update: (tableName, key, updates) => isDynamo() ? dynamo.update(tableName, key, updates) : lowdbProxy.update(tableName, key, updates),
    delete: (tableName, key) => isDynamo() ? dynamo.delete(tableName, key) : lowdbProxy.delete(tableName, key),
    scan: (tableName, filters) => isDynamo() ? dynamo.scan(tableName, filters) : lowdbProxy.scan(tableName, filters),
    batchWrite: (tableName, items) => isDynamo() ? dynamo.batchWrite(tableName, items) : lowdbProxy.batchWrite(tableName, items),

    // Expose raw dynamo operations for direct use (always DynamoDB regardless of flag)
    dynamo,

    // Check flag
    isDynamo
};

module.exports = db;
