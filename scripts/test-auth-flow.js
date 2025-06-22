#!/usr/bin/env node

/**
 * Script para probar el flujo completo de autenticación
 * Verifica que el token generado funcione correctamente con la API
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const testAuthFlow = async () => {
    try {
        console.log('🔐 Prueba del Flujo de Autenticación Completo');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();

        // 1. Conectar a la base de datos
        console.log('📊 1. Conectando a la base de datos...');
        const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
        if (!mongoUri) {
            throw new Error('No se encontró MONGODB_URI en las variables de entorno');
        }
        
        await mongoose.connect(mongoUri);
        console.log('✅ Conexión a MongoDB exitosa');
        console.log();

        // 2. Verificar usuario de pruebas
        console.log('👤 2. Verificando usuario de pruebas...');
        const TEST_EMAIL = 'test@suscripciontracker.dev';
        let testUser = await UserService.getUserByEmail(TEST_EMAIL);
        
        if (!testUser) {
            console.log('⚠️ Usuario de pruebas no encontrado, creándolo...');
            const userData = {
                name: 'Usuario',
                lastName: 'De Pruebas',
                email: TEST_EMAIL,
                password: 'Test123456!'
            };
            
            const result = await AuthService.signUp(userData);
            testUser = result.user;
            console.log('✅ Usuario de pruebas creado');
        } else {
            console.log('✅ Usuario de pruebas encontrado');
        }
        
        console.log(`   👤 Nombre: ${testUser.name} ${testUser.lastName}`);
        console.log(`   📧 Email: ${testUser.email}`);
        console.log(`   🆔 ID: ${testUser._id}`);
        console.log();

        // 3. Generar token usando AuthService
        console.log('🎫 3. Generando token con AuthService...');
        const authToken = AuthService.generateToken(testUser._id);
        console.log('✅ Token generado con AuthService');
        console.log();

        // 4. Verificar el token generado
        console.log('🔍 4. Verificando token...');
        const verifiedUser = await AuthService.verifyToken(authToken);
        console.log('✅ Token verificado exitosamente');
        console.log(`   👤 Usuario verificado: ${verifiedUser.name} ${verifiedUser.lastName}`);
        console.log(`   📧 Email: ${verifiedUser.email}`);
        console.log(`   🆔 ID: ${verifiedUser._id}`);
        console.log();

        // 5. Probar decodificación manual del token
        console.log('🔧 5. Analizando contenido del token...');
        const jwtSecret = process.env.JWT_SECRET;
        const decoded = jwt.verify(authToken, jwtSecret);
        console.log('✅ Token decodificado manualmente');
        console.log(`   🔑 Payload:`, {
            _id: decoded._id,
            id: decoded.id,
            iat: decoded.iat,
            exp: decoded.exp
        });
        console.log();

        // 6. Comparar IDs
        console.log('🔄 6. Verificando consistencia de IDs...');
        const tokenUserId = decoded._id || decoded.id;
        const actualUserId = testUser._id.toString();
        
        if (tokenUserId === actualUserId) {
            console.log('✅ IDs coinciden perfectamente');
        } else {
            console.log('❌ ERROR: IDs no coinciden');
            console.log(`   Token ID: ${tokenUserId}`);
            console.log(`   Usuario ID: ${actualUserId}`);
        }
        console.log();

        // 7. Mostrar token para uso en Swagger/curl
        console.log('🎯 7. Token listo para usar:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        console.log(`Bearer ${authToken}`);
        console.log();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();

        // 8. Ejemplos de uso
        console.log('💡 Ejemplos de uso:');
        console.log();
        console.log('📋 En Swagger UI (http://localhost:4000/api-docs):');
        console.log('   1. Haz clic en "Authorize" 🔒');
        console.log('   2. Pega el token completo (incluyendo "Bearer ")');
        console.log('   3. Haz clic en "Authorize"');
        console.log();
        console.log('🔗 Con curl:');
        console.log(`   curl -H "Authorization: Bearer ${authToken}" \\`);
        console.log(`        http://localhost:4000/api/v1/subscriptions`);
        console.log();

        console.log('✅ ¡Prueba de autenticación completada exitosamente!');

    } catch (error) {
        console.error('❌ Error en la prueba de autenticación:', error.message);
        if (error.stack) {
            console.error('📍 Stack trace:', error.stack);
        }
        process.exit(1);
    } finally {
        // Cerrar conexión a MongoDB
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('🔌 Conexión a MongoDB cerrada');
        }
    }
};

testAuthFlow().catch(console.error);
