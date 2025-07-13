import Constants from 'expo-constants';

// API configurations for different environments
const config = {
    development: {
        API_URL: "https://budget-u-mobile-version.vercel.app/api",
    },
    production: {
        API_URL: "https://budget-u-mobile-version.vercel.app/api",
    },
};

// Determine the current environment
const environment = (Constants.expoConfig?.extra?.NODE_ENV || "production") as keyof typeof config;

// Export the appropriate configuration
export const apiConfig = {
    API_URL: config[environment]?.API_URL || config.production.API_URL
}; 