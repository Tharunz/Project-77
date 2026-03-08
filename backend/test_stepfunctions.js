// Test Step Functions — NyayKosh Escrow Workflow
require('dotenv').config();
const { startEscrowWorkflow, getWorkflowStatus, isStepFunctions } = require('./services/escrow.service');

async function test() {
    console.log('ENABLE_STEPFUNCTIONS:', process.env.ENABLE_STEPFUNCTIONS);
    console.log('Step Functions mode:', isStepFunctions());

    try {
        const grievanceId = 'GRV-TEST-SFN';
        const officerId = 'officer-001';

        console.log('\n🚀 Starting escrow workflow...');
        const result = await startEscrowWorkflow(grievanceId, officerId);
        console.log('✅ Execution started:');
        console.log('   ARN:', result.executionArn);
        console.log('   Status:', result.status);
        console.log('   State:', result.currentState);

        console.log('\n📊 Checking workflow status...');
        const status = await getWorkflowStatus(result.executionArn);
        console.log('   Status:', status.status);

        if (result.executionArn && result.status === 'RUNNING') {
            console.log('\n🎉 Step Functions ✅ working');
            if (result.executionArn.includes('mock-')) {
                console.log('   (Local simulation — set ENABLE_DYNAMO=true + ENABLE_STEPFUNCTIONS=true for full AWS test)');
            } else {
                console.log('   ✅ Real AWS execution started! Check Step Functions Console.');
                console.log('   → https://us-east-1.console.aws.amazon.com/states/home#/statemachines');
            }
        }
    } catch (err) {
        console.error('\n❌ Step Functions error:', err.name, '-', err.message);
    }
}

test();
