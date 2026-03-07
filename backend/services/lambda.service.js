const { LambdaClient, InvokeCommand, ListFunctionsCommand } = require('@aws-sdk/client-lambda')

/**
 * Gets a fresh Lambda client with current credentials
 */
const getLambdaClient = () => {
    return new LambdaClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    })
}

const invokeLambda = async (functionName, payload = {}) => {
    // Validate credentials before creating client
    if (!process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_SESSION_TOKEN) {
        console.log('[Lambda] Credentials not available, skipping invocation');
        return { success: false, reason: 'no credentials' };
    }

    try {
        console.log(`[Lambda] Invoking: ${functionName}`)
        const client = getLambdaClient(); // Fresh client each time
        const command = new InvokeCommand({
            FunctionName: functionName,
            InvocationType: 'Event', // async, non-blocking
            Payload: JSON.stringify(payload)
        })
        const result = await client.send(command)
        console.log(`[Lambda] ${functionName} invoked ✅ StatusCode: ${result.StatusCode}`)
        return { success: true, statusCode: result.StatusCode }
    } catch (err) {
        console.log(`[Lambda] ${functionName} failed:`, err.message)
        return { success: false, error: err.message }
    }
}

module.exports = { invokeLambda, getLambdaClient }
