import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserService from "./user.service.js";
import { JWT_SECRET, JWT_EXPIRATION } from "../config/env.js";

class AuthService {
    /**
     * Registrar un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} Usuario creado y token
     */
    static async signUp(userData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { name, lastName, email, password } = userData;

            // Validar que los campos requeridos no estén vacíos
            this.validateSignUpData({ name, lastName, email, password });

            // Validar que el usuario no exista
            const userExists = await UserService.existsByEmail(email, session);
            if (userExists) {
                const error = new Error("El usuario ya existe");
                error.statusCode = 409;
                throw error;
            }

            // Hash de la contraseña
            const hashedPassword = await this.hashPassword(password);

            // Crear un nuevo usuario
            const newUser = await UserService.createUser({
                name,
                lastName,
                email,
                password: hashedPassword
            }, session);

            // Generar token
            const token = this.generateToken(newUser._id);

            await session.commitTransaction();
            session.endSession();

            // Remover password del objeto usuario antes de retornar
            const userResponse = newUser.toObject();
            delete userResponse.password;

            return {
                token,
                user: userResponse
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    /**
     * Iniciar sesión
     * @param {Object} credentials - Email y contraseña
     * @returns {Promise<Object>} Usuario y token
     */
    static async signIn(credentials) {
        const { email, password } = credentials;

        // Validar que los campos requeridos no estén vacíos
        this.validateSignInData({ email, password });

        // Buscar el usuario por email (incluir password para verificación)
        const user = await UserService.getUserByEmail(email, "+password");
        if (!user) {
            const error = new Error("Usuario o contraseña incorrectos");
            error.statusCode = 401;
            throw error;
        }

        // Verificar la contraseña
        const isPasswordValid = await this.comparePassword(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Usuario o contraseña incorrectos");
            error.statusCode = 401;
            throw error;
        }

        // Generar token
        const token = this.generateToken(user._id);

        // Remover password del objeto usuario
        const userResponse = user.toObject();
        delete userResponse.password;

        return {
            token,
            user: userResponse
        };
    }    /**
     * Verificar token JWT
     * @param {string} token - Token JWT
     * @returns {Promise<Object>} Usuario decodificado
     */
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Soportar tanto 'id' como '_id' para compatibilidad
            const userId = decoded.id || decoded._id;
            
            if (!userId) {
                const error = new Error("Token no contiene ID de usuario válido");
                error.statusCode = 401;
                throw error;
            }
            
            const user = await UserService.getUserById(userId);
            
            if (!user) {
                const error = new Error("Usuario no encontrado");
                error.statusCode = 401;
                throw error;
            }

            return user;
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                const expiredError = new Error("Token expirado. Por favor, inicia sesión de nuevo.");
                expiredError.statusCode = 401;
                throw expiredError;
            }

            if (error.name === "JsonWebTokenError") {
                const invalidError = new Error("Token inválido o manipulado.");
                invalidError.statusCode = 401;
                throw invalidError;
            }

            throw error;
        }
    }    /**
     * Generar token JWT
     * @param {string} userId - ID del usuario
     * @returns {string} Token JWT
     */
    static generateToken(userId) {
        return jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    }

    /**
     * Hash de contraseña
     * @param {string} password - Contraseña en texto plano
     * @returns {Promise<string>} Contraseña hasheada
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Comparar contraseña
     * @param {string} plainPassword - Contraseña en texto plano
     * @param {string} hashedPassword - Contraseña hasheada
     * @returns {Promise<boolean>} True si coinciden
     */
    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Validar datos de registro
     * @param {Object} data - Datos a validar
     */
    static validateSignUpData(data) {
        const { name, lastName, email, password } = data;

        if (!name?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
            const error = new Error("Todos los campos son obligatorios");
            error.statusCode = 400;
            throw error;
        }

        // Validar formato de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Formato de email inválido");
            error.statusCode = 400;
            throw error;
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            const error = new Error("La contraseña debe tener al menos 6 caracteres");
            error.statusCode = 400;
            throw error;
        }
    }

    /**
     * Validar datos de inicio de sesión
     * @param {Object} data - Datos a validar
     */
    static validateSignInData(data) {
        const { email, password } = data;

        if (!email?.trim() || !password?.trim()) {
            const error = new Error("Email y contraseña son obligatorios");
            error.statusCode = 400;
            throw error;
        }
    }

    /**
     * Cambiar contraseña
     * @param {string} userId - ID del usuario
     * @param {string} currentPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<boolean>} True si se cambió exitosamente
     */
    static async changePassword(userId, currentPassword, newPassword) {
        // Obtener usuario con contraseña
        const user = await UserService.getUserById(userId, "+password");
        
        // Verificar contraseña actual
        const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            const error = new Error("Contraseña actual incorrecta");
            error.statusCode = 400;
            throw error;
        }

        // Validar nueva contraseña
        if (newPassword.length < 6) {
            const error = new Error("La nueva contraseña debe tener al menos 6 caracteres");
            error.statusCode = 400;
            throw error;
        }

        // Hash nueva contraseña
        const hashedNewPassword = await this.hashPassword(newPassword);

        // Actualizar contraseña en base de datos
        await UserService.updateUser(userId, { password: hashedNewPassword });

        return true;
    }    /**
     * Cerrar sesión (invalidar token)
     * En una implementación real, podrías mantener una blacklist de tokens
     * @param {string} token - Token a invalidar
     * @returns {Promise<boolean>} True si se cerró exitosamente
     */
    // eslint-disable-next-line no-unused-vars
    static async signOut(token) {
        // Por ahora solo retornamos true
        // En una implementación más robusta, podrías:
        // 1. Mantener una blacklist de tokens en Redis
        // 2. Usar refresh tokens
        // 3. Cambiar el secret del usuario específico
        return true;
    }
}

export default AuthService;
