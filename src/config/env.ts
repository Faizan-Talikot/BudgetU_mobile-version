const ENV = {
    development: {
        API_URL: 'http://192.168.0.104:5000',
        APP_NAME: 'BudgetU (Dev)',
    },
    staging: {
        API_URL: 'https://staging-api.budgetu.app',
        APP_NAME: 'BudgetU (Staging)',
    },
    production: {
        API_URL: 'https://api.budgetu.app',
        APP_NAME: 'BudgetU',
    },
};

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
    if (env === 'development') return ENV.development;
    if (env === 'staging') return ENV.staging;
    if (env === 'production') return ENV.production;
    return ENV.development;
};

export default getEnvVars; 