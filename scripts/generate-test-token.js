#!/usr/bin/env node

/**
 * Script para generar un token JWT de prueba
 * Útil para testing de endpoints que requieren autenticación
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const generateTestToken = async () => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        
        if (!jwtSecret) {
            console.error('❌ No se encontró JWT_SECRET en las variables de entorno');
            console.log('💡 Asegúrate de tener configurado JWT_SECRET en tu archivo .env');
            process.exit(1);
        }

        console.log('🎯 Generador de Token JWT de Prueba');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();        // Intentar conectar a MongoDB para verificar usuarios
        let realUsers = [];
        let testUser = null;
        const TEST_EMAIL = 'test@suscripciontracker.dev';
        
        try {
            const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;            if (mongoUri) {
                await mongoose.connect(mongoUri);
                
                // Definir esquema de usuario para consultas
                const userSchema = new mongoose.Schema({
                    name: String,
                    lastName: String,
                    email: String,
                    password: String
                }, { 
                    collection: 'users',
                    timestamps: true 
                });
                
                const User = mongoose.models.User || mongoose.model('User', userSchema);
                
                // Buscar usuario de pruebas específico
                testUser = await User.findOne({ email: TEST_EMAIL }).select('_id email name lastName');
                
                // Buscar otros usuarios
                realUsers = await User.find({}).select('_id email name lastName').limit(5);
                
                console.log(`📊 Encontrados ${realUsers.length} usuarios en la base de datos`);
                
                if (testUser) {
                    console.log('🧪 Usuario de pruebas encontrado:');
                    console.log(`   👤 ${testUser.name || 'Sin nombre'} ${testUser.lastName || ''} (${testUser.email})`);
                    console.log(`   🆔 ID: ${testUser._id}`);
                } else {
                    console.log('⚠️ Usuario de pruebas NO encontrado');
                    console.log(`   💡 Ejecuta: npm run test:user`);
                }
                
                if (realUsers.length > 0) {
                    console.log();
                    console.log('👥 Otros usuarios disponibles:');
                    realUsers.forEach((user, index) => {
                        if (user.email !== TEST_EMAIL) {
                            console.log(`   ${index + 1}. ${user.name || 'Sin nombre'} (${user.email || 'Sin email'}) - ID: ${user._id}`);
                        }
                    });
                }
                console.log();
            }// eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.log('⚠️ No se pudo conectar a MongoDB, usando usuario ficticio');
            console.log();
        }        // Determinar qué usuario usar (priorizar usuario de pruebas)
        let testPayload;
        
        if (testUser) {
            // Usar usuario de pruebas dedicado (RECOMENDADO)
            testPayload = {
                _id: testUser._id.toString(),
                email: testUser.email || 'test@suscripciontracker.dev',
                name: `${testUser.name || 'Usuario'} ${testUser.lastName || 'Pruebas'}`.trim(),
                iat: Math.floor(Date.now() / 1000)
            };
            console.log('✅ Usando usuario de PRUEBAS dedicado (Recomendado)');
            console.log(`👤 Usuario: ${testPayload.name} (${testPayload.email})`);
            console.log('🎯 Este usuario está diseñado específicamente para testing');
        } else if (realUsers.length > 0) {
            // Usar el primer usuario real encontrado
            const firstUser = realUsers[0];
            testPayload = {
                _id: firstUser._id.toString(),
                email: firstUser.email || 'test@example.com',
                name: firstUser.name || 'Usuario Real',
                iat: Math.floor(Date.now() / 1000)
            };
            console.log('⚠️ Usando usuario REAL de la base de datos');
            console.log(`👤 Usuario: ${testPayload.name} (${testPayload.email})`);
            console.log('💡 Considera crear un usuario de pruebas: npm run test:user');
        } else {
            // NO GENERAR TOKEN FICTICIO - Error y salir
            console.log('❌ ERROR: No se encontraron usuarios en la base de datos');
            console.log();
            console.log('📋 Para generar un token válido necesitas:');
            console.log('   1. Tener conexión a la base de datos MongoDB');
            console.log('   2. Al menos un usuario registrado en la base de datos');
            console.log();
            console.log('🔧 Soluciones:');
            console.log('   • Crear usuario de pruebas: npm run test:user');
            console.log('   • Hacer login real: npm run test:login');
            console.log('   • Verificar conexión DB: npm run test:db');
            console.log();
            process.exit(1);
        }

        const token = jwt.sign(testPayload, jwtSecret, {
            expiresIn: process.env.JWT_EXPIRATION || '24h'
        });

        console.log();
        console.log('🎯 Token JWT generado:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        console.log(`Bearer ${token}`);
        console.log();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();
        console.log('📋 Información del token:');
        console.log(`   👤 Usuario ID: ${testPayload._id}`);
        console.log(`   📧 Email: ${testPayload.email}`);
        console.log(`   🏷️ Nombre: ${testPayload.name}`);        console.log(`   ⏰ Expira en: ${process.env.JWT_EXPIRATION || '24h'}`);
        const expDate = new Date((testPayload.iat + (24 * 60 * 60)) * 1000); // Asumiendo 24h por defecto
        console.log(`   📅 Válido hasta: ${expDate.toLocaleString()}`);
        console.log();
        console.log('💡 Cómo usar:');
        console.log('   1. Copia el token completo (incluyendo "Bearer ")');
        console.log('   2. En Swagger UI, haz clic en "Authorize" 🔒');
        console.log('   3. Pega el token y haz clic en "Authorize"');
        console.log('   4. ¡Ya puedes probar los endpoints protegidos!');
        console.log();
        
        if (!testUser) {
            console.log('💡 RECOMENDACIÓN: Crea un usuario específico para pruebas');
            console.log('   npm run test:user');
            console.log('   Esto evitará interferir con datos de usuarios reales');
            console.log();
        }
        
        console.log('🌐 Ejemplos de uso:');
        console.log(`   # Listar suscripciones`);
        console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:4000/api/v1/subscriptions`);
        console.log();
        console.log(`   # Crear suscripción`);
        console.log(`   curl -X POST -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" \\`);
        console.log(`        -d '{"name":"Netflix","price":15.99,"currency":"USD","frequency":"mensual","startDate":"2024-01-01","renewalDate":"2024-02-01"}' \\`);
        console.log(`        http://localhost:4000/api/v1/subscriptions`);

        // Cerrar conexión a MongoDB si se abrió
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }

    } catch (error) {
        console.error('❌ Error al generar token JWT:', error.message);
        process.exit(1);
    }
};

generateTestToken().catch(console.error);
