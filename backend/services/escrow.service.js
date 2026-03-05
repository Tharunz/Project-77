// ============================================
// escrow.service.js — NyayKosh Escrow Workflow
// ENABLE_STEPFUNCTIONS=false → local simulation
// ENABLE_STEPFUNCTIONS=true  → AWS Step Functions
// ============================================

const isStepFunctions = () => process.env.ENABLE_STEPFUNCTIONS === 'true';

// ─── Lazy SFN client ───────────────────────────────────────────────────────────
let _sfnClient = null;
const getSFNClient = () => {
    if (!_sfnClient) {
        const { SFNClient } = require('@aws-sdk/client-sfn');
        const { awsConfig } = require('../config/aws.config');
        _sfnClient = new SFNClient(awsConfig);
    }
    return _sfnClient;
};

// ─── DB helper (lazy) ──────────────────────────────────────────────────────────
const getDb = () => require('../db/database').getDb();
const GRIEVANCES_TABLE = process.env.DYNAMO_GRIEVANCES_TABLE || 'ncie-grievances';

// =============================================================================
// STEP FUNCTIONS IMPLEMENTATION
// =============================================================================

/**
 * startEscrowWorkflow(grievanceId, officerId)
 * Starts a Step Functions execution for the NyayKosh workflow.
 */
const startEscrowWorkflow = async (grievanceId, officerId) => {
    if (!isStepFunctions()) {
        // Local simulation — update grievance record directly
        const db = getDb();
        const mockArn = `mock-execution-${grievanceId}`;
        db.get('grievances')
            .find({ id: grievanceId })
            .assign({
                escrowStatus: 'RUNNING',
                escrowExecutionArn: mockArn,
                officerStatus: 'PENDING',
                officerId,
                updatedAt: new Date().toISOString()
            })
            .write();

        return {
            executionArn: mockArn,
            status: 'RUNNING',
            currentState: 'OfficerAssigned'
        };
    }

    const { StartExecutionCommand } = require('@aws-sdk/client-sfn');
    const client = getSFNClient();

    const input = JSON.stringify({
        grievanceId,
        officerId,
        officerStatus: 'PENDING',
        citizenVerified: false,
        citizenDisputed: false,
        startedAt: new Date().toISOString()
    });

    const response = await client.send(new StartExecutionCommand({
        stateMachineArn: process.env.STEP_FUNCTIONS_ARN,
        name: `escrow-${grievanceId}-${Date.now()}`,
        input
    }));

    const executionArn = response.executionArn;

    // Persist executionArn to DynamoDB
    const db = require('./db.service');
    await db.update(
        GRIEVANCES_TABLE,
        { grievanceId },
        { escrowExecutionArn: executionArn, escrowStatus: 'RUNNING', officerId }
    );

    return {
        executionArn,
        status: 'RUNNING',
        currentState: 'OfficerAssigned',
        startDate: response.startDate
    };
};

/**
 * getWorkflowStatus(executionArn)
 * Returns the current status of a Step Functions execution.
 */
const getWorkflowStatus = async (executionArn) => {
    if (!isStepFunctions() || executionArn.startsWith('mock-')) {
        // Look up local state
        const db = getDb();
        const grievanceId = executionArn.replace('mock-execution-', '');
        const grievance = db.get('grievances').find({ id: grievanceId }).value();
        return {
            executionArn,
            status: grievance?.escrowStatus || 'RUNNING',
            currentState: grievance?.escrowCurrentState || 'OfficerAssigned',
            input: JSON.stringify({ grievanceId }),
            output: null
        };
    }

    const { DescribeExecutionCommand } = require('@aws-sdk/client-sfn');
    const client = getSFNClient();

    const response = await client.send(new DescribeExecutionCommand({ executionArn }));

    return {
        executionArn,
        status: response.status,
        currentState: response.stateMachineAliasArn || 'Unknown',
        input: response.input,
        output: response.output,
        startDate: response.startDate,
        stopDate: response.stopDate
    };
};

/**
 * officerMarkComplete(grievanceId, executionArn)
 * Officer marks work as done → awaiting citizen verification.
 */
const officerMarkComplete = async (grievanceId, executionArn) => {
    const updateData = {
        status: 'AWAITING_VERIFICATION',
        officerStatus: 'COMPLETED',
        escrowCurrentState: 'RequestCitizenVerification',
        updatedAt: new Date().toISOString()
    };

    if (!isStepFunctions() || executionArn?.startsWith('mock-')) {
        const db = getDb();
        db.get('grievances').find({ id: grievanceId }).assign(updateData).write();
    } else {
        const db = require('./db.service');
        await db.update(GRIEVANCES_TABLE, { grievanceId }, updateData);
    }

    // Fire event (lazy import to avoid circular)
    try {
        const { publishEvent } = require('./events.service');
        const { sendSMS } = require('./notification.service');
        await publishEvent('OfficerMarkedComplete', { grievanceId, executionArn });
        // Notification would go to citizen here (citizen info from DB)
    } catch (_) { /* events/notifications are optional */ }

    return { ...updateData, grievanceId, executionArn };
};

/**
 * citizenVerifyComplete(grievanceId, executionArn, verified)
 * Citizen confirms/disputes work completion.
 */
const citizenVerifyComplete = async (grievanceId, executionArn, verified) => {
    const now = new Date().toISOString();
    const updateData = verified
        ? {
            status: 'RESOLVED',
            escrowStatus: 'COMPLETED',
            fundsReleased: true,
            citizenVerified: true,
            citizenDisputed: false,
            escrowCurrentState: 'ReleaseFunds',
            resolvedAt: now,
            updatedAt: now
        }
        : {
            status: 'ESCALATED',
            escrowStatus: 'ESCALATED',
            fundsReleased: false,
            citizenVerified: false,
            citizenDisputed: true,
            escrowCurrentState: 'EscalateToSenior',
            updatedAt: now
        };

    if (!isStepFunctions() || executionArn?.startsWith('mock-')) {
        const db = getDb();
        db.get('grievances').find({ id: grievanceId }).assign(updateData).write();
    } else {
        const db = require('./db.service');
        await db.update(GRIEVANCES_TABLE, { grievanceId }, updateData);
    }

    // Fire FundsReleased event
    if (verified) {
        try {
            const { publishEvent } = require('./events.service');
            await publishEvent('FundsReleased', {
                grievanceId,
                executionArn,
                citizenVerified: true,
                verifiedAt: now
            });
        } catch (_) { /* optional */ }
    }

    return { ...updateData, grievanceId, executionArn };
};

module.exports = {
    startEscrowWorkflow,
    getWorkflowStatus,
    officerMarkComplete,
    citizenVerifyComplete,
    isStepFunctions
};
