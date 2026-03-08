const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');

/**
 * Gets a fresh SSM client with current credentials
 */
const getSsmClient = () => {
    return new SSMClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });
};

const SSM_PREFIX = process.env.SSM_PREFIX || '/ncie/config';
let cachedConfig = {};

/**
 * Loads all parameters under the specified prefix from SSM.
 * Always returns data, never throws errors.
 */
const loadConfig = async () => {
    const defaultConfig = [
        { key: 'sla_hours', value: '72', source: 'Default' },
        { key: 'preseva_threshold', value: '0.85', source: 'Default' },
        { key: 'max_grievances_per_user', value: '10', source: 'Default' },
        { key: 'enable_sagemaker', value: 'true', source: 'Default' },
        { key: 'alert_critical_threshold', value: '0.90', source: 'Default' },
        { key: 'sla_warning_hours', value: '48', source: 'Default' },
        { key: 'max_file_size_mb', value: '5', source: 'Default' },
        { key: 'grievance_auto_escalate', value: 'true', source: 'Default' },
        { key: 'preseva_batch_size', value: '36', source: 'Default' }
    ];

    try {
        if (!SSM_PREFIX) {
            console.log('[SSM] Missing prefix, using defaults');
            return defaultConfig;
        }

        // Validate credentials before creating client
        if (!process.env.AWS_ACCESS_KEY_ID || 
            !process.env.AWS_SECRET_ACCESS_KEY ||
            !process.env.AWS_SESSION_TOKEN) {
            console.log('[SSM] Credentials not available, using defaults');
            return defaultConfig;
        }

        const result = await Promise.race([
            getSsmClient().send(new GetParametersByPathCommand({
                Path: SSM_PREFIX,
                Recursive: true,
                WithDecryption: true
            })),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('SSM timeout')), 3000)
            )
        ]);

        if (result.Parameters && result.Parameters.length > 0) {
            const config = result.Parameters.map(p => ({
                key: p.Name.split('/').pop(),
                value: p.Value,
                source: 'AWS SSM Parameter Store'
            }));
            
            // Update cached config for backward compatibility
            cachedConfig = {};
            config.forEach(p => {
                cachedConfig[p.key] = p.value;
            });
            
            console.log(`[SSM] ${config.length} parameters loaded from AWS ✅`);
            return config;
        }
        
        console.log('[SSM] No parameters found, using defaults');
        return defaultConfig;

    } catch(err) {
        console.log('[SSM] Unavailable:', err.message, '— using defaults');
        return defaultConfig;
    }
};

/**
 * Returns the cached configuration for UI display
 */
const getConfig = () => {
    // If no cached config, return default parameters
    if (Object.keys(cachedConfig).length === 0) {
        console.log('[SSM] No cached config, returning defaults');
        const defaultParams = [
            { key: 'sla_hours', value: '72', source: 'Default' },
            { key: 'preseva_threshold', value: '0.85', source: 'Default' },
            { key: 'max_grievances_per_user', value: '10', source: 'Default' },
            { key: 'enable_sagemaker', value: 'true', source: 'Default' },
            { key: 'alert_critical_threshold', value: '0.90', source: 'Default' },
            { key: 'sla_warning_hours', value: '48', source: 'Default' },
            { key: 'max_file_size_mb', value: '5', source: 'Default' },
            { key: 'grievance_auto_escalate', value: 'true', source: 'Default' },
            { key: 'preseva_batch_size', value: '36', source: 'Default' }
        ];
        
        return {
            prefix: SSM_PREFIX,
            parameters: defaultParams,
            lastUpdated: new Date().toISOString(),
            source: 'Default fallback'
        };
    }

    // Convert cached config to parameter format
    const parameters = Object.keys(cachedConfig).map(key => ({
        key: key,
        value: cachedConfig[key],
        source: 'AWS SSM Parameter Store'
    }));

    return {
        prefix: SSM_PREFIX,
        parameters: parameters,
        lastUpdated: new Date().toISOString(),
        source: 'AWS SSM Parameter Store'
    };
};

module.exports = {
    loadConfig,
    getConfig
};
