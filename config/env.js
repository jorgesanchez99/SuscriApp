import {config} from "dotenv";

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});
// Load environment variables from the .env file based on the NODE_ENV
// If NODE_ENV is not set, it defaults to "development.local"

export const  {PORT, NODE_ENV, DB_URI, JWT_SECRET, JWT_EXPIRATION    } = process.env;
