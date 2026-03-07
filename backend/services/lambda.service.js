const { LambdaClient, InvokeCommand, ListFunctionsCommand } = require('@aws-sdk/client-lambda')

const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
})

const invokeLambda = async (functionName, payload = {}) => {
    try {
        console.log(`[Lambda] Invoking: ${functionName}`)
        const command = new InvokeCommand({
            FunctionName: functionName,
            InvocationType: 'Event', // async, non-blocking
            Payload: JSON.stringify(payload)
        })
        const result = await lambdaClient.send(command)
        console.log(`[Lambda] ${functionName} invoked ✅ StatusCode: ${result.StatusCode}`)
        return { success: true, statusCode: result.StatusCode }
    } catch (err) {
        console.error(`[Lambda] ${functionName} failed:`, err.message)
        return { success: false, error: err.message }
    }
}

module.exports = { invokeLambda, lambdaClient }
