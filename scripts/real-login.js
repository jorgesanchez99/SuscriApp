#!/usr/bin/env node

/**
 * Script para hacer login real y obtener token legítimo
 * Simula un login real usando el AuthService
 */

import mongoose from 'mongoose';
import AuthService from '../services/auth.service.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

// Credenciales del usuario de prueba
const TEST_CREDENTIALS = {
    email: 'test@suscripciontracker.dev',
    password: 'TestPassword123!'
};

const performRealLogin = async () => {
    try {
        console.log('🔐 Login Real - Generador de Token Legítimo');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();

        // Conectar a MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
        if (!mongoUri) {
            console.error('❌ No se encontró URI de MongoDB en las variables de entorno');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');

        // Verificar que el usuario de prueba existe
        console.log('🔍 Verificando usuario de prueba...');
        console.log(`   📧 Email: ${TEST_CREDENTIALS.email}`);
        console.log(`   🔐 Password: ${TEST_CREDENTIALS.password}`);
        console.log();

        // Hacer login real usando AuthService
        console.log('🚀 Realizando login...');
        const loginResult = await AuthService.signIn(TEST_CREDENTIALS);

        console.log('✅ Login exitoso!');
        console.log();
        console.log('👤 Información del usuario:');
        console.log(`   🆔 ID: ${loginResult.user._id}`);
        console.log(`   📧 Email: ${loginResult.user.email}`);
        console.log(`   👤 Nombre: ${loginResult.user.name} ${loginResult.user.lastName}`);
        console.log(`   📅 Registrado: ${loginResult.user.createdAt?.toLocaleString() || 'Fecha desconocida'}`);
        console.log();

        // Verificar que el token es válido
        console.log('🔍 Verificando token generado...');
        const verifiedUser = await AuthService.verifyToken(loginResult.token);
        console.log(`✅ Token válido - Usuario verificado: ${verifiedUser.name} ${verifiedUser.lastName}`);
        console.log();

        console.log('🎯 Token JWT LEGÍTIMO generado:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        console.log(`Bearer ${loginResult.token}`);
        console.log();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        console.log('📋 Información del token:');
        console.log(`   👤 Usuario ID: ${loginResult.user._id}`);
        console.log(`   📧 Email: ${loginResult.user.email}`);
        console.log(`   🏷️ Nombre: ${loginResult.user.name} ${loginResult.user.lastName}`);
        console.log(`   🔄 Generado por: AuthService.signIn() (método oficial)`);
        console.log(`   ⏰ Válido por: ${process.env.JWT_EXPIRATION || '24h'}`);
        console.log();
        console.log('💡 Ventajas de este token:');
        console.log('   ✅ Generado por el sistema de autenticación real');
        console.log('   ✅ Usa exactamente el mismo formato que la aplicación');
        console.log('   ✅ Garantiza compatibilidad total con todos los endpoints');
        console.log('   ✅ Incluye toda la información del usuario');
        console.log('   ✅ Verificado antes de mostrar');
        console.log();
        console.log('🚀 Cómo usar:');
        console.log('   1. Copia el token completo (incluyendo "Bearer ")');
        console.log('   2. En Swagger UI, haz clic en "Authorize" 🔒');
        console.log('   3. Pega el token y haz clic en "Authorize"');
        console.log('   4. ¡Todos los endpoints funcionarán perfectamente!');
        console.log();
        console.log('🌐 Ejemplo de uso con curl:');
        console.log(`   curl -H "Authorization: Bearer ${loginResult.token}" \\`);
        console.log('        http://localhost:4000/api/v1/subscriptions');
        console.log();
        console.log('📊 Este token es idéntico al que obtienes con:');
        console.log('   POST /api/v1/auth/sign-in en Swagger UI');

        await mongoose.disconnect();
        console.log();
        console.log('🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error durante el login:', error.message);
        
        if (error.statusCode === 401) {
            console.log();
            console.log('💡 Posibles soluciones:');
            console.log('   1. Verifica que el usuario de prueba existe:');
            console.log('      npm run test:user');
            console.log('   2. Verifica las credenciales en el script');
            console.log('   3. Revisa la configuración de la base de datos');
        }
        
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

performRealLogin();
