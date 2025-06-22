#!/usr/bin/env node

/**
 * Script simplificado para obtener token de testing
 * Hace login real y devuelve token listo para usar en Swagger
 */

import mongoose from 'mongoose';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
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

const getTestingToken = async () => {
    try {
        console.log('🎯 Generador de Token para Testing');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();

        // Conectar a MongoDB
        const mongoUri =  process.env.DB_URI;
        if (!mongoUri) {
            console.error('❌ No se encontró URI de MongoDB en las variables de entorno');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');

        // Verificar que el usuario de prueba existe
        const testUser = await UserService.getUserByEmail(TEST_CREDENTIALS.email);
        
        if (!testUser) {
            console.log('❌ Usuario de prueba no encontrado');
            console.log('💡 Primero crea el usuario de prueba:');
            console.log('   npm run test:user');
            console.log();
            process.exit(1);
        }

        console.log('👤 Usuario de prueba encontrado:');
        console.log(`   📧 Email: ${testUser.email}`);
        console.log(`   🏷️ Nombre: ${testUser.name} ${testUser.lastName}`);
        console.log(`   🆔 ID: ${testUser.id}`);
        console.log();

        // Hacer login real para obtener token
        console.log('🔐 Realizando login...');
        const loginResult = await AuthService.signIn(TEST_CREDENTIALS);
        
        console.log('✅ Login exitoso');
        console.log();
        
        // Mostrar token para uso inmediato
        console.log('🎯 Token JWT para Testing:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        console.log(`Bearer ${loginResult.token}`);
        console.log();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        
        console.log('💡 Cómo usar en Swagger:');
        console.log('   1. Ve a http://localhost:4000/api-docs');
        console.log('   2. Haz clic en "Authorize" 🔒');
        console.log('   3. Pega el token completo');
        console.log('   4. Haz clic en "Authorize"');
        console.log('   5. ¡Prueba los endpoints protegidos!');
        console.log();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('Usuario o contraseña incorrectos')) {
            console.log();
            console.log('💡 Solución:');
            console.log('   El usuario de prueba existe pero la contraseña no coincide.');
            console.log('   Recrear usuario: npm run test:user');
        }
        
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
};

getTestingToken().catch(console.error);
