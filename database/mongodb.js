import mongoose from 'mongoose';
import {DB_URI, NODE_ENV} from '../config/env.js';

if(!DB_URI) {
    throw new Error('DB_URI is not defined in the environment variables inside .env.<development/production>.local file');
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log(`Conectado a la base de datos MongoDB en ${NODE_ENV}`);
    } catch (error) {
        console.error('Error al conectar a la base de datos MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectToDatabase;