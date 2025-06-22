#!/usr/bin/env node

/**
 * Script para crear/verificar usuario de pruebas dedicado
 * Crea un usuario específico para testing con datos conocidos
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

// Datos del usuario de prueba (siempre los mismos)
const TEST_USER = {
    name: 'Usuario',
    lastName: 'Pruebas',
    email: 'test@suscripciontracker.dev',
    password: 'TestPassword123!' // Contraseña conocida para testing
};

const createTestUser = async () => {
    try {
        console.log('🧪 Configurador de Usuario de Pruebas');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log();

        // Conectar a MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
        if (!mongoUri) {
            console.error('❌ No se encontró URI de MongoDB en las variables de entorno');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');

        // Definir esquema de usuario
        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true }
        }, { 
            collection: 'users',
            timestamps: true
        });

        const User = mongoose.model('User', userSchema);

        // Verificar si el usuario de prueba ya existe
        let testUser = await User.findOne({ email: TEST_USER.email });

        if (testUser) {
            console.log('🔍 Usuario de prueba ya existe:');
            console.log(`   👤 Nombre: ${testUser.name} ${testUser.lastName}`);
            console.log(`   📧 Email: ${testUser.email}`);
            console.log(`   🆔 ID: ${testUser._id}`);
            console.log(`   📅 Creado: ${testUser.createdAt?.toLocaleString() || 'Fecha desconocida'}`);
            console.log();
            console.log('✅ Usuario de prueba listo para usar');
        } else {
            console.log('🔨 Creando usuario de prueba...');
            
            // Encriptar contraseña
            const saltRounds = 10;
            const hashedPassword = await bcryptjs.hash(TEST_USER.password, saltRounds);

            // Crear usuario
            testUser = await User.create({
                ...TEST_USER,
                password: hashedPassword
            });

            console.log('✅ Usuario de prueba creado exitosamente:');
            console.log(`   👤 Nombre: ${testUser.name} ${testUser.lastName}`);
            console.log(`   📧 Email: ${testUser.email}`);
            console.log(`   🆔 ID: ${testUser._id}`);
            console.log(`   🔐 Contraseña: ${TEST_USER.password}`);
        }

        console.log();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Datos para testing:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Usuario ID: ${testUser._id}`);
        console.log(`Email: ${TEST_USER.email}`);
        console.log(`Contraseña: ${TEST_USER.password}`);
        console.log();
        console.log('🚀 Cómo usar para testing:');
        console.log();
        console.log('1️⃣ Generar token JWT:');
        console.log('   npm run test:token');
        console.log();
        console.log('2️⃣ O hacer login manual en Swagger:');
        console.log('   POST /api/v1/auth/sign-in');
        console.log('   Body: {');
        console.log(`     "email": "${TEST_USER.email}",`);
        console.log(`     "password": "${TEST_USER.password}"`);
        console.log('   }');
        console.log();
        console.log('3️⃣ Usar en curl:');
        console.log(`   curl -X POST http://localhost:4000/api/v1/auth/sign-in \\`);
        console.log('        -H "Content-Type: application/json" \\');
        console.log(`        -d '{"email":"${TEST_USER.email}","password":"${TEST_USER.password}"}'`);
        console.log();
        console.log('💡 Ventajas de este usuario:');
        console.log('   ✅ Datos conocidos y consistentes');
        console.log('   ✅ Contraseña conocida para login manual');
        console.log('   ✅ Específico para testing (no afecta datos reales)');
        console.log('   ✅ Se puede resetear fácilmente');
        console.log('   ✅ Email único e identificable');

        await mongoose.disconnect();
        console.log();
        console.log('🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 11000) {
            console.log('💡 El usuario ya existe, esto es normal');
            console.log('   Ejecuta el script nuevamente para ver los datos');
        }
        
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

createTestUser();
