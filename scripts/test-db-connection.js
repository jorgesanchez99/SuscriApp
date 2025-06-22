#!/usr/bin/env node

/**
 * Script para verificar la conexión a la base de datos MongoDB
 * Útil para diagnóstico y verificación de conectividad
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const testDatabaseConnection = async () => {
    try {
        console.log('🔍 Verificando conexión a MongoDB...');
        console.log(`📡 URI: ${process.env.DB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'No configurada'}`);
        
        // Configuración de conexión con timeouts más cortos para testing
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
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
