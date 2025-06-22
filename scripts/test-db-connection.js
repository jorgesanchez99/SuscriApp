#!/usr/bin/env node

/**
 * Script para verificar la conexión a la base de datos MongoDB
 * Útil para diagnóstico y verificación de conectividad
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
// Priorizar archivos de desarrollo local
dotenv.config({ path: '.env.development.local' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const testDatabaseConnection = async () => {
    try {
        console.log('🔍 Verificando conexión a MongoDB...');
        
        // Buscar la URI en diferentes variables de entorno
        const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
        console.log(`📡 URI: ${mongoUri?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'No configurada'}`);
        
        if (!mongoUri) {
            throw new Error('No se encontró la URI de MongoDB. Verifica tu archivo .env y que contenga DB_URI o MONGODB_URI');
        }
        
        // Configuración de conexión con timeouts más cortos para testing
        const connection = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // 5 segundos
            connectTimeoutMS: 10000, // 10 segundos
        });

        console.log('✅ Conexión exitosa a MongoDB');
        console.log(`📊 Base de datos: ${connection.connection.name}`);
        console.log(`🏠 Host: ${connection.connection.host}:${connection.connection.port}`);
        console.log(`📈 Estado: ${connection.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);

        // Verificar colecciones existentes
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📚 Colecciones disponibles: ${collections.length}`);
        collections.forEach(col => console.log(`  - ${col.name}`));

        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada correctamente');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:');
        console.error(`   Mensaje: ${error.message}`);
        
        if (error.code) {
            console.error(`   Código: ${error.code}`);
        }
        
        if (error.reason) {
            console.error(`   Razón: ${error.reason}`);
        }

        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verificar que MongoDB esté ejecutándose');
        console.log('   2. Revisar la URI de conexión en el archivo .env');
        console.log('   3. Verificar credenciales de acceso');
        console.log('   4. Comprobar conectividad de red');
        
        process.exit(1);
    }
};

// Manejar interrupciones
process.on('SIGINT', async () => {
    console.log('\n🛑 Script interrumpido por el usuario');
    try {
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error al cerrar conexión:', error.message);
    }
    process.exit(0);
});

testDatabaseConnection();
