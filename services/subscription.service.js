import Subscription from "../models/subscription.model.js";
import UserService from "./user.service.js";
import mongoose from "mongoose";

class SubscriptionService {    /**
     * Crear una nueva suscripción
     * @param {Object} subscriptionData - Datos de la suscripción
     * @param {string} userId - ID del usuario propietario
     * @returns {Promise<Object>} Suscripción creada
     */
    static async createSubscription(subscriptionData, userId) {
        // Verificar que el usuario existe
        await UserService.getUserById(userId);

        // Preparar datos de la suscripción
        const subscription = await Subscription.create({
            ...subscriptionData,
            user: userId
        });

        return subscription;
    }

    /**
     * Obtener todas las suscripciones
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Object>} Lista de suscripciones con paginación
     */
    static async getAllSubscriptions(options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                category, 
                frequency,
                userId 
            } = options;

            // Construir filtros
            const filters = {};
            if (status) filters.status = status;
            if (category) filters.category = category;
            if (frequency) filters.frequency = frequency;
            if (userId) filters.user = userId;

            const skip = (page - 1) * limit;
            
            const subscriptions = await Subscription.find(filters)
                .populate('user', 'name lastName email')
                .select("-__v")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Subscription.countDocuments(filters);

            return {
                subscriptions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalSubscriptions: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener suscripciones: ${error.message}`);
        }
    }    /**
     * Obtener suscripciones de un usuario específico
     * @param {string} userId - ID del usuario
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Array>} Lista de suscripciones del usuario
     */
    static async getUserSubscriptions(userId, options = {}) {
        // Verificar que el usuario existe
        await UserService.getUserById(userId);

        const { status, category, frequency } = options;

        // Construir filtros
        const filters = { user: userId };
        if (status) filters.status = status;
        if (category) filters.category = category;
        if (frequency) filters.frequency = frequency;

        const subscriptions = await Subscription.find(filters)
            .select("-__v")
            .sort({ createdAt: -1 });

        return subscriptions;
    }    /**
     * Obtener una suscripción por ID
     * @param {string} subscriptionId - ID de la suscripción
     * @param {string} userId - ID del usuario (para verificar propiedad)
     * @returns {Promise<Object>} Suscripción encontrada
     */
    static async getSubscriptionById(subscriptionId, userId = null) {
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
            const error = new Error("ID de suscripción no válido");
            error.statusCode = 400;
            throw error;
        }

        const filters = { _id: subscriptionId };
        if (userId) filters.user = userId;

        const subscription = await Subscription.findOne(filters)
            .populate('user', 'name lastName email')
            .select("-__v");

        if (!subscription) {
            const error = new Error("Suscripción no encontrada");
            error.statusCode = 404;
            throw error;
        }

        return subscription;
    }

    /**
     * Actualizar una suscripción
     * @param {string} subscriptionId - ID de la suscripción
     * @param {Object} updateData - Datos a actualizar
     * @param {string} userId - ID del usuario (para verificar propiedad)
     * @returns {Promise<Object>} Suscripción actualizada
     */
    static async updateSubscription(subscriptionId, updateData, userId) {
        // Verificar que la suscripción existe y pertenece al usuario
        await this.getSubscriptionById(subscriptionId, userId);

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            subscriptionId,
            updateData,
            { new: true, runValidators: true }
        ).select("-__v");

        return updatedSubscription;
    }

    /**
     * Cancelar una suscripción
     * @param {string} subscriptionId - ID de la suscripción
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>} Suscripción cancelada
     */
    static async cancelSubscription(subscriptionId, userId) {
        const cancelledSubscription = await this.updateSubscription(
            subscriptionId,
            { status: 'cancelada' },
            userId
        );

        return cancelledSubscription;
    }

    /**
     * Eliminar una suscripción
     * @param {string} subscriptionId - ID de la suscripción
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>} Suscripción eliminada
     */
    static async deleteSubscription(subscriptionId, userId) {
        // Verificar que la suscripción existe y pertenece al usuario
        await this.getSubscriptionById(subscriptionId, userId);

        const deletedSubscription = await Subscription.findByIdAndDelete(subscriptionId);

        return deletedSubscription;
    }

    /**
     * Obtener suscripciones próximas a renovar
     * @param {number} days - Días hacia adelante para buscar renovaciones (default: 7)
     * @param {string} userId - ID del usuario (opcional)
     * @returns {Promise<Array>} Lista de suscripciones próximas a renovar
     */
    static async getUpcomingRenewals(days = 7, userId = null) {
        try {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + days);

            const filters = {
                status: 'activa',
                renewalDate: {
                    $gte: today,
                    $lte: futureDate
                }
            };

            if (userId) filters.user = userId;

            const subscriptions = await Subscription.find(filters)
                .populate('user', 'name lastName email')
                .select("-__v")
                .sort({ renewalDate: 1 });

            return subscriptions;
        } catch (error) {
            throw new Error(`Error al obtener renovaciones próximas: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas de suscripciones de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>} Estadísticas de suscripciones
     */
    static async getUserSubscriptionStats(userId) {
        try {
            // Verificar que el usuario existe
            await UserService.getUserById(userId);

            const stats = await Subscription.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalSubscriptions: { $sum: 1 },
                        activeSubscriptions: {
                            $sum: { $cond: [{ $eq: ["$status", "activa"] }, 1, 0] }
                        },
                        cancelledSubscriptions: {
                            $sum: { $cond: [{ $eq: ["$status", "cancelada"] }, 1, 0] }
                        },
                        totalMonthlyExpense: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ["$status", "activa"] },
                                        { $eq: ["$frequency", "mensual"] }
                                    ]},
                                    "$price",
                                    0
                                ]
                            }
                        },
                        totalAnnualExpense: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ["$status", "activa"] },
                                        { $eq: ["$frequency", "anual"] }
                                    ]},
                                    { $divide: ["$price", 12] },
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalSubscriptions: 1,
                        activeSubscriptions: 1,
                        cancelledSubscriptions: 1,
                        estimatedMonthlyExpense: {
                            $add: ["$totalMonthlyExpense", "$totalAnnualExpense"]
                        }
                    }
                }
            ]);

            // Si no hay suscripciones, retornar estadísticas en cero
            if (stats.length === 0) {
                return {
                    totalSubscriptions: 0,
                    activeSubscriptions: 0,
                    cancelledSubscriptions: 0,
                    estimatedMonthlyExpense: 0
                };
            }

            return stats[0];
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Buscar suscripciones por nombre
     * @param {string} searchTerm - Término de búsqueda
     * @param {string} userId - ID del usuario (opcional)
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Array>} Lista de suscripciones que coinciden
     */
    static async searchSubscriptions(searchTerm, userId = null, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;

            const filters = {
                name: { $regex: searchTerm, $options: 'i' } // Búsqueda case-insensitive
            };

            if (userId) filters.user = userId;

            const subscriptions = await Subscription.find(filters)
                .populate('user', 'name lastName email')
                .select("-__v")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            return subscriptions;
        } catch (error) {
            throw new Error(`Error en búsqueda de suscripciones: ${error.message}`);
        }
    }
}

export default SubscriptionService;
