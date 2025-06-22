import User from "../models/user.model.js";
import mongoose from "mongoose";

class UserService {
    /**
     * Obtener todos los usuarios
     * @param {Object} options - Opciones de consulta (paginación, filtros)
     * @returns {Promise<Object>} Lista de usuarios
     */
    static async getAllUsers(options = {}) {
        try {
            const { page = 1, limit = 10, select = "-password -__v" } = options;
            
            const skip = (page - 1) * limit;
            const users = await User.find()
                .select(select)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente

            const total = await User.countDocuments();
            
            return {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalUsers: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }    /**
     * Obtener usuario por ID
     * @param {string} userId - ID del usuario
     * @param {string} select - Campos a seleccionar
     * @returns {Promise<Object>} Usuario encontrado
     */
    static async getUserById(userId, select = "-password -__v") {
        // Validar que el ID sea válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error("ID de usuario no válido");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(userId).select(select);
        
        if (!user) {
            const error = new Error("Usuario no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return user;
    }

    /**
     * Obtener usuario por email
     * @param {string} email - Email del usuario
     * @param {string} select - Campos a seleccionar
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    static async getUserByEmail(email, select = "-password -__v") {
        try {
            const user = await User.findOne({ email }).select(select);
            return user;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    /**
     * Crear un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @param {Object} session - Sesión de MongoDB (opcional)
     * @returns {Promise<Object>} Usuario creado
     */
    static async createUser(userData, session = null) {
        try {
            const options = session ? { session } : {};
            
            const newUsers = await User.create([userData], options);
            return newUsers[0];
        } catch (error) {
            // Manejar error de email duplicado
            if (error.code === 11000) {
                const duplicateError = new Error("El email ya está registrado");
                duplicateError.statusCode = 409;
                throw duplicateError;
            }
            throw error;
        }
    }    /**
     * Actualizar usuario
     * @param {string} userId - ID del usuario
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Usuario actualizado
     */
    static async updateUser(userId, updateData) {
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error("ID de usuario no válido");
            error.statusCode = 400;
            throw error;
        }

        // Remover campos que no se deben actualizar directamente
        // eslint-disable-next-line no-unused-vars
        const { password, email, ...allowedUpdates } = updateData;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select("-password -__v");

        if (!updatedUser) {
            const error = new Error("Usuario no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return updatedUser;
    }    /**
     * Eliminar usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>} Usuario eliminado
     */
    static async deleteUser(userId) {
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error("ID de usuario no válido");
            error.statusCode = 400;
            throw error;
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            const error = new Error("Usuario no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return deletedUser;
    }

    /**
     * Verificar si existe un usuario con el email dado
     * @param {string} email - Email a verificar
     * @param {Object} session - Sesión de MongoDB (opcional)
     * @returns {Promise<boolean>} True si existe, false si no
     */
    static async existsByEmail(email, session = null) {
        try {
            const options = session ? { session } : {};
            const user = await User.findOne({ email }, null, options);
            return !!user;
        } catch (error) {
            throw new Error(`Error al verificar email: ${error.message}`);
        }
    }

    /**
     * Buscar usuarios por criterios
     * @param {Object} criteria - Criterios de búsqueda
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Array>} Lista de usuarios que coinciden
     */
    static async searchUsers(criteria, options = {}) {
        try {
            const { page = 1, limit = 10, select = "-password -__v" } = options;
            const skip = (page - 1) * limit;

            const users = await User.find(criteria)
                .select(select)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            return users;
        } catch (error) {
            throw new Error(`Error en búsqueda de usuarios: ${error.message}`);
        }
    }
}

export default UserService;