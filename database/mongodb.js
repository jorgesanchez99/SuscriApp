import mongoose from 'mongoose';
import {DB_URI, NODE_ENV, LOG_DB_QUERIES} from '../config/env.js';

const connectToDatabase = async () => {
    try {
        // Enable query logging in development if configured
        if (LOG_DB_QUERIES && NODE_ENV === 'development') {
            mongoose.set('debug', true);
        }

        await mongoose.connect(DB_URI);
        
        console.log(`✅ Conectado a la base de datos MongoDB en modo ${NODE_ENV}`);
        
        // // Log database name in development
        // if (NODE_ENV === 'development') {
        //     console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
        // }
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos MongoDB:', error.message);
        process.exit(1); // Exit the process with failure
    }
}



export default connectToDatabase;