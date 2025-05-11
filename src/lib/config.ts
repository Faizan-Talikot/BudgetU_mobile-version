// API configurations for different environments
const config = {
    development: {
        API_URL: "http://localhost:5000/api",
    },
    production: {
        API_URL: "/api", // This will route to the serverless function in the same Vercel deployment
    },
};

// Determine the current environment
const environment = import.meta.env.MODE || "production";

// Export the appropriate configuration
export const apiConfig = config[environment as keyof typeof config] || config.production; 