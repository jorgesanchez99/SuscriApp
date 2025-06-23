import {config} from "dotenv";

// Load environment variables from the .env file based on the NODE_ENV
// If NODE_ENV is not set, it defaults to "development.local"
const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`;
config({path: envFile});

// Validate required environment variables
const requiredEnvVars = ['DB_URI', 'JWT_SECRET', 'ARCJET_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Make sure ${envFile} exists and contains all required variables.`);
}

// Validate JWT_SECRET strength (only if it exists and is loaded)
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
    throw new Error('JWT_SECRET must be at least 64 characters long for security');
}

// Export environment variables with defaults
export const PORT = process.env.PORT || 4000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DB_URI = process.env.DB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
export const ARCJET_ENV = process.env.ARCJET_ENV || 'DEVELOPMENT';
export const ARCJET_KEY = process.env.ARCJET_KEY;

// Optional environment variables
export const LOG_DB_QUERIES = process.env.LOG_DB_QUERIES === 'true';
