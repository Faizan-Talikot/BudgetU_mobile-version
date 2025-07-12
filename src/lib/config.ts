import Constants from 'expo-constants';

// API configurations for different environments
const config = {
    development: {
        API_URL: "http://192.168.0.101:5000/api",
    },
    production: {
        API_URL: "/api", // This will route to the serverless function in the same Vercel deployment
    },
};

// Determine the current environment
const environment = Constants.expoConfig?.extra?.NODE_ENV || "development";

// Export the appropriate configuration
export const apiConfig = {
    API_URL: 'http://192.168.0.101:5000/api'
}; 